/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { OrderDetails } from '../types';

export default function Checkout() {
  const { cart, cartTotal, clearCart, shippingAddress, saveShippingAddress } = useCart();
  const navigate = useNavigate();

  // Address States
  const [fullName, setFullName] = useState(shippingAddress?.fullName || '');
  const [email, setEmail] = useState(shippingAddress?.email || '');
  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || 'United States');

  // Synchronize local states if shippingAddress updates asynchronously (e.g. fetched from backend DB)
  React.useEffect(() => {
    if (shippingAddress) {
      setFullName(prev => prev || shippingAddress.fullName || '');
      setEmail(prev => prev || shippingAddress.email || '');
      setAddress(prev => prev || shippingAddress.address || '');
      setCity(prev => prev || shippingAddress.city || '');
      setPostalCode(prev => prev || shippingAddress.postalCode || '');
      setCountry(prev => prev || shippingAddress.country || 'United States');
    }
  }, [shippingAddress]);

  // Persist local states to cart context/session storage on edit
  React.useEffect(() => {
    saveShippingAddress({
      fullName,
      email,
      address,
      city,
      postalCode,
      country,
    });
  }, [fullName, email, address, city, postalCode, country]);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Coupon and Shipping States
  const [shippingTier, setShippingTier] = useState<'standard' | 'express' | 'overnight'>('standard');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Shipping cost lookup
  const shippingCost = shippingTier === 'standard' ? 0 : shippingTier === 'express' ? 15 : 29;

  // Calculations
  const subtotalWithDiscount = Math.max(0, cartTotal - discountAmount);
  const tax = Math.round(subtotalWithDiscount * 0.08); // 8% tax
  const shipping = appliedCoupon === 'FREESHIP' ? 0 : shippingCost;
  const total = subtotalWithDiscount + tax + shipping;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    
    if (code === 'PIXEL10') {
      const discount = Math.round(cartTotal * 0.10);
      setDiscountAmount(discount);
      setAppliedCoupon(code);
      setCouponSuccess('Success! 10% discount has been applied.');
    } else if (code === 'WELCOME50') {
      if (cartTotal < 100) {
        setCouponError('Requires a minimum purchase of $100.');
        return;
      }
      setDiscountAmount(50);
      setAppliedCoupon(code);
      setCouponSuccess('Success! $50.00 discount has been applied.');
    } else if (code === 'FREESHIP') {
      setDiscountAmount(0);
      setAppliedCoupon(code);
      setCouponSuccess('Success! Free shipping code applied.');
    } else {
      setCouponError('Invalid code. Try PIXEL10, WELCOME50, or FREESHIP.');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid Email is required';
    if (!address.trim()) newErrors.address = 'Shipping Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal Code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!validateForm()) return;

    setIsSubmitting(true);

    const orderPayload = {
      items: cart.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          category: item.product.category,
          image: item.product.image
        },
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedOption: item.selectedOption
      })),
      subtotal: cartTotal,
      tax,
      shipping,
      total,
      shippingAddress: {
        fullName,
        email,
        address,
        city,
        postalCode,
        country,
      },
      paymentMethod: 'Cashfree Online',
    };

    const token = localStorage.getItem('pixelmart_token');

    try {
      const response = await fetch('/api/orders/cashfree-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const data = await response.json();
        const finalOrder = data.order;
        
        // Dynamically load the Cashfree v3 JS SDK
        const loadScript = (): Promise<any> => {
          return new Promise((resolve) => {
            if ((window as any).Cashfree) {
              resolve((window as any).Cashfree);
              return;
            }
            const script = document.createElement('script');
            script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            script.async = true;
            script.onload = () => resolve((window as any).Cashfree);
            document.body.appendChild(script);
          });
        };

        const CashfreeSDK = await loadScript();
        const cashfree = CashfreeSDK({
          mode: 'sandbox'
        });

        // Save order temporary cache
        localStorage.setItem('pixelmart_last_order', JSON.stringify(finalOrder));

        if (data.isSimulated) {
          console.log('⚡ Simulated mode: navigating directly to success page');
          setIsSubmitting(false);
          clearCart();
          navigate(`/success?order_id=${data.order_id}&simulated=true`);
          return;
        }

        // Trigger official Cashfree Checkout redirect
        await cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: '_self'
        });
      } else {
        throw new Error('API server returned error status');
      }
    } catch (err) {
      console.warn('Cashfree payment session initiation failed. Falling back to local storage simulator.', err);
      // Fallback
      const orderId = `PM-${Math.floor(100000 + Math.random() * 900000)}`;
      const fallbackOrder: OrderDetails = {
        id: orderId,
        items: cart,
        subtotal: cartTotal,
        tax,
        shipping,
        total,
        shippingAddress: {
          fullName,
          email,
          address,
          city,
          postalCode,
          country,
        },
        paymentMethod: 'Cashfree Online',
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: 'placed',
      };
      localStorage.setItem('pixelmart_last_order', JSON.stringify(fallbackOrder));
      setIsSubmitting(false);
      clearCart();
      navigate('/success');
    }
  };

  if (cart.length === 0) {
    return (
      <div id="checkout-empty-state" className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-neutral-900">Your Cart is Empty</h2>
        <p className="text-xs text-neutral-500 mt-2">Add some products to your cart before proceeding to checkout.</p>
        <Link to="/" className="mt-6 inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-full">
          <ArrowLeft className="h-3 w-3" />
          <span>Back to Store</span>
        </Link>
      </div>
    );
  }

  return (
    <div id="checkout-root" className="min-h-screen bg-neutral-50/50 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center space-x-3 mb-8">
          <Link to="/" className="p-2 rounded-full bg-white border border-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors shadow-xs">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 font-sans tracking-tight">Express Checkout</h1>
            <p className="text-xs text-neutral-400 mt-0.5">Secure single-screen checkout with 256-bit TLS encryption.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Form sections (8 cols on lg) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Contact & Shipping Information */}
            <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-50 pb-3 flex items-center space-x-2">
                <span className="h-5 w-5 rounded-full bg-neutral-900 text-[10px] font-bold text-white flex items-center justify-center font-mono">1</span>
                <span>Delivery Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="fullname" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Full Name</label>
                  <input
                    id="fullname"
                    type="text"
                    placeholder="E.g., Julian Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 ${
                      errors.fullName ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                    }`}
                  />
                  {errors.fullName && <p className="text-[10px] text-rose-500 font-medium">{errors.fullName}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="email" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="julian@pixelmart.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 ${
                      errors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-rose-500 font-medium">{errors.email}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="address" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Street Address</label>
                  <input
                    id="address"
                    type="text"
                    placeholder="1200 Pixel Blvd, Suite 400"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 ${
                      errors.address ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                    }`}
                  />
                  {errors.address && <p className="text-[10px] text-rose-500 font-medium">{errors.address}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="city" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">City</label>
                  <input
                    id="city"
                    type="text"
                    placeholder="Mountain View"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 ${
                      errors.city ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                    }`}
                  />
                  {errors.city && <p className="text-[10px] text-rose-500 font-medium">{errors.city}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="postalcode" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Postal / ZIP Code</label>
                  <input
                    id="postalcode"
                    type="text"
                    placeholder="94043"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 ${
                      errors.postalCode ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                    }`}
                  />
                  {errors.postalCode && <p className="text-[10px] text-rose-500 font-medium">{errors.postalCode}</p>}
                </div>
              </div>
            </div>

            {/* 2. Shipping Speed selector */}
            <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-50 pb-3 flex items-center space-x-2">
                <span className="h-5 w-5 rounded-full bg-neutral-900 text-[10px] font-bold text-white flex items-center justify-center font-mono">2</span>
                <span>Select Shipping Delivery Speed</span>
              </h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 border rounded-xl bg-neutral-50 cursor-pointer hover:bg-neutral-100/50 transition-all">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="shippingTier"
                      checked={shippingTier === 'standard'}
                      onChange={() => setShippingTier('standard')}
                      className="text-neutral-900 focus:ring-neutral-950"
                    />
                    <div>
                      <div className="text-xs font-semibold text-neutral-950">Standard Delivery</div>
                      <div className="text-[10px] text-neutral-500">Delivered within 3-5 business days.</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Complimentary</span>
                </label>

                <label className="flex items-center justify-between p-3.5 border rounded-xl bg-neutral-50 cursor-pointer hover:bg-neutral-100/50 transition-all">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="shippingTier"
                      checked={shippingTier === 'express'}
                      onChange={() => setShippingTier('express')}
                      className="text-neutral-900 focus:ring-neutral-950"
                    />
                    <div>
                      <div className="text-xs font-semibold text-neutral-950">Express Shipping</div>
                      <div className="text-[10px] text-neutral-500">Delivered within 1-2 business days. Fully tracked.</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-800">+$15.00</span>
                </label>

                <label className="flex items-center justify-between p-3.5 border rounded-xl bg-neutral-50 cursor-pointer hover:bg-neutral-100/50 transition-all">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="shippingTier"
                      checked={shippingTier === 'overnight'}
                      onChange={() => setShippingTier('overnight')}
                      className="text-neutral-900 focus:ring-neutral-950"
                    />
                    <div>
                      <div className="text-xs font-semibold text-neutral-950">Overnight Dispatch</div>
                      <div className="text-[10px] text-neutral-500">Next-day guaranteed delivery. Priority handling.</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-800">+$29.00</span>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Order Summary (5 cols on lg) */}
          <div className="lg:col-span-5 bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm space-y-6 lg:sticky lg:top-24">
            <h2 className="text-sm font-bold text-neutral-950 border-b border-neutral-50 pb-3 font-sans">
              Order Summary
            </h2>

            {/* Cart item listing */}
            <div className="divide-y divide-neutral-50 max-h-56 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.selectedColor}-${item.selectedOption}`} className="flex items-center py-3 space-x-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-12 w-12 object-cover rounded bg-neutral-50 border border-neutral-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-[11px] font-semibold text-neutral-900 truncate">{item.product.name}</h4>
                    <p className="text-[9px] text-neutral-400 font-mono mt-0.5">
                      Qty: {item.quantity} | Finish: {item.selectedColor}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-neutral-900">${item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Promo Code Validation Form */}
            <div className="border-t border-neutral-100 pt-4">
              <div className="text-xs font-semibold text-neutral-800 mb-2">Promotional / Gift Code</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. PIXEL10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-grow px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-800"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-850 rounded-xl transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[10px] text-red-500 font-semibold mt-1.5">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-emerald-600 font-semibold mt-1.5">{couponSuccess}</p>}
              <p className="text-[9px] text-neutral-400 mt-1">Codes: PIXEL10 (10% off), WELCOME50 ($50 off), FREESHIP (Free shipping)</p>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 border-t border-neutral-100 pt-4 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="text-neutral-800 font-medium">${cartTotal}</span>
              </div>
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedCoupon})</span>
                  <span>-${discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>Shipping ({shippingTier === 'standard' ? 'Standard' : shippingTier === 'express' ? 'Express' : 'Overnight'})</span>
                <span className="text-neutral-800 font-medium">
                  {shipping === 0 ? 'Free' : `$${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Estimated Tax (8%)</span>
                <span className="text-neutral-800 font-medium">${tax}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 border-t border-neutral-100 pt-3">
                <span>Order Total</span>
                <span>${total}</span>
              </div>
            </div>

            {/* Lock & Trust badge */}
            <div className="flex items-start space-x-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
              <Lock className="h-4 w-4 text-neutral-500 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-neutral-800">Bank-Grade 256-Bit TLS</span>
                <p className="text-[9px] text-neutral-500 leading-normal">Your payment details are fully masked and processed on secure, tokenized servers.</p>
              </div>
            </div>

            {/* Submit checkout CTA */}
            <button
              id="place-order-btn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center space-x-2 ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isSubmitting ? 'Redirecting to Payment Gateway...' : `Proceed to Payment • $${total}`}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
