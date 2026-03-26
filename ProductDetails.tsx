import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, CONTACT_WHATSAPP, ASSETS, COLOR_MAP, SIZE_LABELS } from '../constants';
import {
  ShoppingBag, Heart, Share2, Sparkles, X, ChevronRight, MessageSquare, Phone,
  Mail, MessageCircle, AlertCircle, Star, Plus, Target, Info, Ruler, Zap,
  Loader2, CheckCircle2, Truck, ArrowUpRight, ArrowLeft
} from 'lucide-react';
import { Product, Review, ProductVariant, CartItem } from '../types';
import ProductCardMedia from '../components/ProductCardMedia';
import RecommendationBar from '../components/RecommendationBar';

interface ProductDetailsProps {
  productId: string | null;
  setPage: (p: string) => void;
  onBack: () => void;
  onProductClick?: (id: string) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId, setPage, onBack, onProductClick }) => {
  const {
    language, products, addToCart, wishlist, toggleWishlist,
    addRecentlyViewed, reviews, addReview, recentlyViewedIds
  } = useApp();

  const isAr = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  const product = useMemo(() => {
    if (!products || !productId) return null;
    return products.find(p => p.id === productId);
  }, [products, productId]);

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [viewIndex, setViewIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [reviewRating, setReviewRating] = useState(5); 

  const currentVariant = useMemo(() => {
    if (!product || !product.variants || !selectedColor) return null;
    return product.variants[selectedColor] || null;
  }, [product, selectedColor]);

  useEffect(() => {
    if (product && product.variants) {
      addRecentlyViewed(product.id);
      
      const availableColors = Object.keys(product.variants || {}); 
      if (availableColors.length > 0) {
        const firstColorKey = availableColors[0];
        setSelectedColor(firstColorKey);
        
        const firstVariant = product.variants[firstColorKey];
        if (firstVariant && firstVariant.sizes && firstVariant.sizes.length > 0) {
          setSelectedSize(firstVariant.sizes[0]);
        }
      }
      setViewIndex(0);
    }
    window.scrollTo({ top: 0, behavior: 'auto' }); 
  }, [product, addRecentlyViewed]);

  useEffect(() => {
    if (currentVariant && currentVariant.sizes) {
      if (!currentVariant.sizes.includes(selectedSize)) {
        setSelectedSize(currentVariant.sizes[0] || '');
      }
      setViewIndex(0);
    }
  }, [selectedColor, currentVariant, selectedSize]);

  const [showSizeHelper, setShowSizeHelper] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sizeRecommendation, setSizeRecommendation] = useState<string | null>(null);
  const [isAiSizing, setIsAiSizing] = useState(false);

  const isInWishlist = product ? wishlist.includes(product.id) : false;
  
  const productReviews = useMemo(() => {
    if (!productId || !reviews) return [];
    return reviews.filter(r => r.productId === productId);
  }, [reviews, productId]);

  const similarStyleProducts = useMemo(() => {
    if (!product || !currentVariant || !products.length) return [];
    const result: Product[] = [];
    for (const p of products) {
        if (result.length >= 8) break;
        if (p.id === product.id || !p.variants) continue;
        const vKeys = Object.keys(p.variants || {});
        if (vKeys.length === 0) continue;
        const firstV = p.variants[vKeys[0]];
        if (firstV?.subCategory === currentVariant?.subCategory &&
            firstV?.category === currentVariant?.category) {
            result.push(p);
        }
    }
    return result;
  }, [product, currentVariant, products]);

  const outfitProducts = useMemo(() => {
    if (!product || !product.outfitRecommendationIds || !products) return [];
    return products.filter(p => product.outfitRecommendationIds?.includes(p.id));
  }, [product, products]);

  const recentlyViewedProducts = useMemo(() => {
    if (!recentlyViewedIds || !products) return [];
    const ids = recentlyViewedIds.filter(id => id !== productId);
    return products.filter(p => ids.includes(p.id)).slice(0, 8);
  }, [recentlyViewedIds, products, productId]);

  const handlePostComment = () => {
    if (!commentText.trim() || !product) return;
    const newReview: Review = {
      id: Date.now().toString(),
      productId: product.id,
      userName: isAr ? "عميل الأتيليه" : "Atelier Client",
      rating: reviewRating, 
      comment: commentText.replace(/[<>]/g, ""), 
      photos: [],
      date: new Date().toLocaleDateString(isAr ? 'ar-QA' : 'en-US')
    };
    addReview(newReview);
    setCommentText('');
    setReviewRating(5);
  };

  const handleAiSizeHelper = () => {
    if (!height || !weight || !currentVariant || !currentVariant.sizes) return;
    setIsAiSizing(true);
    setTimeout(() => {
      const h = parseInt(height) || 170;
      const w = parseInt(weight) || 70;
      const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
      let recIndex = 3; 
      if (w < 45) recIndex = 0; else if (w < 55) recIndex = 1; else if (w < 68) recIndex = 2; else if (w < 82) recIndex = 3; else if (w < 95) recIndex = 4; else if (w < 110) recIndex = 5; else if (w < 125) recIndex = 6; else recIndex = 7;
      if (h > 185 && recIndex < 7) recIndex += 1;
      if (h < 155 && recIndex > 0) recIndex -= 1;
      let finalRec = sizeOrder[recIndex];
      if (!currentVariant.sizes.includes(finalRec)) {
        const availableIndexes = currentVariant.sizes.map(s => sizeOrder.indexOf(s)).filter(idx => idx !== -1).sort((a, b) => Math.abs(a - recIndex) - Math.abs(b - recIndex));
        finalRec = sizeOrder[availableIndexes[0]] || currentVariant.sizes[0];
      }
      setSizeRecommendation(finalRec);
      setSelectedSize(finalRec);
      setIsAiSizing(false);
    }, 1200);
  };

  const handleAddToCart = (goToCheckOut = false) => {
    if (!product || !currentVariant) return;
    if ((currentVariant?.stock ?? 0) <= 0) {
      alert(isAr ? "عذراً، هذا اللون غير متوفر" : "Out of stock");
      return;
    }

    const itemToAdd: any = {
      product: product,
      variant: currentVariant,
      id: product.id,
      nameEn: currentVariant.nameEn || product.nameEn || "",
      nameAr: currentVariant.nameAr || product.nameAr || "",
      price: Number(currentVariant.price || 0),
      image: (currentVariant.images && currentVariant.images[0]) || (product.images && product.images[0]) || "",
      quantity: 1,
      selectedSize: selectedSize || (currentVariant.sizes ? currentVariant.sizes[0] : 'M'),
      selectedColor: selectedColor || ""
    };

    addToCart(itemToAdd);
    if (goToCheckOut) setPage('cart');
    else alert(isAr ? "تمت الإضافة للسلة" : "Added to Cart");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: isAr ? currentVariant?.nameAr : currentVariant?.nameEn, url: window.location.href }); } catch (error) { console.log(error); }
    } else {
      try { await navigator.clipboard.writeText(window.location.href); alert(isAr ? 'تم النسخ!' : 'Copied!'); } catch (err) { alert(window.location.href); }
    }
  };

  const uniqueImages = useMemo(() => {
    return Array.from(new Set(currentVariant?.images || []));
  }, [currentVariant]);

  if (!product || !currentVariant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-8">
        <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
        <p className="font-black uppercase tracking-[0.5em] text-red-600 text-[10px] animate-pulse">
          {isAr ? 'جاري استدعاء الأرشيف الرقمي...' : 'ACCESSING NEURAL ARCHIVE...'}
        </p>
      </div>
    );
  }

  const currentPrice = Number(currentVariant?.price || 0);
  const originalPrice = Number(currentVariant?.originalPrice || 0);
  const hasDiscount = originalPrice > currentPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 pb-56 md:pb-60 animate-in fade-in duration-1000 text-start font-sans overflow-x-hidden">
      
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-400 hover:text-black transition-all mb-8 md:mb-12 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 md:group-hover:-translate-x-2 transition-transform md:w-4 md:h-4" /> 
        {isAr ? 'العودة للأرشيف' : 'Back to Archive'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
        <div className="space-y-6 md:space-y-8 lg:sticky lg:top-32">
          {/* الحاوية الرئيسية للعرض */}
          <div className="aspect-[4/5] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl bg-zinc-100 border border-gray-100 relative group">
            <ProductCardMedia
              imageUrl={uniqueImages[viewIndex] || ''}
              videoUrl={currentVariant?.videoUrl}
              alt={isAr ? (currentVariant?.nameAr || "") : (currentVariant?.nameEn || "")}
            />
            
            <button 
              onClick={() => toggleWishlist(product.id)} 
              className={`absolute top-6 md:top-10 ltr:left-6 md:ltr:left-10 rtl:right-6 md:rtl:right-10 p-4 md:p-6 rounded-full shadow-2xl transition-all z-[100] ${isInWishlist ? 'bg-red-600 text-white' : 'bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-600 hover:scale-110'}`}
            >
              <Heart size={20} className="md:w-6 md:h-6" fill={isInWishlist ? "currentColor" : "none"} />
            </button>

            <button 
              onClick={handleShare} 
              className="absolute top-24 md:top-32 ltr:left-6 md:ltr:left-10 rtl:right-6 md:rtl:right-10 p-4 md:p-6 bg-white/80 backdrop-blur-md text-gray-400 rounded-full shadow-2xl transition-all z-[100] hover:text-black hover:scale-110"
            >
              <Share2 size={20} className="md:w-6 md:h-6" />
            </button>
            
            <div className="absolute top-6 md:top-10 rtl:left-6 md:rtl:left-10 ltr:right-6 md:ltr:right-10 bg-red-600 text-white text-[7px] md:text-[8px] font-black uppercase px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-2xl border border-red-500/30 backdrop-blur-sm tracking-[0.2em] z-[100]">ELITE ATELIER</div>
          </div>
          
          {/* قسم المصغرات */}
          {uniqueImages.length > 1 && (
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 no-scrollbar px-2 flex-nowrap items-center h-20 md:h-28">
              {uniqueImages.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setViewIndex(i)} 
                  className={`flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] overflow-hidden border-2 md:border-4 transition-all duration-500 ${viewIndex === i ? 'border-red-600 scale-105 shadow-xl' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} loading="lazy" className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8 md:space-y-12">
          <div className="space-y-4 md:space-y-6 text-start">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-red-600 bg-red-50 px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-red-100 shadow-sm">
                  {isAr ? `تشكيلة ${currentVariant?.category || ""}` : `${currentVariant?.category || ""} COLLECTION`}
              </span>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
            </div>

            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-snug text-black">
              {isAr ? (currentVariant?.nameAr || "") : (currentVariant?.nameEn || "")}
            </h1>

            <div className="flex items-baseline gap-4 md:gap-6">
                <p className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tighter">
                  {currentPrice} <span className="text-sm md:text-lg opacity-30 font-bold">QAR</span>
                </p>
                {hasDiscount && (
                    <p className="text-lg md:text-xl text-gray-300 line-through font-semibold decoration-red-600/30 decoration-2">{originalPrice} QAR</p>
                )}
            </div>
          </div>

          <p className="text-base md:text-lg text-gray-600 leading-relaxed font-normal border-l-4 border-red-600/20 pl-6 md:pl-8">
              {isAr ? (currentVariant?.descriptionAr || "") : (currentVariant?.descriptionEn || "")}
          </p>

          <div className="space-y-6 md:space-y-8">
            <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-gray-400 flex items-center gap-2 md:gap-3">
                <div className="w-1 h-3 md:w-1.5 md:h-4 bg-red-600 rounded-full" /> {isAr ? 'الألوان المتوفرة' : 'Archival Colors'}
            </h3>
            <div className="flex flex-wrap gap-3 md:gap-5 p-4 md:p-8 bg-gray-50 rounded-3xl md:rounded-[3.5rem] border border-gray-100 shadow-inner">
              {Object.keys(product.variants || {}).map(colorKey => (
                <button
                  key={colorKey}
                  onClick={() => setSelectedColor(colorKey)}
                  className={`group relative w-12 h-12 md:w-16 md:h-16 rounded-full border-[4px] md:border-[5px] transition-all duration-500 hover:scale-110 md:hover:scale-125 ${selectedColor === colorKey ? 'border-black scale-110 shadow-2xl' : 'border-white opacity-40 hover:opacity-100'}`}
                  style={{ backgroundColor: COLOR_MAP[colorKey] || '#ccc' }}
                  title={colorKey}
                >
                  {selectedColor === colorKey && (
                    <div className="absolute inset-0 flex items-center justify-center text-white mix-blend-difference animate-in zoom-in">
                        <CheckCircle2 size={24} className="md:w-8 md:h-8" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-gray-400 flex items-center gap-2 md:gap-3">
                  <div className="w-1 h-3 md:w-1.5 md:h-4 bg-red-600 rounded-full" /> {isAr ? 'المقاسات' : 'Dimensions'}
              </h3>
              <button onClick={() => setShowSizeHelper(!showSizeHelper)} className="flex items-center gap-2 md:gap-3 text-red-600 font-black text-[8px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] hover:scale-105 transition-transform bg-red-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-red-100 shadow-sm">
                <Ruler size={14} className="md:w-4 md:h-4" /> {isAr ? 'مساعد المقاس الذكي' : 'Smart Size Helper'}
              </button>
            </div>

            {showSizeHelper && (
              <div className="bg-zinc-900 p-6 md:p-10 rounded-3xl md:rounded-[4rem] border-4 md:border-8 border-zinc-800 animate-in zoom-in duration-500 space-y-6 md:space-y-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-3 md:gap-4 text-white relative z-10">
                  <Sparkles size={20} className="md:w-6 md:h-6 text-red-600 animate-pulse" />
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">{isAr ? 'خوارزمية القياس الرقمية' : 'Neural Fitting Algorithm v4.0'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 md:gap-6 relative z-10">
                  <input type="number" placeholder="Height (cm)" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-zinc-800 text-white p-4 md:p-6 rounded-xl md:rounded-2xl border-none font-black text-base md:text-lg shadow-inner focus:ring-4 focus:ring-red-600/20 outline-none" />
                  <input type="number" placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-zinc-800 text-white p-4 md:p-6 rounded-xl md:rounded-2xl border-none font-black text-base md:text-lg shadow-inner focus:ring-4 focus:ring-red-600/20 outline-none" />
                </div>
                <button onClick={handleAiSizeHelper} disabled={isAiSizing || !height || !weight} className="w-full bg-white text-black py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] flex items-center justify-center gap-3 md:gap-4 shadow-2xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-20">
                  {isAiSizing ? <Loader2 className="animate-spin md:w-5 md:h-5" /> : <Target size={18} className="md:w-5 md:h-5" />}
                  {isAr ? 'تحديد المقاس المثالي' : 'Calibrate Ideal Fit'}
                </button>
                {sizeRecommendation && <div className="text-center p-4 md:p-6 bg-red-600 text-white rounded-2xl md:rounded-[2rem] font-extrabold text-lg md:text-xl uppercase tracking-[0.3em] md:tracking-[0.5em] animate-in fade-in shadow-xl">{isAr ? `المقترح: ${sizeRecommendation}` : `Suggested: ${sizeRecommendation}`}</div>}
              </div>
            )}

            <div className="flex flex-wrap gap-2 md:gap-4">
              {currentVariant?.sizes?.map(size => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`px-6 md:px-12 py-3 md:py-6 rounded-xl md:rounded-[2rem] text-[10px] md:text-[12px] font-black border-2 md:border-4 transition-all duration-500 ${selectedSize === size ? 'bg-black text-white border-black shadow-2xl scale-105 md:scale-110' : 'bg-white border-gray-100 text-gray-300 hover:border-black hover:text-black'}`}>
                  {isAr ? SIZE_LABELS[size]?.ar || size : SIZE_LABELS[size]?.en || size}
                </button>
              ))}
            </div>
            
            {(currentVariant?.stock ?? 0) < 5 && (currentVariant?.stock ?? 0) > 0 && (
                <div className="flex items-center gap-2 md:gap-3 text-red-600 font-extrabold text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] animate-pulse bg-red-50 w-fit px-4 md:px-6 py-1.5 md:py-2 rounded-full border border-red-100">
                    <Zap size={12} className="md:w-3.5 md:h-3.5" fill="currentColor" /> {isAr ? `بقي ${currentVariant.stock} قطع فقط في الأرشيف!` : `Only ${currentVariant.stock} left in archive!`}
                </div>
            )}
          </div>

          <div className="flex flex-col gap-4 md:gap-6 pt-6 md:pt-10">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <button onClick={() => handleAddToCart(false)} className="flex-1 bg-white border-2 md:border-4 border-black text-black py-5 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center justify-center gap-3 md:gap-4 hover:bg-black hover:text-white transition-all active:scale-95 shadow-xl">
                <ShoppingBag size={20} className="md:w-6 md:h-6" /> {t('addToCart')}
              </button>
              <button onClick={() => handleAddToCart(true)} className="flex-1 bg-black text-white py-5 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center justify-center gap-3 md:gap-4 hover:bg-red-600 transition-all active:scale-95 shadow-2xl">
                <ArrowUpRight size={20} className="md:w-6 md:h-6 rtl:rotate-[-90deg]" /> {isAr ? 'شراء الآن' : 'Buy Now'}
              </button>
            </div>
          </div>

          <div className="pt-10 md:pt-16 border-t border-gray-100 grid grid-cols-2 gap-8 md:gap-12 text-start">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-green-50 text-green-600 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center flex-shrink-0 shadow-inner"><Truck size={24} className="md:w-9 md:h-9" /></div>
              <div>
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5 md:mb-1">{isAr ? 'التوصيل' : 'Priority Delivery'}</p>
                  <p className="font-extrabold text-sm md:text-xl tracking-tight leading-none">{isAr ? 'مجاني في قطر' : 'Free in Qatar'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 md:gap-8">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center flex-shrink-0 shadow-inner"><CheckCircle2 size={24} className="md:w-9 md:h-9" /></div>
              <div>
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5 md:mb-1">{isAr ? 'الموثوقية' : 'Authenticity'}</p>
                  <p className="font-extrabold text-sm md:text-xl tracking-tight leading-none">100% Certified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 md:mt-40 space-y-20 md:space-y-32 pt-16 md:pt-32 border-t border-gray-100">
        {similarStyleProducts.length > 0 && <RecommendationBar title={isAr ? 'أنماط مشابهة من الأرشيف' : 'SIMILAR STYLE ARCHIVE'} items={similarStyleProducts} language={language} onProductClick={(id) => onProductClick?.(id)} />}
        {outfitProducts.length > 0 && <RecommendationBar title={isAr ? 'منتجات قد تعجبك' : 'YOU MAY ALSO LIKE'} items={outfitProducts} language={language} onProductClick={(id) => onProductClick?.(id)} />}
        {recentlyViewedProducts.length > 0 && <RecommendationBar title={isAr ? 'منتجات شاهدتها سابقاً' : 'VIEWED BEFORE'} items={recentlyViewedProducts} language={language} onProductClick={(id) => onProductClick?.(id)} />}
      </div>

      {/* قسم المراجعات */}
      <section className="mt-40 md:mt-60 border-t border-gray-100 pt-20 md:pt-32 text-start">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-10 md:gap-12 text-start">
          <div className="space-y-3 md:space-y-4">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-red-600">{isAr ? 'آراء نخبة العملاء' : 'Elite Client Feedback'}</span>
            <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none">{isAr ? 'الأرشيف' : 'THE ARCHIVE.'}</h2>
          </div>
          <div className="flex items-center gap-6 md:gap-10 bg-white px-8 md:px-16 py-6 md:py-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-3xl">
            <p className="text-4xl md:text-6xl font-black tracking-tighter">5.0</p>
            <div className="h-12 md:h-24 w-px bg-gray-100" />
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-400 max-w-[120px] md:max-w-[160px] leading-loose text-start">{isAr ? 'مشتريات موثقة رقمياً للأعضاء' : 'Digitally Verified Purchases for Elite Members'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 md:gap-24">
          <div className="lg:col-span-2 space-y-10 md:space-y-16">
            {productReviews.length === 0 ? (
              <div className="bg-gray-50/50 p-16 md:p-32 rounded-[3rem] md:rounded-[6rem] text-center border-4 border-dashed border-gray-100">
                <MessageSquare size={60} className="md:w-[100px] md:h-[100px] mx-auto text-gray-200 mb-8 opacity-20" />
                <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-gray-300">{isAr ? 'لا توجد إدخالات في الأرشيف حالياً' : 'Archive Registry is Empty'}</p>
              </div>
            ) : (
              productReviews.map(review => (
                <div key={review.id} className="bg-white p-8 md:p-16 rounded-[2.5rem] md:rounded-[4.5rem] shadow-xl border border-gray-50 animate-in fade-in duration-700 space-y-6 md:space-y-10 hover:shadow-3xl transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4 md:gap-8">
                      <div className="w-12 h-12 md:w-20 md:h-20 bg-black text-white rounded-xl md:rounded-[2rem] flex items-center justify-center font-black text-lg md:text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-500 italic">{review.userName.charAt(0)}</div>
                      <div>
                        <p className="font-black uppercase text-sm md:text-base tracking-tight">{review.userName}</p>
                        <p className="text-[8px] md:text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1 md:mt-2">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 md:gap-1">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className="md:w-3.5 md:h-3.5 text-red-600" fill={i <= review.rating ? "#DC2626" : "none"} />)}
                    </div>
                  </div>
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-normal italic">"{review.comment}"</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-zinc-950 text-white p-10 md:p-20 rounded-[3rem] md:rounded-[6rem] shadow-3xl h-fit space-y-10 md:space-y-16 relative overflow-hidden text-start group">
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic relative z-10">Post Entry.</h3>
            <div className="flex gap-2 z-10 relative">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} onClick={() => setReviewRating(i)} className={`hover:scale-125 transition-transform ${reviewRating >= i ? 'text-red-600' : 'text-zinc-700'}`}>
                  <Star size={24} className="md:w-8 md:h-8" fill={reviewRating >= i ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={isAr ? 'دون تجربتك...' : "Log your experience..."} className="w-full bg-white/5 border border-white/10 rounded-3xl md:rounded-[3rem] p-6 md:p-10 min-h-[180px] md:min-h-[250px] text-lg md:text-xl font-bold focus:ring-8 focus:ring-red-600/20 outline-none resize-none transition-all placeholder:text-zinc-800 relative z-10 shadow-inner" />
            <button onClick={handlePostComment} className="w-full bg-red-600 text-white py-6 md:py-10 rounded-2xl md:rounded-[3rem] font-black text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.5em] hover:scale-105 transition-all shadow-3xl active:scale-95 relative z-10">
              {isAr ? 'إرسال للأرشيف' : 'Commit to Archive'}
            </button>
          </div>
        </div>
      </section>

      {/* شريط الاتصال العائم المطور للموبايل */}
      <div className="fixed bottom-6 md:bottom-12 left-0 right-0 z-[250] max-w-5xl mx-auto px-4 md:px-6">
        <div className="bg-white/80 backdrop-blur-3xl border-2 md:border-4 border-white shadow-3xl rounded-3xl md:rounded-[5rem] p-3 md:p-5 grid grid-cols-4 gap-2 md:gap-6 animate-in slide-in-from-bottom-10 duration-1000">
          <a href={`tel:${CONTACT_WHATSAPP}`} className="flex flex-col items-center justify-center gap-1 md:gap-3 bg-[#4b7a3a] text-white py-3 md:py-8 rounded-2xl md:rounded-[3rem] transition-all hover:scale-105 shadow-xl group">
            <Phone size={18} className="md:w-8 md:h-8 group-hover:rotate-12 transition-transform duration-500" />
            <span className="text-[7px] md:text-[11px] font-black uppercase tracking-widest">{isAr ? 'اتصال' : 'Call Hub'}</span>
          </a>
          <a href={`sms:${CONTACT_WHATSAPP}`} className="flex flex-col items-center justify-center gap-1 md:gap-3 bg-[#4c8ecf] text-white py-3 md:py-8 rounded-2xl md:rounded-[3rem] transition-all hover:scale-105 shadow-xl group">
            <Mail size={18} className="md:w-8 md:h-8 group-hover:-translate-y-1 transition-transform duration-500" />
            <span className="text-[7px] md:text-[11px] font-black uppercase tracking-widest">{isAr ? 'رسالة' : 'Sms Matrix'}</span>
          </a>
          <button onClick={() => setPage('contact')} className="flex flex-col items-center justify-center gap-1 md:gap-3 bg-[#e0563b] text-white py-3 md:py-8 rounded-2xl md:rounded-[3rem] transition-all hover:scale-105 shadow-xl group">
            <MessageSquare size={18} className="md:w-8 md:h-8 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-[7px] md:text-[11px] font-black uppercase tracking-widest">{isAr ? 'دردشة' : 'Direct Chat'}</span>
          </button>
          <a href={`https://wa.me/${CONTACT_WHATSAPP}`} target="_blank" className="flex flex-col items-center justify-center gap-1 md:gap-3 bg-[#3dc855] text-white py-3 md:py-8 rounded-2xl md:rounded-[3rem] transition-all hover:scale-105 shadow-xl group">
            <MessageCircle size={18} className="md:w-8 md:h-8 group-hover:rotate-[360deg] transition-transform duration-700" />
            <span className="text-[7px] md:text-[11px] font-black uppercase tracking-widest">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;