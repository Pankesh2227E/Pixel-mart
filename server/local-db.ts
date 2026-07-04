/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'server', 'local-db.json');

interface LocalUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  wishlist?: string[];
  createdAt?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
}

interface LocalOrder {
  _id: string;
  id: string;
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: any;
  paymentMethod: string;
  date: string;
  status: string;
  user?: string;
  cashfreeOrderId?: string;
  cashfreePaymentSessionId?: string;
  paymentStatus?: string;
  createdAt?: string;
}

interface LocalProduct {
  id: string; // e.g. 'pixel-9-pro-xl'
  name: string;
  price: number;
  category: string;
  image: string;
  colors: string[];
  storages?: string[];
  sizes?: string[];
  rating: number;
  reviewsCount: number;
  specs: any; // Record<string, string>
  highlights: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  stock?: number;
  _id?: string;
  createdAt?: string;
}

interface LocalCategory {
  name: string;
  slug: string;
  _id?: string;
  createdAt?: string;
}

interface LocalReview {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface LocalDB {
  users: LocalUser[];
  orders: LocalOrder[];
  products: LocalProduct[];
  categories: LocalCategory[];
  reviews?: LocalReview[];
}

const DEFAULT_CATEGORIES = [
  { name: 'Phones', slug: 'phones' },
  { name: 'Wearables', slug: 'wearables' },
  { name: 'Audio', slug: 'audio' },
  { name: 'Accessories', slug: 'accessories' }
];

const DEFAULT_PRODUCTS = [
  {
    id: 'pixel-9-pro-xl',
    name: 'Pixel 9 Pro XL',
    price: 1099,
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    colors: ['Obsidian', 'Hazel', 'Porcelain', 'Rose Quartz'],
    storages: ['128GB', '256GB', '512GB', '1TB'],
    rating: 4.8,
    reviewsCount: 124,
    specs: {
      'Screen': '6.8" Super Actua Display',
      'Processor': 'Google Tensor G4',
      'Camera': '50MP main, 48MP ultrawide, 48MP 5x telephoto',
      'Battery': '5060 mAh with 45W fast charge'
    },
    highlights: [
      'Pro-level triple camera system with 5x optical zoom',
      'Super Actua display is Google’s brightest screen ever',
      'Powered by Tensor G4 with advanced Gemini Nano integration',
      'Up to 24 hours of battery life'
    ],
    isNew: true,
    isBestSeller: true
  },
  {
    id: 'pixel-9-pro',
    name: 'Pixel 9 Pro',
    price: 999,
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
    colors: ['Obsidian', 'Hazel', 'Porcelain', 'Rose Quartz'],
    storages: ['128GB', '256GB', '512GB', '1TB'],
    rating: 4.7,
    reviewsCount: 89,
    specs: {
      'Screen': '6.3" Super Actua Display',
      'Processor': 'Google Tensor G4',
      'Camera': '50MP main, 48MP ultrawide, 48MP 5x telephoto',
      'Battery': '4700 mAh'
    },
    highlights: [
      'Stunning compact design with full pro-camera hardware',
      'Super Actua display for vibrant, high-contrast visuals',
      'Advanced AI features built-in to help you get more done'
    ],
    isNew: true
  },
  {
    id: 'pixel-watch-3',
    name: 'Pixel Watch 3',
    price: 349,
    category: 'wearables',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
    colors: ['Matte Black', 'Polished Silver', 'Champagne Gold'],
    sizes: ['41mm', '45mm'],
    rating: 4.6,
    reviewsCount: 204,
    specs: {
      'Display': 'Actua Display (up to 2000 nits)',
      'OS': 'Wear OS 5.0',
      'Battery': 'Up to 36 hours in battery saver mode',
      'Sensors': 'EDA, ECG, SpO2, Heart Rate, Skin Temp'
    },
    highlights: [
      'Larger Actua display is twice as bright as before',
      'Advanced fitness insights and recovery tracking',
      'Seamless Google Pixel ecosystem integrations'
    ],
    isBestSeller: true
  }
];

function readDB(): LocalDB {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const initialDB: LocalDB = {
        users: [],
        orders: [],
        products: DEFAULT_PRODUCTS,
        categories: DEFAULT_CATEGORIES
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf8');
      return initialDB;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Auto-migrate if array is missing
    let modified = false;
    if (!parsed.users) { parsed.users = []; modified = true; }
    if (!parsed.orders) { parsed.orders = []; modified = true; }
    if (!parsed.products || parsed.products.length === 0) { parsed.products = DEFAULT_PRODUCTS; modified = true; }
    if (!parsed.categories || parsed.categories.length === 0) { parsed.categories = DEFAULT_CATEGORIES; modified = true; }
    if (!parsed.reviews) { parsed.reviews = []; modified = true; }
    
    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
    }
    
    return parsed;
  } catch (err) {
    console.error('Error reading local DB:', err);
    return {
      users: [],
      orders: [],
      products: DEFAULT_PRODUCTS,
      categories: DEFAULT_CATEGORIES
    };
  }
}

function writeDB(data: LocalDB) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local DB:', err);
  }
}

export const localDB = {
  // Users
  getUsers: () => readDB().users,
  saveUser: (user: LocalUser) => {
    const db = readDB();
    db.users.push(user);
    writeDB(db);
  },
  findUserByEmail: (email: string) => {
    return readDB().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: (id: string) => {
    return readDB().users.find(u => u._id === id);
  },
  updateUserRole: (userId: string, role: 'user' | 'admin') => {
    const db = readDB();
    const user = db.users.find(u => u._id === userId);
    if (user) {
      user.role = role;
      writeDB(db);
      return user;
    }
    return null;
  },
  toggleWishlist: (userId: string, productId: string) => {
    const db = readDB();
    const user = db.users.find(u => u._id === userId);
    if (user) {
      if (!user.wishlist) {
        user.wishlist = [];
      }
      const index = user.wishlist.indexOf(productId);
      if (index === -1) {
        user.wishlist.push(productId);
      } else {
        user.wishlist.splice(index, 1);
      }
      writeDB(db);
      return user.wishlist;
    }
    return [];
  },

  // Orders
  getOrders: () => readDB().orders,
  saveOrder: (order: LocalOrder) => {
    const db = readDB();
    db.orders.push(order);
    writeDB(db);
  },
  findOrdersByUser: (userId: string) => {
    return readDB().orders.filter(o => o.user === userId);
  },
  findOrderById: (orderId: string) => {
    return readDB().orders.find(o => o.id === orderId);
  },
  updateOrderStatus: (orderId: string, status: string) => {
    const db = readDB();
    const order = db.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      writeDB(db);
      return order;
    }
    return null;
  },

  // Products
  getProducts: () => readDB().products,
  findProductById: (id: string) => {
    return readDB().products.find(p => p.id === id);
  },
  saveProduct: (product: LocalProduct) => {
    const db = readDB();
    const existingIdx = db.products.findIndex(p => p.id === product.id);
    if (existingIdx !== -1) {
      db.products[existingIdx] = { ...db.products[existingIdx], ...product };
    } else {
      product._id = 'prd_' + Math.random().toString(36).substring(2, 11);
      product.createdAt = new Date().toISOString();
      db.products.push(product);
    }
    writeDB(db);
    return product;
  },
  deleteProduct: (id: string) => {
    const db = readDB();
    const index = db.products.findIndex(p => p.id === id);
    if (index !== -1) {
      db.products.splice(index, 1);
      writeDB(db);
      return true;
    }
    return false;
  },

  // Categories
  getCategories: () => readDB().categories,
  saveCategory: (category: LocalCategory) => {
    const db = readDB();
    const existingIdx = db.categories.findIndex(c => c.slug === category.slug);
    if (existingIdx !== -1) {
      db.categories[existingIdx] = { ...db.categories[existingIdx], ...category };
    } else {
      category._id = 'cat_' + Math.random().toString(36).substring(2, 11);
      category.createdAt = new Date().toISOString();
      db.categories.push(category);
    }
    writeDB(db);
    return category;
  },
  deleteCategory: (slug: string) => {
    const db = readDB();
    const index = db.categories.findIndex(c => c.slug === slug);
    if (index !== -1) {
      db.categories.splice(index, 1);
      writeDB(db);
      return true;
    }
    return false;
  },

  // Reviews fallback
  getReviews: (productId: string) => {
    const db = readDB();
    return (db.reviews || []).filter(r => r.productId === productId);
  },
  saveReview: (reviewData: Omit<LocalReview, '_id' | 'createdAt'> & { _id?: string }) => {
    const db = readDB();
    if (!db.reviews) db.reviews = [];
    
    let review: LocalReview;
    if (reviewData._id) {
      // Edit mode
      const idx = db.reviews.findIndex(r => r._id === reviewData._id);
      if (idx !== -1) {
        db.reviews[idx] = { ...db.reviews[idx], ...reviewData } as LocalReview;
        review = db.reviews[idx];
      } else {
        review = {
          ...reviewData,
          _id: reviewData._id,
          createdAt: new Date().toISOString()
        } as LocalReview;
        db.reviews.push(review);
      }
    } else {
      // Create mode
      review = {
        ...reviewData,
        _id: 'rev_' + Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString()
      };
      db.reviews.push(review);
    }
    writeDB(db);
    return review;
  },
  deleteReview: (reviewId: string) => {
    const db = readDB();
    if (!db.reviews) return false;
    const idx = db.reviews.findIndex(r => r._id === reviewId);
    if (idx !== -1) {
      db.reviews.splice(idx, 1);
      writeDB(db);
      return true;
    }
    return false;
  }
};
