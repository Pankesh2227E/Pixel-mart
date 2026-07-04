import { Router, Response } from 'express';
import ProductModel from '../models/Product';
import { getIsConnected } from '../db';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import { localDB } from '../local-db';

const router = Router();

// GET /api/products - Get all products with optional filters
router.get('/', async (req: AuthRequest, res: Response) => {
  const category = req.query.category as string;
  const search = req.query.search as string;
  const sortBy = req.query.sortBy as string;
  const brand = req.query.brand as string;
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;

  const dbConnected = getIsConnected();
  res.setHeader('X-Database-Connected', String(dbConnected));

  // Helper to derive brand
  const getProductBrand = (p: any) => {
    if (p.brand) return p.brand;
    const nameLower = p.name.toLowerCase();
    if (nameLower.includes('google') || nameLower.includes('pixel')) {
      return 'Google';
    }
    return p.name.split(' ')[0] || 'Generic';
  };

  if (!dbConnected) {
    // Graceful fallback to localDB (which starts with static products)
    let results = [...localDB.getProducts()];

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

    if (brand && brand !== 'All') {
      results = results.filter(p => getProductBrand(p).toLowerCase() === brand.toLowerCase());
    }

    if (minPrice !== undefined) {
      results = results.filter(p => p.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      results = results.filter(p => p.price <= maxPrice);
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      results.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      results.sort((a, b) => {
        const aVal = a.isNew ? 1 : 0;
        const bVal = b.isNew ? 1 : 0;
        if (bVal !== aVal) return bVal - aVal;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    } else if (sortBy === 'popularity') {
      results.sort((a, b) => {
        const aVal = a.isBestSeller ? 1 : 0;
        const bVal = b.isBestSeller ? 1 : 0;
        if (bVal !== aVal) return bVal - aVal;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      });
    } else {
      // Default: Featured
      results.sort((a, b) => {
        const aVal = a.isBestSeller ? 1 : 0;
        const bVal = b.isBestSeller ? 1 : 0;
        if (bVal !== aVal) return bVal - aVal;
        return b.rating - a.rating;
      });
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

    if (brand && brand !== 'All') {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { brand: { $regex: new RegExp(`^${brand}$`, 'i') } },
          { name: { $regex: new RegExp(brand, 'i') } }
        ]
      });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    let mongoQuery = ProductModel.find(query);

    // Apply sorting
    if (sortBy === 'price-low') {
      mongoQuery = mongoQuery.sort({ price: 1 });
    } else if (sortBy === 'price-high') {
      mongoQuery = mongoQuery.sort({ price: -1 });
    } else if (sortBy === 'rating') {
      mongoQuery = mongoQuery.sort({ rating: -1 });
    } else if (sortBy === 'newest') {
      mongoQuery = mongoQuery.sort({ isNew: -1, createdAt: -1 });
    } else if (sortBy === 'popularity') {
      mongoQuery = mongoQuery.sort({ isBestSeller: -1, reviewsCount: -1 });
    } else {
      mongoQuery = mongoQuery.sort({ isBestSeller: -1, rating: -1 });
    }

    const products = await mongoQuery;
    res.json(products);
  } catch (error) {
    console.error('Error fetching products from DB:', error);
    res.status(500).json({ message: 'Error retrieving products', error });
  }
});

// GET /api/products/:id - Get detailed product by id (slug)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const dbConnected = getIsConnected();
  res.setHeader('X-Database-Connected', String(dbConnected));

  if (!dbConnected) {
    const product = localDB.findProductById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  }

  try {
    const product = await ProductModel.findOne({ id });
    if (!product) {
      // Check if we have it in fallback
      const fallbackProduct = localDB.findProductById(id);
      if (fallbackProduct) {
        return res.json(fallbackProduct);
      }
      return res.status(404).json({ message: 'Product not found in database' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product detail', error });
  }
});

// POST /api/products - Create a new product (Admins only)
router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const dbConnected = getIsConnected();

  try {
    const productData = req.body;
    if (!productData.id || !productData.name || !productData.price || !productData.category || !productData.image) {
      return res.status(400).json({ message: 'Missing required product fields: id, name, price, category, image' });
    }

    if (!dbConnected) {
      console.log('⚠️ Database disconnected, saving product in local file DB fallback');
      const saved = localDB.saveProduct(productData);
      return res.status(201).json(saved);
    }

    const existingProduct = await ProductModel.findOne({ id: productData.id });
    if (existingProduct) {
      return res.status(400).json({ message: 'A product with this Reference ID already exists.' });
    }

    const newProduct = new ProductModel(productData);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
});

// PUT /api/products/:id - Update product details (Admins only)
router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const dbConnected = getIsConnected();

  try {
    const productData = req.body;

    if (!dbConnected) {
      console.log('⚠️ Database disconnected, updating product in local file DB fallback');
      const existing = localDB.findProductById(id);
      if (!existing) {
        return res.status(404).json({ message: 'Product not found' });
      }
      // Ensure key fields are merged or kept
      const updated = localDB.saveProduct({ ...existing, ...productData, id });
      return res.json(updated);
    }

    const product = await ProductModel.findOne({ id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields from body
    Object.assign(product, productData);
    // Ensure id slug isn't changed
    product.id = id;

    await product.save();
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
});

// DELETE /api/products/:id - Delete a product (Admins only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const dbConnected = getIsConnected();

  try {
    if (!dbConnected) {
      console.log('⚠️ Database disconnected, deleting product in local file DB fallback');
      const deleted = localDB.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json({ success: true, message: 'Product deleted from fallback DB' });
    }

    const product = await ProductModel.findOneAndDelete({ id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

export default router;
