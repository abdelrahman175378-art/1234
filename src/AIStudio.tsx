import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/generative-ai';
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
  };

  const handleAction = async () => {
    setLoading(true);
    setResult(null);
    setErrorMsg(null);
    try {
      // استخدام VITE_ للوصول للمفتاح في Vite
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      const ai = new GoogleGenAI(apiKey);
      
      if (activeTab === 'generate') {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });
        const response = await model.generateContent(prompt);
        // ملاحظة: موديلات Gemini الحالية نصية، توليد الصور يتطلب Imagen API
        setResult({ type: 'text', data: response.response.text() });
      } 
      else if (activeTab === 'analyze') {
        if (!userImage) return;
        const imgData = await getBase64(userImage);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const response = await model.generateContent([
          { inlineData: { data: imgData.data, mimeType: imgData.mimeType } },
          { text: "Detailed fashion audit: Describe style, fabric, silhouette, and provide 3 high-end styling coordinates." }
        ]);
        setResult({ type: 'text', data: response.response.text() });
      }
      else if (activeTab === 'prova') {
        if (!userImage || !preselectedProduct) return;
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const customerImg = await getBase64(userImage);
        const response = await model.generateContent([
          { inlineData: { data: customerImg.data, mimeType: customerImg.mimeType } },
          { text: `Analyze how this product: ${preselectedProduct.nameEn} would fit this person. Describe the virtual look.` }
        ]);
        setResult({ type: 'text', data: response.response.text() });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
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
        <div className="flex bg-black/5 backdrop-blur-md p-1.5 rounded-[2.5rem] w-fit mx-auto mt-12 border border-black/5">
          {['prova', 'generate', 'analyze', 'refine'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab as StudioTab); setResult(null); }}
              className={`px-8 py-4 rounded-[2rem] font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black text-white' : 'text-gray-400'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-10 rounded-[4rem] shadow-2xl space-y-8">
            {userImage ? (
                <div className="relative aspect-video rounded-[3rem] overflow-hidden">
                    <img src={userImage} className="w-full h-full object-cover" alt="User" />
                    <button onClick={() => setUserImage(null)} className="absolute top-6 right-6 bg-white p-3 rounded-2xl text-red-500 shadow-xl"><Trash2 size={20}/></button>
                </div>
            ) : (
                <div className="aspect-video bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center relative">
                    <Camera size={48} className="text-gray-200 mb-4" />
                    <p className="text-[10px] font-black uppercase text-gray-400">Upload Photo</p>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
            )}
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision..."
                className="w-full bg-gray-50 border-none rounded-[2rem] p-8 text-sm font-bold outline-none h-32"
            />
            <button
              disabled={loading}
              onClick={handleAction}
              className="w-full bg-black text-white py-8 rounded-[2.5rem] font-black text-xl hover:shadow-2xl transition-all disabled:opacity-30 flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Zap />}
              <span>{loading ? loadingSteps[loadingStep] : 'Execute Engine'}</span>
            </button>
        </div>

        <div className="bg-gray-50 rounded-[5rem] flex items-center justify-center p-8 border border-gray-100">
             {result ? (
                 <div className="w-full animate-in zoom-in duration-500">
                    <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">Atelier Result</h3>
                    <div className="bg-white p-8 rounded-[3rem] shadow-sm text-gray-600 leading-relaxed font-medium">
                        {result.data}
                    </div>
                 </div>
             ) : (
                 <div className="text-center opacity-10">
                    <ImageIcon size={100} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest">Awaiting Generation</p>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default AIStudioView;
