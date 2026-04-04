import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

/**
 * CopyButton — animated copy-to-clipboard button.
 * Props:
 *   text      {string}  — the text to copy
 *   className {string}  — extra class names for the wrapper button
 *   size      {number}  — icon size in px (default 14)
 *   label     {string}  — optional label text shown next to icon
 */
const CopyButton = ({ text, className = '', size = 14, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [text]
  );

  return (
    <motion.button
      onClick={handleCopy}
      whileTap={{ scale: 0.9 }}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border
        ${copied
          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'
        } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Check style={{ width: size, height: size }} />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Copy style={{ width: size, height: size }} />
          </motion.span>
        )}
      </AnimatePresence>
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </motion.button>
  );
};

export default CopyButton;
