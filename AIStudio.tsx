
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useApp } from '../AppContext';
import { Sparkles, ImageIcon, Wand2, Upload, Loader2, Trash2, ArrowLeft, Search, Scissors, CheckCircle2, AlertCircle, RefreshCw, Zap, ShieldCheck, User, Camera, Cpu, Maximize2, Layers } from 'lucide-react';
import { Product } from '../types';

interface AIStudioProps {
  preselectedProduct?: Product | null;
  preselectedImage?: string | null;
  preselectedColor?: string | null;
  onClearPreselected?: () => void;
  onBack?: () => void;
}

const RATIOS = [
  { label: '1:1', value: '1:1' },
  { label: '2:3', value: '2:3' },
  { label: '3:2', value: '3:2' },
  { label: '3:4', value: '3:4' },
  { label: '4:3', value: '4:3' },
  { label: '9:16', value: '9:16' },
  { label: '16:9', value: '16:9' },
];

type StudioTab = 'generate' | 'analyze' | 'prova' | 'refine';

// Use a specific component name to avoid any potential naming conflicts with globally defined types.
const AIStudioView: React.FC<AIStudioProps> = ({ preselectedProduct, preselectedColor, preselectedImage, onBack }) => {
  const { language } = useApp();
  const isAr = language === 'ar';
  
  const [activeTab, setActiveTab] = useState<StudioTab>(preselectedProduct ? 'prova' : 'generate');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<{ type: 'image' | 'text', data: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadingSteps = isAr 
    ? ['مسح نوع الجسم...', 'تحليل فيزياء القماش...', 'تطبيق اللون المختار...', 'اللمسات النهائية للأتيليه...']
    : ['Scanning Body Type...', 'Analyzing Fabric Physics...', 'Applying Selected Color...', 'Final Atelier Fitting...'];

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingSteps.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const getBase64 = async (imageSrc: string): Promise<{ data: string, mimeType: string }> => {
    if (imageSrc.startsWith('data:')) {
      const [header, data] = imageSrc.split(',');
      const mimeType = header.split(':')[1].split(';')[0];
      return { data, mimeType };
    }
    
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve({ data: base64String, mimeType: blob.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      throw new Error("Unable to load product image for AI. Please try an uploaded image.");
    }
  };

  const handleAction = async () => {
    setLoading(true);
    setResult(null);
    setErrorMsg(null);
    try {
      // Mandatory API key selection check when using Pro series models for generation or complex analysis
      if (activeTab === 'generate' || activeTab === 'analyze') {
        // Fix: Use type assertion to access pre-configured aistudio object as per requirements
        const aiStudio = (window as any).aistudio;
        const hasKey = await aiStudio.hasSelectedApiKey();
        if (!hasKey) {
          await aiStudio.openSelectKey();
          // Assume user success after dialog opens as per instructions
        }
      }

      // Initialize a new GoogleGenAI client right before request to ensure latest API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (activeTab === 'generate') {
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: { parts: [{ text: prompt }] },
          config: { imageConfig: { aspectRatio: selectedRatio as any, imageSize: '1K' } }
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) setResult({ type: 'image', data: `data:image/png;base64,${part.inlineData.data}` });
      } 
      else if (activeTab === 'analyze') {
        if (!userImage) return;
        const imgData = await getBase64(userImage);
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: { parts: [
            { inlineData: { data: imgData.data, mimeType: imgData.mimeType } },
            { text: "Detailed fashion audit: Describe style, fabric, silhouette, and provide 3 high-end styling coordinates." }
          ]}
        });
        setResult({ type: 'text', data: response.text || "" });
      }
      else if (activeTab === 'prova') {
        if (!userImage || !preselectedProduct) return;
        
        const customerImg = await getBase64(userImage);
        const productImg = await getBase64(preselectedImage || preselectedProduct.images[0]);

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [
            { inlineData: { data: customerImg.data, mimeType: customerImg.mimeType } },
            { inlineData: { data: productImg.data, mimeType: productImg.mimeType } },
            { text: `AK MODERN ATELIER - VIRTUAL PROVA ENGINE.
            
            TASK: High-fidelity clothing replacement.
            
            SYSTEM CONSTRAINTS:
            1. ANATOMICAL MAPPING: Map the garment in the second image to the person's body in the first image. The fit must be perfect, following the user's posture, bone structure, and physical volume.
            2. COLOR FIDELITY: The garment MUST be rendered in the EXACT color: "${preselectedColor || 'Original Variant'}". This is the most critical instruction. Match the lighting and shadows of the first image while maintaining the chosen color's hue.
            3. TEXTURE PRESERVATION: Maintain the specific fabric texture (e.g., cotton, silk, denim) shown in the product image.
            4. IDENTITY LOCK: Do not change the person's face, skin tone, hair, or limbs. Only replace the upper/lower body clothing as appropriate for the item.
            5. PHOTO-REALISM: The output must look like a professional studio photograph. Zero artifacts.` }
          ]}
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) {
          setResult({ type: 'image', data: `data:image/png;base64,${part.inlineData.data}` });
        } else {
          throw new Error("Atelier render engine failed. Please try a more direct photo with clear lighting.");
        }
      }
      else if (activeTab === 'refine') {
        if (!userImage) return;
        const imgData = await getBase64(userImage);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [
            { inlineData: { data: imgData.data, mimeType: imgData.mimeType } },
            { text: prompt }
          ]}
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) setResult({ type: 'image', data: `data:image/png;base64,${part.inlineData.data}` });
      }
    } catch (err: any) {
      const errorMessage = err?.message || "";
      if (errorMessage.includes("Requested entity was not found.")) {
        // Fix: Handle race condition/stale key by resetting selection using any casting for aistudio
        await (window as any).aistudio.openSelectKey();
        setErrorMsg(isAr ? "حدث خطأ في ترخيص المفتاح. يرجى إعادة اختيار المشروع المدفوع." : "Key authorization failed. Please re-select your paid project.");
      } else {
        setErrorMsg(errorMessage || "An unexpected error occurred with the AI engine.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <header className="mb-16 text-center">
        <button onClick={onBack} className="mb-10 flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.4em] text-gray-400 hover:text-black transition-all mx-auto bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
          <ArrowLeft size={14} /> {isAr ? 'العودة للمتجر' : 'Return to Atelier'}
        </button>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 uppercase">
          {isAr ? 'مختبر الأناقة' : 'AK AI Studio'}
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 opacity-80">Qatar's Premier Neural Fitting Room</p>
        
        <div className="flex bg-black/5 backdrop-blur-md p-1.5 rounded-[2.5rem] w-fit mx-auto mt-12 border border-black/5 shadow-inner">
          {[
            { id: 'prova', label: 'Prova', icon: <Scissors size={14}/>, color: 'purple' },
            { id: 'generate', label: 'Creation', icon: <Sparkles size={14}/>, color: 'black' },
            { id: 'analyze', label: 'Insight', icon: <Search size={14}/>, color: 'blue' },
            { id: 'refine', label: 'Refine', icon: <Wand2 size={14}/>, color: 'red' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as StudioTab); setResult(null); setErrorMsg(null); }}
              className={`relative flex items-center gap-2 px-8 py-4 rounded-[2rem] font-black text-[9px] uppercase tracking-widest transition-all duration-500 ${activeTab === tab.id ? 'bg-black text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-black'}`}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.id && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
            </button>
          ))}
        </div>
      </header>

      {errorMsg && (
        <div className="max-w-2xl mx-auto mb-12 bg-red-50 border border-red-200 p-8 rounded-[3rem] flex items-center gap-5 text-red-600 animate-in zoom-in duration-500 shadow-xl">
          <AlertCircle size={32} className="shrink-0" />
          <div>
            <h4 className="font-black uppercase text-xs mb-1">Engine Latency Error</h4>
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Atelier Input Side */}
        <div className="space-y-8 animate-in slide-in-from-left duration-700">
          <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-100 space-y-10 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-50 rounded-full blur-[100px] opacity-50" />

            {activeTab === 'prova' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3">
                      <Cpu size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Atelier Prova</h3>
                      <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Nano-Banana Precision</p>
                    </div>
                  </div>
                  <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-green-600" />
                    <span className="text-[8px] font-black uppercase text-green-700 tracking-tighter">Secure Link</span>
                  </div>
                </div>

                {preselectedProduct ? (
                  <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 group hover:border-purple-200 transition-colors">
                    <div className="relative w-20 h-24 rounded-2xl overflow-hidden shadow-lg border border-white">
                        <img src={preselectedImage || preselectedProduct.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        <div className="absolute inset-0 bg-black/10" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.3em] mb-1">Target Masterpiece</p>
                      <h4 className="text-lg font-black uppercase tracking-tight">{preselectedProduct.nameEn}</h4>
                      {preselectedColor && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-lg" />
                          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Active Variant: {preselectedColor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-10 bg-red-50 rounded-[3rem] border border-red-100 text-center flex flex-col items-center gap-4">
                     <AlertCircle size={40} className="text-red-300" />
                     <p className="text-red-600 font-black text-[10px] uppercase tracking-widest leading-relaxed">Atelier requires a product from the collection.<br/>Please select an item first.</p>
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'analyze' || activeTab === 'prova' || activeTab === 'refine') && (
              <div className="space-y-6">
                <div className="relative aspect-video bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-black/10 group">
                  {userImage ? (
                    <>
                      <img src={userImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="User" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button onClick={() => setUserImage(null)} className="absolute top-6 right-6 bg-white p-3 rounded-2xl text-red-500 shadow-2xl hover:bg-red-500 hover:text-white transition-all transform hover:rotate-90">
                        <Trash2 size={20}/>
                      </button>
                      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-white/50">
                        <User size={12} className="text-gray-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Source Frame</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-12 transition-transform group-hover:scale-110 duration-500">
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 text-gray-300 group-hover:text-black transition-colors">
                        <Camera size={32} />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">Upload Source Frame</p>
                      <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">Full body, clear lighting for perfect mapping</p>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'generate' && (
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 px-1">Studio Aspect Ratio</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {RATIOS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setSelectedRatio(r.value)}
                        className={`py-3 rounded-xl text-[10px] font-black border transition-all ${selectedRatio === r.value ? 'bg-black text-white border-black shadow-lg scale-110' : 'bg-gray-50 border-gray-100 hover:border-gray-300'}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative group">
                    <Sparkles className="absolute top-6 left-6 text-gray-300 group-focus-within:text-red-600 transition-colors" size={20} />
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Compose your fashion vision..."
                        className="w-full bg-gray-50 border-none rounded-[2.5rem] p-8 pl-16 h-48 text-sm font-bold focus:ring-4 focus:ring-black/5 transition-all outline-none placeholder:text-gray-300"
                    />
                </div>
              </div>
            )}

            {activeTab === 'refine' && (
              <div className="relative group">
                <Wand2 className="absolute top-6 left-6 text-gray-300 group-focus-within:text-red-600 transition-colors" size={20} />
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe refinement: 'Ethereal lighting', 'Matte texture', 'Studio background'..."
                    className="w-full bg-gray-50 border-none rounded-[2.5rem] p-8 pl-16 h-48 text-sm font-bold focus:ring-4 focus:ring-black/5 transition-all outline-none placeholder:text-gray-300"
                />
              </div>
            )}

            <button
              disabled={loading || (activeTab === 'generate' && !prompt) || ((activeTab === 'prova' || activeTab === 'analyze' || activeTab === 'refine') && !userImage)}
              onClick={handleAction}
              className="w-full bg-black text-white py-8 rounded-[2.5rem] font-black text-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all disabled:opacity-30 flex items-center justify-center gap-4 active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="group-hover:text-red-600 transition-colors" />}
              <span className="uppercase tracking-tighter">
                {loading ? loadingSteps[loadingStep] : (
                  activeTab === 'generate' ? 'Execute Creation' : 
                  activeTab === 'analyze' ? 'Generate Insight' : 
                  activeTab === 'prova' ? 'Initiate Perfect Fit' : 
                  'Apply Refinement'
                )}
              </span>
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-8 opacity-40">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"><ShieldCheck size={12}/> Zero Storage Policy</div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"/>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"><Cpu size={12}/> Nano-Banana 2.5</div>
          </div>
        </div>

        {/* Studio Output Panel */}
        <div className="bg-white p-4 rounded-[5rem] shadow-2xl border border-gray-100 min-h-[700px] flex items-center justify-center relative bg-gray-50/30 animate-in slide-in-from-right duration-700 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="relative mb-12">
                 <div className="w-32 h-32 bg-black rounded-[3rem] flex items-center justify-center animate-pulse shadow-[0_0_100px_rgba(0,0,0,0.2)]">
                    <Zap size={56} className="text-red-600 animate-bounce" />
                 </div>
                 <div className="absolute inset-0 border-4 border-black/5 rounded-[3rem] animate-ping scale-150 opacity-10" />
                 <div className="absolute inset-0 border-4 border-black/10 rounded-[3rem] animate-ping scale-125 opacity-20" />
              </div>
              <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black mb-2">{loadingSteps[loadingStep]}</p>
              <div className="flex gap-1.5">
                {loadingSteps.map((_, i) => (
                    <div key={i} className={`w-12 h-1 rounded-full transition-all duration-700 ${i <= loadingStep ? 'bg-black shadow-lg' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
          ) : result ? (
            <div className="w-full h-full flex flex-col items-center p-6 animate-in zoom-in duration-700">
              {result.type === 'image' ? (
                <div className="relative group flex flex-col items-center w-full">
                  <div className="bg-white p-6 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] ring-1 ring-black/5 max-w-full overflow-hidden relative">
                    <img src={result.data} className="max-w-full max-h-[650px] object-contain rounded-[3rem] shadow-sm" alt="Atelier Result" />
                    
                    {/* Atelier Seal */}
                    <div className="absolute bottom-10 right-10 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">AK Atelier Authentic</p>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-wrap justify-center gap-6">
                    <button onClick={() => setResult(null)} className="px-12 py-5 bg-white border border-gray-100 text-gray-400 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:text-red-600 hover:border-red-100 transition-all active:scale-95">
                      Discard Frame
                    </button>
                    <button onClick={handleAction} className="px-12 py-5 bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 hover:bg-gray-800 transition-all active:scale-95 group">
                      <RefreshCw size={16} className="group-active:rotate-180 transition-transform" /> Recalculate Fit
                    </button>
                    {activeTab === 'prova' && (
                        <div className="w-full flex justify-center mt-4">
                            <div className="flex items-center gap-3 px-6 py-2 bg-purple-50 rounded-full border border-purple-100">
                                <Maximize2 size={12} className="text-purple-600"/>
                                <span className="text-[8px] font-black uppercase text-purple-600 tracking-widest">Anatomical Fit Locked • Color Matched</span>
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-xl p-12 bg-white rounded-[4rem] shadow-2xl border border-gray-50 font-medium leading-relaxed relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[80px] opacity-30" />
                  <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Layers size={20} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Atelier Insight</h3>
                        <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest">Neural Analysis Complete</p>
                    </div>
                  </div>
                  <div className="prose prose-sm prose-zinc">
                    <pre className="whitespace-pre-wrap font-sans text-gray-600 text-sm leading-loose bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">{result.data}</pre>
                  </div>
                  <button onClick={() => setResult(null)} className="mt-8 w-full py-4 border border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-black hover:border-black transition-all rounded-2xl">Dismiss Insight</button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center opacity-5 space-y-8 group transition-all duration-1000">
              <div className="relative">
                <ImageIcon size={160} className="mx-auto transition-transform group-hover:scale-110 duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-200 to-transparent mix-blend-overlay" />
              </div>
              <div>
                <p className="font-[1000] uppercase tracking-[1em] text-xl mb-2">Atelier Void</p>
                <p className="font-black uppercase tracking-[0.3em] text-[10px]">Awaiting Sensory Input</p>
              </div>
            </div>
          )}
          
          {/* Decorative Atelier Accents */}
          <div className="absolute top-10 left-10 w-2 h-2 border border-black/10 rounded-full" />
          <div className="absolute bottom-10 right-10 w-10 h-[1px] bg-black/5" />
          <div className="absolute bottom-12 right-10 w-[1px] h-10 bg-black/5" />
        </div>
      </div>
    </div>
  );
};

export default AIStudioView;
