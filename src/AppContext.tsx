import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Product, CartItem, Order, Review } from './types';

interface User {
  id: string;
  name: string;
  loginMethod: 'Email' | 'Phone' | 'Biometric';
  identifier: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, qty: number) => void;
  clearCart: () => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  incrementView: (id: string) => void;
  orders: Order[];
  placeOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  deleteOrders: (ids: string[]) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  reviews: Review[];
  addReview: (review: Review) => void;
}

// Robust Neural Vault - Uses TextEncoder/Decoder for full UTF-8 (Arabic) support
const Vault = {
  save: (key: string, data: any) => {
    try {
      const str = JSON.stringify(data);
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
      const encrypted = btoa(binary);
      localStorage.setItem(`ak_vault_${key}`, encrypted);
    } catch (e) {
      console.error("Vault Write Error:", e);
    }
  },
  read: (key: string, defaultValue: any) => {
    try {
      const raw = localStorage.getItem(`ak_vault_${key}`);
      if (!raw) return defaultValue;
      const binary = atob(raw);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(bytes));
    } catch (e) {
      return defaultValue;
    }
  },
  clear: (key: string) => {
    localStorage.removeItem(`ak_vault_${key}`);
  }
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'm1',
    nameEn: 'Premium Black Sweatshirt',
    nameAr: 'سويت شيرت أسود فاخر',
    descriptionEn: 'High-quality cotton blend sweatshirt with a modern fit.',
    descriptionAr: 'سويت شيرت قطني عالي الجودة بمقاس عصري.',
    price: 349,
    category: 'Men',
    subCategory: 'mensSweatshirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Grey'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
    ],
    videoUrl: 'https://v.ftcdn.net/02/76/94/28/700_F_276942839_z0YfJ07WpG2j3mX9j9KjSjRz7zZzZzZz_ST.mp4',
    views: 1240,
    salesCount: 156,
    stock: 12,
    createdAt: new Date().toISOString()
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => Vault.read('active_session', null));
  const [language, setLanguage] = useState<Language>(() => Vault.read('lang', 'en'));
  const [products, setProducts] = useState<Product[]>(() => Vault.read('products', INITIAL_PRODUCTS));
  const [cart, setCart] = useState<CartItem[]>(() => Vault.read('cart', []));
  const [orders, setOrders] = useState<Order[]>(() => Vault.read('orders', []));
  const [wishlist, setWishlist] = useState<string[]>(() => Vault.read('wishlist', []));
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => Vault.read('recent', []));
  const [reviews, setReviews] = useState<Review[]>(() => Vault.read('reviews', []));

  useEffect(() => {
    if (user) Vault.save('active_session', user);
    else Vault.clear('active_session');
  }, [user]);

  useEffect(() => Vault.save('lang', language), [language]);
  useEffect(() => Vault.save('products', products), [products]);
  useEffect(() => Vault.save('cart', cart), [cart]);
  useEffect(() => Vault.save('orders', orders), [orders]);
  useEffect(() => Vault.save('wishlist', wishlist), [wishlist]);
  useEffect(() => Vault.save('recent', recentlyViewed), [recentlyViewed]);
  useEffect(() => Vault.save('reviews', reviews), [reviews]);

  const logout = () => {
    setUser(null);
    setCart([]);
    Vault.clear('active_session');
    Vault.clear('cart');
  };

  const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
  const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));
  const updateCartQuantity = (index: number, qty: number) => 
    setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));
  const clearCart = () => setCart([]);

  const addProduct = (product: Product) => 
    setProducts(prev => [{ ...product, views: 0, salesCount: 0, stock: product.stock || 10, createdAt: new Date().toISOString() }, ...prev]);

  const updateProduct = (updatedProduct: Product) => 
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
  
  const incrementView = (id: string) => 
    setProducts(prev => prev.map(p => id === p.id ? { ...p, views: (p.views || 0) + 1 } : p));

  const placeOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setProducts(prev => prev.map(p => {
      const orderItem = order.items.find(item => item.product.id === p.id);
      if (orderItem) {
        return { 
          ...p, 
          salesCount: (p.salesCount || 0) + orderItem.quantity,
          stock: Math.max(0, p.stock - orderItem.quantity)
        };
      }
      return p;
    }));
    clearCart();
  };

  const deleteOrder = (id: string) => setOrders(prev => prev.filter(o => o.id !== id));
  const deleteOrders = (ids: string[]) => {
    const idSet = new Set(ids);
    setOrders(prev => prev.filter(o => !idSet.has(o.id)));
  };

  const toggleWishlist = (id: string) => 
    setWishlist(prev => prev.includes(id) ? prev.filter(wid => wid !== id) : [id, ...prev]);

  const addRecentlyViewed = (id: string) => 
    setRecentlyViewed(prev => [id, ...prev.filter(rid => rid !== id)].slice(0, 10));

  const addReview = (review: Review) => setReviews(prev => [review, ...prev]);

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      user, setUser, logout,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      products, addProduct, updateProduct, deleteProduct, incrementView,
      orders, placeOrder, deleteOrder, deleteOrders,
      wishlist, toggleWishlist,
      recentlyViewed, addRecentlyViewed,
      reviews, addReview
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
