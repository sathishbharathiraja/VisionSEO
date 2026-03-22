import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const HolographicDisplay = ({ src }) => {
  const ref = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["18deg", "-18deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-18deg", "18deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="perspective-1000 w-full mb-8" style={{ perspective: "1200px" }}>
        <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
        }}
        className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl cursor-crosshair group shadow-[0_0_50px_rgba(6,182,212,0.15)] hover:shadow-[0_0_80px_rgba(6,182,212,0.3)] transition-shadow duration-700 mx-auto"
        >
            {/* Hologram Base (Deepest Layer) */}
            <div 
            className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-brand-cyan/20 transition-all duration-500 bg-dark-950"
            style={{ transform: "translateZ(-40px)" }}
            >
                <div className="absolute inset-0 bg-brand-cyan/10 mix-blend-overlay z-10"></div>
                {/* 3000s grid pattern background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>
            </div>

            {/* Ghost Reflection Layer */}
            <div 
            className="absolute inset-0 rounded-3xl overflow-hidden mix-blend-screen opacity-50 blur-[8px]"
            style={{ transform: "translateZ(-10px) scale(1.05)" }}
            >
                <img src={src} className="w-full h-full object-cover saturate-200" alt="" />
            </div>

            {/* Primary Volumetric Core Image */}
            <div 
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl z-10 border border-white/10"
            style={{ transform: "translateZ(20px)" }}
            >
                <img src={src} className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-1000 ease-out" alt="Analyzed Core" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent z-20"></div>
                
                {/* Holographic Scanline Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.05)_50%)] bg-[length:100%_4px] z-30 pointer-events-none"></div>
                <motion.div 
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 w-full h-1 bg-brand-cyan shadow-[0_0_20px_5px_rgba(6,182,212,0.8)] z-40 blur-[1px] opacity-70 group-hover:opacity-100 transition-opacity"
                />
            </div>

            {/* Floating Top Chromatic Aberration / Glitch Layer */}
            <div 
            className="absolute inset-0 rounded-3xl overflow-hidden z-20 pointer-events-none mix-blend-color-dodge opacity-0 group-hover:opacity-70 transition-opacity duration-700"
            style={{ transform: "translateZ(60px) scale(0.95)" }}
            >
                <img src={src} className="w-full h-full object-cover hue-rotate-[180deg] brightness-150 contrast-150 blur-[2px] opacity-30" alt="" />
            </div>
            
            {/* UI Projection Overlay */}
            <div 
                className="absolute top-4 left-4 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"
                style={{ transform: "translateZ(80px)" }}
            >
               <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-brand-cyan font-mono tracking-widest uppercase bg-dark-900/80 px-2 py-1 rounded border border-brand-cyan/20">XYZ: {x.get().toFixed(2)}, {y.get().toFixed(2)}</span>
                  <span className="text-[8px] text-brand-violet-light font-mono tracking-widest uppercase bg-dark-900/80 px-2 py-1 rounded border border-brand-violet/20">Neural Map Active</span>
               </div>
            </div>

        </motion.div>
    </div>
  );
};

export default HolographicDisplay;
