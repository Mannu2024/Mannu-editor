
import React from 'react';
import { PDFTool } from '../types';
import { getIcon } from '../constants';

interface ToolCardProps {
  tool: PDFTool;
  onClick: (tool: PDFTool) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  return (
    <button 
      onClick={() => onClick(tool)}
      className="group bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-1 transition-all flex flex-col items-start text-left relative overflow-hidden h-full"
    >
      <div className={`${tool.color} text-white p-4 rounded-2xl mb-6 shadow-xl shadow-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
        {getIcon(tool.icon, 32)}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">{tool.name}</h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{tool.description}</p>
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 -mr-16 -mt-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </button>
  );
};
