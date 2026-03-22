import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Image as ImageIcon } from 'lucide-react';

const ASSET_STYLES = [
  { name: "The Contrarian", gradient: "linear-gradient(to top, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.4) 60%, transparent 100%)", color: "#22d3ee" }, // Cyan
  { name: "The Emotional Pull", gradient: "linear-gradient(to top, rgba(20,5,30,0.9) 0%, rgba(20,5,30,0.4) 60%, transparent 100%)", color: "#a78bfa" }, // Violet
  { name: "The Authority", gradient: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)", color: "#ffffff" } // White
];

const SocialAssets = ({ image, hooks }) => {
  const canvasRefs = [useRef(null), useRef(null), useRef(null)];
  const [imagesReady, setImagesReady] = useState([false, false, false]);

  useEffect(() => {
    if (!image || !hooks || hooks.length < 3) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      // Draw all three variants
      hooks.slice(0, 3).forEach((hookText, index) => {
        const canvas = canvasRefs[index].current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const style = ASSET_STYLES[index];
        
        // Target dimensions for a social post (e.g., 1080x1080 for Instagram)
        canvas.width = 1080;
        canvas.height = 1080;

        // Calculate crop to cover the canvas
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        
        // 1. Draw Image
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // 2. Draw Gradient Overlay (Dark bottom for text readability)
        const gradient = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
        if (index === 0) {
            gradient.addColorStop(0, "rgba(10,10,15,0)");
            gradient.addColorStop(0.6, "rgba(10,10,15,0.8)");
            gradient.addColorStop(1, "rgba(10,10,15,1)");
        } else if (index === 1) {
            gradient.addColorStop(0, "rgba(20,5,30,0)");
            gradient.addColorStop(0.6, "rgba(20,5,30,0.8)");
            gradient.addColorStop(1, "rgba(20,5,30,1)");
        } else {
            gradient.addColorStop(0, "rgba(0,0,0,0)");
            gradient.addColorStop(0.6, "rgba(0,0,0,0.8)");
            gradient.addColorStop(1, "rgba(0,0,0,1)");
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Draw Brand/Logo Mark at top
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "bold 40px 'Outfit', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("VisionSEO", canvas.width / 2, 80);

        // 4. Draw Typography (The Hook)
        ctx.fillStyle = style.color;
        ctx.font = "900 80px 'Outfit', sans-serif";
        ctx.textAlign = "center";
        
        // Basic word wrap
        const words = hookText.split(' ');
        let line = '';
        let yPos = canvas.height - 250;
        const lines = [];
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > canvas.width - 150 && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        
        // Adjust Y pos based on line count
        yPos -= (lines.length - 1) * 90;

        // Add drop shadow to text for extra pop
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;

        lines.forEach(l => {
            ctx.fillText(l, canvas.width / 2, yPos);
            yPos += 90;
        });

        // Reset shadow
        ctx.shadowColor = "transparent";

        // Mark as ready
        setImagesReady(prev => {
            const next = [...prev];
            next[index] = true;
            return next;
        });
      });
    };
  }, [image, hooks]);

  const downloadAsset = (index) => {
    const canvas = canvasRefs[index].current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `visionseo-hook-${index + 1}.png`;
    link.href = dataUrl;
    link.click();
  };

  if (!hooks || hooks.length < 3) return null;

  return (
    <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <label className="text-[11px] text-brand-cyan font-bold uppercase tracking-[0.2em] flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Ready-to-Post Visual Hooks
        </label>
        <span className="text-[10px] bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.15)] animate-pulse">
          AUTO-GENERATED
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hooks.slice(0, 3).map((hook, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + (idx * 0.2), duration: 0.5 }}
            className="flex flex-col gap-3 group relative perspective-1000"
          >
            <div className="glass rounded-2xl overflow-hidden border border-white/10 group-hover:border-brand-cyan/40 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 relative aspect-square group-hover:-translate-y-2">
              <canvas 
                ref={canvasRefs[idx]} 
                className="w-full h-full object-cover"
                style={{ opacity: imagesReady[idx] ? 1 : 0, transition: 'opacity 0.5s' }}
              />
              {!imagesReady[idx] && (
                <div className="absolute inset-0 flex items-center justify-center text-brand-cyan animate-pulse">
                  Rendering High-Res...
                </div>
              )}
              
              {/* Overlay Download Button on Hover */}
              <div className="absolute inset-0 bg-dark-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                <button 
                  onClick={() => downloadAsset(idx)}
                  className="bg-brand-cyan hover:bg-brand-cyan-light text-dark-950 font-extrabold px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                >
                  <Download className="w-5 h-5" /> Download HQ
                </button>
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{ASSET_STYLES[idx].name}</p>
              <p className="text-sm text-gray-300 font-medium italic line-clamp-2 px-2">"{hook}"</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SocialAssets;
