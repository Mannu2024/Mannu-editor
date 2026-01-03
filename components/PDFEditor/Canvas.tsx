
import React, { useState, useEffect, useRef } from 'react';
import { Annotation } from '../../types';

declare const pdfjsLib: any;

interface CanvasProps {
  file: File;
  annotations: Annotation[];
  selectedAnnotationId: string | null;
  onAnnotationSelect: (id: string | null) => void;
  onAnnotationChange: (ann: Annotation) => void;
  onAddAnnotation: (ann: Annotation) => void;
}

interface DetectedText {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontName: string;
  color: string;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  file, 
  annotations, 
  selectedAnnotationId,
  onAnnotationSelect,
  onAnnotationChange,
  onAddAnnotation
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [detectedText, setDetectedText] = useState<DetectedText[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const SCALE = 1.5;

  useEffect(() => {
    const renderPage = async () => {
      if (!file) return;
      setLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setNumPages(pdf.numPages);
        
        const page = await pdf.getPage(currentPage + 1);
        const viewport = page.getViewport({ scale: SCALE });
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const textContent = await page.getTextContent();
        
        // Attempt to extract styling more accurately
        const detected: DetectedText[] = textContent.items.map((item: any) => {
          const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
          const style = textContent.styles[item.fontName] || {};
          
          return {
            str: item.str,
            x: tx[4],
            y: tx[5] - (item.height * SCALE),
            w: item.width * SCALE,
            h: item.height * SCALE,
            fontName: style.fontFamily || 'sans-serif',
            color: '#000000' // Defaulting to black, as getTextContent lacks direct color data without custom renderer
          };
        }).filter((item: any) => item.str.trim().length > 0);
        
        setDetectedText(detected);
      } catch (error) {
        console.error("Error rendering PDF:", error);
      } finally {
        setLoading(false);
      }
    };

    renderPage();
  }, [file, currentPage]);

  const handleDetectedTextClick = (text: DetectedText) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newAnnotation: Annotation = {
      id: newId,
      type: 'text',
      page: currentPage,
      x: text.x,
      y: text.y,
      content: text.str,
      fontSize: text.h / 0.75,
      fontFamily: text.fontName,
      color: text.color,
      isReplacement: true,
      maskWidth: text.w + 6,
      maskHeight: text.h + 4
    };
    onAddAnnotation(newAnnotation);
    onAnnotationSelect(newId);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === canvasRef.current) {
      onAnnotationSelect(null);
    }
  };

  return (
    <div className="flex flex-col items-center py-12 px-4 bg-slate-100 min-h-[calc(100vh-80px)] overflow-y-auto" onClick={handleContainerClick}>
      <div 
        ref={containerRef}
        className="max-w-fit w-full bg-white shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] relative mb-24 rounded-sm overflow-hidden border border-slate-200"
        style={{ minHeight: '842px', minWidth: '595px' }}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20 backdrop-blur-sm">
             <div className="w-16 h-16 border-[6px] border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
             <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Mannu AI Analyzing Layers...</p>
          </div>
        )}

        <canvas ref={canvasRef} className="block mx-auto" />

        {/* Text Detection Layer */}
        {!loading && (
          <div className="absolute inset-0 z-5 pointer-events-none">
            {detectedText.map((text, idx) => {
              const isAlreadyAnnotated = annotations.some(a => a.page === currentPage && Math.abs(a.x - text.x) < 5 && Math.abs(a.y - text.y) < 5);
              if (isAlreadyAnnotated) return null;

              return (
                <div 
                  key={`detect-${idx}`}
                  style={{ 
                    left: text.x - 2, 
                    top: text.y - 1, 
                    width: text.w + 4, 
                    height: text.h + 2 
                  }}
                  onClick={() => handleDetectedTextClick(text)}
                  className="absolute pointer-events-auto cursor-text hover:bg-indigo-600/10 hover:border-2 hover:border-indigo-400/40 rounded-sm transition-all"
                />
              );
            })}
          </div>
        )}

        {/* Active Annotations Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {annotations.filter(a => a.page === currentPage).map(ann => {
            const isSelected = ann.id === selectedAnnotationId;
            return (
              <div 
                key={ann.id}
                style={{ left: ann.x, top: ann.y }}
                className={`absolute pointer-events-auto cursor-text group ${isSelected ? 'z-20' : 'z-10'}`}
                onClick={(e) => { e.stopPropagation(); onAnnotationSelect(ann.id); }}
              >
                {ann.type === 'text' && (
                  <div className="relative">
                    {ann.isReplacement && (
                      <div 
                        className="absolute bg-white -z-10" 
                        style={{ width: ann.maskWidth, height: ann.maskHeight, left: -2, top: -2 }}
                      />
                    )}
                    <input 
                      type="text"
                      value={ann.content}
                      onChange={(e) => onAnnotationChange({ ...ann, content: e.target.value })}
                      autoFocus={isSelected}
                      spellCheck={false}
                      className={`bg-transparent outline-none px-1 transition-all min-w-[10px] ${
                        isSelected 
                          ? 'border-[3px] border-dashed border-indigo-600 ring-[12px] ring-indigo-50 bg-white/50' 
                          : 'border-2 border-transparent hover:border-indigo-300'
                      }`}
                      style={{ 
                        fontSize: (ann.fontSize || 24) / 1.5 + 'px', 
                        height: ann.maskHeight,
                        color: ann.color || '#000',
                        fontFamily: ann.fontFamily || 'Plus Jakarta Sans',
                        fontWeight: 'bold'
                      }}
                    />
                    {isSelected && (
                      <div className="absolute -bottom-8 left-0 flex gap-1 animate-in slide-in-from-top-1">
                         <div className="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-[0.2em] shadow-lg flex items-center gap-1 whitespace-nowrap">
                            Editing Element
                         </div>
                         <div className="bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                            {ann.fontFamily?.split(',')[0]}
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Page Navigation Overlay */}
        <div className="absolute top-8 right-8 bg-white/80 backdrop-blur-xl border border-slate-200/50 px-6 py-4 rounded-3xl flex items-center gap-6 shadow-2xl z-30">
            <button 
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} 
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-800 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all font-black text-xs"
            >
              &lt;
            </button>
            <span className="font-black text-sm tracking-tighter text-slate-400">
               <span className="text-slate-900">{currentPage + 1}</span> / {numPages}
            </span>
            <button 
              disabled={currentPage >= numPages - 1}
              onClick={() => setCurrentPage(prev => Math.min(numPages - 1, prev + 1))} 
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-800 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all font-black text-xs"
            >
              &gt;
            </button>
        </div>
      </div>
    </div>
  );
};
