import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext.tsx';
import { Product } from './types.ts';
import { ASSETS, TRANSLATIONS, COLOR_MAP, SIZE_LABELS, MENS_SUB_CATEGORIES, WOMENS_SUB_CATEGORIES } from './constants.tsx';
import { Plus, Trash2, Edit3, X, Lock, ShieldCheck, ArrowLeft, FileSpreadsheet, FileText, Check, Percent } from 'lucide-react';
import * as XLSX from 'xlsx';

const ADMIN_ACCESS_CODE = '175378'; 

const Admin: React.FC<{ onBack?: () => void, onProductClick?: (id: string) => void }> = ({ onBack, onProductClick }) => {
  const { language, products, addProduct, updateProduct, deleteProduct, orders } = useApp();
  const isAr = language === 'ar';
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('ak_admin_auth') === 'true');
  const [loginCode, setLoginCode] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCode === ADMIN_ACCESS_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('ak_admin_auth', 'true');
    } else { alert(isAr ? 'رمز خاطئ' : 'Incorrect Code'); }
  };

  return (
    <div className="min-h-screen bg-white" dir={isAr ? 'rtl' : 'ltr'}>
      {!isAuthenticated ? (
        <div className="flex items-center justify-center h-screen">
          <form onSubmit={handleLogin} className="p-12 shadow-2xl rounded-3xl text-center">
            <h2 className="text-2xl font-black mb-6">AK ADMIN</h2>
            <input type="password" value={loginCode} onChange={e=>setLoginCode(e.target.value)} className="bg-gray-100 p-4 rounded-xl text-center text-2xl font-black w-full" />
            <button className="w-full bg-black text-white py-4 mt-4 rounded-xl font-bold">Unlock</button>
          </form>
        </div>
      ) : (
        <div className="p-8">
          <button onClick={onBack} className="mb-8 flex items-center gap-2 font-bold"><ArrowLeft/> Back</button>
          <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveTab('products')} className={`px-6 py-2 rounded-xl font-bold ${activeTab === 'products' ? 'bg-black text-white' : 'bg-gray-100'}`}>Products</button>
            <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-xl font-bold ${activeTab === 'orders' ? 'bg-black text-white' : 'bg-gray-100'}`}>Orders</button>
          </div>
          {/* محتوى لوحة التحكم يكمل هنا... */}
          <h1 className="text-3xl font-black">Console Active</h1>
        </div>
      )}
    </div>
  );
};
export default Admin;
