import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, CONTACT_WHATSAPP, ASSETS, COLOR_MAP, SIZE_LABELS } from '../constants';
import { ShoppingBag, ArrowLeft, Heart, Share2, Sparkles, X, RotateCw, Maximize2, ChevronRight, Eye, Zap, Check, Star, Camera, ShieldCheck, UserCheck } from 'lucide-react';
import { Product } from '../types';
import ProductCardMedia from '../components/ProductCardMedia';

interface ProductDetailsProps {
  productId: string | null;
  setPage: (p: string) => void;
  onBack: () => void;
  onTryOn?: (product: Product, image: string, color?: string) => void;
  onProductClick?: (id: string) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId, setPage, onBack, onTryOn, onProductClick }) => {
  const { language, products, addToCart, wishlist, toggleWishlist, addRecentlyViewed, incrementView, reviews } = useApp();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [viewIndex, setViewIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [shareSuccess, setShareSuccess] = useState(false);
  const isAr = language === 'ar';
  
  const product = products.find(p => p.id === productId);
  const isInWishlist = product ? wishlist.includes(product.id) : false;

  const stylingSuggestions = products.filter(p => p.id !== productId && p.category === product?.category).slice(0, 3);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
      incrementView(product.id);
      if (product.sizes.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors.length > 0) setSelectedColor(product.colors[0]);
    }
  }, [product?.id]);

  if (!product) return <div className="p-32 text-center font-black">Design not found in archives.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-1000">
      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-12 overflow-x-auto no-scrollbar whitespace-nowrap ${isAr ? 'flex-row-reverse' : ''}`}>
        <button onClick={() => setPage('home')} className="hover:text-black transition-colors">{isAr ? 'الرئيسية' : 'Home'}</button>
        <ChevronRight size={12} className={isAr ? 'rotate-180' : ''} />
        <button onClick={() => setPage('shop')} className="hover:text-black transition-colors">{isAr ? 'المتجر' : 'Shop'}</button>
        <ChevronRight size={12} className={isAr ? 'rotate-180' : ''} />
        <span className="text-black">{isAr ? product.nameAr : product.nameEn}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32">
        <div className="space-y-6">
            <div className="aspect-[3/4] bg-gray-50 rounded-[4rem] overflow-hidden shadow-2xl relative group">
                <img src={product.images[viewIndex]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Product" />
                <div className={`absolute top-10 flex flex-col gap-3 ${isAr ? 'left-10' : 'right-10'}`}>
                    <button onClick={() => toggleWishlist(product.id)} className={`p-4 rounded-3xl shadow-2xl transition-all ${isInWishlist ? 'bg-red-600 text-white' : 'bg-white text-gray-400'}`}>
                        <Heart size={24} fill={isInWishlist ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => {
                        setShareSuccess(true);
                        setTimeout(() => setShareSuccess(false), 2000);
                        navigator.clipboard.writeText(window.location.href);
                    }} className="p-4 bg-white text-gray-400 rounded-3xl shadow-2xl hover:text-black transition-all">
                        {shareSuccess ? <Check size={24} className="text-green-600" /> : <Share2 size={24} />}
                    </button>
                </div>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                {product.images.map((img, i) => (
                    <button key={i} onClick={() => setViewIndex(i)} className={`w-24 h-32 shrink-0 rounded-[1.5rem] overflow-hidden border-4 transition-all ${viewIndex === i ? 'border-black scale-105 shadow-xl' : 'border-transparent opacity-60'}`}>
                        <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-12">
          <div>
            <div className={`flex items-center gap-4 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
               <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase px-6 py-2 rounded-full border border-green-100 flex items-center gap-2">
                 <ShieldCheck size={14} /> {isAr ? 'توصيل مجاني' : 'READY FOR QATAR SHIPPING'}
               </span>
               <div className="flex gap-1">
                 {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#000" className="text-black" />)}
                 <span className="text-[10px] font-black ml-2">4.9/5</span>
               </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase mb-6">{isAr ? product.nameAr : product.nameEn}</h1>
            <p className="text-4xl font-black text-red-600">{product.price} QAR</p>
          </div>

          <div className="grid grid-cols-2 gap-6 py-10 border-y border-gray-100">
             <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><Eye size={22}/></div>
                <div><p className="text-lg font-black leading-none">1,240</p><p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">{isAr ? 'مشاهدة' : 'Views'}</p></div>
             </div>
             <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner"><ShoppingBag size={22}/></div>
                <div><p className="text-lg font-black leading-none">156</p><p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">{isAr ? 'مبيعاً' : 'Sales'}</p></div>
             </div>
          </div>

          <div className="space-y-10">
            <div>
              <label className={`block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 ${isAr ? 'text-right' : ''}`}>{isAr ? 'اختر المقاس' : 'SELECT ARCHITECTURE (SIZE)'}</label>
              <div className={`flex flex-wrap gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                {product.sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`px-8 py-5 rounded-3xl font-black text-sm border-2 transition-all ${selectedSize === size ? 'bg-black text-white border-black shadow-2xl scale-110' : 'bg-white border-gray-100 text-gray-400 hover:text-black'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => onTryOn?.(product, product.images[viewIndex], selectedColor)} className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-8 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(220,38,38,0.2)] hover:scale-[1.02] transition-all group">
                <Sparkles className="group-hover:animate-spin" /> {isAr ? 'تجربة القياس بالذكاء الاصطناعي' : 'ATELIER AI FITTING'}
            </button>

            <div className="flex gap-4">
              <button onClick={() => { addToCart({ product, quantity, selectedSize, selectedColor }); setPage('cart'); }} className="flex-grow bg-black text-white py-8 rounded-[2.5rem] font-black text-2xl hover:bg-red-600 transition-all shadow-2xl active:scale-95">
                {isAr ? 'أضف للحقيبة' : 'ADD TO BAG'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Styling Section */}
      <section className="mb-32">
        <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl font-black uppercase tracking-tighter">{TRANSLATIONS.styleWith[language]}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {stylingSuggestions.map(p => (
                <div key={p.id} className="group cursor-pointer" onClick={() => onProductClick?.(p.id)}>
                    <div className="aspect-square rounded-[3rem] overflow-hidden mb-6 shadow-lg">
                        <ProductCardMedia imageUrl={p.images[0]} videoUrl={p.videoUrl} alt={p.nameEn} />
                    </div>
                    <h4 className="font-black uppercase tracking-tight text-lg">{isAr ? p.nameAr : p.nameEn}</h4>
                    <p className="font-black text-red-600">{p.price} QAR</p>
                </div>
            ))}
        </div>
      </section>

      {/* Verified Feedback Engine */}
      <section className="bg-gray-50 rounded-[5rem] p-16 md:p-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20">
            <div>
                <h2 className="text-6xl font-black uppercase tracking-tighter mb-4">{TRANSLATIONS.verifiedReviews[language]}</h2>
                <div className="flex items-center gap-4">
                    <div className="flex gap-1">{[1,2,3,4,5].map(i => <Star key={i} size={20} fill="#000" />)}</div>
                    <span className="text-2xl font-black">4.9 Out of 5</span>
                </div>
            </div>
            <button className="bg-white px-12 py-5 rounded-2xl border border-gray-200 font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black hover:text-white transition-all">
                {TRANSLATIONS.writeReview[language]}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[1, 2].map(i => (
                <div key={i} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-black text-lg">M</div>
                            <div>
                                <p className="font-black text-sm uppercase">Mohamed A.</p>
                                <p className="text-[8px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1"><UserCheck size={10}/> Verified Buyer</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-gray-300">2 Days ago</span>
                    </div>
                    <p className="text-gray-500 leading-relaxed font-medium">
                        "The quality of the fabric is exceptional. Exceeded my expectations for a streetwear brand in Doha. Definitely worth the price."
                    </p>
                    <div className="flex gap-3">
                        <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden"><img src={product.images[0]} className="w-full h-full object-cover grayscale opacity-50" alt="" /></div>
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
