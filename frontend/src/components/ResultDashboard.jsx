import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2, Zap, Share2, RotateCcw, Download, Copy } from 'lucide-react';
import SocialAssets from './SocialAssets';
import OmniscientEditor from './OmniscientEditor';
import KeywordConstellation from './KeywordConstellation';
import { Twitter, Linkedin, Globe, Hash } from 'lucide-react';
import HolographicDisplay from './HolographicDisplay';

const ResultDashboard = ({ results, image, onReset, onPublish }) => {
  const [editableKeywords, setEditableKeywords] = useState([...results.keywords]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [contentRef, setContentRef] = useState(results.content);
  
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedMeta, setCopiedMeta] = useState(false);
  
  // Apex Features
  const [distributeTwitter, setDistributeTwitter] = useState(true);
  const [distributeLinkedIn, setDistributeLinkedIn] = useState(true);
  const [distributeMedium, setDistributeMedium] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    setContentRef(results.content);
  }, [results.content]);

  const handleKeywordChange = (index, val) => {
    const newKw = [...editableKeywords];
    newKw[index] = val;
    setEditableKeywords(newKw);
  };

  const saveKeyword = () => {
    setEditingIndex(null);
  };

  const finalData = { ...results, keywords: editableKeywords, content: contentRef };

  // Generate a mock god-level score based on keyword count usually 90-99
  const score = Math.min(99, 85 + (editableKeywords.length * 2));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const exportReport = () => {
    const reportContent = `# VisionSEO Analysis Report
**Topic:** ${results.topic}

## SEO Metadata
**Title (H1):** ${results.title}
**Meta Description:** ${results.meta_description}

## Long-Tail Keywords
${editableKeywords.map(k => `- ${k}`).join('\n')}

## Optimized Content
${contentRef}

${results.social_snippets ? `## Social Promos

### Twitter/X
${results.social_snippets.twitter}

### LinkedIn
${results.social_snippets.linkedin}
` : ''}`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visionseo-report-${new Date().toISOString().split('T')[0]}.md`;
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
            God-Level Analyzed
          </div>
          {image && <HolographicDisplay src={image} />}
          
          {/* Circular Score Ring */}
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
                <span className="text-[8px] font-bold text-brand-cyan tracking-widest uppercase">SEO</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 relative z-10 mt-4">
            <h4 className="text-xs text-brand-cyan-light uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-cyan animate-pulse" /> Primary Context
            </h4>
            <p className="text-xl font-extrabold text-white leading-tight drop-shadow-md">{results.topic}</p>
          </div>
          {/* Subtle glow effect behind text */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none"></div>
        </div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass rounded-3xl p-6 flex flex-col gap-4 border border-brand-violet/20 shadow-[0_0_30px_rgba(139,92,246,0.1)] relative overflow-hidden"
        >
          <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
             <Globe className="w-4 h-4 text-brand-cyan" /> Multi-Platform Sync
          </h4>
          
          <div className="flex flex-col gap-2 mb-2">
               {/* Twitter Toggle */}
               <label className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${distributeTwitter ? 'bg-brand-cyan/10 border border-brand-cyan/30' : 'bg-dark-900/50 border border-white/5 hover:bg-white/5'}`}>
                 <div className="flex items-center gap-2">
                   <Twitter className={`w-4 h-4 ${distributeTwitter ? 'text-brand-cyan' : 'text-gray-500'}`} />
                   <span className={`text-xs font-bold ${distributeTwitter ? 'text-brand-cyan-light' : 'text-gray-400'}`}>X (Twitter) Thread</span>
                 </div>
                 {/* Custom Toggle UI */}
                 <div className={`w-8 h-4 rounded-full relative transition-colors ${distributeTwitter ? 'bg-brand-cyan' : 'bg-gray-600'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${distributeTwitter ? 'left-4.5' : 'left-0.5'}`}></div>
                 </div>
                 <input type="checkbox" className="sr-only" checked={distributeTwitter} onChange={() => setDistributeTwitter(!distributeTwitter)} />
               </label>

               {/* LinkedIn Toggle */}
               <label className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${distributeLinkedIn ? 'bg-brand-violet/10 border border-brand-violet/30' : 'bg-dark-900/50 border border-white/5 hover:bg-white/5'}`}>
                 <div className="flex items-center gap-2">
                   <Linkedin className={`w-4 h-4 ${distributeLinkedIn ? 'text-brand-violet-light' : 'text-gray-500'}`} />
                   <span className={`text-xs font-bold ${distributeLinkedIn ? 'text-brand-violet-light' : 'text-gray-400'}`}>LinkedIn Native</span>
                 </div>
                 <div className={`w-8 h-4 rounded-full relative transition-colors ${distributeLinkedIn ? 'bg-brand-violet' : 'bg-gray-600'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${distributeLinkedIn ? 'left-4.5' : 'left-0.5'}`}></div>
                 </div>
                 <input type="checkbox" className="sr-only" checked={distributeLinkedIn} onChange={() => setDistributeLinkedIn(!distributeLinkedIn)} />
               </label>

               {/* Medium Toggle */}
               <label className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${distributeMedium ? 'bg-white/10 border border-white/30' : 'bg-dark-900/50 border border-white/5 hover:bg-white/5'}`}>
                 <div className="flex items-center gap-2">
                   <Hash className={`w-4 h-4 ${distributeMedium ? 'text-white' : 'text-gray-500'}`} />
                   <span className={`text-xs font-bold ${distributeMedium ? 'text-white' : 'text-gray-400'}`}>Medium.com</span>
                 </div>
                 <div className={`w-8 h-4 rounded-full relative transition-colors ${distributeMedium ? 'bg-white' : 'bg-gray-600'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full ${distributeMedium ? 'bg-dark-900' : 'bg-white'} transition-transform ${distributeMedium ? 'left-4.5' : 'left-0.5'}`}></div>
                 </div>
                 <input type="checkbox" className="sr-only" checked={distributeMedium} onChange={() => setDistributeMedium(!distributeMedium)} />
               </label>
          </div>

          <button 
            onClick={async () => {
              setIsPublishing(true);
              // Simulate multi-platform posting delay
              await new Promise(r => setTimeout(r, 2000));
              
              // Inject timestamp for content decay tracking
              const dataWithTime = {
                  ...finalData,
                  publishedAt: new Date().toISOString(),
                  distribution: { twitter: distributeTwitter, linkedin: distributeLinkedIn, medium: distributeMedium }
              };
              await onPublish(dataWithTime);
              setIsPublishing(false);
            }}
            disabled={isPublishing}
            className="group relative w-full py-4 bg-transparent text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 overflow-hidden border border-brand-cyan/50 hover:border-brand-cyan disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan to-brand-violet opacity-80 group-hover:opacity-100 transition-opacity z-0"></div>
            {isPublishing ? (
               <><Zap className="w-5 h-5 relative z-10 animate-spin" /> <span className="relative z-10 tracking-wide">Distributing...</span></>
            ) : (
               <><Share2 className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" /> <span className="relative z-10 tracking-wide">Apex Publish Suite</span></>
            )}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent z-0"></div>
          </button>
          
          <button 
            onClick={exportReport}
            className="w-full py-3.5 bg-brand-violet/10 hover:bg-brand-violet/20 text-brand-violet-light hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-3 border border-brand-violet/30 hover:border-brand-violet shadow-inner group duration-300 mb-3"
          >
            <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> Download SEO Report (.md)
          </button>

          <button 
            onClick={onReset}
            disabled={isPublishing}
            className="w-full py-3.5 bg-dark-800/50 hover:bg-dark-700 text-gray-300 hover:text-brand-cyan rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-brand-cyan/50 shadow-inner group duration-300 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-700" /> Analyze New Image
          </button>
        </motion.div>
      </motion.div>

      {/* Metadata Column */}
      <motion.div 
        className="lg:col-span-2 space-y-8"
        initial={{ rotateY: -15, opacity: 0, x: 50 }}
        animate={{ rotateY: 0, opacity: 1, x: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.4, delay: 0.2 }}
      >
        <div className="glass rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-brand-violet/15 rounded-full blur-[120px] pointer-events-none"></div>

          <h3 className="text-4xl font-black text-white mb-10 border-b border-white/10 pb-6 tracking-tighter">
            Optimized <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet-light to-brand-cyan-light">Metadata</span>
          </h3>
          
          <div className="space-y-10 relative z-10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] text-brand-violet-light font-black uppercase tracking-[0.25em]">Blog Title (H1)</label>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold ${results.title.length > 60 ? 'text-red-400' : 'text-brand-cyan'}`}>
                    {results.title.length}/60 chars
                  </span>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(results.title); setCopiedTitle(true); setTimeout(() => setCopiedTitle(false), 2000); }}
                    className="flex items-center gap-1.5 text-[9px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-2.5 py-1.5 rounded transition-colors uppercase tracking-wider font-bold"
                  >
                    {copiedTitle ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} {copiedTitle ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className={`bg-dark-900/40 p-6 rounded-3xl border ${results.title.length > 60 ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/5'} text-gray-50 text-2xl font-bold shadow-inner backdrop-blur-xl transition-all duration-300`}>
                {results.title}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[11px] text-brand-violet-light font-black uppercase tracking-[0.25em]">Meta Description</label>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold ${results.meta_description.length > 160 ? 'text-red-400' : 'text-brand-cyan'}`}>
                    {results.meta_description.length}/160 chars
                  </span>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(results.meta_description); setCopiedMeta(true); setTimeout(() => setCopiedMeta(false), 2000); }}
                    className="flex items-center gap-1.5 text-[9px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-2.5 py-1.5 rounded transition-colors uppercase tracking-wider font-bold"
                  >
                    {copiedMeta ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />} {copiedMeta ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className={`bg-dark-900/40 p-6 rounded-3xl border ${results.meta_description.length > 160 ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/5'} text-gray-300 shadow-inner leading-relaxed font-light text-lg backdrop-blur-xl transition-all duration-300`}>
                {results.meta_description}
              </div>
            </div>
            
            <div>
              <label className="text-[11px] text-brand-cyan font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                Long-Tail Keywords 
                <span className="text-[10px] bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                  {editableKeywords.length} tags
                </span>
              </label>
              <KeywordConstellation keywords={editableKeywords} />
              
              <div className="flex flex-wrap gap-2.5 group/list mt-6">
                {editableKeywords.map((kw, idx) => (
                  <motion.div 
                    key={idx} 
                    className="relative group perspective object-cover"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.6 + (idx * 0.05), type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {editingIndex === idx ? (
                      <input 
                        className="bg-dark-950 border border-brand-cyan text-brand-cyan-light px-5 py-2.5 rounded-full text-sm font-bold outline-none w-40 shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all ring-2 ring-brand-cyan/50 focus:ring-brand-cyan z-20 relative"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => { handleKeywordChange(idx, editValue); saveKeyword(); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { handleKeywordChange(idx, editValue); saveKeyword(); } }}
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="bg-dark-800/90 border border-white/10 hover:border-brand-cyan/70 text-gray-200 hover:text-brand-cyan-light px-5 py-2.5 rounded-full tracking-wide text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-1 relative overflow-hidden group-hover/kw:bg-brand-cyan/10"
                        onClick={() => { setEditingIndex(idx); setEditValue(kw); }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/0 via-brand-cyan/10 to-brand-cyan/0 opacity-0 group-hover:opacity-100 animate-border-flow pointer-events-none"></div>
                        <span className="relative z-10">{kw}</span>
                        <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-brand-cyan transition-opacity relative z-10" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-4 italic font-light tracking-wide">* Click any tag above to edit its value.</p>
            </div>
            
            {contentRef && (
              <div className="pt-8 mt-8 border-t border-white/5 space-y-6">
                
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-brand-cyan font-bold uppercase tracking-[0.2em] block">
                    The Omniscient Editor
                  </label>
                  <span className="text-[10px] text-brand-violet-light tracking-wide bg-brand-violet/10 px-2 py-1 rounded">Highlight text for AI actions</span>
                </div>
                
                {/* The Omniscient Workspace */}
                <OmniscientEditor 
                  content={contentRef} 
                  onUpdate={setContentRef} 
                  tone={results.tone} 
                  audience={results.audience} 
                />
              </div>
            )}
            
            {results.social_snippets && (
              <div className="pt-8 mt-8 border-t border-white/5 space-y-5">
                <label className="text-[11px] text-brand-violet-light font-bold uppercase tracking-[0.2em] mb-4 block">Social Media Promos</label>
                <div className="flex flex-col gap-5">
                  <div className="bg-dark-900/60 p-5 rounded-2xl border border-white/5 shadow-inner group hover:border-[#1DA1F2]/30 transition-colors">
                    <h5 className="text-[11px] text-[#1DA1F2] font-black uppercase tracking-[0.2em] mb-3 flex items-center justify-between">
                      Twitter / X
                      <button 
                        className="text-gray-500 hover:text-[#1DA1F2] opacity-0 group-hover:opacity-100 transition-all text-xs font-semibold bg-white/5 px-3 py-1 rounded-md"
                        onClick={() => navigator.clipboard.writeText(results.social_snippets.twitter)}
                        title="Copy to clipboard"
                      >
                       COPY
                      </button>
                    </h5>
                    <p className="text-gray-200 text-base font-light whitespace-pre-wrap leading-relaxed">{results.social_snippets.twitter}</p>
                  </div>
                  
                  <div className="bg-dark-900/60 p-5 rounded-2xl border border-white/5 shadow-inner group hover:border-[#0077b5]/30 transition-colors">
                    <h5 className="text-[11px] text-[#0077b5] font-black uppercase tracking-[0.2em] mb-3 flex items-center justify-between">
                      LinkedIn
                      <button 
                        className="text-gray-500 hover:text-[#0077b5] opacity-0 group-hover:opacity-100 transition-all text-xs font-semibold bg-white/5 px-3 py-1 rounded-md"
                        onClick={() => navigator.clipboard.writeText(results.social_snippets.linkedin)}
                        title="Copy to clipboard"
                      >
                       COPY
                      </button>
                    </h5>
                    <p className="text-gray-200 text-base font-light whitespace-pre-wrap leading-relaxed">{results.social_snippets.linkedin}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Visual Hooks / Social Assets Generator */}
            {results.visual_hooks && (
              <SocialAssets image={image} hooks={results.visual_hooks} />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultDashboard;
