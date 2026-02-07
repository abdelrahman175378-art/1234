import React from 'react';
import { useApp } from './AppContext'; // ✅ تم تصحيح المسار
import { TRANSLATIONS, ASSETS, CONTACT_WHATSAPP, CONTACT_EMAIL } from './constants'; // ✅ تم تصحيح المسار
import { ArrowRight, Sparkles, Truck, ShieldCheck, Zap, ArrowUpRight, Heart, Award, MapPin, Binary, ShieldAlert, Fingerprint, Lock, Compass, Quote, Star, PlayCircle } from 'lucide-react';
import ProductCardMedia from './ProductCardMedia'; // ✅ تم تصحيح المسار

interface HomeProps {
  setPage: (p: string) => void;
  onCategoryClick: (cat: string) => void;
  onProductClick: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ setPage, onCategoryClick, onProductClick }) => {
  const { language, products, wishlist, toggleWishlist } = useApp();
  const isAr = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

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

      {/* Brand Narrative Section */}
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
                
                <div className="relative p-12 bg-gray-50 rounded-[4rem] border border-gray-100 italic text-xl md:text-2xl text-gray-500 leading-relaxed">
                    <Quote className="absolute top-8 left-8 text-red-100" size={60} />
                    <p className="relative z-10">
                        {t('brandStory')}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-black text-white rounded-3xl flex items-center justify-center shadow-xl"><Award size={28}/></div>
                        <h4 className="font-black uppercase tracking-widest text-sm">{isAr ? 'جودة مطلقة' : 'Absolute Quality'}</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="w-14 h-14 bg-red-600 text-white rounded-3xl flex items-center justify-center shadow-xl"><MapPin size={28}/></div>
                        <h4 className="font-black uppercase tracking-widest text-sm">{isAr ? 'فخر قطري' : 'Proudly Doha'}</h4>
                    </div>
                </div>
            </div>
            <div className="lg:w-1/2">
                <div className="aspect-[4/5] rounded-[5rem] overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200" className="w-full h-full object-cover" alt="Narrative" />
                </div>
            </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {trustPillars.map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className={`w-14 h-14 ${p.bg} ${p.color} rounded-2xl flex items-center justify-center mb-6`}>
                            {p.icon}
                        </div>
                        <h4 className="font-black uppercase text-xs mb-2">{p.label}</h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p.desc}</p>
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
