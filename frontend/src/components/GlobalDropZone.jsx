import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, ClipboardPaste } from 'lucide-react';

/**
 * GlobalDropZone
 * Wraps the entire app. Handles:
 *  1. Full-page drag-over → shows cinematic drop overlay
 *  2. Ctrl+V paste → extracts image from clipboard
 *
 * Props:
 *   onFile(file) — called with the dropped/pasted File
 *   enabled      — only active when upload state is 'idle'
 */
const GlobalDropZone = ({ children, onFile, enabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const dragCounter = React.useRef(0);

  // Pre-compute particle positions once (stable across renders)
  const particles = useMemo(() =>
    [...Array(6)].map(() => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      duration: 1.5 + Math.random(),
      delay: Math.random() * 0.8,
      left: `${20 + Math.random() * 60}%`,
      top: `${20 + Math.random() * 60}%`,
    })),
  []);

  // ── Global drag listeners ──────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const onDragEnter = (e) => {
      e.preventDefault();
      dragCounter.current++;
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDragging(true);
      }
    };
    const onDragLeave = (e) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current === 0) setIsDragging(false);
    };
    const onDragOver = (e) => { e.preventDefault(); };
    const onDrop = (e) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
        onFile(file);
      }
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [enabled, onFile]);

  // ── Global paste listener ──────────────────────────────────────────────────
  const handlePaste = useCallback(
    (e) => {
      if (!enabled) return;
      // Don't intercept paste inside text inputs/textareas
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const items = Array.from(e.clipboardData?.items || []);
      const imageItem = items.find((item) => item.type.startsWith('image/'));
      if (imageItem) {
        e.preventDefault();
        const file = imageItem.getAsFile();
        if (file) {
          setIsPasting(true);
          setTimeout(() => setIsPasting(false), 1200);
          onFile(file);
        }
      }
    },
    [enabled, onFile]
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <>
      {children}

      {/* ── Paste flash overlay ── */}
      <AnimatePresence>
        {isPasting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
            style={{ background: 'rgba(6,182,212,0.06)' }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="flex flex-col items-center gap-3 bg-dark-900/90 border border-brand-cyan/50 rounded-3xl px-10 py-8 shadow-[0_0_60px_rgba(6,182,212,0.4)] backdrop-blur-xl"
            >
              <ClipboardPaste className="w-10 h-10 text-brand-cyan animate-bounce" />
              <p className="text-white font-black text-lg tracking-wide">Image Pasted!</p>
              <p className="text-brand-cyan-light text-sm">Preparing analysis…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full-page drag overlay ── */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center"
            style={{ background: 'rgba(6,182,212,0.04)', backdropFilter: 'blur(2px)' }}
          >
            {/* Animated dashed border */}
            <div className="absolute inset-6 rounded-[3rem] border-4 border-dashed border-brand-cyan/60 animate-pulse" />
            <div className="absolute inset-8 rounded-[2.5rem] border-2 border-dashed border-brand-violet/40" />

            {/* Floating particles */}
            {particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-brand-cyan/60"
                animate={{
                  x: [0, p.x],
                  y: [0, p.y],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                }}
                style={{
                  left: p.left,
                  top: p.top,
                }}
              />
            ))}

            {/* Center drop target */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-5 bg-dark-900/80 border-2 border-brand-cyan/60 rounded-[2rem] px-16 py-12 shadow-[0_0_80px_rgba(6,182,212,0.5)] backdrop-blur-xl"
            >
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl bg-brand-cyan/20 border-2 border-brand-cyan flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.6)]"
              >
                <UploadCloud className="w-10 h-10 text-brand-cyan" />
              </motion.div>
              <div className="text-center">
                <p className="text-white font-black text-2xl tracking-tight mb-1">Drop anywhere to analyze</p>
                <p className="text-brand-cyan-light/70 text-sm font-medium">Vision AI will process your file immediately</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {['JPG', 'PNG', 'WEBP', 'MP4', 'MOV'].map((ext) => (
                  <span key={ext} className="text-[10px] font-black tracking-widest text-brand-cyan/70 bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-1 rounded-full">
                    {ext}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalDropZone;
