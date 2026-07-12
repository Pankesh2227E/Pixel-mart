/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowUpRight, ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  key?: string;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useAuth();

  const isWishlisted = wishlist.includes(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Choose default option and color
    const defaultColor = product.colors[0];
    const defaultOption = product.storages ? product.storages[0] : (product.sizes ? product.sizes[0] : 'Standard');
    
    addToCart(product, 1, defaultColor, defaultOption);
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="group relative bg-white border border-neutral-100 rounded-2xl p-4 flex flex-col h-full overflow-hidden hover:shadow-xl hover:border-neutral-200/60 transition-all duration-300"
    >
      {/* Product Tag Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        {product.isNew && (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100 uppercase tracking-wider">
            New
          </span>
        )}
        {product.isBestSeller && (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 rounded-full border border-amber-100 uppercase tracking-wider">
            Best Seller
          </span>
        )}
      </div>

      {/* Floating Action / Wishlist Heart Icon */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/95 border border-neutral-100 shadow-sm text-neutral-800 hover:scale-110 active:scale-95 transition-all"
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`h-3.5 w-3.5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-500 hover:text-red-500'}`} />
      </button>

      {/* Floating Action / Arrow Icon */}
      <div className="absolute top-14 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <div className="p-1.5 rounded-full bg-neutral-50 border border-neutral-100 text-neutral-800 shadow-sm">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="relative block aspect-square rounded-xl overflow-hidden bg-neutral-50 mb-4 border border-neutral-50">
        <motion.img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </Link>

      {/* Categories & Ratings */}
      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mb-1">
        <span>{product.category}</span>
        <div className="flex items-center text-amber-500 space-x-0.5">
          <Star className="h-3 w-3 fill-current" />
          <span className="text-neutral-700 font-sans font-medium">{product.rating}</span>
          <span className="text-neutral-400">({product.reviewsCount})</span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="flex-1">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-xs font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-1 mb-1 font-sans">
            {product.name}
          </h3>
        </Link>
        <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">
          {product.highlights[0]}
        </p>
      </div>

      {/* Price & Add to Cart button */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-50">
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">Price</span>
          <span className="text-sm font-extrabold text-neutral-900">{formatPrice(product.price)}</span>
        </div>

        <button
          id={`quick-add-${product.id}`}
          onClick={handleQuickAdd}
          className="p-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full shadow-md active:scale-95 transition-all group-hover:scale-105"
          title="Quick add to cart"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
