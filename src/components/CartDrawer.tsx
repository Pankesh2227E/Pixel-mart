/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount
  } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay background */}
          <motion.div
            id="cart-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-[2px]"
          />

          {/* Side Drawer Panel */}
          <motion.div
            id="cart-drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-neutral-100"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-neutral-800" />
                <h2 className="text-base font-semibold text-neutral-900 font-sans">Your Cart ({cartCount})</h2>
              </div>
              <button
                id="close-cart-btn"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-50 text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div id="empty-cart-view" className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="h-12 w-12 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 mb-4 border border-neutral-100">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">Your cart is empty</h3>
                  <p className="text-xs text-neutral-500 max-w-[240px] mb-6">Explore our curated collection of premium products to find your perfect fit.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full shadow-sm hover:shadow transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <motion.div
                    key={`${item.product.id}-${item.selectedColor}-${item.selectedOption}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start py-3 border-b border-neutral-50 last:border-0"
                  >
                    {/* Thumbnail */}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-16 w-16 object-cover rounded bg-neutral-50 border border-neutral-100 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    {/* Details */}
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-neutral-900 truncate pr-2">{item.product.name}</h4>
                        <span className="text-xs font-bold text-neutral-900 flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                      
                      {/* Configuration options details */}
                      <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                        Color: <span className="text-neutral-600 font-sans">{item.selectedColor}</span>
                        {item.selectedOption && (
                          <>
                            <span className="mx-1">|</span>
                            Option: <span className="text-neutral-600 font-sans">{item.selectedOption}</span>
                          </>
                        )}
                      </p>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-neutral-200 rounded-full bg-neutral-50">
                          <button
                            onClick={() => updateQuantity(idx, item.quantity - 1)}
                            className="p-1 hover:bg-neutral-150 text-neutral-500 hover:text-neutral-800 transition-colors rounded-l-full"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-mono font-medium text-neutral-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(idx, item.quantity + 1)}
                            className="p-1 hover:bg-neutral-150 text-neutral-500 hover:text-neutral-800 transition-colors rounded-r-full"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(idx)}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary & Proceed */}
            {cart.length > 0 && (
              <div id="cart-drawer-footer" className="p-4 border-t border-neutral-100 bg-neutral-50 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Subtotal</span>
                    <span className="text-neutral-800 font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-neutral-900 border-t border-neutral-200/60 pt-2">
                    <span>Estimated Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <button
                  id="checkout-proceed-btn"
                  onClick={handleCheckoutClick}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <p className="text-[10px] text-center text-neutral-400 font-light">Tax calculated at checkout. Express secure payment options available.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
