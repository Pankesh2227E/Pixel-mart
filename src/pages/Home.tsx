/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowRight, ShieldCheck, Cpu, Camera, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('featured');
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [products, setProducts] = useState<any[]>(PRODUCTS);

  // URL State Synchronizers
  const selectedCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

  // Retrieve products from backend API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.warn('Backend API connection unavailable, falling back to local dataset.', err);
      }
    };
    loadProducts();
  }, []);

  // Rotate Hero banners automatically every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCategorySelect = (category: string) => {
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    searchParams.delete('search'); // Clear search when switching categories
    setSearchParams(searchParams);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  const categories = ['All', 'Phones', 'Wearables', 'Audio', 'Accessories'];

  const heroSlides = [
    {
      title: 'Google Pixel 9 Pro XL',
      subtitle: 'PRO CAMERA. PRO POWER.',
      tag: 'FLAGSHIP DEVICE',
      description: 'The most powerful Pixel yet. Features the revolutionary Google Tensor G4 chip, 16GB of RAM, and our most advanced triple camera system with Gemini-infused features.',
      price: '$1,099',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800',
      link: '/product/pixel-9-pro-xl',
      bgColor: 'bg-neutral-50',
    },
    {
      title: 'Google Pixel Watch 3',
      subtitle: 'COMPREHENSIVE RUN PLANNING.',
      tag: 'NEW REVOLUTION',
      description: 'Discover your potential. Boasts an ultra-bright Actua display, up to 36-hour battery life, and first-of-its-kind Loss of Pulse detection for your peace of mind.',
      price: '$349',
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800',
      link: '/product/pixel-watch-3',
      bgColor: 'bg-neutral-50/70',
    },
    {
      title: 'Google Pixel Buds Pro 2',
      subtitle: 'TWICE THE ACTIVE NOISE CANCELING.',
      tag: 'SMART AUDIO',
      description: 'Built for comfort and supreme audio quality. Powered by the Tensor A1 chip, featuring twist-to-adjust stabilizers and silent seal active noise reduction.',
      price: '$229',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
      link: '/product/pixel-buds-pro-2',
      bgColor: 'bg-neutral-50/40',
    }
  ];

  return (
    <div id="homepage-root" className="min-h-screen bg-white">
      
      {/* 1. Hero Showcase Slider */}
      <section id="hero-slider" className="relative overflow-hidden border-b border-neutral-100 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {heroSlides.map((slide, index) => {
              if (index !== activeHeroSlide) return null;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
                >
                  <div className="space-y-4 max-w-lg">
                    <span className="inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold text-neutral-800 bg-neutral-100 rounded-full border border-neutral-200 uppercase tracking-widest font-mono">
                      {slide.tag}
                    </span>
                    <h1 className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider font-mono">
                      {slide.subtitle}
                    </h1>
                    <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-neutral-900 leading-none">
                      {slide.title}
                    </h2>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {slide.description}
                    </p>
                    <div className="flex items-baseline space-x-2 pt-2">
                      <span className="text-xs text-neutral-400">Starting at</span>
                      <span className="text-xl font-extrabold text-neutral-900">{slide.price}</span>
                    </div>
                    <div className="pt-4 flex items-center space-x-4">
                      <Link
                        to={slide.link}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full shadow-md hover:shadow-lg transition-all"
                      >
                        <span>Explore Specs</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex justify-center md:justify-end relative">
                    <div className="absolute inset-0 bg-radial from-neutral-100/40 to-transparent rounded-full filter blur-xl scale-75 -z-10" />
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-64 w-64 sm:h-80 sm:w-80 object-cover rounded-3xl bg-neutral-50 shadow-md border border-neutral-100 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Slider Pagination Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveHeroSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeHeroSlide === idx ? 'w-6 bg-neutral-800' : 'w-1.5 bg-neutral-200 hover:bg-neutral-350'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Main Store Products & Filters Grid */}
      <section id="store-grid" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Headline section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-100 pb-6 mb-8">
          <div>
            <h2 className="text-lg font-bold text-neutral-950 font-sans tracking-tight">Curated Pixel Store</h2>
            <p className="text-xs text-neutral-400 mt-1">Discover handcrafted white premium electronics engineered for precision and seamless flows.</p>
          </div>

          {/* Quick Stats or Active filters preview */}
          {(selectedCategory !== 'All' || searchQuery) && (
            <div className="mt-2 md:mt-0 flex items-center space-x-2">
              <span className="text-[10px] text-neutral-400 font-mono">ACTIVE FILTERS:</span>
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-semibold text-neutral-700 bg-neutral-50 border border-neutral-150 rounded-full">
                {selectedCategory !== 'All' ? `Category: ${selectedCategory}` : `Search: "${searchQuery}"`}
                <button
                  onClick={() => {
                    searchParams.delete('category');
                    searchParams.delete('search');
                    setSearchParams(searchParams);
                  }}
                  className="ml-1 text-neutral-400 hover:text-neutral-900 font-bold"
                >
                  &times;
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Filters and sorting Row */}
        <div id="filter-sorting-panel" className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
          {/* Categories Tab selector */}
          <div className="flex flex-wrap gap-1.5 bg-neutral-50 p-1.5 rounded-xl border border-neutral-100/60 max-w-full overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/40'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort selection dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto self-stretch sm:self-auto justify-end">
            <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-400" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Dynamic Bento Product Grid */}
        <AnimatePresence mode="popLayout">
          {filteredProducts.length === 0 ? (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center"
            >
              <div className="inline-flex p-3 rounded-full bg-neutral-50 border border-neutral-100 text-neutral-400 mb-4">
                <Filter className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-950">No products found</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">We couldn't find any products matching your active filters. Try resetting to show everything.</p>
              <button
                onClick={() => {
                  searchParams.delete('category');
                  searchParams.delete('search');
                  setSearchParams(searchParams);
                }}
                className="mt-4 inline-flex items-center px-4 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-50 hover:bg-neutral-100 rounded-full border border-neutral-200 shadow-sm transition-all"
              >
                Reset All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 3. Pixel Premium Ecosystem - Brand Features Section */}
      <section id="features-bento" className="bg-neutral-50 border-t border-b border-neutral-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Pixel Innovation</span>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mt-1">Pure Engineering, Seamless Flow</h2>
            <p className="text-xs text-neutral-500 mt-2">Every device is custom-tailored to work in harmony, unlocking premium AI assistance, health insights, and crisp acoustic fidelity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-white border border-neutral-100 p-6 rounded-2xl space-y-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-800 border border-neutral-100">
                <Cpu className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-neutral-950">Google Tensor Silicon</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">Custom chips designed by Google to speed up on-device AI tasks, translate languages on the fly, protect data, and elevate photography.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-neutral-100 p-6 rounded-2xl space-y-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-800 border border-neutral-100">
                <Camera className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-neutral-950">Actua Display Technology</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">Unbelievably bright, vibrant, and sharp screens that adapt dynamically from 1 to 120Hz to preserve battery life while showing crisp details.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-neutral-100 p-6 rounded-2xl space-y-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-800 border border-neutral-100">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-neutral-950">Titan M2 Security</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">Enterprise-grade security architecture that guards your biological scans, passwords, pins, and privacy keys against cyber intrusions.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
