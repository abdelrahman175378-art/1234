import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, DELIVERY_FEE, DELIVERY_THRESHOLD } from '../constants';
import { 
  ShoppingBag as ShoppingBagIcon, ChevronRight, CheckCircle2, CreditCard, Banknote, ArrowLeft, 
  Mail, User, Phone, MessageCircle, Lock, Download, Trash2, MapPin, Building, Home as HomeIcon
} from 'lucide-react';

import { PayPalButtons } from "@paypal/react-paypal-js";
import { db } from '../firebase-config'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

// استيراد مكتبات الـ PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type HousingType = 'Compound' | 'Standalone' | 'Flat' | 'Tower';

const Checkout: React.FC<{ setPage: (p: string) => void }> = ({ setPage }) => {
  const { language, cart, removeFromCart, updateCartQuantity, clearCart, user } = useApp();
  const isAr = language === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  const [step, setStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'Online' | 'COD'>('Online');
  
  const [formData, setFormData] = useState({ 
    name: user?.name || '', 
    phone: '', 
    email: user?.identifier || '' 
  });

  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [housingType, setHousingType] = useState<HousingType>('Standalone');
  const [addressDetails, setAddressDetails] = useState({
    unit: '', bldg: '', street: '', zone: '', flat: '', floor: '', apartment: '', bldgName: ''
  });

  const [lastOrderDetails, setLastOrderDetails] = useState<{
    id: string,
    address: string,
    items: any[],
    subtotal: number,
    delivery: number,
    total: number,
    method: string,
    customerName: string,
    customerPhone: string
  } | null>(null);

  const subtotal = useMemo(() => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((acc, item) => {
      const price = Number(item.price || item.product?.price || item.data?.price || 0);
      const quantity = Number(item.quantity || 1);
      return acc + (price * quantity);
    }, 0);
  }, [cart]);

  const deliveryFee = (subtotal >= DELIVERY_THRESHOLD || subtotal === 0) ? 0 : DELIVERY_FEE;
  const totalQAR = subtotal + deliveryFee;
  const totalUSD = (totalQAR / 3.64).toFixed(2);

  const generateInvoicePDF = () => {
    if (!lastOrderDetails) return;

    const doc = new jsPDF();
    const { id, address, items, subtotal, delivery, total, method, customerName, customerPhone } = lastOrderDetails;

    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 15, 'F'); 

    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("AK MODERN BOUTIQUE", 105, 35, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Official Digital Receipt | Doha, Qatar", 105, 42, { align: 'center' });

    doc.setDrawColor(240);
    doc.line(15, 50, 195, 50);

    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("ORDER INFORMATION", 15, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Order ID: ${id}`, 15, 68);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 15, 74);
    doc.text(`Payment: ${method}`, 15, 80);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER DETAILS", 110, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Name: ${customerName}`, 110, 68);
    doc.text(`Phone: ${customerPhone}`, 110, 74);
    doc.text(`Address: ${address}`, 110, 80, { maxWidth: 85 });

    const tableData = items.map(item => {
      const price = Number(item.price || item.product?.price || 0);
      const name = item.nameEn || item.product?.nameEn || "Product";
      return [
        `${name}\n(${item.selectedSize || 'N/A'} - ${item.selectedColor || 'N/A'})`,
        item.quantity,
        `${price} QAR`,
        `${price * item.quantity} QAR`
      ];
    });

    autoTable(doc, {
      startY: 100,
      head: [['Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.text("Subtotal:", 140, finalY);
    doc.text(`${subtotal} QAR`, 195, finalY, { align: 'right' });

    doc.text("Delivery Fee:", 140, finalY + 8);
    doc.text(`${delivery === 0 ? 'FREE' : delivery + ' QAR'}`, 195, finalY + 8, { align: 'right' });

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(135, finalY + 12, 195, finalY + 12);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("GRAND TOTAL:", 140, finalY + 20);
    doc.text(`${total} QAR`, 195, finalY + 20, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text("Thank you for choosing AK Modern Boutique!", 105, finalY + 40, { align: 'center' });

    doc.save(`AK-Boutique-Invoice-${id}.pdf`);
  };

  const handleSaveOrder = async (method: string, paypalDetails?: any) => {
    if (!formData.name || !formData.phone || !formData.email) {
      alert(isAr ? 'يرجى ملء كافة البيانات الأساسية' : 'Please fill all contact details');
      return;
    }
    
    setLoading(true);
    
    let fullAddress = '';
    const { unit, bldg, street, zone, flat, floor, apartment, bldgName } = addressDetails;
    if (housingType === 'Compound') fullAddress = `Unit: ${unit}, Bldg: ${bldg}, St: ${street}, Zone: ${zone} (Compound)`;
    else if (housingType === 'Standalone') fullAddress = `Bldg: ${bldg}, St: ${street}, Zone: ${zone} (Standalone)`;
    else if (housingType === 'Flat') fullAddress = `Flat: ${flat}, Floor: ${floor}, Bldg: ${bldg}, St: ${street}, Zone: ${zone}`;
    else if (housingType === 'Tower') fullAddress = `Apt: ${apartment}, Floor: ${floor}, Bldg: ${bldg} (${bldgName}), St: ${street}, Zone: ${zone}`;

    const orderId = paypalDetails ? paypalDetails.id : 'AK' + Math.floor(100000 + Math.random() * 900000).toString();
    
    const orderItems = cart.map(i => {
      const price = Number(i.price || i.product?.price || i.data?.price || 0);
      const nameEn = i.nameEn || i.product?.nameEn || i.data?.nameEn || "";
      const nameAr = i.nameAr || i.product?.nameAr || i.data?.nameAr || "";
      const image = i.image || i.product?.images?.[0] || i.data?.image || "";
      
      return {
        product: {
          nameEn: nameEn,
          nameAr: nameAr,
          price: price,
          images: [image]
        },
        selectedSize: i.selectedSize || "N/A", 
        selectedColor: i.selectedColor || "N/A", 
        quantity: i.quantity 
      };
    });

    const orderToSave = {
      id: orderId,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      address: fullAddress,
      paymentMethod: method,
      status: 'Processing',
      total: Number(totalQAR),
      subtotal: subtotal,
      delivery: deliveryFee,
      date: new Date().toLocaleDateString('en-GB'),
      items: orderItems,
      createdAt: serverTimestamp()
    };

    try {
      const sanitizedOrderData = JSON.parse(JSON.stringify({
        ...orderToSave,
        email: formData.email 
      }));

      await addDoc(collection(db, "orders"), sanitizedOrderData);

      await emailjs.send(
        'service_qfkt94g', 
        'template_wp9sxcn',
        {
          to_name: formData.name,
          email: formData.email,
          order_id: orderId,
          total_price: totalQAR,
          address: fullAddress,
          order_date: new Date().toLocaleDateString('en-GB')
        },
        'J2lsxRIODFwYl5_QJ'
      );

      setLastOrderDetails({
        id: orderId,
        address: fullAddress,
        items: [...cart],
        subtotal: subtotal,
        delivery: deliveryFee,
        total: totalQAR,
        method: method,
        customerName: formData.name,
        customerPhone: formData.phone
      });

      setStep('success');
      if(clearCart) clearCart();

    } catch (error) {
      console.error("FIREBASE ERROR:", error);
      alert(isAr ? 'فشل إتمام الطلب' : 'Order Failed');
    } finally {
      setLoading(false);
    }
  };

  const renderAddressFields = () => {
    const inputClass = "w-full bg-gray-50 border-none p-4 md:p-5 rounded-2xl focus:ring-1 focus:ring-black transition-all text-xs md:text-sm font-bold text-start";
    const labelClass = "block text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1 text-start";
    
    switch (housingType) {
      case 'Compound':
        return (
          <div className="grid grid-cols-2 gap-3 md:gap-4 animate-in fade-in duration-300">
            <div><label className={labelClass}>{t('unit')}</label><input type="text" value={addressDetails.unit} onChange={e=>setAddressDetails({...addressDetails, unit: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>{t('bldg')}</label><input type="text" value={addressDetails.bldg} onChange={e=>setAddressDetails({...addressDetails, bldg: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>{t('street')}</label><input type="text" value={addressDetails.street} onChange={e=>setAddressDetails({...addressDetails, street: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>{t('zone')}</label><input type="text" value={addressDetails.zone} onChange={e=>setAddressDetails({...addressDetails, zone: e.target.value})} className={inputClass} /></div>
          </div>
        );
      case 'Standalone':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 animate-in fade-in duration-300">
            <div><label className={labelClass}>{t('bldg')}</label><input type="text" value={addressDetails.bldg} onChange={e=>setAddressDetails({...addressDetails, bldg: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>{t('street')}</label><input type="text" value={addressDetails.street} onChange={e=>setAddressDetails({...addressDetails, street: e.target.value})} className={inputClass} /></div>
            <div className="col-span-2 md:col-span-1"><label className={labelClass}>{t('zone')}</label><input type="text" value={addressDetails.zone} onChange={e=>setAddressDetails({...addressDetails, zone: e.target.value})} className={inputClass} /></div>
          </div>
        );
      case 'Flat':
        return (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 animate-in fade-in duration-300">
            <div><label className={labelClass}>{t('flat')}</label><input type="text" value={addressDetails.flat} onChange={e=>setAddressDetails({...addressDetails, flat: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>{t('floor')}</label><input type="text" value={addressDetails.floor} onChange={e=>setAddressDetails({...addressDetails, floor: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>{t('bldg')}</label><input type="text" value={addressDetails.bldg} onChange={e=>setAddressDetails({...addressDetails, bldg: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>{t('street')}</label><input type="text" value={addressDetails.street} onChange={e=>setAddressDetails({...addressDetails, street: e.target.value})} className={inputClass} /></div>
            <div className="col-span-2 md:col-span-1"><label className={labelClass}>{t('zone')}</label><input type="text" value={addressDetails.zone} onChange={e=>setAddressDetails({...addressDetails, zone: e.target.value})} className={inputClass} /></div>
          </div>
        );
      case 'Tower':
        return (
          <div className="grid grid-cols-2 gap-3 md:gap-4 animate-in fade-in duration-300">
            <div><label className={labelClass}>{t('apt')}</label><input type="text" value={addressDetails.apartment} onChange={e=>setAddressDetails({...addressDetails, apartment: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>{t('floor')}</label><input type="text" value={addressDetails.floor} onChange={e=>setAddressDetails({...addressDetails, floor: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>{t('bldgName')}</label><input type="text" value={addressDetails.bldgName} onChange={e=>setAddressDetails({...addressDetails, bldgName: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>{t('zone')}</label><input type="text" value={addressDetails.zone} onChange={e=>setAddressDetails({...addressDetails, zone: e.target.value})} className={inputClass} /></div>
          </div>
        );
      default: return null;
    }
  };

  if (step === 'success') {
    const paymentLabel = lastOrderDetails?.method === 'Online' ? (isAr ? 'مدفوع أونلاين (PayPal)' : 'Paid Online (PayPal)') : (isAr ? 'دفع عند الاستلام' : 'Cash on Delivery');
    const detailString = `Order ID: ${lastOrderDetails?.id}\nCustomer: ${formData.name}\nPhone: ${formData.phone}\nAddress: ${lastOrderDetails?.address}\nTotal: ${lastOrderDetails?.total} QAR\nPayment: ${paymentLabel}`;
    const waMessage = encodeURIComponent(`Hello AK Modern Boutique, I have placed an order.\n\n${detailString}\n\nPlease confirm receipt.`);
    
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-32 text-center animate-in zoom-in duration-500 overflow-x-hidden">
        <div className="w-16 h-16 md:w-24 md:h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8"><CheckCircle2 size={32} className="md:w-12 md:h-12" /></div>
        <h1 className="text-2xl md:text-4xl font-black mb-3 md:mb-4">{t('orderSuccess')}</h1>
        <p className="text-sm md:text-base text-gray-500 mb-8 md:mb-12">{t('orderSuccessDesc')}</p>
        
        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <button 
            onClick={generateInvoicePDF}
            className="bg-black text-white py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-zinc-800 transition-all"
          >
            <Download size={18} className="md:w-5 md:h-5" /> {isAr ? 'تحميل الفاتورة PDF' : 'Download Invoice PDF'}
          </button>

          <a href={`https://wa.me/97470342042?text=${waMessage}`} target="_blank" rel="noreferrer" onClick={() => setHasConfirmed(true)} className="bg-[#25D366] text-white py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all">
            <MessageCircle size={18} className="md:w-5 md:h-5" /> {isAr ? 'تأكيد عبر واتساب' : 'Confirm via WhatsApp'}
          </a>
          
          <div className="mt-8 pt-8 border-t border-gray-100">
             {!hasConfirmed ? (
               <div className="flex flex-col items-center gap-2 opacity-40">
                  <Lock size={14} /><p className="text-[8px] font-black uppercase tracking-widest">{isAr ? 'زر العودة مغلق حتى التأكيد' : 'Locked until confirmation'}</p>
                  <button disabled className="w-full bg-gray-200 text-gray-400 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest">{t('backToHome')}</button>
               </div>
             ) : (
               <button onClick={() => setPage('home')} className="w-full bg-black text-white py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg">{t('backToHome')}</button>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 text-start overflow-x-hidden">
      <div className="flex flex-col mb-8 text-start">
        <button onClick={() => setPage('shop')} className="mb-4 md:mb-6 flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-all">
          <ArrowLeft size={14} className="md:w-4 md:h-4 rtl:rotate-180" /> {isAr ? 'العودة للتسوق' : 'Back to Shopping'}
        </button>
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={() => setStep('cart')} className={`text-xs md:text-sm font-black transition-colors ${step === 'cart' ? 'text-black' : 'text-gray-300'}`}>1. {t('cart')}</button>
          <ChevronRight size={14} className="text-gray-300 rtl:rotate-180 md:w-4 md:h-4" />
          <button onClick={() => setStep('details')} disabled={cart.length === 0} className={`text-xs md:text-sm font-black transition-colors ${step === 'details' ? 'text-black' : 'text-gray-300'}`}>2. {t('checkout')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
          {step === 'cart' ? (
            <div className="space-y-4 md:space-y-6">
              {cart.map((item, i) => {
                 const price = Number(item.price || item.product?.price || item.data?.price || 0);
                 const name = isAr 
                    ? (item.nameAr || item.product?.nameAr || item.data?.nameAr || "منتج") 
                    : (item.nameEn || item.product?.nameEn || item.data?.nameEn || "Product");
                 
                 const image = item.image || item.product?.images?.[0] || item.product?.image || item.data?.image || 'https://via.placeholder.com/150';

                 return (
                  <div key={i} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-4 md:gap-6 items-center">
                    <img src={image} className="w-20 h-28 md:w-24 md:h-32 rounded-2xl md:rounded-3xl object-cover border border-gray-100 shrink-0" alt={name} />
                    <div className="flex-grow text-start min-w-0">
                      <h3 className="text-base md:text-xl font-black truncate">{name}</h3>
                      <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase mt-0.5 md:mt-1">{item.selectedSize || 'N/A'} • {item.selectedColor || 'N/A'}</p>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-3 md:mt-4">
                        <div className="flex bg-gray-50 rounded-xl p-0.5 md:p-1">
                          <button onClick={() => updateCartQuantity(i, Math.max(1, item.quantity - 1))} className="w-7 h-7 md:w-8 md:h-8 font-bold">-</button>
                          <span className="w-6 md:w-8 text-center font-black flex items-center justify-center text-xs md:text-sm">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(i, item.quantity + 1)} className="w-7 h-7 md:w-8 md:h-8 font-bold">+</button>
                        </div>
                        <button onClick={() => removeFromCart(i)} className="text-red-500 text-[9px] md:text-[10px] font-black uppercase hover:underline">{isAr ? 'إزالة' : 'Remove'}</button>
                      </div>
                    </div>
                    <div className="text-lg md:text-2xl font-black text-end shrink-0">{price * item.quantity} <span className="text-[10px] opacity-30">QAR</span></div>
                  </div>
                );
              })}
              {cart.length === 0 && (
                <div className="py-16 md:py-20 text-center bg-gray-50 rounded-3xl md:rounded-[3rem] border-2 border-dashed border-gray-200">
                    <ShoppingBagIcon size={40} className="md:w-12 md:h-12 mx-auto text-gray-200 mb-4" />
                    <p className="font-black text-[10px] md:text-sm text-gray-400 uppercase tracking-widest">{isAr ? 'سلتك فارغة' : 'Your cart is empty'}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-xl border border-gray-100 space-y-10 md:space-y-12 animate-in slide-in-from-bottom-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <User className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                  <input type="text" placeholder={t('fullName')} value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 p-4 md:p-5 ltr:pl-10 md:ltr:pl-12 rtl:pr-10 md:rtl:pr-12 rounded-2xl font-bold text-xs md:text-sm outline-none focus:ring-1 focus:ring-black text-start" />
                </div>
                <div className="relative">
                  <Phone className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                  <input type="tel" placeholder={t('mobileNumber')} value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 p-4 md:p-5 ltr:pl-10 md:ltr:pl-12 rtl:pr-10 md:rtl:pr-12 rounded-2xl font-bold text-xs md:text-sm outline-none focus:ring-1 focus:ring-black text-start" />
                </div>
                <div className="relative">
                  <Mail className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                  <input type="email" placeholder={t('emailAddress')} value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 p-4 md:p-5 ltr:pl-10 md:ltr:pl-12 rtl:pr-10 md:rtl:pr-12 rounded-2xl font-bold text-xs md:text-sm outline-none focus:ring-1 focus:ring-black text-start" />
                </div>
              </div>

              <div className="text-start">
                <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6">{isAr ? 'عنوان التوصيل' : 'Delivery Address'}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6">
                  {['Standalone', 'Compound', 'Flat', 'Tower'].map(type => (
                    <button key={type} onClick={()=>setHousingType(type as HousingType)} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 font-black text-[8px] md:text-[10px] uppercase transition-all ${housingType === type ? 'bg-black text-white border-black shadow-lg' : 'border-gray-100 hover:border-gray-200'}`}>{type}</button>
                  ))}
                </div>
                {renderAddressFields()}
              </div>

              <div className="text-start">
                <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6">{isAr ? 'طريقة الدفع' : 'Payment Method'}</h2>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <button onClick={()=>setPaymentMethod('Online')} className={`p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-2 md:gap-3 ${paymentMethod === 'Online' ? 'bg-black text-white border-black shadow-xl' : 'border-gray-100'}`}>
                    <CreditCard size={24} className="md:w-8 md:h-8" /><span className="text-[8px] md:text-[10px] font-black uppercase">{t('onlinePayment')}</span>
                  </button>
                  <button onClick={()=>setPaymentMethod('COD')} className={`p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-2 md:gap-3 ${paymentMethod === 'COD' ? 'bg-black text-white border-black shadow-xl' : 'border-gray-100'}`}>
                    <Banknote size={24} className="md:w-8 md:h-8" /><span className="text-[8px] md:text-[10px] font-black uppercase">{t('cod')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] shadow-2xl border border-gray-100 lg:sticky lg:top-32 text-start">
            <h3 className="text-xl md:text-2xl font-black mb-6 md:mb-8">{t('orderSummary')}</h3>
            <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
              <div className="flex justify-between font-bold text-gray-500 text-xs md:text-sm uppercase"><span>{t('subtotal')}</span><span>{subtotal} QAR</span></div>
              <div className="flex justify-between font-bold text-gray-500 text-xs md:text-sm uppercase"><span>{t('delivery')}</span><span>{deliveryFee === 0 ? t('free') : `${deliveryFee} QAR`}</span></div>
              
              {subtotal > 0 && subtotal < DELIVERY_THRESHOLD && (
                <p className="text-[8px] md:text-[10px] font-black text-red-600 uppercase tracking-tighter mt-1 md:mt-2 text-start">
                  {isAr ? `أضف بقيمة ${DELIVERY_THRESHOLD - subtotal} ريال إضافية للحصول على شحن مجاني!` : `ADD ${DELIVERY_THRESHOLD - subtotal} QAR FOR FREE DELIVERY!`}
                </p>
              )}

              <div className="pt-4 md:pt-6 border-t border-gray-100 flex justify-between items-baseline"><span className="font-black text-sm md:text-base uppercase">{t('total')}</span><span className="text-2xl md:text-4xl font-black">{totalQAR} QAR</span></div>
            </div>
            
            {step === 'cart' ? (
                 <button onClick={()=>setStep('details')} disabled={cart.length === 0} className="w-full bg-black text-white py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-base md:text-xl hover:scale-105 transition-all shadow-xl group flex items-center justify-center gap-2 md:gap-3 disabled:bg-gray-200">
                    {t('checkout')} <ArrowLeft size={18} className="md:w-5 md:h-5 ltr:rotate-180 rtl:rotate-0" />
                 </button>
            ) : paymentMethod === 'COD' ? (
                <button onClick={() => handleSaveOrder('COD')} disabled={loading} className="w-full bg-black text-white py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-base md:text-xl hover:scale-105 transition-all shadow-xl group flex items-center justify-center gap-2 md:gap-3 disabled:bg-gray-400">
                    {loading ? (isAr ? 'جاري التنفيذ...' : 'Processing...') : t('placeOrder')} 
                    <ArrowLeft size={18} className="md:w-5 md:h-5 ltr:rotate-180 rtl:rotate-0" />
                </button>
            ) : (
                <div className="w-full">
                    {(!formData.name || !formData.phone || !formData.email) ? (
                        <p className="text-center text-[8px] md:text-[10px] text-red-500 font-bold uppercase">{isAr ? 'أدخل البيانات لتفعيل الدفع' : 'Enter info to pay'}</p>
                    ) : (
                        <PayPalButtons 
                            forceReRender={[totalUSD]}
                            style={{ layout: "vertical", shape: "rect", color: 'black', label: 'pay' }}
                            createOrder={(data, actions) => {
                                return actions.order.create({
                                    purchase_units: [{ amount: { currency_code: "USD", value: totalUSD } }]
                                });
                            }}
                            onApprove={async (data, actions) => {
                                if (actions.order) {
                                    const details = await actions.order.capture();
                                    handleSaveOrder('Paid Online (PayPal)', details);
                                }
                            }}
                        />
                    )}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;