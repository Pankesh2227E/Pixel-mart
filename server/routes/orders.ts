import { Router, Response } from 'express';
import OrderModel from '../models/Order';
import ProductModel from '../models/Product';
import { getIsConnected } from '../db';
import { AuthRequest, authMiddleware, adminMiddleware } from '../middleware/auth';
import { localDB } from '../local-db';
import { getCashfree } from '../lib/cashfree';

const router = Router();

// Helper to generate a friendly human-readable Order ID (e.g., PM-123456)
function generateOrderID() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `PM-${digits}`;
}

// Simulated Order Confirmation Email Logger
function sendSimulatedOrderEmail(order: any) {
  const itemsText = (order.items || []).map((it: any) => 
    `│ • ${it.quantity}x ${it.product.name} (${it.selectedColor || 'Default'}${it.selectedOption ? ', ' + it.selectedOption : ''}) - $${(it.product.price * it.quantity).toLocaleString()}`
  ).join('\n');

  console.log(`
┌────────────────────────────────────────────────────────┐
│               📧 PIXELMART ORDER CONFIRMATION          │
├────────────────────────────────────────────────────────┤
│ To: ${order.shippingAddress?.email || 'customer@example.com'}
│ Subject: Order Confirmation - ${order.id}
├────────────────────────────────────────────────────────┤
│ Thank you for your purchase at PixelMart!
│ We are preparing your shipment.
│
│ Order Reference: ${order.id}
│ Date: ${order.date || new Date().toISOString().split('T')[0]}
│
│ Purchased Items:
${itemsText}
│
│ Subtotal: $${Number(order.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
│ Tax: $${Number(order.tax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
│ Shipping: $${order.shipping === 0 ? 'FREE' : '$' + Number(order.shipping).toLocaleString()}
│ Total Paid: $${Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
├────────────────────────────────────────────────────────┤
│ Delivery Address:
│ ${order.shippingAddress?.fullName}
│ ${order.shippingAddress?.address}
│ ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}
│ ${order.shippingAddress?.country}
│
│ Estimated Delivery: 3-5 Business Days
└────────────────────────────────────────────────────────┘
`);
}

// POST /api/orders - Create a new order (Users or Guests)
router.post('/', async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();
  
  // If database is not connected, we simulate order success in-memory and save to localDB
  if (!dbConnected) {
    const mockId = generateOrderID();
    const items = req.body.items || [];

    // INVENTORY CHECK (Offline Fallback)
    for (const item of items) {
      const dbPrd = localDB.findProductById(item.product.id);
      if (dbPrd) {
        const currentStock = dbPrd.stock !== undefined ? dbPrd.stock : 15;
        if (currentStock < item.quantity) {
          return res.status(400).json({
            message: `Sorry, ${dbPrd.name} has insufficient stock. Only ${currentStock} items left.`
          });
        }
      }
    }

    // DECREMENT INVENTORY (Offline Fallback)
    for (const item of items) {
      const dbPrd = localDB.findProductById(item.product.id);
      if (dbPrd) {
        const currentStock = dbPrd.stock !== undefined ? dbPrd.stock : 15;
        dbPrd.stock = currentStock - item.quantity;
        localDB.saveProduct(dbPrd);
      }
    }

    const orderData = {
      _id: 'ord_' + Math.random().toString(36).substring(2, 11),
      id: mockId,
      items,
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
    sendSimulatedOrderEmail(orderData);

    return res.status(201).json({
      success: true,
      message: 'Order simulated successfully (offline mode)',
      order: orderData
    });
  }

  try {
    const { items, subtotal, tax, shipping, total, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cannot place an empty order' });
    }

    // INVENTORY CHECK (MongoDB)
    for (const item of items) {
      const product = await ProductModel.findOne({ id: item.product.id });
      if (product) {
        const currentStock = product.stock !== undefined ? product.stock : 15;
        if (currentStock < item.quantity) {
          return res.status(400).json({
            message: `Sorry, ${product.name} has insufficient stock. Only ${currentStock} left.`
          });
        }
      }
    }

    // DECREMENT INVENTORY (MongoDB)
    for (const item of items) {
      const product = await ProductModel.findOne({ id: item.product.id });
      if (product) {
        const currentStock = product.stock !== undefined ? product.stock : 15;
        product.stock = currentStock - item.quantity;
        await product.save();
      }
    }

    const orderId = generateOrderID();

    const newOrder = new OrderModel({
      id: orderId,
      user: req.user ? req.user.id : undefined, // Optional association if logged-in
      items,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
      status: 'placed'
    });

    await newOrder.save();
    sendSimulatedOrderEmail(newOrder);

    res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (error: any) {
    console.error('Error creating order in DB:', error);
    res.status(500).json({ message: 'Error processing your order', error: error.message });
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
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order history', error });
  }
});

// GET /api/orders - Get all orders (Admins only)
router.get('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();

  try {
    if (!dbConnected) {
      console.log('⚠️ Database disconnected, returning all orders from local file DB');
      const orders = localDB.getOrders();
      return res.json(orders);
    }

    const orders = await OrderModel.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching all orders', error: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status (Admins only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const dbConnected = getIsConnected();

  const validStatuses = ['placed', 'processing', 'dispatched', 'delivered'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    if (!dbConnected) {
      console.log('⚠️ Database disconnected, updating order status in local file DB fallback');
      const updated = localDB.updateOrderStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.json(updated);
    }

    const order = await OrderModel.findOne({ id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status as 'placed' | 'processing' | 'dispatched' | 'delivered';
    await order.save();
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

// GET /api/orders/:id - Get detailed order by custom order reference id
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
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order details', error });
  }
});

// POST /api/orders/cashfree-session - Initiate a payment session
router.post('/cashfree-session', async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();
  const { items, subtotal, tax, shipping, total, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Cannot place an empty order' });
  }

  const orderId = generateOrderID();

  // Save the order to DB first with "pending" status
  let savedOrder: any;

  if (dbConnected) {
    const newOrder = new OrderModel({
      id: orderId,
      user: req.user ? req.user.id : undefined,
      items,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
      status: 'placed',
      paymentStatus: 'pending'
    });
    savedOrder = await newOrder.save();
  } else {
    const orderData = {
      _id: 'ord_' + Math.random().toString(36).substring(2, 11),
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
      paymentStatus: 'pending',
      user: req.user ? req.user.id : undefined
    };
    localDB.saveOrder(orderData);
    savedOrder = orderData;
  }

  try {
    console.log("CLIENT ID EXISTS:", !!process.env.CASHFREE_CLIENT_ID);
    console.log("CLIENT SECRET EXISTS:", !!process.env.CASHFREE_CLIENT_SECRET);
    console.log("MODE:", process.env.CASHFREE_MODE);
    const cf = getCashfree();

    const createOrderRequest = {
      order_id: orderId,
      order_amount: total,
      order_currency: 'INR',
      customer_details: {
        customer_id: req.user ? req.user.id : `guest_${Date.now()}`,
        customer_email: shippingAddress.email || 'guest@pixelmart.com',
        customer_phone: shippingAddress.phone || '9999999999',
        customer_name: shippingAddress.fullName || 'Guest Customer'
      },
      order_meta: {
        return_url: `${process.env.APP_URL || 'http://localhost:3000'}/success?order_id=${orderId}`
      }
    };

    console.log(`📡 Creating Cashfree order for ${orderId}...`);
    const cfResponse = await cf.PGCreateOrder(createOrderRequest);
    const cfOrder = cfResponse.data;

    if (dbConnected) {
      const order = await OrderModel.findOne({ id: orderId });
      if (order) {
        order.cashfreeOrderId = cfOrder.cf_order_id;
        order.cashfreePaymentSessionId = cfOrder.payment_session_id;
        await order.save();
        savedOrder = order;
      }
    } else {
      const order = localDB.findOrderById(orderId);
      if (order) {
        order.cashfreeOrderId = cfOrder.cf_order_id;
        order.cashfreePaymentSessionId = cfOrder.payment_session_id;
        
        // Force sync local file DB
        const db = localDB.getOrders();
        const idx = db.findIndex(o => o.id === orderId);
        if (idx !== -1) {
          db[idx] = order;
          const fs = await import('fs');
          const path = await import('path');
          const DB_FILE = path.join(process.cwd(), 'server', 'local-db.json');
          const data = fs.readFileSync(DB_FILE, 'utf8');
          const parsed = JSON.parse(data);
          parsed.orders = db;
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
        }
      }
    }

    res.status(200).json({
      success: true,
      payment_session_id: cfOrder.payment_session_id,
      order_id: orderId,
      order: savedOrder,
      cfMode: process.env.CASHFREE_MODE === 'production' ? 'production' : 'sandbox'
    });

  } catch (error: any) {
    console.error("Cashfree Error Object:", error);
    console.error("Cashfree Error Message:", error?.message);
    console.error("Cashfree Error Response:", error?.response?.data);
    
    // In case Cashfree credentials are not configured, simulate a sandbox mock session
    if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
      console.log('⚠️ CASHFREE credentials not set. Simulating a mock payment session for testing.');
      
      const mockSessionId = `session_${Math.random().toString(36).substring(2, 15)}`;
      if (dbConnected) {
        const order = await OrderModel.findOne({ id: orderId });
        if (order) {
          order.cashfreeOrderId = `cf_${Math.floor(100000 + Math.random() * 900000)}`;
          order.cashfreePaymentSessionId = mockSessionId;
          await order.save();
          savedOrder = order;
        }
      } else {
        const order = localDB.findOrderById(orderId);
        if (order) {
          order.cashfreeOrderId = `cf_${Math.floor(100000 + Math.random() * 900000)}`;
          order.cashfreePaymentSessionId = mockSessionId;
          
          const db = localDB.getOrders();
          const idx = db.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            db[idx] = order;
            const fs = await import('fs');
            const path = await import('path');
            const DB_FILE = path.join(process.cwd(), 'server', 'local-db.json');
            const data = fs.readFileSync(DB_FILE, 'utf8');
            const parsed = JSON.parse(data);
            parsed.orders = db;
            fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
          }
        }
      }

      return res.status(200).json({
        success: true,
        payment_session_id: mockSessionId,
        order_id: orderId,
        isSimulated: true,
        order: savedOrder,
        cfMode: 'sandbox'
      });
    }

    res.status(500).json({ 
      message: 'Failed to generate payment session', 
      error: error.message 
    });
  }
});

// POST /api/orders/cashfree-verify - Securely verify a transaction status
router.post('/cashfree-verify', async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {
    let order: any;
    if (dbConnected) {
      order = await OrderModel.findOne({ id: orderId });
    } else {
      order = localDB.findOrderById(orderId);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let isSuccess = false;

    if (process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET) {
      const cf = getCashfree();
      console.log(`📡 Securely verifying payment status with Cashfree for order ${orderId}...`);
      const cfResponse = await cf.PGFetchOrder(orderId);
      const cfOrder = cfResponse.data;

      if (cfOrder.order_status === 'PAID') {
        isSuccess = true;
        order.paymentStatus = 'paid';
        order.status = 'processing';
      } else if (cfOrder.order_status === 'FAILED') {
        order.paymentStatus = 'failed';
      } else if (cfOrder.order_status === 'CANCELLED') {
        order.paymentStatus = 'cancelled';
      }
    } else {
      console.log(`⚠️ Simulating payment verification success for ${orderId} (Credentials missing)`);
      isSuccess = true;
      order.paymentStatus = 'paid';
      order.status = 'processing';
    }

    if (dbConnected) {
      await order.save();
    } else {
      const db = localDB.getOrders();
      const idx = db.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        db[idx] = order;
        const fs = await import('fs');
        const path = await import('path');
        const DB_FILE = path.join(process.cwd(), 'server', 'local-db.json');
        const data = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(data);
        parsed.orders = db;
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
      }
    }

    res.json({
      success: isSuccess,
      order
    });

  } catch (error: any) {
    console.error('Error verifying Cashfree payment:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
});

// POST /api/orders/cashfree-webhook - Asynchronous payment notification webhooks
router.post('/cashfree-webhook', async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();
  const signature = req.headers['x-cf-signature'] as string;
  const timestamp = req.headers['x-cf-timestamp'] as string;
  const rawBody = JSON.stringify(req.body);

  try {
    console.log('📡 Received Cashfree Webhook callback:', req.body);
    
    if (process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET && signature && timestamp) {
      try {
        const cf = getCashfree();
        const verifiedEvent = cf.PGVerifyWebhookSignature(signature, rawBody, timestamp);
        console.log('✅ Webhook signature validated successfully:', verifiedEvent);
      } catch (err: any) {
        console.warn('⚠️ Webhook signature validation failed:', err.message);
      }
    }

    const orderId = req.body.data?.order?.order_id;
    const paymentStatus = req.body.data?.payment?.payment_status;

    if (orderId) {
      let order: any;
      if (dbConnected) {
        order = await OrderModel.findOne({ id: orderId });
      } else {
        order = localDB.findOrderById(orderId);
      }

      if (order) {
        if (paymentStatus === 'SUCCESS') {
          order.paymentStatus = 'paid';
          order.status = 'processing';
          console.log(`📈 Webhook marked order ${orderId} as PAID successfully`);
        } else if (paymentStatus === 'FAILED') {
          order.paymentStatus = 'failed';
          console.log(`📉 Webhook marked order ${orderId} as FAILED`);
        }

        if (dbConnected) {
          await order.save();
        } else {
          const db = localDB.getOrders();
          const idx = db.findIndex(o => o.id === orderId);
          if (idx !== -1) {
            db[idx] = order;
            const fs = await import('fs');
            const path = await import('path');
            const DB_FILE = path.join(process.cwd(), 'server', 'local-db.json');
            const data = fs.readFileSync(DB_FILE, 'utf8');
            const parsed = JSON.parse(data);
            parsed.orders = db;
            fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Error handling Cashfree webhook:', error);
    res.status(500).send('Webhook error');
  }
});

export default router;
