import React from 'react';
import { useApp } from '../AppContext';
import { ArrowLeft, Shield, Truck, RefreshCcw, Lock } from 'lucide-react';

interface PolicyProps {
  type: string | null;
  onBack: () => void;
}

const Policy: React.FC<PolicyProps> = ({ type, onBack }) => {
  const { language } = useApp();
  const isAr = language === 'ar';

  const getContent = () => {
    switch (type) {
      case 'Shipping':
        return {
          title: isAr ? 'سياسة الشحن' : 'Shipping Policy',
          icon: <Truck size={isAr ? 48 : 48} className="text-red-600 md:w-12 md:h-12 w-9 h-9" />,
          sections: [
            {
              h: isAr ? 'نطاق التوصيل' : 'Delivery Areas',
              p: isAr 
                ? 'نحن نقوم بالتوصيل إلى جميع مناطق دولة قطر، بما في ذلك الدوحة والوكرة والخور والريان.' 
                : 'We deliver to all areas within the State of Qatar, including Doha, Al Wakrah, Al Khor, and Al Rayyan.'
            },
            {
              h: isAr ? 'وقت التوصيل' : 'Delivery Time',
              p: isAr 
                ? 'يتم التوصيل عادةً خلال 24 إلى 48 ساعة من تأكيد الطلب.' 
                : 'Delivery usually takes 24 to 48 hours from order confirmation.'
            },
            {
              h: isAr ? 'رسوم التوصيل' : 'Delivery Fees',
              p: isAr 
                ? 'التوصيل مجاني للطلبات التي تزيد عن 250 ريال قطري. للطلبات الأقل من ذلك، يتم احتساب رسوم قدرها 20 ريال قطري.' 
                : 'Free delivery for orders over 250 QAR. For orders below that, a 20 QAR fee applies.'
            }
          ]
        };
      case 'Returns':
        return {
          title: isAr ? 'الاستبدال والاسترجاع' : 'Returns & Exchange',
          icon: <RefreshCcw size={48} className="text-red-600 md:w-12 md:h-12 w-9 h-9" />,
          sections: [
            {
              h: isAr ? 'فترة الاسترجاع' : 'Return Period',
              p: isAr 
                ? 'يمكنك استبدال أو استرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام.' 
                : 'You can exchange or return products within 14 days of receipt.'
            },
            {
              h: isAr ? 'حالة المنتج' : 'Product Condition',
              p: isAr 
                ? 'يجب أن يكون المنتج في حالته الأصلية، غير مستخدم، وبكامل تغليفه وملصقاته.' 
                : 'The product must be in its original condition, unused, with all packaging and tags intact.'
            },
            {
              h: isAr ? 'طريقة الطلب' : 'How to Request',
              p: isAr 
                ? 'يرجى التواصل معنا عبر الواتساب لبدء عملية الاسترجاع.' 
                : 'Please contact us via WhatsApp to initiate a return or exchange.'
            }
          ]
        };
      case 'Terms':
        return {
          title: isAr ? 'الشروط والأحكام' : 'Terms & Conditions',
          icon: <Shield size={48} className="text-red-600 md:w-12 md:h-12 w-9 h-9" />,
          sections: [
            {
              h: isAr ? 'استخدام الموقع' : 'Site Usage',
              p: isAr 
                ? 'باستخدامك لموقع AK Modern Fashion، فإنك توافق على الالتزام بهذه الشروط.' 
                : 'By using the AK Modern Fashion website, you agree to comply with these terms.'
            },
            {
              h: isAr ? 'الأسعار والتوفر' : 'Pricing & Availability',
              p: isAr 
                ? 'جميع الأسعار بالريال القطري. نحتفظ بالحق في تعديل الأسعار أو إلغاء الطلبات في حالة الخطأ.' 
                : 'All prices are in QAR. We reserve the right to modify prices or cancel orders in case of error.'
            }
          ]
        };
      case 'Privacy':
        return {
          title: isAr ? 'سياسة الخصوصية' : 'Privacy Policy',
          icon: <Lock size={48} className="text-red-600 md:w-12 md:h-12 w-9 h-9" />,
          sections: [
            {
              h: isAr ? 'جمع البيانات' : 'Data Collection',
              p: isAr 
                ? 'نحن نجمع فقط المعلومات الضرورية لمعالجة طلبك وتوصيله إليك بأمان.' 
                : 'We only collect information necessary to process your order and deliver it to you safely.'
            },
            {
              h: isAr ? 'حماية المعلومات' : 'Data Protection',
              p: isAr 
                ? 'بياناتك الشخصية مشفرة ومحمية ولا يتم مشاركتها مع أطراف خارجية إلا لأغراض التوصيل.' 
                : 'Your personal data is encrypted and protected, and is not shared with third parties except for delivery purposes.'
            }
          ]
        };
      default:
        return { title: 'Policy', icon: <Shield />, sections: [] };
    }
  };

  const content = getContent();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 md:py-16 animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-x-hidden text-start">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-400 hover:text-black transition-colors mb-8 md:mb-12 uppercase tracking-widest"
      >
        <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} />
        {isAr ? 'العودة' : 'Back'}
      </button>

      <div className="text-center mb-10 md:mb-16">
        <div className="inline-block p-4 md:p-6 bg-gray-50 rounded-full mb-4 md:mb-6">
          {content.icon}
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">{content.title}</h1>
      </div>

      <div className="space-y-8 md:space-y-12">
        {content.sections.map((sec, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <h2 className="text-xl md:text-2xl font-black mb-3 md:mb-4 uppercase tracking-tight">{sec.h}</h2>
            <p className="text-gray-600 text-sm md:text-lg leading-relaxed font-medium">{sec.p}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-xs md:text-sm mb-6 md:mb-8 uppercase tracking-widest">
          {isAr ? 'هل لديك أسئلة إضافية؟' : 'Have more questions?'}
        </p>
        <button 
          onClick={onBack}
          className="w-full md:w-auto bg-black text-white px-8 md:px-12 py-4 rounded-full font-black text-sm md:text-base uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          {isAr ? 'العودة للتسوق' : 'Back to Shopping'}
        </button>
      </div>
    </div>
  );
};

export default Policy;