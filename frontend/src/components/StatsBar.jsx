import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring } from 'framer-motion';
import { ImageIcon, Hash, FileText, CheckCircle2, TrendingUp } from 'lucide-react';

/**
 * Animates a number from 0 to `target` when scrolled into view.
 */
const AnimatedCount = ({ target }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const animatedValue = useSpring(0, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (inView) animatedValue.set(target);
  }, [inView, target, animatedValue]);

  useEffect(() => {
    const unsub = animatedValue.on('change', (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [animatedValue]);

  return <span ref={ref} className="tabular-nums">{display.toLocaleString()}</span>;
};

// Platform-wide showcase stats (shown for new users with no history)
const PLATFORM_STATS = [
  { Icon: ImageIcon,    value: 1248,  label: 'Images Analyzed',    color: 'text-brand-cyan',         iconBg: 'bg-brand-cyan/10 border-brand-cyan/20',        suffix: '+' },
  { Icon: Hash,         value: 9400,  label: 'Keywords Generated',  color: 'text-brand-violet-light', iconBg: 'bg-brand-violet/10 border-brand-violet/20',    suffix: '+' },
  { Icon: FileText,     value: 1187,  label: 'Blog Posts Created',  color: 'text-emerald-400',        iconBg: 'bg-emerald-500/10 border-emerald-500/20',      suffix: '+' },
  { Icon: TrendingUp,   value: 99,    label: 'Avg Precision Score', color: 'text-amber-400',          iconBg: 'bg-amber-500/10 border-amber-500/20',          suffix: '%' },
];

/**
 * StatsBar — shows REAL user stats from history when available.
 * Shows platform-wide showcase stats for first-time visitors.
 */
const StatsBar = ({ history = [] }) => {
  const hasHistory = history.length > 0;

  const imagesAnalyzed = history.length;
  const keywordsGenerated = history.reduce((acc, item) => {
    const kws = item?.seo_insights?.top_5_keywords || item?.keywords || [];
    return acc + kws.length;
  }, 0);
  const blogPostsCreated = history.filter(
    (item) => item?.blog_content && item.blog_content.trim().length > 0
  ).length;
  const successfulAnalyses = history.filter(
    (item) => item?.object || item?.seo_insights?.h1_title
  ).length;

  const USER_STATS = [
    { Icon: ImageIcon,    value: imagesAnalyzed,     label: 'Images Analyzed',    color: 'text-brand-cyan',         iconBg: 'bg-brand-cyan/10 border-brand-cyan/20',     suffix: '' },
    { Icon: Hash,         value: keywordsGenerated,  label: 'Keywords Generated',  color: 'text-brand-violet-light', iconBg: 'bg-brand-violet/10 border-brand-violet/20', suffix: '' },
    { Icon: FileText,     value: blogPostsCreated,   label: 'Blog Posts Created',  color: 'text-emerald-400',        iconBg: 'bg-emerald-500/10 border-emerald-500/20',   suffix: '' },
    { Icon: CheckCircle2, value: successfulAnalyses, label: 'Successful Analyses', color: 'text-amber-400',          iconBg: 'bg-amber-500/10 border-amber-500/20',       suffix: '' },
  ];

  const STATS = hasHistory ? USER_STATS : PLATFORM_STATS;
  const label = hasHistory ? 'Your stats — based on your history' : 'Platform stats — join thousands of creators';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="w-full max-w-3xl mx-auto mt-8 mb-2"
    >
      <p className="text-center text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-3 font-semibold">
        {label}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map(({ Icon, value, label: statLabel, color, iconBg, suffix }) => (
          <motion.div
            key={statLabel}
            whileHover={{ y: -3, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="card-shine glass rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-white/5 hover:border-white/10 transition-all cursor-default"
          >
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${iconBg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-xl md:text-2xl font-black ${color} leading-none flex items-end gap-0.5`}>
              <AnimatedCount target={value} />
              {suffix && <span className="text-sm font-bold mb-0.5">{suffix}</span>}
            </div>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest leading-tight">
              {statLabel}
            </p>
          </motion.div>
        ))}
      </div>
      {!hasHistory && (
        <p className="text-center text-[9px] text-gray-700 mt-2 tracking-wide">
          * Platform totals · Your personal stats will appear after your first analysis
        </p>
      )}
    </motion.div>
  );
};

export default StatsBar;
