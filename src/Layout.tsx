
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, CONTACT_WHATSAPP, CONTACT_EMAIL, ASSETS } from '../constants';
import { ShoppingBag, Menu, X, Globe, Truck, Heart, History, Sparkles, MessageSquare, Mail, ShieldCheck, Lock, Award, Search, Zap, ShieldAlert, LogOut, User, Power, Volume2, VolumeX, Music, Headphones } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setPage: (page: string) => void;
  onCategoryClick?: (category: string) => void;
  onPolicyClick?: (type: string) => void;
  hideNav?: boolean;
}

const MusicPlayer: React.FC<{ forcePlay?: boolean }> = ({ forcePlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (forcePlay && audioRef.current && !hasError) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
        console.error("Audio playback blocked or failed:", err);
      });
    }
  }, [forcePlay, hasError]);

  const toggleMusic = () => {
    if (!audioRef.current || hasError) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Manual audio play failed:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioError = () => {
    console.warn("Brand music source failed to load. Muting player.");
    setHasError(true);
    setIsPlaying(false);
  };

  return (
    <div className="fixed bottom-24 right-8 z-[90] flex flex-col items-center gap-2 group">
      <audio 
        ref={audioRef} 
        src={ASSETS.backgroundMusic} 
        loop 
        onError={handleAudioError}
      />
      
      {/* Visualizer bars */}
      <div className={`flex gap-1 h-8 items-end mb-2 transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`w-1 bg-red-600 rounded-full animate-bounce [animation-duration:1s] shadow-[0_0_10px_rgba(220,38,38,0.5)] ${isPlaying ? '' : 'pause'}`} style={{ height: '40%' }}></div>
        <div className={`w-1 bg-red-600 rounded-full animate-bounce [animation-duration:0.6s] shadow-[0_0_10px_rgba(220,38,38,0.5)] ${isPlaying ? '' : 'pause'}`} style={{ height: '100%' }}></div>
        <div className={`w-1 bg-red-600 rounded-full animate-bounce [animation-duration:0.8s] shadow-[0_0_10px_rgba(220,38,38,0.5)] ${isPlaying ? '' : 'pause'}`} style={{ height: '60%' }}></div>
        <div className={`w-1 bg-red-600 rounded-full animate-bounce [animation-duration:1.2s] shadow-[0_0_10px_rgba(220,38,38,0.5)] ${isPlaying ? '' : 'pause'}`} style={{ height: '80%' }}></div>
      </div>

      <button
        onClick={toggleMusic}
        disabled={hasError}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 border-2 ${hasError ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : isPlaying ? 'bg-black text-white border-black scale-110' : 'bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}
      >
        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
      {hasError && <span className="text-[8px] font-black uppercase text-red-500 bg-white/80 px-2 py-1 rounded">Audio Offline</span>}
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setPage, onCategoryClick, onPolicyClick, hideNav = false }) => {
  const { language, setLanguage, cart, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUnlockOverlay, setShowUnlockOverlay] = useState(true);
  const [shouldPlayMusic, setShouldPlayMusic] = useState(false);
  const isAr = language === 'ar';

  const handleUnlockAtmosphere = () => {
    setShouldPlayMusic(true);
    setShowUnlockOverlay(false);
  };

  const handleExitProtocol = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen(false);
    logout();
  };

  const adminClickCount = useRef(0);
  const adminClickTimeout = useRef<number | null>(null);

  const handleSecretAdminClick = () => {
    adminClickCount.current += 1;
    if (adminClickTimeout.current) window.clearTimeout(adminClickTimeout.current);
    
    if (adminClickCount.current >= 5) {
      setPage('admin');
      adminClickCount.current = 0;
    } else {
      adminClickTimeout.current = window.setTimeout(() => {
        adminClickCount.current = 0;
      }, 1000);
    }
  };

  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  const navItems = [
    { id: 'home', label: t('home') },
    { id: 'shop', label: t('explore') },
    { id: 'wishlist', label: isAr ? 'المفضلة' : 'Wishlist', icon: <Heart size={18} /> },
    { id: 'recently-viewed', label: isAr ? 'شوهد مؤخراً' : 'History', icon: <History size={18} /> },
    { id: 'ai-stylist', label: isAr ? 'المختبر الذكي' : 'AI Lab', icon: <Sparkles size={16} className="text-purple-600" /> },
    { id: 'contact', label: isAr ? 'اتصل بنا' : 'Contact' },
  ];

  const customerRights = [
    { en: 'Secure Payments', ar: 'دفع آمن', icon: <Lock size={14} /> },
    { en: 'Data Privacy', ar: 'خصوصية البيانات', icon: <ShieldCheck size={14} /> },
    { en: 'Quality Guarantee', ar: 'ضمان الجودة', icon: <Award size={14} /> },
    { en: 'Authentic Items', ar: 'منتجات أصلية', icon: <Search size={14} /> },
    { en: 'Priority Support', ar: 'دعم ذو أولوية', icon: <Zap size={14} /> },
  ];

  if (hideNav) return <>{children}</>;

  return (
    <div className={`min-h-screen flex flex-col ${isAr ? 'arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Atmosphere Unlock Overlay */}
      {showUnlockOverlay && (
        <div className="fixed inset-0 z-[500] bg-black flex items-center justify-center p-6 animate-in fade-in duration-1000">
          <div className="text-center space-y-12 max-w-xl">
            <div className="text-6xl font-black text-white tracking-tighter mb-4">AK<span className="text-red-600">.</span> Modern</div>
            <div className="space-y-4">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em] leading-relaxed">
                {isAr ? 'مرحبا بكم في عالم الموضة الراقية' : 'Welcome to the High-Fashion Experience'}
              </p>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {isAr ? 'تفعيل الأجواء الصوتية' : 'Enable Atmosphere'}
              </h2>
            </div>
            <button 
              onClick={handleUnlockAtmosphere}
              className="group relative px-12 py-8 bg-white rounded-[2.5rem] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
            >
              <div className="relative z-10 flex items-center gap-4 text-black font-black uppercase text-xl tracking-tighter">
                <Headphones size={28} className="text-red-600 group-hover:animate-bounce" />
                {isAr ? 'دخول التجربة' : 'Enter Experience'}
              </div>
              <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-10" />
            </button>
            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest opacity-50">
              Relax with our curated brand music
            </p>
          </div>
        </div>
      )}

      <div className="bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] py-2.5 px-4 flex justify-between items-center z-[60]">
        <div className="flex items-center gap-2">
          <Truck size={12} className="text-red-600 animate-bounce" />
          <span>{isAr ? 'توصيل مجاني لجميع الطلبات في قطر' : 'Free delivery across all of Qatar'}</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <a href={`https://wa.me/${CONTACT_WHATSAPP}`} className="hover:text-red-600 transition-colors uppercase tracking-widest">WhatsApp</a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-red-600 transition-colors uppercase tracking-widest">Email</a>
        </div>
      </div>

      <nav className="fixed top-9 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-600"><Menu /></button>
              <div className="text-3xl font-black tracking-tighter cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setPage('home')}>
                AK<span className="text-red-600">.</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 ${currentPage === item.id ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 mr-2 group shadow-sm transition-all hover:border-red-100">
                  <User size={16} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                  <div className="w-px h-4 bg-gray-200 mx-2" />
                  <button 
                    type="button"
                    onClick={handleExitProtocol}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-white bg-red-600 hover:bg-black px-4 py-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-red-200 border border-red-500"
                  >
                    <Power size={14} />
                    {isAr ? 'خروج' : 'EXIT'}
                  </button>
                </div>
              )}
              
              <button onClick={() => setLanguage(isAr ? 'en' : 'ar')} className="flex items-center gap-2 p-2.5 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                <Globe size={20} className="text-gray-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'EN' : 'عربي'}</span>
              </button>
              <button onClick={() => setPage('cart')} className="relative p-3 bg-black text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black ring-2 ring-white">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className={`fixed inset-0 z-[100] bg-white animate-in ${isAr ? 'slide-in-from-right' : 'slide-in-from-left'} duration-300 flex flex-col`} dir={isAr ? 'rtl' : 'ltr'}>
          <div className="p-4 flex justify-between items-center border-b border-gray-100 h-20 shrink-0">
            <div className="text-3xl font-black tracking-tighter">AK<span className="text-red-600">.</span></div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-600"><X size={32} /></button>
          </div>
          <div className="p-8 flex flex-col gap-10 flex-grow overflow-y-auto">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                className="flex items-center gap-6 text-4xl font-black uppercase tracking-tighter text-left hover:text-red-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
          {user && (
            <div className="p-8 border-t border-gray-100 bg-red-50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><User size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-red-600/50 tracking-widest">{isAr ? 'جلسة نشطة' : 'Active Session'}</p>
                    <p className="text-base font-black uppercase tracking-tight">{user.name}</p>
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleExitProtocol}
                className="w-full bg-red-600 text-white py-6 rounded-3xl font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 border-2 border-red-500 shadow-red-200"
              >
                <Power size={20} />
                {isAr ? 'خروج فوري من النظام' : 'EXIT SYSTEM NOW'}
              </button>
            </div>
          )}
        </div>
      )}

      <main className="flex-grow pt-28">{children}</main>

      {/* Global Brand Music Player */}
      <MusicPlayer forcePlay={shouldPlayMusic} />

      <footer className="bg-white border-t border-gray-100 pt-24 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="text-4xl font-black tracking-tighter mb-6 cursor-default" onClick={handleSecretAdminClick}>AK<span className="text-red-600">.</span> Modern</div>
              <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.3em] leading-relaxed max-w-sm">
                {isAr ? 'تحديد قمة الموضة الفاخرة الحديثة في قطر. نحن ننتقي قطعاً خالدة للأنيقين والجريئين.' : 'Defining the pinnacle of modern luxury fashion in Qatar. Timeless pieces for the bold.'}
              </p>
              <div className="mt-8 space-y-4">
                 <a href={`https://wa.me/${CONTACT_WHATSAPP}`} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><MessageSquare size={18} /></div>
                    <div><p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">WhatsApp</p><p className="text-sm font-black">{CONTACT_WHATSAPP}</p></div>
                 </a>
                 <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Mail size={18} /></div>
                    <div><p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Email</p><p className="text-sm font-black truncate max-w-[150px]">{CONTACT_EMAIL}</p></div>
                 </a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Navigation</h4>
              <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest">
                <li><button onClick={() => setPage('shop')} className="hover:text-red-600">Catalog</button></li>
                <li><button onClick={() => setPage('wishlist')} className="hover:text-red-600">Wishlist</button></li>
                <li><button onClick={() => setPage('recently-viewed')} className="hover:text-red-600">History</button></li>
                <li><button onClick={() => setPage('ai-stylist')} className="hover:text-red-600 text-purple-600">AI Studio</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8">Service</h4>
              <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest">
                <li><button onClick={() => setPage('admin')} className="flex items-center gap-2 hover:text-red-600"><ShieldAlert size={14} /> Admin Portal</button></li>
                <li><button onClick={() => onPolicyClick?.('Shipping')} className="hover:text-red-600">Shipping</button></li>
                <li><button onClick={() => onPolicyClick?.('Returns')} className="hover:text-red-600">Returns</button></li>
                <li><button onClick={() => onPolicyClick?.('Privacy')} className="hover:text-red-600">Privacy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-8">{isAr ? 'حقوق العملاء' : 'Customer Rights'}</h4>
              <ul className="space-y-4">
                {customerRights.map((right, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-black">
                    <span className="text-red-600">{right.icon}</span>
                    {isAr ? right.ar : right.en}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-gray-100 flex flex-col items-center gap-10">
            {user && (
              <div className="w-full max-w-md relative z-[1000]">
                <button 
                  type="button"
                  onClick={handleExitProtocol} 
                  className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl border-4 border-red-500 shadow-red-200 active:scale-95"
                >
                  <Power size={24} />
                  {isAr ? 'الخروج الآمن من النظام' : 'EXIT SYSTEM NOW'}
                </button>
              </div>
            )}
            <div className="flex flex-col md:flex-row justify-between w-full items-center gap-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-red-600">© 2024 AK Modern Qatar. Delivery Fees: ALWAYS FREE</p>
              <div className="flex gap-4">
                <div className="p-2 bg-gray-50 rounded-xl"><Truck size={16} className="text-gray-400" /></div>
                <div className="p-2 bg-gray-50 rounded-xl"><ShieldCheck size={16} className="text-gray-400" /></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
