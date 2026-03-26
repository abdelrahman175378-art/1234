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
import Wishlist from './pages/Wishlist.tsx';
import RecentlyViewed from './pages/RecentlyViewed.tsx';
import AIChatbot from './components/AIChatbot.tsx';
import Auth from './pages/Auth.tsx';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

/**
 * AppContent Component: The central nervous system of AK Modern.
 * Handles global state routing, archival navigation, and deep-linking.
 */
const AppContent: React.FC = () => {
  const { user } = useApp();
  
  // Primary Navigation States
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  /**
   * targetSubCategory: This state acts as a neural bridge between the AI Chatbot
   * and the Shop interface to enable immediate deep-level filtration.
   */
  const [targetSubCategory, setTargetSubCategory] = useState<string | undefined>(undefined);

  /**
   * Security Protocol: Session guard to ensure unauthorized users remain at the portal.
   */
  useEffect(() => {
    if (!user && currentPage !== 'admin' && currentPage !== 'auth') {
      setCurrentPage('home');
    }
  }, [user, currentPage]);

  /**
   * navigateToProduct: Routes the interface to a specific archival entry.
   */
  const navigateToProduct = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product-details');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  /**
   * navigateToShop: The primary archival router with deep-link support.
   * @param category - The parent archival layer (Men/Women/All)
   * @param subCategory - The specific sub-filter key from constants.
   */
  const navigateToShop = (category: string = 'All', subCategory?: string) => {
    setSelectedCategory(category);
    setTargetSubCategory(subCategory); // Deep link injection
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  /**
   * navigateToPolicy: Redirects to archival compliance documents.
   */
  const navigateToPolicy = (type: string) => {
    setSelectedPolicy(type);
    setCurrentPage('policy');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  /**
   * renderPage: Logical switching for the archival views.
   */
  const renderPage = () => {
    // Authentication Wall
    if (!user && currentPage !== 'admin') {
      return <Auth onAdminAccess={() => setCurrentPage('admin')} />;
    }

    switch (currentPage) {
      case 'home':
        return (
          <Home 
            setPage={setCurrentPage} 
            onCategoryClick={navigateToShop} 
            onProductClick={navigateToProduct} 
          />
        );
      
      case 'shop':
        return (
          <Shop 
            initialCategory={selectedCategory} 
            initialSubCategory={targetSubCategory} // Pass deep-link to the archival list
            onProductClick={navigateToProduct} 
            onBack={() => {
              setCurrentPage('home');
              setTargetSubCategory(undefined); // Reset archival layer on exit
            }} 
          />
        );

      case 'product-details':
        return (
          <ProductDetails 
            productId={selectedProductId} 
            setPage={setCurrentPage} 
            onBack={() => setCurrentPage('shop')} 
            onProductClick={navigateToProduct} 
          />
        );

      case 'policy':
        return <Policy type={selectedPolicy} onBack={() => setCurrentPage('home')} />;

      case 'contact':
        return <Contact onBack={() => setCurrentPage('home')} />;

      case 'wishlist':
        return <Wishlist onProductClick={navigateToProduct} onBack={() => setCurrentPage('home')} />;

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

  /**
   * Root Viewport Implementation:
   * Wrapping the entire layout with a responsive guard to prevent horizontal bleeding
   * and ensure safe-area compatibility for mobile devices.
   */
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-white selection:bg-red-600 selection:text-white">
      <Layout
        currentPage={currentPage}
        setPage={(p) => {
          setCurrentPage(p);
          // Ensure archival layers are cleared when manually navigating through Layout
          if (p !== 'shop') {
            setSelectedCategory('All');
            setTargetSubCategory(undefined);
          }
          // Immediate viewport reset on page transition
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCategoryClick={navigateToShop}
        onPolicyClick={navigateToPolicy}
        hideNav={!user && currentPage === 'admin'}
      >
        {/* Main Application Content Area */}
        <div className="w-full max-w-[100vw] overflow-x-hidden px-0 sm:px-0">
          {renderPage()}
        </div>
        
        {/* AI Bot Initialization with Deep Navigation Linkage */}
        {user && (
          <AIChatbot 
            onProductNavigate={navigateToProduct} 
            onBrowseNavigate={(cat, sub) => navigateToShop(cat, sub)} 
          />
        )}
      </Layout>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <PayPalScriptProvider options={{
        "client-id": "Ae64JzImBbTzvulTcRgokuu87ZZHUcUeCLLr6F0aD_44LlwMwSOHSNt0GBZwjduhbvVMT9fIEoOncR8I",
        currency: "USD",
        intent: "capture",
        components: "buttons"
      }}>
        {/* The entire ecosystem is contained within the PayPal Neural Provider */}
        <AppContent />
      </PayPalScriptProvider>
    </AppProvider>
  );
};

export default App;