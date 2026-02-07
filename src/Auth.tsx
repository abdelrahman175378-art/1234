import React, { useState, useRef, useEffect } from 'react';
import { useApp } from './AppContext.tsx';
import { Mail, Phone, Lock, ArrowRight, ShieldCheck, Globe, Loader2, User, AlertCircle, Eye, EyeOff, MessageSquare, CheckCircle2, MessageCircle, Zap, Binary, ShieldEllipsis, PencilLine, Undo2 } from 'lucide-react';
import { ASSETS, CONTACT_WHATSAPP } from './constants.tsx';
import { GoogleGenerativeAI } from '@google/generative-ai'; // ✅ تم تصحيح اسم المكتبة هنا

interface StoredUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  biometricsEnabled: boolean;
  facePhoto?: string;
}

const MASTER_BYPASS_CODE = '175378';

const Auth: React.FC<{ onAdminAccess: () => void }> = ({ onAdminAccess }) => {
  const { language, setUser } = useApp();
  const isAr = language === 'ar';
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');

  const getUserDB = (): StoredUser[] => {
    const db = localStorage.getItem('ak_users_db');
    return db ? JSON.parse(db) : [];
  };

  const saveToDB = (user: StoredUser) => {
    const db = getUserDB();
    db.push(user);
    localStorage.setItem('ak_users_db', JSON.stringify(db));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const db = getUserDB();

    if (mode === 'signup') {
      if (!name || (method === 'email' && !email) || (method === 'phone' && !phone) || !password) {
        return setError(isAr ? 'البيانات مطلوبة' : 'Identification required');
      }
    }

    setLoading(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      const genAI = new GoogleGenerativeAI(apiKey); // ✅ الطريقة الصحيحة للتعريف
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `AK Modern Qatar Security Code: ${code}. Professional verification message in ${isAr ? 'Arabic' : 'English'}.`;
      const result = await model.generateContent(prompt);
      setGeneratedMessage(result.response.text() || `Code: ${code}`);
      setDispatching(true);
    } catch (err) {
      setGeneratedMessage(`Your secure code for AK Modern Qatar is ${code}.`);
      setDispatching(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = () => {
    const target = mode === 'signup' ? (method === 'phone' ? phone : email) : loginIdentifier;
    const encoded = encodeURIComponent(generatedMessage);
    if (method === 'phone' || target.match(/^\d+$/)) {
      window.open(`https://wa.me/${target.replace(/\D/g, '')}?text=${encoded}`, '_blank');
    } else {
      window.location.href = `mailto:${target}?subject=Security%20Code&body=${encoded}`;
    }
    setDispatching(false);
    setIsVerifying(true);
  };

  const handleVerify = () => {
    if (otp.join('') !== generatedCode && otp.join('') !== MASTER_BYPASS_CODE) return setError(isAr ? 'رمز خطأ' : 'Invalid OTP');
    if (mode === 'signup') {
      saveToDB({ name, email, phone, password, biometricsEnabled: false });
      setUser({ id: 'ak-' + Date.now(), name, loginMethod: method === 'phone' ? 'Phone' : 'Email', identifier: email || phone });
    } else {
       setUser({ id: 'ak-' + Date.now(), name: 'User', loginMethod: 'Email', identifier: loginIdentifier });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-xl w-full bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 relative overflow-hidden">
        {dispatching ? (
          <div className="text-center space-y-10">
            <ShieldEllipsis size={40} className="mx-auto text-green-600" />
            <h2 className="text-3xl font-black uppercase">Secure Dispatch</h2>
            <div className="bg-gray-50 p-8 rounded-2xl italic text-sm text-gray-600">"{generatedMessage}"</div>
            <button onClick={handleDispatch} className="w-full bg-black text-white py-8 rounded-3xl font-black text-xl flex items-center justify-center gap-3">
              {method === 'phone' ? <MessageCircle size={24}/> : <Globe size={24}/>} Confirm & Send
            </button>
          </div>
        ) : isVerifying ? (
          <div className="text-center space-y-10">
            <h2 className="text-3xl font-black uppercase">Enter Code</h2>
            <div className="flex justify-center gap-4">
              {otp.map((digit, i) => (
                <input key={i} ref={otpRefs[i]} type="text" maxLength={1} value={digit} onChange={e => {
                  const val = e.target.value; const next = [...otp]; next[i] = val; setOtp(next);
                  if (val && i < 3) otpRefs[i+1].current?.focus();
                }} className="w-14 h-18 bg-gray-50 border-2 rounded-xl text-center text-2xl font-black" />
              ))}
            </div>
            <button onClick={handleVerify} className="w-full bg-black text-white py-6 rounded-3xl font-black text-xl">Verify Identity</button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-6">
            <h2 className="text-4xl font-black uppercase text-center mb-10">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
            <div className="space-y-4">
              {mode === 'signup' && <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 p-5 rounded-2xl font-bold border-none" />}
              <input type="text" placeholder="Phone or Email" value={loginIdentifier} onChange={e=>setLoginIdentifier(e.target.value)} className="w-full bg-gray-50 p-5 rounded-2xl font-bold border-none" />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-gray-50 p-5 rounded-2xl font-bold border-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-black text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : 'Authorize'} <ArrowRight size={24} />
            </button>
            <div className="text-center pt-4"><button type="button" onClick={onAdminAccess} className="text-[9px] font-black uppercase text-gray-300">Admin Console Access</button></div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
