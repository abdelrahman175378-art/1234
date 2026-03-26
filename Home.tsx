import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, ASSETS, CONTACT_WHATSAPP, CONTACT_EMAIL } from '../constants';
import { ArrowRight, Sparkles, Truck, ShieldCheck, Zap, ArrowUpRight, Heart, MessageSquare, Mail, Award, MapPin, Binary, ShieldAlert, Fingerprint, Lock, Compass, Quote, Star, PlayCircle, Eye } from 'lucide-react';
import ProductCardMedia from '../components/ProductCardMedia';

interface HomeProps {
  setPage: (p: string) => void;
  onCategoryClick: (cat: string) => void;
  onProductClick: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ setPage, onCategoryClick, onProductClick }) => {
  const { language, products, wishlist, toggleWishlist } = useApp();
  const isAr = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  const categories = [
    { 
      id: 'Men', 
      label: isAr ? 'عالم الرجال' : 'MEN\'S WORLD', 
      img: ASSETS.menCover,
      isOutlet: true,
      desc: isAr ? 'مجموعة الشارع الفاخرة' : 'Streetwear & Luxury Outlet'
    },
    { 
      id: 'Women', 
      label: isAr ? 'عالم النساء' : 'WOMEN\'S WORLD', 
      img: ASSETS.womenCover,
      desc: isAr ? 'أناقة لا مثيل لها' : 'Timeless High Fashion'
    }
  ];

  const featuredProducts = products.slice(0, 4);

  const trustPillars = [
    { id: 'vault', label: t('neuralVault'), desc: t('vaultDesc'), icon: <Binary size={24}/>, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'rls', label: t('rlsProtocol'), desc: t('rlsDesc'), icon: <ShieldAlert size={24}/>, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'face', label: t('faceAuth'), desc: t('faceDesc'), icon: <Fingerprint size={24}/>, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'lock', label: t('sessionLock'), desc: t('lockDesc'), icon: <Lock size={24}/>, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="animate-in fade-in duration-1000 overflow-x-hidden">
      {/* Editorial Hero */}
      <section className="relative h-[85vh] md:h-[95vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={ASSETS.heroBg} 
            alt="Editorial Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center text-white font-sans">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.8em] mb-6 md:mb-8 bg-white/10 backdrop-blur-xl px-6 md:px-8 py-2 md:py-3 rounded-full border border-white/20">
                Doha High-Street • {new Date().getFullYear()}
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-[12rem] font-black mb-6 tracking-tighter uppercase leading-[1.1] md:leading-none drop-shadow-2xl">
              {isAr ? 'أناقة النخبة' : 'MODERN ELITE.'}
            </h1>
            <p className="text-sm md:text-lg lg:text-2xl font-medium mb-10 md:mb-12 max-w-2xl opacity-90 leading-relaxed italic px-4">
              {isAr 
                ? 'في قلب الدوحة، نكتب قصة جديدة للموضة العصرية. حيث تلتقي الفخامة بالجرأة.' 
                : 'Crafted at the intersection of Doha\'s heritage and the global future. Luxury without compromise.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto px-6">
              <button 
                onClick={() => onCategoryClick('All')}
                className="bg-white text-black px-10 md:px-16 py-4 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
              >
                {t('shopNow')} <ArrowRight size={20} className={isAr ? 'rotate-180 md:w-6 md:h-6' : 'md:w-6 md:h-6'} />
              </button>
              <button 
                onClick={() => setPage('shop')}
                className="bg-black/30 backdrop-blur-md text-white border border-white/20 px-10 md:px-16 py-4 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl hover:bg-white hover:text-black transition-all active:scale-95"
              >
                {t('lookbook')}
              </button>
            </div>
        </div>
      </section>

      {/* Brand Narrative Section */}
      <section className="py-16 md:py-32 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-24">
            <div className="lg:w-1/2 space-y-8 md:space-y-12 text-start">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-red-600 font-black uppercase text-[8px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em]">
                        <Compass size={14} className="md:w-4 md:h-4" /> {t('brandVision')}
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[1.1] md:leading-none">
                        {isAr ? 'جوهر AK Modern' : 'THE ESSENCE OF AK.'}
                    </h2>
                </div>
                
                <div className="relative p-6 md:p-12 bg-gray-50 rounded-3xl md:rounded-[4rem] border border-gray-100 italic text-lg md:text-2xl text-gray-500 leading-relaxed group">
                    <Quote className="absolute top-4 md:top-8 left-4 md:left-8 text-red-100 group-hover:text-red-200 transition-colors w-10 h-10 md:w-[60px] md:h-[60px]" />
                    <p className="relative z-10 px-4">
                        {t('brandStory')}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
                    <div className="space-y-3 md:space-y-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-black text-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl"><Award size={24} className="md:w-7 md:h-7"/></div>
                        <h4 className="font-black uppercase tracking-widest text-[10px] md:text-sm">{isAr ? 'جودة مطلقة' : 'Absolute Quality'}</h4>
                        <p className="text-gray-400 text-[10px] md:text-xs leading-relaxed">{isAr ? 'نختار أجود الأقمشة لتدوم طويلاً.' : 'Sourcing the finest textiles for generational durability.'}</p>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-red-600 text-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl"><MapPin size={24} className="md:w-7 md:h-7"/></div>
                        <h4 className="font-black uppercase tracking-widest text-[10px] md:text-sm">{isAr ? 'فخر قطري' : 'Proudly Doha'}</h4>
                        <p className="text-gray-400 text-[10px] md:text-xs leading-relaxed">{isAr ? 'من قلب قطر إلى العالم.' : 'Born in the heart of Doha, crafted for the global eye.'}</p>
                    </div>
                </div>
            </div>
            <div className="lg:w-1/2 relative w-full">
                <div className="aspect-[4/5] rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.1)] group">
                    <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Narrative" />
                </div>
                <div className={`absolute -bottom-6 md:-bottom-10 bg-black text-white p-6 md:p-12 rounded-2xl md:rounded-[3rem] shadow-2xl ${isAr ? 'left-4 md:-left-10' : 'right-4 md:-right-10'}`}>
                    <div className="flex gap-1 mb-2 md:mb-4">
                        {[1,2,3,4,5].map(i => <Star key={i} size={10} md:size={14} fill="#FF0000" className="text-red-600" />)}
                    </div>
                    <p className="text-xl md:text-2xl font-black mb-1">10k+</p>
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-50">{isAr ? 'عميل في قطر' : 'Active Members in Qatar'}</p>
                </div>
            </div>
        </div>
      </section>

      {/* Editorial Lookbook Section */}
      <section className="py-20 md:py-32 bg-zinc-950 text-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8">
          <div className="mb-12 md:mb-20 text-center">
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter uppercase mb-4 md:mb-6">{t('lookbook')}</h2>
            <p className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em]">Curation: Vol 01 - The Neon Sands</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 h-auto md:h-[800px]">
            <div className="md:col-span-5 h-[400px] md:h-full relative group cursor-pointer overflow-hidden rounded-3xl md:rounded-[4rem]">
              <img src={ASSETS.lookbook1} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="Lookbook" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-8 md:bottom-12 left-8 md:left-12 text-start">
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-white/60">Style 01</p>
                <h3 className="text-2xl md:text-4xl font-black uppercase">Urban Nomad</h3>
              </div>
            </div>
            
            <div className="md:col-span-7 flex flex-col gap-6 md:gap-8 h-auto md:h-full">
              <div className="h-[300px] md:h-1/2 relative group cursor-pointer overflow-hidden rounded-3xl md:rounded-[4rem]">
                <img src={ASSETS.lookbook2} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="Lookbook" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-8 md:top-12 right-8 md:right-12 text-right">
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-white/60">Style 02</p>
                  <h3 className="text-2xl md:text-4xl font-black uppercase">Desert Luxe</h3>
                </div>
              </div>
              <div className="h-auto md:h-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="h-[300px] md:h-full relative group cursor-pointer overflow-hidden rounded-3xl md:rounded-[4rem]">
                  <img src={ASSETS.lookbook3} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="Lookbook" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle size={40} className="md:w-[60px] md:h-[60px] text-white" />
                  </div>
                </div>
                <div className="h-[200px] md:h-full bg-red-600 flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-3xl md:rounded-[4rem] group hover:bg-white hover:text-black transition-all cursor-pointer">
                  <h3 className="text-xl md:text-3xl lg:text-4xl font-black uppercase mb-4 md:mb-6 tracking-tighter">Explore Full Reel</h3>
                  <button className="p-3 md:p-4 rounded-full border border-current">
                    <ArrowRight size={20} className="md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="py-16 md:py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {trustPillars.map(p => (
                    <div key={p.id} className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-2xl transition-all">
                        <div className={`w-12 h-12 md:w-14 md:h-14 ${p.bg} ${p.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
                            {p.icon}
                        </div>
                        <h4 className="font-black uppercase text-[10px] md:text-xs mb-2 tracking-tight">{p.label}</h4>
                        <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">{p.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Seasonal Picks */}
      {featuredProducts.length > 0 && (
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 gap-6 text-start">
              <div className="space-y-3 md:space-y-4">
                <span className="text-red-600 font-black uppercase text-[8px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em]">{isAr ? 'مختارات الموسم' : 'SEASONAL PICKS'}</span>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[1.1] md:leading-none">{isAr ? 'الأكثر رواجاً' : 'THE CULT CLASSICS'}</h2>
              </div>
              <button onClick={() => onCategoryClick('All')} className="w-full md:w-auto px-8 md:px-12 py-4 md:py-5 bg-black text-white rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-xl">
                {isAr ? 'عرض الجميع' : 'VIEW ALL COLLECTIBLES'} <ArrowUpRight size={16} className="md:w-5 md:h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {featuredProducts.map(p => {
                  const variantKeys = Object.keys(p.variants);
                  const firstV = p.variants[variantKeys[0]];
                  
                  if (!firstV) return null;

                  return (
                    <div key={p.id} className="group cursor-pointer text-start" onClick={() => onProductClick(p.id)}>
                        <div className="aspect-[3/4] rounded-2xl md:rounded-[3rem] overflow-hidden bg-gray-100 mb-6 md:mb-8 relative shadow-xl">
                        <ProductCardMedia 
                            imageUrl={firstV.images?.[0]} 
                            videoUrl={firstV.videoUrl}
                            alt={isAr ? firstV.nameAr : firstV.nameEn}
                        />
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                            className={`absolute top-4 md:top-6 p-3 md:p-4 rounded-full shadow-2xl transition-all z-10 ${isAr ? 'left-4 md:left-6' : 'right-4 md:right-6'} ${wishlist.includes(p.id) ? 'bg-red-600 text-white' : 'bg-white/80 backdrop-blur-md text-gray-400'}`}
                        >
                            <Heart size={18} className="md:w-5 md:h-5" fill={wishlist.includes(p.id) ? "currentColor" : "none"} />
                        </button>
                        </div>
                        <h3 className="font-black text-xl md:text-2xl uppercase tracking-tight group-hover:text-red-600 transition-colors truncate">
                            {isAr ? firstV.nameAr : firstV.nameEn}
                        </h3>
                        <p className="text-lg md:text-xl font-black mt-1 md:mt-2 text-gray-900">{firstV.price} QAR</p>
                        <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 md:mt-2">{variantKeys.length} Colors Available</p>
                    </div>
                  );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;