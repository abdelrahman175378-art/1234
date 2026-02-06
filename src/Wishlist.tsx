import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Heart, ArrowLeft, ShoppingBag, Trash2, Sparkles } from 'lucide-react';
import { Product } from '../types';
import ProductCardMedia from '../components/ProductCardMedia';

interface WishlistProps {
  onProductClick: (id: string) => void;
  onBack: () => void;
  onTryOn?: (product: Product) => void;
}

const Wishlist: React.FC<WishlistProps> = ({ onProductClick, onBack, onTryOn }) => {
  const { language, products, wishlist, toggleWishlist, addToCart } = useApp();
  const isAr = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  const favoriteProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black mb-12 uppercase tracking-widest transition-colors">
        <ArrowLeft size={16} /> {isAr ? 'العودة' : 'Back'}
      </button>

      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-2">{isAr ? 'قائمة الأمنيات' : 'My Wishlist'}</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
          {favoriteProducts.length} {isAr ? 'قطع مفضلة' : 'Saved items'}
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="text-center py-40 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Heart className="text-gray-200" size={32} />
          </div>
          <h2 className="text-2xl font-black mb-2">{isAr ? 'قائمة مفضلاتك فارغة' : 'Your wishlist is empty'}</h2>
          <p className="text-gray-400 mb-8">{isAr ? 'ابدأ في إضافة بعض القطع التي تعجبك!' : 'Start adding some pieces you love!'}</p>
          <button onClick={onBack} className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">{t('shopNow')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {favoriteProducts.map(p => (
            <div key={p.id} className="group">
              <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-gray-100 relative shadow-sm mb-6">
                {/* Integrated Hover-to-Video Component */}
                <div onClick={() => onProductClick(p.id)} className="w-full h-full cursor-pointer">
                  <ProductCardMedia 
                    imageUrl={p.images[0]} 
                    videoUrl={p.videoUrl}
                    alt={p.nameEn}
                  />
                </div>
                
                {/* Try On Button Overlay */}
                <button 
                  onClick={() => onTryOn?.(p)}
                  className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl text-purple-600 shadow-lg hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
                >
                  <Sparkles size={14} /> {isAr ? 'قياس ذكي' : 'Try it on'}
                </button>

                <button 
                  onClick={() => toggleWishlist(p.id)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-full text-red-500 shadow-lg hover:scale-110 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="px-1">
                <h3 className="font-black text-lg mb-1 cursor-pointer" onClick={() => onProductClick(p.id)}>{isAr ? p.nameAr : p.nameEn}</h3>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
