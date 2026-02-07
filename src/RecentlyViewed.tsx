import React from 'react';
import { useApp } from './AppContext'; // ✅ تم التصحيح من ../ إلى ./
import { TRANSLATIONS } from './constants'; // ✅ تم التصحيح
import { History, ArrowLeft, ShoppingBag, Heart } from 'lucide-react';
import ProductCardMedia from './ProductCardMedia'; // ✅ تم التصحيح

const RecentlyViewed: React.FC<{ onProductClick: (id: string) => void, onBack: () => void }> = ({ onProductClick, onBack }) => {
  const { language, products, recentlyViewed, addToCart, wishlist, toggleWishlist } = useApp();
  const isAr = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  const viewedProducts = recentlyViewed.map(id => products.find(p => p.id === id)).filter(Boolean) as any[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-12 uppercase tracking-widest"><ArrowLeft size={16} /> {isAr ? 'العودة' : 'Back'}</button>
      <h1 className="text-5xl font-black mb-8">{isAr ? 'شوهد مؤخراً' : 'Recently Viewed'}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {viewedProducts.map(p => (
          <div key={p.id} className="group cursor-pointer" onClick={() => onProductClick(p.id)}>
            <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-gray-100 relative shadow-sm mb-6">
              <ProductCardMedia imageUrl={p.images[0]} videoUrl={p.videoUrl} alt={p.nameEn} />
            </div>
            <h3 className="font-black text-lg">{isAr ? p.nameAr : p.nameEn}</h3>
            <p className="font-black text-red-600">{p.price} QAR</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RecentlyViewed;
