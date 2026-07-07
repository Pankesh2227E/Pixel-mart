/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Register() {
  const { user, register, error, clearError, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setLocalError(null);
    clearError();
  };

  // Get the redirect location or fallback to home
  const from = (location.state as any)?.from?.pathname || '/';

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
    return () => {
      clearError();
    };
  }, [user, navigate, from, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const displayError = localError || error;

  return (
    <div id="register-page-container" className="min-h-screen bg-neutral-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Brand Emblem */}
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-neutral-900 text-white mb-4 shadow-md">
            <UserPlus className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Create Account</h2>
          <p className="mt-2 text-xs text-neutral-500">
            Join PixelMart to track your premium tech order deliveries
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white py-8 px-6 border border-neutral-200/80 rounded-2xl shadow-sm sm:px-10"
        >
          {displayError && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <div>{displayError}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
                  placeholder="Alex Smith"
                  value={name}
                  onChange={(e) => handleFieldChange(setName, e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => handleFieldChange(setEmail, e.target.value)}
                  disabled={loading}
                />
              </div>
              {displayError && (displayError.includes('email') || displayError.includes('already exists')) && (
                <div id="duplicate-email-error" className="mt-2 text-rose-600 text-[11px] flex items-start gap-1.5 bg-rose-50/50 border border-rose-100/50 rounded-xl p-2.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500 mt-0.5" />
                  <span>{displayError}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => handleFieldChange(setPassword, e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => handleFieldChange(setConfirmPassword, e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 flex items-center justify-center space-x-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 rounded-full cursor-pointer transition-all focus:outline-none shadow-sm hover:shadow"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-neutral-100 pt-6 text-center">
            <p className="text-xs text-neutral-500">
              Already have an account?{' '}
              <Link
                to="/login"
                state={{ from: location.state?.from }}
                className="font-semibold text-neutral-950 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>

        <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-neutral-400 text-[10px] tracking-wide uppercase">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Secured Connection</span>
        </div>
      </div>
    </div>
  );
}
