import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext'; // ✅ تم التصحيح
import { TRANSLATIONS, CONTACT_WHATSAPP, ASSETS, COLOR_MAP, SIZE_LABELS } from './constants'; // ✅ تم التصحيح
import { ShoppingBag, Heart, Share2, Star, ShieldCheck } from 'lucide-react';
import ProductCardMedia from './ProductCardMedia'; // ✅ تم التصحيح

const ProductDetails: React.FC<{ productId: string | null, setPage: (p: string) => void }> = ({ productId, setPage }) => {
  const { language, products, addToCart, wishlist, toggleWishlist } = useApp();
  const product = products.find(p => p.id === productId);
  const isAr = language === 'ar';

  if (!product) return <div className="p-20 text-center font-black">Product Not Found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="rounded-[3rem] overflow-hidden shadow-2xl">
          <img src={product.images[0]} className="w-full object-cover" />
        </div>
        <div className="space-y-8">
          <h1 className="text-6xl font-black uppercase">{isAr ? product.nameAr : product.nameEn}</h1>
          <p className="text-4xl font-black text-red-600">{product.price} QAR</p>
          <button onClick={() => { addToCart({ product, quantity: 1, selectedSize: 'M', selectedColor: 'Black' }); setPage('cart'); }} className="w-full bg-black text-white py-8 rounded-[2rem] font-black text-2xl">ADD TO BAG</button>
        </div>
      </div>
    </div>
  );
};
export default ProductDetails;
