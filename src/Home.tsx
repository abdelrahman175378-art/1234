
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
    <div className="animate-in fade-in duration-1000">
      {/* Editorial Hero */}
      <section className="relative h-[95vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={ASSETS.heroBg} 
            alt="Editorial Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.8em] mb-8 bg-white/10 backdrop-blur-xl px-8 py-3 rounded-full border border-white/20">
                Doha High-Street • {new Date().getFullYear()}
            </span>
            <h1 className="text-7xl md:text-[12rem] font-black mb-6 tracking-tighter uppercase leading-none drop-shadow-2xl">
              {isAr ? 'أناقة النخبة' : 'MODERN ELITE.'}
            </h1>
            <p className="text-lg md:text-2xl font-medium mb-12 max-w-2xl opacity-90 leading-relaxed italic">
              {isAr 
                ? 'في قلب الدوحة، نكتب قصة جديدة للموضة العصرية. حيث تلتقي الفخامة بالجرأة.' 
                : 'Crafted at the intersection of Doha\'s heritage and the global future. Luxury without compromise.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <button 
                onClick={() => onCategoryClick('All')}
                className="bg-white text-black px-16 py-6 rounded-[2rem] font-black text-xl hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3"
              >
                {t('shopNow')} <ArrowRight size={24} className={isAr ? 'rotate-180' : ''} />
              </button>
              <button 
                onClick={() => setPage('shop')}
                className="bg-black/30 backdrop-blur-md text-white border border-white/20 px-16 py-6 rounded-[2rem] font-black text-xl hover:bg-white hover:text-black transition-all active:scale-95"
              >
                {t('lookbook')}
              </button>
            </div>
        </div>
      </section>

      {/* Brand Narrative / Philosophy Section */}
      <section className="py-32 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
            <div className="lg:w-1/2 space-y-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-red-600 font-black uppercase text-[10px] tracking-[0.5em]">
                        <Compass size={16} /> {t('brandVision')}
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                        {isAr ? 'جوهر AK Modern' : 'THE ESSENCE OF AK.'}
                    </h2>
                </div>
                
                <div className="relative p-12 bg-gray-50 rounded-[4rem] border border-gray-100 italic text-xl md:text-2xl text-gray-500 leading-relaxed group">
                    <Quote className="absolute top-8 left-8 text-red-100 group-hover:text-red-200 transition-colors" size={60} />
                    <p className="relative z-10">
                        {t('brandStory')}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-black text-white rounded-3xl flex items-center justify-center shadow-xl"><Award size={28}/></div>
                        <h4 className="font-black uppercase tracking-widest text-sm">{isAr ? 'جودة مطلقة' : 'Absolute Quality'}</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">{isAr ? 'نختار أجود الأقمشة لتدوم طويلاً.' : 'Sourcing the finest textiles for generational durability.'}</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-red-600 text-white rounded-3xl flex items-center justify-center shadow-xl"><MapPin size={28}/></div>
                        <h4 className="font-black uppercase tracking-widest text-sm">{isAr ? 'فخر قطري' : 'Proudly Doha'}</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">{isAr ? 'من قلب قطر إلى العالم.' : 'Born in the heart of Doha, crafted for the global eye.'}</p>
                    </div>
                </div>
            </div>
            <div className="lg:w-1/2 relative">
                <div className="aspect-[4/5] rounded-[5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] group">
                    <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Narrative" />
                </div>
                <div className={`absolute -bottom-10 bg-black text-white p-12 rounded-[3rem] shadow-2xl ${isAr ? '-left-10' : '-right-10'}`}>
                    <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#FF0000" className="text-red-600" />)}
                    </div>
                    <p className="text-2xl font-black mb-1">10k+</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{isAr ? 'عميل في قطر' : 'Active Members in Qatar'}</p>
                </div>
            </div>
        </div>
      </section>

      {/* Editorial Lookbook Section */}
      <section className="py-32 bg-zinc-950 text-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="mb-20 text-center">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6">{t('lookbook')}</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.5em]">Curation: Vol 01 - The Neon Sands</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[800px]">
            <div className="md:col-span-5 h-full relative group cursor-pointer overflow-hidden rounded-[4rem]">
              <img src={ASSETS.lookbook1} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="Lookbook" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-12 left-12">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2">Style 01</p>
                <h3 className="text-4xl font-black uppercase">Urban Nomad</h3>
              </div>
            </div>
            
            <div className="md:col-span-7 flex flex-col gap-8 h-full">
              <div className="h-1/2 relative group cursor-pointer overflow-hidden rounded-[4rem]">
                <img src={ASSETS.lookbook2} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="Lookbook" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-12 right-12 text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2">Style 02</p>
                  <h3 className="text-4xl font-black uppercase">Desert Luxe</h3>
                </div>
              </div>
              <div className="h-1/2 grid grid-cols-2 gap-8">
                <div className="relative group cursor-pointer overflow-hidden rounded-[4rem]">
                  <img src={ASSETS.lookbook3} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="Lookbook" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle size={60} className="text-white" />
                  </div>
                </div>
                <div className="bg-red-600 flex flex-col items-center justify-center text-center p-12 rounded-[4rem] group hover:bg-white hover:text-black transition-all cursor-pointer">
                  <h3 className="text-4xl font-black uppercase mb-6 tracking-tighter">Explore Full Reel</h3>
                  <button className="p-4 rounded-full border border-current">
                    <ArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {trustPillars.map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-2xl transition-all">
                        <div className={`w-14 h-14 ${p.bg} ${p.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            {p.icon}
                        </div>
                        <h4 className="font-black uppercase text-xs mb-2 tracking-tight">{p.label}</h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">{p.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Seasonal Picks */}
      {featuredProducts.length > 0 && (
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex justify-between items-end mb-24">
              <div className="space-y-4">
                <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.5em]">{isAr ? 'مختارات الموسم' : 'SEASONAL PICKS'}</span>
                <h2 className="text-7xl font-black tracking-tighter uppercase leading-none">{isAr ? 'الأكثر رواجاً' : 'THE CULT CLASSICS'}</h2>
              </div>
              <button onClick={() => onCategoryClick('All')} className="px-12 py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-red-600 transition-all shadow-xl">
                {isAr ? 'عرض الجميع' : 'VIEW ALL COLLECTIBLES'} <ArrowUpRight size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {featuredProducts.map(p => (
                  <div key={p.id} className="group cursor-pointer" onClick={() => onProductClick(p.id)}>
                    <div className="aspect-[3/4] rounded-[3rem] overflow-hidden bg-gray-100 mb-8 relative shadow-xl">
                      <ProductCardMedia 
                        imageUrl={p.images?.[0]} 
                        videoUrl={p.videoUrl}
                        alt={p.nameEn}
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                        className={`absolute top-6 p-4 rounded-full shadow-2xl transition-all z-10 ${isAr ? 'left-6' : 'right-6'} ${wishlist.includes(p.id) ? 'bg-red-600 text-white' : 'bg-white/80 backdrop-blur-md text-gray-400'}`}
                      >
                        <Heart size={20} fill={wishlist.includes(p.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <h3 className="font-black text-2xl uppercase tracking-tighter group-hover:text-red-600 transition-colors">{isAr ? p.nameAr : p.nameEn}</h3>
                    <p className="text-xl font-black mt-1">{p.price} QAR</p>
                  </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
