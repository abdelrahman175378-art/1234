
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext.tsx';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import Shop from './pages/Shop.tsx';
import Admin from './pages/Admin.tsx';
import Checkout from './pages/Checkout.tsx';
import ProductDetails from './pages/ProductDetails.tsx';
import Policy from './pages/Policy.tsx';
import Contact from './pages/Contact.tsx';
import AIStudio from './pages/AIStudio.tsx';
import Wishlist from './pages/Wishlist.tsx';
import RecentlyViewed from './pages/RecentlyViewed.tsx';
import AIChatbot from './components/AIChatbot.tsx';
import Auth from './pages/Auth.tsx';
import { Product } from './types.ts';

const AppContent: React.FC = () => {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [aiFittingProduct, setAiFittingProduct] = useState<Product | null>(null);
  const [aiFittingImage, setAiFittingImage] = useState<string | null>(null);
  const [aiFittingColor, setAiFittingColor] = useState<string | null>(null);

  // If user logs out, reset the page to home which will trigger Auth via the check below
  useEffect(() => {
    if (!user && currentPage !== 'admin' && currentPage !== 'auth') {
      setCurrentPage('home');
    }
  }, [user]);

  const navigateToProduct = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product-details');
    window.scrollTo(0, 0);
  };

  const navigateToShop = (category: string = 'All') => {
    setSelectedCategory(category);
    setCurrentPage('shop');
    window.scrollTo(0, 0);
  };

  const navigateToPolicy = (type: string) => {
    setSelectedPolicy(type);
    setCurrentPage('policy');
    window.scrollTo(0, 0);
  };

  const openFittingRoom = (product: Product, specificImage?: string, color?: string) => {
    setAiFittingProduct(product);
    setAiFittingImage(specificImage || product.images[0]);
    setAiFittingColor(color || null);
    setCurrentPage('ai-stylist');
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    // If no user and not doing admin things, show Auth
    if (!user && currentPage !== 'admin') {
      return <Auth onAdminAccess={() => setCurrentPage('admin')} />;
    }

    switch (currentPage) {
      case 'home': 
        return <Home setPage={setCurrentPage} onCategoryClick={navigateToShop} onProductClick={navigateToProduct} />;
      case 'shop': 
        return <Shop initialCategory={selectedCategory} onProductClick={navigateToProduct} onBack={() => setCurrentPage('home')} />;
      case 'product-details':
        return <ProductDetails productId={selectedProductId} setPage={setCurrentPage} onBack={() => setCurrentPage('shop')} onTryOn={openFittingRoom} onProductClick={navigateToProduct} />;
      case 'policy':
        return <Policy type={selectedPolicy} onBack={() => setCurrentPage('home')} />;
      case 'contact':
        return <Contact onBack={() => setCurrentPage('home')} />;
      case 'ai-stylist':
        return (
          <AIStudio 
            preselectedProduct={aiFittingProduct} 
            preselectedImage={aiFittingImage}
            preselectedColor={aiFittingColor}
            onClearPreselected={() => { setAiFittingProduct(null); setAiFittingImage(null); setAiFittingColor(null); }} 
            onBack={() => setCurrentPage('home')} 
          />
        );
      case 'wishlist':
        return <Wishlist onProductClick={navigateToProduct} onBack={() => setCurrentPage('home')} onTryOn={openFittingRoom} />;
      case 'recently-viewed':
        return <RecentlyViewed onProductClick={navigateToProduct} onBack={() => setCurrentPage('home')} />;
      case 'cart': 
        return <Checkout setPage={setCurrentPage} />;
      case 'admin': 
        return <Admin onBack={() => setCurrentPage(user ? 'home' : 'auth')} onProductClick={navigateToProduct} />;
      case 'auth':
        return <Auth onAdminAccess={() => setCurrentPage('admin')} />;
      default: 
        return <Home setPage={setCurrentPage} onCategoryClick={navigateToShop} onProductClick={navigateToProduct} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      setPage={(p) => { setCurrentPage(p); if (p !== 'shop') setSelectedCategory('All'); }}
      onCategoryClick={navigateToShop}
      onPolicyClick={navigateToPolicy}
      hideNav={!user && currentPage === 'admin'}
    >
      {renderPage()}
      {user && <AIChatbot onProductNavigate={navigateToProduct} />}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
