import { Router, Request, Response } from 'express';
import ProductModel from '../models/Product';
import { getIsConnected } from '../db';
import { PRODUCTS } from '../../src/data/products';

const router = Router();

// GET /api/products - Get all products with optional filters
router.get('/', async (req: Request, res: Response) => {
  const category = req.query.category as string;
  const search = req.query.search as string;
  const sortBy = req.query.sortBy as string;

  const dbConnected = getIsConnected();
  res.setHeader('X-Database-Connected', String(dbConnected));

  if (!dbConnected) {
    // Graceful fallback to static mock data
    let results = [...PRODUCTS];

    if (category && category !== 'All') {
      results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-low') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      results.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    }

    return res.json(results);
  }

  try {
    const query: any = {};
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    let mongoQuery = ProductModel.find(query);

    // Apply sorting
    if (sortBy === 'price-low') {
      mongoQuery = mongoQuery.sort({ price: 1 });
    } else if (sortBy === 'price-high') {
      mongoQuery = mongoQuery.sort({ price: -1 });
    } else if (sortBy === 'rating') {
      mongoQuery = mongoQuery.sort({ rating: -1 });
    }

    const products = await mongoQuery;
    res.json(products);
  } catch (error) {
    console.error('Error fetching products from DB:', error);
    res.status(500).json({ message: 'Error retrieving products', error });
  }
});

// GET /api/products/:id - Get detailed product by id (slug)
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const dbConnected = getIsConnected();
  res.setHeader('X-Database-Connected', String(dbConnected));

  if (!dbConnected) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  }

  try {
    const product = await ProductModel.findOne({ id });
    if (!product) {
      // If we are connected but can't find it, see if we have it in mock data
      const mockProduct = PRODUCTS.find(p => p.id === id);
      if (mockProduct) {
        return res.json(mockProduct);
      }
      return res.status(404).json({ message: 'Product not found in database' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product detail', error });
  }
});

// POST /api/products - Create a new product (DB only)
router.post('/', async (req: Request, res: Response) => {
  if (!getIsConnected()) {
    return res.status(503).json({ message: 'Database is not connected. This write operation is unavailable.' });
  }

  try {
    const newProduct = new ProductModel(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
});

export default router;
