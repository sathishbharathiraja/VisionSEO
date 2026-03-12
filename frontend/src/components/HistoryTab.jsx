import React from 'react';
import { Eye, Clock } from 'lucide-react';

const HistoryTab = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 glass rounded-3xl border-dashed border-2 border-dark-700 text-gray-500">
        <Clock className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg">No history available yet. Upload an image to see it here.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-8">Publishing History</h2>
      
      {history.map((item, idx) => (
        <div key={idx} className="glass p-6 rounded-2xl border border-dark-700 flex flex-col md:flex-row gap-6 items-center shadow-lg hover:border-emerald-500/30 transition-all">
          <div className="w-full md:w-3/4 space-y-3">
            <h3 className="text-xl font-bold text-white">{item.title}</h3>
            <p className="text-sm text-emerald-400 uppercase font-semibold">{item.topic}</p>
            <p className="text-gray-400 text-sm line-clamp-2">{item.meta_description}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {item.keywords?.slice(0, 5).map((kw, i) => (
                <span key={i} className="text-xs bg-dark-900 border border-dark-600 text-gray-300 px-2 py-1 rounded-md">
                  {kw}
                </span>
              ))}
              {item.keywords?.length > 5 && (
                <span className="text-xs bg-dark-900 border border-dark-600 text-emerald-500 font-bold px-2 py-1 rounded-md">
                  +{item.keywords.length - 5}
                </span>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/4 flex flex-col gap-2">
            <button className="w-full py-2 bg-dark-900 hover:bg-dark-800 text-emerald-400 rounded-lg flex items-center justify-center gap-2 border border-dark-700 transition-colors">
              <Eye className="w-4 h-4" /> View Post
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryTab;
