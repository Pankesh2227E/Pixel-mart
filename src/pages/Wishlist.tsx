import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist } = useAuth();

  // Retrieve full product details for wishlisted product IDs
  const wishlistedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="border-b border-neutral-100 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Store</span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-950 tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Your saved favorites. They are automatically synced to your account.
          </p>
        </div>
        <div className="text-xs text-neutral-400 font-mono">
          ITEMS SAVED: {wishlist.length}
        </div>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/30">
          <div className="inline-flex p-3 rounded-full bg-neutral-50 border border-neutral-100 text-neutral-400 mb-4">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-950">Your wishlist is empty</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            Tap the heart icon on any product to save it here for later.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full shadow-sm transition-all"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={product.id}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
