
import React from 'react';
import { 
  Merge, 
  Scissors, 
  FileArchive, 
  FileText, 
  Image as ImageIcon, 
  Type, 
  RotateCw, 
  Lock, 
  Unlock, 
  FileUp,
  BrainCircuit,
  MessageSquareText,
  ScanText,
  Sparkles
} from 'lucide-react';
import { PDFTool } from './types';

export const TOOLS: PDFTool[] = [
  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one single document seamlessly.',
    icon: 'Merge',
    category: 'Organize',
    color: 'bg-indigo-600'
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Extract specific pages or split every page into separate files.',
    icon: 'Scissors',
    category: 'Organize',
    color: 'bg-violet-500'
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Optimize your PDF for web and email without losing quality.',
    icon: 'FileArchive',
    category: 'Convert',
    color: 'bg-blue-600'
  },
  {
    id: 'edit',
    name: 'Edit PDF',
    description: 'Full-featured editor: add text, images, and annotations directly.',
    icon: 'Type',
    category: 'Edit',
    color: 'bg-emerald-600'
  },
  {
    id: 'ai-enhance',
    name: 'AI Smart Editor',
    description: 'Let AI intelligently improve, fix grammar, or rewrite your PDF content.',
    icon: 'Sparkles',
    category: 'AI',
    color: 'bg-gradient-to-r from-indigo-600 to-purple-600'
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Turn your PDF pages into high-resolution JPG images instantly.',
    icon: 'ImageIcon',
    category: 'Convert',
    color: 'bg-amber-500'
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert any image format into a professional PDF document.',
    icon: 'FileUp',
    category: 'Convert',
    color: 'bg-rose-500'
  },
  {
    id: 'rotate',
    name: 'Rotate PDF',
    description: 'Fix the orientation of your PDF pages with one simple click.',
    icon: 'RotateCw',
    category: 'Organize',
    color: 'bg-purple-600'
  },
  {
    id: 'summarize',
    name: 'AI Summarize',
    description: 'Instant summaries of any long document using Gemini AI.',
    icon: 'BrainCircuit',
    category: 'AI',
    color: 'bg-fuchsia-600'
  },
  {
    id: 'chat',
    name: 'Chat with PDF',
    description: 'Ask questions and extract data from your document via AI.',
    icon: 'MessageSquareText',
    category: 'AI',
    color: 'bg-sky-600'
  },
  {
    id: 'ocr',
    name: 'AI OCR',
    description: 'Turn scans into searchable, editable text perfectly.',
    icon: 'ScanText',
    category: 'AI',
    color: 'bg-teal-600'
  }
];

export const getIcon = (iconName: string, size = 24) => {
  switch (iconName) {
    case 'Merge': return <Merge size={size} />;
    case 'Scissors': return <Scissors size={size} />;
    case 'FileArchive': return <FileArchive size={size} />;
    case 'FileText': return <FileText size={size} />;
    case 'ImageIcon': return <ImageIcon size={size} />;
    case 'Type': return <Type size={size} />;
    case 'RotateCw': return <RotateCw size={size} />;
    case 'Lock': return <Lock size={size} />;
    case 'Unlock': return <Unlock size={size} />;
    case 'FileUp': return <FileUp size={size} />;
    case 'BrainCircuit': return <BrainCircuit size={size} />;
    case 'MessageSquareText': return <MessageSquareText size={size} />;
    case 'ScanText': return <ScanText size={size} />;
    case 'Sparkles': return <Sparkles size={size} />;
    default: return <FileText size={size} />;
  }
};
