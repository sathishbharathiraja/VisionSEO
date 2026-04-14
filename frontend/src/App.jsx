import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import UploadZone from './components/UploadZone';
import ResultDashboard from './components/ResultDashboard';
import HistoryTab from './components/HistoryTab';
import ProgressStepper from './components/ProgressStepper';
import { ToastProvider, useToast } from './components/ToastProvider';
import GlobalDropZone from './components/GlobalDropZone';
import OnboardingModal from './components/OnboardingModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import StatsBar from './components/StatsBar';
import {
  Camera, History, LayoutDashboard, Plus, Keyboard,
  Zap, TrendingUp, FileText, Share2, Github, ExternalLink,
  Brain, Search, Sparkles, ShoppingBag,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Feature Pills ─────────────────────────────────────────────────────────────
const FEATURE_PILLS = [
  { Icon: Brain,       label: 'Vision AI',        color: 'text-brand-cyan   border-brand-cyan/30   bg-brand-cyan/5   hover:bg-brand-cyan/15' },
  { Icon: Search,      label: 'SEO Intel',        color: 'text-brand-violet border-brand-violet/30 bg-brand-violet/5 hover:bg-brand-violet/15' },
  { Icon: FileText,    label: 'Blog Engine',      color: 'text-emerald-400  border-emerald-400/30  bg-emerald-400/5  hover:bg-emerald-400/15' },
  { Icon: Share2,      label: 'Social Factory',   color: 'text-pink-400     border-pink-400/30     bg-pink-400/5     hover:bg-pink-400/15' },
  { Icon: ShoppingBag, label: 'Shopify Export',   color: 'text-amber-400    border-amber-400/30    bg-amber-400/5    hover:bg-amber-400/15' },
  { Icon: Sparkles,    label: 'Schema JSON-LD',   color: 'text-sky-400      border-sky-400/30      bg-sky-400/5      hover:bg-sky-400/15' },
];

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5 }}
      className="w-full max-w-5xl mx-auto mt-16 pb-8 relative z-10"
    >
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-brand-cyan/50" />
          <span className="font-bold text-gray-500">VisionSEO</span>
          <span className="text-gray-700">·</span>
          <span>Vision AI Engine v3.0</span>
          <span className="text-gray-700">·</span>
          <span>Powered by Gemini 2.5 Flash</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/sathishbharathiraja/VisionSEO"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-gray-300 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
          <a
            href="https://visionseo.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-gray-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>API Docs</span>
          </a>
        </div>
        <p className="text-gray-700">© 2026 VisionSEO · All rights reserved</p>
      </div>
    </motion.footer>
  );
}

// ─── Inner App (needs ToastProvider in tree) ──────────────────────────────────
function AppInner() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('upload');
  const [appState, setAppState] = useState('idle'); // 'idle' | 'scanning' | 'results'
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('visionseo_history') || '[]');
    } catch { return []; }
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Last failed upload — stored so retry works
  const lastUploadRef = useRef(null);

  // ── Persist history ──────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('visionseo_history', JSON.stringify(history));
  }, [history]);

  // ── Mouse glow ───────────────────────────────────────────────────────────
  useEffect(() => {
    const update = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', update);
    return () => window.removeEventListener('mousemove', update);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (shortcutsOpen) { setShortcutsOpen(false); return; }
        if (appState === 'results') { handleReset(); return; }
      }
      if (e.altKey && e.key === '1') { setActiveTab('upload'); }
      if (e.altKey && e.key === '2') { setActiveTab('history'); }
      if (e.ctrlKey && e.key === 'r' && appState === 'results') {
        e.preventDefault();
        handleReset();
      }
      if ((e.key === '?' && !e.ctrlKey) || (e.ctrlKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [appState, shortcutsOpen]);

  const saveToHistory = (data) => setHistory((prev) => [data, ...prev]);

  // ── Core upload handler ───────────────────────────────────────────────────
  const handleUpload = useCallback(async (file, tone, audience) => {
    lastUploadRef.current = { file, tone, audience };
    setAppState('scanning');
    setUploadedImage(URL.createObjectURL(file));
    setRawFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tone', tone || 'Professional');
    formData.append('audience', audience || 'General Public');

    try {
      const response = await axios.post(`${API_BASE}/analyze-image-unified`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(response.data);
      saveToHistory({ ...response.data, publishedAt: new Date().toISOString() });
      setAppState('results');
      toast.success('Analysis complete! Your AEO content package is ready.', { title: '✅ Vision AI Complete' });
    } catch (error) {
      console.error('Error analyzing media:', error);
      const isQuota = error?.response?.status === 429;
      const msg = isQuota
        ? 'API quota exceeded. Please wait a moment and try again.'
        : 'Analysis failed. Make sure the backend is running.';

      toast.error(msg, {
        title: isQuota ? '⚡ Quota Limit' : '❌ Analysis Failed',
        duration: 10000,
        action: {
          label: 'Retry →',
          onClick: () => {
            if (lastUploadRef.current) {
              const { file: f, tone: t, audience: a } = lastUploadRef.current;
              handleUpload(f, t, a);
            }
          },
        },
      });
      setAppState('idle');
    }
  }, [toast]);

  // ── Global drop / paste handler ────────────────────────────────────────────
  const handleGlobalFile = useCallback((file) => {
    const savedTone = localStorage.getItem('visionseo_tone') || 'Professional';
    const savedAudience = localStorage.getItem('visionseo_audience') || 'General Public';
    setActiveTab('upload');
    window.dispatchEvent(new CustomEvent('visionseo:global-file', { detail: { file, tone: savedTone, audience: savedAudience } }));
  }, []);

  // ── Publish ───────────────────────────────────────────────────────────────
  const handlePublish = async (finalData) => {
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(finalData));
      if (rawFile) formData.append('file', rawFile);
      const response = await axios.post(`${API_BASE}/publish-wordpress`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.status === 'success' || response.data.status === 'mock') {
        saveToHistory(finalData);
        toast.success(response.data.message || 'Draft created in WordPress!', { title: '🚀 Published!' });
      } else {
        toast.error(response.data.message, { title: 'Publish Failed' });
      }
    } catch (error) {
      console.error('Publish error', error);
      toast.error('Failed to publish. Check your WordPress credentials in the backend .env.', { title: '❌ Publish Error' });
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setUploadedImage(null);
    setRawFile(null);
    setResults(null);
  };

  const NAV_TABS = [
    { id: 'upload', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'history', label: 'History', Icon: History, badge: history.length || null },
  ];

  const isIdle = appState === 'idle';

  return (
    <GlobalDropZone onFile={handleGlobalFile} enabled={appState === 'idle'}>
      <OnboardingModal />
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <div className="min-h-screen flex flex-col items-center p-4 md:p-8 lg:p-12 relative overflow-hidden bg-grid">

        {/* ── Aurora background orbs ── */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute w-[700px] h-[700px] rounded-full animate-aurora opacity-20"
            style={{
              top: '-15%', left: '-10%',
              background: 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(6,182,212,0.1) 50%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] rounded-full animate-aurora-slow opacity-20"
            style={{
              bottom: '-10%', right: '-5%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full animate-aurora opacity-10"
            style={{
              top: '40%', right: '20%',
              background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animationDelay: '6s',
            }}
          />
        </div>

        {/* Mouse glow */}
        <motion.div
          className="fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none z-0 mix-blend-screen"
          animate={{ x: mousePosition.x - 400, y: mousePosition.y - 400 }}
          transition={{ type: 'tween', ease: 'backOut', duration: 0.8 }}
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(6,182,212,0.03) 30%, transparent 60%)' }}
        />

        {/* ── Header ── */}
        <header className="w-full max-w-5xl flex justify-between items-center mb-8 md:mb-10 relative z-10 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex items-center gap-3 group cursor-pointer shrink-0"
            onClick={() => { setActiveTab('upload'); if (appState === 'results') handleReset(); }}
          >
            <div className="bg-brand-cyan/10 p-2 md:p-2.5 rounded-xl border border-brand-cyan/20 group-hover:bg-brand-cyan/20 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:-translate-y-0.5">
              <Camera className="w-6 h-6 md:w-7 md:h-7 text-brand-cyan transition-transform duration-300" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              Vision<span className="text-brand-cyan text-glow-cyan">SEO</span>
            </h1>
            {/* Version badge */}
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-brand-violet/10 border border-brand-violet/20 text-brand-violet-light text-[9px] font-black uppercase tracking-widest">
              v3.0
            </span>
          </motion.div>

          <div className="flex items-center gap-2">
            {/* Keyboard shortcut hint */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              id="btn-shortcuts-open"
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard shortcuts (?)"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-900/30 border border-white/5 text-gray-600 hover:text-gray-300 hover:border-white/15 transition-all text-xs font-semibold"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Shortcuts</span>
              <kbd className="ml-1 text-[10px] bg-dark-700 border border-white/10 px-1.5 py-0.5 rounded font-mono">?</kbd>
            </motion.button>

            {/* API status indicator */}
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              href="https://visionseo.onrender.com/health"
              target="_blank"
              rel="noopener noreferrer"
              title="API Status"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-900/30 border border-white/5 text-gray-600 hover:text-gray-300 hover:border-white/15 transition-all text-xs font-semibold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>API Live</span>
            </motion.a>

            {/* Nav tabs */}
            <nav className="flex gap-1.5 bg-dark-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
              {NAV_TABS.map(({ id, label, Icon, badge }) => (
                <button
                  key={id}
                  id={`nav-tab-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold transition-all duration-300 text-sm ${
                    activeTab === id ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {activeTab === id && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute inset-0 bg-gradient-to-r from-brand-cyan/80 to-brand-violet/80 rounded-xl -z-10 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{label}</span>
                  {badge ? (
                    <span className="relative z-10 min-w-[18px] h-[18px] flex items-center justify-center bg-brand-violet/80 text-white text-[10px] font-black rounded-full px-1">
                      {badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="w-full max-w-5xl flex-1 flex flex-col relative z-10">
          {activeTab === 'upload' && (
            <AnimatePresence mode="wait">
              {isIdle && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 flex flex-col items-center justify-center"
                >
                  {/* ── Hero section ── */}
                  <div className="text-center mb-10 relative z-10 w-full">
                    {/* Powered-by badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      transition={{ duration: 0.8, type: 'spring' }}
                      className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-brand-violet/30 bg-brand-violet/10 text-brand-violet-light text-sm font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(139,92,246,0.3)] backdrop-blur-sm hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-shadow cursor-default"
                    >
                      <Zap className="w-3.5 h-3.5 text-brand-violet animate-pulse" />
                      <span>Vision AI Engine</span>
                      <span className="text-white">v3.0</span>
                      <span className="text-brand-violet/50">·</span>
                      <span className="text-[10px] text-brand-violet/70 normal-case tracking-normal font-medium">Gemini 2.5 Flash</span>
                    </motion.div>

                    {/* Hero headline */}
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-5 text-white tracking-tight leading-tight">
                      <div className="overflow-hidden inline-block">
                        <div className="animate-text-reveal" style={{ animationDelay: '0.1s', opacity: 0 }}>Autonomous Visual</div>
                      </div>
                      <br />
                      <div className="overflow-hidden inline-block">
                        <div className="animate-text-reveal flex items-center gap-3 justify-center flex-wrap" style={{ animationDelay: '0.3s', opacity: 0 }}>
                          to{' '}
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white to-brand-violet drop-shadow-[0_0_30px_rgba(6,182,212,0.8)] animate-gradient-x">
                            Blog Engine
                          </span>
                        </div>
                      </div>
                    </h2>

                    {/* Subline */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed mb-8"
                    >
                      Upload, drag, or{' '}
                      <kbd className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-dark-800 border border-white/15 rounded-lg text-brand-cyan font-mono">Ctrl+V</kbd>
                      {' '}paste any image or video. Vision AI generates a complete, ready-to-publish content package.
                    </motion.p>

                    {/* Feature pills */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.0 }}
                      className="flex flex-wrap items-center justify-center gap-2 mb-8"
                    >
                      {FEATURE_PILLS.map(({ Icon, label, color }) => (
                        <span key={label} className={`feature-pill ${color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </span>
                      ))}
                    </motion.div>

                    {/* Stats bar — real data from history */}
                    <StatsBar history={history} />
                  </div>

                  <UploadZone onUpload={handleUpload} />
                </motion.div>
              )}

              {appState === 'scanning' && (
                <ProgressStepper
                  key="scanning"
                  image={uploadedImage}
                  isVideo={rawFile?.type?.startsWith('video/')}
                />
              )}

              {appState === 'results' && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <ResultDashboard
                    results={results}
                    image={uploadedImage}
                    rawFile={rawFile}
                    onReset={handleReset}
                    onPublish={handlePublish}
                    saveToHistory={saveToHistory}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <HistoryTab history={history} setHistory={setHistory} />
            </motion.div>
          )}
        </main>

        {/* ── Floating Action Button ── */}
        <AnimatePresence>
          {(activeTab === 'history' || appState === 'results') && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              id="btn-fab-new-scan"
              onClick={() => { setActiveTab('upload'); handleReset(); }}
              className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-brand-cyan to-brand-violet flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.7)] transition-shadow"
              title="New scan (Ctrl+R)"
            >
              <Plus className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Bottom keyboard hint ── */}
        <AnimatePresence>
          {isIdle && activeTab === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 2 }}
              className="mt-4 flex items-center gap-4 text-xs text-gray-600 relative z-10"
            >
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-dark-800 border border-white/10 rounded font-mono text-gray-500">Ctrl+V</kbd>
                paste image
              </span>
              <span className="w-px h-3 bg-white/10" />
              <button
                onClick={() => setShortcutsOpen(true)}
                className="flex items-center gap-1.5 hover:text-gray-300 transition-colors"
              >
                <Keyboard className="w-3 h-3" /> view all shortcuts
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer ── */}
        {isIdle && activeTab === 'upload' && <Footer />}
      </div>
    </GlobalDropZone>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}

export default App;
