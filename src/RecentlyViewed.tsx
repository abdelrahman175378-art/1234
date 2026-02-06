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
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black mb-12 uppercase tracking-widest transition-colors">
        <ArrowLeft size={16} /> {isAr ? 'العودة' : 'Back'}
      </button>

      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-2">{isAr ? 'شوهد مؤخراً' : 'Recently Viewed'}</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
          {viewedProducts.length} {isAr ? 'منتجات قمت بزيارتها' : 'Items you explored'}
        </p>
      </div>

      {viewedProducts.length === 0 ? (
        <div className="text-center py-40 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <History className="text-gray-200" size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2">{isAr ? 'لا توجد منتجات حالياً' : 'No history yet'}</h2>
          <p className="text-gray-400 mb-8">{isAr ? 'استكشف متجرنا للعثور على قطع مذهلة.' : 'Explore our shop to find amazing pieces.'}</p>
          <button onClick={onBack} className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">{t('shopNow')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {viewedProducts.map(p => {
            const isInWishlist = wishlist.includes(p.id);
            return (
              <div key={p.id} className="group">
                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-gray-100 relative shadow-sm mb-6 cursor-pointer" onClick={() => onProductClick(p.id)}>
                  {/* Integrated Hover-to-Video Component */}
                  <ProductCardMedia 
                    imageUrl={p.images[0]} 
                    videoUrl={p.videoUrl}
                    alt={p.nameEn}
                  />
                  
                  {/* Wishlist Overlay */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                    className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg transition-all z-10 ${isInWishlist ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500'}`}
                  >
                    <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="px-1">
                  <h3 className="font-black text-lg mb-1 cursor-pointer hover:text-red-600 transition-colors" onClick={() => onProductClick(p.id)}>{isAr ? p.nameAr : p.nameEn}</h3>
                  <div className="flex justify-between items-center">
                    <p className="font-black text-red-600">{p.price} QAR</p>
                    <button 
                      onClick={() => addToCart({ product: p, quantity: 1, selectedSize: p.sizes[0], selectedColor: p.colors[0] })}
                      className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-red-600 transition-colors"
                    >
                      <ShoppingBag size={12} /> {t('addToCart')}
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
