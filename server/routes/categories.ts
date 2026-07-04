import { Router, Request, Response } from 'express';
import CategoryModel from '../models/Category';
import { getIsConnected } from '../db';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import { localDB } from '../local-db';

const router = Router();

// GET /api/categories
router.get('/', async (req: Request, res: Response) => {
  const dbConnected = getIsConnected();
  res.setHeader('X-Database-Connected', String(dbConnected));

  if (!dbConnected) {
    return res.json(localDB.getCategories());
  }

  try {
    const categories = await CategoryModel.find({});
    if (categories.length === 0) {
      // Seed if empty in Atlas
      return res.json(localDB.getCategories());
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
});

// POST /api/categories - Create a new category (Admins only)
router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();

  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' });
    }

    if (!dbConnected) {
      console.log('⚠️ Database disconnected, creating category in local file DB fallback');
      const saved = localDB.saveCategory({ name, slug });
      return res.status(201).json(saved);
    }

    const existing = await CategoryModel.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Category with this slug already exists.' });
    }

    const category = new CategoryModel({ name, slug });
    await category.save();
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
});

// PUT /api/categories/:slug - Update category (Admins only)
router.put('/:slug', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { slug } = req.params;
  const { name, newSlug } = req.body;
  const dbConnected = getIsConnected();

  try {
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const targetSlug = newSlug || slug;

    if (!dbConnected) {
      console.log('⚠️ Database disconnected, updating category in local file DB fallback');
      const allCategories = localDB.getCategories();
      const cat = allCategories.find(c => c.slug === slug);
      if (!cat) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // If slug changed, delete original first
      if (slug !== targetSlug) {
        localDB.deleteCategory(slug);
      }

      const updated = localDB.saveCategory({ name, slug: targetSlug });
      return res.json(updated);
    }

    const category = await CategoryModel.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name;
    category.slug = targetSlug;
    await category.save();

    res.json(category);
  } catch (error: any) {
    res.status(400).json({ message: 'Error updating category', error: error.message });
  }
});

// DELETE /api/categories/:slug - Delete category (Admins only)
router.delete('/:slug', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { slug } = req.params;
  const dbConnected = getIsConnected();

  try {
    if (!dbConnected) {
      console.log('⚠️ Database disconnected, deleting category in local file DB fallback');
      const deleted = localDB.deleteCategory(slug);
      if (!deleted) {
        return res.status(404).json({ message: 'Category not found' });
      }
      return res.json({ success: true, message: 'Category deleted from fallback DB' });
    }

    const category = await CategoryModel.findOneAndDelete({ slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

export default router;
