import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Camera as CameraIcon, X, Aperture } from 'lucide-react';

const UploadZone = ({ onUpload }) => {
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("General Public");
  const [mode, setMode] = useState('upload'); // 'upload' or 'camera'
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  React.useEffect(() => {
    if (mode === 'camera' && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [mode, stream]);

  const startCamera = async (e) => {
    e.stopPropagation();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
      setMode('camera');
      // The useEffect will handle attaching the stream once the video element mounts
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = (e) => {
    if (e) e.stopPropagation();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setMode('upload');
  };

  const capturePhoto = (e) => {
    e.stopPropagation();
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Fallback dimensions if video metadata isn't fully ready
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Use toDataURL and fetch for ultra-reliable Blob conversion across all browser engines
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          stopCamera();
          onUpload(file, tone, audience);
        })
        .catch(err => {
          console.error("Error creating image file:", err);
          stopCamera();
        });
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    if (mode === 'upload' && acceptedFiles?.length > 0) {
      onUpload(acceptedFiles[0], tone, audience);
    }
  }, [onUpload, tone, audience, mode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/mp4': [], 'video/quicktime': [], 'video/webm': [] },
    multiple: false,
    noClick: mode === 'camera', // Disable click upload when camera is active
    noKeyboard: mode === 'camera'
  });

  return (
    <div 
      {...getRootProps()} 
      className={`relative glass w-full max-w-2xl p-16 md:p-20 rounded-[3rem] border border-white/10 transition-all duration-700 flex flex-col items-center justify-center text-center group overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]
        ${mode === 'upload' ? 'cursor-pointer' : 'cursor-default'}
        ${isDragActive ? 'bg-brand-cyan/5 shadow-[0_0_80px_rgba(6,182,212,0.3)] scale-[1.02]' : 'hover:bg-white/[0.03] hover:shadow-[0_20px_80px_rgba(139,92,246,0.2)] hover:border-brand-violet/40'}
      `}
    >
      {isDragActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-cyan opacity-80 animate-border-flow" style={{ padding: '3px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'destination-out' }}></div>
      )}
      <input {...getInputProps()} />

      {mode === 'upload' ? (
        <>
          <div className="absolute top-6 right-6 z-20">
             <button 
                onClick={startCamera}
                title="Use Web Camera"
                className="bg-dark-900/80 border border-white/10 hover:border-brand-cyan/50 p-3 rounded-xl text-gray-400 hover:text-brand-cyan transition-all shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-1 group/cam"
             >
                <CameraIcon className="w-6 h-6 group-hover/cam:scale-110 transition-transform" />
             </button>
          </div>

          <div className={`relative p-8 rounded-2xl mb-8 transition-all duration-500 overflow-hidden ${isDragActive ? 'bg-brand-cyan text-dark-900 shadow-[0_0_60px_rgba(6,182,212,0.8)] scale-125' : 'bg-dark-800/80 text-brand-cyan group-hover:scale-110 group-hover:bg-brand-cyan/10 group-hover:text-brand-cyan-light shadow-inner border border-white/5 group-hover:border-brand-cyan/30 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]'}`}>
            <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.4)_360deg)] animate-god-ray mix-blend-overlay pointer-events-none" style={{ animationDuration: '6s' }}></div>
            {isDragActive && <div className="absolute inset-0 bg-white/30 rounded-2xl animate-ping opacity-100 duration-500"></div>}
            <UploadCloud className="w-16 h-16 relative z-10" />
          </div>
          <h3 className={`text-4xl font-black mb-4 tracking-tighter transition-colors duration-500 ${isDragActive ? 'text-brand-cyan drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-gray-100 group-hover:text-white'}`}>
            {isDragActive ? "Initiate Context Scan..." : "Drag & Drop Image or Video"}
          </h3>
          <p className="text-gray-400 text-sm max-w-md mb-12 font-medium tracking-wide leading-relaxed group-hover:text-gray-300 transition-colors">
            Supports JPG, PNG, WEBP, MP4, MOV. The Vision Engine will automatically extract semantic context and generate SEO metadata.
          </p>
        </>
      ) : (
        <div className="w-full flex flex-col items-center z-20 relative">
          <button 
            onClick={stopCamera}
            className="absolute -top-10 -right-6 p-2 text-gray-400 hover:text-red-400 transition-colors bg-dark-900/50 rounded-full hover:bg-red-400/10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.3)] border-2 border-brand-cyan">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               className="w-full h-full object-cover"
               onPlay={() => { if(videoRef.current) videoRef.current.style.opacity = 1 }}
               style={{ opacity: 0, transition: 'opacity 0.5s ease-in' }}
             />
             <canvas ref={canvasRef} className="hidden" />
             
             {/* Scanner effect overlay on camera */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none"></div>
          </div>
          
          <div className="mt-8 flex flex-col items-center">
             <button 
               onClick={capturePhoto}
               className="group/cap relative w-20 h-20 rounded-full bg-brand-cyan/20 border-4 border-brand-cyan flex items-center justify-center hover:bg-brand-cyan transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.5)]"
             >
                <Aperture className="w-10 h-10 text-brand-cyan group-hover/cap:text-dark-950 transition-colors group-hover/cap:animate-spin" />
             </button>
             <p className="mt-4 text-brand-cyan-light font-bold tracking-widest text-sm uppercase">Capture Reality</p>
          </div>
        </div>
      )}

      {/* Selectors */}
      <div 
        className="flex mb-2 gap-6 w-full justify-center mt-4 z-20"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex flex-col gap-2 w-1/3 group/select">
          <label className="text-[10px] text-brand-violet-light font-bold tracking-[0.2em] text-left pl-3 uppercase transition-colors group-hover/select:text-brand-violet">VOICE TONE</label>
          <div className="relative">
            <select 
              className="appearance-none bg-dark-900/60 border border-white/10 rounded-xl text-gray-300 p-3.5 pl-4 pr-10 outline-none focus:border-brand-violet/50 focus:ring-1 focus:ring-brand-violet/50 transition-all w-full cursor-pointer hover:bg-dark-800 backdrop-blur-md shadow-inner"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="Professional">Professional</option>
              <option value="Casual & Conversational">Casual & Conversational</option>
              <option value="Humorous & Witty">Humorous & Witty</option>
              <option value="Persuasive & Sales-Driven">Persuasive</option>
              <option value="Authoritative & Academic">Authoritative & Academic</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500 group-hover/select:text-brand-violet transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-1/3 group/select">
          <label className="text-[10px] text-brand-cyan font-bold tracking-[0.2em] text-left pl-3 uppercase transition-colors group-hover/select:text-brand-cyan-light">TARGET AUDIENCE</label>
          <div className="relative">
            <select 
              className="appearance-none bg-dark-900/60 border border-white/10 rounded-xl text-gray-300 p-3.5 pl-4 pr-10 outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all w-full cursor-pointer hover:bg-dark-800 backdrop-blur-md shadow-inner"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option value="General Public">General Public</option>
              <option value="Industry Professionals">Industry Professionals</option>
              <option value="Beginners & Novices">Beginners</option>
              <option value="C-Suite Executives">C-Suite Executives</option>
              <option value="Tech-Savvy Gamers / Developers">Tech-Savvy</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500 group-hover/select:text-brand-cyan transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadZone;
