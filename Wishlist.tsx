import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Heart, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';
import ProductCardMedia from '../components/ProductCardMedia';

interface WishlistProps {
  onProductClick: (id: string) => void;
  onBack: () => void;
}

const Wishlist: React.FC<WishlistProps> = ({ onProductClick, onBack }) => {
  const { language, products, wishlist, toggleWishlist, addToCart } = useApp();
  const isAr = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  // تصفية المنتجات المفضلة
  const favoriteProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:py-12 animate-in fade-in duration-700 overflow-x-hidden text-start">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-400 hover:text-black mb-8 md:mb-12 uppercase tracking-widest transition-colors"
      >
        <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} /> {isAr ? 'العودة' : 'Back'}
      </button>

      <div className="mb-8 md:mb-12 text-start">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 uppercase">{isAr ? 'قائمة الأمنيات' : 'My Wishlist'}</h1>
        <p className="text-gray-400 font-black uppercase tracking-[0.2em] md:tracking-widest text-[9px] md:text-xs">
          {favoriteProducts.length} {isAr ? 'قطع مفضلة في الأرشيف' : 'Saved items in your archive'}
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="text-center py-20 md:py-40 bg-gray-50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Heart className="text-gray-200" size={32} />
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-2 uppercase">{isAr ? 'قائمة مفضلاتك فارغة' : 'Your wishlist is empty'}</h2>
          <p className="text-gray-400 text-xs md:text-sm mb-8 px-6">{isAr ? 'ابدأ في إضافة بعض القطع التي تعجبك إلى أرشيفك الشخصي!' : 'Start adding some pieces you love to your personal archive!'}</p>
          <button 
            onClick={onBack} 
            className="bg-black text-white px-8 md:px-10 py-4 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl active:scale-95 transition-transform"
          >
            {t('shopNow')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {favoriteProducts.map(p => {
            const colorKeys = Object.keys(p.variants);
            if (colorKeys.length === 0) return null; 
            
            const firstColor = colorKeys[0];
            const variant = p.variants[firstColor];

            return (
              <div key={p.id} className="group flex flex-col">
                <div className="aspect-[3/4] rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-gray-100 relative shadow-sm mb-4 md:mb-6">
                  <div onClick={() => onProductClick(p.id)} className="w-full h-full cursor-pointer">
                    <ProductCardMedia 
                      imageUrl={variant.images[0]} 
                      videoUrl={variant.videoUrl}
                      alt={isAr ? variant.nameAr : variant.nameEn}
                    />
                  </div>

                  {/* Remove Button - Responsive size */}
                  <button 
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-3 right-3 md:top-4 md:right-4 bg-white/90 backdrop-blur-md p-2 md:p-3 rounded-full text-red-600 shadow-lg hover:scale-110 active:scale-90 transition-all z-10"
                  >
                    <Trash2 size={16} className="md:w-5 md:h-5" />
                  </button>
                </div>

                <div className="px-1 text-start">
                  <h3 
                    className="font-black text-sm md:text-lg mb-1 cursor-pointer hover:text-red-600 transition-colors truncate uppercase leading-tight" 
                    onClick={() => onProductClick(p.id)}
                  >
                    {isAr ? variant.nameAr : variant.nameEn}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="font-black text-black text-sm md:text-base">
                      {variant.price} <span className="text-[10px] opacity-30 uppercase font-black">QAR</span>
                    </p>
                    <button 
                      onClick={() => addToCart({ 
                        product: p, 
                        variant: variant, 
                        quantity: 1, 
                        selectedSize: variant.sizes[0], 
                        selectedColor: firstColor 
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

export default Wishlist;