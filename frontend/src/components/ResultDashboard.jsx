import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2, Zap, Share2, RotateCcw } from 'lucide-react';

const ResultDashboard = ({ results, image, onReset, onPublish }) => {
  const [editableKeywords, setEditableKeywords] = useState([...results.keywords]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleKeywordChange = (index, val) => {
    const newKw = [...editableKeywords];
    newKw[index] = val;
    setEditableKeywords(newKw);
  };

  const saveKeyword = () => {
    setEditingIndex(null);
  };

  const finalData = { ...results, keywords: editableKeywords };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Visual Context Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass rounded-3xl p-6 relative overflow-hidden group border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="absolute top-0 right-0 p-3 bg-emerald-500 text-dark-900 font-bold rounded-bl-2xl text-xs uppercase tracking-wider shadow-lg">
            Analyzed
          </div>
          {image && <img src={image} alt="Analyzed" className="w-full h-auto rounded-xl shadow-lg border border-dark-700 mb-4" />}
          <div className="space-y-2">
            <h4 className="text-sm text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> Primary Topic
            </h4>
            <p className="text-lg font-bold text-emerald-50">{results.topic}</p>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 flex flex-col gap-4">
          <button 
            onClick={() => onPublish(finalData)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" /> Publish to WordPress
          </button>
          <button 
            onClick={onReset}
            className="w-full py-3 bg-transparent hover:bg-dark-700 text-gray-400 hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-dark-600"
          >
            <RotateCcw className="w-4 h-4" /> Analyze New Image
          </button>
        </div>
      </div>

      {/* Metadata Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass rounded-3xl p-8 border border-dark-700">
          <h3 className="text-2xl font-bold text-white mb-6 border-b border-dark-700 pb-4">Optimized Metadata</h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm text-emerald-400 font-semibold uppercase tracking-wider mb-2 block">Blog Title (H1)</label>
              <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-600 text-gray-100 text-lg shadow-inner">
                {results.title}
              </div>
            </div>

            <div>
              <label className="text-sm text-emerald-400 font-semibold uppercase tracking-wider mb-2 block">Meta Description</label>
              <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-600 text-gray-300 shadow-inner leading-relaxed">
                {results.meta_description}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-emerald-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                Long-Tail Keywords <span className="text-xs bg-dark-700 text-gray-400 px-2 py-1 rounded-full">{editableKeywords.length} tags</span>
              </label>
              <div className="flex flex-wrap gap-2 group/list">
                {editableKeywords.map((kw, idx) => (
                  <div key={idx} className="relative group">
                    {editingIndex === idx ? (
                      <input 
                        className="bg-dark-900 border border-emerald-500 text-emerald-400 px-4 py-2 rounded-full text-sm outline-none w-32 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => { handleKeywordChange(idx, editValue); saveKeyword(); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { handleKeywordChange(idx, editValue); saveKeyword(); } }}
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="bg-dark-800 border border-dark-600 hover:border-emerald-500/50 text-gray-300 hover:text-emerald-400 px-4 py-2 rounded-full tracking-wide text-sm flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                        onClick={() => { setEditingIndex(idx); setEditValue(kw); }}
                      >
                        {kw}
                        <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">* Click any tag above to edit its value.</p>
            </div>
            
            {results.content && (
              <div className="pt-6 mt-6 border-t border-dark-700">
                <label className="text-sm text-emerald-400 font-semibold uppercase tracking-wider mb-4 block">AI Generated Article</label>
                <div 
                  className="bg-dark-900/80 p-6 rounded-xl border border-dark-600 text-gray-300 shadow-inner prose prose-invert prose-emerald max-w-none max-h-96 overflow-y-auto custom-scrollbar"
                  dangerouslySetInnerHTML={{ __html: results.content }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;
