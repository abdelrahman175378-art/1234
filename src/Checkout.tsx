import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, DELIVERY_FEE, DELIVERY_THRESHOLD, ASSETS } from '../constants';
import { ShoppingBag, ChevronRight, CheckCircle2, CreditCard, Banknote, Home, Building2, Building, MapPin, ArrowLeft, Mail, User, Phone } from 'lucide-react';

type HousingType = 'Compound' | 'Standalone' | 'Flat' | 'Tower';

const Checkout: React.FC<{ setPage: (p: string) => void }> = ({ setPage }) => {
  const { language, cart, removeFromCart, updateCartQuantity, placeOrder } = useApp();
  const isAr = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  const [step, setStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'Online' | 'COD'>('Online');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  
  const [housingType, setHousingType] = useState<HousingType>('Standalone');
  const [addressDetails, setAddressDetails] = useState({
    unit: '', bldg: '', street: '', zone: '', flat: '', floor: '', apartment: '', bldgName: ''
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const deliveryFee = subtotal >= DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (!formData.name || !formData.phone || !formData.email) return;
    let fullAddress = '';
    const { unit, bldg, street, zone, flat, floor, apartment, bldgName } = addressDetails;
    if (housingType === 'Compound') fullAddress = `Unit: ${unit}, Bldg: ${bldg}, St: ${street}, Zone: ${zone} (Compound)`;
    else if (housingType === 'Standalone') fullAddress = `Bldg: ${bldg}, St: ${street}, Zone: ${zone} (Standalone)`;
    else if (housingType === 'Flat') fullAddress = `Flat: ${flat}, Floor: ${floor}, Bldg: ${bldg}, St: ${street}, Zone: ${zone}`;
    else if (housingType === 'Tower') fullAddress = `Apt: ${apartment}, Floor: ${floor}, Bldg: ${bldg} (${bldgName}), St: ${street}, Zone: ${zone}`;

    const now = new Date();
    const day = now.toLocaleDateString(isAr ? 'ar-QA' : 'en-US', { weekday: 'long' });
    const date = now.toLocaleDateString(isAr ? 'ar-QA' : 'en-US');
    const time = now.toLocaleTimeString(isAr ? 'ar-QA' : 'en-US');

    placeOrder({
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: formData.name, 
      phone: formData.phone, 
      email: formData.email,
      address: fullAddress,
      items: cart, 
      total, 
      status: 'Processing', 
      paymentMethod, 
      date,
      day,
      time
    });
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle2 size={48} /></div>
        <h1 className="text-4xl font-black mb-4">{isAr ? 'تم طلبك بنجاح!' : 'Order Placed Successfully!'}</h1>
        <p className="text-gray-500 mb-12">{isAr ? 'شكراً لتسوقك مع AK. سنتواصل معك قريباً لتأكيد الطلب.' : 'Thank you for shopping with AK. We will contact you shortly.'}</p>
        <button onClick={() => setPage('home')} className="bg-black text-white px-10 py-4 rounded-full font-bold shadow-xl">Back to Home</button>
      </div>
    );
  }

  const renderAddressFields = () => {
    const inputClass = "w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-black transition-all text-sm font-bold";
    const labelClass = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1";
    switch (housingType) {
      case 'Compound':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Unit</label><input type="number" value={addressDetails.unit} onChange={e=>setAddressDetails({...addressDetails, unit: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Bldg</label><input type="number" value={addressDetails.bldg} onChange={e=>setAddressDetails({...addressDetails, bldg: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Street</label><input type="number" value={addressDetails.street} onChange={e=>setAddressDetails({...addressDetails, street: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Zone</label><input type="number" value={addressDetails.zone} onChange={e=>setAddressDetails({...addressDetails, zone: e.target.value})} className={inputClass} /></div>
          </div>
        );
      case 'Standalone':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div><label className={labelClass}>Bldg</label><input type="number" value={addressDetails.bldg} onChange={e=>setAddressDetails({...addressDetails, bldg: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Street</label><input type="number" value={addressDetails.street} onChange={e=>setAddressDetails({...addressDetails, street: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Zone</label><input type="number" value={addressDetails.zone} onChange={e=>setAddressDetails({...addressDetails, zone: e.target.value})} className={inputClass} /></div>
          </div>
        );
      case 'Flat':
        return (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div><label className={labelClass}>Flat</label><input type="number" value={addressDetails.flat} onChange={e=>setAddressDetails({...addressDetails, flat: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Floor</label><input type="number" value={addressDetails.floor} onChange={e=>setAddressDetails({...addressDetails, floor: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Bldg</label><input type="number" value={addressDetails.bldg} onChange={e=>setAddressDetails({...addressDetails, bldg: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>St</label><input type="number" value={addressDetails.street} onChange={e=>setAddressDetails({...addressDetails, street: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Zone</label><input type="number" value={addressDetails.zone} onChange={e=>setAddressDetails({...addressDetails, zone: e.target.value})} className={inputClass} /></div>
          </div>
        );
      case 'Tower':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Apt</label><input type="number" value={addressDetails.apartment} onChange={e=>setAddressDetails({...addressDetails, apartment: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Floor</label><input type="number" value={addressDetails.floor} onChange={e=>setAddressDetails({...addressDetails, floor: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Bldg Name</label><input type="text" value={addressDetails.bldgName} onChange={e=>setAddressDetails({...addressDetails, bldgName: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Zone</label><input type="number" value={addressDetails.zone} onChange={e=>setAddressDetails({...addressDetails, zone: e.target.value})} className={inputClass} /></div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col mb-8">
        <button 
          onClick={() => setPage('shop')}
          className="mb-6 flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-all"
        >
          <ArrowLeft size={16} /> {isAr ? 'العودة للتسوق' : 'Back to Shopping'}
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('cart')} className={`font-black ${step === 'cart' ? 'text-black' : 'text-gray-300'}`}>1. {t('cart')}</button>
          <ChevronRight size={16} className="text-gray-300" />
          <button onClick={() => setStep('details')} disabled={cart.length === 0} className={`font-black ${step === 'details' ? 'text-black' : 'text-gray-300'}`}>2. {t('checkout')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {step === 'cart' ? (
            <div className="space-y-6">
              {cart.map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-6 items-center">
                  <img src={item.product.images?.[0] || 'https://via.placeholder.com/150'} className="w-24 h-32 rounded-3xl object-cover border border-gray-100" alt="" />
                  <div className="flex-grow">
                    <h3 className="text-xl font-black">{isAr ? item.product.nameAr : item.product.nameEn}</h3>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{item.selectedSize} • {item.selectedColor}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex bg-gray-50 rounded-xl p-1">
                        <button onClick={() => updateCartQuantity(i, Math.max(1, item.quantity - 1))} className="w-8 h-8 font-bold">-</button>
                        <span className="w-8 text-center font-black">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(i, item.quantity + 1)} className="w-8 h-8 font-bold">+</button>
                      </div>
                      <button onClick={() => removeFromCart(i)} className="text-red-500 text-[10px] font-black uppercase">Remove</button>
                    </div>
                  </div>
                  <div className="text-2xl font-black">{item.product.price * item.quantity} QAR</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                  <input type="text" placeholder={t('placeholderName')} value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none p-5 pl-12 rounded-2xl font-bold" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                  <input type="tel" placeholder={t('placeholderPhone')} value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border-none p-5 pl-12 rounded-2xl font-bold" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                  <input type="email" placeholder="Email Address" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border-none p-5 pl-12 rounded-2xl font-bold" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black mb-6">{isAr ? 'عنوان التوصيل' : 'Delivery Address'}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {['Standalone', 'Compound', 'Flat', 'Tower'].map(type => (
                    <button key={type} onClick={()=>setHousingType(type as HousingType)} className={`p-4 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${housingType === type ? 'bg-black text-white border-black' : 'border-gray-100'}`}>{type}</button>
                  ))}
                </div>
                {renderAddressFields()}
              </div>

              <div>
                <h2 className="text-2xl font-black mb-6">{isAr ? 'طريقة الدفع' : 'Payment Method'}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={()=>setPaymentMethod('Online')} className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'Online' ? 'bg-black text-white border-black' : 'border-gray-100'}`}>
                    <CreditCard size={32} /><span className="text-[10px] font-black uppercase">{t('onlinePayment')}</span>
                  </button>
                  <button onClick={()=>setPaymentMethod('COD')} className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'COD' ? 'bg-black text-white border-black' : 'border-gray-100'}`}>
                    <Banknote size={32} /><span className="text-[10px] font-black uppercase">{t('cod')}</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'Online' && (
                <div className="bg-red-50 p-10 rounded-[3rem] flex flex-col items-center text-center animate-in zoom-in">
                  <h3 className="font-black uppercase tracking-widest text-[10px] text-red-600 mb-6">{isAr ? 'امسح رمز الاستجابة السريعة للدفع' : 'Scan QR to Pay'}</h3>
                  <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6 ring-8 ring-white/50 w-64 h-64 overflow-hidden flex items-center justify-center">
                    <img src={ASSETS.paymentQR} alt="Bank QR" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[10px] font-black text-red-800/60 max-w-xs uppercase leading-relaxed tracking-wider">Scan with your banking app to secure your order.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 sticky top-32">
            <h3 className="text-2xl font-black mb-8">{t('orderSummary')}</h3>
            <div className="space-y-4 mb-10">
              <div className="flex justify-between font-bold text-gray-500 text-sm uppercase"><span>Subtotal</span><span>{subtotal} QAR</span></div>
              <div className="flex justify-between font-bold text-gray-500 text-sm uppercase"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : `${deliveryFee} QAR`}</span></div>
              <div className="pt-6 border-t border-gray-100 flex justify-between items-baseline"><span className="font-black uppercase">Total</span><span className="text-4xl font-black">{total} QAR</span></div>
            </div>
            <button onClick={step === 'cart' ? ()=>setStep('details') : handlePlaceOrder} className="w-full bg-black text-white py-6 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-xl">{step === 'cart' ? t('checkout') : t('placeOrder')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
