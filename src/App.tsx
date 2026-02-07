import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext.tsx';
import Layout from './Layout.tsx';
import Home from './Home.tsx';
import Shop from './Shop.tsx';
import Admin from './Admin.tsx';
import Checkout from './Checkout.tsx';
import ProductDetails from './ProductDetails.tsx';
import Policy from './Policy.tsx';
import Contact from './Contact.tsx';
import AIStudio from './AIStudio.tsx';
import Wishlist from './Wishlist.tsx';
import RecentlyViewed from './RecentlyViewed.tsx';
import AIChatbot from './AIChatbot.tsx';
import Auth from './Auth.tsx';

const AppContent: React.FC = () => {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  useEffect(() => {
    if (!user && currentPage !== 'admin' && currentPage !== 'auth') {
      setCurrentPage('auth');
    }
  }, [user, currentPage]);

  const navigateToProduct = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product-details');
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    if (!user && currentPage !== 'admin') {
      return <Auth onAdminAccess={() => setCurrentPage('admin')} />;
    }

    switch (currentPage) {
      case 'home': return <Home setPage={setCurrentPage} onCategoryClick={(cat) => { setSelectedCategory(cat); setCurrentPage('shop'); }} onProductClick={navigateToProduct} />;
      case 'shop': return <Shop initialCategory={selectedCategory} onProductClick={navigateToProduct} onBack={() => setCurrentPage('home')} />;
      case 'product-details': return <ProductDetails productId={selectedProductId} setPage={setCurrentPage} onBack={() => setCurrentPage('shop')} onProductClick={navigateToProduct} />;
      case 'cart': return <Checkout setPage={setCurrentPage} />;
      case 'admin': return <Admin onBack={() => setCurrentPage(user ? 'home' : 'auth')} onProductClick={navigateToProduct} />;
      case 'auth': return <Auth onAdminAccess={() => setCurrentPage('admin')} />;
      case 'wishlist': return <Wishlist onProductClick={navigateToProduct} onBack={() => setCurrentPage('home')} />;
      case 'recently-viewed': return <RecentlyViewed onProductClick={navigateToProduct} onBack={() => setCurrentPage('home')} />;
      case 'contact': return <Contact onBack={() => setCurrentPage('home')} />;
      case 'ai-stylist': return <AIStudio onBack={() => setCurrentPage('home')} />;
      case 'policy': return <Policy type={selectedPolicy} onBack={() => setCurrentPage('home')} />;
      default: return <Home setPage={setCurrentPage} onCategoryClick={() => {}} onProductClick={navigateToProduct} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      setPage={setCurrentPage} 
      onPolicyClick={(type) => { setSelectedPolicy(type); setCurrentPage('policy'); }}
      hideNav={currentPage === 'admin' && !user}
    >
      {renderPage()}
      {user && <AIChatbot />}
    </Layout>
  );
};

export default function App() {
  return <AppProvider><AppContent /></AppProvider>;
}
