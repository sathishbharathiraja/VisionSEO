import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Zap, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

const SLIDES = [
  {
    id: 'upload',
    Icon: UploadCloud,
    color: 'brand-cyan',
    headline: 'Upload Any Visual',
    sub: 'Drag & drop, click to browse, paste from clipboard (Ctrl+V), or use your camera. Supports images and videos.',
    tips: ['JPG, PNG, WEBP, MP4, MOV', 'Paste screenshots directly', 'Mobile camera capture'],
    gradient: 'from-brand-cyan/20 to-transparent',
    iconBg: 'bg-brand-cyan/20 border-brand-cyan/40',
    iconColor: 'text-brand-cyan',
  },
  {
    id: 'analyze',
    Icon: Zap,
    color: 'brand-violet',
    headline: 'Vision AI Does the Work',
    sub: 'Our 4-stage AEO pipeline analyzes your visual, maps it to high-intent keywords, and synthesizes a complete content package.',
    tips: ['SEO keywords + H1 titles', 'Competitor intelligence', 'YouTube & Instagram scripts'],
    gradient: 'from-brand-violet/20 to-transparent',
    iconBg: 'bg-brand-violet/20 border-brand-violet/40',
    iconColor: 'text-brand-violet-light',
  },
  {
    id: 'export',
    Icon: FileText,
    color: 'emerald',
    headline: 'Publish & Export in 1 Click',
    sub: 'Get a fully formatted blog post with Schema.org markup, Shopify CSV, social scripts — all ready to copy, export, or publish.',
    tips: ['WordPress direct publish', 'Shopify product CSV', 'Copy any content block'],
    gradient: 'from-emerald-500/20 to-transparent',
    iconBg: 'bg-emerald-500/20 border-emerald-500/40',
    iconColor: 'text-emerald-400',
  },
];

const COLOR_MAP = {
  'brand-cyan': {
    dot: 'bg-brand-cyan',
    activeDot: 'w-8 bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]',
    tip: 'text-brand-cyan',
    checkmark: 'text-brand-cyan',
    btn: 'bg-brand-cyan text-dark-950 hover:bg-brand-cyan-light',
    btnBorder: 'border-brand-cyan',
    glow: 'shadow-[0_0_60px_rgba(6,182,212,0.3)]',
  },
  'brand-violet': {
    dot: 'bg-brand-violet-light',
    activeDot: 'w-8 bg-brand-violet-light shadow-[0_0_8px_rgba(167,139,250,0.8)]',
    tip: 'text-brand-violet-light',
    checkmark: 'text-brand-violet-light',
    btn: 'bg-brand-violet text-white hover:bg-brand-violet-light',
    btnBorder: 'border-brand-violet',
    glow: 'shadow-[0_0_60px_rgba(139,92,246,0.3)]',
  },
  'emerald': {
    dot: 'bg-emerald-400',
    activeDot: 'w-8 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    tip: 'text-emerald-400',
    checkmark: 'text-emerald-400',
    btn: 'bg-emerald-500 text-white hover:bg-emerald-400',
    btnBorder: 'border-emerald-500',
    glow: 'shadow-[0_0_60px_rgba(16,185,129,0.3)]',
  },
};

const STORAGE_KEY = 'visionseo_onboarded';

const OnboardingModal = () => {
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Slight delay so page animations settle first
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setExiting(true);
    localStorage.setItem(STORAGE_KEY, '1');
    setTimeout(() => { setVisible(false); setExiting(false); }, 350);
  };

  const next = () => {
    if (slide < SLIDES.length - 1) {
      setSlide((s) => s + 1);
    } else {
      dismiss();
    }
  };

  const current = SLIDES[slide];
  const colors = COLOR_MAP[current.color];

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`relative w-full max-w-lg glass rounded-[2.5rem] p-8 md:p-10 border border-white/10 ${colors.glow}`}
          >
            {/* Close */}
            <button
              id="btn-onboarding-skip"
              onClick={dismiss}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Brand badge */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-brand-cyan" />
              </div>
              <span className="text-xs font-black tracking-[0.25em] text-brand-cyan uppercase">VisionSEO — Welcome</span>
            </div>

            {/* Slide content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center mb-6 ${current.iconBg}`}>
                  <current.Icon className={`w-8 h-8 ${current.iconColor}`} />
                </div>

                {/* Text */}
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight leading-tight">
                  {current.headline}
                </h2>
                <p className="text-gray-400 text-base leading-relaxed mb-6">{current.sub}</p>

                {/* Tips */}
                <div className="space-y-2.5 mb-8">
                  {current.tips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${colors.checkmark}`} />
                      <span className="text-sm text-gray-300 font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots + CTA */}
            <div className="flex items-center justify-between">
              {/* Dot indicators */}
              <div className="flex items-center gap-1.5">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`h-2 rounded-full transition-all duration-400 ${i === slide ? colors.activeDot : `w-2 bg-gray-600 hover:bg-gray-400`
                      }`}
                  />
                ))}
              </div>

              {/* Next / Get Started */}
              <motion.button
                id={`btn-onboarding-${slide < SLIDES.length - 1 ? 'next' : 'start'}`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={next}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm tracking-wide transition-all ${colors.btn}`}
              >
                {slide < SLIDES.length - 1 ? (
                  <>
                    Next <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Get Started <Zap className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Step counter */}
            <p className="text-center text-xs text-gray-600 mt-5">
              {slide + 1} of {SLIDES.length}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
