import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  TRANSLATIONS, 
  CONTACT_WHATSAPP, 
  MENS_SUB_CATEGORIES_CONFIG, 
  WOMENS_SUB_CATEGORIES_CONFIG 
} from '../constants';
import { 
  MessageSquare, X, Send, Sparkles, ChevronRight, Truck, Info, 
  Globe, Zap, AlertCircle, Search, Headset, ShieldCheck 
} from 'lucide-react';
import { Product } from '../types';

/**
 * Interface representing a clickable option in the chat UI.
 */
interface Option {
  label: string;
  action: string;
  category?: string;
  subCategory?: string;
}

/**
 * Interface representing a single message in the conversation history.
 */
interface Message {
  role: 'user' | 'model';
  text: string;
  options?: Option[];
}

/**
 * Props for the AIChatbot component.
 */
interface AIChatbotProps {
  onProductNavigate?: (id: string) => void;
  // This prop is the neural bridge to the Parent component for deep routing.
  onBrowseNavigate?: (category: string, subCategory?: string) => void;
}

/**
 * AIChatbot Component: A tactical digital concierge for the AK Modern Archive.
 */
const AIChatbot: React.FC<AIChatbotProps> = ({ onProductNavigate, onBrowseNavigate }) => {
  const { language, setLanguage, products, user } = useApp();
  const isAr = language === 'ar';
  
  // Logical and UI States
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // DOM References
  const chatEndRef = useRef<HTMLDivElement>(null);

  /**
   * Effect: Neural Scroll. Keeps the conversation in focus.
   */
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  /**
   * Effect: Archival Initialization. Displays welcome and language select on first open.
   */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const firstName = user ? user.name.split(' ')[0] : '';
      const welcomeText = isAr 
        ? `مرحباً بك في الأرشيف الرقمي لـ AK Modern يا ${firstName}. يرجى تحديد اللغة المفضلة للمتابعة.`
        : `Welcome to the AK Modern Digital Archive, ${firstName}. Please select your preferred language to begin.`;
      
      setMessages([
        {
          role: 'model',
          text: welcomeText,
          options: [
            { label: 'English', action: 'set_lang_en' },
            { label: 'العربية', action: 'set_lang_ar' }
          ]
        }
      ]);
    }
  }, [isOpen, isAr, user, messages.length]);

  /**
   * Returns tactical menu options based on current language settings.
   */
  const getMainMenuOptions = (arabic: boolean): Option[] => [
    { label: arabic ? 'أرشيف الرجال' : "Men's Archive", action: 'menu_men' },
    { label: arabic ? 'أرشيف النساء' : "Women's Archive", action: 'menu_women' },
    { label: arabic ? 'تحدث مع المنسق' : 'Talk to Personal Stylist', action: 'talk_human' },
    { label: arabic ? 'معلومات التوصيل' : 'Delivery Information', action: 'search_delivery' },
    { label: arabic ? 'تغيير اللغة' : 'Change Language', action: 'show_lang_selector' }
  ];

  /**
   * showMainMenu: Displays the primary navigation hub.
   */
  const showMainMenu = (lang: string) => {
    const arabic = lang === 'ar';
    const msg: Message = {
      role: 'model',
      text: arabic 
        ? "لقد قمت بتفعيل واجهة البحث المتقدم. كيف يمكنني توجيهك اليوم؟" 
        : "I have activated the Advanced Search interface. How can I guide you today?",
      options: getMainMenuOptions(arabic)
    };
    setMessages(prev => [...prev, msg]);
  };

  /**
   * showSubMenu: Pulls dynamic category configurations and displays them for entry.
   */
  const showSubMenu = (category: 'Men' | 'Women') => {
    const arabic = language === 'ar';
    const config = category === 'Men' ? MENS_SUB_CATEGORIES_CONFIG : WOMENS_SUB_CATEGORIES_CONFIG;
    
    const msg: Message = {
      role: 'model',
      text: arabic 
        ? `تفضل بتحديد الفئة التي تود تصفحها في أرشيف ${category === 'Men' ? 'الرجال' : 'النساء'}:`
        : `Please select the specific category you wish to browse in the ${category}'s archive:`,
      options: [
        ...config.map(item => ({
          label: arabic ? (TRANSLATIONS[item.key]?.ar || item.key) : (TRANSLATIONS[item.key]?.en || item.key),
          action: `direct_navigate`,
          category: category,
          subCategory: item.key // Passing the exact archival key
        })),
        { 
            label: arabic ? 'عرض المجموعة الكاملة' : 'Show Full Collection', 
            action: `direct_navigate`, 
            category: category, 
            subCategory: 'all' 
        },
        { label: arabic ? 'العودة للقائمة' : 'Back to Main Menu', action: 'main_menu' }
      ]
    };
    setMessages(prev => [...prev, msg]);
  };

  /**
   * handleOptionClick: Processes clicks and performs immediate navigational actions.
   */
  const handleOptionClick = (option: Option) => {
    const { action, label, category, subCategory } = option;
    
    // Immediate command check to avoid user-bubble latency
    if (action !== 'direct_navigate') {
        setMessages(prev => [...prev, { role: 'user', text: label }]);
    }
    
    setLoading(true);

    // Simulated neural compute time
    setTimeout(() => {
      setLoading(false);
      
      if (action === 'set_lang_en') {
        setLanguage('en');
        showMainMenu('en');
      } else if (action === 'set_lang_ar') {
        setLanguage('ar');
        showMainMenu('ar');
      } else if (action === 'show_lang_selector') {
        setMessages(prev => [...prev, {
          role: 'model',
          text: isAr ? "يرجى تحديد لغة الواجهة:" : "Please select interface language:",
          options: [
            { label: 'English', action: 'set_lang_en' },
            { label: 'العربية', action: 'set_lang_ar' }
          ]
        }]);
      } else if (action === 'main_menu') {
        showMainMenu(language);
      } else if (action === 'menu_men') {
        showSubMenu('Men');
      } else if (action === 'menu_women') {
        showSubMenu('Women');
      } else if (action === 'search_delivery') {
        const arabic = language === 'ar';
        setMessages(prev => [...prev, {
            role: 'model',
            text: arabic 
              ? "التوصيل مجاني تماماً لجميع مناطق دولة قطر للطلبات فوق ٢٥٠ ريال. مدة التوصيل المتوقعة هي ٢٤-٤٨ ساعة." 
              : "Priority delivery is free across Qatar for orders over 250 QAR. Expected delivery time is 24-48 hours.",
            options: [{ label: arabic ? 'العودة' : 'Back', action: 'main_menu' }]
        }]);
      } else if (action === 'talk_human') {
        window.open(`https://wa.me/${CONTACT_WHATSAPP}`, '_blank');
        const arabic = language === 'ar';
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: arabic ? "تم فتح الواتساب لربطك فوراً بفريق المبيعات." : "WhatsApp interface opened to connect you with our sales concierge.",
          options: [{ label: arabic ? 'العودة للقائمة' : 'Back to Menu', action: 'main_menu' }]
        }]);
      } else if (action === 'direct_navigate') {
          // --- IMMEDIATE NAVIGATION PROTOCOL ---
          if (category && onBrowseNavigate) {
              const targetSubKey = subCategory === 'all' ? undefined : subCategory;
              
              // Executing the parent router callback immediately
              onBrowseNavigate(category, targetSubKey);
              
              // Close the chat for immersive archival display
              setIsOpen(false);
          }
      }
    }, 450); 
  };

  /**
   * handleManualSearch: Processes text input to filter the global archive.
   */
  const handleManualSearch = () => {
    if (!input.trim() || loading) return;
    const userText = input;
    
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // General broad-search archival routing
      if (onBrowseNavigate) {
        onBrowseNavigate('All', userText);
        setIsOpen(false); // Immediate transition
      }
    }, 850);
  };

  return (
    <>
      {/* Tactical Neural Activation Button - Responsive positioning based on language */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 md:bottom-8 z-[100] bg-black text-white p-4 md:p-5 rounded-full shadow-[0_25px_60px_rgba(0,0,0,0.5)] hover:scale-110 transition-all flex items-center gap-2 group ring-4 ring-white ${isAr ? 'right-6 md:right-8' : 'left-6 md:left-8'}`}
        aria-label="Open Archive Assistant"
      >
        <MessageSquare size={24} className="md:w-[26px] md:h-[26px]" />
      </button>

      {isOpen && (
        <div 
          className={`fixed inset-0 sm:inset-auto sm:bottom-24 sm:w-[440px] sm:h-[700px] bg-white z-[300] sm:rounded-[4rem] shadow-[0_60px_160px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 duration-500 border border-gray-100 ${isAr ? 'sm:right-8' : 'sm:left-8'}`}
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {/* Tactical Archival Header - Responsive sizing */}
          <div className="bg-black text-white p-6 md:p-8 flex items-center justify-between shrink-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-white to-red-600 opacity-40" />
            <div className="flex items-center gap-3 md:gap-4 text-start relative z-10">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-red-600 rounded-xl md:rounded-[1.4rem] flex items-center justify-center shadow-2xl animate-pulse">
                <Sparkles size={22} className="md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="font-black text-sm md:text-base uppercase tracking-tighter leading-none mb-1 md:mb-1.5">AK STYLIST PRO</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_#22c55e]" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-40">
                    {isAr ? 'البحث الرقمي نشط' : 'NEURAL SEARCH ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 md:p-3.5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all relative z-10 active:scale-90"
            >
              <X size={22} className="md:w-7 md:h-7" />
            </button>
          </div>

          {/* Conversation History Hub - Responsive padding/spacing */}
          <div className="flex-grow overflow-y-auto p-5 md:p-8 space-y-8 md:space-y-10 bg-gray-50/20 flex flex-col no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
                <div 
                  className={`max-w-[90%] md:max-w-[85%] p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] text-xs md:text-[13px] font-bold leading-relaxed text-start shadow-sm border ${
                    m.role === 'user' 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-800 border-gray-100'
                  }`}
                >
                  {m.text.split('\n').map((line, idx) => <p key={idx} className="mb-1.5 last:mb-0">{line}</p>)}
                </div>
                
                {/* Immediate Archival Entry Points */}
                {m.options && (
                  <div className="mt-6 md:mt-8 grid grid-cols-1 gap-2.5 md:gap-3.5 w-full animate-in fade-in slide-in-from-top-6 duration-500">
                    {m.options.map((opt, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleOptionClick(opt)}
                        className={`flex items-center justify-between px-6 md:px-8 py-4 md:py-5 rounded-xl md:rounded-[2rem] text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 group ${
                            opt.action === 'direct_navigate' 
                            ? 'bg-zinc-950 text-white shadow-2xl hover:bg-red-600' 
                            : 'bg-white border border-gray-100 text-gray-400 hover:text-black hover:border-black hover:shadow-xl'
                        }`}
                      >
                        <span className="flex items-center gap-3 md:gap-4">
                            {opt.action === 'direct_navigate' && <Globe size={16} className="md:w-[18px] md:h-[18px] opacity-40 animate-spin-slow" />}
                            {opt.action === 'talk_human' && <Headset size={16} className="md:w-[18px] md:h-[18px]" />}
                            {opt.action === 'search_delivery' && <Truck size={16} className="md:w-[18px] md:h-[18px]" />}
                            {opt.label}
                        </span>
                        <ChevronRight size={16} className={`md:w-[18px] md:h-[18px] group-hover:translate-x-2 transition-transform duration-300 ${isAr ? 'rotate-180' : ''}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Neural Load Indicator */}
            {loading && (
              <div className="flex flex-col items-start gap-2 py-2">
                <div className="flex gap-2 px-6 py-5 md:px-8 md:py-7 bg-white rounded-2xl md:rounded-[2.8rem] border border-gray-100 shadow-sm items-center">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-red-600 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4" />
          </div>

          {/* Archival Status Information Bar - Responsive padding */}
          <div className="px-6 md:px-10 py-3 md:py-4 bg-white flex items-center justify-between border-t border-gray-50 shrink-0">
             <div className="flex items-center gap-2 md:gap-3.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-green-600">
                <Truck size={12} className="md:w-3.5 md:h-3.5" /> {isAr ? 'توصيل قطر مجاني' : 'FREE QATAR DELIVERY'}
             </div>
             <div className="flex items-center gap-2 md:gap-3.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">
                <ShieldCheck size={12} className="md:w-3.5 md:h-3.5" /> {isAr ? 'موثوق ١٠٠٪' : '100% SECURE'}
             </div>
          </div>

          {/* Tactical User Input Interface - Responsive safe-area support */}
          <div className="p-5 md:p-8 bg-white flex gap-3 md:gap-4 border-t border-gray-50 shrink-0 mb-safe">
            <div className="relative flex-grow group">
                <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
                    <Search size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleManualSearch()} 
                  placeholder={isAr ? "ابحث في الأرشيف..." : "Search archive..."} 
                  className="w-full bg-gray-100 pl-11 pr-4 md:pl-14 md:pr-6 py-4 md:py-6 rounded-xl md:rounded-[2.2rem] text-xs md:text-[13px] font-bold border-none focus:ring-4 focus:ring-black/5 transition-all text-start placeholder:opacity-30 outline-none"
                />
            </div>
            <button 
              onClick={handleManualSearch} 
              className="p-4 md:p-6 bg-black text-white rounded-xl md:rounded-[2.2rem] shadow-2xl active:scale-90 transition-all hover:bg-red-600 disabled:opacity-20 flex items-center justify-center"
              disabled={!input.trim() || loading}
            >
              <Send size={22} className="md:w-[26px] md:h-[26px]" />
            </button>
          </div>
        </div>
      )}

      {/* Global Optimization Styles for AIChatbot */}
      <style>{`
        .mb-safe { margin-bottom: env(safe-area-inset-bottom); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default AIChatbot;