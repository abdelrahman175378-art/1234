import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { History, ArrowLeft, ShoppingBag, Heart } from 'lucide-react';
import ProductCardMedia from '../components/ProductCardMedia';

interface RecentlyViewedProps {
  onProductClick: (id: string) => void;
  onBack: () => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onProductClick, onBack }) => {
  const { language, products, recentlyViewed, addToCart, wishlist, toggleWishlist } = useApp();
  const isAr = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  const viewedProducts = recentlyViewed
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as any[];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:py-12 animate-in fade-in duration-700 overflow-x-hidden text-start">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-400 hover:text-black mb-8 md:mb-12 uppercase tracking-widest transition-colors"
      >
        <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} /> {isAr ? 'العودة' : 'Back'}
      </button>

      <div className="mb-8 md:mb-12 text-start">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 uppercase">{isAr ? 'شوهد مؤخراً' : 'Recently Viewed'}</h1>
        <p className="text-gray-400 font-black uppercase tracking-[0.2em] md:tracking-widest text-[9px] md:text-xs">
          {viewedProducts.length} {isAr ? 'منتجات قمت بزيارتها' : 'Items you explored in archive'}
        </p>
      </div>

      {viewedProducts.length === 0 ? (
        <div className="text-center py-20 md:py-40 bg-gray-50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <History className="text-gray-200" size={32} />
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-2 uppercase">{isAr ? 'لا توجد منتجات حالياً' : 'No history yet'}</h2>
          <p className="text-gray-400 text-xs md:text-sm mb-8 px-6">{isAr ? 'استكشف متجرنا للعثور على قطع مذهلة تناسب ذوقك.' : 'Explore our shop to find amazing pieces for your collection.'}</p>
          <button 
            onClick={onBack} 
            className="bg-black text-white px-8 md:px-10 py-4 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl active:scale-95 transition-transform"
          >
            {t('shopNow')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {viewedProducts.map(p => {
            const isInWishlist = wishlist.includes(p.id);
            // استخراج أول خيار للمنتج للعرض الافتراضي
            const firstVariant = p.variants ? Object.values(p.variants)[0] as any : null;
            
            return (
              <div key={p.id} className="group flex flex-col">
                <div 
                  className="aspect-[3/4] rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-gray-100 relative shadow-sm mb-4 md:mb-6 cursor-pointer" 
                  onClick={() => onProductClick(p.id)}
                >
                  <ProductCardMedia 
                    imageUrl={firstVariant?.images?.[0] || p.images?.[0]} 
                    videoUrl={firstVariant?.videoUrl || p.videoUrl}
                    alt={isAr ? p.nameAr : p.nameEn}
                  />
                  
                  {/* Wishlist Button - Responsive positioning */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                    className={`absolute top-3 right-3 md:top-4 md:right-4 p-2 md:p-2.5 rounded-full shadow-lg transition-all z-10 ${isInWishlist ? 'bg-red-600 text-white' : 'bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-600'}`}
                  >
                    <Heart size={14} className="md:w-4 md:h-4" fill={isInWishlist ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="px-1 text-start">
                  <h3 
                    className="font-black text-sm md:text-lg mb-1 cursor-pointer hover:text-red-600 transition-colors truncate uppercase leading-tight" 
                    onClick={() => onProductClick(p.id)}
                  >
                    {isAr ? p.nameAr : p.nameEn}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="font-black text-black text-sm md:text-base">
                      {firstVariant?.price || p.price} <span className="text-[10px] opacity-30 uppercase font-black">QAR</span>
                    </p>
                    <button 
                      onClick={() => addToCart({ 
                        product: p, 
                        variant: firstVariant,
                        quantity: 1, 
                        selectedSize: firstVariant?.sizes?.[0] || p.sizes?.[0] || 'M', 
                        selectedColor: firstVariant?.color || p.colors?.[0] || '' 
                      })}
                      className="text-[8px] md:text-[10px] font-[1000] uppercase tracking-widest flex items-center gap-1.5 text-red-600 hover:text-black transition-colors"
                    >
                      <ShoppingBag size={12} className="md:w-3.5 md:h-3.5" /> {t('addToCart')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentlyViewed;