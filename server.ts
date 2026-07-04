import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

import { connectDB, getIsConnected } from './server/db';
import { validateEnvironment } from './server/lib/env-validator';
import ProductModel from './server/models/Product';
import { seedDatabase } from './server/routes/seed';

import productRoutes from './server/routes/products';
import categoryRoutes from './server/routes/categories';
import userRoutes from './server/routes/users';
import orderRoutes from './server/routes/orders';
import cartRoutes from './server/routes/cart';
import seedRoutes from './server/routes/seed';
import reviewRoutes from './server/routes/reviews';
import contactRoutes from './server/routes/contact';
import uploadRoutes from './server/routes/upload';
import { errorHandler } from './server/middleware/error';
import { promoteToAdmin } from './server/admin-init';

async function startServer() {
  // Validate system environment variables
  validateEnvironment();

  const app = express();
  const PORT = 3000;

  // Use JSON parsing middleware with high limit for Base64 image uploads
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // Connect to MongoDB Atlas
  console.log('🔄 Initializing database connection...');
  const dbConnected = await connectDB();

  // Securely boot/promote the first admin user
  const defaultAdmin = 'pankesh2008@gmail.com';
  await promoteToAdmin(defaultAdmin);
  if (process.env.INITIAL_ADMIN_EMAIL && process.env.INITIAL_ADMIN_EMAIL.toLowerCase() !== defaultAdmin) {
    await promoteToAdmin(process.env.INITIAL_ADMIN_EMAIL);
  }

  // If connected, check if we need to auto-seed the products catalog
  if (dbConnected) {
    try {
      const productCount = await ProductModel.countDocuments();
      if (productCount === 0) {
        console.log('🌱 Product catalog is empty. Auto-seeding default database catalog...');
        await seedDatabase();
      } else {
        console.log(`📊 Products found in database: ${productCount}. Skipping auto-seed.`);
      }
    } catch (err) {
      console.error('⚠️ Failed to check or seed database:', err);
    }
  } else {
    console.warn('⚠️ Server started without a database connection. Live database-dependent routes will be unavailable.');
  }

  // API Routes
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/seed', seedRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/upload', uploadRoutes);

  // Simple Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      database: getIsConnected() ? 'connected' : 'disconnected',
      time: new Date().toISOString()
    });
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚡ Mounting Vite developer middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('📦 Serving production static bundle...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PixelMart Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('❌ Critical server initialization failure:', err);
  process.exit(1);
});
