import React, { useState } from 'react';
import { useApp } from './AppContext.tsx';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArrowRight, Loader2, MessageCircle, Globe } from 'lucide-react';

const Auth: React.FC<{ onAdminAccess: () => void }> = ({ onAdminAccess }) => {
  const { setUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !password) return;
    setLoading(true);
    setTimeout(() => {
      setUser({ name: loginIdentifier.split('@')[0], identifier: loginIdentifier });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl max-w-md w-full border border-gray-100">
        <h2 className="text-4xl font-black uppercase text-center mb-10">AK. Authenticate</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="Phone or Email" value={loginIdentifier} onChange={e=>setLoginIdentifier(e.target.value)} className="w-full bg-gray-50 p-5 rounded-2xl border-none font-bold" />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-gray-50 p-5 rounded-2xl border-none font-bold" />
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase flex items-center justify-center gap-3 shadow-xl">
            {loading ? <Loader2 className="animate-spin" /> : 'Authorize Access'} <ArrowRight size={20}/>
          </button>
        </form>
        <button onClick={onAdminAccess} className="w-full mt-8 text-[10px] font-black uppercase text-gray-300 hover:text-red-600 transition-colors">Admin Console Access</button>
      </div>
    </div>
  );
};
export default Auth;
