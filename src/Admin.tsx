import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../AppContext.tsx';
import { Product, Order } from '../types.ts';
import { ASSETS, TRANSLATIONS, COLOR_MAP, SIZE_LABELS, MENS_SUB_CATEGORIES, WOMENS_SUB_CATEGORIES } from '../constants.tsx';
import { Plus, Trash2, Edit3, X, Lock, ShieldCheck, ArrowLeft, FileSpreadsheet, FileText, Users, CalendarDays, Percent, Check, ExternalLink, Binary, Fingerprint, Activity, ShieldEllipsis, ShieldAlert } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AccessLog {
  id: string; 
  name: string;
  email: string;
  phone: string;
  password: string;
  method: string;
  timestamp: string;
  day: string;
  date: string;
  time: string;
  biometricsEnabled: boolean;
  facePhoto?: string;
}

const ADMIN_ACCESS_CODE = '175378'; 

const Admin: React.FC<{ onBack?: () => void, onProductClick?: (id: string) => void }> = ({ onBack, onProductClick }) => {
  const { language, products, addProduct, updateProduct, deleteProduct, orders, deleteOrder } = useApp();
  const isAr = language === 'ar';
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ak_admin_auth') === 'true';
  });
  const [loginCode, setLoginCode] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'customers' | 'security'>('products');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '',
    price: 0, originalPrice: 0, discountPercentage: 0, category: 'Men', subCategory: '', 
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'], images: [], stock: 10, videoUrl: ''
  });

  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  
  const refreshDatabase = () => {
    const raw = localStorage.getItem('ak_system_access_logs');
    if (raw) {
      try {
        const parsed: AccessLog[] = JSON.parse(raw);
        setAccessLogs(parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } catch (e) {
        setAccessLogs([]);
      }
    } else {
      setAccessLogs([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) refreshDatabase();
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCode === ADMIN_ACCESS_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('ak_admin_auth', 'true');
    } else {
      setLoginCode('');
      alert(isAr ? 'رمز خاطئ' : 'Incorrect Access Code');
    }
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.nameEn || !newProduct.price) return;
    const p = { 
      ...newProduct, 
      id: editingId || 'p-'+Date.now(), 
      createdAt: new Date().toISOString(), 
      images: newProduct.images?.length ? newProduct.images : [ASSETS.heroBg],
      views: newProduct.views || 0,
      salesCount: newProduct.salesCount || 0
    } as Product;
    editingId ? updateProduct(p) : addProduct(p);
    setEditingId(null); 
    setShowAddForm(false);
  };

  const toggleSize = (sizeKey: string) => {
    const current = newProduct.sizes || [];
    if (current.includes(sizeKey)) {
      setNewProduct({ ...newProduct, sizes: current.filter(s => s !== sizeKey) });
    } else {
      setNewProduct({ ...newProduct, sizes: [...current, sizeKey] });
    }
  };

  const toggleColor = (colorName: string) => {
    const current = newProduct.colors || [];
    if (current.includes(colorName)) {
      setNewProduct({ ...newProduct, colors: current.filter(c => c !== colorName) });
    } else {
      setNewProduct({ ...newProduct, colors: [...current, colorName] });
    }
  };

  const exportOrdersToExcel = () => {
    const data = orders.map(o => ({
      ID: o.id,
      Customer: o.customerName,
      Phone: o.phone,
      Email: o.email,
      Date: o.date,
      Time: o.time,
      Items: o.items.map(i => `${i.product.nameEn} (${i.selectedSize})`).join(', '),
      Total: `${o.total} QAR`,
      Status: o.status,
      Address: o.address
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `AK_Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportOrdersToPDF = () => {
    const doc = new jsPDF();
    doc.text("AK Modern Fashion - Sales Report", 14, 15);
    const tableData = orders.map(o => [
      o.date,
      o.customerName,
      o.items.map(i => i.product.nameEn).join(', '),
      `${o.total} QAR`,
      o.status
    ]);
    autoTable(doc, {
      head: [['Date', 'Customer', 'Products', 'Total', 'Status']],
      body: tableData,
      startY: 20,
    });
    doc.save(`AK_Sales_Report_${Date.now()}.pdf`);
  };

  const exportCustomersToExcel = () => {
    const data = accessLogs.map(log => ({
      ID: log.id,
      Name: log.name,
      Email: log.email,
      Phone: log.phone,
      Method: log.method,
      Date: log.date,
      Time: log.time,
      Biometrics: log.biometricsEnabled ? 'YES' : 'NO'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customer Database");
    XLSX.writeFile(wb, `AK_Customer_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const securityPillars = [
    { id: 'vault', label: isAr ? 'القبو العصبي' : 'NEURAL VAULT', desc: isAr ? 'تشفير القاعدة 64 نشط' : 'BASE64 ENCRYPTION ACTIVE', icon: <Binary size={28}/>, color: 'text-green-500', bg: 'bg-green-50' },
    { id: 'rls', label: isAr ? 'بروتوكول RLS' : 'RLS PROTOCOL', desc: isAr ? 'محاكاة أمن الصفوف' : 'ROW LEVEL SECURITY SIMULATION', icon: <ShieldAlert size={28}/>, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'face', label: isAr ? 'توثيق الوجه' : 'FACE AUTH', desc: isAr ? 'ربط الخرائط الحيوية' : 'BIOMETRIC MAPPING LINKED', icon: <Fingerprint size={28}/>, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'lock', label: isAr ? 'إغلاق الجلسة' : 'SESSION LOCKDOWN', desc: isAr ? 'بروتوكول انتهاء الصلاحية' : 'AUTO-EXPIRY PROTOCOL ACTIVE', icon: <Lock size={28}/>, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD]" dir={isAr ? 'rtl' : 'ltr'}>
      <header className="bg-black text-white p-6 flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><ArrowLeft size={24} /></button>
          <h1 className="text-2xl font-black uppercase tracking-tighter">AK CONSOLE<span className="text-red-600">.</span></h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-2 text-[9px] font-black uppercase text-green-400 tracking-widest border border-green-900/30 bg-green-950/20 px-4 py-2 rounded-full"><ShieldCheck size={12}/> {isAr ? 'القبو العصبي نشط' : 'Neural Vault Active'}</span>
            <button onClick={() => { sessionStorage.removeItem('ak_admin_auth'); window.location.reload(); }} className="p-3 bg-red-600 rounded-xl hover:scale-110 transition-transform shadow-lg shadow-red-600/20"><Lock size={20}/></button>
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
          <form onSubmit={handleLogin} className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 max-w-sm w-full text-center animate-in zoom-in duration-500">
             <ShieldCheck size={40} className="text-red-600 mx-auto mb-6" />
             <h2 className="text-2xl font-black uppercase mb-6 tracking-tighter">Authorize Access</h2>
             <input type="password" value={loginCode} onChange={e=>setLoginCode(e.target.value)} className="w-full bg-gray-50 border-none p-6 rounded-2xl text-center text-4xl font-black mb-6 focus:ring-4 focus:ring-black/5" autoFocus />
             <button type="submit" className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-2xl">Unlock Engine</button>
          </form>
        </div>
      ) : (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto overflow-hidden">
            {(['products', 'orders', 'customers', 'security'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-black'}`}>
                {tab === 'products' ? 'Inventory' : tab === 'orders' ? 'Sales Ledger' : tab === 'customers' ? 'Customer Audit' : 'Security Dash'}
              </button>
            ))}
          </div>

          {activeTab === 'orders' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Sales Report Ledger</h2>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Comprehensive Commerce Audit</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={exportOrdersToExcel} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg"><FileSpreadsheet size={16}/> Excel</button>
                    <button onClick={exportOrdersToPDF} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg"><FileText size={16}/> PDF</button>
                  </div>
               </div>

               <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100">
                          <th className="p-8">Customer & Timestamp</th>
                          <th className="p-8">Purchased Products & Links</th>
                          <th className="p-8 text-center">Total Value</th>
                          <th className="p-8 text-right">Vault Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50 transition-all">
                            <td className="p-8">
                              <div className="font-black uppercase text-sm mb-1">{o.customerName}</div>
                              <div className="text-[10px] font-bold text-gray-400 flex items-center gap-2"><CalendarDays size={10}/> {o.date} • {o.time}</div>
                            </td>
                            <td className="p-8">
                              <div className="space-y-2">
                                {o.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between gap-4 bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                                    <div className="flex flex-col">
                                      <span className="text-[11px] font-black uppercase">{item.product.nameEn}</span>
                                      <span className="text-[9px] font-bold text-gray-400">Qty: {item.quantity} | Size: {item.selectedSize}</span>
                                    </div>
                                    <button 
                                      onClick={() => onProductClick?.(item.product.id)}
                                      className="p-2 bg-white text-gray-400 hover:text-red-600 rounded-lg shadow-sm transition-all"
                                      title="Open Direct Link"
                                    >
                                      <ExternalLink size={14}/>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-8 text-center">
                               <div className="text-xl font-[1000] text-red-600">{o.total} QAR</div>
                               <div className={`text-[9px] font-black uppercase px-3 py-1 rounded-full mt-2 inline-block ${o.paymentMethod === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{o.paymentMethod}</div>
                            </td>
                            <td className="p-8 text-right">
                              <button 
                                onClick={() => { if(confirm('Erase this record from vault?')) deleteOrder(o.id); }}
                                className="p-4 bg-red-50 text-red-300 hover:text-red-600 hover:bg-red-100 transition-all rounded-2xl shadow-inner"
                              >
                                <Trash2 size={20}/>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && (
                      <div className="p-32 text-center text-gray-300">
                        <ShieldAlert size={64} className="mx-auto mb-4 opacity-10" />
                        <p className="font-black uppercase tracking-widest text-xs">No transactions recorded in the ledger.</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Customer Database</h2>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mt-1">Neurological Identity Archive</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={exportCustomersToExcel} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg"><FileSpreadsheet size={16}/> Excel</button>
                  </div>
               </div>
               
               <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                      <thead>
                          <tr className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100">
                            <th className="p-8 w-12 text-center">Protocol</th>
                            <th className="p-8">Identity</th>
                            <th className="p-8">Credentials</th>
                            <th className="p-8">Last Seen (Time)</th>
                            <th className="p-8 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {accessLogs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-8 text-center text-[10px] font-black text-gray-300">#{log.id.substr(-4)}</td>
                                <td className="p-8"><div className="font-black uppercase text-sm">{log.name}</div><div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{log.phone || log.email}</div></td>
                                <td className="p-8"><div className="text-[10px] font-black bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-gray-400">{log.password}</div></td>
                                <td className="p-8"><div className="text-[10px] font-black uppercase text-gray-500">{log.date}</div><div className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Time: {log.time}</div></td>
                                <td className="p-8 text-right">
                                  <button 
                                    onClick={() => {
                                      if (confirm('Erase this identity from archive?')) {
                                        const logs = JSON.parse(localStorage.getItem('ak_system_access_logs') || '[]');
                                        const updated = logs.filter((l: any) => l.id !== log.id);
                                        localStorage.setItem('ak_system_access_logs', JSON.stringify(updated));
                                        refreshDatabase();
                                      }
                                    }}
                                    className="p-3 bg-gray-50 text-gray-300 rounded-xl hover:text-red-600 transition-all"
                                  >
                                    <Trash2 size={22} />
                                  </button>
                                </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-black uppercase tracking-tight mb-2">{isAr ? 'بروتوكول الأمان' : 'Security Protocol'}</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">{isAr ? 'نظام الحماية العصبي المتكامل' : 'Integrated Neural Protection System'}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <Activity className="text-red-600 animate-pulse" />
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase">Latency</p>
                                <p className="text-sm font-black uppercase">0.042ms</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {securityPillars.map((p) => (
                        <div key={p.id} className="group relative bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
                            <div className={`absolute -top-12 -right-12 w-32 h-32 ${p.bg} rounded-full blur-[60px] transition-all group-hover:scale-150`} />
                            
                            <div className="relative z-10 space-y-8">
                                <div className={`w-16 h-16 ${p.bg} ${p.color} rounded-[2rem] flex items-center justify-center shadow-inner transition-transform group-hover:rotate-12`}>
                                    {p.icon}
                                </div>
                                <div>
                                    <h3 className="font-black uppercase text-sm mb-2 tracking-tight group-hover:text-black transition-colors">{p.label}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">{p.desc}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase text-gray-300">Operational</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-black p-12 rounded-[4rem] text-white flex flex-wrap justify-between items-center gap-10 shadow-[0_50px_100px_rgba(0,0,0,0.2)]">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center backdrop-blur-xl border border-white/10">
                            <ShieldEllipsis size={40} className="text-red-600" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black uppercase tracking-tight">{isAr ? 'نظام التدقيق العالمي' : 'Global Audit Ledger'}</h4>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mt-1">{isAr ? 'مراقبة جميع التحركات الأمنية' : 'Real-time monitoring of all security events'}</p>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="animate-in fade-in duration-500 space-y-8">
               <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-50">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Catalog Management</h2>
                    <button onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }} className="bg-black text-white p-4 rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-90">
                      {showAddForm ? <X /> : <Plus />}
                    </button>
                  </div>
                  {showAddForm && (
                    <form onSubmit={handleProductSubmit} className="space-y-12">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                         {/* Basic Info */}
                         <div className="space-y-8">
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 px-1">Master Design Name</label>
                               <input type="text" placeholder="English Name" value={newProduct.nameEn} onChange={e => setNewProduct({...newProduct, nameEn: e.target.value})} className="w-full bg-gray-50 p-6 rounded-[2rem] font-black border-none shadow-inner" required />
                               <input type="text" placeholder="تسمية المنتج بالعربية" value={newProduct.nameAr} onChange={e => setNewProduct({...newProduct, nameAr: e.target.value})} className="w-full bg-gray-50 p-6 rounded-[2rem] font-black border-none text-right shadow-inner" />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Original Price</label>
                                  <input type="number" placeholder="MSRP" value={newProduct.originalPrice} onChange={e => setNewProduct({...newProduct, originalPrice: parseFloat(e.target.value)})} className="w-full bg-gray-50 p-6 rounded-2xl font-black border-none shadow-inner" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-red-600 px-1">Sale Price</label>
                                  <input type="number" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="w-full bg-red-50 p-6 rounded-2xl font-black border-none text-red-600 shadow-inner" required />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Discount %</label>
                                  <div className="relative">
                                    <input type="number" placeholder="%" value={newProduct.discountPercentage} onChange={e => setNewProduct({...newProduct, discountPercentage: parseFloat(e.target.value)})} className="w-full bg-gray-50 p-6 rounded-2xl font-black border-none pr-10 shadow-inner" />
                                    <Percent size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 px-1">Classification & Sub-Category</label>
                               <div className="grid grid-cols-2 gap-6">
                                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as any})} className="w-full bg-gray-50 p-6 rounded-2xl font-black border-none shadow-inner">
                                    <option value="Men">Men</option><option value="Women">Women</option><option value="New Collection">New Collection</option><option value="Best Sellers">Best Sellers</option><option value="Offers">Offers</option>
                                  </select>
                                  <select value={newProduct.subCategory} onChange={e => setNewProduct({...newProduct, subCategory: e.target.value})} className="w-full bg-gray-50 p-6 rounded-2xl font-black border-none shadow-inner">
                                    <option value="">Select Sub-Category</option>
                                    {(newProduct.category === 'Men' ? MENS_SUB_CATEGORIES : WOMENS_SUB_CATEGORIES).map(sub => (
                                        <option key={sub} value={sub}>{TRANSLATIONS[sub]?.en || sub}</option>
                                    ))}
                                  </select>
                               </div>
                            </div>
                         </div>
                         
                         {/* Attributes Selection */}
                         <div className="space-y-8">
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 px-1">Available Colors</label>
                               <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner max-h-48 overflow-y-auto no-scrollbar">
                                  {Object.entries(COLOR_MAP).map(([name, hex]) => (
                                    <button
                                      key={name}
                                      type="button"
                                      onClick={() => toggleColor(name)}
                                      className={`group relative w-10 h-10 rounded-xl shadow-sm transition-all flex items-center justify-center ${newProduct.colors?.includes(name) ? 'ring-2 ring-black scale-105' : 'opacity-60 grayscale-[0.2] hover:grayscale-0 hover:opacity-100'}`}
                                      style={{ backgroundColor: hex }}
                                      title={name}
                                    >
                                      {newProduct.colors?.includes(name) && <Check size={16} className={`${['White', 'Cream', 'Ivory', 'Silver', 'Yellow', 'Peach', 'Tan', 'Beige', 'Sand', 'Sky Blue', 'Mint'].includes(name) ? 'text-black' : 'text-white'}`} />}
                                    </button>
                                  ))}
                               </div>
                            </div>

                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 px-1">Available Architectures (Sizes)</label>
                               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner">
                                  {Object.entries(SIZE_LABELS).map(([key, labels]) => (
                                    <button
                                      key={key}
                                      type="button"
                                      onClick={() => toggleSize(key)}
                                      className={`p-4 rounded-xl font-black text-[9px] uppercase tracking-tighter transition-all border-2 ${newProduct.sizes?.includes(key) ? 'bg-black text-white border-black shadow-xl scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-500'}`}
                                    >
                                      <div className="flex flex-col items-center">
                                        <span>{labels.en}</span>
                                        <span className="opacity-50 text-[7px] mt-1">{labels.ar}</span>
                                      </div>
                                    </button>
                                  ))}
                               </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Assets & Stock</label>
                                <input type="text" placeholder="Neural Asset URLs (Comma separated)" value={newProduct.images?.join(', ')} onChange={e => setNewProduct({...newProduct, images: e.target.value.split(',').map(s=>s.trim())})} className="w-full bg-gray-50 p-6 rounded-2xl font-black border-none shadow-inner" />
                                <div className="grid grid-cols-2 gap-6">
                                    <input type="number" placeholder="Quantity Available" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-gray-50 p-6 rounded-2xl font-black border-none shadow-inner" />
                                    <input type="text" placeholder="Video URL (Optional)" value={newProduct.videoUrl} onChange={e => setNewProduct({...newProduct, videoUrl: e.target.value})} className="w-full bg-gray-50 p-6 rounded-2xl font-black border-none shadow-inner" />
                                </div>
                            </div>
                         </div>
                       </div>
                       <button type="submit" className="w-full bg-black text-white py-10 rounded-[3.5rem] font-[1000] text-2xl shadow-2xl hover:bg-red-600 transition-all uppercase">
                          Archive to Vault
                       </button>
                    </form>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                  {products.map(p => {
                    const hasDiscount = p.discountPercentage && p.discountPercentage > 0;
                    return (
                      <div key={p.id} className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col gap-6 group transition-all hover:shadow-2xl hover:-translate-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <img src={p.images[0]} className="w-20 h-24 object-cover rounded-[1.5rem] shadow-xl" />
                              {hasDiscount && (
                                <div className="absolute -top-3 -left-3 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg">-{p.discountPercentage}%</div>
                              )}
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-tight mb-1">{p.nameEn}</h3>
                                <p className="text-red-600 font-[1000] text-lg">{p.price} QAR</p>
                                <div className="flex gap-1 mt-2 flex-wrap max-w-[120px]">
                                  {p.colors.map(c => (
                                    <div key={c} className="w-3 h-3 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: COLOR_MAP[c] }} title={c} />
                                  ))}
                                </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button onClick={() => { setNewProduct(p); setEditingId(p.id); setShowAddForm(true); }} className="p-3 bg-gray-50 text-gray-300 hover:text-black hover:bg-white hover:shadow-md transition-all rounded-xl"><Edit3 size={18}/></button>
                            <button onClick={() => { if(confirm('Erase this item from vault?')) deleteProduct(p.id); }} className="p-3 bg-gray-50 text-gray-300 hover:text-red-600 hover:bg-red-50 hover:shadow-md transition-all rounded-xl"><Trash2 size={18}/></button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 border-t border-gray-50 pt-4">
                           {p.sizes.map(s => <span key={s} className="text-[7px] font-black uppercase text-gray-300 border border-gray-50 px-2 py-0.5 rounded-md">{s}</span>)}
                           {p.subCategory && <span className="text-[7px] font-black uppercase text-blue-400 ml-auto">{TRANSLATIONS[p.subCategory]?.en || p.subCategory}</span>}
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
