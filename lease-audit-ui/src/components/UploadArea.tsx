import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, X, Plus, CheckCircle2 } from 'lucide-react';
import type { UploadedFile } from '../types';
import { parseFileDetails } from '../utils/fileReader';

interface UploadAreaProps {
  label: string;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  icon?: React.ReactNode;
}

export function UploadArea({ label, files, onFilesChange, accept, maxFiles = 5, icon }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    if (e.target) e.target.value = '';
  };

  const addFiles = async (newFiles: File[]) => {
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = newFiles.slice(0, remainingSlots);

    const uploadedFiles: UploadedFile[] = await Promise.all(
      filesToAdd.map(async (file) => {
        let content = '';
        try {
          const res = await parseFileDetails(file);
          content = res.text;
        } catch (err) {
          console.warn('Could not read file text:', err);
        }
        return {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          content
        };
      })
    );

    onFilesChange([...files, ...uploadedFiles]);
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          {icon}
          {label}
        </label>
        <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          {files.length}/{maxFiles} {maxFiles === 1 ? 'file' : 'files'}
        </span>
      </div>

      <motion.div
        whileHover={{ borderColor: 'rgba(99, 102, 241, 0.5)' }}
        onClick={() => {
          if (files.length < maxFiles) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative border-2 border-dashed rounded-2xl p-5 transition-all glass-panel cursor-pointer ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10 glow-indigo'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={accept}
          className="hidden"
          onChange={handleFileSelect}
        />

        {files.length === 0 ? (
          <div className="text-center py-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3 shadow-inner"
            >
              <Upload className="w-6 h-6" />
            </motion.div>
            <p className="text-sm font-medium text-slate-200 mb-1">
              Drag & drop {label.toLowerCase()} here, or <span className="text-indigo-400 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports .txt, .pdf, .docx, .xlsx, .csv
            </p>
          </div>
        ) : (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <AnimatePresence mode="popLayout">
              {files.map((uploadedFile, index) => (
                <motion.div
                  key={uploadedFile.name + index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-100 truncate max-w-[220px]">
                        {uploadedFile.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{uploadedFile.size ? (uploadedFile.size / 1024).toFixed(1) + ' KB' : 'Loaded'}</span>
                        <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Text Loaded
                        </span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.15, color: '#f43f5e' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg bg-slate-900/50 border border-slate-700/50"
                    aria-label="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>

            {files.length < maxFiles && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-xl hover:bg-indigo-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add additional file
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}