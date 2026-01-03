
import React, { useState, useEffect } from 'react';
import { Header, Footer } from './components/Layout';
import { ToolCard } from './components/ToolCard';
import { FileUploader } from './components/FileUploader';
import { AuthModal } from './components/AuthModal';
import { TOOLS, getIcon } from './constants';
import { PDFTool, ProcessingState, Annotation, User, FileHistory } from './types';
import { 
  mergePDFs, 
  rotatePDF, 
  splitPDF, 
  downloadBlob, 
  addAnnotationsToPDF,
  compressPDF,
  jpgToPdf,
  pdfToJpg
} from './services/pdfService';
import { 
  summarizeDocument, 
  chatWithDocument, 
  extractTextFromPdfPlaceholder,
  performAIOCR,
  enhanceDocument
} from './services/geminiService';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { Canvas } from './components/PDFEditor/Canvas';
import { Toolbar } from './components/PDFEditor/Toolbar';
import { Loader2, ArrowLeft, Download, CheckCircle2, AlertCircle, MessageSquare, Send, BrainCircuit, ScanText, Clock, File, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTool, setActiveTool] = useState<PDFTool | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingState>({ status: 'idle', progress: 0 });
  const [history, setHistory] = useState<FileHistory[]>([]);
  
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string>("");
  const [imageResults, setImageResults] = useState<string[]>([]);
  
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setHistory(storageService.getHistory(currentUser.id));
    }
  }, []);

  const handleToolSelect = (tool: PDFTool) => {
    setActiveTool(tool);
    setFiles([]);
    setStatus({ status: 'idle', progress: 0 });
    setAiResult("");
    setImageResults([]);
    setChatHistory([]);
    setAnnotations([]);
    setSelectedAnnotationId(null);
  };

  const reset = () => {
    setActiveTool(null);
    setFiles([]);
    setStatus({ status: 'idle', progress: 0 });
    setAnnotations([]);
    setSelectedAnnotationId(null);
    setAiResult("");
    setImageResults([]);
    if (user) setHistory(storageService.getHistory(user.id));
  };

  const processPDF = async () => {
    if (files.length === 0) return;
    setStatus({ status: 'processing', progress: 30, message: `Applying Mannu ${activeTool?.name} engine...` });
    
    try {
      let result: any = null;
      let downloadName = `mannu_editor_${activeTool?.id}_${Date.now()}`;

      switch (activeTool?.id) {
        case 'merge':
          result = await mergePDFs(files);
          downloadBlob(result, `${downloadName}.pdf`, "application/pdf");
          break;
        case 'split':
          const splits = await splitPDF(files[0]);
          splits.forEach((s, i) => downloadBlob(s, `${downloadName}_part_${i+1}.pdf`, "application/pdf"));
          break;
        case 'compress':
          result = await compressPDF(files[0]);
          downloadBlob(result, `${downloadName}_compressed.pdf`, "application/pdf");
          break;
        case 'rotate':
          result = await rotatePDF(files[0], 90);
          downloadBlob(result, `${downloadName}_rotated.pdf`, "application/pdf");
          break;
        case 'jpg-to-pdf':
          result = await jpgToPdf(files);
          downloadBlob(result, `${downloadName}.pdf`, "application/pdf");
          break;
        case 'pdf-to-jpg':
          const imgs = await pdfToJpg(files[0]);
          setImageResults(imgs);
          break;
        case 'edit':
          result = await addAnnotationsToPDF(files[0], annotations);
          downloadBlob(result, `${downloadName}_edited.pdf`, "application/pdf");
          break;
        case 'summarize':
          const textSum = await extractTextFromPdfPlaceholder(files[0]);
          const summary = await summarizeDocument(textSum);
          setAiResult(summary);
          break;
        case 'ai-enhance':
          const textEnhance = await extractTextFromPdfPlaceholder(files[0]);
          const enhanced = await enhanceDocument(textEnhance);
          setAiResult(enhanced);
          break;
        case 'ocr':
          const ocrText = await performAIOCR(files[0]);
          setAiResult(ocrText);
          break;
      }

      if (user && activeTool) {
        storageService.saveToHistory(user.id, {
          fileName: files[0].name,
          toolId: activeTool.id,
          size: (files[0].size / 1024 / 1024).toFixed(2) + ' MB'
        });
      }

      setStatus({ status: 'success', progress: 100 });
    } catch (error) {
      console.error(error);
      setStatus({ status: 'error', progress: 0, message: "Engine failure. Please ensure your file is a valid PDF." });
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || files.length === 0) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    try {
        const text = await extractTextFromPdfPlaceholder(files[0]);
        const response = await chatWithDocument(text, userMsg, chatHistory);
        setChatHistory(prev => [...prev, { role: 'model', content: response }]);
    } catch (e) {
        setChatHistory(prev => [...prev, { role: 'model', content: "AI link severed. Try again later." }]);
    }
  };

  const deleteSelectedAnnotation = () => {
    if (selectedAnnotationId) {
      setAnnotations(prev => prev.filter(a => a.id !== selectedAnnotationId));
      setSelectedAnnotationId(null);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col font-['Plus_Jakarta_Sans'] text-slate-900 bg-slate-50">
      <Header 
        onHome={reset} 
        user={user} 
        onAuthClick={() => setShowAuth(true)} 
        onLogout={handleLogout}
      />

      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          onSuccess={(u) => { setUser(u); setShowAuth(false); setHistory(storageService.getHistory(u.id)); }} 
        />
      )}

      <main className="flex-grow">
        {!activeTool ? (
          <div className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <div className="inline-block bg-indigo-100 text-indigo-700 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
                  The Future of Document Editing
                </div>
                <h1 className="text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
                  Edit PDFs with <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI Intelligence.</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                  Experience Mannu Editor—the sharpest, fastest, and most powerful 100% free PDF toolkit available online.
                </p>
              </div>

              {user && history.length > 0 && (
                <div className="mb-20">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Clock className="text-indigo-600" size={28} />
                      <h2 className="text-3xl font-black tracking-tighter">Recently Processed</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.map(item => {
                      const tool = TOOLS.find(t => t.id === item.toolId);
                      return (
                        <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-xl transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-5 overflow-hidden">
                            <div className={`${tool?.color || 'bg-slate-200'} p-4 rounded-2xl text-white shadow-lg`}>
                              {tool ? getIcon(tool.icon, 22) : <File size={22} />}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-black text-slate-800 truncate text-base mb-1 tracking-tight">{item.fileName}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                {new Date(item.timestamp).toLocaleDateString()} <span className="w-1 h-1 bg-slate-200 rounded-full"></span> {tool?.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {TOOLS.map(tool => (
                  <ToolCard key={tool.id} tool={tool} onClick={handleToolSelect} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white min-h-[calc(100vh-80px)]">
            <div className="bg-slate-900 border-b border-white/10 py-6 sticky top-20 z-40">
              <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                <button onClick={reset} className="flex items-center gap-2 text-slate-400 font-black hover:text-white transition-all text-[10px] uppercase tracking-[0.2em]">
                  <ArrowLeft size={16} /> Exit Feature
                </button>
                <div className="flex items-center gap-4">
                    <div className={`${activeTool.color} text-white p-2.5 rounded-xl shadow-xl ring-4 ring-white/10`}>
                        {getIcon(activeTool.icon, 22)}
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter uppercase">{activeTool.name}</span>
                </div>
                <div className="hidden sm:block">
                   <div className="bg-white/10 px-4 py-2 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
                      Sharp Engine v3.1
                   </div>
                </div>
              </div>
            </div>

            {activeTool.id === 'edit' && files.length > 0 ? (
                <div className="relative">
                    <Canvas 
                      file={files[0]} 
                      annotations={annotations} 
                      selectedAnnotationId={selectedAnnotationId}
                      onAnnotationSelect={setSelectedAnnotationId}
                      onAnnotationChange={(updated) => setAnnotations(prev => prev.map(a => a.id === updated.id ? updated : a))} 
                      onAddAnnotation={(ann) => setAnnotations([...annotations, ann])}
                    />
                    <Toolbar 
                      onAddText={() => {
                        const newId = Math.random().toString();
                        setAnnotations([...annotations, { id: newId, type: 'text', page: 0, x: 100, y: 100, content: 'New Text', fontSize: 24 }]);
                        setSelectedAnnotationId(newId);
                      }} 
                      onAddImage={() => alert("Image insertion requires pro module.")} 
                      onDelete={deleteSelectedAnnotation}
                      onSave={processPDF} 
                    />
                </div>
            ) : (
                <div className="max-w-6xl mx-auto px-4 py-20">
                {status.status === 'idle' && (
                    <div className="flex flex-col items-center">
                    <FileUploader 
                        files={files} 
                        onFilesAdded={(nf) => setFiles([...files, ...nf])} 
                        onFileRemoved={(idx) => setFiles(files.filter((_, i) => i !== idx))} 
                        accept={activeTool.id === 'jpg-to-pdf' ? "image/*" : "application/pdf"}
                        multiple={activeTool.id === 'merge' || activeTool.id === 'jpg-to-pdf'}
                    />
                    
                    {files.length > 0 && (
                        <div className="mt-20 w-full flex justify-center">
                        <button 
                            onClick={processPDF}
                            className={`${activeTool.color} text-white px-20 py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all flex items-center gap-5 hover:scale-[1.03] active:scale-95 shadow-indigo-200/50`}
                        >
                            {activeTool.id === 'ai-enhance' ? (
                               <><Sparkles size={28} /> AI Enhance Document</>
                            ) : activeTool.id === 'chat' || activeTool.id === 'summarize' ? (
                               <><BrainCircuit size={28} /> Start AI Deep Scan</>
                            ) : (
                               `Process ${activeTool.name}`
                            )}
                        </button>
                        </div>
                    )}
                    </div>
                )}

                {status.status === 'processing' && (
                    <div className="flex flex-col items-center justify-center py-32">
                    <div className="relative mb-16 scale-125">
                        <div className={`absolute inset-0 animate-ping opacity-20 rounded-full ${activeTool.color}`}></div>
                        <Loader2 className={`animate-spin ${activeTool.color.replace('bg-', 'text-')} relative z-10`} size={96} />
                    </div>
                    <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase">{status.message}</h2>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[12px] opacity-60">Mannu AI Synthesis in Progress</p>
                    </div>
                )}

                {status.status === 'success' && (
                    <div className="flex flex-col items-center py-10 animate-in fade-in zoom-in duration-500">
                    <div className="bg-emerald-500 text-white p-10 rounded-[3rem] mb-12 shadow-2xl shadow-emerald-100 ring-8 ring-emerald-50">
                        <CheckCircle2 size={84} />
                    </div>
                    <h2 className="text-6xl font-black mb-4 tracking-tighter">Sharp Success!</h2>
                    <p className="text-xl text-slate-500 mb-16 font-bold uppercase tracking-widest text-[13px]">Document processing finalized.</p>
                    
                    {imageResults.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-16">
                            {imageResults.map((src, i) => (
                                <div key={i} className="group relative rounded-[3rem] overflow-hidden border-4 border-slate-50 shadow-sm transition-all hover:shadow-2xl">
                                    <img src={src} className="w-full h-auto" alt={`Page ${i+1}`} />
                                    <button 
                                        onClick={() => downloadBlob(new Blob(), `page_${i+1}.jpg`, 'image/jpeg')} 
                                        className="absolute inset-0 bg-indigo-900/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-3"
                                    >
                                        <Download size={32} />
                                        <span className="font-black uppercase text-[10px] tracking-widest">Download Page {i+1}</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {aiResult && (
                        <div className="bg-white border-4 border-slate-50 p-12 rounded-[4rem] text-left max-w-5xl w-full mb-20 shadow-2xl shadow-indigo-100/30">
                           <div className="flex items-center justify-between mb-12">
                               <div className="flex items-center gap-4 text-indigo-600">
                                    {activeTool.id === 'ocr' ? <ScanText size={36} /> : <BrainCircuit size={36} />}
                                    <h3 className="text-3xl font-black tracking-tighter uppercase">
                                        {activeTool.id === 'ocr' ? 'Text Results' : 'AI Analysis output'}
                                    </h3>
                               </div>
                               <button className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl hover:bg-indigo-100 transition-all">
                                   <Download size={20} />
                               </button>
                           </div>
                           <div className="prose prose-indigo max-w-none">
                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-xl font-medium bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100">{aiResult}</div>
                           </div>
                        </div>
                    )}

                    {activeTool.id === 'chat' && (
                        <div className="w-full max-w-5xl flex flex-col h-[800px] border-8 border-slate-50 rounded-[4rem] bg-white overflow-hidden shadow-2xl mb-20">
                            <div className="bg-indigo-600 p-10 flex items-center justify-between">
                                <div className="flex items-center gap-5 text-white">
                                    <div className="bg-white/20 p-3 rounded-2xl">
                                        <MessageSquare size={32} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-3xl tracking-tighter uppercase">Mannu Assistant</span>
                                        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Real-time Document Intelligence</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto p-12 space-y-10 bg-slate-50/20">
                                {chatHistory.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                        <div className="bg-white p-12 rounded-[3rem] shadow-inner mb-8 border border-slate-100">
                                            <MessageSquare size={72} className="opacity-10" />
                                        </div>
                                        <p className="font-black text-3xl tracking-tighter uppercase text-slate-400 opacity-60">Ready to analyze.</p>
                                    </div>
                                )}
                                {chatHistory.map((chat, i) => (
                                    <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-10 rounded-[3rem] text-xl font-bold shadow-sm leading-relaxed ${chat.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-indigo-100/20'}`}>
                                            {chat.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-10 bg-white border-t border-slate-100 flex gap-6">
                                <input 
                                    type="text" 
                                    placeholder="Type a message to Mannu AI..."
                                    className="flex-grow px-10 py-6 rounded-[2.5rem] bg-slate-50 border-4 border-transparent outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-xl shadow-inner"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                                />
                                <button 
                                    onClick={handleChat}
                                    className="bg-indigo-600 text-white p-6 rounded-[2.5rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-90"
                                >
                                    <Send size={32} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {!aiResult && !imageResults.length && activeTool.id !== 'chat' && (
                        <div className="mb-20 text-center bg-indigo-600 p-16 rounded-[4rem] shadow-2xl shadow-indigo-200">
                            <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Synthesis Complete</h3>
                            <p className="text-indigo-100 font-bold uppercase tracking-[0.2em] text-xs">Your download should begin in seconds</p>
                            <button 
                                onClick={() => processPDF()}
                                className="mt-8 bg-white text-indigo-600 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all"
                            >
                                Re-download File
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-8 mb-20">
                        <button onClick={reset} className="bg-slate-900 text-white px-16 py-6 rounded-[2.5rem] font-black text-xl hover:bg-black transition-all shadow-2xl uppercase tracking-tighter">
                            Back to Tools
                        </button>
                    </div>
                    </div>
                )}

                {status.status === 'error' && (
                    <div className="flex flex-col items-center py-20 text-center">
                    <div className="bg-rose-500 text-white p-12 rounded-[4rem] mb-12 shadow-2xl shadow-rose-200">
                        <AlertCircle size={96} />
                    </div>
                    <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase">Process Aborted</h2>
                    <p className="text-xl text-slate-500 mb-16 max-w-xl mx-auto font-bold">{status.message}</p>
                    <button 
                        onClick={() => setStatus({ status: 'idle', progress: 0 })}
                        className="bg-rose-600 text-white px-16 py-6 rounded-[2.5rem] font-black hover:bg-rose-700 transition-all shadow-2xl uppercase tracking-tighter"
                    >
                        Restart Module
                    </button>
                    </div>
                )}
                </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
