import React from 'react';
import { useApp } from './AppContext'; // ✅ تم التصحيح
import { TRANSLATIONS } from './constants'; // ✅ تم التصحيح
import { Heart, ArrowLeft, ShoppingBag, Trash2, Sparkles } from 'lucide-react';
import ProductCardMedia from './ProductCardMedia'; // ✅ تم التصحيح

const Wishlist: React.FC<{ onProductClick: (id: string) => void, onBack: () => void }> = ({ onProductClick, onBack }) => {
  const { language, products, wishlist, toggleWishlist, addToCart } = useApp();
  const isAr = language === 'ar';
  const favoriteProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-12 uppercase tracking-widest"><ArrowLeft size={16} /> {isAr ? 'العودة' : 'Back'}</button>
      <h1 className="text-5xl font-black mb-8">{isAr ? 'قائمة الأمنيات' : 'My Wishlist'}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {favoriteProducts.map(p => (
          <div key={p.id} className="group relative">
            <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-gray-100 mb-6 cursor-pointer" onClick={() => onProductClick(p.id)}>
              <ProductCardMedia imageUrl={p.images[0]} videoUrl={p.videoUrl} alt={p.nameEn} />
            </div>
            <button onClick={() => toggleWishlist(p.id)} className="absolute top-4 right-4 bg-white p-3 rounded-full text-red-500 shadow-xl"><Trash2 size={18}/></button>
            <h3 className="font-black text-lg">{isAr ? p.nameAr : p.nameEn}</h3>
            <p className="font-black text-red-600">{p.price} QAR</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Wishlist;
