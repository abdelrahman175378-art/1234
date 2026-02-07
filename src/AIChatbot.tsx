import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai'; // ✅ المكتبة الصحيحة
import { useApp } from './AppContext';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';

const AIChatbot: React.FC<{ onProductNavigate?: (id: string) => void }> = ({ onProductNavigate }) => {
  const { language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await model.generateContent(userText);
      setMessages(prev => [...prev, { role: 'model', text: response.response.text() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Neural link offline. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-8 left-8 z-[100] bg-black text-white p-5 rounded-full shadow-2xl"><MessageSquare size={24} /></button>
      {isOpen && (
        <div className="fixed bottom-24 left-8 w-[380px] h-[550px] bg-white z-[110] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-black text-white p-6 flex justify-between items-center">
            <div className="flex items-center gap-3"><Sparkles className="text-red-600" /><span className="font-black text-sm uppercase">AK Stylist</span></div>
            <button onClick={() => setIsOpen(false)}><X size={20}/></button>
          </div>
          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-black text-white ml-8' : 'bg-white border border-gray-100 mr-8'}`}>{m.text}</div>
            ))}
            {loading && <Loader2 className="animate-spin mx-auto text-gray-300" />}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && handleSend()} placeholder="Ask AK..." className="flex-grow bg-gray-50 p-4 rounded-xl text-sm border-none outline-none font-bold" />
            <button onClick={handleSend} className="p-4 bg-black text-white rounded-xl"><Send size={18}/></button>
          </div>
        </div>
      )}
    </>
  );
};
export default AIChatbot;
