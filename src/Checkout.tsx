import React, { useState } from 'react';
import { useApp } from './AppContext.tsx';
import { ASSETS } from './constants.tsx';
import { ShoppingBag, ChevronRight, CheckCircle2, CreditCard, Banknote, ArrowLeft } from 'lucide-react';

const Checkout: React.FC<{ setPage: (p: string) => void }> = ({ setPage }) => {
  const { cart, placeOrder } = useApp();
  const [step, setStep] = useState('cart');
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleOrder = () => {
    if (!formData.name || !formData.phone) return;
    placeOrder({ id: 'ORD-'+Date.now(), customerName: formData.name, total, items: cart, status: 'Processing', date: new Date().toLocaleDateString() });
    setStep('success');
  };

  if (step === 'success') return (
    <div className="max-w-xl mx-auto py-32 text-center">
      <CheckCircle2 size={80} className="mx-auto text-green-500 mb-8" />
      <h1 className="text-4xl font-black mb-4">Order Received!</h1>
      <button onClick={() => setPage('home')} className="bg-black text-white px-12 py-4 rounded-full font-bold">Back Home</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <h2 className="text-4xl font-black">Checkout</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Full Name" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-none font-bold" />
          <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-none font-bold" />
        </div>
        <div className="bg-red-50 p-10 rounded-[3rem] text-center border border-red-100">
           <h3 className="font-black text-red-600 mb-6 uppercase">Scan QR to Pay</h3>
           <img src={ASSETS.paymentQR} className="w-48 h-48 mx-auto rounded-2xl shadow-xl mb-6" />
           <p className="text-[10px] font-black text-red-800/50 uppercase">Secure your order with Doha Bank</p>
        </div>
        <button onClick={handleOrder} className="w-full bg-black text-white py-6 rounded-2xl font-black text-xl shadow-2xl">Confirm Order • {total} QAR</button>
      </div>
      <div className="bg-gray-50 p-10 rounded-[3rem]">
        <h3 className="text-2xl font-black mb-8">Your Items</h3>
        {cart.map((item, i) => (
          <div key={i} className="flex gap-4 mb-4 items-center">
            <img src={item.product.images[0]} className="w-16 h-20 object-cover rounded-lg" />
            <div className="flex-grow"><p className="font-bold">{item.product.nameEn}</p><p className="text-xs text-gray-400">{item.selectedSize}</p></div>
            <p className="font-black">{item.product.price} QAR</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Checkout;
