
export type ToolCategory = 'Organize' | 'Convert' | 'Edit' | 'Security' | 'AI';

export interface PDFTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  color: string;
}

export interface ProcessingState {
  status: 'idle' | 'loading' | 'processing' | 'success' | 'error';
  progress: number;
  message?: string;
  downloadUrl?: string;
  fileName?: string;
}

export interface Annotation {
  id: string;
  type: 'text' | 'image' | 'drawing';
  page: number;
  x: number;
  y: number;
  content?: string;
  width?: number;
  height?: number;
  color?: string; // Hex or RGB color string
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  isReplacement?: boolean; // If true, we white-out the area underneath
  maskWidth?: number;
  maskHeight?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface FileHistory {
  id: string;
  fileName: string;
  toolId: string;
  timestamp: number;
  size: string;
}
