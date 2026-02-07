import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai'; // ✅ تم التصحيح
import { useApp } from './AppContext'; // ✅ تم التصحيح
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';

const AIChatbot: React.FC<{ onProductNavigate?: (id: string) => void }> = ({ onProductNavigate }) => {
  const { language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    // محاكاة رد الـ AI
    setTimeout(() => {
      setLoading(false);
      setInput('');
    }, 1000);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-8 left-8 z-[100] bg-black text-white p-5 rounded-full shadow-2xl"><MessageSquare size={24} /></button>
      {isOpen && (
        <div className="fixed bottom-24 left-8 w-[350px] h-[500px] bg-white z-[110] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-black text-white p-6 flex justify-between items-center font-black">
            <span>AK STYLIST</span>
            <button onClick={() => setIsOpen(false)}><X size={20}/></button>
          </div>
          <div className="flex-grow p-4 bg-gray-50 italic text-sm text-gray-400">Assistant is ready...</div>
          <div className="p-4 border-t flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} className="flex-grow bg-gray-100 p-3 rounded-xl" placeholder="Ask AK..." />
            <button onClick={handleSend} className="bg-black text-white p-3 rounded-xl"><Send size={18}/></button>
          </div>
        </div>
      )}
    </>
  );
};
export default AIChatbot;
