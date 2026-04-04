import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    bar: 'bg-emerald-500',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
  },
  error: {
    border: 'border-red-500/40',
    bg: 'bg-red-500/10',
    icon: 'text-red-400',
    bar: 'bg-red-500',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
  },
  warning: {
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    bar: 'bg-amber-500',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
  },
  info: {
    border: 'border-brand-cyan/40',
    bg: 'bg-brand-cyan/10',
    icon: 'text-brand-cyan',
    bar: 'bg-brand-cyan',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.2)]',
  },
};

const ToastItem = ({ toast, onDismiss }) => {
  const style = STYLES[toast.type] || STYLES.info;
  const Icon = ICONS[toast.type] || Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative flex items-start gap-3 w-[360px] max-w-[calc(100vw-2rem)] p-4 rounded-2xl border backdrop-blur-xl overflow-hidden ${style.bg} ${style.border} ${style.glow}`}
      style={{ background: 'rgba(18,18,26,0.85)' }}
    >
      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-[2px] ${style.bar}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
      />

      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${style.icon}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-bold text-white mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm text-gray-300 leading-snug">{toast.message}</p>
        {/* Inline action button (e.g. Retry) */}
        {toast.action && (
          <button
            onClick={() => { toast.action.onClick(); onDismiss(toast.id); }}
            className={`mt-2 text-xs font-black tracking-wide ${style.icon} hover:opacity-80 transition-opacity flex items-center gap-1`}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type, message, options = {}) => {
    const id = ++counterRef.current;
    const duration = options.duration ?? 4000;
    const newToast = { id, type, message, title: options.title, duration };

    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }

    return id;
  }, [dismiss]);

  const api = {
    success: (msg, opts) => toast('success', msg, opts),
    error: (msg, opts) => toast('error', msg, opts),
    warning: (msg, opts) => toast('warning', msg, opts),
    info: (msg, opts) => toast('info', msg, opts),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
