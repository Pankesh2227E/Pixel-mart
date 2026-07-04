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
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Address States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculations
  const tax = Math.round(cartTotal * 0.08); // 8% mock tax
  const shipping = 0; // Free shipping
  const total = cartTotal + tax + shipping;

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Format Card Expiry (adds slash MM/YY)
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);

    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Format CVV (limits to 3 digits)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCardCvv(value);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid Email is required';
    if (!address.trim()) newErrors.address = 'Shipping Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal Code is required';

    if (paymentMethod === 'credit-card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length !== 16) newErrors.cardNumber = 'Provide a valid 16-digit card';
      if (!cardExpiry.includes('/') || cardExpiry.length !== 5) newErrors.cardExpiry = 'Format must be MM/YY';
      if (cardCvv.length !== 3) newErrors.cardCvv = 'Provide a 3-digit CVV';
    }

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
      paymentMethod: paymentMethod === 'credit-card' ? 'Visa •••• ' + cardNumber.slice(-4) : 'Google Pay',
    };

    const token = localStorage.getItem('pixelmart_token');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const data = await response.json();
        const finalOrder = data.order || {
          id: `PM-${Math.floor(100000 + Math.random() * 900000)}`,
          ...orderPayload,
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          status: 'placed'
        };
        localStorage.setItem('pixelmart_last_order', JSON.stringify(finalOrder));
      } else {
        throw new Error('API server returned error status');
      }
    } catch (err) {
      console.warn('Backend connection issue or order creation failed. Falling back to local storage simulator.', err);
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
        paymentMethod: paymentMethod === 'credit-card' ? 'Visa •••• ' + cardNumber.slice(-4) : 'Google Pay',
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: 'placed',
      };
      localStorage.setItem('pixelmart_last_order', JSON.stringify(fallbackOrder));
    } finally {
      setIsSubmitting(false);
      clearCart();
      navigate('/success');
    }
  };

  // Detect card issuer
  const getCardType = () => {
    if (cardNumber.startsWith('4')) return 'Visa';
    if (cardNumber.startsWith('5')) return 'Mastercard';
    return 'Credit Card';
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

            {/* 2. Payment Method Info */}
            <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-50 pb-3 flex items-center space-x-2">
                <span className="h-5 w-5 rounded-full bg-neutral-900 text-[10px] font-bold text-white flex items-center justify-center font-mono">2</span>
                <span>Payment Information</span>
              </h2>

              {/* Express selector tabs */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-neutral-50 rounded-xl border border-neutral-100">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit-card')}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                    paymentMethod === 'credit-card'
                      ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/40'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Debit / Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('google-pay')}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                    paymentMethod === 'google-pay'
                      ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/40'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span className="font-sans font-bold italic tracking-tighter text-neutral-800">
                    <span className="text-blue-600">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">o</span>
                    <span className="text-blue-500">g</span>
                    <span className="text-green-500">l</span>
                    <span className="text-red-500">e</span> Pay
                  </span>
                </button>
              </div>

              {/* Payment details */}
              {paymentMethod === 'credit-card' ? (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-150 relative overflow-hidden flex flex-col justify-between h-36 max-w-sm mx-auto shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-400">PixelMart Card</span>
                      <span className="text-[11px] font-bold text-neutral-700 italic font-sans">{getCardType()}</span>
                    </div>
                    <div className="text-sm font-mono tracking-widest text-neutral-800 my-2">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-mono">Cardholder</span>
                        <div className="text-[10px] font-semibold text-neutral-700 font-sans truncate max-w-[160px]">{fullName || 'Julian Vance'}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-mono">Expiry</span>
                        <div className="text-[10px] font-semibold text-neutral-700 font-mono">{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label htmlFor="cardnumber" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Card Number</label>
                      <input
                        id="cardnumber"
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 ${
                          errors.cardNumber ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                        }`}
                      />
                      {errors.cardNumber && <p className="text-[10px] text-rose-500 font-medium">{errors.cardNumber}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="expiry" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Expiry (MM/YY)</label>
                      <input
                        id="expiry"
                        type="text"
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 ${
                          errors.cardExpiry ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                        }`}
                      />
                      {errors.cardExpiry && <p className="text-[10px] text-rose-500 font-medium">{errors.cardExpiry}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="cvv" className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">CVV Code</label>
                      <input
                        id="cvv"
                        type="password"
                        placeholder="***"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 ${
                          errors.cardCvv ? 'border-rose-400 focus:ring-rose-400' : 'border-neutral-200'
                        }`}
                      />
                      {errors.cardCvv && <p className="text-[10px] text-rose-500 font-medium">{errors.cardCvv}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-50 rounded-xl border border-neutral-100 space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-white border border-neutral-100 text-emerald-600 shadow-sm">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-semibold text-neutral-900">Google Pay Express Setup</h4>
                  <p className="text-[10px] text-neutral-500 max-w-xs mx-auto">We will retrieve your saved credit cards and shipping details directly from Google. No forms required.</p>
                </div>
              )}
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

            {/* Price breakdown */}
            <div className="space-y-2 border-t border-neutral-100 pt-4 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="text-neutral-800 font-medium">${cartTotal}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Estimated Tax (8%)</span>
                <span className="text-neutral-800 font-medium">${tax}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Complimentary Shipping</span>
                <span className="text-emerald-600 font-semibold">Free</span>
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
              <span>{isSubmitting ? 'Authorizing Transactions...' : `Authorize & Pay $${total}`}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
