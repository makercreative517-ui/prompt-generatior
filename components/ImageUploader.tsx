import React, { useCallback, useState, useEffect } from 'react';
import { UploadIcon, ImageIcon } from './Icons';
import { ImageFile } from '../types';
import { fileToBase64 } from '../utils';

interface ImageUploaderProps {
  onImageSelected: (image: ImageFile) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      onImageSelected({
        file,
        previewUrl,
        base64,
        mimeType: file.type
      });
    } catch (err) {
      console.error(err);
      alert('Failed to process image');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Handle Global Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          processFile(file);
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [disabled]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative group cursor-pointer transition-all duration-300 ease-out
        border-2 border-dashed rounded-2xl p-10
        flex flex-col items-center justify-center text-center
        bg-slate-900/50 backdrop-blur-sm
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
          : 'border-slate-700 hover:border-indigo-400 hover:bg-slate-800/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={disabled}
      />
      
      <div className={`p-4 rounded-full bg-slate-800 mb-4 ring-1 ring-slate-700 group-hover:ring-indigo-500/50 transition-all ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400'}`}>
        <UploadIcon className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        Upload or Paste Image
      </h3>
      <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
        Drag & drop an image here, click to browse, or just <span className="font-mono text-indigo-400 bg-indigo-400/10 px-1 rounded">Ctrl+V</span> anywhere.
      </p>
    </div>
  );
};

export default ImageUploader;