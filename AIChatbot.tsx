
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { MessageSquare, X, Send, Loader2, Sparkles, ArrowUpRight, BrainCircuit, Globe } from 'lucide-react';
import { Product } from '../types';

interface AIChatbotProps {
  onProductNavigate?: (id: string) => void;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ onProductNavigate }) => {
  const { language, products } = useApp();
  const isAr = language === 'ar';
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string, recommendedProduct?: Product }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      // Always create a new client right before calling generateContent to ensure usage of current API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: isThinkingMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: userText }] }],
        config: {
          systemInstruction: `You are AK, an elite fashion consultant for AK Modern Fashion (Qatar). You specialize in premium luxury and modern street wear. If relevant, recommend products by ID: XXX. Our catalog: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.nameEn, cat: p.category })))}`,
          ...(isThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {})
        }
      });

      // Directly access .text property from GenerateContentResponse
      const responseText = response.text || "I'm currently recalibrating my style logic. How else can I assist?";
      const idMatch = responseText.match(/ID:\s*(\w+)/i);
      const product = idMatch ? products.find(p => p.id === idMatch[1]) : undefined;

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText,
        recommendedProduct: product
      }]);
    } catch (err: any) {
      const errMsg = err?.message || "";
      if (errMsg.includes("Requested entity was not found.")) {
        // If pro model key selection is needed (though here it's text-only, safety first)
        if (window.aistudio) await window.aistudio.openSelectKey();
        setMessages(prev => [...prev, { role: 'model', text: isAr ? 'يرجى اختيار مفتاح صالح من مشروع GCP مدفوع لتفعيل الميزات المتقدمة.' : 'Please select a valid API key from a paid GCP project to enable advanced features.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'My neural link is currently offline. Please try again in a moment.' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 z-[100] bg-black text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 group ring-4 ring-white"
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:left-8 sm:w-[420px] sm:h-[650px] bg-white z-[110] sm:rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-black text-white p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight">AK STYLIST</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Neural Network Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>
            
            <div className="flex items-center justify-between bg-white/5 p-2 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 px-3">
                <BrainCircuit size={14} className={isThinkingMode ? "text-purple-400" : "text-white/40"} />
                <span className="text-[9px] font-black uppercase tracking-widest">Deep Thinking</span>
              </div>
              <button 
                onClick={() => setIsThinkingMode(!isThinkingMode)}
                className={`w-12 h-6 rounded-full transition-all relative ${isThinkingMode ? 'bg-purple-600' : 'bg-white/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isThinkingMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <Sparkles size={48} className="mb-4" />
                <p className="font-black uppercase tracking-[0.3em] text-[10px]">Ask me about Doha Trends</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-black text-white shadow-xl' : 'bg-white border border-gray-100 shadow-sm font-medium'}`}>
                  {m.text}
                </div>
                {m.recommendedProduct && (
                  <div 
                    onClick={() => { onProductNavigate?.(m.recommendedProduct!.id); setIsOpen(false); }}
                    className="mt-3 w-[85%] bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.03] transition-all group"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img src={m.recommendedProduct.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-60">Recommendation</p>
                        <h4 className="text-white font-black truncate">{m.recommendedProduct.nameEn}</h4>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="animate-spin text-red-600" />
                {isThinkingMode && <span className="text-[8px] font-black uppercase tracking-widest text-purple-600">Simulating Style Logic...</span>}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
              placeholder="Tell me your style vision..." 
              className="flex-grow bg-gray-50 p-5 rounded-2xl text-sm font-bold border-none focus:ring-2 focus:ring-black transition-all"
            />
            <button 
              onClick={handleSend} 
              className="p-5 bg-black text-white rounded-2xl shadow-xl active:scale-95 transition-all hover:bg-red-600"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
