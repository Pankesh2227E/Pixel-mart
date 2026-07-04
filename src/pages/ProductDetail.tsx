/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ChevronRight, Plus, Minus, ShieldCheck, ArrowLeft, Package, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(() => PRODUCTS.find((p) => p.id === id));

  // States
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'box'>('overview');

  // Load single product from backend API on ID change
  useEffect(() => {
    const loadSingleProduct = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (err) {
        console.warn('Backend API connection unavailable for single product detail, falling back to local dataset.', err);
      }
    };
    loadSingleProduct();
  }, [id]);

  // Reset page position and selection options on product id change
  useEffect(() => {
    if (product) {
      window.scrollTo(0, 0);
      setSelectedColor(product.colors[0]);
      
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
    addToCart(product, quantity, selectedColor, selectedOption);
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
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-4 right-4 inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-neutral-500 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-150 shadow-xs font-mono">
                100% AUTHENTIC
              </span>
            </div>
            
            {/* Trust Banner under Image */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100/60">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] font-semibold text-neutral-800">Pixel Protection Shield</span>
              </div>
              <span className="text-[9px] text-neutral-500">2-Year Google Warranty Included</span>
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
              <div className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                Free Expedited Shipping
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
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-neutral-150 text-neutral-500 hover:text-neutral-800 rounded-full transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Main Purchase CTA */}
                <button
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-6 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Add to Cart - ${(product.price * quantity).toLocaleString()}</span>
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
                  <h3 className="text-sm font-semibold text-neutral-900">Original Google Stitch Packaging</h3>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
                  Designed with environmental sustainability in mind, the packaging is 100% plastic-free and crafted from recycled fibers.
                </p>
                <ul className="space-y-2 text-xs text-neutral-600 pl-8 list-disc">
                  <li>Google Pixel {product.name.replace('Google Pixel', '')} Device</li>
                  <li>1m USB-C to USB-C Cable (USB 2.0)</li>
                  <li>SIM Tool (where applicable)</li>
                  <li>Quick Start Guide and Safety Instructions</li>
                </ul>
              </div>
            )}
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
