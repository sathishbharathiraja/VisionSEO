import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import UploadZone from './components/UploadZone';
import ResultDashboard from './components/ResultDashboard';
import HistoryTab from './components/HistoryTab';
import { Camera, Search, FileText, CheckCircle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'history'
  const [appState, setAppState] = useState('idle'); // 'idle', 'scanning', 'results'
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('visionseo_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  useEffect(() => {
    localStorage.setItem('visionseo_history', JSON.stringify(history));
  }, [history]);

  const handleUpload = async (file, tone, audience) => {
    setAppState('scanning');
    setUploadedImage(URL.createObjectURL(file));
    setRawFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tone', tone);
    formData.append('audience', audience);

    try {
      const response = await axios.post('http://localhost:8000/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResults(response.data);
      
      // Auto-save to history immediately so drafts are never lost
      saveToHistory({
          ...response.data,
          publishedAt: new Date().toISOString()
      });
      
      setAppState('results');
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Failed to analyze image. Ensure backend is running.");
      setAppState('idle');
    }
  };

  const saveToHistory = (data) => {
    setHistory(prev => [data, ...prev]);
  };

  const handlePublish = async (finalData) => {
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(finalData));
      
      // Grab the original file if we can. The object URL isn't sendable.
      // Easiest is to accept the File object from the Dashboard component, or store it in state.
      // Let's assume we store the raw File in state to re-upload it.
      if (rawFile) {
        formData.append('file', rawFile);
      }

      const response = await axios.post('http://localhost:8000/publish-wordpress', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.status === "success" || response.data.status === "mock") {
        saveToHistory(finalData);
        alert(response.data.message || "Published to WordPress! (Draft)");
      } else {
        alert("Publish failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Publish error", error);
      alert("Failed to publish to WordPress. Check console.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 md:p-12 relative overflow-hidden bg-grid">
      {/* Global Mouse Glow */}
      <motion.div 
        className="fixed top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none z-0 mix-blend-screen"
        animate={{
          x: mousePosition.x - 400,
          y: mousePosition.y - 400,
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.8 }}
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(6,182,212,0.03) 30%, transparent 60%)'
        }}
      />

      <header className="w-full max-w-5xl flex justify-between items-center mb-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-4 group cursor-pointer"
        >
          <div className="bg-brand-cyan/10 p-2.5 rounded-xl border border-brand-cyan/20 group-hover:bg-brand-cyan/20 group-hover:border-brand-cyan/40 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:-translate-y-1">
            <Camera className="w-8 h-8 text-brand-cyan group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md flex items-center gap-1">
            Vision<span className="text-brand-cyan text-glow-cyan animate-pulse">SEO</span>
          </h1>
        </motion.div>
        <nav className="flex gap-2 bg-dark-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          {['upload', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-gradient-to-r from-brand-cyan/80 to-brand-violet/80 rounded-xl -z-10 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 capitalize">{tab === 'upload' ? 'Dashboard' : tab}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="w-full max-w-5xl flex-1 flex flex-col">
        {activeTab === 'upload' && (
          <AnimatePresence mode="wait">
            {appState === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="text-center mb-12 relative z-10">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="inline-block mb-4 px-4 py-1.5 rounded-full border border-brand-violet/30 bg-brand-violet/10 text-brand-violet-light text-sm font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(139,92,246,0.3)] backdrop-blur-sm hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-shadow cursor-default"
                  >
                    Vision AI Engine <span className="text-white">v3.0</span>
                  </motion.div>
                  <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white tracking-tight leading-tight">
                    <div className="overflow-hidden inline-block"><div className="animate-text-reveal" style={{ animationDelay: '0.1s', opacity: 0 }}>Autonomous Visual</div></div><br/>
                    <div className="overflow-hidden inline-block"><div className="animate-text-reveal flex items-center gap-3" style={{ animationDelay: '0.3s', opacity: 0 }}>to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-white to-brand-violet drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]">Blog Engine</span></div></div>
                  </h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed text-glow-cyan"
                  >
                    Upload any image. Our Vision AI extracts semantic context, maps visual objects to high-intent keywords, and generates a ready-to-publish, perfectly formatted WordPress draft.
                  </motion.p>
                </div>
                <UploadZone onUpload={handleUpload} />
              </motion.div>
            )}

            {appState === 'scanning' && (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="relative w-72 h-72 mb-10 glass rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] border-brand-cyan/30 flex items-center justify-center p-2">
                  <div className="absolute inset-0 bg-brand-cyan/5 blur-xl"></div>
                  {uploadedImage && <img src={uploadedImage} alt="Uploading" className="w-full h-full object-cover rounded-2xl opacity-60 mix-blend-luminosity brightness-75 transition-all duration-1000" />}
                  
                  {/* Scanner Grid Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:1rem_1rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                  {/* Scanning Line */}
                  <motion.div 
                    animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 w-full h-[3px] bg-brand-cyan shadow-[0_0_20px_4px_rgba(6,182,212,0.8)] z-10"
                  />
                </div>
                <h3 className="text-3xl font-extrabold text-white mb-3 flex items-center gap-4 text-glow-cyan">
                  <Search className="animate-spin text-brand-cyan w-8 h-8" /> 
                  Analyzing Semantic Context...
                </h3>
                <p className="text-brand-cyan-light/70 font-medium text-lg tracking-wide">
                  Mapping visual concepts to high-volume SEO keywords
                </p>
              </motion.div>
            )}

            {appState === 'results' && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto"
              >
                <ResultDashboard 
                  results={results} 
                  image={uploadedImage} 
                  onReset={() => { setAppState('idle'); setUploadedImage(null); setRawFile(null); }}
                  onPublish={handlePublish}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <HistoryTab history={history} />
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default App;
