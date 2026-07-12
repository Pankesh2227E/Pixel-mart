/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { User, LogOut, Package, MapPin, Calendar, CreditCard, Tag, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/currency';

interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
  };
  quantity: number;
  selectedColor: string;
  selectedOption: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  date: string;
  status: 'placed' | 'processing' | 'dispatched' | 'delivered';
}

export default function Profile() {
  const { user, token, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      setLoadingOrders(true);
      setErrorOrders(null);
      const response = await fetch('/api/orders/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setErrorOrders('Failed to load your order history.');
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setErrorOrders('Unable to connect to server. Showing local simulation fallback if any.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Status badge styling helper
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-50 border border-blue-100 text-blue-700';
      case 'processing':
        return 'bg-amber-50 border border-amber-100 text-amber-700';
      case 'dispatched':
        return 'bg-indigo-50 border border-indigo-100 text-indigo-700';
      case 'delivered':
        return 'bg-emerald-50 border border-emerald-100 text-emerald-700';
      default:
        return 'bg-neutral-50 border border-neutral-100 text-neutral-700';
    }
  };

  return (
    <div id="profile-page-root" className="min-h-screen bg-neutral-50/50 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header Block */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-inner">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">{user?.name}</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 border border-neutral-200 text-neutral-600 capitalize">
                  {user?.role || 'User'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{user?.email}</p>
              
              <div className="flex items-center gap-4 mt-3 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Member Account Verified</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={logout}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>

        {/* Orders List Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Your Order History</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Manage and track your PixelMart shipments</p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loadingOrders}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 border border-transparent hover:border-neutral-200 transition-all disabled:opacity-50"
              title="Refresh order list"
            >
              <RefreshCw className={`h-4 w-4 ${loadingOrders ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingOrders ? (
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-16 text-center">
              <Loader2 className="h-8 w-8 text-neutral-400 animate-spin mx-auto mb-3" />
              <p className="text-xs text-neutral-500 font-medium">Fetching orders from MongoDB...</p>
            </div>
          ) : errorOrders ? (
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-12 text-center">
              <p className="text-xs text-neutral-500 mb-4">{errorOrders}</p>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors"
              >
                Retry Fetch
              </button>
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-neutral-200/80 rounded-2xl p-12 text-center"
            >
              <Package className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-neutral-900">No Orders Yet</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed">
                You haven't placed any premium orders on this account yet. Discover the latest Pixel devices!
              </p>
              <Link
                to="/"
                className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors"
              >
                <span>Browse Devices</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white border border-neutral-200/85 rounded-2xl overflow-hidden shadow-xs"
                >
                  {/* Order Card Header */}
                  <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">Order Reference</span>
                        <span className="text-xs font-bold text-neutral-900">{order.id}</span>
                      </div>
                      <div className="border-l border-neutral-200 h-6 hidden sm:block"></div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">Date Placed</span>
                        <span className="text-xs font-medium text-neutral-600">
                          {new Date(order.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-xs font-bold text-neutral-950">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Order Details Body */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Items List */}
                    <div className="lg:col-span-7 space-y-4">
                      <h4 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Purchased Items</h4>
                      <div className="divide-y divide-neutral-100">
                        {order.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="h-12 w-12 rounded-lg bg-neutral-50 border border-neutral-100 object-contain p-1"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-neutral-900 truncate">{item.product.name}</h5>
                              <p className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-2">
                                <span className="flex items-center gap-1 capitalize">
                                  <span className="w-2.5 h-2.5 rounded-full border border-neutral-200" style={{ backgroundColor: item.selectedColor }} />
                                  {item.selectedColor}
                                </span>
                                <span>•</span>
                                <span>{item.selectedOption}</span>
                                <span>•</span>
                                <span>Qty {item.quantity}</span>
                              </p>
                            </div>
                            <div className="text-xs font-bold text-neutral-700">
                              {formatPrice(item.product.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Divider for Layout */}
                    <div className="lg:col-span-1 border-r border-neutral-150/50 hidden lg:block"></div>

                    {/* Shipping Address and Payment Info */}
                    <div className="lg:col-span-4 space-y-4">
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>Shipping Destination</span>
                        </h4>
                        <div className="text-xs text-neutral-600 leading-relaxed space-y-0.5">
                          <p className="font-semibold text-neutral-900">{order.shippingAddress.fullName}</p>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-100">
                        <h4 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2 flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          <span>Payment Method</span>
                        </h4>
                        <p className="text-xs text-neutral-700 font-medium">
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
