import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Eye, Clock, AlertTriangle, RefreshCw, Sparkles, Trash2, Search, X, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryTab = ({ history, setHistory }) => {
  const [simulateDecay, setSimulateDecay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [undoState, setUndoState] = useState(null); // { item, index }
  const undoTimerRef = useRef(null);

  useEffect(() => () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current); }, []);

  const deleteItem = (idx) => {
    const item = history[idx];
    setHistory((prev) => prev.filter((_, i) => i !== idx));
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoState({ item, index: idx });
    undoTimerRef.current = setTimeout(() => { setUndoState(null); undoTimerRef.current = null; }, 5000);
  };

  const handleUndo = () => {
    if (!undoState) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setHistory((prev) => {
      const next = [...prev];
      next.splice(undoState.index, 0, undoState.item);
      return next;
    });
    setUndoState(null);
    undoTimerRef.current = null;
  };

  const clearAll = () => {
    if (window.confirm('Clear all history? This cannot be undone.')) {
      setHistory([]);
    }
  };

  // Filtered history based on search query
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => {
      const searchable = [
        item.title, item.object, item.topic, item.meta_description,
        ...(item.keywords || []),
        ...(item.seo_insights?.top_5_keywords || []),
        item.seo_insights?.h1_title,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [history, searchQuery]);

  // Empty state
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 md:p-20 glass rounded-3xl border border-white/5 border-dashed text-gray-400 shadow-inner">
        <Clock className="w-16 h-16 mb-6 text-brand-cyan/40 animate-pulse-glow" />
        <p className="text-xl font-light tracking-wide text-gray-300">No publishing history recorded yet.</p>
        <p className="text-sm mt-2 text-brand-violet-light/60">Upload and process visual contexts to start logging your SEO drafts.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent tracking-tight">
          Publishing History
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            id="btn-simulate-decay"
            onClick={() => setSimulateDecay(!simulateDecay)}
            className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${simulateDecay ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-dark-900 border-white/10 text-gray-500 hover:text-white'}`}
          >
            {simulateDecay ? 'Decay Active' : 'Simulate 6mo Decay'}
          </button>
          {history.length > 0 && (
            <button
              id="btn-clear-history"
              onClick={clearAll}
              className="px-4 py-2 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400/70 hover:text-red-400 hover:border-red-500/40 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          id="input-history-search"
          type="text"
          placeholder="Search by title, keyword, topic…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-900/50 border border-white/10 rounded-2xl pl-11 pr-11 py-3.5 text-gray-200 placeholder-gray-600 outline-none focus:border-brand-cyan/40 focus:ring-1 focus:ring-brand-cyan/20 transition-all text-sm backdrop-blur-md"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Undo Delete Banner */}
      <AnimatePresence>
        {undoState && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative overflow-hidden rounded-2xl bg-dark-800/80 border border-amber-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.15)]"
          >
            {/* Progress countdown bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-amber-500"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">
                    {undoState.item?.seo_insights?.h1_title || undoState.item?.object || 'Entry'}
                  </span>{' '}
                  was deleted.
                </p>
              </div>
              <button
                id="btn-undo-delete"
                onClick={handleUndo}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wide transition-all shrink-0"
              >
                <Undo2 className="w-3.5 h-3.5" /> Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {searchQuery && (
        <p className="text-xs text-gray-500">
          {filtered.length === 0 ? 'No results found.' : `${filtered.length} of ${history.length} entries`}
        </p>
      )}

      {/* List */}
      <motion.div
        className="space-y-4"
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item, idx) => {
            const isDecayed = simulateDecay && idx === 0;
            // Resolve the display title: check multiple possible fields
            const displayTitle = item.seo_insights?.h1_title || item.object || item.title || 'Untitled Analysis';
            const displayKeywords = item.seo_insights?.top_5_keywords || item.keywords || [];
            const displayDesc = item.context || item.meta_description || '';

            return (
              <motion.div
                key={`${item.publishedAt}-${idx}`}
                layout
                variants={{ hidden: { opacity: 0, scale: 0.95, y: 20 }, show: { opacity: 1, scale: 1, y: 0 } }}
                exit={{ opacity: 0, scale: 0.93, y: -10, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.01 }}
                className={`glass p-6 md:p-8 rounded-3xl border flex flex-col md:flex-row gap-6 items-start md:items-center transition-all duration-300 group relative overflow-hidden ${
                  isDecayed ? 'border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.15)] bg-red-950/20' : 'border-white/5 shadow-lg hover:shadow-[0_10px_40px_rgba(139,92,246,0.15)] hover:border-brand-violet/30'
                }`}
              >
                {isDecayed && (
                  <div className="absolute top-0 right-0 p-2 bg-red-500 text-white font-extrabold rounded-bl-xl text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.8)] z-20 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> SEO Decay Detected
                  </div>
                )}

                {/* Hover shimmer */}
                <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isDecayed ? 'from-red-600/0 via-red-600/5 to-red-600/0' : 'from-brand-violet/0 via-brand-violet/5 to-brand-violet/0'}`} />

                {/* Content area */}
                <div className="w-full space-y-3 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className={`text-lg md:text-xl font-bold transition-colors drop-shadow-md leading-tight ${isDecayed ? 'text-red-100' : 'text-white group-hover:text-brand-cyan-light'}`}>
                          {displayTitle}
                        </h3>
                        {item.publishedAt && (
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono border border-white/10 px-2 py-0.5 rounded bg-dark-900/50 shrink-0">
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {item.object && item.object !== displayTitle && (
                        <p className={`text-xs uppercase tracking-[0.2em] font-bold mt-1 ${isDecayed ? 'text-red-400' : 'text-brand-cyan'}`}>{item.object}</p>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      id={`btn-delete-history-${idx}`}
                      onClick={() => deleteItem(idx)}
                      title="Remove this entry"
                      className="shrink-0 p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {displayDesc && (
                    <p className={`text-sm font-light leading-relaxed line-clamp-2 ${isDecayed ? 'text-red-200/60' : 'text-gray-400'}`}>
                      {displayDesc}
                    </p>
                  )}

                  {/* Keyword pills */}
                  {displayKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {displayKeywords.slice(0, 5).map((kw, i) => (
                        <span key={i} className={`text-[11px] font-medium tracking-wide border px-3 py-1.5 rounded-md transition-colors ${isDecayed ? 'bg-red-950/50 border-red-900 text-red-300' : 'bg-dark-900 border-white/5 hover:border-brand-cyan/30 text-gray-300'}`}>
                          {kw}
                        </span>
                      ))}
                      {displayKeywords.length > 5 && (
                        <span className={`text-[11px] font-bold tracking-wide border px-3 py-1.5 rounded-md ${isDecayed ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-brand-violet/10 border-brand-violet/20 text-brand-violet-light'}`}>
                          +{displayKeywords.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2">
                    {isDecayed ? (
                      <button className="px-5 py-2.5 bg-red-600/20 hover:bg-red-500 text-white text-sm rounded-xl flex items-center gap-2 border border-red-500/50 hover:border-red-400 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] group/btn">
                        <RefreshCw className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-700" />
                        <span className="font-bold tracking-wide">1-Click Refresh</span>
                      </button>
                    ) : (
                      <button className="px-5 py-2.5 bg-dark-900 hover:bg-white/5 text-brand-violet-light text-sm rounded-xl flex items-center gap-2 border border-white/5 hover:border-brand-violet/30 transition-all group/btn">
                        <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span className="font-semibold tracking-wide">View</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && searchQuery && (
        <div className="flex flex-col items-center py-12 text-gray-500 gap-3">
          <Search className="w-10 h-10 opacity-30" />
          <p>No entries match "<span className="text-gray-300">{searchQuery}</span>"</p>
          <button onClick={() => setSearchQuery('')} className="text-xs text-brand-cyan hover:underline">Clear search</button>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
