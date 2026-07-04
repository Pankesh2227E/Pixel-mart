/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';

interface ShippingAddress {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, color: string, option: string) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  shippingAddress: ShippingAddress | null;
  saveShippingAddress: (address: ShippingAddress) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pixelmart_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [shippingAddress, setShippingAddressState] = useState<ShippingAddress | null>(() => {
    const saved = localStorage.getItem('pixelmart_shipping_address');
    return saved ? JSON.parse(saved) : null;
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 1. On mount or user change, fetch the user's cart from the MongoDB server
  useEffect(() => {
    const fetchCartFromServer = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.items) {
              setCart(data.items);
            }
            if (data.shippingAddress) {
              setShippingAddressState(data.shippingAddress);
              localStorage.setItem('pixelmart_shipping_address', JSON.stringify(data.shippingAddress));
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load cart from server, using local storage.', err);
      }
    };
    
    fetchCartFromServer();
  }, [token, user]);

  // 2. Persist to localStorage and sync back to the MongoDB server on update
  useEffect(() => {
    localStorage.setItem('pixelmart_cart', JSON.stringify(cart));
    
    if (token) {
      const syncCart = async () => {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items: cart, shippingAddress })
          });
        } catch (err) {
          console.warn('Failed to sync cart on update.', err);
        }
      };
      
      const timer = setTimeout(syncCart, 500);
      return () => clearTimeout(timer);
    }
  }, [cart, token, shippingAddress]);

  const saveShippingAddress = (address: ShippingAddress) => {
    setShippingAddressState(address);
    localStorage.setItem('pixelmart_shipping_address', JSON.stringify(address));
  };

  const addToCart = (product: Product, quantity: number, color: string, option: string) => {
    setCart((prevCart) => {
      // Check if item already exists with exact same color and option
      const existingIdx = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === color &&
          item.selectedOption === option
      );

      if (existingIdx > -1) {
        const newCart = [...prevCart];
        newCart[existingIdx].quantity += quantity;
        return newCart;
      }

      return [...prevCart, { product, quantity, selectedColor: color, selectedOption: option }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart[index].quantity = quantity;
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        shippingAddress,
        saveShippingAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
