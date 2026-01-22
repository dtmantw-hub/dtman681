
import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { analyzeImage, transformImage } from './services/geminiService';
import { DAPPath, AppState, TransformationResult, BackgroundColor, TextOption } from './types';

const Icons = {
  Scanner: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  Reset: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Save: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Replace: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  )
};

const Header = () => (
  <header className="py-6 px-8 mb-4 relative z-20">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center sm:items-end gap-3">
      <div className="text-center sm:text-left">
        <h1 className="text-4xl md:text-5xl font-black tracking-tightest accent-text leading-none mb-1">
          VISUAL DECODER
        </h1>
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="h-[1px] w-6 bg-slate-300"></span>
          <p className="text-slate-400 font-bold tracking-[0.1em] text-[9px] uppercase">DAP PROTOCOL V5.3.0 | INSTANT DATA SYNC</p>
        </div>
      </div>
      <div className="flex flex-col items-center sm:items-end gap-1.5">
        <div className="px-3 py-1 glass rounded-lg text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest border border-slate-200/50 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
          CORE OPERATIONAL
        </div>
      </div>
    </div>
  </header>
);

const DimensionItem: React.FC<{ label: string; value: string; icon: string; delay: string; onCopy: (text: string) => void }> = ({ label, value, icon, delay, onCopy }) => (
  <div className={`p-3 glass rounded-xl border-l-2 border-cyan-500/10 hover:bg-white transition-all card-hover group animate-in fade-in slide-in-from-left-2 h-auto flex flex-col relative ${delay}`}>
    <div className="flex justify-between items-start mb-1">
      <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[8px] uppercase tracking-widest shrink-0">
        <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">{icon}</span>
        {label}
      </div>
      {value && (
        <button 
          onClick={() => onCopy(`${label}: ${value}`)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-cyan-600 transition-all active:scale-90"
          title={`複製${label}`}
        >
          <Icons.Copy />
        </button>
      )}
    </div>
    <p className="text-[11px] font-semibold text-slate-600 leading-normal break-words whitespace-normal pr-4">
      {value || 'Waiting...'}
    </p>
  </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    sourceImage: null,
    isAnalyzing: false,
    isTransforming: false,
    analysis: null,
    selectedPath: DAPPath.STYLE_TRANSFER,
    selectedBgColor: BackgroundColor.AUTO,
    selectedTextOption: TextOption.NONE,
    selectedAspectRatio: '1:1',
    gridConfig: { rows: 1, cols: 1 },
    pivotInput: '',
    pivotImages: [],
    result: null,
    errorMessage: null,
    gallery: JSON.parse(localStorage.getItem('decoder_gallery') || '[]')
  });

  const [customRatio, setCustomRatio] = useState('');
  const [showGridModal, setShowGridModal] = useState(false);
  const [selectedGridPreset, setSelectedGridPreset] = useState<{ r: number; c: number }>({ r: 3, c: 3 });
  const [hLines, setHLines] = useState<number[]>([]);
  const [vLines, setVLines] = useState<number[]>([]);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const [draggingLine, setDraggingLine] = useState<{ type: 'h' | 'v', index: number } | null>(null);

  const supportedRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];

  useEffect(() => {
    localStorage.setItem('decoder_gallery', JSON.stringify(state.gallery));
  }, [state.gallery]);

  useEffect(() => {
    if (state.errorMessage) {
      const timer = setTimeout(() => setState(prev => ({ ...prev, errorMessage: null })), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.errorMessage]);

  useEffect(() => {
    if (showGridModal) {
      const { r, c } = selectedGridPreset;
      const safeR = Math.max(1, r);
      const safeC = Math.max(1, c);
      setHLines(Array.from({ length: safeR - 1 }, (_, i) => (i + 1) / safeR));
      setVLines(Array.from({ length: safeC - 1 }, (_, i) => (i + 1) / safeC));
    }
  }, [showGridModal, selectedGridPreset]);

  const handleSourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setState(prev => ({ ...prev, sourceImage: base64, analysis: null, result: null, isAnalyzing: true, errorMessage: null }));
      try {
        const analysis = await analyzeImage(base64);
        setState(prev => ({ ...prev, analysis, isAnalyzing: false }));
      } catch (err) {
        setState(prev => ({ ...prev, isAnalyzing: false, errorMessage: "協議解析失敗" }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  const handlePivotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const filePromises = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = () => reject();
        reader.readAsDataURL(file);
      });
    });

    try {
      const base64Results = await Promise.all(filePromises);
      setState(prev => ({ 
        ...prev, 
        pivotImages: [...prev.pivotImages, ...base64Results].slice(0, 3) 
      }));
    } catch (err) {
      setState(prev => ({ ...prev, errorMessage: "參考圖注入失敗" }));
    }
    
    e.target.value = '';
  };

  const removePivotImage = (index: number) => {
    setState(prev => ({ ...prev, pivotImages: prev.pivotImages.filter((_, i) => i !== index) }));
  };

  const resetAll = () => {
    setState(prev => ({
      ...prev,
      sourceImage: null,
      analysis: null,
      result: null,
      pivotImages: [],
      pivotInput: '',
      isAnalyzing: false,
      isTransforming: false,
      gridConfig: { rows: 1, cols: 1 }
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setState(prev => ({ ...prev, errorMessage: "內容已複製到剪貼簿" }));
    });
  };

  const handleCopyAllAnalysis = () => {
    if (!state.analysis) return;
    const { subject, action, style, lighting, color, composition, environment, texture } = state.analysis;
    const text = `主題: ${subject}\n動作: ${action}\n風格: ${style}\n光影: ${lighting}\n色彩: ${color}\n構圖: ${composition}\n環境: ${environment}\n質感: ${texture}`;
    copyToClipboard(text);
  };

  const handleTransform = async () => {
    if (!state.analysis) return;
    setState(prev => ({ ...prev, isTransforming: true, errorMessage: null }));
    try {
      const finalRatio = supportedRatios.includes(state.selectedAspectRatio) 
        ? state.selectedAspectRatio 
        : (customRatio || '1:1');

      const result = await transformImage(
        state.analysis, 
        state.selectedPath, 
        state.pivotInput, 
        state.pivotImages, 
        state.selectedBgColor, 
        state.selectedTextOption,
        finalRatio,
        state.gridConfig
      );
      setState(prev => ({ ...prev, result, isTransforming: false }));
    } catch (err) {
      setState(prev => ({ ...prev, isTransforming: false, errorMessage: "實體合成失敗" }));
    }
  };

  const updateResultMetadata = (updates: Partial<TransformationResult>) => {
    if (!state.result) return;
    const updatedResult = { ...state.result, ...updates };
    setState(prev => ({
      ...prev,
      result: updatedResult,
      gallery: prev.gallery.map(item => item.id === updatedResult.id ? updatedResult : item)
    }));
  };

  const saveToGallery = () => {
    if (!state.result) return;
    const alreadyInGallery = state.gallery.some(item => item.id === state.result?.id);
    if (!alreadyInGallery) {
      setState(prev => ({ ...prev, gallery: [state.result!, ...prev.gallery], errorMessage: "實體已入庫" }));
    } else {
      setState(prev => ({ ...prev, errorMessage: "實體已存在於庫中" }));
    }
  };

  const deleteFromGallery = (id: string) => {
    setState(prev => ({ 
      ...prev, 
      gallery: prev.gallery.filter(item => item.id !== id),
      result: prev.result?.id === id ? null : prev.result,
      errorMessage: "實體已從庫中移除" 
    }));
  };

  const downloadResultImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `decoder_output_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setState(prev => ({ ...prev, errorMessage: "開始下載圖片" }));
  };

  const splitAndDownloadZip = async (imageUrl: string) => {
    try {
      const img = new Image();
      img.src = imageUrl;
      await new Promise<void>((resolve) => img.onload = () => resolve());
      const zip = new JSZip();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const yBoundaries = [0, ...[...hLines].sort((a,b)=>a-b), 1];
      const xBoundaries = [0, ...[...vLines].sort((a,b)=>a-b), 1];
      for (let r = 0; r < yBoundaries.length - 1; r++) {
        for (let c = 0; c < xBoundaries.length - 1; c++) {
          const sx = xBoundaries[c] * img.width;
          const sy = yBoundaries[r] * img.height;
          const sw = (xBoundaries[c+1] - xBoundaries[c]) * img.width;
          const sh = (yBoundaries[r+1] - yBoundaries[r]) * img.height;
          canvas.width = sw; canvas.height = sh;
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
          zip.file(`split_r${r+1}_c${c+1}.png`, canvas.toDataURL('image/png').split(',')[1], { base64: true });
        }
      }
      // Fixed: Cast the result of generateAsync to Blob to avoid 'unknown' type error when passing to URL.createObjectURL.
      const zipBlob = (await zip.generateAsync({ type: 'blob' })) as Blob;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `decoder_split_${Date.now()}.zip`;
      link.click();
      setState(prev => ({ ...prev, errorMessage: "分割完成" }));
    } catch (err) {
      setState(prev => ({ ...prev, errorMessage: "分割錯誤" }));
    } finally {
      setShowGridModal(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingLine || !gridContainerRef.current) return;
    const rect = gridContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    if (draggingLine.type === 'h') {
      const next = [...hLines]; next[draggingLine.index] = y; setHLines(next);
    } else {
      const next = [...vLines]; next[draggingLine.index] = x; setVLines(next);
    }
  };

  return (
    <div className="min-h-screen pb-16 grid-bg selection:bg-cyan-500/10" 
         onMouseMove={handleMouseMove} onTouchMove={handleMouseMove} 
         onMouseUp={() => setDraggingLine(null)} onTouchEnd={() => setDraggingLine(null)}>
      
      <Header />

      <input type="file" ref={sourceInputRef} className="hidden" onChange={handleSourceUpload} accept="image/*" />

      {state.errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-1 fade-in">
          <div className="px-5 py-2 rounded-full bg-white border border-slate-200 shadow-xl text-slate-700 text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            {state.errorMessage}
          </div>
        </div>
      )}

      {showGridModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in">
          <div className="glass p-8 rounded-[2rem] max-w-4xl w-full border-white flex flex-col md:flex-row gap-6 overflow-y-auto max-h-[95vh]">
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">宮格分割下載</h3>
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden select-none touch-none shadow-sm border border-slate-100" ref={gridContainerRef}>
                <img src={state.result?.imageUrl} className="w-full h-full object-contain" />
                {hLines.map((y, i) => (
                  <div key={`h-${i}`} className="absolute left-0 right-0 h-0.5 border-t border-cyan-500 cursor-ns-resize z-20" style={{ top: `${y * 100}%` }} onMouseDown={() => setDraggingLine({ type: 'h', index: i })} onTouchStart={() => setDraggingLine({ type: 'h', index: i })} />
                ))}
                {vLines.map((x, i) => (
                  <div key={`v-${i}`} className="absolute top-0 bottom-0 w-0.5 border-l border-purple-500 cursor-ew-resize z-20" style={{ left: `${x * 100}%` }} onMouseDown={() => setDraggingLine({ type: 'v', index: i })} onTouchStart={() => setDraggingLine({ type: 'v', index: i })} />
                ))}
              </div>
            </div>
            <div className="md:w-64 space-y-5 pt-4">
              <div className="space-y-3">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">快速佈局 (Presets)</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{l:'2x2',r:2,c:2},{l:'3x3',r:3,c:3},{l:'4x4',r:4,c:4},{l:'1x3',r:1,c:3}].map(p=>(
                    <button key={p.l} onClick={()=>setSelectedGridPreset({r:p.r,c:p.c})} className={`py-2 rounded-xl border text-[9px] font-black transition-all ${selectedGridPreset.r===p.r && selectedGridPreset.c===p.c ?'bg-cyan-500/10 border-cyan-500 text-cyan-700':'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>{p.l}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">自定義分割 (Custom Matrix)</label>
                <div className="flex items-center gap-2">
                   <div className="flex-1 space-y-1">
                      <span className="text-[7px] font-bold text-slate-400 uppercase ml-1">Rows</span>
                      <input 
                        type="number" min="1" max="20"
                        value={selectedGridPreset.r}
                        onChange={(e) => setSelectedGridPreset(prev => ({ ...prev, r: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-white text-[10px] font-black text-center focus:border-cyan-500 outline-none transition-all"
                      />
                   </div>
                   <span className="text-slate-300 font-bold mt-4">×</span>
                   <div className="flex-1 space-y-1">
                      <span className="text-[7px] font-bold text-slate-400 uppercase ml-1">Cols</span>
                      <input 
                        type="number" min="1" max="20"
                        value={selectedGridPreset.c}
                        onChange={(e) => setSelectedGridPreset(prev => ({ ...prev, c: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-white text-[10px] font-black text-center focus:border-cyan-500 outline-none transition-all"
                      />
                   </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button onClick={()=>splitAndDownloadZip(state.result!.imageUrl)} className="w-full py-4 rounded-2xl accent-gradient text-white font-black text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">生成並下載 ZIP</button>
                <button onClick={()=>setShowGridModal(false)} className="w-full py-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest hover:text-slate-600 transition-colors">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <section className="glass p-5 rounded-[2rem] border-white shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-md font-black flex items-center gap-2 text-slate-800">
                <span className="w-7 h-7 rounded-xl accent-gradient flex items-center justify-center text-white text-[9px]">01</span>
                視覺解離掃描
              </h2>
              {state.sourceImage && (
                <div className="flex gap-1">
                  {state.analysis && (
                    <button onClick={handleCopyAllAnalysis} className="p-1.5 glass rounded-lg text-slate-400 hover:text-cyan-600 transition-all active:scale-90" title="複製全部分析結果">
                      <Icons.Copy />
                    </button>
                  )}
                  <button onClick={() => sourceInputRef.current?.click()} className="p-1.5 glass rounded-lg text-slate-400 hover:text-cyan-600 transition-all" title="更換素材">
                    <Icons.Replace />
                  </button>
                  <button onClick={resetAll} className="p-1.5 glass rounded-lg text-slate-400 hover:text-red-500 transition-all" title="重置">
                    <Icons.Reset />
                  </button>
                </div>
              )}
            </div>
            
            {!state.sourceImage ? (
              <label className="flex flex-col items-center justify-center w-full h-[280px] border-2 border-dashed border-slate-200 rounded-[1.5rem] cursor-pointer bg-white/40 hover:bg-white/70 hover:border-cyan-400/50 transition-all group relative">
                <div className="text-center p-6" onClick={() => sourceInputRef.current?.click()}>
                   <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-cyan-500 group-hover:shadow-md transition-all">
                    <Icons.Plus />
                   </div>
                   <p className="text-xs font-black text-slate-800 mb-1 tracking-tight">注入原始素材</p>
                   <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Neural Disentanglement</p>
                </div>
              </label>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white p-2 group cursor-pointer" onClick={() => sourceInputRef.current?.click()}>
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={state.sourceImage} className="w-full h-auto max-h-[250px] object-contain mx-auto" />
                    {state.isAnalyzing && <div className="scan-line"></div>}
                    <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                       <span className="px-3 py-1 bg-white/90 text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">Click to Replace</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 items-start">
                  <DimensionItem delay="delay-0" icon="👤" label="主題" value={state.analysis?.subject || ''} onCopy={copyToClipboard} />
                  <DimensionItem delay="delay-75" icon="⚡" label="動作" value={state.analysis?.action || ''} onCopy={copyToClipboard} />
                  <DimensionItem delay="delay-100" icon="🎨" label="風格" value={state.analysis?.style || ''} onCopy={copyToClipboard} />
                  <DimensionItem delay="delay-125" icon="💡" label="光影" value={state.analysis?.lighting || ''} onCopy={copyToClipboard} />
                  <DimensionItem delay="delay-150" icon="🌈" label="色彩" value={state.analysis?.color || ''} onCopy={copyToClipboard} />
                  <DimensionItem delay="delay-175" icon="📐" label="構圖" value={state.analysis?.composition || ''} onCopy={copyToClipboard} />
                  <DimensionItem delay="delay-200" icon="🌍" label="環境" value={state.analysis?.environment || ''} onCopy={copyToClipboard} />
                  <DimensionItem delay="delay-225" icon="✨" label="質感" value={state.analysis?.texture || ''} onCopy={copyToClipboard} />
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <section className="glass p-5 rounded-[2rem] border-white shadow-sm">
            <h2 className="text-md font-black mb-4 flex items-center gap-2 text-slate-800">
               <span className="w-7 h-7 rounded-xl accent-gradient flex items-center justify-center text-white text-[9px]">02</span>
               動態錨點轉換
            </h2>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                {id: DAPPath.STYLE_TRANSFER, l:'風格轉換'},
                {id: DAPPath.SUBJECT_SWAP, l:'主體替換'},
                {id: DAPPath.PURE_RESTORATION, l:'還原修正'}
              ].map(p=>(
                <button key={p.id} onClick={()=>setState(prev=>({...prev, selectedPath:p.id}))} 
                        className={`py-3 rounded-2xl border text-[10px] font-black transition-all ${state.selectedPath===p.id?'bg-slate-800 text-white border-slate-800 shadow-md':'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                  {p.l}
                </button>
              ))}
            </div>

            <div className="mb-4 space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">生成佈局 (Multi-Sample Grid)</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {r:1,c:1,l:'1x1'},
                  {r:2,c:2,l:'2x2'},
                  {r:3,c:3,l:'3x3'},
                  {r:4,c:4,l:'4x4'}
                ].map(g => (
                  <button key={g.l} onClick={() => setState(prev => ({...prev, gridConfig: {rows: g.r, cols: g.c}}))} 
                          className={`px-3 py-2 rounded-xl border text-[9px] font-black transition-all ${state.gridConfig.rows === g.r && state.gridConfig.cols === g.c ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                    {g.l}
                  </button>
                ))}
                <div className="flex items-center gap-1">
                  <input 
                    type="number" placeholder="R" min="1" max="5"
                    className="w-10 px-2 py-2 rounded-xl border border-slate-100 bg-white text-[9px] font-bold text-center outline-none focus:border-purple-400"
                    value={state.gridConfig.rows}
                    onChange={(e)=>setState(prev=>({...prev, gridConfig: {...prev.gridConfig, rows: parseInt(e.target.value) || 1}}))}
                  />
                  <span className="text-slate-300 font-bold text-[8px]">x</span>
                  <input 
                    type="number" placeholder="C" min="1" max="5"
                    className="w-10 px-2 py-2 rounded-xl border border-slate-100 bg-white text-[9px] font-bold text-center outline-none focus:border-purple-400"
                    value={state.gridConfig.cols}
                    onChange={(e)=>setState(prev=>({...prev, gridConfig: {...prev.gridConfig, cols: parseInt(e.target.value) || 1}}))}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">畫布比例 (Aspect Ratio)</label>
              <div className="flex flex-wrap gap-1.5">
                {supportedRatios.map(r => (
                  <button key={r} onClick={() => {setState(prev => ({...prev, selectedAspectRatio: r})); setCustomRatio('');}} 
                          className={`px-3 py-2 rounded-xl border text-[9px] font-black transition-all ${state.selectedAspectRatio === r ? 'border-cyan-500 bg-cyan-50 text-cyan-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                    {r}
                  </button>
                ))}
                <div className="flex-1 flex items-center gap-1.5">
                  <input 
                    type="text" 
                    placeholder="Custom (e.g. 2:3)" 
                    value={customRatio}
                    onChange={(e) => {
                      setCustomRatio(e.target.value);
                      setState(prev => ({...prev, selectedAspectRatio: 'custom'}));
                    }}
                    className={`flex-1 min-w-[100px] px-3 py-2 rounded-xl border text-[9px] font-bold outline-none transition-all ${state.selectedAspectRatio === 'custom' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100 bg-white'}`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">畫布底色</label>
                <div className="flex gap-1.5">
                  {[BackgroundColor.AUTO, BackgroundColor.BLACK, BackgroundColor.WHITE].map(b=>(
                    <button key={b} onClick={()=>setState(prev=>({...prev, selectedBgColor:b}))} 
                            className={`flex-1 py-2 rounded-xl border text-[9px] font-black transition-all ${state.selectedBgColor===b?'border-cyan-500 bg-cyan-50 text-cyan-600':'border-slate-100 bg-white text-slate-400'}`}>{b}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">視覺元素</label>
                <div className="flex gap-1.5">
                  {[TextOption.NONE, TextOption.ENABLED].map(t=>(
                    <button key={t} onClick={()=>setState(prev=>({...prev, selectedTextOption:t}))} 
                            className={`flex-1 py-2 rounded-xl border text-[9px] font-black transition-all ${state.selectedTextOption===t?'border-orange-500 bg-orange-50 text-orange-600':'border-slate-100 bg-white text-slate-400'}`}>{t==='NONE'?'無文字':'帶排版'}</button>
                  ))}
                </div>
              </div>
            </div>

            {state.selectedPath === DAPPath.SUBJECT_SWAP && (
              <div className="mb-4 p-4 glass rounded-2xl border-purple-100 bg-purple-50/10 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-3">
                   <label className="text-[8px] font-black text-purple-500 uppercase tracking-widest">注入參考圖 (最多 3 張)</label>
                   {state.pivotImages.length > 0 && (
                     <button onClick={()=>setState(prev=>({...prev, pivotImages:[]}))} className="text-[8px] font-bold text-red-400 hover:text-red-500 transition-colors uppercase">Clear All</button>
                   )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {state.pivotImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-purple-200 group shadow-sm bg-white">
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={()=>removePivotImage(idx)} 
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="p-1.5 bg-red-500 rounded-lg text-white shadow-lg"><Icons.Trash /></span>
                      </button>
                    </div>
                  ))}
                  {state.pivotImages.length < 3 && (
                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-purple-200 rounded-xl cursor-pointer hover:bg-white text-purple-300 hover:text-purple-500 transition-all bg-white/20">
                      <Icons.Plus />
                      <input type="file" className="hidden" onChange={handlePivotUpload} accept="image/*" multiple />
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4">
              <textarea 
                placeholder={state.selectedPath === DAPPath.STYLE_TRANSFER ? "輸入目標風格描述 (例如: 賽博龐克, 梵谷)..." : state.selectedPath === DAPPath.SUBJECT_SWAP ? "描述替換後的新主體或動作細節..." : "描述還原修正要求..."}
                value={state.pivotInput}
                onChange={(e)=>setState(prev=>({...prev, pivotInput:e.target.value}))}
                className="w-full h-20 bg-white border border-slate-100 rounded-2xl p-3 text-[11px] font-medium outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all resize-none shadow-sm"
              />
            </div>

            <button disabled={!state.analysis || state.isTransforming} onClick={handleTransform} 
                    className={`w-full py-4 rounded-[1.2rem] font-black text-white text-[10px] tracking-[0.2em] shadow-lg transition-all relative overflow-hidden group accent-gradient active:scale-[0.98]`}>
              <span className="relative z-10">{state.isTransforming ? 'SYNTHESIZING...' : state.result ? '重新執行轉換協議' : '啟動轉換協議'}</span>
            </button>

            {state.result && (
              <div className="mt-8 animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-end mb-3">
                  <div className="space-y-0">
                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Synthesis Output {state.gridConfig.rows > 1 || state.gridConfig.cols > 1 ? `(${state.gridConfig.rows}x${state.gridConfig.cols} Matrix)` : ''}</p>
                    <h3 className="text-md font-black text-slate-800 tracking-tighter uppercase">生成結果</h3>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={()=>downloadResultImage(state.result!.imageUrl)} className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-green-600 shadow-sm transition-all" title="下載圖片"><Icons.Download /></button>
                    <button onClick={()=>setShowGridModal(true)} className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-purple-600 shadow-sm transition-all" title="宮格分割"><Icons.Grid /></button>
                    <button onClick={saveToGallery} className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-cyan-600 shadow-sm transition-all" title="入庫"><Icons.Save /></button>
                  </div>
                </div>
                
                <div className="relative rounded-[1.8rem] overflow-hidden border-2 border-white bg-white shadow-md mb-6">
                  <img src={state.result.imageUrl} className="w-full object-contain mx-auto" style={{ aspectRatio: supportedRatios.includes(state.selectedAspectRatio) ? state.selectedAspectRatio.replace(':', '/') : (customRatio.includes(':') ? customRatio.replace(':', '/') : '1/1') }} />
                </div>

                <div className="space-y-4 p-4 glass rounded-2xl border-cyan-100 bg-cyan-50/10 border border-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Icons.Edit />
                    <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest">數據標記 (Metadata)</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <Icons.Tag /> 標籤 (逗號分隔)
                    </label>
                    <input 
                      type="text"
                      placeholder="例如: 概念圖, 角色, 2024..."
                      value={state.result.tags?.join(', ') || ''}
                      onChange={(e) => updateResultMetadata({ tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-bold outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1.5">內容敘述</label>
                    <textarea 
                      placeholder="輸入關於此實體的詳細描述或筆記..."
                      value={state.result.description || ''}
                      onChange={(e) => updateResultMetadata({ description: e.target.value })}
                      className="w-full h-16 px-3 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-medium outline-none focus:border-cyan-400 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 glass rounded-xl border border-slate-100 bg-white/40">
                  <p className="text-[8px] font-black text-cyan-600 uppercase tracking-widest mb-1">提示詞備份 (AI Prompt)</p>
                  <p className="text-[10px] text-slate-500 italic leading-relaxed">{state.result.prompt}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {state.gallery.length > 0 && (
        <section className="max-w-6xl mx-auto px-8 mt-12 animate-in slide-in-from-bottom-5">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-black flex items-center gap-3 text-slate-800">
                <span className="w-8 h-8 rounded-xl bg-slate-200/50 flex items-center justify-center text-slate-400 text-[10px]">庫</span>
                解碼圖庫 (Decoded Library)
             </h2>
             <p className="text-[8px] font-mono font-bold text-slate-400 tracking-widest uppercase">COUNT: {state.gallery.length}</p>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {state.gallery.map(item => (
                <div key={item.id} className="group relative rounded-xl overflow-hidden border border-white bg-white shadow-sm aspect-square hover:shadow-xl transition-all card-hover cursor-pointer" 
                     onClick={()=>setState(prev=>({...prev, result: item}))}>
                   <img src={item.imageUrl} className="w-full h-full object-cover" />
                   
                   <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-3 backdrop-blur-[2px]">
                      <div className="flex flex-wrap gap-1">
                        {item.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-cyan-500 text-white text-[6px] font-black uppercase rounded shadow-sm border border-cyan-400">#{tag}</span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[7px] text-white font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">VIEW</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteFromGallery(item.id); }}
                          className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                   </div>

                   {item.description && (
                     <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-500 border border-white shadow-sm z-10"></div>
                   )}
                </div>
              ))}
           </div>
        </section>
      )}

      <footer className="fixed bottom-0 left-0 right-0 py-3 px-10 glass border-t border-slate-100/50 z-50 flex justify-between items-center text-[8px] font-mono font-bold text-slate-400">
        <div className="tracking-[0.1em] uppercase opacity-70">© 2024 VISUAL DECODER LABS.</div>
        <div className="flex gap-5">
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-green-500"></span>
            LATENCY: OPTIMIZED
          </div>
          <div>GEMINI-3.1-PRO</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
