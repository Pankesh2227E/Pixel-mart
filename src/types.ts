/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  colors: string[];
  storages?: string[];
  sizes?: string[];
  rating: number;
  reviewsCount: number;
  specs: Record<string, string>;
  highlights: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedOption: string; // size or storage
}

export interface OrderDetails {
  id: string;
  items: CartItem[];
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

