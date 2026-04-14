import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Camera as CameraIcon, X, Aperture, FileImage, FileVideo, ChevronRight, RotateCcw, Lightbulb } from 'lucide-react';

const TONE_OPTIONS = [
  { value: 'Professional', label: 'Professional' },
  { value: 'Casual & Conversational', label: 'Casual & Conversational' },
  { value: 'Humorous & Witty', label: 'Humorous & Witty' },
  { value: 'Persuasive & Sales-Driven', label: 'Persuasive' },
  { value: 'Authoritative & Academic', label: 'Authoritative & Academic' },
];

const AUDIENCE_OPTIONS = [
  { value: 'General Public', label: 'General Public' },
  { value: 'Industry Professionals', label: 'Industry Professionals' },
  { value: 'Beginners & Novices', label: 'Beginners' },
  { value: 'C-Suite Executives', label: 'C-Suite Executives' },
  { value: 'Tech-Savvy Gamers / Developers', label: 'Tech-Savvy' },
];

const PRO_TIPS = [
  '💡 Press Ctrl+V to instantly paste any screenshot and analyze it',
  '📸 Camera mode works on mobile for real-time product photography',
  '🔑 Click any keyword pill to copy it directly to your clipboard',
  '🎯 Choose "Persuasive" tone for e-commerce product images',
  '⚡ Drag a file anywhere on the page — not just the upload box',
  '📋 Every generated content block has a one-click copy button',
  '🗂️ Your tone & audience preferences are automatically saved',
];

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UploadZone = ({ onUpload }) => {
  const [tone, setTone] = useState(() => localStorage.getItem('visionseo_tone') || 'Professional');
  const [audience, setAudience] = useState(() => localStorage.getItem('visionseo_audience') || 'General Public');
  const [mode, setMode] = useState('upload'); // 'upload' | 'camera' | 'preview'
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * PRO_TIPS.length));

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Persist preferences
  useEffect(() => { localStorage.setItem('visionseo_tone', tone); }, [tone]);
  useEffect(() => { localStorage.setItem('visionseo_audience', audience); }, [audience]);

  // Rotate pro tips every 6 seconds
  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % PRO_TIPS.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (mode === 'camera' && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [mode, stream]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for files dispatched from GlobalDropZone (paste / global drag)
  useEffect(() => {
    const handler = (e) => {
      const { file } = e.detail || {};
      if (file) setPreviewLocal(file);
    };
    window.addEventListener('visionseo:global-file', handler);
    return () => window.removeEventListener('visionseo:global-file', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ctrl+Enter → confirm preview
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && mode === 'preview' && previewFile) {
        e.preventDefault();
        onUpload(previewFile, tone, audience);
      }
      if (e.key === 'Escape' && mode === 'preview') {
        clearPreview();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, previewFile, tone, audience, onUpload]);


  const setPreviewLocal = (file) => {
    // Revoke the previous object URL immediately to prevent memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewFile(file);
    setPreviewUrl(url);
    setMode('preview');
  };

  // Alias for dropzone onDrop
  const setPreview = setPreviewLocal;

  const clearPreview = (e) => {
    if (e) e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
    setMode('upload');
  };

  const startCamera = async (e) => {
    e.stopPropagation();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setMode('camera');
    } catch {
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = (e) => {
    if (e) e.stopPropagation();
    if (stream) { stream.getTracks().forEach((t) => t.stop()); setStream(null); }
    setMode('upload');
  };

  const capturePhoto = (e) => {
    e.stopPropagation();
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      fetch(canvas.toDataURL('image/jpeg', 0.9))
        .then((r) => r.blob())
        .then((blob) => {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          stopCamera(null);
          setPreview(file);
        });
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (mode === 'upload' && acceptedFiles?.length > 0) {
        setPreview(acceptedFiles[0]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/mp4': [], 'video/quicktime': [], 'video/webm': [] },
    multiple: false,
    noClick: mode !== 'upload',
    noKeyboard: mode !== 'upload',
  });

  const isVideo = previewFile?.type?.startsWith('video/');

  const StyledSelect = ({ label, value, onChange, options, color }) => (
    <div className="flex flex-col gap-2 flex-1 group/select min-w-0">
      <label className={`text-[10px] font-black tracking-[0.2em] text-left pl-3 uppercase transition-colors ${color}`}>
        {label}
      </label>
      <div className="relative">
        <select
          className="appearance-none bg-dark-900/60 border border-white/10 rounded-xl text-gray-300 p-3 pl-4 pr-10 outline-none focus:border-brand-violet/50 focus:ring-1 focus:ring-brand-violet/50 transition-all w-full cursor-pointer hover:bg-dark-800 backdrop-blur-md shadow-inner text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div
        {...getRootProps()}
        className={`relative glass w-full p-10 md:p-16 rounded-[3rem] border border-white/10 transition-all duration-700 flex flex-col items-center justify-center text-center group overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]
          ${mode === 'upload' ? 'cursor-pointer' : 'cursor-default'}
          ${isDragActive ? 'bg-brand-cyan/5 shadow-[0_0_80px_rgba(6,182,212,0.3)] scale-[1.02]' : 'hover:bg-white/[0.03] hover:shadow-[0_20px_80px_rgba(139,92,246,0.2)] hover:border-brand-violet/40'}
        `}
      >
        {/* Drag active border */}
        {isDragActive && (
          <div
            className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-cyan opacity-80 animate-border-flow pointer-events-none"
            style={{ padding: '3px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'destination-out' }}
          />
        )}
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {/* ── UPLOAD mode ── */}
          {mode === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
              {/* Camera button */}
              <div className="absolute top-6 right-6 z-20">
                <button
                  id="btn-open-camera"
                  onClick={startCamera}
                  title="Use Web Camera"
                  className="bg-dark-900/80 border border-white/10 hover:border-brand-cyan/50 p-3 rounded-xl text-gray-400 hover:text-brand-cyan transition-all shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-1 group/cam"
                >
                  <CameraIcon className="w-5 h-5 group-hover/cam:scale-110 transition-transform" />
                </button>
              </div>

              {/* Upload icon */}
              <div className={`relative p-8 rounded-2xl mb-6 transition-all duration-500 overflow-hidden ${isDragActive ? 'bg-brand-cyan text-dark-900 shadow-[0_0_60px_rgba(6,182,212,0.8)] scale-125' : 'bg-dark-800/80 text-brand-cyan group-hover:scale-110 group-hover:bg-brand-cyan/10 shadow-inner border border-white/5 group-hover:border-brand-cyan/30 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]'}`}>
                <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.4)_360deg)] animate-god-ray mix-blend-overlay pointer-events-none" style={{ animationDuration: '6s' }} />
                {isDragActive && <div className="absolute inset-0 bg-white/30 rounded-2xl animate-ping opacity-100 duration-500" />}
                <UploadCloud className="w-14 h-14 relative z-10" />
              </div>

              <h3 className={`text-3xl md:text-4xl font-black mb-3 tracking-tighter transition-colors duration-500 ${isDragActive ? 'text-brand-cyan drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-gray-100 group-hover:text-white'}`}>
                {isDragActive ? 'Initiate Context Scan…' : 'Drag & Drop Image or Video'}
              </h3>
              <p className="text-gray-400 text-sm max-w-md font-medium tracking-wide leading-relaxed group-hover:text-gray-300 transition-colors">
                Supports JPG, PNG, WEBP, MP4, MOV. <br className="hidden md:block" />
                Or click to browse files from your device.
              </p>
            </motion.div>
          )}

          {/* ── PREVIEW mode ── */}
          {mode === 'preview' && previewFile && (
            <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center w-full gap-5" onClick={(e) => e.stopPropagation()}>
              {/* Dismiss button */}
              <button id="btn-clear-preview" onClick={clearPreview} className="absolute top-5 right-5 p-2 rounded-full bg-dark-900/70 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/10 z-20">
                <X className="w-4 h-4" />
              </button>

              {/* Thumbnail */}
              <div className="relative w-full aspect-video max-h-52 rounded-2xl overflow-hidden border border-brand-cyan/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                {isVideo
                  ? <video src={previewUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  : <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                }
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  {isVideo
                    ? <FileVideo className="w-4 h-4 text-brand-cyan" />
                    : <FileImage className="w-4 h-4 text-brand-cyan" />
                  }
                  <span className="text-xs text-white font-semibold truncate max-w-[180px]">{previewFile.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{formatBytes(previewFile.size)}</span>
                </div>
              </div>

              <p className="text-brand-cyan-light font-bold text-sm tracking-wide">Ready to analyze — confirm settings below then click Analyze</p>

              {/* Analyze button */}
              <motion.button
                id="btn-confirm-analyze"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onUpload(previewFile, tone, audience)}
                className="w-full py-4 bg-gradient-to-r from-brand-cyan to-brand-violet text-white font-black text-base rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] transition-all relative overflow-hidden group/analyze"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/analyze:opacity-100 transition-opacity" />
                <span className="relative z-10">Analyze with Vision AI</span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover/analyze:translate-x-1 transition-transform" />
              </motion.button>

              <button
                onClick={clearPreview}
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Choose a different file
              </button>
            </motion.div>
          )}

          {/* ── CAMERA mode ── */}
          {mode === 'camera' && (
            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center z-20 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={stopCamera} className="absolute -top-10 -right-6 p-2 text-gray-400 hover:text-red-400 transition-colors bg-dark-900/50 rounded-full hover:bg-red-400/10">
                <X className="w-5 h-5" />
              </button>
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.3)] border-2 border-brand-cyan">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  onPlay={() => { if (videoRef.current) videoRef.current.style.opacity = 1; }}
                  style={{ opacity: 0, transition: 'opacity 0.5s ease-in' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
              </div>
              <div className="mt-8 flex flex-col items-center">
                <button
                  id="btn-capture-photo"
                  onClick={capturePhoto}
                  className="group/cap relative w-20 h-20 rounded-full bg-brand-cyan/20 border-4 border-brand-cyan flex items-center justify-center hover:bg-brand-cyan transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                >
                  <Aperture className="w-10 h-10 text-brand-cyan group-hover/cap:text-dark-950 transition-colors group-hover/cap:animate-spin" />
                </button>
                <p className="mt-4 text-brand-cyan-light font-bold tracking-widest text-sm uppercase">Capture Reality</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings row */}
      {mode !== 'camera' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <StyledSelect
            label="Voice Tone"
            value={tone}
            onChange={setTone}
            options={TONE_OPTIONS}
            color="text-brand-violet-light"
          />
          <StyledSelect
            label="Target Audience"
            value={audience}
            onChange={setAudience}
            options={AUDIENCE_OPTIONS}
            color="text-brand-cyan"
          />
        </motion.div>
      )}

      {/* Rotating Pro Tips */}
      {mode === 'upload' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-dark-900/40 border border-white/5 backdrop-blur-sm"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <p className="text-xs text-gray-400 leading-tight">{PRO_TIPS[tipIndex]}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Ctrl+Enter hint when in preview mode */}
      {mode === 'preview' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-600 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          Press{' '}
          <kbd className="px-1.5 py-0.5 bg-dark-800 border border-white/10 rounded font-mono text-gray-400">Ctrl+Enter</kbd>
          {' '}to confirm ·{' '}
          <kbd className="px-1.5 py-0.5 bg-dark-800 border border-white/10 rounded font-mono text-gray-400">Esc</kbd>
          {' '}to cancel
        </motion.p>
      )}
    </div>
  );
};

export default UploadZone;

