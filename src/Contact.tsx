import React from 'react';
import { useApp } from './AppContext'; // ✅ تم التصحيح
import { CONTACT_WHATSAPP, CONTACT_EMAIL } from './constants'; // ✅ تم التصحيح
import { ArrowLeft, Mail, MessageSquare, Clock, MapPin } from 'lucide-react';

const Contact: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { language } = useApp();
  const isAr = language === 'ar';

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-12 uppercase tracking-widest"><ArrowLeft size={16} /> Back</button>
      <h1 className="text-5xl font-black mb-12 text-center">{isAr ? 'اتصل بنا' : 'Get in Touch'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <a href={`https://wa.me/${CONTACT_WHATSAPP}`} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
          <MessageSquare className="mx-auto mb-4 text-green-600" size={40} />
          <h2 className="text-2xl font-black">WhatsApp</h2>
          <p className="text-green-600 font-bold mt-2">{CONTACT_WHATSAPP}</p>
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
          <Mail className="mx-auto mb-4 text-red-600" size={40} />
          <h2 className="text-2xl font-black">Email</h2>
          <p className="text-red-600 font-bold mt-2">{CONTACT_EMAIL}</p>
        </a>
      </div>
    </div>
  );
};
export default Contact;
