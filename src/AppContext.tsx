import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order } from './types.ts';

interface AppContextType {
  language: 'en' | 'ar'; setLanguage: (l: 'en' | 'ar') => void;
  user: any; setUser: (u: any) => void;
  products: Product[]; addProduct: (p: Product) => void;
  cart: CartItem[]; addToCart: (i: CartItem) => void; removeFromCart: (idx: number) => void;
  wishlist: string[]; toggleWishlist: (id: string) => void;
  orders: Order[]; placeOrder: (o: Order) => void; deleteOrder: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (item: CartItem) => setCart([...cart, item]);
  const removeFromCart = (idx: number) => setCart(cart.filter((_, i) => i !== idx));
  const toggleWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const addProduct = (p: Product) => setProducts([p, ...products]);
  const placeOrder = (o: Order) => { setOrders([o, ...orders]); setCart([]); };
  const deleteOrder = (id: string) => setOrders(orders.filter(o => o.id !== id));

  return (
    <AppContext.Provider value={{ language, setLanguage, user, setUser, products, addProduct, cart, addToCart, removeFromCart, wishlist, toggleWishlist, orders, placeOrder, deleteOrder }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp Error');
  return context;
};
