import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../AppContext';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { TRANSLATIONS, MENS_SUB_CATEGORIES_CONFIG, WOMENS_SUB_CATEGORIES_CONFIG } from '../constants';
import { ShoppingBag, Heart, ArrowLeft, SlidersHorizontal, ChevronDown, CheckCircle2, AlertCircle, ImageIcon, Loader2 } from 'lucide-react';
import { SortOrder } from '../types';
import ProductCardMedia from '../components/ProductCardMedia';

interface ShopProps {
  initialCategory?: string;
  onProductClick: (id: string) => void;
  onBack?: () => void;
}

const CategoryTile: React.FC<{ config: { key: string, img: string }, onClick: () => void }> = ({ config, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  
  // Safe translation access with fallbacks to prevent crashes
  const labelAr = TRANSLATIONS[config.key]?.ar || config.key;
  const labelEn = TRANSLATIONS[config.key]?.en || config.key;
  
  return (
    <div 
      onClick={onClick}
      className="group relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer border border-white/5"
    >
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
        {!imgLoaded && !imgError && (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <Loader2 className="animate-spin text-white" size={24} />
          </div>
        )}
        {!imgError ? (
          <img 
            src={config.img} 
            alt={config.key} 
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${imgLoaded ? 'opacity-50 group-hover:opacity-70' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800">
            <ImageIcon className="text-white/5 mb-2" size={48} />
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 pointer-events-none">
        <span className="text-[#FF0000] font-black text-sm md:text-base mb-1 tracking-[0.2em] drop-shadow-[0_2px_10px_rgba(0,0,0,1)] uppercase">
          {labelAr}
        </span>
        <h3 className="text-[#FF0000] font-[1000] text-2xl md:text-3xl lg:text-5xl uppercase tracking-tighter leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">
          {labelEn}
        </h3>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF0000] to-transparent translate-y-1 group-hover:translate-y-0 transition-transform duration-500" />
    </div>
  );
};

const Shop: React.FC<ShopProps> = ({ initialCategory = 'All', onProductClick, onBack }) => {
  const { language, products } = useApp();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [filter, setFilter] = useState(initialCategory);
  const [subFilter, setSubFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);

  const isAr = language === 'ar';
  
  useEffect(() => {
    setFilter(initialCategory);
    setSubFilter('All');
  }, [initialCategory]);

  const categories = ['All', 'Men', 'Women'];
  const allSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesCategory = filter === 'All' || p.category === filter;
      const matchesSubCategory = subFilter === 'All' || p.subCategory === subFilter;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesSize = selectedSize === 'All' || p.sizes.includes(selectedSize);
      return matchesCategory && matchesSubCategory && matchesPrice && matchesSize;
    });

    if (sortOrder === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortOrder === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortOrder === 'newest') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [products, filter, subFilter, sortOrder, priceRange, selectedSize]);

  const isWorldView = filter === 'Men' || filter === 'Women';
  const showCategoryGrid = isWorldView && subFilter === 'All';

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isWorldView ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
          <div className="flex flex-col">
             <button 
                onClick={onBack}
                className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest mb-3 transition-all hover:gap-4 ${isWorldView ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-black'}`}
              >
                <ArrowLeft size={14} /> BACK TO HOME
              </button>
              <h1 className={`text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none ${isWorldView ? 'text-white' : 'text-black'}`}>
                {filter === 'Men' ? "MEN'S WORLD" : (filter === 'Women' ? "WOMEN'S WORLD" : "COLLECTION")}
              </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-full overflow-hidden shadow-inner">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setFilter(cat); setSubFilter('All'); }}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === cat ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 border rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest transition-all ${isWorldView ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800' : 'bg-white border-gray-200 text-black hover:bg-gray-50'}`}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={`p-8 rounded-[3rem] border mb-12 grid grid-cols-1 md:grid-cols-3 gap-12 animate-in slide-in-from-top-4 duration-300 relative z-10 ${isWorldView ? 'bg-zinc-900/50 backdrop-blur-xl border-zinc-800 text-white' : 'bg-gray-50 border-gray-100 text-black'}`}>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">Sort Order</label>
              <div className="relative">
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className={`w-full border-none p-4 rounded-xl font-bold text-sm appearance-none shadow-sm ${isWorldView ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">Price: {priceRange[1]} QAR</label>
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="50"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full accent-red-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">Quick Sizes</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedSize('All')} className={`px-4 py-2.5 rounded-lg text-[9px] font-black border transition-all ${selectedSize === 'All' ? 'bg-red-600 text-white border-red-600 shadow-lg' : (isWorldView ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200')}`}>ALL</button>
                {allSizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2.5 rounded-lg text-[9px] font-black border transition-all ${selectedSize === s ? 'bg-red-600 text-white border-red-600 shadow-lg' : (isWorldView ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200')}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showCategoryGrid ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 animate-in fade-in duration-1000 border border-white/5 bg-zinc-900/10">
            {filter === 'Men' 
              ? MENS_SUB_CATEGORIES_CONFIG.map(config => <CategoryTile key={config.key} config={config} onClick={() => setSubFilter(config.key)} />)
              : WOMENS_SUB_CATEGORIES_CONFIG.map(config => <CategoryTile key={config.key} config={config} onClick={() => setSubFilter(config.key)} />)
            }
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16 animate-in fade-in duration-500">
            {filteredAndSortedProducts.length === 0 ? (
              <div className={`col-span-full text-center py-40 border-2 border-dashed rounded-[4rem] ${isWorldView ? 'border-zinc-800' : 'border-gray-100'}`}>
                <ShoppingBag className="mx-auto opacity-10 mb-8" size={80} />
                <h2 className={`text-2xl font-black ${isWorldView ? 'text-white' : 'text-black'}`}>ITEM NOT FOUND</h2>
                <button onClick={() => { setFilter('All'); setSubFilter('All'); }} className="mt-4 text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline">Reset Catalog</button>
              </div>
            ) : (
              filteredAndSortedProducts.map((p) => {
                const hasDiscount = p.originalPrice && p.originalPrice > p.price;
                const discountPercent = hasDiscount ? Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100) : 0;
                
                return (
                  <div key={p.id} className="group relative">
                    <div 
                      onClick={() => onProductClick(p.id)}
                      className="aspect-[3/4] overflow-hidden rounded-[3rem] bg-zinc-900 relative shadow-2xl cursor-pointer transition-all duration-700 hover:shadow-red-900/10"
                    >
                      <ProductCardMedia 
                        imageUrl={p.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'} 
                        videoUrl={p.videoUrl}
                        alt={p.nameEn}
                      />
                      
                      <div className="absolute top-8 left-8 flex flex-col gap-2 z-10 pointer-events-none">
                         {hasDiscount && (
                           <div className="bg-red-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-2xl border border-white/20 animate-pulse">
                             -{discountPercent}% OFF
                           </div>
                         )}
                         {p.stock <= 0 ? (
                           <div className="bg-black/80 backdrop-blur-md text-white text-[9px] font-black uppercase px-4 py-2 rounded-full border border-white/10">Sold Out</div>
                         ) : p.stock < 5 ? (
                           <div className="bg-orange-600 text-white text-[9px] font-black uppercase px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl">
                             <AlertCircle size={10} /> {p.stock} Left
                           </div>
                         ) : (
                           <div className="bg-green-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                             <CheckCircle2 size={10} /> {isAr ? 'متوفر' : 'In Stock'}
                           </div>
                         )}
                      </div>

                      <div className="absolute bottom-8 left-8 right-8 flex gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({ product: p, quantity: 1, selectedSize: p.sizes[0], selectedColor: p.colors[0] });
                          }}
                          className="flex-[3] bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl transition-all flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white"
                        >
                          <ShoppingBag size={14} /> Add
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(p.id);
                          }}
                          className={`flex-1 py-4 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${isInWishlist(p.id) ? 'bg-red-600 text-white' : 'bg-black/50 backdrop-blur-md text-white hover:bg-red-600'}`}
                        >
                          <Heart size={16} fill={isInWishlist(p.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-8 px-2">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col min-w-0">
                          <h3 className={`font-black text-lg uppercase tracking-tight truncate transition-colors ${isWorldView ? 'text-white group-hover:text-red-600' : 'text-black group-hover:text-red-600'}`}>
                            {isAr ? p.nameAr : p.nameEn}
                          </h3>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Collection '{p.category}'</p>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className={`text-lg font-black shrink-0 ${isWorldView ? 'text-white' : 'text-black'}`}>
                            {p.price} <span className="text-[10px] opacity-40">QAR</span>
                          </div>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through font-bold">{p.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
