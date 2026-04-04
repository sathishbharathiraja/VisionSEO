import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Zap, FileText, Share2, CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
  {
    id: 'vision',
    icon: Eye,
    label: 'Vision Mapping',
    detail: 'Extracting semantic objects & visual context…',
    color: 'brand-cyan',
  },
  {
    id: 'seo',
    icon: Zap,
    label: 'SEO Synthesis',
    detail: 'Mapping visual concepts to high-intent keywords…',
    color: 'brand-violet',
  },
  {
    id: 'blog',
    icon: FileText,
    label: 'AEO Blog Generation',
    detail: 'Crafting structured, schema-ready blog content…',
    color: 'brand-cyan',
  },
  {
    id: 'social',
    icon: Share2,
    label: 'Social Factory',
    detail: 'Building YouTube script & Instagram carousel…',
    color: 'brand-violet',
  },
];

const COLOR_MAP = {
  'brand-cyan': {
    text: 'text-brand-cyan',
    border: 'border-brand-cyan/50',
    bg: 'bg-brand-cyan/10',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
    barFill: '#06b6d4',
    ring: 'ring-brand-cyan/50',
  },
  'brand-violet': {
    text: 'text-brand-violet-light',
    border: 'border-brand-violet/50',
    bg: 'bg-brand-violet/10',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]',
    barFill: '#8b5cf6',
    ring: 'ring-brand-violet/50',
  },
};

/**
 * ProgressStepper — shows animated pipeline stages during AI scan.
 * Props:
 *   image     {string}  — objectURL of uploaded image/video
 *   isVideo   {boolean} — whether the media is a video
 */
const ProgressStepper = ({ image, isVideo }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-advance steps over time (pure UX — backend runs independently)
  useEffect(() => {
    const timings = [0, 4000, 9000, 14000]; // when each step "activates"
    const timers = timings.map((delay, idx) =>
      setTimeout(() => setCurrentStep(idx), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      key="scanning"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col items-center justify-center gap-10"
    >
      {/* Image preview */}
      <div className="relative w-64 h-64 glass rounded-3xl overflow-hidden border border-brand-cyan/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="absolute inset-0 bg-brand-cyan/5 blur-xl" />
        {image && (
          isVideo
            ? <video src={image} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
            : <img src={image} alt="Analyzing" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
        )}
        {/* Scanning line */}
        <motion.div
          animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-0 w-full h-[2px] bg-brand-cyan shadow-[0_0_20px_4px_rgba(6,182,212,0.8)] z-10"
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:1rem_1rem]" />
      </div>

      {/* Steps */}
      <div className="w-full max-w-md space-y-3">
        {STEPS.map((step, idx) => {
          const state = idx < currentStep ? 'done' : idx === currentStep ? 'active' : 'pending';
          const colors = COLOR_MAP[step.color];
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.12 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                state === 'active'
                  ? `${colors.bg} ${colors.border} ${colors.glow}`
                  : state === 'done'
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-dark-900/30 border-white/5 opacity-40'
              }`}
            >
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                state === 'done' ? 'bg-emerald-500/20' : state === 'active' ? colors.bg : 'bg-dark-800/50'
              }`}>
                <AnimatePresence mode="wait" initial={false}>
                  {state === 'done' ? (
                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </motion.div>
                  ) : state === 'active' ? (
                    <motion.div key="spin" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Loader2 className={`w-5 h-5 ${colors.text} animate-spin`} />
                    </motion.div>
                  ) : (
                    <motion.div key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Icon className="w-5 h-5 text-gray-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${
                  state === 'done' ? 'text-emerald-300' : state === 'active' ? 'text-white' : 'text-gray-600'
                }`}>
                  {step.label}
                </p>
                {state === 'active' && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`text-xs mt-0.5 ${colors.text} opacity-80`}
                  >
                    {step.detail}
                  </motion.p>
                )}
              </div>

              {/* Step number / done badge */}
              <span className={`text-xs font-black shrink-0 ${
                state === 'done' ? 'text-emerald-400' : state === 'active' ? colors.text : 'text-gray-700'
              }`}>
                {state === 'done' ? '✓' : `0${idx + 1}`}
              </span>
            </motion.div>
          );
        })}
      </div>

      <p className="text-gray-500 text-sm font-medium tracking-wide animate-pulse">
        {isVideo ? 'Processing video frames — this may take 15–30 seconds…' : 'Synthesizing your AEO content package…'}
      </p>
    </motion.div>
  );
};

export default ProgressStepper;
