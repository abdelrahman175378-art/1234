import React, { useState, useRef, useEffect } from 'react';
import { useApp } from './AppContext'; // ✅ تم التصحيح
import { TRANSLATIONS, CONTACT_WHATSAPP, CONTACT_EMAIL, ASSETS } from './constants'; // ✅ تم التصحيح
import { ShoppingBag, Menu, X, Globe, Truck, Heart, History, Sparkles, MessageSquare, Mail, ShieldCheck, Lock, Award, Search, Zap, ShieldAlert, LogOut, User, Power, Volume2, VolumeX, Music, Headphones } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode, currentPage: string, setPage: (p: string) => void, onPolicyClick?: (t: string) => void, hideNav?: boolean }> = ({ children, currentPage, setPage, onPolicyClick, hideNav = false }) => {
  const { language, setLanguage, cart, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAr = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  if (hideNav) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 h-20">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-full">
          <div className="text-2xl font-black cursor-pointer" onClick={() => setPage('home')}>AK<span className="text-red-600">.</span></div>
          <div className="hidden md:flex gap-8">
            <button onClick={() => setPage('home')} className="font-bold text-sm uppercase">Home</button>
            <button onClick={() => setPage('shop')} className="font-bold text-sm uppercase">Shop</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setLanguage(isAr ? 'en' : 'ar')} className="text-xs font-black">{isAr ? 'EN' : 'عربي'}</button>
            <button onClick={() => setPage('cart')} className="bg-black text-white p-2 rounded-lg relative">
              <ShoppingBag size={20} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-grow pt-20">{children}</main>
      <footer className="bg-gray-50 p-12 text-center border-t border-gray-100">
        <p className="text-[10px] font-black uppercase text-gray-400">© 2024 AK Modern Fashion Qatar</p>
      </footer>
    </div>
  );
};
export default Layout;
