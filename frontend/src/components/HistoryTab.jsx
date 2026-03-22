import React, { useState } from 'react';
import { Eye, Clock, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const HistoryTab = ({ history }) => {
  const [simulateDecay, setSimulateDecay] = useState(false);

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 glass rounded-3xl border border-white/5 border-dashed text-gray-400 shadow-inner">
        <Clock className="w-16 h-16 mb-6 text-brand-cyan/40 animate-pulse-glow" />
        <p className="text-xl font-light tracking-wide text-gray-300">No publishing history recorded yet.</p>
        <p className="text-sm mt-2 text-brand-violet-light/60">Upload and process visual contexts to start logging your SEO drafts.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent tracking-tight">Publishing History</h2>
        <button 
          onClick={() => setSimulateDecay(!simulateDecay)}
          className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${simulateDecay ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-dark-900 border-white/10 text-gray-500 hover:text-white'}`}
        >
          {simulateDecay ? "Decay Active" : "Simulate 6mo Decay"}
        </button>
      </div>
      
      <motion.div 
        className="space-y-6"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.15 } }
        }}
        initial="hidden"
        animate="show"
      >
        {history.map((item, idx) => {
          // Logic for content decay: either simulation is toggled ON, or 6 months have naturally passed.
          // For demo purposes, the mock `simulateDecay` turns the first item red.
          const isDecayed = simulateDecay && idx === 0;

          return (
          <motion.div 
            key={idx} 
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: 20 },
              show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
            }}
            whileHover={{ scale: 1.02 }}
            className={`glass p-8 rounded-3xl border flex flex-col md:flex-row gap-8 items-center transition-all duration-300 group relative overflow-hidden ${isDecayed ? 'border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.15)] bg-red-950/20' : 'border-white/5 shadow-lg hover:shadow-[0_10px_40px_rgba(139,92,246,0.15)] hover:border-brand-violet/30'}`}
          >
            {isDecayed && (
               <div className="absolute top-0 right-0 p-2 bg-red-500 text-white font-extrabold rounded-bl-xl text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.8)] z-20 flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3" /> SEO Decay Detected
               </div>
            )}
            <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 animate-border-flow pointer-events-none ${isDecayed ? 'from-red-600/0 via-red-600/10 to-red-600/0' : 'from-brand-violet/0 via-brand-violet/5 to-brand-violet/0'}`}></div>

            <div className="w-full md:w-3/4 space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                 <h3 className={`text-2xl font-bold transition-colors drop-shadow-md ${isDecayed ? 'text-red-100 group-hover:text-red-300' : 'text-white group-hover:text-brand-cyan-light'}`}>{item.title}</h3>
                 {item.publishedAt && (
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono border border-white/10 px-2 py-0.5 rounded bg-dark-900/50">
                       {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                 )}
              </div>
              <p className={`text-xs uppercase tracking-[0.2em] font-bold drop-shadow-sm ${isDecayed ? 'text-red-400' : 'text-brand-cyan'}`}>{item.topic}</p>
              <p className={`text-base font-light leading-relaxed line-clamp-2 ${isDecayed ? 'text-red-200/60' : 'text-gray-400'}`}>{item.meta_description}</p>
              <div className="flex flex-wrap gap-2.5 pt-3">
                {item.keywords?.slice(0, 5).map((kw, i) => (
                  <span key={i} className={`text-[11px] font-medium tracking-wide border px-3 py-1.5 rounded-md transition-colors ${isDecayed ? 'bg-red-950/50 border-red-900 text-red-300' : 'bg-dark-900 border-white/5 hover:border-brand-cyan/30 text-gray-300'}`}>
                    {kw}
                  </span>
                ))}
                {item.keywords?.length > 5 && (
                  <span className={`text-[11px] font-bold tracking-wide border px-3 py-1.5 rounded-md ${isDecayed ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-brand-violet/10 border-brand-violet/20 text-brand-violet-light'}`}>
                    +{item.keywords.length - 5}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full md:w-1/4 flex flex-col gap-3">
              {isDecayed ? (
                <button className="w-full py-4 bg-red-600/20 hover:bg-red-500 text-white rounded-xl flex flex-col items-center justify-center gap-1 border border-red-500/50 hover:border-red-400 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] group/btn relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 to-transparent z-0"></div>
                   <div className="relative z-10 flex items-center gap-2">
                       <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-700" /> 
                       <span className="tracking-wide text-sm font-bold">1-Click Refresh</span>
                   </div>
                   <span className="text-[9px] text-red-200 uppercase tracking-widest relative z-10 opacity-70 group-hover/btn:opacity-100">AI Recalculation</span>
                </button>
              ) : (
                <button className="w-full py-3 bg-dark-900 hover:bg-white/5 text-brand-violet-light rounded-xl flex items-center justify-center gap-3 border border-white/5 hover:border-brand-violet/30 transition-all shadow-inner group/btn">
                  <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> <span className="tracking-wide text-sm font-semibold">View Post</span>
                </button>
              )}
            </div>
          </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default HistoryTab;
