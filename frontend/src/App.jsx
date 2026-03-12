import React, { useState } from 'react';
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
  const [history, setHistory] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [rawFile, setRawFile] = useState(null);

  const handleUpload = async (file) => {
    setAppState('scanning');
    setUploadedImage(URL.createObjectURL(file));
    setRawFile(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResults(response.data);
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
    <div className="min-h-screen flex flex-col items-center p-6 md:p-12">
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
            <Camera className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Vision<span className="text-emerald-500">SEO</span></h1>
        </div>
        <nav className="flex gap-4">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'upload' ? 'bg-dark-800 text-emerald-400 border border-dark-700' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'history' ? 'bg-dark-800 text-emerald-400 border border-dark-700' : 'text-gray-400 hover:text-gray-200'}`}
          >
            History
          </button>
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
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Autonomous Visual-to-Blog Engine</h2>
                  <p className="text-gray-400 text-lg max-w-2xl">Upload any image. Our Vision AI extracts context, maps visual objects to high-intent keywords, and generates a ready-to-publish WordPress draft.</p>
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
                <div className="relative w-64 h-64 mb-8 glass rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  {uploadedImage && <img src={uploadedImage} alt="Uploading" className="w-full h-full object-cover opacity-50" />}
                  <motion.div 
                    animate={{ top: ['-10%', '110%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)]"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-200 mb-2 flex items-center gap-3">
                  <Search className="animate-spin text-emerald-500" /> Analyzing Semantic Context...
                </h3>
                <p className="text-emerald-400/80">Mapping visual concepts to high-volume keywords.</p>
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
