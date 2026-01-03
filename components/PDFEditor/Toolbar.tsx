
import React from 'react';
import { Type, Image, MousePointer2, Eraser, Undo, Redo, Save, Trash2, CheckCircle } from 'lucide-react';

interface ToolbarProps {
  onAddText: () => void;
  onAddImage: () => void;
  onDelete: () => void;
  onSave: () => void;
  activeMode?: 'select' | 'text' | 'image' | 'eraser';
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAddText, onAddImage, onDelete, onSave, activeMode = 'select' }) => {
  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-3xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.2)] border border-slate-200 rounded-[3rem] px-10 py-6 flex items-center space-x-2 z-50 animate-in slide-in-from-bottom-12 duration-700">
      <button 
        className={`p-5 rounded-[1.5rem] transition-all group ${activeMode === 'select' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`} 
        title="Selection Mode"
      >
        <MousePointer2 size={24} className="group-hover:scale-110 transition-transform" />
      </button>
      
      <div className="w-px h-10 bg-slate-100 mx-2" />
      
      <button 
        onClick={onAddText}
        className={`p-5 rounded-[1.5rem] transition-all group ${activeMode === 'text' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`} 
        title="Add Text Element"
      >
        <Type size={24} className="group-hover:scale-110 transition-transform" />
      </button>
      
      <button 
        onClick={onAddImage}
        className={`p-5 rounded-[1.5rem] transition-all group ${activeMode === 'image' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`} 
        title="Insert Image"
      >
        <Image size={24} className="group-hover:scale-110 transition-transform" />
      </button>
      
      <button 
        className={`p-5 rounded-[1.5rem] transition-all group ${activeMode === 'eraser' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`} 
        title="Eraser Layer"
      >
        <Eraser size={24} className="group-hover:scale-110 transition-transform" />
      </button>
      
      <button 
        onClick={onDelete}
        className="p-5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-[1.5rem] transition-all group" 
        title="Delete Selection"
      >
        <Trash2 size={24} className="group-hover:scale-110 group-hover:rotate-6 transition-transform" />
      </button>
      
      <div className="w-px h-10 bg-slate-100 mx-4" />
      
      <button 
        onClick={onSave}
        className="bg-indigo-600 text-white pl-10 pr-12 py-5 rounded-[2rem] font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-4 active:scale-95 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <CheckCircle size={22} className="group-hover:scale-125 transition-transform" />
        <span className="text-lg tracking-tight">Finish & Download</span>
      </button>
    </div>
  );
};
