import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

const UploadZone = ({ onUpload }) => {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  return (
    <div 
      {...getRootProps()} 
      className={`glass w-full max-w-2xl p-16 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group
        ${isDragActive ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.3)]' : 'border-dark-700 hover:border-emerald-500/50 hover:bg-dark-800/90'}
      `}
    >
      <input {...getInputProps()} />
      <div className={`p-4 rounded-full mb-6 transition-all duration-300 ${isDragActive ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-110' : 'bg-dark-700 text-emerald-500 group-hover:scale-110 group-hover:bg-dark-600'}`}>
        <UploadCloud className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-gray-200 mb-2">
        {isDragActive ? "Drop the visual context here..." : "Drag & Drop Image to Analyze"}
      </h3>
      <p className="text-gray-500 text-sm max-w-md">
        Supports JPG, PNG, WEBP. The Vision Engine will automatically extract semantics and generate SEO metadata.
      </p>
    </div>
  );
};

export default UploadZone;
