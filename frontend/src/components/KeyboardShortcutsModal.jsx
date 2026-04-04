import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  {
    category: 'Upload',
    items: [
      { keys: ['Ctrl', 'V'], desc: 'Paste image from clipboard' },
      { keys: ['Ctrl', 'Enter'], desc: 'Confirm & analyze file preview' },
      { keys: ['Esc'], desc: 'Cancel / clear preview' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { keys: ['Esc'], desc: 'Return to upload from results' },
      { keys: ['Alt', '1'], desc: 'Go to Dashboard tab' },
      { keys: ['Alt', '2'], desc: 'Go to History tab' },
    ],
  },
  {
    category: 'Results',
    items: [
      { keys: ['Ctrl', 'Shift', 'C'], desc: 'Copy current tab content' },
      { keys: ['Ctrl', 'R'], desc: 'Start a new scan' },
    ],
  },
];

const Key = ({ label }) => (
  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-dark-700 border border-white/20 text-xs font-black text-gray-200 shadow-[inset_0_-2px_0_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.08)] font-mono">
    {label}
  </span>
);

/**
 * KeyboardShortcutsModal
 * Props:
 *   open    {boolean}
 *   onClose {() => void}
 */
const KeyboardShortcutsModal = ({ open, onClose }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center p-4"
        style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-md glass rounded-[2rem] p-7 border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            id="btn-shortcuts-close"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-brand-violet-light" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg">Keyboard Shortcuts</h3>
              <p className="text-gray-500 text-xs">Work faster with these power-user shortcuts</p>
            </div>
          </div>

          <div className="space-y-5">
            {SHORTCUTS.map(({ category, items }) => (
              <div key={category}>
                <p className="text-[10px] text-brand-cyan-light font-black uppercase tracking-[0.2em] mb-3">{category}</p>
                <div className="space-y-2">
                  {items.map(({ keys, desc }) => (
                    <div key={desc} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-300">{desc}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {keys.map((k, i) => (
                          <React.Fragment key={k}>
                            <Key label={k} />
                            {i < keys.length - 1 && <span className="text-gray-600 text-xs">+</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600">Press <Key label="Esc" /> to close</p>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default KeyboardShortcutsModal;
