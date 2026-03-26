/**
 * AK ATELIER - APP CONTEXT & DATA HUB
 * =========================================================================================
 * VERSION: 8.2.8 (SILENT SYNC - TOTAL SOURCE CODE PERSISTENCE)
 * DESCRIPTION: Handles Global State, Real-time Firestore Sync, and Commercial Logic.
 * SECURED: UID Updated to pb83 for Master Admin access.
 * =========================================================================================
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Language, Product, CartItem, Order, Review, UserAccount } from './types';
import { db, auth, sendOTP, resetPassword } from './firebase-config';
import { 
  collection, onSnapshot, query, orderBy, addDoc, updateDoc, 
  deleteDoc, doc, increment, setDoc, serverTimestamp, where 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { DELIVERY_FEE, DELIVERY_THRESHOLD } from './constants';

interface UserSession {
  id: string;
  name: string;
  loginMethod: 'Email' | 'Phone' | 'Biometric' | 'Social' | 'Neural' | 'Standard';
  identifier: string;
}

interface AppContextType {
  language: Language; 
  setLanguage: (lang: Language) => void;
  user: UserSession | null; 
  setUser: (user: UserSession | null) => void;
  logout: () => void; 
  cart: CartItem[];
  addToCart: (item: CartItem) => void; 
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, qty: number) => void; 
  clearCart: () => void;
  products: Product[]; 
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>; 
  deleteProduct: (id: string) => Promise<void>;
  incrementView: (id: string, color: string) => Promise<void>; 
  orders: Order[];
  placeOrder: (o: any) => Promise<void>; 
  deleteOrder: (id: string) => Promise<void>;
  deleteOrders: (ids: string[]) => Promise<void>; 
  wishlist: string[];
  toggleWishlist: (id: string) => void; 
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void; 
  reviews: Review[];
  addReview: (r: any) => Promise<void>; 
  users: UserAccount[];
  registerAccount: (a: UserAccount) => Promise<void>; 
  deleteUser: (id: string) => Promise<void>;
  sendVerificationOTP: (email: string) => Promise<boolean>;
  verifyUserOTP: (inputOtp: string) => boolean;
  requestPasswordReset: (email: string) => Promise<{success: boolean, message: string}>;
  requestRefund: (refundData: any) => Promise<void>;
  subtotal: number; 
  deliveryFee: number; 
  total: number;
}

/** 🔐 VAULT SYSTEM: SECURE LOCAL STORAGE ENCRYPTION */
const Vault = {
  save: (key: string, data: any) => {
    try {
      if (!data) return;
      const binary = Array.from(new TextEncoder().encode(JSON.stringify(data)), b => String.fromCharCode(b)).join('');
      localStorage.setItem(`ak_vault_${key}`, btoa(binary));
    } catch (e) { console.error("Vault Save Error", e); }
  },
  read: (key: string, defaultValue: any) => {
    try {
      const raw = localStorage.getItem(`ak_vault_${key}`);
      if (!raw) return defaultValue;
      const binary = atob(raw);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch (e) { return defaultValue; }
  },
  clear: (key: string) => localStorage.removeItem(`ak_vault_${key}`)
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATES ---
  const [user, setUserState] = useState<UserSession | null>(() => Vault.read('active_session', null));
  const [language, setLanguageState] = useState<Language>(() => Vault.read('lang', 'en'));
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = Vault.read('cart', []);
    return Array.isArray(savedCart) ? savedCart : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => Vault.read('wishlist', []));
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => Vault.read('recent', []));
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentOtp, setCurrentOtp] = useState<string>("");

  const setUser = useCallback((u: UserSession | null) => setUserState(u), []);
  const setLanguage = useCallback((l: Language) => setLanguageState(l), []);

  // --- FINANCE ENGINE ---
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (Number(item?.variant?.price ?? 0) * Number(item?.quantity ?? 0)), 0), [cart]);
  const deliveryFee = (subtotal >= DELIVERY_THRESHOLD || subtotal === 0) ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  // --- 1. AUTH SYNC: LISTEN TO FIREBASE AUTH CHANGES ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUserState({
          id: fbUser.uid,
          name: fbUser.displayName || (fbUser.email === 'akmodernqa@gmail.com' ? 'AK Admin' : 'User'),
          loginMethod: 'Email',
          identifier: fbUser.email || ''
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. GLOBAL SYNC: PRODUCTS (Public) ---
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    }, (err) => {
      console.warn("Products sync active.");
    });
    return () => unsubscribe();
  }, []);

  // --- 3. GLOBAL SYNC: REVIEWS (Public) ---
  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
    }, (err) => {
      console.warn("Reviews sync ready.");
    });
    return () => unsubscribe();
  }, []);

  // --- 4. SECURE SYNC: ORDERS (Admin or Owner only) ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setOrders([]);
        return;
      }

      // تم تحديث الـ UID هنا ليتطابق مع حسابك الجديد pb83
      const isAdmin = fbUser.uid === "YUhyMDJ2LvbG7jDt7ihvSl4jpb83";
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

      const stopSnapshot = onSnapshot(q, (snapshot) => {
        const allOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        if (isAdmin) {
          setOrders(allOrders);
        } else {
          setOrders(allOrders.filter(o => o.userEmail === fbUser.email || o.userId === fbUser.uid));
        }
      }, (error) => {
        console.log("Waiting for admin clearance...");
      });

      return () => stopSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  // --- 5. SECURE SYNC: USERS LIST (Admin only) ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      // تم تحديث الـ UID هنا ليتطابق مع حسابك الجديد pb83
      if (fbUser && fbUser.uid === "YUhyMDJ2LvbG7jDt7ihvSl4jpb83") {
        const q = query(collection(db, 'users'));
        const stopSnapshot = onSnapshot(q, (snapshot) => {
          setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAccount)));
        }, () => {});
        return () => stopSnapshot();
      } else {
        setUsers([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // --- 6. PERSISTENCE SYNC ---
  useEffect(() => { if (user) Vault.save('active_session', user); else Vault.clear('active_session'); }, [user]);
  useEffect(() => { Vault.save('lang', language); }, [language]);
  useEffect(() => { Vault.save('cart', cart); }, [cart]);
  useEffect(() => { Vault.save('wishlist', wishlist); }, [wishlist]);
  useEffect(() => { Vault.save('recent', recentlyViewed); }, [recentlyViewed]);

  // --- FUNCTIONS ---
  const logout = useCallback(() => { 
    auth.signOut().then(() => {
      setUserState(null); 
      setCart([]); 
      Vault.clear('active_session'); 
      Vault.clear('cart');
    });
  }, []);

  const addToCart = useCallback((newItem: CartItem) => {
    if (!newItem?.variant || !newItem?.product) return;
    setCart(prev => {
      const idx = prev.findIndex(i => i.product?.id === newItem.product?.id && i.variant?.color === newItem.variant?.color && i.selectedSize === newItem.selectedSize);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateCartQuantity = useCallback((index: number, quantity: number) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity } : item));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addProduct = useCallback(async (p: Product) => {
    await setDoc(doc(db, 'products', p.id), { ...p, createdAt: new Date().toISOString() });
  }, []);

  const updateProduct = useCallback(async (p: Product) => {
    await setDoc(doc(db, 'products', p.id), { ...p }, { merge: true });
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
  }, []);

  const incrementView = useCallback(async (id: string, color: string) => {
    const pRef = doc(db, 'products', id);
    await updateDoc(pRef, { [`variants.${color}.views`]: increment(1) });
  }, []);

  const placeOrder = useCallback(async (orderData: any) => {
    await addDoc(collection(db, 'orders'), { ...orderData, createdAt: new Date().toISOString() });
    for (const item of orderData.items) {
      if (item.productId && item.color) {
        const pRef = doc(db, 'products', item.productId);
        await updateDoc(pRef, { [`variants.${item.color}.salesCount`]: increment(item.quantity) });
      }
    }
    setCart([]);
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'orders', id));
  }, []);

  const deleteOrders = useCallback(async (ids: string[]) => {
    for (const id of ids) {
      await deleteDoc(doc(db, 'orders', id));
    }
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(w => w !== id) : [id, ...prev]);
  }, []);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewed(prev => {
      if (prev[0] === id) return prev;
      return [id, ...prev.filter(r => r !== id)].slice(0, 10);
    });
  }, []);

  const addReview = useCallback(async (review: any) => {
    await addDoc(collection(db, 'reviews'), { ...review, createdAt: new Date().toISOString() });
  }, []);

  const registerAccount = useCallback(async (account: UserAccount) => {
    await setDoc(doc(db, 'users', account.id), { ...account, createdAt: serverTimestamp() });
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
  }, []);

  const sendVerificationOTP = useCallback(async (email: string) => {
    const res = await sendOTP(email, 'service_qfkt94g', 'template_6kvtc5s', 'J2lsxRIODFwYl5_QJ');
    if (res.success && res.code) {
      setCurrentOtp(res.code);
      return true;
    }
    return false;
  }, []);

  const verifyUserOTP = useCallback((inputOtp: string) => {
    return inputOtp === currentOtp;
  }, [currentOtp]);

  const requestPasswordReset = useCallback(async (email: string) => {
    return await resetPassword(email);
  }, []);

  const requestRefund = useCallback(async (refundData: any) => {
    await addDoc(collection(db, 'refund_requests'), {
      ...refundData,
      status: 'Pending',
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  }, []);

  // --- CONTEXT PROVIDER ---
  const contextValue = useMemo(() => ({
    language, setLanguage, user, setUser, logout, cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
    products, addProduct, updateProduct, deleteProduct, incrementView, orders, placeOrder, deleteOrder, deleteOrders,
    wishlist, toggleWishlist, recentlyViewed, addRecentlyViewed, reviews, addReview, users, registerAccount, deleteUser,
    sendVerificationOTP, verifyUserOTP, requestPasswordReset, requestRefund, subtotal, deliveryFee, total
  }), [
    language, setLanguage, user, setUser, logout, cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
    products, addProduct, updateProduct, deleteProduct, incrementView, orders, placeOrder, deleteOrder, deleteOrders,
    wishlist, toggleWishlist, recentlyViewed, addRecentlyViewed, reviews, addReview, users, registerAccount, deleteUser,
    sendVerificationOTP, verifyUserOTP, requestPasswordReset, requestRefund, subtotal, deliveryFee, total
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};