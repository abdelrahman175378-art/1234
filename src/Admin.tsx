import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext.tsx';
import { Product } from './types.ts';
import { COLOR_MAP, SIZE_LABELS } from './constants.tsx';
import { Plus, Trash2, Edit3, X, Lock, ShieldCheck, FileSpreadsheet, Percent, Check } from 'lucide-react';
import * as XLSX from 'xlsx';

const ADMIN_ACCESS_CODE = '175378'; 

const Admin: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { language, products, addProduct, orders, deleteOrder } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('ak_admin_auth') === 'true');
  const [loginCode, setLoginCode] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const isAr = language === 'ar';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCode === ADMIN_ACCESS_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('ak_admin_auth', 'true');
    } else { alert(isAr ? 'خطأ' : 'Error'); }
  };

  const exportOrders = () => {
    const ws = XLSX.utils.json_to_sheet(orders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, "AK_Report.xlsx");
  };

  if (!isAuthenticated) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleLogin} className="bg-white p-12 rounded-[3rem] shadow-2xl text-center w-full max-w-sm border border-gray-100">
        <ShieldCheck size={48} className="mx-auto text-red-600 mb-6" />
        <input type="password" value={loginCode} onChange={e=>setLoginCode(e.target.value)} className="w-full bg-gray-50 p-6 rounded-2xl text-center text-3xl font-black mb-6" placeholder="0000" autoFocus />
        <button className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase">Unlock</button>
      </form>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
        <h2 className="text-3xl font-black uppercase">AK Console.</h2>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('products')} className={`px-8 py-3 rounded-xl font-bold ${activeTab === 'products' ? 'bg-black text-white' : 'bg-gray-100'}`}>Inventory</button>
          <button onClick={() => setActiveTab('orders')} className={`px-8 py-3 rounded-xl font-bold ${activeTab === 'orders' ? 'bg-black text-white' : 'bg-gray-100'}`}>Orders</button>
          <button onClick={onBack} className="p-3 bg-red-50 text-red-600 rounded-xl"><X/></button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <button onClick={exportOrders} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg"><FileSpreadsheet size={20}/> Export Excel</button>
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400">
                <tr><th className="p-6">Customer</th><th className="p-6">Total</th><th className="p-6">Action</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-gray-50">
                    <td className="p-6 font-bold">{o.customerName}</td>
                    <td className="p-6 text-red-600 font-black">{o.total} QAR</td>
                    <td className="p-6"><button onClick={() => deleteOrder(o.id)} className="text-red-300 hover:text-red-600"><Trash2 size={20}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default Admin;
