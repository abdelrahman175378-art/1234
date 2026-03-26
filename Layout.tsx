import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, CONTACT_WHATSAPP, CONTACT_EMAIL, ASSETS } from '../constants';
import { 
  ShoppingBag, Menu, X, Globe, Truck, Heart, History, Sparkles, 
  MessageSquare, Mail, ShieldCheck, Lock, Award, Search, Zap, 
  ShieldAlert, LogOut, User, Power, Volume2, VolumeX, Music, 
  Headphones, Instagram, Twitter, Facebook, ExternalLink, 
  ChevronRight, RefreshCw, Scale, Shield, Terminal, Phone, CheckCircle2 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setPage: (page: string) => void;
  onCategoryClick?: (category: string) => void;
  onPolicyClick?: (type: string) => void;
  hideNav?: boolean;
}

const audioInstance = new Audio(ASSETS.backgroundMusic);
audioInstance.loop = true;
audioInstance.preload = 'auto';

const MusicPlayer: React.FC<{ forcePlay?: boolean }> = ({ forcePlay }) => {
  const [isPlaying, setIsPlaying] = useState(!audioInstance.paused);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleCanPlay = () => setHasError(false);
    const handleError = () => setHasError(true);
    audioInstance.addEventListener('canplay', handleCanPlay);
    audioInstance.addEventListener('error', handleError);

    if (forcePlay && !hasError && audioInstance.paused) {
      audioInstance.play().then(() => setIsPlaying(true)).catch(err => console.warn(err));
    }

    const syncState = () => setIsPlaying(!audioInstance.paused);
    audioInstance.addEventListener('play', syncState);
    audioInstance.addEventListener('pause', syncState);

    return () => {
      audioInstance.removeEventListener('canplay', handleCanPlay);
      audioInstance.removeEventListener('error', handleError);
      audioInstance.removeEventListener('play', syncState);
      audioInstance.removeEventListener('pause', syncState);
    };
  }, [forcePlay, hasError]);

  const toggleMusic = () => {
    if (hasError) return;
    if (!audioInstance.paused) audioInstance.pause();
    else audioInstance.play().catch(console.warn);
    setIsPlaying(!audioInstance.paused);
  };

  return (
    <div className="fixed bottom-24 md:bottom-32 rtl:left-6 ltr:right-6 md:rtl:left-8 md:ltr:right-8 z-[90] flex flex-col items-center gap-2 group">
      <div className={`flex gap-1 h-6 md:h-8 items-end mb-1 md:mb-2 transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-1 bg-red-600 rounded-full animate-bounce [animation-duration:1s]" style={{ height: '40%' }}></div>
        <div className="w-1 bg-red-600 rounded-full animate-bounce [animation-duration:0.6s]" style={{ height: '100%' }}></div>
        <div className="w-1 bg-red-600 rounded-full animate-bounce [animation-duration:0.8s]" style={{ height: '60%' }}></div>
      </div>
      <button onClick={toggleMusic} disabled={hasError} className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 border-2 ${hasError ? 'bg-gray-200 text-gray-400' : isPlaying ? 'bg-black text-white border-black scale-110' : 'bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}>
        {isPlaying ? <Volume2 size={20} className="md:w-6 md:h-6" /> : <VolumeX size={20} className="md:w-6 md:h-6" />}
      </button>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setPage, onCategoryClick, onPolicyClick, hideNav = false }) => {
  const { language, setLanguage, cart, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUnlockOverlay, setShowUnlockOverlay] = useState(true);
  const [shouldPlayMusic, setShouldPlayMusic] = useState(false);
  const isAr = language === 'ar';

  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  const navItems = [
    { id: 'home', label: t('home') },
    { id: 'shop', label: t('explore') },
    ...(user ? [{ id: 'auth', label: isAr ? 'حسابي' : 'My Profile', icon: <User size={18} /> }] : []),
    { id: 'wishlist', label: isAr ? 'المفضلة' : 'Wishlist', icon: <Heart size={18} /> },
    { id: 'contact', label: isAr ? 'اتصل بنا' : 'Contact' },
  ];

  if (hideNav) return <>{children}</>;

  return (
    <div className={`min-h-screen flex flex-col ${isAr ? 'arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* --- ELITE CINEMATIC UNLOCK OVERLAY --- */}
      {showUnlockOverlay && (
        <div className="fixed inset-0 z-[500] bg-black flex items-center justify-center p-6 animate-in fade-in duration-[2000ms] overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-zinc-900 via-black to-zinc-800 scale-110 animate-pulse"></div>
          
          <div className="relative z-10 text-center space-y-12 md:space-y-16 max-w-2xl animate-in zoom-in-95 duration-1000">
            <div className="space-y-4 md:space-y-6">
               <div className="text-5xl md:text-9xl font-[1000] text-white tracking-tighter mb-4 italic">AK<span className="text-red-600">.</span> ATELIER</div>
               <div className="flex items-center justify-center gap-4 md:gap-6">
                 <div className="h-[1px] w-12 md:w-20 bg-zinc-800"></div>
                 <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] md:tracking-[1em] text-zinc-500 whitespace-nowrap">{isAr ? 'منصة النخبة' : 'ELITE ARCHIVE PLATFORM'}</p>
                 <div className="h-[1px] w-12 md:w-20 bg-zinc-800"></div>
               </div>
            </div>

            <button onClick={() => { setShouldPlayMusic(true); setShowUnlockOverlay(false); }} className="group relative px-12 md:px-20 py-8 md:py-10 bg-white rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_40px_100px_rgba(255,255,255,0.1)]">
              <div className="relative z-10 flex items-center gap-4 md:gap-6 text-black font-[1000] uppercase text-lg md:text-xl tracking-tighter italic">
                <Headphones size={24} className="md:w-8 md:h-8 text-red-600 animate-bounce" />
                {isAr ? 'دخول الأتيلييه' : 'ENTER ATELIER'}
              </div>
              <div className="absolute inset-0 bg-zinc-50 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
            </button>

            <p className="text-[8px] md:text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] md:tracking-[0.5em] animate-pulse">Establishing Secure Matrix Link...</p>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-black text-white text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] py-2 md:py-2.5 px-4 flex justify-between items-center z-[60]">
        <div className="flex items-center gap-2">
          <Truck size={10} className="md:w-3 md:h-3 text-red-600 animate-bounce" />
          <span className="truncate max-w-[200px] md:max-w-none">{isAr ? 'توصيل مجاني لجميع مناطق قطر' : 'Free delivery across all of Qatar'}</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <a href={`https://wa.me/97470342042`} className="hover:text-red-600 transition-colors uppercase tracking-widest">{isAr ? 'واتساب' : 'WhatsApp'}</a>
          <a href={`mailto:akmodernqa@gmail.com`} className="hover:text-red-600 transition-colors uppercase tracking-widest">{isAr ? 'البريد' : 'Email'}</a>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="fixed top-8 md:top-9 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg"><Menu size={24} /></button>
              <div className="text-2xl md:text-3xl font-black tracking-tighter cursor-pointer hover:opacity-70 transition-opacity" onClick={() => setPage('home')}>
                AK<span className="text-red-600">.</span>
              </div>
            </div>

            {/* Desktop Navigation */}
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
              {user && (
                <button
                  onClick={() => { logout(); setPage('home'); }}
                  className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 text-red-600 hover:text-red-700"
                >
                  <LogOut size={16} />
                  {t('logout')}
                </button>
              )}
            </div>

            {/* Icon Group */}
            <div className="flex items-center gap-2 md:gap-4">
              {!user && (
                <button onClick={() => setPage('auth')} className="p-2 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100 hidden sm:flex items-center gap-2">
                  <User size={18} className="text-gray-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'دخول' : 'Login'}</span>
                </button>
              )}
              
              <button onClick={() => setLanguage(isAr ? 'en' : 'ar')} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-widest">{isAr ? 'EN' : 'عربي'}</span>
              </button>
              
              <button onClick={() => setPage('cart')} className="relative p-2 md:p-3 bg-black text-white rounded-xl md:rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all">
                <ShoppingBag size={18} className="md:w-5 md:h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 ltr:-right-1 rtl:-left-1 bg-red-600 text-white text-[8px] md:text-[9px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-black ring-2 ring-white">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu - ضبط أحجام الخطوط والتنسيق */}
      {mobileMenuOpen && (
        <div className={`fixed inset-0 z-[100] bg-white animate-in ${isAr ? 'slide-in-from-right' : 'slide-in-from-left'} duration-300 flex flex-col`} dir={isAr ? 'rtl' : 'ltr'}>
          <div className="p-4 flex justify-between items-center border-b border-gray-100 h-16 md:h-20 shrink-0">
            <div className="text-2xl font-black tracking-tighter">AK<span className="text-red-600">.</span></div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"><X size={28} /></button>
          </div>
          <div className="p-8 flex flex-col gap-8 md:gap-10 flex-grow overflow-y-auto">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-5 text-3xl md:text-4xl font-black uppercase tracking-tighter text-start hover:text-red-600 transition-colors ${currentPage === item.id ? 'text-red-600' : 'text-black'}`}
              >
                {item.label}
              </button>
            ))}
            {!user && (
              <button 
                onClick={() => { setPage('auth'); setMobileMenuOpen(false); }}
                className="flex items-center gap-5 text-3xl md:text-4xl font-black uppercase tracking-tighter text-start text-black hover:text-red-600 border-t border-gray-100 pt-8 md:pt-10"
              >
                <User size={32} /> {isAr ? 'تسجيل الدخول' : 'Login'}
              </button>
            )}
            {user && (
              <button 
                onClick={() => { logout(); setMobileMenuOpen(false); setPage('home'); }}
                className="flex items-center gap-5 text-3xl md:text-4xl font-black uppercase tracking-tighter text-start text-red-600 hover:text-red-700 transition-colors border-t border-gray-100 pt-8 md:pt-10"
              >
                <LogOut size={32} /> {isAr ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            )}
          </div>
        </div>
      )}

      <main className="flex-grow pt-24 md:pt-28">{children}</main>

      <MusicPlayer forcePlay={shouldPlayMusic} />

      {/* Footer Section - تحسين التجاوب لتجنب التداخل */}
      <footer className="bg-white pt-20 md:pt-32 pb-12 md:pb-16 mt-auto overflow-hidden border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20 md:mb-32">
            
            {/* Brand Section */}
            <div className="lg:col-span-4 space-y-8 md:space-y-10">
              <div className="space-y-2 md:space-y-3">
                <div className="text-4xl md:text-5xl font-[1000] tracking-tighter uppercase italic">
                  AK<span className="text-red-600">.</span>
                </div>
                <div className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-red-600/80">
                  Modern Fashion Atelier
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-medium italic max-w-sm">
                {t('brandStory')}
              </p>
              <div className="flex gap-3">
                <a href="https://instagram.com" className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white hover:border-black transition-all group">
                  <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            {/* Registry/Policy Links */}
            <div className="lg:col-span-3 space-y-6 md:space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-black">{isAr ? 'السجل' : 'Registry'}</h4>
              <ul className="grid grid-cols-1 gap-4 md:gap-5">
                <li>
                  <button onClick={() => onPolicyClick?.('About')} className="text-gray-400 hover:text-black transition-colors text-[10px] md:text-xs font-black uppercase tracking-widest relative group text-start">
                    {t('aboutUs')}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-red-600 group-hover:w-full transition-all duration-300"></span>
                  </button>
                </li>
                {user && (
                   <li>
                    <button onClick={() => setPage('auth')} className="text-gray-400 hover:text-black transition-colors text-[10px] md:text-xs font-black uppercase tracking-widest relative group text-start">
                      {isAr ? 'حسابي الشخصي' : 'My Account Profile'}
                      <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-red-600 group-hover:w-full transition-all duration-300"></span>
                    </button>
                  </li>
                )}
                <li>
                  <button onClick={() => onPolicyClick?.('Shipping')} className="text-gray-400 hover:text-black transition-colors text-[10px] md:text-xs font-black uppercase tracking-widest relative group text-start">
                    {isAr ? 'سياسة الشحن' : 'Shipping Policy'}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-red-600 group-hover:w-full transition-all duration-300"></span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onPolicyClick?.('Returns')} className="text-gray-400 hover:text-black transition-colors text-[10px] md:text-xs font-black uppercase tracking-widest relative group text-start">
                    {isAr ? 'الاستبدال والاسترجاع' : 'Returns & Exchange'}
                    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-red-600 group-hover:w-full transition-all duration-300"></span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setPage('admin')} className="text-gray-400 hover:text-black transition-colors text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 group">
                    <Terminal size={12} className="text-gray-300 group-hover:text-red-600" /> {isAr ? 'النظام' : 'System'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Concierge Section */}
            <div className="lg:col-span-5 space-y-6 md:space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-black">{isAr ? 'الكونسيرج' : 'Concierge'}</h4>
              <div className="grid grid-cols-1 gap-6 md:gap-8">
                <div className="space-y-4">
                  <a href={`https://wa.me/97470342042`} target="_blank" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-all">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">{isAr ? 'دعم الواتساب' : 'WhatsApp Support'}</p>
                      <p className="text-xs font-black tracking-tight">97470342042</p>
                    </div>
                  </a>
                </div>

                <div className="bg-gray-50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-red-600 shadow-sm animate-pulse">
                    <Truck size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h5 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-black">{isAr ? 'توصيل مجاني' : 'Complimentary Delivery'}</h5>
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 italic">{t('deliveryInfo')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 md:pt-16 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-300 text-center md:text-start">
              © {new Date().getFullYear()} AK Modern Fashion Atelier. {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-300">
              <ShieldCheck size={14} className="text-green-500" />
              {isAr ? 'هيكل رقمي آمن' : 'Secure Digital Architecture'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;