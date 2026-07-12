/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Package,
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Image,
  IndianRupee,
  TrendingUp,
  X,
  Check,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface IProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  colors: string[];
  storages?: string[];
  sizes?: string[];
  rating: number;
  reviewsCount: number;
  specs: Record<string, string>;
  highlights: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
}

interface ICategory {
  name: string;
  slug: string;
  _id?: string;
}

interface IOrder {
  id: string;
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      category: string;
      image: string;
    };
    quantity: number;
    selectedColor: string;
    selectedOption: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  date: string;
  status: 'placed' | 'processing' | 'dispatched' | 'delivered';
}

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'users'>('overview');

  // Core Data States
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Modal / Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    price: 0,
    category: '',
    image: '',
    colors: '',
    storages: '',
    sizes: '',
    isNew: false,
    isBestSeller: false,
    specsRaw: '',
    highlightsRaw: ''
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: ''
  });

  // Fetch all dashboard data
  const fetchAllData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const [pRes, cRes, oRes, uRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!pRes.ok || !cRes.ok || !oRes.ok || !uRes.ok) {
        throw new Error('Failed to retrieve full system metrics.');
      }

      const pData = await pRes.json();
      const cData = await cRes.json();
      const oData = await oRes.json();
      const uData = await uRes.json();

      setProducts(pData);
      setCategories(cData);
      setOrders(oData);
      setUsers(uData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while synchronizing metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  // Handle Toast Messages Helper
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // 1. Overview Calculations
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  // 2. Product Management Handlers
  const handleOpenProductAdd = () => {
    setEditingProduct(null);
    setProductForm({
      id: '',
      name: '',
      price: 0,
      category: categories[0]?.slug || 'phones',
      image: '',
      colors: 'Obsidian, Porcelain, Hazel',
      storages: '128GB, 256GB, 512GB',
      sizes: '',
      isNew: false,
      isBestSeller: false,
      specsRaw: 'Screen: 6.3" Actua Display\nProcessor: Google Tensor G4',
      highlightsRaw: 'Stunning premium design\nLong-lasting smart battery'
    });
    setShowProductModal(true);
  };

  const handleOpenProductEdit = (product: IProduct) => {
    setEditingProduct(product);
    
    // Parse specs back to raw text lines
    const specsLines = Object.entries(product.specs || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      colors: (product.colors || []).join(', '),
      storages: (product.storages || []).join(', '),
      sizes: (product.sizes || []).join(', '),
      isNew: !!product.isNew,
      isBestSeller: !!product.isBestSeller,
      specsRaw: specsLines,
      highlightsRaw: (product.highlights || []).join('\n')
    });
    setShowProductModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setActionLoading(true);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ image: base64 })
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || 'Image upload failed.');
          }

          setProductForm(prev => ({ ...prev, image: data.url }));
          triggerSuccess('Image uploaded and secured successfully.');
        } catch (err: any) {
          setError(err.message || 'Failed to upload image to server.');
        } finally {
          setActionLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file.');
        setActionLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validation
    if (!productForm.id || !productForm.name || !productForm.price || !productForm.image) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      // Parse specs Raw to map
      const specs: Record<string, string> = {};
      productForm.specsRaw.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join(':').trim();
          if (key && val) specs[key] = val;
        }
      });

      const payload = {
        id: productForm.id.trim().toLowerCase().replace(/\s+/g, '-'),
        name: productForm.name,
        price: Number(productForm.price),
        category: productForm.category,
        image: productForm.image,
        colors: productForm.colors.split(',').map(c => c.trim()).filter(Boolean),
        storages: productForm.storages ? productForm.storages.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        sizes: productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        isNew: productForm.isNew,
        isBestSeller: productForm.isBestSeller,
        specs,
        highlights: productForm.highlightsRaw.split('\n').map(h => h.trim()).filter(Boolean),
        rating: editingProduct ? editingProduct.rating : 4.5,
        reviewsCount: editingProduct ? editingProduct.reviewsCount : 0
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Operation failed on products service.');
      }

      triggerSuccess(editingProduct ? 'Product details updated successfully.' : 'Product added successfully.');
      setShowProductModal(false);
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleProductDelete = async (productId: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setActionLoading(true);
      setError(null);

      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete catalog item.');
      }

      triggerSuccess('Product removed successfully.');
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Category Management Handlers
  const handleOpenCategoryAdd = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '' });
    setShowCategoryModal(true);
  };

  const handleOpenCategoryEdit = (cat: ICategory) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, slug: cat.slug });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!categoryForm.name || !categoryForm.slug) {
      setError('Please fill in both Category Name and Slug.');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const payload = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim().toLowerCase().replace(/\s+/g, '-')
      };

      const url = editingCategory ? `/api/categories/${editingCategory.slug}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...payload,
          // support putting slug change parameters inside the body
          newSlug: payload.slug
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Operation failed on categories service.');
      }

      triggerSuccess(editingCategory ? 'Category details updated.' : 'Category created successfully.');
      setShowCategoryModal(false);
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCategoryDelete = async (slug: string) => {
    if (!token || !window.confirm('Deleting this category will affect product listings. Proceed?')) return;

    try {
      setActionLoading(true);
      setError(null);

      const res = await fetch(`/api/categories/${slug}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to delete requested category.');
      }

      triggerSuccess('Category deleted successfully.');
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Order Management Status Handler
  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    if (!token) return;

    try {
      setActionLoading(true);
      setError(null);

      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        throw new Error('Failed to update shipment status.');
      }

      triggerSuccess(`Order ${orderId} updated to ${status}.`);
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 5. User Role Update Handler
  const handleUserRoleUpdate = async (userId: string, currentRole: string) => {
    if (!token) return;
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole.toUpperCase()}?`)) return;

    try {
      setActionLoading(true);
      setError(null);

      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole })
      });

      if (!res.ok) {
        throw new Error('Failed to update credentials.');
      }

      triggerSuccess('User system credentials adjusted successfully.');
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter products based on search & category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.id.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'All' || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="admin-dashboard-page-root" className="min-h-screen bg-neutral-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Refresh bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-neutral-950" />
              <span>PixelMart Management Console</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">Fulfill, edit, and expand the store directory</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="p-2 bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Global Success & Error Notification Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-rose-800">Operational Failure</h4>
                <p className="text-xs text-rose-600 mt-0.5">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-700">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3"
            >
              <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-emerald-800">Success</h4>
                <p className="text-xs text-emerald-600 mt-0.5">{successMsg}</p>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-700">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Navigation Rails */}
        <div className="flex flex-wrap gap-1 border-b border-neutral-200 mb-8 pb-px overflow-x-auto">
          {[
            { id: 'overview', label: 'Console Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Manage Products', icon: Package },
            { id: 'categories', label: 'Manage Categories', icon: Tag },
            { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
            { id: 'users', label: 'System Users', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setError(null);
                }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 text-neutral-900 bg-neutral-100/50 rounded-t-lg'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        {loading ? (
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-24 text-center">
            <Loader2 className="h-10 w-10 text-neutral-400 animate-spin mx-auto mb-4" />
            <p className="text-xs text-neutral-500 font-medium">Downloading administrative records from server...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white border border-neutral-200/85 rounded-2xl p-6 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Gross Turnover</span>
                      <span className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1 block">
                        {formatPrice(totalRevenue)}
                      </span>
                    </div>
                    <div className="h-12 w-12 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-bold">
                      <IndianRupee className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200/85 rounded-2xl p-6 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Fulfillments Logged</span>
                      <span className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1 block">{orders.length}</span>
                    </div>
                    <div className="h-12 w-12 bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-xl flex items-center justify-center font-bold">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200/85 rounded-2xl p-6 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Active Products</span>
                      <span className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1 block">{products.length}</span>
                    </div>
                    <div className="h-12 w-12 bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-xl flex items-center justify-center font-bold">
                      <Package className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200/85 rounded-2xl p-6 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">User Profiles</span>
                      <span className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1 block">{users.length}</span>
                    </div>
                    <div className="h-12 w-12 bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-xl flex items-center justify-center font-bold">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Dashboard Secondary Stats / Info */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Latest Orders */}
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs lg:col-span-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-neutral-900">Recent Shipment Orders</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-xs text-neutral-500 hover:text-neutral-900 font-semibold flex items-center gap-1">
                        <span>All orders</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    {orders.length === 0 ? (
                      <p className="text-xs text-neutral-400 py-6 text-center">No transactions registered yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-neutral-100">
                              <th className="py-2 text-[10px] font-bold text-neutral-400 uppercase">Order</th>
                              <th className="py-2 text-[10px] font-bold text-neutral-400 uppercase">Customer</th>
                              <th className="py-2 text-[10px] font-bold text-neutral-400 uppercase">Fulfillment</th>
                              <th className="py-2 text-[10px] font-bold text-neutral-400 uppercase text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 text-xs">
                            {orders.slice(0, 5).map((order) => (
                              <tr key={order.id}>
                                <td className="py-3 font-semibold text-neutral-900">{order.id}</td>
                                <td className="py-3 text-neutral-500">{order.shippingAddress.fullName}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                                    order.status === 'dispatched' ? 'bg-indigo-50 text-indigo-700' :
                                    order.status === 'processing' ? 'bg-amber-50 text-amber-700' :
                                    'bg-blue-50 text-blue-700'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-3 font-bold text-neutral-900 text-right">{formatPrice(order.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Quick System Diagnostics */}
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs lg:col-span-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 mb-3">Diagnostic Status</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                          <span className="text-xs text-neutral-500">Database Driver</span>
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Mongoose ODM</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                          <span className="text-xs text-neutral-500">Catalog Size</span>
                          <span className="text-xs font-bold text-neutral-800">{products.length} Products</span>
                        </div>
                        <div className="flex items-center justify-between pb-2">
                          <span className="text-xs text-neutral-500">Categories</span>
                          <span className="text-xs font-bold text-neutral-800">{categories.length} Registered</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200/60 rounded-xl text-center">
                      <TrendingUp className="h-5 w-5 text-neutral-400 mx-auto mb-2" />
                      <h4 className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">PixelMart System Status</h4>
                      <p className="text-[10px] text-neutral-400 mt-1">Services running cleanly in production</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
                {/* Search & Action Panel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3 flex-1 max-w-lg">
                    {/* Search Field */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Search model, slug ID, name..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="appearance-none bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2 pr-8 text-xs font-medium text-neutral-700 focus:outline-none"
                      >
                        <option value="All">All Categories</option>
                        {categories.map(c => (
                          <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                      <Filter className="absolute right-3 top-3 h-3 w-3 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    onClick={handleOpenProductAdd}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Product</span>
                  </button>
                </div>

                {/* Products Table */}
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-12 text-center border-t border-neutral-100">No matching devices found in store catalogs.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 text-[10px] font-bold text-neutral-400 uppercase bg-neutral-50/50">
                          <th className="py-3 px-4">Device</th>
                          <th className="py-3 px-4">Ref ID</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 text-right">Price</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-xs">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-neutral-50/40">
                            <td className="py-3.5 px-4 font-semibold text-neutral-900 flex items-center gap-3">
                              <img src={p.image} alt={p.name} className="h-10 w-10 object-contain rounded bg-neutral-50 border border-neutral-150 p-1 shrink-0" referrerPolicy="no-referrer" />
                              <div>
                                <span className="font-bold block text-neutral-900">{p.name}</span>
                                <div className="flex gap-1.5 mt-1">
                                  {p.isNew && <span className="px-1.5 py-0.5 rounded text-[8px] bg-blue-50 text-blue-700 font-bold border border-blue-100">NEW</span>}
                                  {p.isBestSeller && <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-50 text-amber-700 font-bold border border-amber-100">BESTSELLER</span>}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-neutral-500">{p.id}</td>
                            <td className="py-3.5 px-4 capitalize text-neutral-600">{p.category}</td>
                            <td className="py-3.5 px-4 font-bold text-neutral-900 text-right">{formatPrice(p.price)}</td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex gap-1.5">
                                <button
                                  onClick={() => handleOpenProductEdit(p)}
                                  className="p-1.5 hover:bg-neutral-100 border border-transparent hover:border-neutral-200 rounded text-neutral-600 hover:text-neutral-900"
                                  title="Edit"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleProductDelete(p.id)}
                                  className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded text-neutral-400 hover:text-rose-600"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Add/Edit Category panel */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs md:col-span-4">
                  <h3 className="text-sm font-bold text-neutral-900 mb-4">{editingCategory ? 'Edit Category' : 'Create Category'}</h3>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Tablets"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 font-medium text-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Slug Reference URL</label>
                      <input
                        type="text"
                        placeholder="e.g. tablets"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                        className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 font-mono text-neutral-900"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-4 py-2 flex-1 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : editingCategory ? 'Update' : 'Create'}
                      </button>

                      {editingCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(null);
                            setCategoryForm({ name: '', slug: '' });
                          }}
                          className="px-3 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Categories list */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs md:col-span-8">
                  <h3 className="text-sm font-bold text-neutral-900 mb-4">Registered Store Categories</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 text-[10px] font-bold text-neutral-400 uppercase bg-neutral-50/50">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Slug Identifier</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-xs">
                        {categories.map((c) => (
                          <tr key={c.slug} className="hover:bg-neutral-50/40">
                            <td className="py-3 px-4 font-semibold text-neutral-900">{c.name}</td>
                            <td className="py-3 px-4 font-mono text-neutral-500">{c.slug}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex gap-1.5">
                                <button
                                  onClick={() => handleOpenCategoryEdit(c)}
                                  className="p-1 hover:bg-neutral-100 border border-transparent hover:border-neutral-200 rounded text-neutral-600"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleCategoryDelete(c.slug)}
                                  className="p-1 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded text-neutral-400 hover:text-rose-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-neutral-900 mb-4">All Registered Shipment Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-12 text-center">No orders have been submitted yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 text-[10px] font-bold text-neutral-400 uppercase bg-neutral-50/50">
                          <th className="py-3 px-4">Order Ref</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Shipping Destination</th>
                          <th className="py-3 px-4">Purchased Items</th>
                          <th className="py-3 px-4 text-right">Total</th>
                          <th className="py-3 px-4">Fulfillment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-xs">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-neutral-50/40">
                            <td className="py-4 px-4 font-semibold text-neutral-950 align-top">{order.id}</td>
                            <td className="py-4 px-4 text-neutral-500 align-top">{order.date}</td>
                            <td className="py-4 px-4 align-top">
                              <p className="font-semibold text-neutral-900">{order.shippingAddress.fullName}</p>
                              <p className="text-neutral-400 text-[11px] mt-0.5">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                              <p className="text-neutral-400 text-[11px] font-mono">{order.shippingAddress.email}</p>
                            </td>
                            <td className="py-4 px-4 align-top">
                              <div className="space-y-1">
                                {(order.items || []).map((it, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-neutral-600">
                                    <span className="font-semibold text-neutral-900">{it.quantity}x</span>
                                    <span className="truncate max-w-[150px]">{it.product.name}</span>
                                    <span className="text-[10px] text-neutral-400">({it.selectedColor}, {it.selectedOption})</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-bold text-neutral-900 text-right align-top">{formatPrice(order.total)}</td>
                            <td className="py-4 px-4 align-top">
                              <select
                                value={order.status}
                                onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border focus:outline-none ${
                                  order.status === 'delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                  order.status === 'dispatched' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                                  order.status === 'processing' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                  'bg-blue-50 border-blue-200 text-blue-700'
                                }`}
                              >
                                <option value="placed">Placed / Pending</option>
                                <option value="processing">Processing</option>
                                <option value="dispatched">Dispatched / Shipped</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-neutral-900 mb-4">System Accounts & Roles</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 text-[10px] font-bold text-neutral-400 uppercase bg-neutral-50/50">
                        <th className="py-3 px-4">User Details</th>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">System Role</th>
                        <th className="py-3 px-4 text-right">Adjust Credentials</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-neutral-50/40">
                          <td className="py-3.5 px-4 font-semibold text-neutral-950">{u.name}</td>
                          <td className="py-3.5 px-4 font-mono text-neutral-500">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'admin' ? 'bg-neutral-900 text-white' : 'bg-neutral-150 text-neutral-700'
                            }`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleUserRoleUpdate(u._id, u.role)}
                              className="px-3 py-1 bg-white border border-neutral-200 hover:bg-neutral-100 font-semibold text-neutral-700 rounded-lg text-[10px] transition-colors"
                            >
                              Toggle Admin Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* PRODUCT FORM MODAL */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                <h3 className="text-base font-bold text-neutral-900">{editingProduct ? `Edit Device: ${editingProduct.name}` : 'Create Catalog Product'}</h3>
                <button onClick={() => setShowProductModal(false)} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Unique Slug Reference ID (e.g. pixel-9-pro)</label>
                    <input
                      type="text"
                      disabled={!!editingProduct}
                      placeholder="e.g. pixel-9-pro"
                      value={productForm.id}
                      onChange={(e) => setProductForm(prev => ({ ...prev, id: e.target.value }))}
                      className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 font-mono text-neutral-900 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Model Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Pixel 9 Pro"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 font-medium text-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Price (USD)</label>
                    <input
                      type="number"
                      placeholder="e.g. 999"
                      value={productForm.price || ''}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 font-medium text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Store Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 text-neutral-700"
                    >
                      {categories.map(c => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* IMAGE UPLOAD & PREVIEW */}
                <div className="border border-neutral-150 rounded-xl p-4 bg-neutral-50/50">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Device Image</span>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {productForm.image ? (
                      <div className="h-20 w-20 shrink-0 border border-neutral-200 rounded-xl bg-white flex items-center justify-center p-1.5 overflow-hidden">
                        <img src={productForm.image} alt="Form preview" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="h-20 w-20 shrink-0 border-2 border-dashed border-neutral-300 rounded-xl bg-white flex flex-col items-center justify-center text-neutral-400">
                        <Image className="h-6 w-6" />
                        <span className="text-[8px] mt-1 font-semibold uppercase">No Image</span>
                      </div>
                    )}

                    <div className="flex-1 w-full space-y-3">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Image URL</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={productForm.image}
                          onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                          className="px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 font-mono text-neutral-800"
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="px-3 py-1.5 border border-dashed border-neutral-300 hover:border-neutral-400 text-neutral-600 bg-white hover:bg-neutral-50 rounded-lg text-xs font-semibold text-center pointer-events-none flex items-center justify-center gap-1.5">
                          {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Image className="h-3.5 w-3.5" />}
                          <span>Upload Local Image File (Base64)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Colours (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="Obsidian, Hazel, Porcelain"
                      value={productForm.colors}
                      onChange={(e) => setProductForm(prev => ({ ...prev, colors: e.target.value }))}
                      className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Storages (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="128GB, 256GB, 512GB"
                      value={productForm.storages}
                      onChange={(e) => setProductForm(prev => ({ ...prev, storages: e.target.value }))}
                      className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Sizes (Wearables, e.g. 41mm, 45mm)</label>
                    <input
                      type="text"
                      placeholder="41mm, 45mm"
                      value={productForm.sizes}
                      onChange={(e) => setProductForm(prev => ({ ...prev, sizes: e.target.value }))}
                      className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 text-neutral-900"
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isNew}
                      onChange={(e) => setProductForm(prev => ({ ...prev, isNew: e.target.checked }))}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span>Highlight as "NEW"</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isBestSeller}
                      onChange={(e) => setProductForm(prev => ({ ...prev, isBestSeller: e.target.checked }))}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span>Highlight as "BESTSELLER"</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Specs Sheet (Key: Value - One per line)</label>
                    <textarea
                      rows={4}
                      placeholder="Screen: 6.8 inch Super Actua&#10;Processor: Google Tensor G4"
                      value={productForm.specsRaw}
                      onChange={(e) => setProductForm(prev => ({ ...prev, specsRaw: e.target.value }))}
                      className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 font-mono text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">Product Highlights (One bullet per line)</label>
                    <textarea
                      rows={4}
                      placeholder="Pro triple camera system with 5x optical zoom&#10;Advanced AI functionalities out-of-the-box"
                      value={productForm.highlightsRaw}
                      onChange={(e) => setProductForm(prev => ({ ...prev, highlightsRaw: e.target.value }))}
                      className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg w-full focus:outline-none focus:border-neutral-400 text-neutral-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Product Details</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
