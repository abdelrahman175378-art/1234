import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../AppContext';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { TRANSLATIONS, MENS_SUB_CATEGORIES_CONFIG, WOMENS_SUB_CATEGORIES_CONFIG, COLOR_MAP } from '../constants';
import {
  ShoppingBag as ShoppingBagIcon, Heart, ArrowLeft, SlidersHorizontal, ChevronDown,
  CheckCircle2, AlertCircle, Search as SearchIcon, Loader2, Sparkles, X, Palette
} from 'lucide-react';
import { SortOrder, Product } from '../types';
import ProductCardMedia from '../components/ProductCardMedia';

/**
 * CategoryTile: A high-fidelity interactive 3D tile for the archival dashboard.
 */
const CategoryTile: React.FC<{ config: { key: string, img: string }, onClick: () => void }> = ({ config, onClick }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // تعطيل تأثير الإمالة على الشاشات الصغيرة
    if (window.innerWidth < 768) return;
    
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -15;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 15;
    setRotate({ x: rotateX, y: rotateY });
  };

  const labelAr = TRANSLATIONS[config.key]?.ar || config.key;
  const labelEn = TRANSLATIONS[config.key]?.en || config.key;

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      className="group relative aspect-square bg-zinc-950 overflow-visible cursor-pointer perspective-[1500px]"
    >
      <div
        className="w-full h-full transition-transform duration-200 ease-out preserve-3d"
        style={{ transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` }}
      >
        <div className="absolute inset-0 bg-zinc-900 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
          <img
            src={config.img}
            alt={config.key}
            className="w-full h-full object-cover opacity-40 transition-all duration-700 md:group-hover:scale-110 md:group-hover:opacity-60 blur-[1px] md:blur-[2px] md:group-hover:blur-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-6 z-10 pointer-events-none"
          style={{ transform: window.innerWidth >= 768 ? 'translateZ(100px)' : 'none' }}
        >
          <span className="text-red-600 font-black text-[8px] md:text-xs mb-1 md:mb-2 tracking-[0.2em] md:tracking-[0.4em] uppercase drop-shadow-[0_10px_20px_rgba(220,38,38,0.5)]">
            {labelAr}
          </span>
          <h3 className="text-white font-[1000] text-xl md:text-5xl uppercase tracking-tighter leading-none drop-shadow-[0_20px_40px_rgba(0,0,0,1)]">
            {labelEn}
          </h3>
          <div className="mt-4 md:mt-6 flex items-center gap-2 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 translate-y-4 md:group-hover:translate-y-0">
            <div className="h-px w-6 md:w-8 bg-red-600" />
            <Sparkles size={12} className="text-red-600" />
            <div className="h-px w-6 md:w-8 bg-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ShopProps {
  initialCategory?: string;
  initialSubCategory?: string; 
  onProductClick: (id: string) => void;
  onBack: () => void;
}

const Shop: React.FC<ShopProps> = ({ initialCategory = 'All', initialSubCategory, onProductClick, onBack }) => {
  const { language, products } = useApp();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [filter, setFilter] = useState(initialCategory);
  const [subFilter, setSubFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const isAr = language === 'ar';

  useEffect(() => {
    setFilter(initialCategory);
    if (initialSubCategory) {
        setSubFilter(initialSubCategory);
        setSearchQuery(''); 
    } else {
        setSubFilter('All');
    }
  }, [initialCategory, initialSubCategory]);

  const categories = ['All', 'Men', 'Women'];
  const allSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const allColors = Object.keys(COLOR_MAP);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let result = products.filter(p => {
      if (!p.variants) return false;
      const variantList = Object.values(p.variants);
      if (variantList.length === 0) return false;

      const matchesCategory = filter === 'All' || variantList.some(v => v?.category === filter);
      const matchesSubCategory = subFilter === 'All' || variantList.some(v => v?.subCategory === subFilter);
      
      const validPrices = variantList.map(v => v?.price).filter(price => typeof price === 'number');
      const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
      const matchesPrice = minPrice >= priceRange[0] && minPrice <= priceRange[1];

      const matchesSize = selectedSize === 'All' || variantList.some(v => v?.sizes?.includes(selectedSize));
      const matchesColor = selectedColor === 'All' || Object.keys(p.variants).includes(selectedColor);

      const q = searchQuery.toLowerCase().trim();
      let matchesSearch = true;
      if (q) {
        const tokens = q.split(/\s+/).filter(t => t.length > 1);
        matchesSearch = variantList.some(v => {
            const nameEn = (v?.nameEn || "").toLowerCase();
            const nameAr = (v?.nameAr || "").toLowerCase();
            return tokens.every(token => nameEn.includes(token) || nameAr.includes(token));
        });
      }

      return matchesCategory && matchesSubCategory && matchesPrice && matchesSize && matchesColor && matchesSearch;
    });

    if (sortOrder === 'price-asc') {
        result.sort((a, b) => (Object.values(a.variants || {})[0]?.price ?? 0) - (Object.values(b.variants || {})[0]?.price ?? 0));
    } else if (sortOrder === 'price-desc') {
        result.sort((a, b) => (Object.values(b.variants || {})[0]?.price ?? 0) - (Object.values(a.variants || {})[0]?.price ?? 0));
    } else if (sortOrder === 'newest') {
        result.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
    }

    return result;
  }, [products, filter, subFilter, sortOrder, priceRange, selectedSize, selectedColor, searchQuery]);

  const isWorldView = (filter === 'Men' || filter === 'Women') && !searchQuery;
  const showCategoryGrid = isWorldView && subFilter === 'All';

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isWorldView ? 'bg-black' : 'bg-white'} overflow-x-hidden`}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
        
        {/* Archival Dashboard Header */}
        <div className="flex flex-col gap-6 md:gap-10 mb-8 md:mb-12 relative z-10 pt-16 md:pt-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col text-start">
              <button
                onClick={onBack}
                className={`flex items-center gap-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-2 md:mb-3 transition-all hover:gap-4 ${isWorldView ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-black'}`}
              >
                <ArrowLeft size={12} className="md:w-3.5 md:h-3.5" /> BACK TO HOME
              </button>
              <h1 className={`text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none ${isWorldView ? 'text-white' : 'text-black'}`}>
                {subFilter !== 'All' ? (TRANSLATIONS[subFilter]?.en || subFilter) : (filter === 'Men' ? "MEN'S WORLD" : (filter === 'Women' ? "WOMEN'S WORLD" : "COLLECTION"))}
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="flex bg-gray-100 p-1 rounded-full overflow-hidden shadow-inner w-full sm:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setFilter(cat); setSubFilter('All'); setSearchQuery(''); }}
                    className={`flex-1 px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border rounded-xl shadow-sm text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${isWorldView ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800' : 'bg-white border-gray-200 text-black hover:bg-gray-50'}`}
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
            </div>
          </div>

          {/* Neural Archive Search Input */}
          <div className="relative group w-full md:max-w-2xl">
            <SearchIcon className={`absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 transition-colors ${isWorldView ? 'text-zinc-600' : 'text-gray-300'}`} size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث في الأرشيف عن قطع محددة..." : "Search the archive for specific pieces..."}
              className={`w-full py-4 md:py-6 ltr:pl-12 rtl:pr-12 ltr:pr-12 rtl:pl-12 rounded-2xl md:rounded-[2rem] text-xs md:text-sm font-bold border-none transition-all ${isWorldView
                  ? 'bg-zinc-900 text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-red-600'
                  : 'bg-gray-50 text-black placeholder:text-gray-300 focus:ring-2 focus:ring-black'
                }`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute ltr:right-5 rtl:left-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filtration Panel */}
        {showFilters && (
          <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border mb-8 md:mb-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 animate-in slide-in-from-top-4 duration-300 relative z-10 ${isWorldView ? 'bg-zinc-900/50 backdrop-blur-xl border-zinc-800 text-white' : 'bg-gray-50 border-gray-100 text-black'}`}>
            <div className="space-y-4">
              <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-50">Sort Order</label>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className={`w-full border-none p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm appearance-none shadow-sm ${isWorldView ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 opacity-40" />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-50">Price Matrix: {priceRange[1]} QAR</label>
              <input
                type="range" min="0" max="5000" step="50"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full accent-red-600"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-50">Physical Dimensions</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedSize('All')} className={`px-3 py-2 rounded-lg text-[8px] md:text-[9px] font-black border transition-all ${selectedSize === 'All' ? 'bg-red-600 text-white border-red-600 shadow-lg' : (isWorldView ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200')}`}>ALL</button>
                {allSizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={`px-3 py-2 rounded-lg text-[8px] md:text-[9px] font-black border transition-all ${selectedSize === s ? 'bg-red-600 text-white border-red-600 shadow-lg' : (isWorldView ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200')}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-50">Archival Colors</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedColor('All')} className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedColor === 'All' ? 'border-red-600 scale-110' : (isWorldView ? 'border-zinc-700' : 'border-gray-200')}`} title="All Colors">
                  <Palette size={12} className="md:w-3.5 md:h-3.5" />
                </button>
                {allColors.slice(0, 10).map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-all ${selectedColor === c ? 'border-red-600 scale-110 shadow-lg ring-2 ring-white/20' : 'border-transparent'}`}
                    style={{ backgroundColor: COLOR_MAP[c] }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Primary Archival View Switcher */}
        {showCategoryGrid ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 p-4 animate-in fade-in duration-1000 bg-zinc-950/50 rounded-3xl md:rounded-[4rem] border border-white/5">
            {filter === 'Men'
              ? MENS_SUB_CATEGORIES_CONFIG.map(config => <CategoryTile key={config.key} config={config} onClick={() => setSubFilter(config.key)} />)
              : WOMENS_SUB_CATEGORIES_CONFIG.map(config => <CategoryTile key={config.key} config={config} onClick={() => setSubFilter(config.key)} />)
            }
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16 animate-in fade-in duration-500">
            {/* Contextual Header for Deep Navigation */}
            {subFilter !== 'All' && (
              <div className="col-span-full flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <button 
                    onClick={() => setSubFilter('All')} 
                    className="p-2 md:p-3 bg-zinc-900 rounded-full text-white hover:bg-red-600 transition-all shadow-2xl"
                >
                    <ArrowLeft size={16} className="md:w-5 md:h-5" />
                </button>
                <div className="text-start">
                  <p className="text-red-600 font-black text-[7px] md:text-[9px] uppercase tracking-widest leading-none mb-0.5 md:mb-1">ARCHIVAL LAYER SECTION</p>
                  <h2 className={`text-xl md:text-3xl font-black uppercase tracking-tighter leading-none ${isWorldView ? 'text-white' : 'text-black'}`}>
                      {isAr ? (TRANSLATIONS[subFilter]?.ar || subFilter) : (TRANSLATIONS[subFilter]?.en || subFilter)}
                  </h2>
                </div>
              </div>
            )}

            {filteredAndSortedProducts.length === 0 ? (
              <div className={`col-span-full text-center py-24 md:py-40 border-2 border-dashed rounded-[2rem] md:rounded-[4rem] ${isWorldView ? 'border-zinc-800' : 'border-gray-100'}`}>
                <ShoppingBagIcon className="mx-auto opacity-10 mb-6 md:mb-8 md:w-20 md:h-20" size={60} />
                <h2 className={`text-xl md:text-2xl font-black px-4 ${isWorldView ? 'text-white' : 'text-black'}`}>ITEM NOT FOUND IN THIS LAYER</h2>
                <button onClick={() => { setFilter('All'); setSubFilter('All'); setSearchQuery(''); setSelectedColor('All'); setSelectedSize('All'); }} className="mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline">Reset Archival Search</button>
              </div>
            ) : (
              filteredAndSortedProducts.map((p) => {
                const variantKeys = Object.keys(p.variants || {});
                if (variantKeys.length === 0) return null;

                const firstColor = variantKeys[0];
                const v = p.variants[firstColor];
                if (!v) return null;
                
                const hasDiscount = (v.originalPrice ?? 0) > (v.price ?? 0);
                const discountPercent = hasDiscount ? Math.round((((v.originalPrice ?? 0) - (v.price ?? 0)) / (v.originalPrice ?? 1)) * 100) : 0;

                return (
                  <div key={p.id} className="group relative">
                    <div
                      onClick={() => onProductClick(p.id)}
                      className="aspect-[3/4] overflow-visible rounded-2xl md:rounded-[3rem] bg-zinc-900 relative cursor-pointer shadow-2xl transition-transform duration-500 md:hover:scale-[1.02]"
                    >
                      <ProductCardMedia
                        imageUrl={v.images?.[0] || 'https://via.placeholder.com/800'}
                        videoUrl={v.videoUrl}
                        alt={v.nameEn || "Archival Entry"}
                      />

                      {/* Tactical Badges - ضبط الأحجام للموبايل */}
                      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col gap-1.5 md:gap-2 z-10 pointer-events-none">
                        {hasDiscount && (
                          <div className="bg-red-600 text-white text-[7px] md:text-[10px] font-black uppercase px-2 md:px-4 py-1 md:py-2 rounded-full shadow-2xl border border-white/20 animate-pulse">
                            -{discountPercent}% OFF
                          </div>
                        )}
                        {(v.stock ?? 0) <= 0 ? (
                          <div className="bg-black/80 backdrop-blur-md text-white text-[6px] md:text-[9px] font-black uppercase px-2 md:px-4 py-1 md:py-2 rounded-full border border-white/10">Sold Out</div>
                        ) : (v.stock ?? 0) < 5 ? (
                          <div className="bg-orange-600 text-white text-[6px] md:text-[9px] font-black uppercase px-2 md:px-4 py-1 md:py-2 rounded-full flex items-center gap-1 md:gap-2 shadow-2xl">
                            <AlertCircle size={8} className="md:w-2.5 md:h-2.5" /> {v.stock} LEFT
                          </div>
                        ) : (
                          <div className="bg-green-600/90 backdrop-blur-md text-white text-[6px] md:text-[9px] font-black uppercase px-2 md:px-4 py-1 md:py-2 rounded-full flex items-center gap-1 md:gap-2 border border-white/10 shadow-lg">
                            <CheckCircle2 size={8} className="md:w-2.5 md:h-2.5" /> {isAr ? 'متوفر' : 'IN STOCK'}
                          </div>
                        )}
                      </div>

                      {/* Color Matrix Preview - تظهر دائماً بشفافية بسيطة على الموبايل */}
                      <div className="absolute bottom-16 md:bottom-24 left-4 md:left-8 flex gap-1 z-10 opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                         {variantKeys.slice(0, 5).map(ck => (
                             <div key={ck} className="w-2 h-2 md:w-3 md:h-3 rounded-full border border-white/50 shadow-sm" style={{backgroundColor: COLOR_MAP[ck]}} />
                         ))}
                      </div>

                      {/* Action Buttons - تحسين التجاوب للموبايل */}
                      <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 flex gap-1.5 md:gap-2 md:translate-y-12 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({ 
                                product: p, 
                                variant: v,
                                quantity: 1, 
                                selectedSize: v.sizes?.[0] || 'M',
                                selectedColor: firstColor
                            });
                          }}
                          className="flex-[3] bg-white text-black py-2.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase shadow-2xl transition-all flex items-center justify-center gap-1.5 md:gap-2 hover:bg-red-600 hover:text-white"
                        >
                          <ShoppingBagIcon size={12} className="md:w-3.5 md:h-3.5" /> ADD
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(p.id);
                          }}
                          className={`flex-1 py-2.5 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl transition-all ${isInWishlist(p.id) ? 'bg-red-600 text-white' : 'bg-black/50 backdrop-blur-md text-white hover:bg-red-600'}`}
                        >
                          <Heart size={14} className="md:w-4 md:h-4" fill={isInWishlist(p.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-8 px-1 md:px-2 text-start">
                      <div className="flex justify-between items-start gap-2 md:gap-4">
                        <div className="flex flex-col min-w-0">
                          <h3 className={`font-black text-sm md:text-lg uppercase tracking-tight truncate transition-colors ${isWorldView ? 'text-white md:group-hover:text-red-600' : 'text-black md:group-hover:text-red-600'}`}>
                            {isAr ? (v.nameAr || "غير مسمى") : (v.nameEn || "Unnamed Entry")}
                          </h3>
                          <p className="text-[7px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5 md:mt-1 truncate">{(v.category || "General").toUpperCase()} ARCHIVE</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`text-sm md:text-lg font-black shrink-0 ${isWorldView ? 'text-white' : 'text-black'}`}>
                            {v.price ?? 0} <span className="text-[7px] md:text-[10px] opacity-40 font-black">QAR</span>
                          </div>
                          {hasDiscount && (
                            <span className="text-[9px] md:text-xs text-gray-400 line-through font-bold">{v.originalPrice}</span>
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