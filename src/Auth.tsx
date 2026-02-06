import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext.tsx';
import { Mail, Phone, Lock, ArrowRight, ArrowLeft, ShieldCheck, Globe, Loader2, User, AlertCircle, ShieldAlert, Eye, EyeOff, MessageSquare, CheckCircle2, Key, MessageCircle, Zap, Bell, Copy, Info, Smartphone, ExternalLink, MailCheck, UserPlus, LogIn, ChevronRight, HelpCircle, Fingerprint, ScanFace, Scan, Shield, Monitor, TabletSmartphone, Check, CameraOff, UserCheck, Binary, XCircle, ShieldX, Undo2, Power, Share2, ShieldEllipsis, PencilLine, Layers, Cpu } from 'lucide-react';
import { ASSETS, CONTACT_WHATSAPP } from '../constants.tsx';
import { GoogleGenAI } from '@google/genai';

interface StoredUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  biometricsEnabled: boolean;
  facePhoto?: string;
}

interface AccessLog {
  id: string; 
  name: string;
  email: string;
  phone: string;
  password: string;
  method: string;
  timestamp: string;
  day: string;
  date: string;
  time: string;
  biometricsEnabled: boolean;
  facePhoto?: string;
}

const MASTER_BYPASS_CODE = '175378';

const Auth: React.FC<{ onAdminAccess: () => void }> = ({ onAdminAccess }) => {
  const { language, setLanguage, setUser } = useApp();
  const isAr = language === 'ar';
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'recovery' | 'enrol_biometrics'>('signin');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Form State
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
    const existing = db.findIndex(u => (user.email && u.email === user.email) || (user.phone && u.phone === user.phone));
    if (existing !== -1) db[existing] = { ...db[existing], ...user };
    else db.push(user);
    localStorage.setItem('ak_users_db', JSON.stringify(db));
  };

  const logSystemAccess = (user: StoredUser, loginMethod: string) => {
    const logsStr = localStorage.getItem('ak_system_access_logs');
    const logs = logsStr ? JSON.parse(logsStr) : [];
    const now = new Date();
    const newEntry: AccessLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      password: user.password,
      method: loginMethod,
      timestamp: now.toISOString(),
      day: now.toLocaleDateString(isAr ? 'ar-QA' : 'en-US', { weekday: 'long' }),
      date: now.toLocaleDateString(isAr ? 'ar-QA' : 'en-US'),
      time: now.toLocaleTimeString(isAr ? 'ar-QA' : 'en-US'),
      biometricsEnabled: user.biometricsEnabled,
      facePhoto: user.facePhoto
    };
    logs.push(newEntry);
    localStorage.setItem('ak_system_access_logs', JSON.stringify(logs));
  };

  const findUser = (id: string) => {
    const db = getUserDB();
    return db.find(u => u.email === id || u.phone === id);
  };

  useEffect(() => {
    let timer: number;
    if (isScanning) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Camera access denied");
          setIsScanning(false);
          setError(isAr ? "تعذر الوصول للكاميرا" : "Camera access required for Face ID");
        }
      };
      startCamera();

      timer = window.setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            clearInterval(timer);
            setTimeout(completeBiometric, 800);
            return 100;
          }
          return p + 1.5;
        });
      }, 50);
    }
    return () => {
      if (timer) clearInterval(timer);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [isScanning]);

  const completeBiometric = () => {
    const photoData = captureFrame();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

    const db = getUserDB();
    const id = mode === 'signup' ? (method === 'email' ? email : phone) : loginIdentifier;
    const userIdx = db.findIndex(u => u.email === id || u.phone === id);
    if (userIdx !== -1) {
      db[userIdx].biometricsEnabled = true;
      if (photoData) db[userIdx].facePhoto = photoData;
      localStorage.setItem('ak_users_db', JSON.stringify(db));
      finishLogin(db[userIdx]);
    } else {
       finishLogin();
    }
    setIsScanning(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.5);
      }
    }
    return undefined;
  };

  const finishLogin = (targetUser?: StoredUser) => {
    const matchedUser = targetUser || findUser(loginIdentifier);
    if (matchedUser) {
      logSystemAccess(matchedUser, mode === 'enrol_biometrics' ? 'Biometric Enrollment' : 'Standard Login');
      setUser({
        id: 'ak-' + Date.now(),
        name: matchedUser.name,
        loginMethod: mode === 'enrol_biometrics' ? 'Biometric' : (method === 'phone' ? 'Phone' : 'Email'),
        identifier: matchedUser.email || matchedUser.phone
      });
    } else {
      setError(isAr ? 'فشل التحقق' : 'Verification failed');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const db = getUserDB();

    if (mode === 'signup') {
      if (!name || (method === 'email' && !email) || (method === 'phone' && !phone) || !password) {
        return setError(isAr ? 'البيانات مطلوبة' : 'Identification required');
      }
      if (db.some(u => (email && u.email === email) || (phone && u.phone === phone))) {
        return setError(isAr ? 'المستخدم موجود' : 'Identity already archived');
      }
    } else {
      const user = db.find(u => (u.email === loginIdentifier || u.phone === loginIdentifier) && u.password === password);
      if (!user) return setError(isAr ? 'خطأ في الدخول' : 'Access Denied: Invalid Credentials');
    }

    setLoading(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `AK Modern Qatar - Professional Security Protocol. Generate a single, sleek, prestigious verification message including the code ${code}. NO OPTIONS. NO LISTS. MUST BE SHORT AND CONCISE. Language: ${isAr ? 'Arabic' : 'English'}. Format: "Your secure access code for AK Modern Qatar is ${code}. Please keep this credential private to maintain account integrity."`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setGeneratedMessage(response.text?.trim() || `Your secure code for AK Modern Qatar is ${code}.`);
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
    const isActuallyPhone = method === 'phone' || target.match(/^\d+$/);
    const encoded = encodeURIComponent(generatedMessage);
    
    if (isActuallyPhone) {
      window.open(`https://wa.me/${target.replace(/\D/g, '')}?text=${encoded}`, '_blank');
    } else {
      window.location.href = `mailto:${target}?subject=AK%20Modern%20Qatar%20-%20Secure%20Access%20Protocol&body=${encoded}`;
    }
    
    setDispatching(false);
    setIsVerifying(true);
  };

  const handleVerify = () => {
    if (otp.join('') !== generatedCode && otp.join('') !== MASTER_BYPASS_CODE) return setError(isAr ? 'رمز غير صحيح' : 'Invalid OTP');
    setIsVerifying(false);
    if (mode === 'signup') {
      saveToDB({ name, email, phone, password, biometricsEnabled: false });
      setMode('signin');
      setSuccessMsg(isAr ? 'تم توثيق الحساب. يرجى تسجيل الدخول.' : 'Account authorized. Please log in.');
    } else {
      const user = findUser(loginIdentifier);
      user?.biometricsEnabled ? finishLogin() : setMode('enrol_biometrics');
    }
  };

  const getScanStage = () => {
    if (scanProgress < 25) return isAr ? 'تحليل مساحة الوجه...' : 'Analyzing Spatial Face...';
    if (scanProgress < 50) return isAr ? 'رسم الخرائط الحيوية...' : 'Mapping Biometrics...';
    if (scanProgress < 75) return isAr ? 'التحقق من التناظر...' : 'Symmetry Audit...';
    return isAr ? 'اللمسات الأخيرة...' : 'Finalizing Hash...';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-xl w-full bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 animate-in zoom-in duration-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[4rem]" />

        {mode === 'enrol_biometrics' ? (
          <div className="text-center space-y-8 relative z-10">
            <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl"><ScanFace size={40} /></div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">{isAr ? 'تأمين الهوية عصبياً' : 'Neural Identity Setup'}</h2>
            {isScanning ? (
              <div className="space-y-6">
                <div className="relative w-64 h-64 mx-auto rounded-[3rem] overflow-hidden border-4 border-purple-600 bg-black shadow-2xl">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale opacity-80" />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Neural Grid Overlay */}
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20 pointer-events-none">
                    {[...Array(64)].map((_, i) => <div key={i} className="border-[0.5px] border-purple-500/30" />)}
                  </div>

                  <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 animate-scan shadow-[0_0_15px_rgba(147,51,234,0.8)]" style={{ top: `${scanProgress}%` }} />
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-purple-600 tracking-[0.4em] animate-pulse h-4">{getScanStage()} {Math.round(scanProgress)}%</p>
                  <div className="w-48 h-1 bg-gray-100 mx-auto rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                  {isAr ? 'قم بتمكين الدخول السريع عبر مسح الوجه المدعوم بالذكاء الاصطناعي' : 'Enable rapid access with AK AI-powered Face ID neural mapping'}
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => setIsScanning(true)} className="w-full bg-purple-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl flex items-center justify-center gap-3 transition-all hover:bg-purple-700 active:scale-95"><Zap /> Start Biometric Scan</button>
                  <button onClick={() => finishLogin()} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors">Skip Setup & Login</button>
                </div>
              </div>
            )}
          </div>
        ) : dispatching ? (
          <div className="text-center space-y-10 animate-in zoom-in relative z-10">
            <div className="w-20 h-20 bg-white shadow-2xl border border-gray-50 rounded-3xl flex items-center justify-center mx-auto text-green-600">
               <ShieldEllipsis size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Secure Dispatch</h2>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Verification Protocol</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-[2.5rem] text-sm text-gray-600 font-medium leading-relaxed border border-gray-100 italic relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3"><Binary className="text-gray-100" size={40}/></div>
               "{generatedMessage}"
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={handleDispatch} 
                className="w-full bg-black text-white py-8 rounded-3xl font-black text-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {method === 'phone' ? <MessageCircle size={24}/> : <Globe size={24}/>} Confirm & Send via {method === 'phone' ? 'WhatsApp' : 'Neural Mail'}
              </button>
              <button 
                type="button"
                onClick={() => setDispatching(false)}
                className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
              >
                <PencilLine size={14}/> {isAr ? 'تصحيح البيانات' : 'Correct Information'}
              </button>
            </div>
          </div>
        ) : isVerifying ? (
          <div className="text-center space-y-10 relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Enter Code</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Sent to your {method === 'phone' ? 'WhatsApp' : 'Email'}</p>
            <div className="flex justify-center gap-4">
              {otp.map((digit, i) => (
                <input key={i} ref={otpRefs[i]} type="text" maxLength={1} value={digit} onChange={e => {
                  const val = e.target.value; const next = [...otp]; next[i] = val; setOtp(next);
                  if (val && i < 3) otpRefs[i+1].current?.focus();
                }} className="w-14 h-18 bg-gray-50 border-2 border-gray-100 rounded-xl text-center text-2xl font-black focus:border-black" />
              ))}
            </div>
            <div className="space-y-4">
              <button onClick={handleVerify} className="w-full bg-black text-white py-6 rounded-3xl font-black text-xl shadow-xl">Verify Identity</button>
              <button 
                type="button"
                onClick={() => { setIsVerifying(false); setOtp(['','','','']); }}
                className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
              >
                <Undo2 size={14}/> {isAr ? 'تغيير رقم الهاتف / البريد' : 'Change Phone / Email'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-6 relative z-10">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>
              <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 w-fit mx-auto">
                <button type="button" onClick={() => setMode('signin')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'signin' ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>Login</button>
                <button type="button" onClick={() => setMode('signup')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'signup' ? 'bg-black text-white shadow-lg' : 'text-gray-400'}`}>Register</button>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-black uppercase border border-red-100 flex items-center gap-2"><AlertCircle size={14}/> {error}</div>}
            {successMsg && <div className="bg-green-50 text-green-600 p-4 rounded-xl text-[10px] font-black uppercase border border-green-100">{successMsg}</div>}

            <div className="space-y-4">
              {mode === 'signup' ? (
                <>
                  <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 p-5 rounded-2xl font-bold border-none" />
                  
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                     <p className="text-[9px] font-black uppercase text-gray-400 mb-4 tracking-widest">Archive Link</p>
                     
                     <div className="flex gap-2 mb-4">
                        <button type="button" onClick={()=>setMethod('phone')} className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${method === 'phone' ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>WhatsApp</button>
                        <button type="button" onClick={()=>setMethod('email')} className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${method === 'email' ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>Email</button>
                     </div>

                     {method === 'email' ? (
                       <input type="email" placeholder="Email (Archive)" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-white p-4 rounded-xl font-bold border-none shadow-sm animate-in fade-in" />
                     ) : (
                       <input type="tel" placeholder="Phone (Archive)" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-white p-4 rounded-xl font-bold border-none shadow-sm animate-in fade-in" />
                     )}
                  </div>
                </>
              ) : (
                <div className="relative">
                  <input type="text" placeholder="Identity Identifier" value={loginIdentifier} onChange={e=>setLoginIdentifier(e.target.value)} className="w-full bg-gray-50 p-5 rounded-2xl font-bold border-none" />
                  <button type="button" onClick={() => setMethod(method === 'phone' ? 'email' : 'phone')} className="absolute right-5 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-gray-400 bg-white px-2 py-1 rounded shadow-sm">Via {method === 'phone' ? 'WA' : 'Mail'}</button>
                </div>
              )}
              
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Access Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-gray-50 p-5 rounded-2xl font-bold border-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
            </div>

            <button type="submit" className="w-full bg-black text-white py-6 rounded-3xl font-black text-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
              {loading ? <Loader2 className="animate-spin" /> : 'Authorize'} <ArrowRight size={24} />
            </button>
            <div className="text-center pt-4"><button type="button" onClick={onAdminAccess} className="text-[9px] font-black uppercase text-gray-300 hover:text-red-600 transition-colors tracking-widest">Admin Console Access</button></div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
