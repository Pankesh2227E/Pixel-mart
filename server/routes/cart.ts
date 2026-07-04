import { Router, Request, Response } from 'express';
import CartModel from '../models/Cart';
import { getIsConnected } from '../db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/cart - Get cart by userId or sessionId
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id || (req.query.userId as string);
  const sessionId = req.query.sessionId as string;

  const dbConnected = getIsConnected();
  res.setHeader('X-Database-Connected', String(dbConnected));

  if (!dbConnected) {
    return res.json({ items: [] });
  }

  try {
    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'userId or sessionId is required to fetch cart' });
    }

    const query: any = {};
    if (userId) {
      query.userId = userId;
    } else {
      query.sessionId = sessionId;
    }

    let cart = await CartModel.findOne(query);
    if (!cart) {
      // Create empty cart if not found
      cart = new CartModel({
        userId,
        sessionId,
        items: []
      });
      await cart.save();
    }

    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving cart', error: error.message });
  }
});

// POST /api/cart - Sync entire cart
router.post('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id || req.body.userId;
  const { sessionId, items } = req.body;

  const dbConnected = getIsConnected();
  if (!dbConnected) {
    return res.json({ success: true, message: 'Cart synced in memory (offline mode)' });
  }

  try {
    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'userId or sessionId is required to sync cart' });
    }

    const query: any = {};
    if (userId) {
      query.userId = userId;
    } else {
      query.sessionId = sessionId;
    }

    let cart = await CartModel.findOne(query);
    if (cart) {
      cart.items = items;
      await cart.save();
    } else {
      cart = new CartModel({
        userId,
        sessionId,
        items
      });
      await cart.save();
    }

    res.json({ success: true, cart });
  } catch (error: any) {
    res.status(500).json({ message: 'Error saving cart state', error: error.message });
  }
});

// POST /api/cart/item - Add item to cart
router.post('/item', async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id || req.body.userId;
  const { sessionId, product, quantity, selectedColor, selectedOption } = req.body;

  if (!product || !selectedColor || !selectedOption) {
    return res.status(400).json({ message: 'Missing product details, color, or option' });
  }

  const dbConnected = getIsConnected();
  if (!dbConnected) {
    return res.json({ success: true, message: 'Added in-memory (offline mode)' });
  }

  try {
    const query: any = {};
    if (userId) {
      query.userId = userId;
    } else {
      query.sessionId = sessionId;
    }

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'userId or sessionId is required' });
    }

    let cart = await CartModel.findOne(query);
    if (!cart) {
      cart = new CartModel({
        userId,
        sessionId,
        items: []
      });
    }

    // Check if item exists in cart already
    const existingIndex = cart.items.findIndex(
      (item: any) =>
        item.product.id === product.id &&
        item.selectedColor === selectedColor &&
        item.selectedOption === selectedOption
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += (quantity || 1);
    } else {
      cart.items.push({
        product,
        quantity: quantity || 1,
        selectedColor,
        selectedOption
      });
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
});

export default router;
