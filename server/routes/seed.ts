import { Router, Request, Response } from 'express';
import ProductModel from '../models/Product';
import CategoryModel from '../models/Category';
import { getIsConnected } from '../db';
import { PRODUCTS } from '../../src/data/products';

const router = Router();

// Re-usable seeding logic
export async function seedDatabase() {
  if (!getIsConnected()) {
    console.warn('⚠️ Seeding skipped: Database is not connected.');
    return { success: false, message: 'Database not connected' };
  }

  try {
    // 1. Clear existing products and categories
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});

    // 2. Insert categories
    const categoriesToInsert = [
      { name: 'Phones', slug: 'phones' },
      { name: 'Wearables', slug: 'wearables' },
      { name: 'Audio', slug: 'audio' },
      { name: 'Accessories', slug: 'accessories' }
    ];
    await CategoryModel.insertMany(categoriesToInsert);

    // 3. Insert products
    // Need to parse specs map properly since we defined it as Map in schema
    const formattedProducts = PRODUCTS.map(p => {
      const specsMap = new Map();
      Object.entries(p.specs || {}).forEach(([key, val]) => {
        specsMap.set(key, val);
      });

      return {
        ...p,
        specs: specsMap
      };
    });

    await ProductModel.insertMany(formattedProducts);
    console.log('✅ Database seeded with default categories and products successfully!');
    return { success: true, message: 'Seeded successfully', count: formattedProducts.length };
  } catch (error: any) {
    console.error('❌ Error during seeding:', error);
    return { success: false, error: error.message };
  }
}

// POST /api/seed - Manual seed endpoint
router.post('/', async (req: Request, res: Response) => {
  const result = await seedDatabase();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

export default router;
