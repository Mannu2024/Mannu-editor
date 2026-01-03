
import React, { useCallback } from 'react';
import { Upload, File, X, FilePlus } from 'lucide-react';

interface FileUploaderProps {
  files: File[];
  onFilesAdded: (newFiles: File[]) => void;
  onFileRemoved: (index: number) => void;
  accept?: string;
  multiple?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  files, 
  onFilesAdded, 
  onFileRemoved, 
  accept = "application/pdf",
  multiple = true 
}) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFilesAdded(droppedFiles);
  }, [onFilesAdded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {files.length === 0 ? (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-4 border-dashed border-slate-200 bg-slate-50 rounded-[4rem] p-24 flex flex-col items-center text-center group hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer shadow-inner"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <div className="bg-indigo-600 text-white p-10 rounded-[3rem] shadow-2xl shadow-indigo-100 mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <Upload size={64} strokeWidth={2} />
          </div>
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Drop Files Here</h2>
          <p className="text-slate-400 text-xl mb-12 font-bold uppercase tracking-[0.2em] opacity-60">or click to browse your system</p>
          <input 
            id="file-input"
            type="file" 
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
          />
          <button className="bg-white text-indigo-600 border-4 border-indigo-600 px-12 py-5 rounded-[2rem] font-black text-xl hover:bg-indigo-600 hover:text-white transition-all shadow-xl uppercase tracking-tighter">
            Select Documents
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[3.5rem] border-4 border-slate-50 p-12 shadow-2xl">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
               <h3 className="text-3xl font-black tracking-tighter uppercase">Selected Staging ({files.length})</h3>
            </div>
            <button 
              onClick={() => document.getElementById('file-input')?.click()}
              className="bg-indigo-50 text-indigo-600 px-8 py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-indigo-100 transition-all"
            >
              <FilePlus size={18} /> Add More Files
            </button>
            <input 
                id="file-input"
                type="file" 
                accept={accept}
                multiple={multiple}
                onChange={handleInputChange}
                className="hidden"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-5 overflow-hidden">
                  <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg">
                    <File size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-lg font-black text-slate-800 truncate tracking-tight">{file.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onFileRemoved(idx); }}
                  className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
