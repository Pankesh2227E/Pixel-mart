import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div id="not-found-page" className="min-h-screen bg-neutral-50/50 flex flex-col justify-center items-center px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md space-y-6 bg-white p-8 border border-neutral-200/80 rounded-2xl shadow-sm"
      >
        <span className="font-mono text-5xl font-extrabold text-neutral-800 tracking-wider">404</span>
        
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">Page Not Found</h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="border-t border-neutral-100 pt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Go to Store</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2.5 bg-white border border-neutral-250 hover:bg-neutral-50 text-neutral-700 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
