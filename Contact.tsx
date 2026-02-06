
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
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors mb-12 uppercase tracking-widest"
      >
        <ArrowLeft size={16} />
        {isAr ? 'العودة' : 'Back'}
      </button>

      <div className="text-center mb-16">
        <h1 className="text-5xl font-black tracking-tighter mb-4">
          {isAr ? 'اتصل بنا' : 'Get in Touch'}
        </h1>
        <p className="text-gray-500 text-lg">
          {isAr 
            ? 'نحن هنا لمساعدتك. تواصل معنا مباشرة عبر القنوات التالية.' 
            : 'We are here to help. Reach out to us directly through the following channels.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* WhatsApp Card */}
        <a 
          href={`https://wa.me/${CONTACT_WHATSAPP}`}
          target="_blank"
          className="group bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-green-100 transition-all flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MessageSquare size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2">{isAr ? 'واتساب' : 'WhatsApp'}</h2>
          <p className="text-gray-500 mb-6">{isAr ? 'أسرع طريقة للحصول على دعم' : 'Fastest way to get support'}</p>
          <span className="text-xl font-bold text-green-600">{CONTACT_WHATSAPP}</span>
        </a>

        {/* Email Card */}
        <a 
          href={`mailto:${CONTACT_EMAIL}`}
          className="group bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-red-100 transition-all flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Mail size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2">{isAr ? 'البريد الإلكتروني' : 'Email'}</h2>
          <p className="text-gray-500 mb-6">{isAr ? 'للاستفسارات الرسمية' : 'For formal inquiries'}</p>
          <span className="text-xl font-bold text-red-600">{CONTACT_EMAIL}</span>
        </a>
      </div>

      <div className="bg-gray-50 rounded-[3rem] p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex items-start gap-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">{isAr ? 'ساعات العمل' : 'Working Hours'}</h3>
            <p className="text-gray-500 leading-relaxed">
              {isAr 
                ? 'يومياً من الساعة ١٠ صباحاً حتى الساعة ١٠ مساءً' 
                : 'Daily from 10:00 AM to 10:00 PM'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">{isAr ? 'الموقع' : 'Location'}</h3>
            <p className="text-gray-500 leading-relaxed">
              {isAr 
                ? 'الدوحة، قطر. توصيل لجميع المناطق.' 
                : 'Doha, Qatar. Delivery to all regions.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
