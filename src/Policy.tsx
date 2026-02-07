import React from 'react';
import { useApp } from './AppContext'; // ✅ تم التصحيح من ../ إلى ./
import { ArrowLeft, Shield, Truck, RefreshCcw, Lock } from 'lucide-react';

const Policy: React.FC<{ type: string | null, onBack: () => void }> = ({ type, onBack }) => {
  const { language } = useApp();
  const isAr = language === 'ar';

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-12 uppercase tracking-widest"><ArrowLeft size={16} /> Back</button>
      <h1 className="text-5xl font-black mb-8 text-center">{type}</h1>
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100">
        <p className="text-gray-600 text-lg leading-relaxed">
          {isAr ? 'سياسة AK Modern Fashion لخدمة عملاء قطر.' : 'AK Modern Fashion Policy for our Qatar customers.'}
        </p>
      </div>
    </div>
  );
};
export default Policy;
