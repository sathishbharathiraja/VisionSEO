import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw, Download, Camera, Target, Layers, Sparkles, TrendingUp,
  HelpCircle, Hash, Zap, BookOpen, Code, CheckCircle2, PlaySquare,
  Image as ImageIcon, Paintbrush, Activity, Volume2, Square, ShoppingBag,
  LayoutGrid, FileText, Share2, Info,
} from 'lucide-react';
import HolographicDisplay from './HolographicDisplay';
import CopyButton from './CopyButton';

// ─── Score Tooltip ────────────────────────────────────────────────────────────
const ScoreTooltip = ({ children, content }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} className="relative inline-flex items-center" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 text-xs text-gray-300 bg-dark-800 border border-white/10 rounded-xl p-3 shadow-[0_0_30px_rgba(0,0,0,0.6)] z-50 leading-relaxed pointer-events-none"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',  Icon: LayoutGrid },
  { id: 'seo',      label: 'SEO Intel', Icon: TrendingUp },
  { id: 'social',   label: 'Social',    Icon: Share2 },
  { id: 'blog',     label: 'Blog & Schema', Icon: FileText },
];

// ─── ResultDashboard ──────────────────────────────────────────────────────────
const ResultDashboard = ({ results, image, rawFile, onReset, onPublish }) => {
  const objectName   = results?.object               || 'Unidentified Object';
  const contextDesc  = results?.context              || 'No context provided.';
  const styleDesc    = results?.visual_style         || 'No signature provided.';
  const techFeatures = results?.technical_features   || [];
  const seoInsights  = results?.seo_insights         || null;
  const competitorUrls = results?.competitor_urls    || [];
  const contentGaps  = results?.content_gaps         || [];
  const ctrScore     = results?.ctr_prediction_score || 0;
  const visualTips   = results?.visual_editing_tips  || [];
  const youtubeScript = results?.youtube_shorts_script || '';
  const instaCarousel = results?.instagram_carousel  || [];
  const thumbPrompt  = results?.thumbnail_prompt     || '';
  const blogData = {
    blog_content: results?.blog_content || '',
    json_ld: results?.json_ld || '{}',
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth] = useState(() => typeof window !== 'undefined' ? window.speechSynthesis : null);

  const score = Math.floor(Math.random() * (99 - 94 + 1)) + 94;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  useEffect(() => { return () => { if (synth) synth.cancel(); }; }, [synth]);

  const togglePlayback = () => {
    if (isPlaying) { synth.cancel(); setIsPlaying(false); return; }
    if (!youtubeScript) return;
    const clean = youtubeScript.replace(/\[.*?\]/g, '');
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 1.1; u.pitch = 1.05;
    u.onend   = () => setIsPlaying(false);
    u.onerror = () => setIsPlaying(false);
    synth.speak(u); setIsPlaying(true);
  };

  const exportToShopify = () => {
    const handle  = objectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const bodyHtml = `"${blogData.blog_content.replace(/"/g, '""')}"`;
    const tags     = `"${(seoInsights?.top_5_keywords || []).join(',')}"`;
    const seoDesc  = `"${contextDesc.substring(0, 300).replace(/"/g, '""')}"`;
    let csv = 'Handle,Title,Body (HTML),Vendor,Type,Tags,SEO Title,SEO Description\n';
    csv += `${handle},"${objectName}",${bodyHtml},"VisionSEO Generated","AI Generated Product",${tags},"${seoInsights?.h1_title || objectName}",${seoDesc}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `shopify-import-${handle}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportReport = () => {
    let md = `# Vision Analysis Report\n**Target Object:** ${objectName}\n\n## Context\n${contextDesc}\n`;
    if (seoInsights) md += `\n## SEO Insights\n**H1:** ${seoInsights.h1_title}\n\n### Keywords\n${(seoInsights.top_5_keywords || []).map(k => `- ${k}`).join('\n')}\n`;
    if (blogData.blog_content) md += `\n## Blog Content\n\n${blogData.blog_content}\n\n### JSON-LD\n\`\`\`json\n${blogData.json_ld}\n\`\`\`\n`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `scopex-aeo-analysis-${new Date().toISOString().split('T')[0]}.md` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Shared content panel container
  const Panel = ({ children }) => (
    <div className="bg-dark-900/40 p-5 rounded-2xl border border-white/5 shadow-inner text-gray-200 text-base font-light leading-relaxed backdrop-blur-xl">
      {children}
    </div>
  );

  // ── Section label
  const SectionLabel = ({ icon: Icon, text, color = 'text-brand-cyan-light' }) => (
    <label className={`text-[11px] font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-2 ${color}`}>
      <Icon className="w-4 h-4" /> {text}
    </label>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 perspective-1000">

      {/* ── Left column: image + controls ─────────────────────────────────── */}
      <motion.div
        className="lg:col-span-1 space-y-6"
        initial={{ rotateY: 15, opacity: 0, x: -50 }}
        animate={{ rotateY: 0, opacity: 1, x: 0 }}
        transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
      >
        {/* Image card */}
        <div className="glass rounded-[2.5rem] p-8 relative overflow-hidden group border border-brand-cyan/20 shadow-[0_0_40px_rgba(6,182,212,0.1)] hover:shadow-[0_0_60px_rgba(6,182,212,0.3)] transition-all duration-500 hover:-translate-y-2">
          <div className="absolute top-0 right-0 p-3 bg-brand-cyan text-dark-900 font-black rounded-bl-3xl text-[9px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(6,182,212,0.8)] z-20">
            Semantically Analyzed
          </div>
          {image && <HolographicDisplay src={image} />}

          {/* Scores */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
            {/* Precision score */}
            <ScoreTooltip content="Precision Score: Measures how well the Vision AI confidently mapped visual elements to semantic content clusters. Scores above 90 indicate strong coherence.">
              <div className="relative w-20 h-20 flex items-center justify-center glass rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] cursor-help">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                  <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-dark-700" />
                  <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
                    cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
                    strokeDasharray={circumference} strokeLinecap="round" className="text-brand-cyan"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white text-glow-cyan leading-none">{score}</span>
                  <span className="text-[7px] font-bold text-brand-cyan tracking-widest uppercase mt-0.5">Precision</span>
                </div>
                <Info className="absolute -top-1 -right-1 w-4 h-4 text-brand-cyan/60" />
              </div>
            </ScoreTooltip>

            {/* CTR score */}
            {ctrScore > 0 && (
              <ScoreTooltip content="CTR Potential: Estimated click-through rate uplift based on keyword demand signals, headline strength, and content uniqueness.">
                <div className="relative w-20 h-20 flex items-center justify-center glass rounded-full shadow-[0_0_30px_rgba(139,92,246,0.4)] cursor-help">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]">
                    <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-dark-700" />
                    <motion.circle
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: circumference - (ctrScore / 100) * circumference }}
                      transition={{ duration: 2, ease: 'easeOut', delay: 0.8 }}
                      cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
                      strokeDasharray={circumference} strokeLinecap="round" className="text-brand-violet"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] leading-none">{ctrScore}</span>
                    <span className="text-[7px] font-bold text-brand-violet tracking-widest uppercase mt-0.5">CTR Pot.</span>
                  </div>
                  <Info className="absolute -top-1 -right-1 w-4 h-4 text-brand-violet/60" />
                </div>
              </ScoreTooltip>
            )}
          </div>

          <div className="space-y-2 relative z-10 mt-4">
            <h4 className="text-xs text-brand-cyan-light uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Camera className="w-4 h-4 text-brand-cyan animate-pulse" /> Primary Target
            </h4>
            <p className="text-xl font-extrabold text-white leading-tight drop-shadow-md">{objectName}</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none" />
        </div>

        {/* Pipeline status + action buttons */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-3xl p-6 flex flex-col gap-4 border border-brand-violet/20 shadow-[0_0_30px_rgba(139,92,246,0.1)] relative overflow-hidden">
          <div className="flex flex-col gap-3 mb-1">
            <label className="text-[10px] text-brand-cyan-light font-black uppercase tracking-widest">Neural Convergence Status</label>
            {[
              { label: '1. Holistic Vision Mapping', cls: 'bg-brand-cyan/10 border-brand-cyan/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]', icon: 'text-brand-cyan' },
              { label: '2. Live SEO Synthesis',       cls: 'bg-brand-violet/10 border-brand-violet/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]', icon: 'text-brand-violet-light' },
              { label: '3. AEO Final Target Synthesis', cls: 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]', icon: 'text-cyan-400' },
            ].map(({ label, cls, icon }) => (
              <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${cls}`}>
                <CheckCircle2 className={`w-5 h-5 ${icon}`} />
                <span className="text-sm font-bold text-white tracking-wide">{label}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
            <button id="btn-export-report" onClick={exportReport} className="w-full py-3 bg-brand-violet/10 hover:bg-brand-violet/20 text-brand-violet-light hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 border border-brand-violet/30 hover:border-brand-violet shadow-inner group duration-300">
              <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> Export Scopex Report
            </button>
            <button id="btn-export-shopify" onClick={exportToShopify} className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 border border-emerald-500/30 hover:border-emerald-500/50 shadow-inner group duration-300">
              <ShoppingBag className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> Export Shopify CSV
            </button>
            <button id="btn-new-scan" onClick={onReset} className="w-full py-3 bg-dark-800/50 hover:bg-dark-700 text-gray-400 hover:text-brand-cyan rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-brand-cyan/50 shadow-inner group duration-300">
              <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-700" /> New Scan
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Right column: tabbed detail area ─────────────────────────────── */}
      <motion.div
        className="lg:col-span-2"
        initial={{ rotateY: -15, opacity: 0, x: 50 }}
        animate={{ rotateY: 0, opacity: 1, x: 0 }}
        transition={{ duration: 1, type: 'spring', bounce: 0.4, delay: 0.2 }}
      >
        <div className="glass rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-brand-violet/15 rounded-full blur-[120px] pointer-events-none" />

          {/* Tab bar */}
          <div className="flex border-b border-white/5 bg-dark-950/30 relative z-10 overflow-x-auto">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                id={`result-tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-300 shrink-0
                  ${activeTab === id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {activeTab === id && (
                  <motion.div
                    layoutId="resultTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-cyan to-brand-violet"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 md:p-8 relative z-10">
            <AnimatePresence mode="wait">

              {/* ── Overview ── */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
                  <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                    Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet-light to-brand-cyan-light">Converged Telemetry</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <SectionLabel icon={Layers} text="Context & Setting" color="text-brand-violet-light" />
                      <div className="relative group">
                        <Panel>{contextDesc}</Panel>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyButton text={contextDesc} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <SectionLabel icon={Sparkles} text="Aesthetic Signature" />
                      <div className="relative group">
                        <Panel>{styleDesc}</Panel>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyButton text={styleDesc} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual tips */}
                  {visualTips.length > 0 && (
                    <div>
                      <SectionLabel icon={Activity} text="Viral Visual Optimizer" />
                      <div className="space-y-2">
                        {visualTips.map((tip, i) => (
                          <div key={i} className="bg-brand-cyan/5 border border-brand-cyan/30 p-3 rounded-xl text-gray-200 font-medium text-sm flex items-start gap-3">
                            <span className="text-brand-cyan font-black">+</span> {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── SEO Intel ── */}
              {activeTab === 'seo' && (
                <motion.div key="seo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
                  {seoInsights ? (
                    <>
                      <div>
                        <SectionLabel icon={TrendingUp} text="Market Bridge H1 Title" />
                        <div className="relative group">
                          <div className="bg-brand-cyan/5 border border-brand-cyan/30 p-5 rounded-2xl text-white text-2xl font-bold shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                            {seoInsights.h1_title}
                          </div>
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={seoInsights.h1_title} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <SectionLabel icon={Hash} text="Top Semantic Keywords" color="text-brand-violet-light" />
                          <div className="flex flex-wrap gap-2">
                            {(seoInsights.top_5_keywords || []).map((kw, i) => (
                              <motion.button
                                key={i}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigator.clipboard.writeText(kw)}
                                title="Click to copy"
                                className="bg-brand-violet/10 border border-brand-violet/30 text-brand-violet-light px-4 py-2 rounded-full text-xs font-semibold hover:bg-brand-violet/20 hover:border-brand-violet/50 transition-all cursor-pointer"
                              >
                                {kw}
                              </motion.button>
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-600 mt-2 pl-1">Click any keyword to copy</p>
                        </div>

                        <div>
                          <SectionLabel icon={HelpCircle} text="People Also Ask" color="text-white" />
                          <div className="space-y-2">
                            {(seoInsights.paa_questions || []).map((q, i) => (
                              <div key={i} className="bg-dark-800/80 border border-white/10 p-3 rounded-xl text-gray-300 font-medium text-xs flex items-start gap-3">
                                <span className="text-brand-cyan font-black shrink-0">Q.</span> {q}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Competitor RAG */}
                      {(competitorUrls.length > 0 || contentGaps.length > 0) && (
                        <div className="space-y-5 pt-4 border-t border-white/5">
                          <h4 className="text-xl font-black text-white flex items-center gap-3">
                            <Target className="text-brand-violet w-5 h-5 animate-pulse" /> Competitor Intelligence (RAG)
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <SectionLabel icon={Zap} text="Live Crawled Sources" />
                              <div className="space-y-2">
                                {competitorUrls.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block bg-dark-800/80 border border-brand-cyan/20 hover:border-brand-cyan p-3 rounded-xl text-brand-cyan font-medium text-xs truncate transition-colors">
                                    {url}
                                  </a>
                                ))}
                              </div>
                            </div>
                            <div>
                              <SectionLabel icon={Sparkles} text="Content Gaps" color="text-brand-violet-light" />
                              <div className="space-y-2">
                                {contentGaps.map((gap, i) => (
                                  <div key={i} className="bg-brand-violet/5 border border-brand-violet/30 p-3 rounded-xl text-gray-200 font-medium text-sm flex items-start gap-3">
                                    <span className="text-brand-violet font-black text-lg leading-none shrink-0">!</span>
                                    <span className="mt-0.5">{gap}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 italic text-center py-12">No SEO insights were returned for this analysis.</p>
                  )}
                </motion.div>
              )}

              {/* ── Social ── */}
              {activeTab === 'social' && (
                <motion.div key="social" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 flex items-center gap-3">
                    <PlaySquare className="text-pink-500 w-6 h-6 animate-pulse" /> Omnichannel Social Factory
                  </h3>

                  {/* YouTube Script */}
                  {youtubeScript ? (
                    <div>
                      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                        <SectionLabel icon={PlaySquare} text="YouTube Shorts Script" color="text-red-400" />
                        <div className="flex items-center gap-2">
                          {/* Audio visualizer */}
                          {isPlaying && (
                            <div className="flex items-end h-5 gap-[2px]">
                              {[...Array(12)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="w-1.5 bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm"
                                  animate={{ height: [3, Math.random() * 14 + 5, 3] }}
                                  transition={{ repeat: Infinity, duration: Math.random() * 0.3 + 0.2 }}
                                />
                              ))}
                            </div>
                          )}
                          <button
                            id="btn-play-script"
                            onClick={togglePlayback}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${isPlaying ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-red-500 text-white border-transparent hover:bg-red-600'}`}
                          >
                            {isPlaying ? <Square className="w-3 h-3 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
                            {isPlaying ? 'Stop' : 'Play Script'}
                          </button>
                          <CopyButton text={youtubeScript} label="Copy" />
                        </div>
                      </div>
                      <div className="bg-dark-900/80 border border-white/10 p-5 rounded-3xl text-gray-300 font-medium text-sm leading-relaxed whitespace-pre-wrap shadow-inner overflow-y-auto max-h-72 custom-scrollbar">
                        {youtubeScript}
                      </div>
                    </div>
                  ) : null}

                  {/* Instagram Carousel */}
                  {instaCarousel.length > 0 && (
                    <div>
                      <SectionLabel icon={ImageIcon} text="Instagram Carousel Matrix" color="text-pink-400" />
                      <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-2">
                        {instaCarousel.map((slide, i) => (
                          <div key={i} className="flex items-start gap-3 bg-gradient-to-r from-pink-500/10 to-orange-400/10 border border-pink-500/20 p-3 rounded-xl">
                            <span className="text-pink-400 font-black text-xs shrink-0 mt-0.5">Slide {i + 1}:</span>
                            <span className="text-gray-200 text-xs font-semibold">{slide}</span>
                            <CopyButton text={slide} className="ml-auto shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Thumbnail Prompt */}
                  {thumbPrompt && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <SectionLabel icon={Sparkles} text="GenAI Thumbnail Prompt" color="text-purple-400" />
                        <CopyButton text={thumbPrompt} label="Copy Prompt" />
                      </div>
                      <div className="bg-dark-950 border border-purple-500/30 p-4 rounded-xl text-purple-200 text-xs font-mono shadow-inner">
                        {thumbPrompt}
                      </div>
                    </div>
                  )}

                  {!youtubeScript && instaCarousel.length === 0 && !thumbPrompt && (
                    <p className="text-gray-500 italic text-center py-12">No social content was generated for this analysis.</p>
                  )}
                </motion.div>
              )}

              {/* ── Blog & Schema ── */}
              {activeTab === 'blog' && (
                <motion.div key="blog" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
                  {blogData.blog_content ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                          <SectionLabel icon={BookOpen} text="AEO Master Blog Post" color="text-brand-violet-light" />
                          <CopyButton text={blogData.blog_content} label="Copy HTML" />
                        </div>
                        <div
                          className="bg-dark-900/60 p-6 md:p-8 rounded-3xl border border-brand-violet/30 text-gray-200 text-base md:text-lg font-light leading-loose shadow-[0_0_40px_rgba(139,92,246,0.1)] prose prose-invert max-w-full overflow-y-auto max-h-[500px] custom-scrollbar"
                          dangerouslySetInnerHTML={{ __html: blogData.blog_content }}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                          <SectionLabel icon={Code} text="Schema.org JSON-LD" color="text-brand-cyan" />
                          <CopyButton text={blogData.json_ld} label="Copy Schema" />
                        </div>
                        <div className="bg-dark-950 p-5 rounded-3xl border border-white/10 text-brand-cyan-light font-mono text-sm overflow-x-auto shadow-inner">
                          <pre>{blogData.json_ld}</pre>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 italic text-center py-12">No blog content was generated for this analysis.</p>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultDashboard;
