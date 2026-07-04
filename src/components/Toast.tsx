import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast(message, 'error', duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast(message, 'info', duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast(message, 'warning', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let Icon = Info;
            let bgColor = 'bg-neutral-900 border-neutral-850 text-white';
            let iconColor = 'text-blue-400';

            if (toast.type === 'success') {
              Icon = CheckCircle2;
              bgColor = 'bg-white border-emerald-100 text-neutral-900 shadow-xl';
              iconColor = 'text-emerald-500';
            } else if (toast.type === 'error') {
              Icon = AlertCircle;
              bgColor = 'bg-white border-rose-100 text-neutral-900 shadow-xl';
              iconColor = 'text-rose-500';
            } else if (toast.type === 'warning') {
              Icon = AlertTriangle;
              bgColor = 'bg-white border-yellow-100 text-neutral-900 shadow-xl';
              iconColor = 'text-yellow-500';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border ${bgColor} shadow-md`}
              >
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1 text-xs font-medium leading-relaxed">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-0.5 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
