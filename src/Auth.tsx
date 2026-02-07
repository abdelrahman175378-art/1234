import React, { useState, useRef } from 'react';
import { useApp } from './AppContext'; // ✅ تم التصحيح
import { ArrowRight, Loader2, MessageCircle, Globe, ShieldEllipsis } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai'; // ✅ تم التصحيح

const Auth: React.FC<{ onAdminAccess: () => void }> = ({ onAdminAccess }) => {
  const { language, setUser } = useApp();
  const isAr = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // منطق الدخول البسيط للـ Build
    setTimeout(() => {
      setUser({ id: '1', name: loginIdentifier.split('@')[0], loginMethod: 'Email', identifier: loginIdentifier });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-md w-full border border-gray-100">
        <h2 className="text-3xl font-black uppercase text-center mb-10">Authorize Access</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="text" placeholder="Email or Phone" value={loginIdentifier} onChange={e=>setLoginIdentifier(e.target.value)} className="w-full bg-gray-50 p-5 rounded-2xl border-none font-bold" />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-gray-50 p-5 rounded-2xl border-none font-bold" />
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin"/> : 'Authorize'} <ArrowRight size={20}/>
          </button>
        </form>
        <button onClick={onAdminAccess} className="w-full mt-6 text-[10px] font-black uppercase text-gray-300">Admin Console</button>
      </div>
    </div>
  );
};
export default Auth;
