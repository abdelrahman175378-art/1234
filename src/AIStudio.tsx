import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useApp } from './AppContext'; // ✅ تم التصحيح من ../ إلى ./
import { Sparkles, ImageIcon, Trash2, ArrowLeft, Loader2, Zap, Camera } from 'lucide-react';
import { Product } from './types'; // ✅ تم التصحيح من ../ إلى ./

interface AIStudioProps {
  preselectedProduct?: Product | null;
  onBack?: () => void;
}

const AIStudioView: React.FC<AIStudioProps> = ({ preselectedProduct, onBack }) => {
  const { language } = useApp();
  const isAr = language === 'ar';
  
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'text', data: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);

  const handleAction = async () => {
    setLoading(true);
    setTimeout(() => {
      setResult({ type: 'text', data: isAr ? "تم تحليل التصميم بنجاح في مختبر AK." : "Design analysis completed in AK Studio." });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <header className="mb-16 text-center">
        <button onClick={onBack} className="mb-10 flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.4em] text-gray-400 hover:text-black transition-all mx-auto bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
          <ArrowLeft size={14} /> {isAr ? 'العودة' : 'Back'}
        </button>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 uppercase">
          {isAr ? 'مختبر الذكاء الاصطناعي' : 'AK AI Studio'}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-10 rounded-[4rem] shadow-2xl space-y-8 border border-gray-100">
            {userImage ? (
                <div className="relative aspect-video rounded-[3rem] overflow-hidden">
                    <img src={userImage} className="w-full h-full object-cover" alt="User" />
                    <button onClick={() => setUserImage(null)} className="absolute top-6 right-6 bg-white p-3 rounded-2xl text-red-500 shadow-xl"><Trash2 size={20}/></button>
                </div>
            ) : (
                <div className="aspect-video bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center relative">
                    <Camera size={48} className="text-gray-200 mb-4" />
                    <p className="text-[10px] font-black uppercase text-gray-400">Upload Photo</p>
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
              className="w-full bg-black text-white py-8 rounded-[2.5rem] font-black text-xl hover:shadow-2xl transition-all flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Zap />}
              <span>{isAr ? 'بدء المحرك' : 'Execute Engine'}</span>
            </button>
        </div>

        <div className="bg-gray-50 rounded-[5rem] flex items-center justify-center p-8 border border-gray-100">
             {result ? (
                 <div className="w-full text-center">
                    <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">Atelier Result</h3>
                    <div className="bg-white p-8 rounded-[3rem] shadow-sm text-gray-600 leading-relaxed">
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
