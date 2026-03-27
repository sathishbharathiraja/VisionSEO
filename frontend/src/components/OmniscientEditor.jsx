import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Expand, Shrink, Zap, GraduationCap } from 'lucide-react';

const OmniscientEditor = ({ content, onUpdate, tone, audience }) => {
  const [selectedText, setSelectedText] = useState("");
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const contentRef = useRef(null);

  // Function to handle text selection
  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !contentRef.current.contains(selection.anchorNode)) {
      if (!isProcessing) setIsMenuOpen(false);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 5) {
      if (!isProcessing) setIsMenuOpen(false);
      return; // Ignore very short selections
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectedText(text);
    // Position menu slightly above the selection
    setMenuPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setIsMenuOpen(true);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  const handleRewrite = async (action) => {
    if (!selectedText) return;
    
    setIsProcessing(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/rewrite-text`, {
        original_text: selectedText,
        action: action,
        tone: tone || "Professional",
        audience: audience || "General Public"
      });

      if (response.data.status === "success") {
        const newText = response.data.rewritten_text;
        
        // This is a naive replace. In a real highly-robust editor we'd use robust DOM manipulation, 
        // but simple string replacement works for the prototype.
        const updatedContent = content.replace(selectedText, `<span class="bg-brand-violet/20 text-white transition-all duration-1000 px-1 rounded">${newText}</span>`);
        
        onUpdate(updatedContent);
        setIsMenuOpen(false);
        window.getSelection().removeAllRanges();
      }
    } catch (error) {
      console.error("Rewrite failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const actions = [
    { label: "Make Viral", icon: <Zap className="w-3 h-3" />, action: "make it viral and punchy" },
    { label: "Expand", icon: <Expand className="w-3 h-3" />, action: "expand it with more detail" },
    { label: "Condense", icon: <Shrink className="w-3 h-3" />, action: "condense it to be brief" },
    { label: "Academic", icon: <GraduationCap className="w-3 h-3" />, action: "make it highly academic and authoritative" }
  ];

  return (
    <div className="relative">
      <div 
        ref={contentRef}
        className="bg-dark-900/50 p-8 rounded-2xl border border-white/5 text-gray-300 shadow-inner prose prose-invert prose-brand max-w-none font-light leading-loose selection:bg-brand-violet/40 selection:text-white"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed z-50 flex items-center gap-1 glass p-1.5 rounded-full shadow-[0_10px_40px_rgba(139,92,246,0.3)] border-brand-violet/30"
            style={{ 
              left: `${menuPos.x}px`, 
              top: `${menuPos.y}px`,
              transform: 'translate(-50%, -100%)' // Center horizontally, place above
            }}
          >
            <div className="px-3 flex items-center gap-2 border-r border-white/10 mr-1">
               {isProcessing ? (
                 <Sparkles className="w-4 h-4 text-brand-cyan animate-spin" />
               ) : (
                 <Sparkles className="w-4 h-4 text-brand-violet" />
               )}
               <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest hidden md:inline">
                 {isProcessing ? "Rewriting..." : "AI Edit"}
               </span>
            </div>

            {actions.map((act, i) => (
              <button
                key={i}
                disabled={isProcessing}
                onClick={() => handleRewrite(act.action)}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/10 rounded-full text-xs font-semibold text-gray-200 hover:text-white transition-colors disabled:opacity-50"
              >
                {act.icon} {act.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OmniscientEditor;
