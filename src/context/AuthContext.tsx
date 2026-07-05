/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  wishlist: string[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  toggleWishlist: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pixelmart_token');
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load wishlist when token or user session changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        // Load offline wishlist from localStorage
        const stored = localStorage.getItem('pixelmart_guest_wishlist');
        setWishlist(stored ? JSON.parse(stored) : []);
        return;
      }

      try {
        const res = await fetch('/api/users/wishlist', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setWishlist(data);
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      }
    };

    fetchWishlist();
  }, [token]);

  // Validate/Load user profile on mount or token change
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          // Map MongoDB _id to id if necessary
          setUser({
            id: userData._id || userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
          });
        } else {
          // Token is invalid/expired
          localStorage.removeItem('pixelmart_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return false;
      }

      localStorage.setItem('pixelmart_token', data.token);
      setToken(data.token);
      setUser({
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });
      setLoading(false);
      return true;
    } catch (err: any) {
      setError('Connection error. Please try again later.');
      setLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError('An account with this email already exists. Please log in or reset your password.');
        } else {
          setError(data.message || 'Registration failed.');
        }
        setLoading(false);
        return false;
      }

      localStorage.setItem('pixelmart_token', data.token);
      setToken(data.token);
      setUser({
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });
      setLoading(false);
      return true;
    } catch (err: any) {
      setError('Connection error. Please try again later.');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('pixelmart_token');
    setToken(null);
    setUser(null);
    setError(null);
    setWishlist([]);
  };

  const clearError = () => {
    setError(null);
  };

  const toggleWishlist = async (productId: string): Promise<void> => {
    if (!token) {
      // Guest mode - toggle in localStorage
      setWishlist((prev) => {
        const updated = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        localStorage.setItem('pixelmart_guest_wishlist', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      const res = await fetch('/api/users/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        wishlist,
        login,
        register,
        logout,
        clearError,
        toggleWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
