/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ChevronRight, Plus, Minus, ShieldCheck, ArrowLeft, Package, Sparkles, Trash2, Edit, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState<any>(() => PRODUCTS.find((p) => p.id === id));

  // States
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'box'>('overview');
  const [activeImage, setActiveImage] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState('');
  const [editingRating, setEditingRating] = useState(5);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  // Helper to get multiple product images dynamically
  const getProductImages = (prod: any) => {
    if (!prod) return [];
    if (prod.images && prod.images.length > 0) return prod.images;
    const list = [prod.image];
    if (prod.category?.toLowerCase() === 'phones') {
      list.push('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1565849906461-09657302a61e?auto=format&fit=crop&q=80&w=800');
    } else if (prod.category?.toLowerCase() === 'wearables') {
      list.push('https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800');
    } else if (prod.category?.toLowerCase() === 'audio') {
      list.push('https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800');
    } else {
      list.push('https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800');
    }
    return list;
  };

  // Load single product from backend API on ID change
  useEffect(() => {
    const loadSingleProduct = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setActiveImage(data.image);
        }
      } catch (err) {
        console.warn('Backend API connection unavailable for single product detail, falling back to local dataset.', err);
      }
    };
    loadSingleProduct();
    fetchReviews();
  }, [id]);

  // Update page title and description metadata for SEO optimization
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | PixelMart Premium Devices`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Buy the authentic Google ${product.name} at PixelMart. Price: $${product.price}. Specifications: ${Object.entries(product.specs || {}).slice(0, 3).map(([k, v]) => `${k} (${v})`).join(', ')}.`);
      }
    }
  }, [product]);

  // Reset page position and selection options on product id change
  useEffect(() => {
    if (product) {
      window.scrollTo(0, 0);
      setSelectedColor(product.colors[0]);
      setActiveImage(product.image);
      
      const defaultOption = product.storages
        ? product.storages[0]
        : (product.sizes ? product.sizes[0] : 'Standard');
      setSelectedOption(defaultOption);
      
      setQuantity(1);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div id="product-not-found-view" className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-neutral-900">Product Not Found</h2>
        <p className="text-xs text-neutral-500 mt-2">The product you are looking for does not exist or has been removed.</p>
        <Link to="/" className="mt-6 inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-full">
          <ArrowLeft className="h-3 w-3" />
          <span>Back to Store</span>
        </Link>
      </div>
    );
  }

  // Find related products (same category, excluding current product)
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  const handleAddToCart = () => {
    const stock = product.stock !== undefined ? product.stock : 15;
    if (stock <= 0) {
      toast.error('Sorry, this device is currently out of stock.');
      return;
    }
    if (quantity > stock) {
      toast.error(`Sorry, only ${stock} units are available in stock.`);
      return;
    }
    addToCart(product, quantity, selectedColor, selectedOption);
    toast.success(`${product.name} added to cart!`);
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    if (!token) {
      setReviewError('You must be signed in to leave a review.');
      return;
    }
    if (!commentInput.trim()) {
      setReviewError('Review comment cannot be empty.');
      return;
    }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: id,
          rating: ratingInput,
          comment: commentInput
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCommentInput('');
        setRatingInput(5);
        fetchReviews();
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError('Connection error. Please try again later.');
    }
  };

  const handleEditReview = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: id,
          rating: editingRating,
          comment: editingComment
        })
      });
      if (res.ok) {
        setEditingReviewId(null);
        fetchReviews();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to edit review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchReviews();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Color bubble hex color mappings
  const getColorHex = (colorName: string) => {
    const name = colorName.toLowerCase();
    if (name.includes('porcelain') || name.includes('white')) return '#f5f5f0';
    if (name.includes('obsidian') || name.includes('black')) return '#1c1c1e';
    if (name.includes('hazel')) return '#8c8c82';
    if (name.includes('wintergreen') || name.includes('green')) return '#d4ebd4';
    if (name.includes('peony') || name.includes('rose') || name.includes('pink')) return '#ffd9e2';
    return '#e5e5e5';
  };

  return (
    <div id="product-detail-root" className="min-h-screen bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav id="detail-breadcrumbs" className="flex items-center space-x-2 text-xs text-neutral-400 font-medium mb-8">
          <Link to="/" className="hover:text-neutral-700 transition-colors">Store</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/?category=${product.category}`} className="hover:text-neutral-700 transition-colors">{product.category}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-neutral-700 truncate">{product.name}</span>
        </nav>

        {/* Master Details Layout: Product Image vs Configurator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Image with details framing */}
          <div className="space-y-4">
            <div className="aspect-square bg-neutral-50 border border-neutral-100 rounded-3xl overflow-hidden flex items-center justify-center relative">
              <img
                src={activeImage || product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-4 right-4 inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-neutral-500 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-150 shadow-xs font-mono">
                100% AUTHENTIC
              </span>
            </div>

            {/* Thumbnail selector */}
            <div className="flex gap-2.5 overflow-x-auto py-1">
              {getProductImages(product).map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative h-16 w-16 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-neutral-50 transition-all ${
                    (activeImage || product.image) === imgUrl
                      ? 'border-neutral-900 ring-2 ring-neutral-200'
                      : 'border-neutral-200/80 hover:border-neutral-400'
                  }`}
                >
                  <img src={imgUrl} alt={`${product.name} thumbnail ${idx + 1}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
            
            {/* Trust Banner under Image */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100/60">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] font-semibold text-neutral-800">Pixel Protection Shield</span>
              </div>
              <span className="text-[9px] text-neutral-500">2-Year Official Warranty Included</span>
            </div>
          </div>

          {/* Right Column: Title, Ratings, Configurator & CTAs */}
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">{product.category}</span>
              <h1 id="detail-product-title" className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-neutral-900 mt-1 leading-tight">
                {product.name}
              </h1>
              
              {/* Ratings */}
              <div className="flex items-center space-x-3 mt-2">
                <div className="flex items-center text-amber-500 space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-neutral-200'}`} />
                  ))}
                  <span className="text-xs font-bold text-neutral-800 ml-1.5">{product.rating}</span>
                </div>
                <span className="h-3.5 w-px bg-neutral-200" />
                <span className="text-xs text-neutral-500 font-medium">{product.reviewsCount} Customer Reviews</span>
              </div>
            </div>

            {/* Price section */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100/60 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">Purchase Price</span>
                <div className="text-2xl font-extrabold text-neutral-900 mt-0.5">${product.price}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                  Free Expedited Shipping
                </span>
                <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${
                  (product.stock !== undefined ? product.stock : 15) === 0
                    ? 'text-rose-600 bg-rose-50 border-rose-150'
                    : (product.stock !== undefined ? product.stock : 15) <= 5
                    ? 'text-red-600 bg-red-50 border-red-150'
                    : 'text-emerald-600 bg-emerald-50 border-emerald-150'
                }`}>
                  {(product.stock !== undefined ? product.stock : 15) === 0
                    ? `🔴 OUT OF STOCK`
                    : (product.stock !== undefined ? product.stock : 15) <= 5
                    ? `⚠️ Only ${(product.stock !== undefined ? product.stock : 15)} LEFT - ORDER SOON`
                    : `🟢 IN STOCK (${(product.stock !== undefined ? product.stock : 15)} UNITS)`
                  }
                </span>
              </div>
            </div>

            {/* Product Configuration details */}
            <div className="space-y-4 pt-2">
              {/* Color Picker */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-500">Finish / Color:</span>
                  <span className="text-neutral-900">{selectedColor}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: getColorHex(color) }}
                      className={`h-7 w-7 rounded-full border-2 transition-all relative ${
                        selectedColor === color
                          ? 'border-neutral-900 scale-110 shadow-md ring-2 ring-neutral-200'
                          : 'border-neutral-200/60 hover:border-neutral-400'
                      }`}
                      title={color}
                      aria-label={`Select color ${color}`}
                    >
                      {/* Inner dot indicator if very light color to keep border visible */}
                      {color.toLowerCase() === 'porcelain' && (
                        <span className="absolute inset-0.5 rounded-full border border-neutral-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option Selector (Storage for Phones/Tablets, Sizes for Watch) */}
              {(product.storages || product.sizes) && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-neutral-500">
                    {product.storages ? 'Storage Capacity:' : 'Case Diameter / Fit:'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(product.storages || product.sizes || []).map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedOption(option)}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                          selectedOption === option
                            ? 'bg-neutral-900 border-neutral-900 text-white shadow'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-4">
                {/* Quantity adjustments */}
                <div className="flex items-center border border-neutral-200 rounded-full bg-neutral-50 px-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-neutral-150 text-neutral-500 hover:text-neutral-800 rounded-full transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-4 text-xs font-semibold font-mono text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => {
                      const maxStock = product.stock !== undefined ? product.stock : 15;
                      return prev < maxStock ? prev + 1 : prev;
                    })}
                    className="p-2 hover:bg-neutral-150 text-neutral-500 hover:text-neutral-800 rounded-full transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Main Purchase CTA */}
                <button
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={(product.stock !== undefined ? product.stock : 15) === 0}
                  className="flex-1 py-3 px-6 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed rounded-full shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{(product.stock !== undefined ? product.stock : 15) === 0 ? 'Out of Stock' : `Add to Cart - $${(product.price * quantity).toLocaleString()}`}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Specs, Overview, What's in the box Tabs */}
        <section id="specs-tabs" className="mt-16 border-t border-neutral-100 pt-10">
          <div className="flex space-x-6 border-b border-neutral-100 pb-3 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`text-sm font-semibold pb-3 border-b-2 transition-all ${
                activeTab === 'overview'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`text-sm font-semibold pb-3 border-b-2 transition-all ${
                activeTab === 'specs'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Technical Specs
            </button>
            <button
              onClick={() => setActiveTab('box')}
              className={`text-sm font-semibold pb-3 border-b-2 transition-all ${
                activeTab === 'box'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-900'
              }`}
            >
              What's in the Box
            </button>
          </div>

          <div className="max-w-3xl">
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest font-mono">Product Highlights</h3>
                <ul className="space-y-3">
                  {product.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start text-xs text-neutral-600 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 mr-3 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="border border-neutral-100 rounded-2xl overflow-hidden divide-y divide-neutral-100 animate-in fade-in duration-200">
                {Object.entries(product.specs).map(([label, val]) => (
                  <div key={label} className="grid grid-cols-1 sm:grid-cols-3 p-4 text-xs">
                    <span className="font-semibold text-neutral-900 uppercase font-mono tracking-wider text-[10px]">{label}</span>
                    <span className="sm:col-span-2 text-neutral-600 mt-1 sm:mt-0 leading-relaxed">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'box' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center space-x-3 text-neutral-800 mb-2">
                  <Package className="h-5 w-5" />
                  <h3 className="text-sm font-semibold text-neutral-900">Original Brand Packaging</h3>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
                  Designed with environmental sustainability in mind, the packaging is 100% plastic-free and crafted from recycled fibers.
                </p>
                <ul className="space-y-2 text-xs text-neutral-600 pl-8 list-disc">
                  <li>{product.name} Device</li>
                  <li>1m USB-C to USB-C Cable (USB 2.0)</li>
                  <li>SIM Tool (where applicable)</li>
                  <li>Quick Start Guide and Safety Instructions</li>
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews-section" className="mt-20 border-t border-neutral-100 pt-12">
          <div className="border-b border-neutral-100 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">User Feedback</span>
              <h2 className="text-xl font-bold text-neutral-950 tracking-tight mt-0.5 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-neutral-500" />
                Customer Reviews ({reviews.length})
              </h2>
            </div>
            {/* Average score */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-100">
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <span className="text-xs font-bold text-neutral-900">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} / 5.0
                </span>
                <span className="text-[10px] text-neutral-500 font-medium">average score</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Left side: Review Form */}
            <div className="bg-neutral-50/50 p-6 rounded-2xl border border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-950 mb-1.5">Share Your Experience</h3>
              <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
                Only verified purchasers can leave reviews. Your rating helps our community.
              </p>

              {token ? (
                <form onSubmit={handlePostReview} className="space-y-4">
                  {/* Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-700">Overall Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          className="text-neutral-300 hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`h-6 w-6 transition-all ${
                              star <= ratingInput ? 'text-amber-500 fill-amber-500 scale-105' : 'text-neutral-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-700">Review Message</label>
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="What did you like or dislike about this product? How is the quality?"
                      rows={4}
                      className="w-full text-xs p-3 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                    />
                  </div>

                  {reviewError && (
                    <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 leading-relaxed">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{reviewError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-850 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    You must be signed in to submit a review for this product.
                  </p>
                  <Link
                    to="/login"
                    className="mt-4 inline-flex items-center justify-center w-full py-2 px-4 text-xs font-semibold text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Right side: Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-neutral-200 rounded-2xl">
                  <p className="text-xs text-neutral-400">No customer reviews yet. Be the first to share yours!</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="pt-6 first:pt-0 space-y-2">
                      {/* Review header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* Stars */}
                          <div className="flex items-center text-amber-500 space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating ? 'fill-current' : 'text-neutral-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-neutral-950">{review.userName}</span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Verified Purchaser
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {new Date(review.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>

                      {/* Editing state vs display state */}
                      {editingReviewId === review._id ? (
                        <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-150 mt-2">
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditingRating(star)}
                                className="text-neutral-300 hover:text-amber-400 transition-colors"
                              >
                                <Star
                                  className={`h-4 w-4 ${
                                    star <= editingRating ? 'text-amber-500 fill-amber-500' : 'text-neutral-200'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editingComment}
                            onChange={(e) => setEditingComment(e.target.value)}
                            rows={3}
                            className="w-full text-xs p-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-none"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setEditingReviewId(null)}
                              className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleEditReview(review._id)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-600 leading-relaxed pl-1">
                          {review.comment}
                        </p>
                      )}

                      {/* Action buttons (only show if author or admin) */}
                      {(review.userId === user?.id || review.userId === (user as any)?._id || user?.role === 'admin') && editingReviewId !== review._id && (
                        <div className="flex items-center gap-3 pl-1 text-[10px] text-neutral-400 font-semibold mt-1">
                          <button
                            onClick={() => {
                              setEditingReviewId(review._id);
                              setEditingComment(review.comment);
                              setEditingRating(review.rating);
                            }}
                            className="inline-flex items-center gap-1 hover:text-neutral-800 transition-colors cursor-pointer"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit Review</span>
                          </button>
                          <span className="h-2 w-px bg-neutral-200" />
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="inline-flex items-center gap-1 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products recommendations */}
        {relatedProducts.length > 0 && (
          <section id="related-products" className="mt-20 border-t border-neutral-100 pt-12">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Complete Your Setup</span>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight mt-0.5">Recommended Add-ons</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
