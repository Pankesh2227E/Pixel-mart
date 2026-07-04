import { Router, Request, Response } from 'express';
import CategoryModel from '../models/Category';
import { getIsConnected } from '../db';

const router = Router();

const DEFAULT_CATEGORIES = [
  { name: 'Phones', slug: 'phones' },
  { name: 'Wearables', slug: 'wearables' },
  { name: 'Audio', slug: 'audio' },
  { name: 'Accessories', slug: 'accessories' }
];

// GET /api/categories
router.get('/', async (req: Request, res: Response) => {
  const dbConnected = getIsConnected();
  res.setHeader('X-Database-Connected', String(dbConnected));

  if (!dbConnected) {
    return res.json(DEFAULT_CATEGORIES);
  }

  try {
    const categories = await CategoryModel.find({});
    if (categories.length === 0) {
      return res.json(DEFAULT_CATEGORIES);
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
});

// POST /api/categories - Create a new category
router.post('/', async (req: Request, res: Response) => {
  if (!getIsConnected()) {
    return res.status(503).json({ message: 'Database not connected' });
  }

  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }

    const category = new CategoryModel({ name, slug });
    await category.save();
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
});

export default router;
