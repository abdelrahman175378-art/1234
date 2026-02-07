import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from './AppContext'; // ✅ السحب من AppContext مباشرة
import { TRANSLATIONS, MENS_SUB_CATEGORIES_CONFIG, WOMENS_SUB_CATEGORIES_CONFIG } from './constants'; 
import { ShoppingBag, Heart, ArrowLeft, SlidersHorizontal, ChevronDown, CheckCircle2, AlertCircle, ImageIcon, Loader2 } from 'lucide-react';
import { SortOrder } from './types'; 
import ProductCardMedia from './ProductCardMedia'; 

const CategoryTile: React.FC<{ config: { key: string, img: string }, onClick: () => void }> = ({ config, onClick }) => {
  const labelAr = TRANSLATIONS[config.key]?.ar || config.key;
  const labelEn = TRANSLATIONS[config.key]?.en || config.key;
  
  return (
    <div onClick={onClick} className="group relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer border border-white/5">
      <img src={config.img} alt={config.key} className="w-full h-full object-cover opacity-50 transition-all duration-1000 group-hover:scale-110 group-hover:opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 pointer-events-none">
        <span className="text-[#FF0000] font-black text-sm mb-1 uppercase">{labelAr}</span>
        <h3 className="text-[#FF0000] font-[1000] text-2xl md:text-5xl uppercase tracking-tighter">{labelEn}</h3>
      </div>
    </div>
  );
};

const Shop: React.FC<{ initialCategory?: string, onProductClick: (id: string) => void, onBack?: () => void }> = ({ initialCategory = 'All', onProductClick, onBack }) => {
  // ✅ تم استخراج الوظائف من AppContext مباشرة
  const { language, products, wishlist, toggleWishlist, addToCart } = useApp();
  
  const [filter, setFilter] = useState(initialCategory);
  const [subFilter, setSubFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const isAr = language === 'ar';

  useEffect(() => { setFilter(initialCategory); setSubFilter('All'); }, [initialCategory]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => (filter === 'All' || p.category === filter) && (subFilter === 'All' || p.subCategory === subFilter));
    if (sortOrder === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortOrder === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, filter, subFilter, sortOrder]);

  const isWorldView = filter === 'Men' || filter === 'Women';
  const showCategoryGrid = isWorldView && subFilter === 'All';

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isWorldView ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <button onClick={onBack} className={`flex items-center gap-2 font-black text-[10px] uppercase ${isWorldView ? 'text-white/40' : 'text-gray-400'}`}><ArrowLeft size={14} /> BACK</button>
          <div className="flex bg-gray-100 p-1 rounded-full">
            {['All', 'Men', 'Women'].map(cat => (
              <button key={cat} onClick={() => { setFilter(cat); setSubFilter('All'); }} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase ${filter === cat ? 'bg-black text-white' : 'text-gray-400'}`}>{cat}</button>
            ))}
          </div>
        </div>

        {showCategoryGrid ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {(filter === 'Men' ? MENS_SUB_CATEGORIES_CONFIG : WOMENS_SUB_CATEGORIES_CONFIG).map(config => (
              <CategoryTile key={config.key} config={config} onClick={() => setSubFilter(config.key)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {filteredAndSortedProducts.map(p => (
              <div key={p.id} className="group">
                <div className="aspect-[3/4] overflow-hidden rounded-[2rem] bg-zinc-900 relative cursor-pointer" onClick={() => onProductClick(p.id)}>
                  <ProductCardMedia imageUrl={p.images[0]} videoUrl={p.videoUrl} alt={p.nameEn} />
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                    className={`absolute top-4 right-4 p-3 rounded-full ${wishlist.includes(p.id) ? 'bg-red-600 text-white' : 'bg-white/80 text-gray-400'}`}
                  >
                    <Heart size={16} fill={wishlist.includes(p.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="mt-4">
                  <h3 className={`font-black uppercase ${isWorldView ? 'text-white' : 'text-black'}`}>{isAr ? p.nameAr : p.nameEn}</h3>
                  <p className="text-red-600 font-bold">{p.price} QAR</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
