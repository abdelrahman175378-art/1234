import React from 'react';
import { useApp } from '../AppContext';
import { CONTACT_WHATSAPP, CONTACT_EMAIL } from '../constants';
import { ArrowLeft, Phone, Mail, MessageSquare, Clock, MapPin } from 'lucide-react';

interface ContactProps {
  onBack: () => void;
}

const Contact: React.FC<ContactProps> = ({ onBack }) => {
  const { language } = useApp();
  const isAr = language === 'ar';

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 md:py-16 animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-x-hidden">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-400 hover:text-black transition-colors mb-8 md:mb-12 uppercase tracking-widest"
      >
        <ArrowLeft size={16} className={isAr ? 'rotate-180' : ''} />
        {isAr ? 'العودة' : 'Back'}
      </button>

      <div className="text-center mb-10 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 uppercase">
          {isAr ? 'اتصل بنا' : 'Get in Touch'}
        </h1>
        <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
          {isAr 
            ? 'نحن هنا لمساعدتك. تواصل معنا مباشرة عبر القنوات التالية لضمان الحصول على أفضل تجربة.' 
            : 'We are here to help. Reach out to us directly through the following channels for the best experience.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-16">
        {/* WhatsApp Card */}
        <a 
          href={`https://wa.me/${CONTACT_WHATSAPP}`}
          target="_blank"
          rel="noreferrer"
          className="group bg-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-green-100 transition-all flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <MessageSquare size={32} className="md:w-10 md:h-10" />
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-1 md:mb-2">{isAr ? 'واتساب' : 'WhatsApp'}</h2>
          <p className="text-[11px] md:text-[13px] text-gray-400 mb-4 md:mb-6 uppercase tracking-widest">{isAr ? 'أسرع طريقة للحصول على دعم' : 'Fastest way to get support'}</p>
          <span className="text-lg md:text-xl font-black text-green-600 tracking-tight">{CONTACT_WHATSAPP}</span>
        </a>

        {/* Email Card */}
        <a 
          href={`mailto:${CONTACT_EMAIL}`}
          className="group bg-white p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-red-100 transition-all flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <Mail size={32} className="md:w-10 md:h-10" />
          </div>
          <h2 className="text-xl md:text-2xl font-black mb-1 md:mb-2">{isAr ? 'البريد الإلكتروني' : 'Email'}</h2>
          <p className="text-[11px] md:text-[13px] text-gray-400 mb-4 md:mb-6 uppercase tracking-widest">{isAr ? 'للاستفسارات الرسمية' : 'For formal inquiries'}</p>
          <span className="text-lg md:text-xl font-black text-red-600 tracking-tight truncate w-full px-2">{CONTACT_EMAIL}</span>
        </a>
      </div>

      <div className="bg-gray-50 rounded-3xl md:rounded-[3rem] p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="flex items-start gap-4 md:gap-6">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-red-600 shadow-sm shrink-0">
            <Clock size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="text-start">
            <h3 className="text-base md:text-lg font-black mb-1 md:mb-2 uppercase tracking-tight">{isAr ? 'ساعات العمل' : 'Working Hours'}</h3>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">
              {isAr 
                ? 'يومياً من الساعة ١٠ صباحاً حتى الساعة ١٠ مساءً' 
                : 'Daily from 10:00 AM to 10:00 PM'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 md:gap-6">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-red-600 shadow-sm shrink-0">
            <MapPin size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="text-start">
            <h3 className="text-base md:text-lg font-black mb-1 md:mb-2 uppercase tracking-tight">{isAr ? 'الموقع' : 'Location'}</h3>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">
              {isAr 
                ? 'الدوحة، قطر. توصيل لجميع مناطق قطر.' 
                : 'Doha, Qatar. Priority delivery to all regions.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;