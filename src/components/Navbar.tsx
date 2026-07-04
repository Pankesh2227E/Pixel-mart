/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Check, ArrowRight, User, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS } from '../data/products';

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout, wishlist } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof PRODUCTS>([]);
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 1) {
      const filtered = PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchResults([]);
      setIsMobileMenuOpen(false);
    }
  };

  const handleResultClick = (id: string) => {
    navigate(`/product/${id}`);
    setSearchQuery('');
    setSearchResults([]);
    setIsMobileMenuOpen(false);
  };

  return (
    <header id="pixelmart-header" className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link id="navbar-logo" to="/" className="flex items-center space-x-2 text-xl font-sans font-semibold tracking-tight text-neutral-900 hover:opacity-90 transition-opacity">
              <span>Pixel</span>
              <span className="font-light text-neutral-500">Mart</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav id="navbar-desktop-nav" className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Store</Link>
            <Link to="/?category=Phones" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Phones</Link>
            <Link to="/?category=Wearables" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Wearables</Link>
            <Link to="/?category=Audio" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Audio</Link>
            <Link to="/?category=Accessories" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Accessories</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors border-l border-neutral-200 pl-4">Admin Dashboard</Link>
            )}
          </nav>

          {/* Search, Cart & Menu controls */}
          <div className="flex items-center space-x-4">
            
            {/* Search Bar */}
            <form id="navbar-search-form" onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 lg:w-64">
              <input
                id="navbar-search-input"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-8 pr-4 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-full text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition-all"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-400" />
              
              {/* Search results dropdown */}
              {searchResults.length > 0 && (
                <div id="navbar-search-dropdown" className="absolute right-0 mt-2 w-80 bg-white border border-neutral-100 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-neutral-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-50">Suggestions</div>
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleResultClick(product.id)}
                      className="flex items-center px-4 py-2.5 hover:bg-neutral-50 cursor-pointer transition-colors space-x-3"
                    >
                      <img src={product.image} alt={product.name} className="h-8 w-8 object-cover rounded bg-neutral-50 border border-neutral-100" referrerPolicy="no-referrer" />
                      <div className="flex-1 overflow-hidden">
                        <div className="text-xs font-medium text-neutral-900 truncate">{product.name}</div>
                        <div className="text-[10px] text-neutral-500">{product.category}</div>
                      </div>
                      <div className="text-xs font-medium text-neutral-900">${product.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </form>

            {/* Authentication Link */}
            {user ? (
              <Link
                to="/profile"
                className="flex items-center space-x-1 p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-full transition-all text-xs font-semibold"
                title="Go to profile"
              >
                <User className="h-5 w-5 text-neutral-500" />
                <span className="hidden lg:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-full transition-all text-xs font-semibold"
                title="Sign In"
              >
                <User className="h-5 w-5 text-neutral-500" />
                <span className="hidden lg:inline">Sign In</span>
              </Link>
            )}

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-full transition-all"
              title="View wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span id="navbar-wishlist-badge" className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              id="navbar-cart-button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-full transition-all"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span id="navbar-cart-badge" className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="navbar-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-full md:hidden transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div id="navbar-mobile-menu" className="md:hidden border-t border-neutral-100 bg-white px-4 py-3 space-y-3 animate-in fade-in duration-200">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-neutral-100 rounded-lg shadow-lg z-50 overflow-hidden divide-y divide-neutral-50 max-h-60 overflow-y-auto">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleResultClick(product.id)}
                    className="flex items-center p-3 hover:bg-neutral-50 cursor-pointer space-x-3"
                  >
                    <img src={product.image} alt={product.name} className="h-8 w-8 object-cover rounded bg-neutral-50" referrerPolicy="no-referrer" />
                    <div className="flex-1 overflow-hidden">
                      <div className="text-xs font-medium text-neutral-950 truncate">{product.name}</div>
                      <div className="text-[10px] text-neutral-500">${product.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          <nav className="flex flex-col space-y-2 pt-2 pb-1">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-md transition-colors"
            >
              Store Homepage
            </Link>
            <Link
              to="/?category=Phones"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-md transition-colors"
            >
              Phones
            </Link>
            <Link
              to="/?category=Wearables"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-md transition-colors"
            >
              Wearables
            </Link>
            <Link
              to="/?category=Audio"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-md transition-colors"
            >
              Audio
            </Link>
            <Link
              to="/?category=Accessories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-md transition-colors"
            >
              Accessories
            </Link>

            {user ? (
              <>
                <div className="border-t border-neutral-100 my-2 pt-2"></div>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-md transition-colors"
                >
                  <User className="h-4 w-4 text-neutral-500" />
                  <span>Profile ({user.name.split(' ')[0]})</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-md transition-colors text-left cursor-pointer"
                >
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-neutral-100 my-2 pt-2"></div>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 rounded-md transition-colors"
                >
                  <User className="h-4 w-4 text-neutral-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 rounded-md transition-colors"
                >
                  Create Account
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
