import { Router, Response } from 'express';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

// Configure Cloudinary lazily so it doesn't crash on boot if environment keys are missing
let isCloudinaryConfigured = false;
function initCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
    isCloudinaryConfigured = true;
    console.log('✅ Cloudinary initialized successfully.');
  } else {
    isCloudinaryConfigured = false;
    console.warn('⚠️ Cloudinary keys are missing. Uploads will fall back to local mock URLs.');
  }
}

// POST /api/upload - Upload product image (Admins only)
router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { image } = req.body; // Can be a Base64 string or an image URL

  if (!image) {
    return res.status(400).json({ message: 'No image data provided. Please send a Base64 string.' });
  }

  // Initialize Cloudinary if not already checked
  initCloudinary();

  try {
    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(image, {
        folder: 'pixelmart_products',
        resource_type: 'auto'
      });

      return res.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id
      });
    } else {
      // Fallback: use a beautiful Unsplash stock electronic placeholder if not configured
      console.log('⚠️ Using fallback Unsplash product placeholder URL (Cloudinary not configured)');
      const fallbackUrls = [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80', // Gaming
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80', // Smartwatch
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', // Headphones
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'  // Speaker
      ];
      const randomUrl = fallbackUrls[Math.floor(Math.random() * fallbackUrls.length)];

      return res.json({
        success: true,
        url: randomUrl,
        message: 'Cloudinary not configured. Fallback placeholder returned.'
      });
    }
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    return res.status(500).json({
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

export default router;
