import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { Product } from '../types';
import ProductCardMedia from './ProductCardMedia';
import { Sparkles, ArrowRight, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { ASSETS } from '../constants';

interface RecommendationBarProps {
  title: string;
  items: Product[];
  language: 'en' | 'ar';
  onProductClick: (id: string) => void;
  isLoading?: boolean; 
}

const RecommendationBar: React.FC<RecommendationBarProps> = ({ 
  title, 
  items, 
  language, 
  onProductClick,
  isLoading = false 
}) => {
  const isAr = language === 'ar';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      requestAnimationFrame(() => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current!;
        const absScrollLeft = Math.abs(scrollLeft);
        setShowLeftArrow(absScrollLeft > 10);
        setShowRightArrow(absScrollLeft < scrollWidth - clientWidth - 10);
      });
    }
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [handleScroll, items]);

  const handleMouseEnter = (imageUrl: string) => {
    const img = new Image();
    img.src = imageUrl;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 300 : 400;
      const multiplier = isAr ? -1 : 1;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount * multiplier : -scrollAmount * multiplier,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 md:py-16 space-y-6 md:space-y-10 px-4 md:px-6 animate-pulse">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="h-8 md:h-12 w-1.5 md:w-2 bg-gray-200 rounded-full" />
          <div className="h-6 md:h-8 w-48 md:w-64 bg-gray-200 rounded-lg" />
        </div>
        <div className="flex gap-4 md:gap-10 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[220px] md:min-w-[300px] aspect-[3/4] bg-gray-100 rounded-3xl md:rounded-[4rem]" />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  const filteredItems = items
    .filter(p => p?.variants && Object.keys(p.variants).length > 0)
    .slice(0, 12);

  if (filteredItems.length === 0) return null;

  return (
    <section className="group/section space-y-6 md:space-y-10 py-8 md:py-16 overflow-hidden text-start animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
      
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="h-8 md:h-12 w-1.5 md:w-2 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] md:shadow-[0_0_25px_rgba(220,38,38,0.6)]" />
          <div className="space-y-0.5 md:space-y-1">
             <h3 className="text-sm md:text-[16px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-black">
               {title}
             </h3>
             <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-300">
                {isAr ? 'بيانات الأرشيف المحدثة' : 'VERIFIED ARCHIVE LOGS'}
             </p>
          </div>
        </div>
        
        {/* Scroll Arrows - Hidden on Mobile, using swipe instead */}
        <div className="hidden md:flex gap-4">
           <button 
             aria-label="Previous"
             onClick={() => scroll('left')}
             className={`p-4 rounded-2xl border transition-all duration-500 ${showLeftArrow ? 'bg-black text-white border-black shadow-2xl' : 'opacity-0 pointer-events-none'}`}
           >
              {isAr ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
           </button>
           <button 
             aria-label="Next"
             onClick={() => scroll('right')}
             className={`p-4 rounded-2xl border transition-all duration-500 ${showRightArrow ? 'bg-black text-white border-black shadow-2xl' : 'opacity-0 pointer-events-none'}`}
           >
              {isAr ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
           </button>
        </div>
      </div>

      {/* Items Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-4 md:gap-10 pb-8 md:pb-12 no-scrollbar px-4 md:px-6 scroll-smooth snap-x snap-mandatory"
      >
        {filteredItems.map((p) => {
          const v = Object.values(p.variants)[0];
          if (!v) return null;

          return (
            <div 
              key={p.id}
              role="button"
              tabIndex={0}
              className="min-w-[220px] md:min-w-[340px] group cursor-pointer snap-start outline-none" 
              onClick={() => onProductClick(p.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onProductClick(p.id);
                }
              }}
              onMouseEnter={() => handleMouseEnter(v?.images?.[0] || ASSETS.placeholderProduct)}
            >
              <div className="aspect-[3/4] rounded-3xl md:rounded-[4rem] overflow-hidden bg-white mb-4 md:mb-8 shadow-xl md:shadow-2xl border border-gray-50 relative transition-all duration-700 md:duration-1000 md:group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] md:group-hover:-translate-y-4 md:group-hover:scale-[1.03]">
                 
                 <ProductCardMedia 
                    imageUrl={v?.images?.[0] || ASSETS.placeholderProduct} 
                    videoUrl={v?.videoUrl} 
                    alt={isAr ? v?.nameAr : v?.nameEn} 
                 />
                 
                 {/* Atelier UI Badge */}
                 <div className="absolute top-4 md:top-10 ltr:left-4 md:ltr:left-10 rtl:right-4 md:rtl:right-10 bg-red-600 text-white text-[6px] md:text-[8px] font-black uppercase px-4 md:px-6 py-1.5 md:py-3 rounded-full shadow-2xl border border-white/20 backdrop-blur-md tracking-[0.2em] md:tracking-[0.3em] z-10">
                    ATELIER
                 </div>

                 {/* Desktop Only Hover Icon */}
                 <div className="hidden md:flex absolute bottom-10 ltr:right-10 rtl:left-10 w-16 h-16 bg-white/95 backdrop-blur-2xl rounded-[2rem] items-center justify-center shadow-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-10 group-hover:translate-y-0 rotate-12 group-hover:rotate-0 z-10">
                    <Sparkles size={24} className="text-red-600 animate-pulse" />
                 </div>
              </div>

              {/* Product Info */}
              <div className="space-y-1 md:space-y-3 text-start px-2 md:px-6">
                <div className="flex flex-col gap-0.5 md:gap-1">
                   <p className="text-[8px] md:text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      {v.category || 'Elite Archive'}
                   </p>
                   <h4 className="font-black text-base md:text-xl uppercase tracking-tighter text-black md:group-hover:text-red-600 transition-colors duration-500 line-clamp-1 leading-none">
                      {isAr ? v?.nameAr : v?.nameEn}
                   </h4>
                </div>
                
                <div className="flex items-baseline gap-3 md:gap-5">
                    <p className="text-black font-black text-xl md:text-2xl tracking-tighter">
                        {v?.price ?? 0} <span className="text-[10px] md:text-[12px] opacity-30 font-black">QAR</span>
                    </p>
                    {((v?.originalPrice ?? 0) > (v?.price ?? 0)) && (
                        <p className="text-gray-300 font-extrabold text-xs md:text-sm line-through decoration-red-600/40 decoration-2">
                            {v?.originalPrice}
                        </p>
                    )}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* End Card / Scroll to Top Button */}
        <div className="min-w-[150px] md:min-w-[200px] flex flex-col items-center justify-center snap-start">
           <button 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
             className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 md:border-4 border-gray-100 flex items-center justify-center text-gray-300 hover:bg-black hover:text-white hover:border-black transition-all duration-500 group/btn"
           >
              <ChevronRight size={24} className={`md:w-10 md:h-10 transition-transform duration-500 ${isAr ? 'rotate-180 md:group-hover/btn:-translate-x-2' : 'md:group-hover/btn:translate-x-2'}`} />
           </button>
           <span className="mt-4 md:mt-6 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-300">
              {isAr ? 'الأعلى' : 'Top'}
           </span>
        </div>
      </div>
    </section>
  );
};

export default memo(RecommendationBar);