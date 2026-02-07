import React, { useState } from 'react';
import { useApp } from './AppContext.tsx';
import { TRANSLATIONS, DELIVERY_FEE, DELIVERY_THRESHOLD, ASSETS } from './constants.tsx';
import { ShoppingBag, ChevronRight, CheckCircle2, CreditCard, Banknote, ArrowLeft } from 'lucide-react';

const Checkout: React.FC<{ setPage: (p: string) => void }> = ({ setPage }) => {
  const { language, cart, removeFromCart, updateCartQuantity, placeOrder } = useApp();
  const isAr = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button onClick={() => setPage('shop')} className="mb-6 flex items-center gap-2 font-black uppercase text-gray-400">
        <ArrowLeft size={16} /> {isAr ? 'العودة' : 'Back'}
      </button>
      <h1 className="text-4xl font-black mb-8">{t('checkout')}</h1>
      {/* بقية كود السلة والدفع... */}
    </div>
  );
};
export default Checkout;
