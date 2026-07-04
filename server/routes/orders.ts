import { Router, Response } from 'express';
import OrderModel from '../models/Order';
import { getIsConnected } from '../db';
import { AuthRequest, authMiddleware } from '../middleware/auth';
import { localDB } from '../local-db';

const router = Router();

// Helper to generate a friendly order ID
function generateOrderID(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ORD-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/orders - Create a new order (Supports guest & registered users)
router.post('/', async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();
  
  // If database is not connected, we simulate order success in-memory and save to localDB
  if (!dbConnected) {
    const mockId = generateOrderID();
    const orderData = {
      _id: 'ord_' + Math.random().toString(36).substring(2, 11),
      id: mockId,
      items: req.body.items || [],
      subtotal: req.body.subtotal || 0,
      tax: req.body.tax || 0,
      shipping: req.body.shipping || 0,
      total: req.body.total || 0,
      shippingAddress: req.body.shippingAddress || {},
      paymentMethod: req.body.paymentMethod || 'Visa',
      date: new Date().toISOString().split('T')[0],
      status: 'placed',
      user: req.user ? req.user.id : undefined
    };

    localDB.saveOrder(orderData);

    return res.status(201).json({
      success: true,
      message: 'Order simulated successfully (offline mode)',
      order: orderData
    });
  }

  try {
    const { items, subtotal, tax, shipping, total, shippingAddress, paymentMethod } = req.body;

    if (!items || !items.length || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }

    const orderId = generateOrderID();
    
    const newOrder = new OrderModel({
      id: orderId,
      items,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
      status: 'placed',
      user: req.user ? req.user.id : undefined // optional authenticated user
    });

    await newOrder.save();
    res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (error: any) {
    console.error('Error creating order in DB:', error);
    res.status(500).json({ message: 'Error placing order', error: error.message });
  }
});

// GET /api/orders/user - Get logged-in user's order history
router.get('/user', authMiddleware, async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();

  if (!dbConnected) {
    console.log('⚠️ Database disconnected, using local file DB fallback for user orders');
    try {
      const orders = localDB.findOrdersByUser(req.user?.id || '');
      return res.json(orders);
    } catch (error: any) {
      return res.status(500).json({ message: 'Error fetching user orders from fallback DB', error: error.message });
    }
  }

  try {
    const orders = await OrderModel.find({ user: req.user?.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user orders', error: error.message });
  }
});

// GET /api/orders/:id - Get order by friendly order ID or MongoDB ObjectId
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const dbConnected = getIsConnected();

  if (!dbConnected) {
    console.log('⚠️ Database disconnected, using local file DB fallback for order detail');
    const order = localDB.findOrderById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json(order);
  }

  try {
    const order = await OrderModel.findOne({ id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving order details', error: error.message });
  }
});

export default router;
