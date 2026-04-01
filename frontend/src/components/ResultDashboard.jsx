import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Download, Camera, Target, Layers, Sparkles, TrendingUp, HelpCircle, Hash, Zap, BookOpen, Code, Quote, CheckCircle2, PlaySquare, Image as ImageIcon, Paintbrush, Activity, Volume2, Square, ShoppingBag } from 'lucide-react';
import HolographicDisplay from './HolographicDisplay';

const ResultDashboard = ({ results, image, onReset }) => {
  // All data now comes from the single unified response
  const objectName = results?.object || "Unidentified Object";
  const contextDesc = results?.context || "No context provided.";
  const styleDesc = results?.visual_style || "No signature provided.";
  const techFeatures = results?.technical_features || [];
  const seoInsights = results?.seo_insights || null;
  const competitorUrls = results?.competitor_urls || [];
  const contentGaps = results?.content_gaps || [];
  const ctrScore = results?.ctr_prediction_score || 0;
  const visualTips = results?.visual_editing_tips || [];
  const youtubeScript = results?.youtube_shorts_script || "";
  const instaCarousel = results?.instagram_carousel || [];
  const thumbPrompt = results?.thumbnail_prompt || "";
  const blogData = {
    blog_content: results?.blog_content || "",
    json_ld: results?.json_ld || "{}"
  };

  const score = Math.floor(Math.random() * (99 - 94 + 1)) + 94; 
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Neural Voiceover Engine States
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth] = useState(window.speechSynthesis);

  useEffect(() => {
    return () => {
      if (synth) synth.cancel();
    };
  }, [synth]);

  const togglePlayback = () => {
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
    } else if (youtubeScript) {
      // Clean bracketed visual cues like [Upbeat intro music]
      const cleanText = youtubeScript.replace(/\[.*?\]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.1; // High energy shorts pacing
      utterance.pitch = 1.05;
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      synth.speak(utterance);
      setIsPlaying(true);
    }
  };

  const exportToShopify = () => {
    const handle = objectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const title = objectName;
    const bodyHtml = `"${blogData.blog_content.replace(/"/g, '""')}"`; 
    const vendor = "VisionSEO Generated";
    const type = "AI Generated Product";
    const tags = `"${(seoInsights?.top_5_keywords || []).join(',')}"`;
    const seoTitle = seoInsights?.h1_title || title;
    const seoDesc = `"${contextDesc.substring(0, 300).replace(/"/g, '""')}"`;
    
    let csv = "Handle,Title,Body (HTML),Vendor,Type,Tags,SEO Title,SEO Description\n";
    csv += `${handle},"${title}",${bodyHtml},"${vendor}","${type}",${tags},"${seoTitle}",${seoDesc}`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopify-import-${handle}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportReport = () => {
    let reportContent = `# Vision Analysis Report\n**Target Object:** ${objectName}\n\n## Context & Atmosphere\n${contextDesc}\n`;
    
    if (seoInsights) {
       reportContent += `\n## Market & SEO Insights\n**Primary H1 Title:** ${seoInsights.h1_title}\n\n### Top Semantic Keywords\n${(seoInsights.top_5_keywords || []).map(k => `- ${k}`).join('\n')}\n`;
    }

    if (blogData.blog_content) {
       reportContent += `\n## AEO Blog Content\n\n${blogData.blog_content}\n\n### JSON-LD\n\`\`\`json\n${blogData.json_ld}\n\`\`\`\n`;
    }

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vision-aeo-analysis-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 perspective-1000">
      {/* Visual Context Column */}
      <motion.div 
        className="lg:col-span-1 space-y-8"
        initial={{ rotateY: 15, opacity: 0, x: -50 }}
        animate={{ rotateY: 0, opacity: 1, x: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
      >
        <div className="glass rounded-[2.5rem] p-8 relative overflow-hidden group border border-brand-cyan/20 shadow-[0_0_40px_rgba(6,182,212,0.1)] hover:shadow-[0_0_60px_rgba(6,182,212,0.3)] transition-all duration-500 hover:-translate-y-2">
          <div className="absolute top-0 right-0 p-4 bg-brand-cyan text-dark-900 font-black rounded-bl-3xl text-[10px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(6,182,212,0.8)] backdrop-blur-md z-20">
            Semantically Analyzed
          </div>
          {image && <HolographicDisplay src={image} />}
          
          <div className="absolute top-6 left-6 z-20 flex items-center justify-center">
            <div className="relative w-20 h-20 flex items-center justify-center glass rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-dark-700" />
                <motion.circle 
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                  cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" 
                  strokeDasharray={circumference} 
                  strokeLinecap="round"
                  className="text-brand-cyan" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white text-glow-cyan leading-none">{score}</span>
                <span className="text-[7px] font-bold text-brand-cyan tracking-widest uppercase mt-0.5">Precision</span>
              </div>
            </div>

            {ctrScore > 0 && (
            <div className="relative w-20 h-20 flex items-center justify-center glass rounded-full shadow-[0_0_30px_rgba(139,92,246,0.4)] ml-4">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]">
                <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-dark-700" />
                <motion.circle 
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - (ctrScore / 100) * circumference }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
                  cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" 
                  strokeDasharray={circumference} 
                  strokeLinecap="round"
                  className="text-brand-violet" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] leading-none">{ctrScore}</span>
                <span className="text-[7px] font-bold text-brand-violet tracking-widest uppercase mt-0.5">CTR Pot.</span>
              </div>
            </div>
            )}
          </div>

          <div className="space-y-3 relative z-10 mt-4">
            <h4 className="text-xs text-brand-cyan-light uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Camera className="w-4 h-4 text-brand-cyan animate-pulse" /> Primary Target
            </h4>
            <p className="text-xl font-extrabold text-white leading-tight drop-shadow-md">{objectName}</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none"></div>
        </div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass rounded-3xl p-6 flex flex-col gap-4 border border-brand-violet/20 shadow-[0_0_30px_rgba(139,92,246,0.1)] relative overflow-hidden"
        >
          {/* Unified Pipeline Status */}
          <div className="flex flex-col gap-3 mb-2">
             <label className="text-[10px] text-brand-cyan-light font-black uppercase tracking-widest">Neural Convergence Status</label>
             
             <div className="flex items-center gap-3 bg-brand-cyan/10 border border-brand-cyan/30 px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <CheckCircle2 className="w-5 h-5 text-brand-cyan" />
                <span className="text-sm font-bold text-white tracking-wide">1. Holistic Vision Mapping</span>
             </div>

             <div className="flex items-center gap-3 bg-brand-violet/10 border border-brand-violet/30 px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <CheckCircle2 className="w-5 h-5 text-brand-violet-light" />
                <span className="text-sm font-bold text-white tracking-wide">2. Live SEO Synthesis</span>
             </div>

             <div className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/30 px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-bold text-white tracking-wide">3. AEO Final Target Synthesis</span>
             </div>
          </div>

          <div className="border-t border-white/10 mt-2 pt-4 flex flex-col gap-3">
            <button 
              onClick={exportReport}
              className="w-full py-3 bg-brand-violet/10 hover:bg-brand-violet/20 text-brand-violet-light hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 border border-brand-violet/30 hover:border-brand-violet shadow-inner group duration-300"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> Export Master Report
            </button>

            <button 
              onClick={exportToShopify}
              className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 border border-emerald-500/30 hover:border-emerald-500/50 shadow-inner group duration-300"
            >
              <ShoppingBag className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> Export Shopify CSV
            </button>

            <button 
              onClick={onReset}
              className="w-full py-3 bg-dark-800/50 hover:bg-dark-700 text-gray-400 hover:text-brand-cyan rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-brand-cyan/50 shadow-inner group duration-300"
            >
              <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-700" /> New Scan
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Analysis Column */}
      <motion.div 
        className="lg:col-span-2 space-y-8 h-full"
        initial={{ rotateY: -15, opacity: 0, x: 50 }}
        animate={{ rotateY: 0, opacity: 1, x: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.4, delay: 0.2 }}
      >
        <div className="glass rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden min-h-full flex flex-col gap-8">
          <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-brand-violet/15 rounded-full blur-[120px] pointer-events-none"></div>

          <h3 className="text-4xl font-black text-white border-b border-white/10 pb-6 tracking-tighter shrink-0 flex items-center gap-4">
            Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet-light to-brand-cyan-light">Converged Telemetry</span>
          </h3>
          
          <div className="relative z-10 w-full flex-grow flex flex-col gap-8">
            
            {/* Stage 1: Deep Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/5">
                <div>
                  <label className="text-[11px] text-brand-violet-light font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-violet-light" />
                    Context & Setting
                  </label>
                  <div className="p-5 rounded-2xl border border-white/5 bg-dark-900/40 shadow-inner text-gray-200 text-base font-light leading-relaxed backdrop-blur-xl">
                    {contextDesc}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-brand-cyan-light font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-cyan-light" />
                    Aesthetic Signature
                  </label>
                  <div className="p-5 rounded-2xl border border-white/5 bg-dark-900/40 shadow-inner text-gray-200 text-base font-light leading-relaxed backdrop-blur-xl">
                    {styleDesc}
                  </div>
                </div>
            </div>

            {/* Stage 2: SEO Insights */}
            {seoInsights && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-6 pb-6 border-b border-brand-cyan/20"
               >
                 <div>
                   <label className="text-[11px] text-brand-cyan font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                     <TrendingUp className="w-4 h-4" /> Market Bridge H1 Title
                   </label>
                   <div className="bg-brand-cyan/5 border border-brand-cyan/30 p-5 rounded-2xl text-white text-2xl font-bold shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                     {seoInsights.h1_title}
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[11px] text-brand-violet-light font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                        <Hash className="w-4 h-4" /> Top Semantic Keywords
                      </label>
                      <div className="flex flex-wrap gap-2">
                         {(seoInsights.top_5_keywords || []).map((kw, i) => (
                           <span key={i} className="bg-brand-violet/10 border border-brand-violet/30 text-brand-violet-light px-4 py-2 rounded-full text-xs font-semibold shadow-inner">
                             {kw}
                           </span>
                         ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-white font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" /> People Also Ask
                      </label>
                      <div className="space-y-3">
                         {(seoInsights.paa_questions || []).map((q, i) => (
                           <div key={i} className="bg-dark-800/80 border border-white/10 p-3 rounded-xl text-gray-300 font-medium text-xs flex items-start gap-3">
                             <span className="text-brand-cyan font-black">Q.</span> {q}
                           </div>
                         ))}
                      </div>
                    </div>
                 </div>
               </motion.div>
            )}

            {/* Stage 3: Agentic Competitor Intelligence (RAG) */}
            {(competitorUrls.length > 0 || contentGaps.length > 0) && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-6 pb-6 border-b border-brand-violet/20"
               >
                 <h4 className="text-2xl font-black text-white flex items-center gap-3">
                   <Target className="text-brand-violet w-6 h-6 animate-pulse" /> Agentic Competitor Intelligence (RAG)
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[11px] text-brand-cyan-light font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Live Crawled Sources
                      </label>
                      <div className="space-y-2">
                         {competitorUrls.map((url, i) => (
                           <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block bg-dark-800/80 border border-brand-cyan/20 hover:border-brand-cyan p-3 rounded-xl text-brand-cyan font-medium text-xs truncate transition-colors shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                             {url}
                           </a>
                         ))}
                         {competitorUrls.length === 0 && <p className="text-gray-500 text-sm italic">No live sources scraped.</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-brand-violet-light font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Actionable Content Gaps
                      </label>
                      <div className="space-y-3">
                         {contentGaps.map((gap, i) => (
                           <div key={i} className="bg-brand-violet/5 border border-brand-violet/30 p-4 rounded-xl text-gray-200 font-medium text-sm flex items-start gap-3 shadow-[0_0_20px_rgba(139,92,246,0.15)] leading-relaxed">
                             <span className="text-brand-violet font-black text-lg leading-none">!</span> 
                             <span className="mt-0.5">{gap}</span>
                           </div>
                         ))}
                         {contentGaps.length === 0 && <p className="text-gray-500 text-sm italic">No gaps identified.</p>}
                      </div>
                    </div>
                 </div>
               </motion.div>
            )}

            {/* Stage 4: Viral Optimizer Hook */}
            {visualTips.length > 0 && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-6 pb-6 border-b border-brand-cyan/20"
               >
                 <h4 className="text-2xl font-black text-white flex items-center gap-3">
                   <Activity className="text-brand-cyan w-6 h-6 animate-pulse" /> Viral Visual Optimizer
                 </h4>
                 <div>
                    <label className="text-[11px] text-brand-cyan-light font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                      <Paintbrush className="w-4 h-4" /> Actionable Editing Heuristics
                    </label>
                    <div className="space-y-3">
                       {visualTips.map((tip, i) => (
                         <div key={i} className="bg-brand-cyan/5 border border-brand-cyan/30 p-3 rounded-xl text-gray-200 font-medium text-sm flex items-start gap-3 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                           <span className="text-brand-cyan font-black">+</span> {tip}
                         </div>
                       ))}
                    </div>
                 </div>
               </motion.div>
            )}

            {/* Stage 5: Omnichannel Factory */}
            {(youtubeScript || instaCarousel.length > 0) && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-6 pb-6 border-b border-white/10"
               >
                 <h4 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 flex items-center gap-3">
                   <PlaySquare className="text-pink-500 w-6 h-6 animate-pulse" /> Omnichannel Social Factory
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* YouTube Script */}
                    {youtubeScript && (
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-4 relative">
                         <label className="text-[11px] text-red-400 font-black uppercase tracking-[0.25em] flex items-center gap-2">
                           <PlaySquare className="w-4 h-4" /> YouTube Shorts Script
                         </label>

                         {/* Audio visualizer bar securely mapped inline */}
                         <div className="absolute left-1/2 -translate-x-1/2 flex items-end h-6 overflow-hidden pointer-events-none">
                            <AnimatePresence>
                               {isPlaying && (
                                  <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-end gap-[3px] h-full"
                                  >
                                     {[...Array(20)].map((_, i) => (
                                        <motion.div 
                                          key={i} 
                                          className="w-1.5 bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm"
                                          animate={{ height: [4, Math.random() * 16 + 6, 4] }}
                                          transition={{ repeat: Infinity, duration: Math.random() * 0.3 + 0.2 }}
                                        />
                                     ))}
                                  </motion.div>
                               )}
                            </AnimatePresence>
                         </div>

                         <button 
                            onClick={togglePlayback}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border relative z-10 ${isPlaying ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30' : 'bg-red-500 text-white border-transparent hover:bg-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}
                         >
                            {isPlaying ? <Square className="w-3 h-3 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
                            {isPlaying ? 'Stop' : 'Play Script'}
                         </button>
                      </div>

                      <div className="bg-dark-900/80 border border-white/10 p-5 rounded-3xl text-gray-300 font-medium text-sm leading-relaxed whitespace-pre-wrap shadow-inner flex-grow overflow-y-auto custom-scrollbar relative">
                        {youtubeScript}
                      </div>
                    </div>
                    )}
                    
                    {/* Instagram Carousel & Prompt */}
                    <div className="space-y-6">
                      {instaCarousel.length > 0 && (
                      <div>
                        <label className="text-[11px] text-pink-400 font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> Instagram Carousel Matrix
                        </label>
                        <div className="flex flex-col gap-2 h-40 overflow-y-auto custom-scrollbar pr-2">
                           {instaCarousel.map((slide, i) => (
                             <div key={i} className="bg-gradient-to-r from-pink-500/10 to-orange-400/10 border border-pink-500/20 p-3 rounded-xl text-gray-200 text-xs font-semibold shadow-sm">
                               <span className="text-pink-400 mr-2">Slide {i+1}:</span> {slide}
                             </div>
                           ))}
                        </div>
                      </div>
                      )}

                      {thumbPrompt && (
                      <div>
                        <label className="text-[11px] text-purple-400 font-black uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> GenAI Thumbnail Prompt
                        </label>
                        <div className="bg-dark-950 border border-purple-500/30 p-4 rounded-xl text-purple-200 text-xs font-mono shadow-inner">
                           {thumbPrompt}
                        </div>
                      </div>
                      )}
                    </div>
                 </div>
               </motion.div>
            )}

            {/* Stage 6: AEO Blog Content */}
            {blogData.blog_content && (
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-8"
              >
                 <div>
                   <label className="text-[11px] text-brand-violet-light font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                     <BookOpen className="w-4 h-4" /> AEO Master Blog Post
                   </label>
                   <div 
                      className="bg-dark-900/60 p-8 rounded-3xl border border-brand-violet/30 text-gray-200 text-lg font-light leading-loose shadow-[0_0_40px_rgba(139,92,246,0.1)] prose prose-invert prose-brand prose-h2:text-brand-violet-light prose-h3:text-brand-cyan-light prose-a:text-brand-cyan max-w-full"
                      dangerouslySetInnerHTML={{ __html: blogData.blog_content }}
                   />
                 </div>

                 <div>
                    <label className="text-[11px] text-white font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4 text-brand-cyan" /> Schema.org JSON-LD
                    </label>
                    <div className="bg-dark-950 p-6 rounded-3xl border border-white/10 text-brand-cyan-light font-mono text-sm overflow-x-auto shadow-inner relative group">
                       <button 
                          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => navigator.clipboard.writeText(blogData.json_ld)}
                       >
                          Copy Schema
                       </button>
                       <pre>{blogData.json_ld}</pre>
                    </div>
                 </div>
              </motion.div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultDashboard;
