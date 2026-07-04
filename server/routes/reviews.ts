import { Router, Response } from 'express';
import ReviewModel from '../models/Review';
import OrderModel from '../models/Order';
import { getIsConnected } from '../db';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { localDB } from '../local-db';
import { sanitizeBody, validateReview } from '../middleware/validation';

const router = Router();

// GET /api/reviews/:productId - Fetch all reviews for a product
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;
  const dbConnected = getIsConnected();

  try {
    if (dbConnected) {
      const reviews = await ReviewModel.find({ productId }).sort({ createdAt: -1 });
      res.json(reviews);
    } else {
      console.log('⚠️ Database disconnected, returning reviews from local file DB fallback');
      const reviews = localDB.getReviews(productId);
      res.json(reviews);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving reviews', error: error.message });
  }
});

// POST /api/reviews - Create/post a new review (Authenticated & Verified Purchasers Only)
router.post('/', authMiddleware, sanitizeBody, validateReview, async (req: AuthRequest, res: Response) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user?.id;
  const rawName = req.user?.email ? req.user.email.split('@')[0] : '';
  const userName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : 'Anonymous Purchaser';
  const dbConnected = getIsConnected();

  if (!productId) {
    return res.status(400).json({ message: 'productId is required' });
  }

  const ratingNum = Number(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
  }

  try {
    // Check if the user is a verified purchaser of this product
    let isVerified = false;

    if (dbConnected) {
      // Look up orders of this user that contain this productId
      const orders = await OrderModel.find({ user: userId });
      for (const order of orders) {
        const purchased = order.items.some((item) => item.product.id === productId);
        if (purchased) {
          isVerified = true;
          break;
        }
      }
    } else {
      // Fallback verified purchase check in localDB
      const orders = localDB.findOrdersByUser(userId || '');
      for (const order of orders) {
        const purchased = order.items.some((item: any) => item.product.id === productId);
        if (purchased) {
          isVerified = true;
          break;
        }
      }
    }

    if (!isVerified) {
      return res.status(403).json({
        message: 'Only verified purchasers who bought this product can leave a review.',
        verified: false,
      });
    }

    if (dbConnected) {
      // Check if user already reviewed this product to edit instead, or allow multiple
      const newReview = new ReviewModel({
        productId,
        userId,
        userName,
        rating: ratingNum,
        comment,
      });
      await newReview.save();
      res.status(201).json(newReview);
    } else {
      const saved = localDB.saveReview({
        productId,
        userId: userId || 'anonymous',
        userName,
        rating: ratingNum,
        comment,
      });
      res.status(201).json(saved);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error leaving review', error: error.message });
  }
});

// PUT /api/reviews/:reviewId - Edit/update a review
router.put('/:reviewId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?.id;
  const dbConnected = getIsConnected();

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required' });
  }

  const ratingNum = Number(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
  }

  try {
    if (dbConnected) {
      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      if (review.userId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized to edit this review' });
      }

      review.rating = ratingNum;
      review.comment = comment;
      await review.save();
      res.json(review);
    } else {
      // Fallback localDB edit
      const reviews = localDB.getReviews(req.body.productId || '');
      const review = reviews.find((r) => r._id === reviewId);
      if (!review) {
        // Search in all reviews in fallback DB
        const dbReviews = (localDB as any).getReviews ? (localDB as any).getReviews() : [];
        return res.status(404).json({ message: 'Review not found in local fallback database' });
      }

      if (review.userId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized to edit this review' });
      }

      const updated = localDB.saveReview({
        _id: reviewId,
        productId: review.productId,
        userId: review.userId,
        userName: review.userName,
        rating: ratingNum,
        comment,
      });
      res.json(updated);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error editing review', error: error.message });
  }
});

// DELETE /api/reviews/:reviewId - Delete a review
router.delete('/:reviewId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { reviewId } = req.params;
  const userId = req.user?.id;
  const dbConnected = getIsConnected();

  try {
    if (dbConnected) {
      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      if (review.userId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized to delete this review' });
      }

      await ReviewModel.findByIdAndDelete(reviewId);
      res.json({ success: true, message: 'Review deleted successfully' });
    } else {
      const deleted = localDB.deleteReview(reviewId);
      if (!deleted) {
        return res.status(404).json({ message: 'Review not found or could not be deleted' });
      }
      res.json({ success: true, message: 'Review deleted successfully' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

export default router;
