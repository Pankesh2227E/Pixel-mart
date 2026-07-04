/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, HelpCircle, ArrowRight } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer id="pixelmart-footer" className="bg-white border-t border-neutral-100">
      {/* Trust Badges */}
      <div className="border-b border-neutral-100 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Truck className="h-5 w-5 text-neutral-800 mb-2" />
              <h4 className="text-xs font-semibold text-neutral-900">Complimentary Shipping</h4>
              <p className="text-[10px] text-neutral-500 mt-1 max-w-[160px]">Free shipping on all premium Pixel devices and accessories</p>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="h-5 w-5 text-neutral-800 mb-2" />
              <h4 className="text-xs font-semibold text-neutral-900">Hassle-Free Returns</h4>
              <p className="text-[10px] text-neutral-500 mt-1 max-w-[160px]">Enjoy easy, no-cost 30-day returns on your orders</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-5 w-5 text-neutral-800 mb-2" />
              <h4 className="text-xs font-semibold text-neutral-900">Official Google Warranty</h4>
              <p className="text-[10px] text-neutral-500 mt-1 max-w-[160px]">100% authentic devices with original brand guarantees</p>
            </div>
            <div className="flex flex-col items-center">
              <HelpCircle className="h-5 w-5 text-neutral-800 mb-2" />
              <h4 className="text-xs font-semibold text-neutral-900">24/7 Premium Support</h4>
              <p className="text-[10px] text-neutral-500 mt-1 max-w-[160px]">Our specialists are always ready to guide your selection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-lg font-sans font-semibold tracking-tight text-neutral-900">
              <span>Pixel</span>
              <span className="font-light text-neutral-500">Mart</span>
              <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
            </Link>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              Experience electronics in their purest form. PixelMart delivers pixel-perfect engineering, seamless responsive designs, and direct integration with your digital ecosystem.
            </p>
            
            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="space-y-2 max-w-sm pt-2">
              <label htmlFor="footer-email" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Stay updated on new releases</label>
              <div className="relative">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 p-1.5 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 active:scale-95 transition-all"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              {subscribed && (
                <p className="text-[10px] font-medium text-emerald-600 animate-fade-in">Thank you! You've successfully subscribed to our newsletter.</p>
              )}
            </form>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Products</h5>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li><Link to="/?category=Phones" className="hover:text-neutral-900 transition-colors">Pixel Phones</Link></li>
              <li><Link to="/?category=Wearables" className="hover:text-neutral-900 transition-colors">Wearables & Watches</Link></li>
              <li><Link to="/?category=Audio" className="hover:text-neutral-900 transition-colors">Pixel Buds & Audio</Link></li>
              <li><Link to="/?category=Accessories" className="hover:text-neutral-900 transition-colors">Official Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Support</h5>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li><a href="#" className="hover:text-neutral-900 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">Track Your Order</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">Delivery & Shipping</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">Returns & Refunds</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Ecosystem</h5>
            <ul className="space-y-2 text-xs text-neutral-500">
              <li><a href="#" className="hover:text-neutral-900 transition-colors">Google Assistant</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">Fitbit Integration</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">Android Ecosystem</a></li>
              <li><a href="#" className="hover:text-neutral-900 transition-colors">Sustainability</a></li>
            </ul>
          </div>

        </div>

        {/* Legal & Footer bottom */}
        <div className="border-t border-neutral-100 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-400 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-1">
            <span>&copy; {new Date().getFullYear()} PixelMart. Built exactly as designed in Google Stitch. All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-neutral-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-neutral-600 transition-colors">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
