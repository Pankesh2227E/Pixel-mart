/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Home, ArrowRight, ShieldCheck, Mail, Calendar, CreditCard, Box, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { OrderDetails } from '../types';
import { formatPrice } from '../utils/currency';

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderIdParam = params.get('order_id');

    if (orderIdParam) {
      setIsVerifying(true);
      setVerificationError(null);

      // Verify payment with the server securely
      fetch('/api/orders/cashfree-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: orderIdParam })
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Verification request failed');
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            setOrder(data.order);
            localStorage.setItem('pixelmart_last_order', JSON.stringify(data.order));
          } else {
            setVerificationError('Your Cashfree transaction could not be verified securely. Please verify your payment details or contact support.');
          }
          setIsVerifying(false);
        })
        .catch((err) => {
          console.error('Error verifying order payment status:', err);
          setVerificationError('An error occurred while communicating with the verification API. Please reload to retry.');
          setIsVerifying(false);
        });
    } else {
      // Read the cached order from local storage
      const saved = localStorage.getItem('pixelmart_last_order');
      if (saved) {
        setOrder(JSON.parse(saved));
      }
    }

    // Advance order status timeline simulation
    const timer1 = setTimeout(() => setActiveStep(1), 3500);
    const timer2 = setTimeout(() => setActiveStep(2), 8500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.search]);

  if (isVerifying) {
    return (
      <div id="success-verifying-root" className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="relative flex justify-center">
            <div className="h-16 w-16 rounded-full border-4 border-neutral-200 border-t-neutral-900 animate-spin" />
            <ShieldCheck className="h-6 w-6 text-neutral-900 absolute top-5" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">Verifying Payment Securely</h2>
          <p className="text-xs text-neutral-500">
            Please wait while we establish a secure connection with Cashfree to finalize your transaction details...
          </p>
        </div>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div id="success-error-root" className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-white border border-rose-100 p-8 rounded-2xl shadow-sm text-center space-y-5 max-w-md">
          <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600">
            <CheckCircle2 className="h-10 w-10 rotate-45 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">Payment Verification Failed</h2>
          <p className="text-xs text-rose-600 font-medium">
            {verificationError}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <Link to="/checkout" className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors">
              Go back to Checkout
            </Link>
            <Link to="/" className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors">
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div id="success-no-order" className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-neutral-900">No Recent Orders Found</h2>
        <p className="text-xs text-neutral-500 mt-2">You haven't placed an order in this session.</p>
        <Link to="/" className="mt-6 inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-full">
          <Home className="h-3 w-3" />
          <span>Go to Store</span>
        </Link>
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', desc: 'Securely authorized', icon: CheckCircle2 },
    { label: 'Processing', desc: 'Prepping at Mountain View warehouse', icon: Box },
    { label: 'Dispatched', desc: 'Handed to premium courier', icon: Truck },
    { label: 'Delivered', desc: 'Estimated delivery: 2 business days', icon: Home }
  ];

  return (
    <div id="success-page-root" className="min-h-screen bg-neutral-50/50 py-12 sm:py-20 relative overflow-hidden">
      
      {/* Interactive Framer Motion Confetti Streamers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 1,
              y: -20,
              x: Math.random() * 1200 - 100,
              rotate: 0,
              scale: Math.random() * 0.4 + 0.6
            }}
            animate={{
              opacity: 0,
              y: 800,
              rotate: Math.random() * 360,
              x: '+=' + (Math.random() * 100 - 50)
            }}
            transition={{
              duration: Math.random() * 2.5 + 2,
              ease: 'easeOut',
              delay: Math.random() * 0.5
            }}
            style={{
              position: 'absolute',
              width: '8px',
              height: '16px',
              borderRadius: '2px',
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5]
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Animated Headline badge */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="inline-flex p-3 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 mb-2 shadow-xs"
          >
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </motion.div>
          
          <h1 id="success-headline" className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight font-sans">
            Payment Securely Authorized
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Thank you, <span className="font-semibold text-neutral-800">{order.shippingAddress.fullName}</span>! Your order has been registered under <span className="font-mono font-bold text-neutral-800">{order.id}</span>. An invoice receipt has been dispatched to <span className="font-semibold text-neutral-800">{order.shippingAddress.email}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Delivery tracker (7 cols on md) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Interactive Timeline Progress */}
            <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest font-mono">Live Delivery Tracker</h3>
              
              <div className="relative pl-6 border-l border-neutral-100 space-y-8 py-1">
                {steps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isDone = idx <= activeStep;
                  const isCurrent = idx === activeStep;

                  return (
                    <div key={step.label} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isDone
                          ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm scale-110'
                          : 'bg-white border-neutral-200 text-neutral-400'
                      }`}>
                        {isDone && <CheckCircle2 className="h-2 w-2 text-white fill-current" />}
                      </span>

                      {/* Content details */}
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-xs font-semibold ${isDone ? 'text-neutral-900' : 'text-neutral-400'}`}>{step.label}</h4>
                          {isCurrent && (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-sm uppercase tracking-wider animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 leading-normal">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipment details summary */}
            <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest font-mono border-b border-neutral-50 pb-3">Delivery Information</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block font-semibold text-[10px] uppercase tracking-wider font-mono">Shipped To</span>
                  <span className="text-neutral-800 font-medium block mt-1">{order.shippingAddress.fullName}</span>
                  <span className="text-neutral-500 block mt-0.5">{order.shippingAddress.address}</span>
                  <span className="text-neutral-500 block">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</span>
                  <span className="text-neutral-500 block">{order.shippingAddress.country}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-semibold text-[10px] uppercase tracking-wider font-mono">Courier service</span>
                  <span className="text-neutral-800 font-medium block mt-1">PixelMart Premium Express Courier</span>
                  <span className="text-neutral-500 block mt-0.5">Service: Insured Priority</span>
                  <span className="text-neutral-500 block">ETA: 2 Business Days</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Complete Invoice Receipt (5 cols on md) */}
          <div className="md:col-span-5 bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-widest font-mono border-b border-neutral-50 pb-3">Digital Receipt</h3>
            
            {/* Meta details */}
            <div className="space-y-2 text-[11px] text-neutral-500 font-medium border-b border-neutral-50 pb-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center"><Mail className="h-3 w-3 text-neutral-400 mr-2" /> Order ID</span>
                <span className="font-mono font-bold text-neutral-800">{order.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center"><Calendar className="h-3 w-3 text-neutral-400 mr-2" /> Date</span>
                <span className="text-neutral-800">{order.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center"><CreditCard className="h-3 w-3 text-neutral-400 mr-2" /> Method</span>
                <span className="text-neutral-800 font-mono text-[10px]">{order.paymentMethod}</span>
              </div>
            </div>

            {/* List items bought */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {order.items.map((item) => (
                <div key={`${item.product.id}-${item.selectedColor}-${item.selectedOption}`} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-50 last:border-0">
                  <div className="overflow-hidden mr-2">
                    <span className="text-neutral-900 font-semibold truncate block">{item.product.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                      Finish: {item.selectedColor} | Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-neutral-900 flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Totals breakdown */}
            <div className="space-y-2 border-t border-neutral-50 pt-4 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="text-neutral-800 font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Tax</span>
                <span className="text-neutral-800 font-medium">{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-neutral-900 border-t border-neutral-100 pt-3">
                <span>Total Charge</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Shield banner */}
            <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center space-x-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="text-[10px] font-medium text-neutral-600">Your order is insured with full buyer protection.</span>
            </div>

            {/* Back to store */}
            <Link
              to="/"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <span>Return to Store Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
