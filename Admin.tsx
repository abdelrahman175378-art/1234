/**
 * 🔗 ATELIER CONSOLE - NEURAL MAINFRAME v6.7.3 (FINAL SECURE SYNC)
 * DEVELOPED BY: AK ATELIER GLOBAL OPERATIONS UNIT
 * SECURITY: FIREBASE AUTH QUANTUM SHIELD ACTIVE
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '../AppContext.tsx';
import { Product, UserAccount, Order, ProductVariant } from '../types.ts';
import { 
  COLOR_MAP, TRANSLATIONS, MENS_SUB_CATEGORIES_CONFIG, 
  WOMENS_SUB_CATEGORIES_CONFIG, SIZE_LABELS 
} from '../constants.tsx';

// --- ICONS REGISTRY (FIXED DUPLICATION) ---
import { 
  Plus, Trash2, Edit3, X, Lock, ShieldCheck, ArrowLeft, ArrowRight, ShoppingBag, Users, 
  Activity, Cpu, Zap, Terminal, Percent, Database, FileSpreadsheet, 
  FileText, Download, UserPlus, Eye, Sparkles, ChevronLeft, ChevronRight, 
  ImageIcon, Layers, Upload, Image as LucideImage, TrendingUp, Calendar, 
  CreditCard, ExternalLink, Package, Filter, CheckCircle, MapPin, Check, 
  Video, Link as LinkIcon, FileImage, Trash, PlusCircle, User, Key, Clock, Smartphone, Mail,
  Scan, BarChart3, TrendingDown, Trophy, AlertTriangle, ArrowUpRight, PieChart, DollarSign, Save,
  RotateCcw, Globe, Server, HardDrive, Settings, Search, Monitor, MousePointer2, Briefcase, Award,
  ZapOff, Clock3, History, Fingerprint, ShieldAlert, Boxes, BarChart, Activity as ActivityIcon,
  Layout, List, Gauge, ClipboardCheck, Users2, ShoppingCart, Info, HelpCircle, LogOut,
  Bell, BellRing, Command, Code, Radio, Shield, Zap as ZapIcon, Maximize2, Minimize2, RefreshCw,
  MoreVertical, Share2, CornerUpRight, MousePointerSquareDashed, MousePointerClick, Tag, Gift,
  Rocket, Lightbulb, Compass, Target, Bookmark, Layers2, MonitorSmartphone, ServerCrash, 
  LockKeyhole, UserCog, DatabaseBackup, Network, TerminalSquare, FlaskConical, Binary, Bot, Truck,
  CheckCircle2, AlertOctagon, History as HistoryIcon, UserCheck, Languages, MessageCircle, AtSign, 
  Radar, Loader2, ChevronDown, ShieldQuestion, ChevronUp, ScanLine, FingerprintIcon, 
  TargetIcon, ShieldEllipsis, PackageCheck, TruckIcon, BoxSelect, CpuIcon, ActivitySquare, 
  Dna, Fingerprint as BiometricIcon, LayoutGrid, TerminalSquare as CommandIcon, History as LogIcon,
  Archive, Briefcase as BizIcon, HardDrive as StorageIcon, MonitorCheck, LayoutPanelTop, 
  Zap as PowerIcon, Activity as PulseIcon, ShieldCheck as SecureIcon, Box as PackageIcon, 
  ClipboardList, AlertCircle, FileDigit, ImageOff, MonitorPlay, Database as RegistryIcon
} from 'lucide-react';

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- FIREBASE IMPORTS ---
import { db, auth } from '../firebase-config'; 
import { 
  collection, query, where, getDocs, addDoc, 
  serverTimestamp, orderBy, updateDoc, doc, onSnapshot, limit,
  Timestamp, getDoc, setDoc, increment
} from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

import { uploadToCloudinary } from '../utils/cloudinary';

const ULTIMATE_COLOR_REGISTRY: { [key: string]: string } = {
  "Pure White": "#FFFFFF", "Ghost White": "#F8F8FF", "White Smoke": "#F5F5F5", "Snow": "#FFFAFA",
  "Floral White": "#FFFAF0", "Alice Blue": "#F0F8FF", "Azure": "#F0FFFF", "Mint Cream": "#F5FFFA",
  "Ivory": "#FFFFF0", "Linen": "#FAF0E6", "Old Lace": "#FDF5E6", "Sea Shell": "#FFF5EE",
  "Beige": "#F5F5DC", "Cornsilk": "#FFF8DC", "Antique White": "#FAEBD7", "Blanched Almond": "#FFEBCD",
  "Papaya Whip": "#FFEFD5", "Moccasin": "#FFE4B5", "Bisque": "#FFE4C4", "Navajo White": "#FFDEAD",
  "Peach Puff": "#FFDAB9", "Mist Rose": "#FFE4E1", "Lavender Blush": "#FFF0F5", "Light Yellow": "#FFFFE0",
  "Lemon Chiffon": "#FFFACD", "Light Goldenrod Yellow": "#FAFAD2", "Light Cyan": "#E0FFFF", "Pale Goldenrod": "#EEE8AA",
  "Wheat": "#F5DEB3", "Gainsboro": "#DCDCDC", "Light Gray": "#D3D3D3", "Silver": "#C0C0C0",
  "Pink": "#FFC0CB", "Light Pink": "#FFB6C1", "Powder Blue": "#B0E0E6", "Light Blue": "#ADD8E6",
  "Sky Blue": "#87CEEB", "Light Sky Blue": "#87CEFA", "Pale Turquoise": "#AFEEEE", "Aquamarine": "#7FFFD4",
  "Light Green": "#90EE90", "Pale Green": "#98FB98", "Khaki": "#F0E68C", "Gold": "#FFD700",
  "Yellow": "#FFFF00", "Orange": "#FFA500", "Dark Orange": "#FF8C00", "Coral": "#FF7F50",
  "Light Salmon": "#FFA07A", "Salmon": "#FA8072", "Light Coral": "#F08080", "Hot Pink": "#FF69B4",
  "Deep Pink": "#FF1493", "Tomato": "#FF6347", "Orange Red": "#FF4500", "Red": "#FF0000",
  "Crimson": "#DC143C", "Fire Brick": "#B22222", "Dark Red": "#8B0000", "Maroon": "#800000",
  "Brown": "#A52A2A", "Sienna": "#A0522D", "Saddle Brown": "#8B4513", "Chocolate": "#D2691E",
  "Peru": "#CD853F", "Sandy Brown": "#F4A460", "Burly Wood": "#DEB887", "Tan": "#D2B48C",
  "Rosy Brown": "#BC8F8F", "Indian Red": "#CD5C5C", "Pale Violet Red": "#DB7093", "Violet": "#EE82EE",
  "Orchid": "#DA70D6", "Fuchsia": "#FF00FF", "Magenta": "#FF00FF", "Medium Orchid": "#BA55D3",
  "Medium Purple": "#9370DB", "Blue Violet": "#8A2BE2", "Dark Violet": "#9400D3", "Dark Orchid": "#9932CC",
  "Dark Magenta": "#8B008B", "Purple": "#800080", "Indigo": "#4B0082", "Slate Blue": "#6A5ACD",
  "Dark Slate Blue": "#483D8B", "Medium Slate Blue": "#7B68EE", "Royal Blue": "#4169E1", "Blue": "#0000FF",
  "Medium Blue": "#0000CD", "Dark Blue": "#00008B", "Navy": "#000080", "Midnight Blue": "#191970",
  "Dodger Blue": "#1E90FF", "Deep Sky Blue": "#00BFFF", "Cornflower Blue": "#6495ED", "Steel Blue": "#4682B4",
  "Cadet Blue": "#5F9EA0", "Medium Turquoise": "#48D1CC", "Turquoise": "#40E0D0", "Dark Turquoise": "#00CED1",
  "Cyan": "#00FFFF", "Aqua": "#00FFFF", "Teal": "#008080", "Dark Cyan": "#008B8B",
  "Dark Slate Gray": "#2F4F4F", "Dark Green": "#006400", "Green": "#008000", "Forest Green": "#228B22",
  "Sea Green": "#2E8B57", "Medium Sea Green": "#3CB371", "Spring Green": "#00FF7F", "Medium Spring Green": "#00FA9A",
  "Lime Green": "#32CD32", "Lime": "#00FF00", "Yellow Green": "#9ACD32", "Chartreuse": "#7FFF00",
  "Lawn Green": "#7CFC00", "Green Yellow": "#ADFF2F", "Olive Drab": "#6B8E23", "Olive": "#808000",
  "Dark Olive Green": "#556B2F", "Dark Khaki": "#BDB76B", "Goldenrod": "#DAA520", "Dark Goldenrod": "#B8860B",
  "Gray": "#808080", "Dark Gray": "#A9A9A9", "Dim Gray": "#696969", "Slate Gray": "#708090",
  "Light Slate Gray": "#778899", "Black": "#000000", "Charcoal": "#36454F", "Gunmetal": "#2A3439",
  "Oil": "#0C0C0C", "Midnight": "#2C3E50", "Obsidian": "#0B0B0B", "Ink": "#070707",
  "Coffee": "#6F4E37", "Burnt Orange": "#CC5500", "Burgundy": "#800020", "Bordeaux": "#4C1C24",
  "Plum": "#DDA0DD", "Thistle": "#D8BFD8", "Lavender": "#E6E6FA", "Misty Rose": "#FFE4E1",
  "Slate Blue Medium": "#7B68EE", "Cornflower": "#6495ED", "Dark Slate Blue Deep": "#483D8B", "Midnight Navy": "#000040",
  "Forest": "#0B3D17", "Army Green": "#4B5320", "Emerald": "#50C878", "Jade": "#00A86B",
  "Teal Dark": "#004040", "Ocean": "#0077BE", "Sapphire": "#0F52BA", "Cobalt": "#0047AB",
  "Deep Space Sparkle": "#4A646C", "Gunmetal Grey": "#2A3439", "Vantablack": "#010101", "Void": "#000000"
};

const getColorWeight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b);
};

// --- FALLBACK ASSET (SVG) ---
const LOCAL_NULL_IMG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDIwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNGMUYxRjEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0QxRDFEMSIgc3R5bGU9ImZvbnQtZmFtaWx5OiAnVGFqYXdhbCcsIHNhbnMtc2VyaWY7IGZvbnQtd2VpZ2h0OiBib2xkOyBmb250LXNpemU6IDE0cHg7Ij5BSyBSRUdJU1RSWV9OVUxMPC90ZXh0Pjwvc3ZnPg==";

const Admin: React.FC<{ onBack?: () => void, onProductClick?: (id: string) => void }> = ({ onBack, onProductClick }) => {
  const { 
    language, products, addProduct, updateProduct, deleteProduct, 
    users, deleteUser, orders, deleteOrder 
  } = useApp();
  
  const isAr = language === 'ar';
  const labelClass = "text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1.5 block px-1 italic leading-none";
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- SECURE AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'users' | 'sales' | 'metrics' | 'refunds'>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Changed to true for mobile default
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [masterId, setMasterId] = useState('');
  const [outfitIds, setOutfitIds] = useState<string[]>([]);
  const [variants, setVariants] = useState<{ [color: string]: ProductVariant }>({});
  const [activeVariantColor, setActiveVariantColor] = useState<string | null>(null);
  const [colorSearch, setColorSearch] = useState('');

  const [orderStatusUpdates, setOrderStatusUpdates] = useState<{ [orderId: string]: { status: string, eta: number } }>({});
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const [refundRequests, setRefundRequests] = useState<any[]>([]);
  const [refundStatusUpdates, setRefundStatusUpdates] = useState<{ [id: string]: string }>({});
  const [systemLogs, setSystemLogs] = useState<{msg: string, time: string, type: 'info' | 'warn' | 'success'}[]>([]);

  const addLog = useCallback((msg: string, type: 'info' | 'warn' | 'success' = 'info') => {
      setSystemLogs(prev => [{msg, time: new Date().toLocaleTimeString(), type}, ...prev.slice(0, 12)]);
  }, []);

  // --- LIVE AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.uid === "YUhyMDJ2LvbG7jDt7ihvSl4jpb83") {
        setIsAuthenticated(true);
        addLog("Neural Link Established: Master Root Verified", "success");
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, [addLog]);

  useEffect(() => {
    if (isAuthenticated) {
      const q = query(collection(db, "refund_requests"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setRefundRequests(snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, adminEmail.trim(), adminPassword);
      addLog("Master Identity Synchronized", "success");
    } catch (error: any) {
      console.error("LOGIN FAIL:", error.code);
      addLog(`Unauthorized entry: ${error.code}`, "warn");
      setAuthError(`PROTOCOL ERROR: ${error.code.split('/')[1]?.toUpperCase().replace(/-/g, '_') || 'UNAUTHORIZED'}`);
      if (error.code === 'auth/wrong-password') alert("Wrong Access Key!");
      else if (error.code === 'auth/user-not-found') alert("Admin Identity Not Registered!");
      else alert(`Firebase System Error: ${error.code}`);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      addLog("Mainframe Connection Terminated", "info");
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProductsList = useMemo(() => {
    return products.filter(p => {
        const v = Object.values(p.variants || {})[0];
        const matchText = p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (v?.nameEn || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = activeFilter === 'All' || v?.category === activeFilter;
        return matchText && matchCat;
    });
  }, [products, searchTerm, activeFilter]);

  const chromaticMatrix = useMemo(() => {
    return Object.entries(ULTIMATE_COLOR_REGISTRY)
        .filter(([name]) => name.toLowerCase().includes(colorSearch.toLowerCase()))
        .sort((a, b) => getColorWeight(b[1]) - getColorWeight(a[1])); 
  }, [colorSearch]);

  const handleUpdateOrderStatus = async (orderId: string) => {
    const update = orderStatusUpdates[orderId];
    if (!update) return;

    setStatusLoading(orderId);
    addLog(`Initiating document handshake for: ${orderId}`, "info");

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where("id", "==", orderId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        addLog(`Protocol Error: Archive packet ${orderId} not found in registry.`, "warn");
        alert("System Error: Order node not found in database.");
        return;
      }

      const targetDoc = querySnapshot.docs[0];
      const targetDocRef = doc(db, 'orders', targetDoc.id);

      await updateDoc(targetDocRef, {
        status: update.status,
        estimatedDeliveryDays: Number(update.eta),
        lastModified: serverTimestamp(),
        fulfillmentProtocol: 'v6.7.3-Quantum-Sync'
      });
      
      addLog(`Status committed for ${orderId}: ${update.status}`, "success");
      alert(`NEURAL SYNC COMPLETE: Packet #${orderId.slice(-6)} set to ${update.status}.`);
    } catch (error) {
      console.error("Firebase Handshake Failure:", error);
      addLog("CRITICAL: Sync handshake rejected by database", "warn");
      alert("System Error: Handshake rejected by database registry.");
    } finally {
      setStatusLoading(null);
    }
  };

  const handleUpdateRefundStatus = async (docId: string, newStatus: string) => {
    setStatusLoading(docId);
    addLog(`Calibrating claim status node: ${docId}`, "info");
    try {
      const refDoc = doc(db, 'refund_requests', docId);
      await updateDoc(refDoc, { 
        status: newStatus, 
        lastModified: serverTimestamp(),
        handledBy: 'AK_ADMIN_CORE'
      });
      addLog(`Claim node status confirmed: ${newStatus}`, "success");
      alert(`PROTOCOL STATUS: Claim node ${docId.slice(-6)} calibrated to ${newStatus}.`);
    } catch (e) {
      addLog("Claim synchronization handshake failure", "warn");
    } finally {
      setStatusLoading(null);
    }
  };

  const handleLocalStatusChange = (orderId: string, field: 'status' | 'eta', value: any) => {
      const current = orderStatusUpdates[orderId] || { status: 'Processing', eta: 3 };
      setOrderStatusUpdates({
          ...orderStatusUpdates,
          [orderId]: { ...current, [field]: value }
      });
  };

  const getOrderItemImage = (item: any) => {
    if (item.product?.images?.[0]) return item.product.images[0];
    
    const product = products.find(p => p.id === item.productId);
    if (product) {
       const variant = product.variants?.[item.color];
       if (variant && variant.images?.[0]) return variant.images[0];
       const firstVar = Object.values(product.variants || {})[0];
       if (firstVar && firstVar.images?.[0]) return firstVar.images[0];
    }
    return LOCAL_NULL_IMG;
  };

  const updateActiveVariantData = (field: keyof ProductVariant, value: any) => {
    if (!activeVariantColor) return;
    setVariants(prev => ({
        ...prev,
        [activeVariantColor]: {
            ...prev[activeVariantColor],
            [field]: value
        }
    }));
  };

  const handleInitiateVariantConfiguration = (colorName: string) => {
    setActiveVariantColor(colorName);
    if (!variants[colorName]) {
        setVariants(prev => ({
            ...prev,
            [colorName]: {
                color: colorName, nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '',
                price: 0, originalPrice: 0, stock: 0, category: 'Men', subCategory: '',
                images: [], sizes: [], videoUrl: '', views: 0, salesCount: 0, discountPercentage: 0
            }
        }));
    }
  };

  const handleVariantMediaStream = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && activeVariantColor) {
      addLog(`Buffering visual nodes...`, "info");
      const readers = Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const base64Results = await Promise.all(readers);
      const existing = [...(variants[activeVariantColor]?.images || [])];
      setVariants({
        ...variants,
        [activeVariantColor]: { ...variants[activeVariantColor], images: [...existing, ...base64Results] }
      });
      addLog(`Neural stream updated for ${activeVariantColor}`, "success");
    }
  };

  const commitMasterRegistrySync = async () => {
    if (!masterId || Object.keys(variants).length === 0) {
      alert("Missing Master Identity Node.");
      return;
    }

    setIsSaving(true);
    addLog("Synchronizing matrix across Cloudinary...", "info");
    
    try {
      const finalVariants: { [color: string]: ProductVariant } = {};

      for (const [color, data] of Object.entries(variants)) {
        addLog(`Pushing node: ${color}...`, "info");
        const uploadedUrls = await Promise.all(
          (data.images || []).map(async (img) => {
            if (img.startsWith('data:')) return await uploadToCloudinary(img);
            return img; 
          })
        );
        
        finalVariants[color] = {
          ...data,
          images: uploadedUrls.filter(u => u !== null) as string[],
          discountPercentage: data.originalPrice > data.price 
            ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100) 
            : 0
        };
      }

      const productNode: Product = {
        id: masterId,
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
        variants: finalVariants,
        outfitRecommendationIds: outfitIds
      };

      if (editingProduct) await updateProduct(productNode);
      else await addProduct(productNode);

      setShowForm(false);
      setEditingProduct(null);
      setVariants({});
      setActiveVariantColor(null);
      addLog(`Master Node ${masterId} synchronized`, "success");
      alert("MAINFRAME STATUS: Registry Update Success.");

    } catch (error) {
      addLog("MAINFRAME SYNC FAILURE", "warn");
      alert("Sync Rejected by database.");
    } finally {
      setIsSaving(false);
    }
  };

  const activeUsersCount = useMemo(() => users.length, [users]);
  const revenueFlow = useMemo(() => orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0), [orders]);
  const totalEngagementViews = useMemo(() => products.reduce((acc, p) => acc + Object.values(p.variants || {}).reduce((vAcc, v) => vAcc + (v.views || 0), 0), 0), [products]);
  const stockAssetValue = useMemo(() => products.reduce((acc, p) => acc + Object.values(p.variants || {}).reduce((vAcc, v) => vAcc + ((v.price || 0) * (v.stock || 0)), 0), 0), [products]);
  const commercialEfficiency = useMemo(() => totalEngagementViews > 0 ? ((orders.length / totalEngagementViews) * 100).toFixed(2) : '0', [orders, totalEngagementViews]);
  const depletionAlerts = useMemo(() => products.flatMap(p => Object.values(p.variants || {}).filter(v => (v.stock || 0) < 5).map(v => ({ mid: p.id, ...v }))), [products]);

  const exportCommercialExcel = () => {
    addLog("Extracting Excel node...", "info");
    const data = orders.flatMap(o => o.items.map(i => ({
        'ARCHIVE_ID': o.id, 'PERSONA': o.customerName, 'PHONE': o.phone, 
        'ASSET': i.variant?.nameEn, 'VALUATION': o.total, 'STATUS': o.status, 'DATE': o.date
    })));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Commercial_Sync");
    XLSX.writeFile(wb, `AK_Registry_Log_${Date.now()}.xlsx`);
  };

  const exportCommercialPDF = () => {
    addLog("Compiling PDF neural report...", "info");
    const doc = new jsPDF('l');
    doc.setFontSize(22);
    doc.text("AK ATELIER - COMMERCIAL INTELLIGENCE STREAM", 14, 20);
    const rows = orders.map(o => [o.id.slice(-10).toUpperCase(), o.date, o.customerName, o.total, o.paymentMethod, o.status]);
    autoTable(doc as any, {
      startY: 32,
      head: [['HASH', 'STAMP', 'PERSONA', 'CAPITAL', 'PROTOCOL', 'STATUS']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }
    });
    doc.save(`AK_Neural_Archive_Report_${Date.now()}.pdf`);
  };

  // --- SECURED GATEWAY UI ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white text-center">
          <div className="max-w-md w-full space-y-12 animate-in zoom-in-95 duration-1000">
              <div className="space-y-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-red-600 rounded-3xl md:rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(220,38,38,0.4)] animate-pulse">
                      <Lock size={35} className="md:w-[45px] md:h-[45px] text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">Mainframe<br/><span className="text-red-600">Access.</span></h1>
                  <p className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] md:tracking-[0.5em] italic">Secure Biometric Gateway v6.7.3</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative group shadow-2xl">
                      <Mail className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors" size={18} />
                      <input 
                        type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="ADMIN IDENTIFIER..." 
                        className="w-full bg-zinc-900/50 border-2 border-white/5 p-4 md:p-5 pl-12 md:pl-16 rounded-xl md:rounded-2xl font-black text-xs md:text-sm tracking-widest focus:border-red-600 focus:bg-black transition-all outline-none italic"
                        required
                      />
                  </div>
                  <div className="relative group shadow-2xl">
                      <Key className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors" size={18}/>
                      <input 
                        type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="SECURE ACCESS KEY..." 
                        className="w-full bg-zinc-900/50 border-2 border-white/5 p-4 md:p-5 pl-12 md:pl-16 rounded-xl md:rounded-2xl font-black text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] focus:border-red-600 focus:bg-black transition-all outline-none italic"
                        required
                      />
                  </div>
                  {authError && <p className="text-red-600 text-[8px] md:text-[10px] font-black italic animate-bounce">{authError}</p>}
                  <button disabled={loginLoading} type="submit" className="w-full bg-red-600 text-white py-5 md:py-6 rounded-xl md:rounded-2xl font-black text-lg md:text-xl uppercase tracking-widest shadow-xl hover:bg-red-700 active:scale-95 transition-all italic flex items-center justify-center gap-4 md:gap-6 group disabled:opacity-50">
                      {loginLoading ? <Loader2 className="animate-spin" size={24}/> : <>Initialize <ArrowRight size={26}/></>}
                  </button>
              </form>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row overflow-hidden font-sans text-start selection:bg-red-600 selection:text-white">
      
      {/* Sidebar - Desktop Only or Drawer toggle on mobile */}
      <aside className={`${sidebarCollapsed ? 'hidden md:flex md:w-[75px]' : 'md:w-[260px]'} bg-black h-screen flex flex-col transition-all duration-300 relative z-[500] shadow-[15px_0_50px_rgba(0,0,0,0.5)]`}>
          <div className="p-5 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0 shadow-xl group cursor-pointer active:scale-90 transition-all">
                  <ZapIcon size={20} className="text-white fill-current group-hover:scale-110 transition-transform duration-500" />
              </div>
              {!sidebarCollapsed && (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-500 text-start leading-none">
                      <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none italic">Atelier<span className="text-red-600">.</span></h2>
                      <p className="text-[8px] font-black text-red-600 uppercase tracking-widest mt-1 italic">ELITE CONSOLE 6.7</p>
                  </div>
              )}
          </div>

          <nav className="flex-grow px-2 space-y-1.5 text-start">
              {[
                { id: 'dashboard', label: 'Command Hub', icon: <Layout size={20}/> },
                { id: 'inventory', label: 'Inventory Matrix', icon: <Boxes size={20}/> },
                { id: 'sales', label: 'Sales Archive', icon: <HistoryIcon size={20}/> },
                { id: 'refunds', label: 'Refund Protocols', icon: <RotateCcw size={20}/> },
                { id: 'users', label: 'Persona Vault', icon: <UserCheck size={20}/> },
                { id: 'metrics', label: 'Neural Insights', icon: <BarChart size={20}/> }
              ].map(item => (
                <button 
                    key={item.id} onClick={() => setActiveTab(item.id as any)} 
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative ${activeTab === item.id ? 'bg-white text-black shadow-xl scale-102' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                >
                    <div className={`${activeTab === item.id ? 'text-red-600' : 'text-zinc-700 group-hover:text-red-500'} transition-colors`}>
                        {item.icon}
                    </div>
                    {!sidebarCollapsed && <span className="font-black text-[12px] uppercase tracking-wider italic leading-none">{item.label}</span>}
                    {activeTab === item.id && !sidebarCollapsed && <div className="ml-auto w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_5px_#dc2626]" />}
                </button>
              ))}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-4 text-start">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 text-zinc-600 hover:text-rose-600 transition-all font-black text-[11px] uppercase italic group active:scale-95 leading-none"
              >
                  <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/>
                  {!sidebarCollapsed && <span>TERMINATE SESSION</span>}
              </button>
          </div>
          
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-12 bg-black rounded-r-xl flex items-center justify-center text-white/20 hover:text-white transition-all shadow-xl z-[600]">
              {sidebarCollapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
          </button>
      </aside>

      <main className="flex-grow h-screen overflow-y-auto custom-scrollbar flex flex-col relative bg-[#F8FAFC] pb-24 md:pb-0">
          
          <header className="sticky top-0 z-[400] bg-[#F8FAFC]/90 backdrop-blur-xl px-4 md:px-8 py-3 md:py-4 flex justify-between items-center border-b border-zinc-100 shadow-sm">
              <div className="flex items-center gap-3 md:gap-6 text-start min-w-0">
                  <button onClick={onBack} className="p-2 md:p-2.5 bg-white rounded-lg md:rounded-xl shadow-md hover:bg-black hover:text-white transition-all border border-zinc-50 group active:scale-90 shrink-0"><ArrowLeft size={16} className="md:w-[18px] md:h-[18px] group-hover:-translate-x-1 transition-transform"/></button>
                  <div className="truncate">
                      <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight leading-none italic text-black truncate">{activeTab} Hub</h1>
                      <div className="flex items-center gap-2 mt-1 md:mt-1.5 text-start">
                          <span className="text-[7px] md:text-[9px] font-black text-zinc-400 uppercase tracking-widest italic leading-none">SYSTEM_NODE: ONLINE</span>
                          <div className="hidden sm:block h-1 w-12 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-red-600 w-[80%] shadow-[0_0_5px_#dc2626]" /></div>
                      </div>
                  </div>
              </div>

              <div className="flex items-center gap-2 md:gap-8">
                  <div className="hidden lg:flex items-center gap-3 bg-zinc-100 px-4 py-2.5 rounded-full border border-transparent focus-within:border-black/5 focus-within:bg-white transition-all group w-64 md:w-80 shadow-inner">
                      <Search size={14} className="text-zinc-300 group-focus-within:text-black transition-colors" />
                      <input 
                        type="text" placeholder="QUERY ARCHIVAL NODES..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none font-black text-[10px] w-full placeholder:text-zinc-300 placeholder:uppercase italic tracking-wider text-black" 
                      />
                  </div>

                  <div className="flex items-center gap-2 md:gap-5">
                      <div className="flex gap-1.5 md:gap-2 bg-white p-1 rounded-full border border-zinc-50 shadow-md">
                        <button className="p-1.5 md:p-2 hover:bg-zinc-50 rounded-full text-zinc-300 hover:text-black relative transition-all active:scale-90 group">
                          <Bell size={18} className="group-hover:rotate-12 transition-transform md:w-5 md:h-5" />
                          <div className="absolute top-1 right-1 w-1 md:w-1.5 h-1 md:h-1.5 bg-red-600 rounded-full border-2 border-white shadow-md animate-bounce" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-5 border-l-2 border-zinc-100 text-start leading-none shrink-0">
                          <div className="text-right hidden sm:block">
                              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-tighter leading-none italic text-black">Abdelrahman</p>
                              <p className="text-[7px] md:text-[8px] font-bold text-emerald-500 uppercase flex items-center justify-end gap-1 mt-1 italic">ACTIVE_ROOT</p>
                          </div>
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-[10px] md:text-xs shadow-xl border-2 md:border-4 border-white group cursor-pointer hover:rotate-[360deg] transition-all duration-1000 italic">AK</div>
                      </div>
                  </div>
              </div>
          </header>

          <div className="p-4 md:p-8 pb-32">
              
              {activeTab === 'dashboard' && (
                  <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 text-start">
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 text-start">
                          {[
                            { label: 'LIQUIDITY', val: `${revenueFlow.toLocaleString()} QAR`, icon: <DollarSign size={18}/>, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { label: 'SYNAPSE', val: totalEngagementViews.toLocaleString(), icon: <Eye size={18}/>, color: 'text-sky-500', bg: 'bg-sky-50' },
                            { label: 'MATRIX', val: `${commercialEfficiency}%`, icon: <Zap size={18}/>, color: 'text-amber-500', bg: 'bg-amber-50' },
                            { label: 'PERSONAS', val: activeUsersCount, icon: <UserCheck size={18}/>, color: 'text-violet-500', bg: 'bg-violet-50' }
                          ].map((stat, i) => (
                            <div key={i} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-zinc-100 text-start transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-3 md:mb-6">
                                    <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${stat.bg} ${stat.color} shadow-inner`}>{stat.icon}</div>
                                    <span className="hidden md:inline-block text-[8px] font-black px-2 py-1 bg-zinc-50 rounded-full border border-zinc-100 italic tracking-widest uppercase text-black">NODE_ACTIVE</span>
                                </div>
                                <div className="text-start leading-none min-w-0">
                                    <p className="text-[7px] md:text-[10px] font-black text-zinc-400 uppercase md:tracking-[0.2em] mb-1 italic leading-none truncate">{stat.label}</p>
                                    <h3 className="text-sm md:text-xl font-black tracking-tighter italic text-black leading-none mt-1 md:mt-1.5 truncate">{stat.val}</h3>
                                </div>
                            </div>
                          ))}
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10 text-start">
                          <div className="xl:col-span-2 space-y-6 md:space-y-10 text-start">
                              <div className="bg-zinc-950 text-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group text-start">
                                  <div className="absolute right-[-10px] top-[-10px] md:right-[-20px] md:top-[-20px] opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Terminal size={120} className="md:w-[180px] md:h-[180px]"/></div>
                                  <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center text-start">
                                      <div className="flex-grow text-start leading-none">
                                          <h2 className="text-xl md:text-2xl font-black uppercase mb-2 md:mb-3 italic flex items-center gap-3 md:gap-4 leading-none"><Cpu size={24} className="text-red-600 animate-spin-slow md:w-8 md:h-8" /> Neural Interface</h2>
                                          <p className="text-[9px] md:text-[12px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed max-w-2xl italic text-start">MONITORING COMMERCIAL VELOCITY, CHROMATIC ASSET DEPLOYMENT, AND IDENTITY INTEGRITY ACROSS ALL REGIONALS.</p>
                                      </div>
                                      <div className="flex gap-3 shrink-0 w-full md:w-auto text-start">
                                          <button onClick={() => { setEditingProduct(null); setMasterId('AK-' + Date.now()); setVariants({}); setShowForm(true); }} className="flex-1 md:flex-none px-6 py-3 bg-white text-black rounded-xl font-black text-[10px] md:text-[12px] uppercase italic shadow-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3 leading-none shadow-white/5">
                                             <PlusCircle size={18}/> GENESIS
                                          </button>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-zinc-100 min-h-[400px] flex flex-col relative text-start">
                                  <div className="flex justify-between items-center mb-6 md:mb-8 px-1 md:px-2 text-start leading-none">
                                      <h3 className="text-base md:text-lg font-black uppercase italic flex items-center gap-2 md:gap-4 tracking-tight text-black leading-none"><History size={20} className="text-red-600 md:w-6 md:h-6" /> Order Matrix</h3>
                                      <div className="flex items-center gap-2 md:gap-3 bg-zinc-50 px-2.5 py-1.5 rounded-full border border-zinc-100 shadow-inner leading-none">
                                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                                          <span className="text-[8px] md:text-[9px] font-black text-black uppercase tracking-widest italic leading-none">QUANTUM_FLOW</span>
                                      </div>
                                  </div>
                                  
                                  <div className="flex-grow space-y-2.5 overflow-y-auto no-scrollbar custom-scrollbar pr-1 text-start leading-none">
                                      {orders.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale py-12 leading-none"><Server size={60} className="mb-4"/><p className="font-black text-xl uppercase tracking-widest italic">ARCHIVE_NULL</p></div>
                                      ) : orders.slice(0, 15).map((order_item) => (
                                          <div key={order_item.id} className="flex items-center gap-3 md:gap-5 p-3 md:p-4 bg-zinc-50 rounded-xl md:rounded-2xl border-l-4 border-l-black transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1 group/row text-start shadow-sm leading-none shrink-0">
                                              <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-900 rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-sm md:text-lg italic shadow-xl group-hover/row:rotate-[360deg] transition-all duration-700 leading-none shrink-0">{order_item.customerName?.charAt(0).toUpperCase()}</div>
                                              <div className="flex-grow text-start min-w-0">
                                                  <div className="flex justify-between items-center text-start leading-none">
                                                      <p className="font-black text-xs md:text-[13px] uppercase italic text-black group-hover/row-sale:text-red-600 transition-colors leading-none tracking-tight truncate pr-2">{order_item.customerName}</p>
                                                      <span className="font-black text-sm md:text-lg text-black shrink-0">{order_item.total} <span className="text-[7px] md:text-[8px] opacity-20 italic uppercase leading-none">QAR</span></span>
                                                  </div>
                                                  <div className="flex items-center gap-2 md:gap-4 mt-1.5 md:mt-2 text-[7px] md:text-[9px] font-black text-zinc-400 uppercase tracking-widest italic leading-none text-start truncate">
                                                      <span className="flex items-center gap-1.5"><Fingerprint size={12} className="md:w-3.5 md:h-3.5"/> #{order_item.id.slice(-8).toUpperCase()}</span>
                                                      <span className="w-1 h-1 bg-zinc-200 rounded-full shrink-0" />
                                                      <span className="flex items-center gap-1.5 text-zinc-300 truncate"><Calendar size={12} className="md:w-3.5 md:h-3.5"/> {order_item.date}</span>
                                                  </div>
                                              </div>
                                              <div className="hidden sm:inline-block px-3 py-1.5 bg-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-zinc-100 shadow-sm italic text-zinc-900 leading-none shrink-0">{order_item.status}</div>
                                          </div>
                                      ))}
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-end text-start">
                                      <button onClick={() => setActiveTab('sales')} className="text-[9px] md:text-[11px] font-black text-black hover:text-red-600 transition-all uppercase tracking-widest flex items-center gap-2 md:gap-3 group/btn-all italic leading-none">Full Archive Matrix Access <ArrowRight size={16} className="group-hover/btn-all:translate-x-1.5 transition-transform"/></button>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-6 md:space-y-10 text-start">
                                <div className="bg-black text-white p-5 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-2xl relative overflow-hidden text-start group/alert-panel text-start shadow-black/60 border border-white/5 leading-none min-h-[300px]">
                                    <div className="absolute right-[-10%] top-[-10%] opacity-5 group-hover:opacity-10 transition-opacity"><Shield size={100} className="md:w-[120px] md:h-[120px]"/></div>
                                    <h3 className="text-base md:text-lg font-black uppercase mb-6 md:mb-8 flex items-center gap-3 md:gap-4 italic relative z-10 text-white leading-none"><ShieldAlert size={20} className="text-red-600 animate-pulse md:w-6 md:h-6" /> Critical Alerts Hub</h3>
                                    <div className="space-y-3 md:space-y-4 max-h-[300px] overflow-y-auto no-scrollbar relative z-10 pr-2 custom-scrollbar text-start leading-none">
                                        {depletionAlerts.length === 0 ? (
                                            <div className="py-8 text-center opacity-10"><ShieldCheck size={50} className="mx-auto mb-3 md:w-[60px] md:h-[60px]"/><p className="font-black text-sm uppercase italic">VAULT_STOCKS_SECURE</p></div>
                                        ) : depletionAlerts.slice(0, 8).map((asset_alert, i_alert) => (
                                            <div key={i_alert} className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3.5 bg-white/5 rounded-xl md:rounded-2xl border-l-4 border-l-red-600 hover:bg-white/10 transition-all group/alert-row shadow-lg leading-none shrink-0">
                                                <img src={asset_alert.images?.[0] || LOCAL_NULL_IMG} className="w-10 h-12 md:w-12 md:h-16 object-cover rounded-lg grayscale group-hover/alert-row:grayscale-0 transition-all duration-700 shadow-lg border border-white/5 shrink-0" alt="Depletion alert" />
                                                <div className="flex-grow overflow-hidden text-start min-w-0">
                                                    <p className="font-black text-[10px] md:text-[11px] uppercase truncate italic text-zinc-200 leading-none mb-1 md:mb-1.5">{asset_alert.nameEn}</p>
                                                    <p className="text-[8px] md:text-[9px] font-black text-red-500 mt-1 md:mt-1.5 uppercase tracking-widest flex justify-between items-center italic leading-none">
                                                       <span className="leading-none uppercase">STOCK: {asset_alert.stock} UNITS</span>
                                                       <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_5px_#dc2626] shrink-0" />
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-6 md:mt-8 text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase tracking-widest後の، relative z-10 text-start leading-none truncate uppercase">RESTOCK ASSETS IMMEDIATELY UPON BREACH.</p>
                                </div>

                                <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-zinc-100 text-start">
                                    <h3 className="text-[8px] md:text-[10px] font-black uppercase mb-4 md:mb-6 text-zinc-300 italic tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2 md:gap-3 leading-none"><Activity size={16} className="text-red-600 md:w-4.5 md:h-4.5" /> SYSTEM_LOGS</h3>
                                    <div className="space-y-3 md:space-y-4 text-start leading-none">
                                        {systemLogs.length === 0 ? (
                                            <p className="text-center py-4 opacity-10 font-black uppercase italic text-[10px]">SCANNING_LOG_BUFFER...</p>
                                        ) : systemLogs.slice(0, 8).map((log_entry, i_log) => (
                                            <div key={i_log} className="flex items-start gap-3 border-b border-zinc-50 pb-2.5 last:border-0 group cursor-default text-start leading-none">
                                                <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full mt-1.5 shrink-0 ${log_entry.type === 'success' ? 'bg-emerald-500' : log_entry.type === 'warn' ? 'bg-rose-600' : 'bg-sky-500'} group-hover:scale-125 transition-transform duration-500 shrink-0`} />
                                                <div className="flex-grow overflow-hidden text-start min-w-0">
                                                    <p className="text-[9px] font-black uppercase italic text-zinc-700 leading-tight truncate group-hover:text-black transition-colors">{log_entry.msg}</p>
                                                    <p className="text-[6px] md:text-[7px] font-black text-zinc-300 mt-1 uppercase italic leading-none">{log_entry.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'inventory' && (
                  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 text-start">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-zinc-100 gap-4 md:gap-6 text-start">
                          <div className="text-start leading-none">
                              <h2 className="text-xl md:text-2xl font-black uppercase italic leading-none text-black">Inventory Matrix</h2>
                              <p className="text-[8px] md:text-[10px] font-black text-zinc-400 mt-2 italic uppercase tracking-widest leading-none">{products.length} MASTER REGISTRY NODES SYNCHRONIZED</p>
                          </div>
                          <div className="flex flex-wrap gap-2 md:gap-4 items-center w-full md:w-auto text-start leading-none">
                             <div className="flex bg-zinc-100 p-1 rounded-full border border-zinc-200 shadow-inner w-full md:w-auto text-start leading-none">
                                {['All', 'Men', 'Women'].map(cat_node => (
                                    <button 
                                        key={cat_node} onClick={() => setActiveFilter(cat_node)} 
                                        className={`flex-1 md:flex-none px-3 md:px-5 py-1.5 md:py-2 rounded-full font-black text-[8px] md:text-[10px] uppercase transition-all italic leading-none ${activeFilter === cat_node ? 'bg-black text-white shadow-md' : 'text-zinc-400 hover:text-black'}`}
                                    >
                                        {cat_node} Registry
                                    </button>
                                ))}
                             </div>
                             <button onClick={() => { setEditingProduct(null); setMasterId('AK-' + Date.now()); setVariants({}); setShowForm(true); }} className="w-full md:w-auto px-6 py-2.5 bg-zinc-950 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase italic hover:bg-red-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl leading-none shadow-black/20">
                                <PlusCircle size={16} /> NEW MASTER ASSET
                             </button>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 text-start">
                          {filteredProductsList.map(asset_node => {
                              const v0_node = Object.values(asset_node.variants || {})[0];
                              const totalReserves_node = Object.values(asset_node.variants || {}).reduce((a, v) => a + (v.stock || 0), 0);
                              return (
                                  <div key={asset_node.id} className="bg-white rounded-xl md:rounded-[2rem] overflow-hidden shadow-sm border border-zinc-100 group flex flex-col relative transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 text-start">
                                      <div className="aspect-[3/4] relative overflow-hidden bg-zinc-50 border-b border-zinc-100 text-start">
                                          <img src={v0_node?.images?.[0] || LOCAL_NULL_IMG} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt="" />
                                          <div className="absolute top-2 left-2 px-1.5 py-0.5 md:px-2.5 md:py-1 bg-black/80 text-white text-[6px] md:text-[8px] font-black rounded-lg italic uppercase backdrop-blur-md border border-white/10 shadow-xl leading-none">{v0_node?.category} HUB</div>
                                          <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 md:gap-6 backdrop-blur-sm text-start leading-none shrink-0">
                                              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 italic leading-none">#{asset_node.id.split('-').pop()?.slice(-4)}</p>
                                              <div className="flex gap-2.5 md:gap-4 text-start leading-none shrink-0">
                                                <button onClick={() => { setEditingProduct(asset_node); setMasterId(asset_node.id); setVariants(asset_node.variants); setShowForm(true); }} className="p-2 md:p-3 bg-white text-black rounded-lg md:rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-90 shadow-white/10 shrink-0 leading-none"><Edit3 size={18} className="md:w-5 md:h-5"/></button>
                                                <button onClick={() => { if(confirm('Purge node permanently?')) deleteProduct(asset_node.id); }} className="p-2 md:p-3 bg-white text-rose-600 rounded-lg md:rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-xl active:scale-90 shadow-white/10 shrink-0 leading-none"><Trash size={18} className="md:w-5 md:h-5"/></button>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="p-3 md:p-4 flex-grow flex flex-col text-start leading-none">
                                          <div className="flex justify-between items-start mb-1.5 md:mb-2 text-start leading-none">
                                              <span className={`text-[7px] md:text-[9px] font-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-md italic border shadow-sm uppercase leading-none ${totalReserves_node < 5 ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>STK: {totalReserves_node}</span>
                                              <div className="flex -space-x-1.5 md:-space-x-2 text-start leading-none shrink-0">
                                                  {Object.keys(asset_node.variants || {}).slice(0, 3).map(col_key => <div key={col_key} className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-white shadow-sm ring-1 ring-zinc-50" style={{backgroundColor: ULTIMATE_COLOR_REGISTRY[col_key] || '#000'}} />)}
                                              </div>
                                          </div>
                                          <h3 className="text-[10px] md:text-[13px] font-black uppercase truncate italic leading-tight mb-2 md:mb-3 text-zinc-900 group-hover:text-red-600 transition-colors duration-500 text-start leading-none truncate">{isAr ? v0_node?.nameAr : v0_node?.nameEn}</h3>
                                          <div className="mt-auto pt-2 md:pt-3 border-t border-zinc-100 flex justify-between items-end text-start leading-none">
                                              <div className="text-start leading-none min-w-0">
                                                <p className="text-[6px] md:text-[8px] font-black text-zinc-300 uppercase italic mb-0.5 leading-none truncate">SUB-PROTOCOL</p>
                                                <p className="text-[8px] md:text-[10px] font-black uppercase text-zinc-600 italic truncate w-16 md:w-24 leading-none">{v0_node?.subCategory || 'MASTER'}</p>
                                              </div>
                                              <p className="text-xs md:text-base font-black italic text-black leading-none shrink-0">{v0_node?.price} <span className="text-[7px] md:text-[8px] opacity-30 ml-0.5 uppercase italic leading-none">QAR</span></p>
                                          </div>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              )}

              {activeTab === 'sales' && (
                  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 text-start">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-zinc-100 gap-4 md:gap-6 text-start">
                          <div className="text-start leading-none">
                              <h2 className="text-xl md:text-2xl font-black uppercase italic leading-none text-black">Sales Archive Hub</h2>
                              <p className="text-[8px] md:text-[10px] font-black text-zinc-400 mt-2 italic uppercase tracking-widest leading-none">{orders.length} TRANSACTION PACKETS</p>
                          </div>
                          <div className="flex flex-wrap gap-2 md:gap-4 text-start leading-none">
                              <button onClick={exportCommercialExcel} className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-emerald-50 text-emerald-700 rounded-xl font-black text-[9px] md:text-[11px] uppercase italic border border-emerald-100 shadow-sm leading-none"><FileSpreadsheet size={16}/> EXCEL</button>
                              <button onClick={exportCommercialPDF} className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-rose-50 text-rose-700 rounded-xl font-black text-[9px] md:text-[11px] uppercase italic border border-rose-100 shadow-sm leading-none"><FileText size={16}/> PDF</button>
                          </div>
                      </div>

                      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm text-start">
                          <div className="overflow-x-auto no-scrollbar custom-scrollbar text-start">
                              <table className="w-full text-left border-collapse min-w-[1200px] text-start">
                                  <thead className="bg-zinc-50 border-b border-zinc-100 text-start leading-none">
                                      <tr>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-start leading-none">Hash / Temporal</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-start leading-none">Identity Persona</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-start leading-none">Item Specifications</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-start leading-none">Archival Destination</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-start leading-none">Capital Flow</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-center leading-none">Status Control</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-center leading-none">Matrix Action</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-50 text-start text-black font-bold">
                                      {orders.length === 0 ? (
                                        <tr><td colSpan={7} className="p-20 text-center opacity-10 font-black uppercase text-2xl italic py-32 leading-none">EMPTY</td></tr>
                                      ) : orders.map(order_node => (
                                          <tr key={order_node.id} className="hover:bg-zinc-50/70 transition-all duration-500 group/row-sale text-start">
                                              <td className="p-4 md:p-5 text-start min-w-[120px]">
                                                  <div className="flex flex-col gap-0.5 text-start leading-none">
                                                      <p className="font-black text-xs md:text-[13px] italic text-black leading-none uppercase tracking-tight group-hover/row-sale:text-red-600 transition-colors leading-none truncate">#{order_node.id.slice(-10).toUpperCase()}</p>
                                                      <p className="text-[7px] md:text-[9px] text-zinc-400 font-black mt-1 uppercase italic tracking-widest leading-none truncate">{order_node.date}</p>
                                                  </div>
                                              </td>
                                              <td className="p-4 md:p-5 text-start min-w-[150px]">
                                                  <div className="flex flex-col gap-1 text-start leading-none">
                                                      <p className="font-black text-xs md:text-[14px] uppercase italic text-black leading-none truncate w-full leading-none">{order_node.customerName}</p>
                                                      <div className="flex items-center gap-2 text-start leading-none min-w-0">
                                                         <p className="text-[7px] md:text-[9px] font-black text-zinc-400 flex items-center gap-1.5 italic leading-none truncate w-full"><Smartphone size={10} className="text-red-600 shrink-0"/> {order_node.phone}</p>
                                                      </div>
                                                  </div>
                                              </td>
                                              <td className="p-4 md:p-5 text-start min-w-[200px]">
                                                  <div className="flex flex-col gap-3 leading-none">
                                                      {order_node.items.map((it_s, i_s) => (
                                                            <div key={i_s} className="flex items-center gap-3 group/asset-spec-item leading-none shrink-0">
                                                                <div className="relative w-10 h-12 md:w-12 md:h-16 rounded-lg md:rounded-xl overflow-hidden border md:border-2 border-white shadow-lg ring-1 ring-zinc-100 shrink-0">
                                                                    <img src={getOrderItemImage(it_s)} className="w-full h-full object-cover grayscale brightness-110" alt="" />
                                                                </div>
                                                                <div className="flex flex-col gap-0.5 text-start leading-none min-w-0">
                                                                    <p className="text-[9px] md:text-[10px] font-black uppercase italic text-black truncate w-32 leading-none">{it_s.product?.nameEn || 'ASSET'}</p>
                                                                    <div className="flex items-center gap-1.5 mt-0.5 leading-none">
                                                                        <span className="text-[6px] md:text-[8px] font-black text-zinc-400 bg-zinc-50 px-1 py-0.5 rounded border border-zinc-100 italic leading-none uppercase">COL: {it_s.color || it_s.selectedColor || 'N/A'}</span>
                                                                        <span className="text-[6px] md:text-[8px] font-black text-zinc-400 bg-zinc-50 px-1 py-0.5 rounded border border-zinc-100 italic leading-none uppercase">SZ: {it_s.size || it_s.selectedSize || 'N/A'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                      ))}
                                                  </div>
                                              </td>
                                              <td className="p-4 md:p-5 text-start min-w-[150px]">
                                                  <div className="flex items-start gap-2 text-start leading-none min-w-0">
                                                      <MapPin size={12} className="text-red-600 shrink-0 mt-0.5 shadow-sm"/>
                                                      <p className="text-[9px] md:text-[11px] font-black italic uppercase text-zinc-600 leading-tight w-full truncate">{order_node.address || 'NULL'}</p>
                                                  </div>
                                              </td>
                                              <td className="p-4 md:p-5 text-start min-w-[100px]">
                                                  <div className="flex flex-col gap-0.5 text-start leading-none min-w-0">
                                                     <p className="text-sm md:text-xl font-black italic text-black leading-none truncate">{order_node.total} <span className="text-[7px] md:text-[8px] opacity-20 ml-0.5 italic tracking-widest uppercase leading-none shrink-0">QAR</span></p>
                                                     <div className="flex items-center gap-1.5 mt-1 text-start leading-none min-w-0">
                                                        <span className="text-[6px] md:text-[8px] font-black text-zinc-300 uppercase italic tracking-widest bg-zinc-50 px-1.5 py-0.5 rounded-md border border-zinc-100 shadow-inner leading-none truncate">{order_node.paymentMethod}</span>
                                                     </div>
                                                  </div>
                                              </td>

                                              <td className="p-4 md:p-5 text-center">
                                                  <div className="flex items-center gap-2 md:gap-3 bg-zinc-50/50 p-1.5 md:p-2.5 rounded-xl md:rounded-2xl border border-zinc-100 w-fit mx-auto shadow-inner group/status-hub hover:bg-white transition-all duration-500 text-start leading-none shrink-0">
                                                         <div className="relative text-start leading-none shadow-sm shrink-0">
                                                            <select 
                                                                value={orderStatusUpdates[order_node.id]?.status || order_node.status || 'Processing'} 
                                                                onChange={(e) => handleLocalStatusChange(order_node.id, 'status', e.target.value)}
                                                                className="bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl font-black text-[8px] md:text-[10px] uppercase italic outline-none cursor-pointer text-zinc-900 border border-zinc-100 shadow-sm appearance-none min-w-[90px] md:min-w-[130px] transition-all leading-none"
                                                            >
                                                                <option value="Processing">Node: Processing</option>
                                                                <option value="Shipped">Node: Shipped</option>
                                                                <option value="Delivered">Node: Delivered</option>
                                                                <option value="Cancelled">Node: Purged</option>
                                                            </select>
                                                            <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" size={8}/>
                                                         </div>
                                                      <input 
                                                          type="number" min="0" max="30"
                                                          value={orderStatusUpdates[order_node.id]?.eta || order_node.estimatedDeliveryDays || 3}
                                                          onChange={(e) => handleLocalStatusChange(order_node.id, 'eta', e.target.value)}
                                                          className="w-8 md:w-12 bg-white px-1 py-1 md:py-1.5 rounded-lg md:rounded-xl font-black text-[10px] md:text-[12px] text-center border border-zinc-100 shadow-sm italic focus:ring-4 focus:ring-black/5 transition-all text-black leading-none shrink-0"
                                                        />
                                                      <button 
                                                        onClick={() => handleUpdateOrderStatus(order_node.id)}
                                                        disabled={statusLoading === order_node.id}
                                                        className="p-1.5 md:p-2.5 bg-zinc-950 text-white rounded-lg md:rounded-xl hover:bg-red-600 transition-all disabled:opacity-20 shadow-xl active:scale-90 border border-white/10 leading-none shadow-black/30 shrink-0"
                                                      >
                                                        {statusLoading === order_node.id ? <Loader2 size={12} className="animate-spin md:w-4 md:h-4"/> : <RefreshCw size={12} className="md:w-4 md:h-4"/>}
                                                      </button>
                                                  </div>
                                              </td>

                                              <td className="p-4 md:p-5 text-center leading-none">
                                                  <div className="flex gap-2 justify-center leading-none shrink-0">
                                                    <button onClick={() => { if(confirm('Purge archival order permanently?')) deleteOrder(order_node.id); }} className="p-2 md:p-2.5 text-zinc-300 hover:text-rose-600 transition-all hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 active:scale-75 shadow-none group/purge shrink-0 leading-none"><Trash2 size={18} className="md:w-5 md:h-5 shadow-sm"/></button>
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'refunds' && (
                  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 text-start leading-none">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-zinc-100 gap-4 md:gap-6 text-start leading-none">
                          <div className="text-start leading-none min-w-0">
                              <h2 className="text-xl md:text-2xl font-black uppercase italic leading-none text-black truncate uppercase">Refund Protocol Hub</h2>
                              <p className="text-[8px] md:text-[10px] font-black text-zinc-400 mt-2 italic uppercase tracking-widest leading-none truncate uppercase">{refundRequests.length} ACTIVE CLAIMS DETECTED</p>
                          </div>
                      </div>

                      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm text-start leading-none">
                          <div className="overflow-x-auto custom-scrollbar no-scrollbar text-start leading-none">
                              <table className="w-full text-left border-collapse min-w-[1000px] text-start leading-none">
                                  <thead className="bg-zinc-50 border-b border-zinc-100 text-start leading-none">
                                      <tr>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-start leading-none">Protocol ID / Link</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-start leading-none">Claimant Persona</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-start leading-none">Discrepancy Reason</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-center leading-none">Status Calibration</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-center leading-none">Node Action</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-50 text-start text-black font-bold leading-none">
                                      {refundRequests.length === 0 ? (
                                        <tr><td colSpan={5} className="p-20 text-center opacity-10 font-black uppercase text-2xl italic py-32 leading-none">REFUND_QUEUE_EMPTY</td></tr>
                                      ) : refundRequests.map(claim_node_v => (
                                          <tr key={claim_node_v.refundId} className="hover:bg-zinc-50/70 transition-all duration-500 group/refund-row-item text-start leading-none">
                                              <td className="p-4 md:p-5 text-start min-w-[120px] leading-none">
                                                  <p className="font-black text-xs md:text-[13px] italic uppercase text-red-600 leading-none truncate max-w-[120px]">ID: {claim_node_v.refundId}</p>
                                                  <p className="text-[7px] md:text-[9px] text-zinc-400 uppercase italic mt-1.5 font-black leading-none truncate max-w-[120px]">#{claim_node_v.orderId.slice(-10).toUpperCase()}</p>
                                              </td>
                                              <td className="p-4 md:p-5 text-start min-w-[150px] leading-none">
                                                  <p className="font-black text-xs md:text-[14px] uppercase italic text-black leading-none truncate max-w-[150px]">{claim_node_v.userName}</p>
                                                  <p className="text-[7px] md:text-[9px] text-zinc-400 italic mt-1.5 font-black truncate w-40 md:w-48 leading-none">{claim_node_v.userEmail}</p>
                                              </td>
                                              <td className="p-4 md:p-5 text-start min-w-[200px] leading-none">
                                                  <div className="bg-zinc-50 p-3 md:p-4 rounded-xl border border-zinc-100 max-w-[200px] md:max-w-[300px] shadow-inner text-start leading-none min-h-[60px]">
                                                     <p className="text-[9px] md:text-[11px] font-black italic leading-relaxed text-zinc-600 text-start truncate max-h-[40px] overflow-hidden">{claim_node_v.reason}</p>
                                                  </div>
                                              </td>
                                              <td className="p-4 md:p-5 text-center min-w-[200px] leading-none">
                                                  <div className="flex items-center gap-2 md:gap-3 bg-zinc-50/50 p-1.5 md:p-2.5 rounded-xl md:rounded-2xl border border-zinc-100 w-fit mx-auto shadow-inner hover:bg-white transition-all duration-500 text-start leading-none shrink-0">
                                                      <div className="relative text-start leading-none shadow-sm shrink-0">
                                                          <select 
                                                              value={refundStatusUpdates[claim_node_v.docId] || claim_node_v.status || 'Pending'} 
                                                              onChange={(e) => setRefundStatusUpdates({...refundStatusUpdates, [claim_node_v.docId]: e.target.value})}
                                                              className="bg-white px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl font-black text-[8px] md:text-[10px] uppercase italic outline-none cursor-pointer border border-zinc-100 shadow-sm appearance-none min-w-[120px] md:min-w-[150px] transition-all leading-none shrink-0"
                                                          >
                                                              <option value="Pending">Node: Pending</option>
                                                              <option value="Processing">Node: Processing</option>
                                                              <option value="Refunded">Node: Refunded</option>
                                                              <option value="Rejected">Node: Rejected</option>
                                                          </select>
                                                          <ChevronDown className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" size={8}/>
                                                      </div>
                                                      <button 
                                                        onClick={() => handleUpdateRefundStatus(claim_node_v.docId, refundStatusUpdates[claim_node_v.docId] || claim_node_v.status)}
                                                        disabled={statusLoading === claim_node_v.docId}
                                                        className="p-1.5 md:p-2.5 bg-black text-white rounded-lg md:rounded-xl hover:bg-red-600 transition-all disabled:opacity-20 shadow-xl active:scale-90 border border-white/10 leading-none shadow-black/20 shrink-0"
                                                      >
                                                        {statusLoading === claim_node_v.docId ? <Loader2 size={12} className="animate-spin md:w-4 md:h-4"/> : <RefreshCw size={12} className="md:w-4 md:h-4"/>}
                                                      </button>
                                                  </div>
                                              </td>
                                              <td className="p-4 md:p-5 text-center min-w-[100px] leading-none">
                                                  <button className="p-2 md:p-3 text-zinc-200 hover:text-rose-600 transition-all hover:bg-rose-50 rounded-xl active:scale-75 shadow-none shrink-0 leading-none"><Trash size={18} className="md:w-5 md:h-5 shadow-sm"/></button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'users' && (
                  <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 text-start leading-none">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-zinc-100 gap-4 md:gap-6 text-start leading-none">
                          <div className="text-start leading-none min-w-0">
                              <h2 className="text-xl md:text-2xl font-black uppercase italic leading-none text-black truncate uppercase">Persona Vault Hub</h2>
                              <p className="text-[8px] md:text-[10px] font-black text-zinc-400 mt-2 italic uppercase tracking-widest leading-none truncate uppercase">{users.length} IDENTITY FINGERPRINTS CAPTURED</p>
                          </div>
                          <div className="bg-emerald-50/70 px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-emerald-100 text-emerald-700 flex items-center gap-2 md:gap-3 shadow-inner leading-none shrink-0">
                             <Shield size={16} className="animate-pulse md:w-5 md:h-5" />
                             <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest italic block leading-none uppercase">AES-256 SECURED VAULT</span>
                          </div>
                      </div>
                      
                      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm text-start leading-none">
                          <div className="overflow-x-auto custom-scrollbar no-scrollbar text-start leading-none">
                              <table className="w-full text-left border-collapse min-w-[1000px] text-start leading-none">
                                  <thead className="bg-zinc-50 border-b border-zinc-100 text-start leading-none">
                                      <tr>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-start leading-none">Identity Persona</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-center leading-none">Biometric Matrix</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-start leading-none">Archives Registry</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-start leading-none">Access Credentials</th>
                                          <th className="p-4 md:p-5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 italic text-center leading-none">Protocol Matrix Action</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-50 text-start text-black font-bold leading-none">
                                      {users.map(user_node_v => (
                                          <tr key={user_node_v.id} className="hover:bg-zinc-50/50 transition-all duration-700 group/u-node-row text-start leading-none">
                                              <td className="p-4 md:p-5 text-start min-w-[150px] leading-none">
                                                  <div className="flex items-center gap-3 md:gap-4 text-start leading-none min-w-0">
                                                      <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-base md:text-xl italic shadow-2xl shrink-0 leading-none">{user_node_v.name.charAt(0).toUpperCase()}</div>
                                                      <div className="text-start leading-none min-w-0">
                                                          <p className="font-black text-xs md:text-[15px] uppercase italic text-black leading-none group-hover/u-node-row:text-red-600 transition-colors tracking-tight truncate leading-none text-start">{user_node_v.name}</p>
                                                          <p className="text-[7px] md:text-[9px] font-black text-red-600 mt-1 md:mt-2 italic leading-none truncate leading-none shadow-none uppercase">UID: {user_node_v.id.slice(-6).toUpperCase()}</p>
                                                      </div>
                                                  </div>
                                              </td>
                                              <td className="p-4 md:p-5 text-center leading-none">
                                                  {user_node_v.photo ? (
                                                      <div className="relative group/user-vis-p w-10 h-10 md:w-12 md:h-12 mx-auto shadow-xl rounded-lg md:rounded-xl overflow-hidden ring-1 ring-zinc-100 shrink-0">
                                                         <img src={user_node_v.photo} className="w-full h-full object-cover grayscale brightness-110 group-hover/user-vis-p:grayscale-0 transition-all duration-700" alt="Identity visual" />
                                                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/user-vis-p:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]"><Scan size={12} className="text-white animate-pulse shadow-md shrink-0"/></div>
                                                      </div>
                                                  ) : <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-zinc-50 border border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-300 gap-0.5 mx-auto shadow-inner leading-none shrink-0"><Lock size={12} className="opacity-50"/><span className="text-[5px] md:text-[6px] font-black uppercase italic leading-none shrink-0">SECURED</span></div>}
                                              </td>
                                              <td className="p-4 md:p-5 text-start min-w-[150px] leading-none">
                                                  <div className="space-y-1.5 md:space-y-2 text-start leading-none min-w-[150px]">
                                                      <p className="text-[10px] md:text-[12px] font-bold italic text-black leading-none flex items-center gap-2 md:gap-3 bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-zinc-100 w-fit shadow-sm truncate max-w-[140px] md:max-w-none"><Smartphone size={12} className="text-red-600 shrink-0"/> {user_node_v.phone}</p>
                                                      <p className="text-[7px] md:text-[9px] text-zinc-400 font-black uppercase italic tracking-widest flex items-center gap-2 md:gap-3 px-2 md:px-3 leading-none truncate max-w-[140px] md:max-w-none shadow-none"><Mail size={10} className="opacity-30 leading-none shrink-0"/> {user_node_v.email}</p>
                                                  </div>
                                              </td>
                                              <td className="p-4 md:p-5 text-start min-w-[100px] leading-none">
                                                  <div className="flex flex-col gap-1 md:gap-1.5 text-start leading-none truncate min-w-[100px]">
                                                      <p className="text-[10px] md:text-[12px] font-bold italic text-red-600 leading-none flex items-center gap-2 md:gap-3 bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-zinc-100 w-fit shadow-sm truncate max-w-[100px] md:max-w-none">
                                                          <Lock size={12} className="shadow-sm shrink-0"/> {user_node_v.password || 'NULL'}
                                                      </p>
                                                      <span className="text-[6px] md:text-[7px] font-black text-zinc-300 uppercase italic tracking-widest pl-1.5 leading-none uppercase mt-0.5 md:mt-1 truncate uppercase">Access Key</span>
                                                  </div>
                                              </td>
                                              <td className="p-4 md:p-5 text-center min-w-[100px] leading-none">
                                                  <div className="flex gap-2.5 justify-center text-start leading-none">
                                                      <button onClick={() => { if(confirm('Purge identity persona permanently from vault?')) deleteUser(user_node_v.id); }} className="p-2 md:p-3 bg-rose-50 text-rose-600 rounded-lg md:rounded-xl shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-75 border border-rose-100 leading-none shrink-0"><Trash size={16} className="md:w-[18px] md:h-[18px] shadow-sm shrink-0"/></button>
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'metrics' && (
                  <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 text-start leading-none">
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 text-start text-black leading-none">
                           <div className="bg-zinc-950 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col justify-between group overflow-hidden relative text-white text-start min-h-[300px] md:min-h-[340px] shadow-black/50 border border-white/5 leading-none">
                               <div className="absolute right-[-10%] top-[-10%] w-[250px] h-[250px] md:w-[320px] md:h-[320px] bg-red-600/10 rounded-full blur-[80px] md:blur-[100px] group-hover:scale-125 transition-transform duration-1000 shadow-inner" />
                               <div className="relative z-10 text-start leading-none">
                                   <div className="flex justify-between items-start mb-6 md:mb-10 text-start leading-none">
                                       <div className="p-3 md:p-4 bg-red-600 text-white rounded-xl md:rounded-2xl shadow-[0_15px_40px_rgba(220,38,38,0.5)] group-hover:rotate-12 transition-all duration-700 shadow-red-600/30 shrink-0"><TrendingUp size={28} className="md:w-9 md:h-9" /></div>
                                       <div className="text-right space-y-1 md:space-y-1.5 leading-none text-start min-w-0">
                                           <span className="text-[9px] md:text-[11px] font-black text-emerald-500 bg-emerald-500/10 px-3 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-widest italic block border border-emerald-500/20 shadow-xl shadow-black/20 leading-none truncate">+35.2% GROWTH MATRIX</span>
                                           <span className="text-[6px] md:text-[7px] font-bold text-zinc-600 uppercase tracking-widest block pr-1.5 md:pr-2 italic leading-none uppercase truncate">SYNC_WINDOW: 24H_UTC_HUB</span>
                                       </div>
                                   </div>
                                   <p className="text-[10px] md:text-[12px] font-bold uppercase tracking-[0.4em] md:tracking-[0.6em] text-zinc-600 mb-1.5 md:mb-2 italic pl-1.5 md:pl-2 leading-none text-start text-white uppercase shadow-none">VALUATION PROTOCOL FLOW MATRIX</p>
                                   <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 md:mb-8 italic text-white drop-shadow-2xl leading-none text-start shadow-black/50 truncate uppercase shadow-none">{revenueFlow.toLocaleString()} <span className="text-lg md:text-2xl font-black text-zinc-800 uppercase italic tracking-widest ml-1.5 md:ml-2 leading-none shadow-none uppercase">QAR</span></h3>
                               </div>
                               <div className="pt-6 md:pt-8 border-t border-white/5 flex justify-between relative z-10 text-start leading-none">
                                   <div className="text-start pl-3 md:pl-4 group/v-metric-node-item leading-none truncate min-w-0 shadow-none uppercase">
                                       <p className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1.5 md:mb-2 italic group-hover/v-metric-node-item:text-white transition-colors leading-none truncate uppercase shadow-none uppercase">Vault Equity Capital Hub</p>
                                       <p className="text-2xl md:text-4xl font-black italic leading-none text-zinc-100 group-hover/v-metric-node-item:scale-105 transition-transform origin-left leading-none shadow-md truncate shadow-none">{stockAssetValue.toLocaleString()} <span className="text-[8px] md:text-[10px] opacity-20 ml-0.5 md:ml-1 uppercase italic leading-none shadow-none uppercase">QAR</span></p>
                                   </div>
                               </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4 md:gap-6 text-start leading-none">
                               {[
                                 { label: 'Traffic Stream', val: totalEngagementViews.toLocaleString(), icon: <ActivityIcon size={24}/>, col: 'text-sky-500', bg: 'bg-sky-500/10' },
                                 { label: 'Commercial Acc', val: `${commercialEfficiency}%`, icon: <ZapIcon size={24}/>, col: 'text-amber-500', bg: 'bg-amber-50/10' },
                                 { label: 'Secured Personas', val: activeUsersCount, icon: <ShieldCheck size={24}/>, col: 'text-emerald-500', bg: 'bg-emerald-50/10' },
                                 { label: 'Registry Alerts', val: depletionAlerts.length, icon: <ShieldAlert size={24}/>, col: 'text-rose-600', bg: 'bg-rose-600/10' }
                               ].map((metric_item, idx_item) => (
                                 <div key={idx_item} className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-zinc-100 flex flex-col items-center justify-center text-center transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group/m-node-card-item shadow-black/5 leading-none">
                                     <div className={`w-10 h-10 md:w-16 md:h-16 mb-3 md:mb-5 rounded-lg md:rounded-[1.5rem] ${metric_item.bg} ${metric_item.col} flex items-center justify-center shadow-inner border-2 border-white relative z-10 group-hover/m-node-card-item:scale-110 transition-transform duration-500 shadow-black/5 shrink-0`}>
                                         <div className="md:hidden">{React.cloneElement(metric_item.icon as React.ReactElement, { size: 18 })}</div>
                                         <div className="hidden md:block">{metric_item.icon}</div>
                                     </div>
                                     <div className="relative z-10 text-center leading-none min-w-0 w-full">
                                        <p className="text-[7px] md:text-[9px] font-black text-zinc-300 uppercase tracking-widest md:tracking-[0.3em] mb-1.5 md:mb-3 italic leading-none truncate w-full px-1 uppercase">{metric_item.label.toUpperCase()}</p>
                                        <h4 className="text-xl md:text-4xl font-black tracking-tighter italic text-black leading-none shadow-sm truncate w-full shadow-none">{metric_item.val}</h4>
                                     </div>
                                 </div>
                               ))}
                           </div>
                      </div>

                      <div className="bg-zinc-950 text-white p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden text-start group/performance-matrix-panel shadow-black/60 border border-white/5 leading-none">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 md:mb-12 gap-6 md:gap-8 relative z-10 text-start leading-none">
                             <div className="flex items-center gap-4 md:gap-6 text-start leading-none min-w-0">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-white/5 shadow-inner shrink-0 group-hover/performance-matrix-panel:rotate-[360deg] transition-all duration-[1500ms]"><Trophy size={32} className="text-amber-500 animate-bounce md:w-10 md:h-10" /></div>
                                <div className="space-y-1.5 text-start leading-none min-w-0">
                                   <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic text-white leading-none shadow-sm truncate uppercase shadow-none">Asset Velocity Matrix</h3>
                                   <p className="text-[9px] md:text-[12px] font-bold text-zinc-600 uppercase tracking-widest md:tracking-[0.5em] italic leading-none shadow-none truncate uppercase">TOP PERFORMING ARCHIVAL NODES BY COMMERCIAL VELOCITY STREAM</p>
                                </div>
                             </div>
                             <div className="flex gap-3 md:gap-4 text-start leading-none w-full md:w-auto shrink-0 shadow-none">
                                <div className="flex-1 md:flex-none bg-white/5 p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5 flex flex-col items-center justify-center min-w-[70px] md:min-w-[90px] shadow-inner leading-none"><p className="text-base md:text-lg font-black italic text-zinc-200 leading-none">24H</p><span className="text-[6px] md:text-[7px] font-black uppercase tracking-widest text-zinc-500 mt-1 uppercase leading-none shadow-none">WINDOW</span></div>
                                <div className="flex-1 md:flex-none bg-red-600 p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/10 flex flex-col items-center justify-center min-w-[70px] md:min-w-[90px] shadow-xl shadow-red-600/30 active:scale-95 transition-all shadow-inner leading-none"><p className="text-base md:text-lg font-black italic text-white leading-none">LIVE</p><span className="text-[6px] md:text-[7px] font-black uppercase tracking-widest text-red-200 mt-1 uppercase leading-none shadow-none">STREAM</span></div>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8 relative z-10 text-start leading-none shadow-none">
                             {products.sort((a,b) => {
                               const b_val_matrix_v = Object.values(b.variants || {})[0]?.salesCount || 0;
                               const a_val_matrix_v = Object.values(a.variants || {})[0]?.salesCount || 0;
                               return b_val_matrix_v - a_val_matrix_v;
                             }).slice(0, 5).map((asset_node_perf_v, i_node_perf_v) => {
                               const coreV_perf_v = Object.values(asset_node_perf_v.variants || {})[0];
                               const registryEff_perf_v = (coreV_perf_v?.views || 0) > 0 ? (((coreV_perf_v?.salesCount || 0) / (coreV_perf_v?.views || 1)) * 100).toFixed(1) : '0';
                               return (
                                  <div key={asset_node_perf_v.id} className="group/n-perf-card flex flex-col text-start transition-all cursor-pointer leading-none min-w-0 shadow-none">
                                     <div className="aspect-[3/4.5] bg-zinc-900 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden mb-3 md:mb-5 relative shadow-2xl border-2 md:border-4 border-white/5 transition-all md:group-hover/n-perf-card:-translate-y-4 ring-1 ring-white/5 leading-none shadow-none">
                                        <img src={coreV_perf_v?.images?.[0] || LOCAL_NULL_IMG} className="w-full h-full object-cover grayscale brightness-110 md:group-hover/n-perf-card:scale-125 md:group-hover/n-perf-card:grayscale-0 transition-all duration-1000 ease-out shadow-inner" alt="" />
                                        <div className="absolute top-2 left-2 md:top-4 md:left-4 w-7 h-7 md:w-10 md:h-10 bg-black/80 rounded-lg md:rounded-2xl flex items-center justify-center font-black text-sm md:text-2xl italic text-white shadow-2xl border md:border-2 border-white/10 group-hover:bg-red-600 transition-colors duration-500 leading-none shrink-0 shadow-none">#{i_node_perf_v+1}</div>
                                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover/n-perf-card:opacity-100 transition-opacity flex flex-col justify-end p-3 md:p-5 text-start leading-none shadow-none">
                                           <p className="text-[8px] md:text-[12px] font-black text-red-500 uppercase tracking-widest italic leading-none uppercase truncate shadow-none">Velocity Matrix</p>
                                           <p className="text-2xl md:text-4xl font-black text-white italic leading-none mt-1 leading-none shadow-md truncate shadow-none">{registryEff_perf_v}%</p>
                                        </div>
                                     </div>
                                     <div className="px-1 text-start leading-none min-w-0 shadow-none">
                                        <h4 className="text-[10px] md:text-[14px] font-black uppercase italic truncate text-zinc-100 group-hover:text-red-600 transition-colors duration-500 leading-none text-start uppercase truncate shadow-none">{coreV_perf_v?.nameEn || 'UNREGISTERED_NODE'}</h4>
                                        <div className="text-[7px] md:text-[9px] font-black text-zinc-600 mt-2 uppercase italic tracking-widest flex items-center gap-1.5 md:gap-3 leading-none text-start uppercase truncate shadow-none">
                                            {coreV_perf_v?.salesCount || 0} DEPLOYED NODES 
                                            <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_#dc2626] shrink-0 shadow-none"/>
                                        </div>
                                     </div>
                                  </div>
                               );
                             })}
                          </div>
                      </div>
                  </div>
              )}
          </div>
          
          <footer className="fixed bottom-11 md:bottom-0 right-0 left-0 lg:left-[270px] h-11 bg-zinc-950 text-white flex items-center justify-between px-4 md:px-6 z-[600] border-t border-white/5 backdrop-blur-2xl opacity-98 shadow-[0_-15px_50px_rgba(0,0,0,0.7)] text-start leading-none">
              <div className="flex items-center gap-4 md:gap-10 text-start leading-none shadow-none">
                  <div className="flex items-center gap-2 md:gap-3 text-start leading-none">
                      <div className="w-2 md:w-2.5 h-2 md:h-2.5 bg-red-600 rounded-full animate-ping shadow-[0_0_12px_#dc2626] ring-1 ring-white/10 shrink-0" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-zinc-500 italic leading-none shadow-none uppercase">SYSTEM_NODE: ONLINE_SECURED_SYNC</span>
                  </div>
                  <div className="hidden lg:block h-5 w-px bg-white/10 shrink-0 shadow-none" />
                  <div className="hidden lg:flex items-center gap-6 overflow-hidden max-w-2xl whitespace-nowrap text-start leading-none shadow-none">
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic animate-pulse leading-none shadow-none uppercase">
                         LOG_STREAM_BUFFER: {systemLogs.slice(0, 1).map(l_stream => l_stream.msg).join(' — ') || 'CONTINUOUS_INTEGRITY_MONITORING_ACTIVE_NODE'}
                      </p>
                  </div>
              </div>
              <div className="flex items-center gap-4 md:gap-10 text-start leading-none shadow-none shrink-0">
                  <div className="flex flex-col items-end gap-0.5 md:gap-1 text-start leading-none min-w-[120px] shadow-none">
                      <p className="text-[6px] md:text-[7px] font-bold text-zinc-600 uppercase italic tracking-widest leading-none shadow-none uppercase">Temporal Mainframe Sync</p>
                      <p className="text-sm md:text-xl font-mono font-black italic tracking-widest text-zinc-100 leading-none shadow-none truncate">{new Date().toLocaleTimeString()}</p>
                  </div>
                  <div className="hidden md:block h-6 w-px bg-white/10 shadow-none shrink-0" />
                  <button onClick={() => addLog("System wide diagnostic node ping initiated", "success")} className="hidden md:flex items-center gap-3 text-[9px] font-black uppercase tracking-widest hover:text-red-600 transition-all italic group/footer-diag-btn active:scale-90 leading-none shadow-none group shrink-0">
                      <FlaskConical size={18} className="text-zinc-700 group-hover/footer-diag-btn:text-red-600 group-hover:animate-bounce transition-all shadow-none"/> <span className="group-hover:tracking-widest transition-all shadow-none">DIAGNOSTIC_NODE_SYNC</span>
                  </button>
              </div>
          </footer>

          {/* Bottom Navigation Bar for Mobile Devices */}
          <div className="fixed bottom-0 left-0 right-0 h-11 bg-black border-t border-white/5 flex items-center justify-around z-[700] md:hidden px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              {[
                  { id: 'dashboard', icon: <Layout size={18}/> },
                  { id: 'inventory', icon: <Boxes size={18}/> },
                  { id: 'sales', icon: <HistoryIcon size={18}/> },
                  { id: 'refunds', icon: <RotateCcw size={18}/> },
                  { id: 'users', icon: <UserCheck size={18}/> },
                  { id: 'metrics', icon: <BarChart size={18}/> }
              ].map(btn => (
                  <button 
                    key={btn.id} onClick={() => setActiveTab(btn.id as any)} 
                    className={`p-2 transition-all duration-300 active:scale-90 shrink-0 ${activeTab === btn.id ? 'text-red-600 scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
                  >
                    {btn.icon}
                  </button>
              ))}
              <button onClick={handleLogout} className="p-2 text-rose-500 active:scale-90 shrink-0"><LogOut size={18}/></button>
          </div>
      </main>

      {showForm && (
          <div className="fixed inset-0 z-[2000] bg-zinc-950/96 backdrop-blur-3xl flex items-center justify-center p-4 md:p-6 lg:p-12 overflow-hidden animate-in fade-in duration-500 text-start shadow-none">
              <div className="bg-white w-full max-w-6xl h-full md:max-h-[92vh] rounded-2xl md:rounded-[3rem] shadow-[0_100px_250px_rgba(0,0,0,1)] flex flex-col overflow-hidden border-4 md:border-[15px] border-white/5 relative group/reg-modal-panel text-start shadow-black/70 shadow-none">
                  
                  <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center shrink-0 text-start bg-zinc-50/70 backdrop-blur-md leading-none shadow-sm shadow-none">
                      <div className="text-start leading-none min-w-0 shadow-none">
                          <h2 className="text-xl md:text-4xl font-black uppercase tracking-tighter italic text-black group-hover:text-red-600 transition-colors duration-[1500ms] leading-none text-start truncate uppercase shadow-sm shadow-none">
                             {editingProduct ? 'Registry Recalibration Protocol' : 'Genesis Node Protocol Hub'}
                          </h2>
                          <p className="text-[7px] md:text-[11px] font-black text-zinc-400 uppercase italic tracking-widest md:tracking-[0.5em] mt-1.5 md:mt-2 leading-none text-start truncate uppercase shadow-none shadow-none">REGISTRY_ENGINE_STATUS: v6.7.3-QUANTUM_NODE_ACTIVE</p>
                      </div>
                      <button onClick={() => setShowForm(false)} className="p-3 md:p-4 bg-white rounded-full text-zinc-200 hover:text-black hover:rotate-90 transition-all duration-700 shadow-xl border border-zinc-100 active:scale-75 shrink-0 shadow-black/10 shadow-none"><X size={24} className="md:w-8 md:h-8" /></button>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-10 md:space-y-12 custom-scrollbar no-scrollbar text-start text-black shadow-none">
                      
                      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 text-start shadow-none">
                        {/* LEFT COLUMN CONFIGURATION HUB */}
                        <div className="w-full lg:w-[350px] space-y-8 md:space-y-10 shrink-0 text-start leading-none uppercase shadow-none">
                            <div className="bg-zinc-50 p-5 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-zinc-100 shadow-inner space-y-4 md:space-y-6 text-start shadow-black/5 leading-none shadow-none">
                                <label className={labelClass}>Registry Master Identity Hash Key</label>
                                <div className="relative group/id-reg-panel-input-field text-start leading-none shadow-sm shadow-none">
                                    <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-200 group-hover:text-black transition-colors duration-500 shadow-md shrink-0" size={20}/>
                                    <input 
                                      value={masterId} 
                                      onChange={e=>setMasterId(e.target.value.toUpperCase().replace(/\s/g, '-'))} 
                                      placeholder="AK-ARCHIVE-NODE-HASH" 
                                      className="w-full bg-white p-3.5 md:p-4 pl-12 rounded-xl md:rounded-2xl border-none font-black text-lg md:text-2xl outline-none shadow-xl placeholder:text-zinc-100 italic transition-all focus:ring-8 focus:ring-black/5 text-black leading-none shadow-black/10 shadow-none" 
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-2 md:gap-3 opacity-30 italic leading-none text-start uppercase shadow-none"><ShieldCheck size={14} className="text-emerald-500 shadow-sm shrink-0"/><span className="text-[8px] font-black uppercase tracking-widest leading-none uppercase shadow-none">Handshake Sequence: 100% SECURE_NODE</span></div>
                            </div>

                            <div className="space-y-4 md:space-y-6 text-start leading-none uppercase shadow-none">
                                <div className="flex justify-between items-center px-1 md:px-2 text-start leading-none uppercase shadow-none">
                                   <label className={labelClass}>Spectral Matrix injector Hub Node</label>
                                   <div className="flex items-center gap-1.5 leading-none text-start shadow-none"><div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_#dc2626] shadow-xl shrink-0"/><span className="text-[7px] md:text-[8px] font-bold text-red-600/50 uppercase tracking-widest italic leading-none shadow-none uppercase">Spectral scan active...</span></div>
                                </div>
                                <div className="relative group/specter-reg-search-p text-start leading-none shadow-sm shadow-none">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-red-600 transition-colors shadow-md shrink-0" size={16}/>
                                    <input 
                                        type="text" value={colorSearch} onChange={(e) => setColorSearch(e.target.value)} 
                                        placeholder="SCAN CHROMATIC SYMBOLS..." 
                                        className="w-full bg-zinc-100 p-3.5 md:p-4 pl-12 md:pl-14 rounded-full font-black text-[9px] md:text-[10px] outline-none shadow-inner uppercase tracking-[0.1em] md:tracking-[0.2em] italic focus:bg-white transition-all border border-transparent focus:border-zinc-200 text-black leading-none shadow-black/5 shadow-none"
                                    />
                                </div>
                                <div className="grid grid-cols-6 gap-2.5 p-4 md:p-5 bg-zinc-950 rounded-2xl md:rounded-[2.5rem] shadow-2xl border-[8px] md:border-[12px] border-white/5 max-h-[160px] md:max-h-[190px] overflow-y-auto no-scrollbar relative shadow-black/60 border-white/5 shadow-none">
                                   {chromaticMatrix.map(([node_name_reg_v, node_hex_reg_v]) => (
                                     <button 
                                       key={node_name_reg_v} 
                                       onClick={() => handleInitiateVariantConfiguration(node_name_reg_v)}
                                       className={`w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl border-2 transition-all hover:scale-125 hover:z-50 hover:-rotate-12 active:scale-90 shadow-xl shrink-0 ${activeVariantColor === node_name_reg_v ? 'border-red-600 scale-125 shadow-[0_0_20px_#dc2626] ring-2 ring-white/10' : 'border-white/10 opacity-30 hover:opacity-100 shadow-black/40'}`}
                                       style={{backgroundColor: node_hex_reg_v}}
                                       title={node_name_reg_v}
                                     />
                                   ))}
                                </div>
                            </div>

                            {Object.keys(variants).length > 0 && (
                              <div className="space-y-4 md:space-y-5 animate-in slide-in-from-bottom-4 duration-700 text-start leading-none uppercase shadow-none">
                                 <label className={labelClass}>Active Configured Nodes Hub ({Object.keys(variants).length})</label>
                                 <div className="space-y-2.5 md:space-y-3 max-h-[150px] md:max-h-[250px] overflow-y-auto pr-1 no-scrollbar pt-1 text-start leading-none shadow-none">
                                   {Object.keys(variants).map(synapse_key_node_v => (
                                     <div key={synapse_key_node_v} onClick={() => setActiveVariantColor(synapse_key_node_v)} className={`flex justify-between items-center p-3 md:p-3.5 rounded-xl md:rounded-2xl cursor-pointer transition-all border-2 relative overflow-hidden group shadow-sm shadow-black/5 ${activeVariantColor === synapse_key_node_v ? 'bg-zinc-950 text-white border-black shadow-2xl scale-105 z-20 shadow-black/50' : 'bg-white border-zinc-50 hover:bg-zinc-50 hover:border-zinc-200'}`}>
                                        <div className="flex items-center gap-3 md:gap-3.5 text-start relative z-10 text-start leading-none shadow-none uppercase truncate min-w-0">
                                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 border-white/20 shadow-md transition-transform shrink-0 shadow-none" style={{backgroundColor: ULTIMATE_COLOR_REGISTRY[synapse_key_node_v]}} />
                                          <div className="text-start leading-none shadow-none uppercase truncate">
                                             <span className="font-black text-[10px] md:text-[11px] uppercase italic leading-none truncate block shadow-sm uppercase">{synapse_key_node_v}</span>
                                             <p className="hidden sm:block text-[7px] font-black text-zinc-500 uppercase mt-1.5 leading-none italic leading-none text-start shadow-none uppercase">ID_PROTO_BLOCK_CALIB</p>
                                          </div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); const uv_reg_v = {...variants}; delete uv_reg_v[synapse_key_node_v]; setVariants(uv_reg_v); if(activeVariantColor===synapse_key_node_v) setActiveVariantColor(null); }} className="p-1.5 md:p-2 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all active:scale-75 relative z-10 shrink-0 shadow-2xl border border-transparent hover:border-white/20 leading-none shadow-sm uppercase shadow-none"><Trash size={14} className="md:w-4 md:h-4"/></button>
                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-5 transition-opacity shadow-none" />
                                     </div>
                                   ))}
                                 </div>
                              </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN CALIBRATION WORKSPACE */}
                        <div className="flex-1 text-start leading-none text-black shadow-none min-w-0 uppercase shadow-none">
                            {!activeVariantColor ? (
                              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-zinc-200 bg-zinc-50/50 rounded-[2rem] md:rounded-[4rem] border-4 md:border-8 border-dashed border-zinc-100 p-8 md:p-20 text-center text-start leading-none shadow-inner uppercase shadow-none">
                                 <div className="w-24 h-24 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6 md:mb-10 animate-bounce border-4 md:border-8 border-zinc-50 ring-1 ring-zinc-50 shadow-none">
                                    <ZapOff size={40} className="md:w-16 md:h-16 text-zinc-100 shadow-sm shrink-0" />
                                 </div>
                                 <h3 className="text-2xl md:text-[50px] font-black uppercase tracking-tighter text-zinc-950 mb-3 md:mb-4 italic leading-none text-center shadow-sm uppercase leading-none shadow-none">Handshake Required</h3>
                                 <p className="font-black uppercase tracking-widest text-zinc-300 max-w-md italic text-[10px] md:text-[11px] leading-relaxed text-center leading-loose shadow-none uppercase shadow-none">SELECT A CHROMATIC SYMBOL FROM THE HUB MATRIX TO INITIALIZE MASTER RECALIBRATION PROTOCOLS AND GENESIS BLOCK CONFIGURATION DETAILED MODULES.</p>
                              </div>
                            ) : (
                              <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-right-10 duration-1000 text-start text-black leading-none shadow-none uppercase shadow-none">
                                 
                                 <div className="flex items-center gap-4 md:gap-8 pb-6 md:pb-8 border-b-4 md:border-b-8 border-zinc-50 text-start leading-none shadow-none uppercase shadow-none">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] border-[6px] md:border-[10px] border-white shadow-2xl relative shadow-black/10 ring-1 ring-zinc-100 shrink-0 shadow-none" style={{backgroundColor: ULTIMATE_COLOR_REGISTRY[activeVariantColor]}}>
                                       <div className="absolute inset-0 bg-white/40 rounded-lg mix-blend-overlay shadow-none shadow-none" />
                                    </div>
                                    <div className="space-y-1 md:space-y-2 text-start leading-none shadow-none min-w-0 shadow-none">
                                       <h3 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none italic text-black truncate uppercase leading-none shadow-sm shadow-none">{activeVariantColor}</h3>
                                       <div className="flex items-center gap-3 md:gap-6 mt-1 md:mt-3 text-start leading-none shadow-none shadow-none">
                                           <p className="text-red-600 font-black text-xs md:text-[18px] uppercase tracking-[0.3em] md:tracking-[0.8em] animate-pulse italic leading-none uppercase shadow-sm shadow-none">NODE_CALIBRATING_SYNC</p>
                                           <div className="flex gap-2 items-center leading-none shrink-0 shadow-none"><div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full shadow-[0_0_14px_#10b981] animate-ping shrink-0 shadow-none"/><div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full opacity-40 shadow-[0_0_10px_#10b981] shrink-0 shadow-none"/></div>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 text-start leading-none shadow-none uppercase shadow-none">
                                    <div className="space-y-3 md:space-y-4 text-start leading-none shadow-none uppercase shadow-none">
                                      <label className={labelClass}>Registry Designation Label (EN Node Hub)</label>
                                      <div className="relative group/label-en-reg text-start leading-none shadow-none shadow-none">
                                          <input value={variants[activeVariantColor]?.nameEn || ''} onChange={e=>updateActiveVariantData('nameEn', e.target.value)} placeholder="DESIGNATION PROTOCOL LABEL..." className="w-full bg-zinc-50 p-4 md:p-5 rounded-xl md:rounded-3xl border-none font-black text-lg md:text-2xl outline-none focus:ring-8 focus:ring-black/5 shadow-inner transition-all italic leading-none text-black leading-none shadow-black/5 shadow-none" />
                                          <Globe className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-100 group-focus-within/label-en-reg:text-black transition-colors shrink-0 shadow-none" size={20}/>
                                      </div>
                                    </div>
                                    <div className="space-y-3 md:space-y-4 text-start leading-none shadow-none shadow-none" dir="rtl">
                                      <label className={labelClass} dir="rtl">بروتوكول مسمى الهوية الهيكلي (AR Node Hub)</label>
                                      <div className="relative group/label-ar-reg text-start leading-none shadow-none shadow-none">
                                          <input value={variants[activeVariantColor]?.nameAr || ''} onChange={e=>updateActiveVariantData('nameAr', e.target.value)} placeholder="مسمى الهوية بالأرشيف الرقمي..." className="w-full bg-zinc-50 p-4 md:p-5 rounded-xl md:rounded-3xl border-none font-black text-xl md:text-3xl outline-none focus:ring-4 focus:ring-black/5 shadow-inner text-right arabic transition-all italic leading-none text-black leading-none shadow-black/5 shadow-none" dir="rtl" />
                                          <Languages className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-100 group-focus-within/label-ar-reg:text-black transition-colors shrink-0 shadow-none" size={20}/>
                                      </div>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 text-start leading-none shadow-none uppercase shadow-none">
                                    <div className="space-y-3 md:space-y-4 text-start leading-none shadow-none uppercase shadow-none">
                                      <label className={labelClass}>Archival Identity Stream (EN Registry Node)</label>
                                      <textarea value={variants[activeVariantColor]?.descriptionEn || ''} onChange={e=>updateActiveVariantData('descriptionEn', e.target.value)} placeholder="NEURAL ARCHIVE IDENTITY NARRATIVE STREAM DATA BLOCK..." className="w-full bg-zinc-50 p-4 md:p-6 rounded-xl md:rounded-[2rem] border-none font-bold text-xs md:text-[13px] outline-none focus:ring-8 focus:ring-black/5 shadow-inner h-24 md:h-28 resize-none italic leading-relaxed text-zinc-600 transition-all shadow-none shadow-none" />
                                    </div>
                                    <div className="space-y-3 md:space-y-4 text-start leading-none shadow-none shadow-none" dir="rtl">
                                      <label className={labelClass} dir="rtl">رواية التصميم والإنتاج الهيكلي (AR Registry Node)</label>
                                      <textarea value={variants[activeVariantColor]?.descriptionAr || ''} onChange={e=>updateActiveVariantData('descriptionAr', e.target.value)} placeholder="رواية الأرشيف الهيكلي والإنتاجي للقطعة المصممة..." className="w-full bg-zinc-50 p-4 md:p-6 rounded-xl md:rounded-[2.5rem] border-none font-bold text-base md:text-lg outline-none focus:ring-8 focus:ring-black/5 shadow-inner text-right arabic h-24 md:h-28 resize-none leading-relaxed text-zinc-600 transition-all shadow-none shadow-none" dir="rtl" />
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-start leading-none shadow-none uppercase shadow-none">
                                    <div className="space-y-2 md:space-y-3 text-start leading-none shadow-none uppercase shadow-none">
                                      <label className={labelClass}>Capital Valuation (Price Node)</label>
                                      <div className="relative group/price-v-reg text-start leading-none shadow-none shadow-none">
                                          <input type="number" value={variants[activeVariantColor]?.price || 0} onChange={e=>updateActiveVariantData('price', e.target.value)} className="w-full bg-zinc-950 text-white p-4 md:p-5 rounded-2xl md:rounded-3xl font-black border-none text-2xl md:text-[35px] shadow-2xl italic text-center focus:ring-8 focus:ring-red-600/20 transition-all leading-none shadow-black/40 shadow-none shadow-none" />
                                          <span className="absolute bottom-2 right-3 text-[7px] md:text-[9px] font-black text-zinc-700 italic uppercase leading-none shadow-sm uppercase shadow-none">QAR</span>
                                      </div>
                                    </div>
                                    <div className="space-y-2 md:space-y-3 text-start leading-none shadow-none uppercase shadow-none">
                                      <label className={labelClass}>Original MSPR Flow</label>
                                      <div className="relative group/orig-v-reg text-start leading-none shadow-none shadow-none">
                                          <input type="number" value={variants[activeVariantColor]?.originalPrice || 0} onChange={e=>updateActiveVariantData('originalPrice', e.target.value)} className="w-full bg-zinc-100 p-4 md:p-5 rounded-2xl md:rounded-3xl font-black border-none text-lg md:text-2xl text-zinc-300 shadow-inner italic text-center focus:ring-8 focus:ring-zinc-200 transition-all leading-none shadow-black/5 shadow-none shadow-none" />
                                          <div className="absolute top-1/2 left-1/2 w-3/4 h-0.5 md:h-1 bg-rose-600/10 -translate-x-1/2 -translate-y-1/2 rotate-[-5deg] pointer-events-none group-hover/orig-v-reg:bg-rose-600/30 transition-colors shadow-none shadow-none shadow-none" />
                                      </div>
                                    </div>
                                    <div className="space-y-2 md:space-y-3 text-start leading-none shadow-none uppercase shadow-none">
                                      <label className={labelClass}>Vault Reserves (Stock)</label>
                                      <div className="relative group/stock-v-reg text-start leading-none shadow-none shadow-none">
                                          <input type="number" value={variants[activeVariantColor]?.stock || 0} onChange={e=>updateActiveVariantData('stock', e.target.value)} className="w-full bg-zinc-50 p-4 md:p-5 rounded-2xl md:rounded-3xl font-black border-none text-2xl md:text-[35px] shadow-inner italic text-center focus:ring-8 focus:ring-black/5 transition-all leading-none text-black leading-none shadow-black/5 shadow-none shadow-none" />
                                          <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-100 group-hover:text-black transition-colors shrink-0 shadow-none" size={20}/>
                                      </div>
                                    </div>
                                    <div className="space-y-2 md:space-y-3 text-start leading-none shadow-none uppercase shadow-none">
                                      <label className={labelClass}>Neural Views Node</label>
                                      <div className="relative group/views-v-reg text-start leading-none shadow-none shadow-none">
                                          <input type="number" value={variants[activeVariantColor]?.views || 0} onChange={e=>updateActiveVariantData('views', Number(e.target.value))} className="w-full bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl font-black border-2 border-zinc-100 text-2xl md:text-[35px] shadow-xl text-red-600 italic text-center focus:ring-8 focus:ring-red-600/5 transition-all leading-none shadow-red-600/5 shadow-none shadow-none" />
                                          <Eye className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-100 group-hover:text-red-600 transition-colors shrink-0 shadow-none" size={20}/>
                                      </div>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 text-start leading-none shadow-none uppercase shadow-none">
                                    <div className="space-y-3 md:space-y-4 text-start leading-none shadow-none uppercase shadow-none">
                                      <label className={labelClass}>Identity Matrix Strategic Category</label>
                                      <div className="relative group/cat-v-reg text-start leading-none shadow-none shadow-none">
                                          <select value={variants[activeVariantColor]?.category || 'Men'} onChange={e=>updateActiveVariantData('category', e.target.value)} className="w-full bg-zinc-50 p-4 md:p-5 rounded-xl md:rounded-3xl font-black border-none outline-none appearance-none shadow-inner text-base md:text-xl uppercase italic cursor-pointer text-black leading-none shadow-black/5 shadow-none">
                                             {['Men', 'Women', 'New Collection', 'Best Sellers', 'Exclusive Offers'].map(opt_v_reg => <option key={opt_v_reg} value={opt_v_reg}>{opt_v_reg.toUpperCase()}</option>)}
                                          </select>
                                          <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none shrink-0 shadow-none"/>
                                      </div>
                                    </div>
                                    <div className="space-y-3 md:space-y-4 text-start leading-none shadow-none uppercase shadow-none">
                                      <label className={labelClass}>Archival Sub-Protocol Strategic Layer</label>
                                      <div className="relative group/sub-v-reg text-start leading-none shadow-none shadow-none">
                                          <select value={variants[activeVariantColor]?.subCategory || ''} onChange={e=>updateActiveVariantData('subCategory', e.target.value)} className="w-full bg-white p-4 md:p-5 rounded-xl md:rounded-3xl border-2 border-zinc-100 font-black text-base md:text-xl outline-none shadow-xl uppercase italic cursor-pointer focus:ring-4 focus:ring-black/5 text-black leading-none shadow-black/5 shadow-none">
                                              <option value="">SCAN PROTOCOL LAYER NODE...</option>
                                              {[...(variants[activeVariantColor]?.category === 'Men' ? MENS_SUB_CATEGORIES_CONFIG : WOMENS_SUB_CATEGORIES_CONFIG)].map(sub_v_reg => (
                                                  <option key={sub_v_reg.key} value={sub_v_reg.key}>{sub_v_reg.key.toUpperCase()}</option>
                                              ))}
                                          </select>
                                          <Layers2 size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-100 group-hover:text-red-600 transition-colors pointer-events-none shrink-0 shadow-none"/>
                                      </div>
                                    </div>
                                 </div>

                                 {/* Visual Buffer stream Protocol Sync */}
                                 <div className="space-y-4 md:space-y-6 text-start leading-none shadow-none uppercase shadow-none">
                                    <div className="flex justify-between items-end px-2 md:px-4 text-start leading-none shadow-none shadow-none">
                                       <label className={labelClass}>Visual Matrix Buffer stream (Multi-Node Sync Protocol)</label>
                                       <div className="flex items-center gap-2 text-[7px] md:text-[8px] font-black text-red-600/60 uppercase tracking-widest italic animate-pulse shadow-none shrink-0"><Radar size={14} className="shrink-0"/> LIVE_QUANTUM_STREAM_ACTIVE</div>
                                    </div>
                                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 custom-scrollbar no-scrollbar text-start px-2 shadow-none shadow-none">
                                       <label className="w-28 h-40 md:w-36 md:h-52 rounded-2xl md:rounded-[2.5rem] border-4 border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-white transition-all duration-700 shrink-0 shadow-inner group/reg-v-upload relative overflow-hidden text-start leading-none uppercase shadow-none">
                                          <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity shadow-none" />
                                          <Upload size={28} strokeWidth={0.5} className="text-zinc-200 group-hover:text-black transition-all group-hover:scale-110 md:w-9 md:h-9 shrink-0 shadow-none" />
                                          <span className="text-[8px] md:text-[10px] font-black uppercase mt-3 md:mt-4 text-zinc-300 group-hover:text-black tracking-[0.2em] relative z-10 italic leading-none pl-[0.2em] shadow-none uppercase text-center shadow-none">INJECT_REGISTRY_NODE</span>
                                          <input type="file" multiple accept="image/*" onChange={handleVariantMediaStream} className="hidden" />
                                       </label>
                                       
                                       {(variants[activeVariantColor]?.images || []).map((img_src_v, i_img_idx_v) => (
                                         <div key={i_img_idx_v} className="relative w-28 h-40 md:w-36 md:h-52 rounded-2xl md:rounded-[2.5rem] overflow-hidden shrink-0 shadow-xl border-2 md:border-4 border-white group/vis-node-v transition-all hover:-translate-y-2 ring-1 ring-zinc-100 active:scale-95 text-start leading-none shadow-black/50 shadow-none">
                                            <img src={img_src_v} className="w-full h-full object-cover grayscale brightness-110 md:group-hover:grayscale-0 md:group-hover:scale-110 transition-all duration-1000 shadow-inner shadow-none" alt="" />
                                            <div className="absolute inset-0 bg-rose-600/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center cursor-pointer gap-2 md:gap-4 backdrop-blur-sm shadow-2xl leading-none text-center shadow-none uppercase" onClick={() => {
                                                const updated_imgs_v = [...(variants[activeVariantColor!]?.images || [])].filter((_, f_idx_v) => f_idx_v !== i_img_idx_v);
                                                updateActiveVariantData('images', updated_imgs_v);
                                            }}>
                                                <Trash size={32} className="text-white animate-pulse md:w-10 md:h-10 shrink-0 shadow-none" strokeWidth={1} />
                                                <span className="text-[6px] md:text-[8px] font-black text-white uppercase tracking-widest italic text-center leading-none uppercase shadow-none">Purge Archival Node Data Block</span>
                                            </div>
                                         </div>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="space-y-6 text-start leading-none shadow-none uppercase shadow-none">
                                    <label className={labelClass}>Neural Dimensional Matrix (Multi-Region Sizing Hub)</label>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-4 px-1 md:px-2 text-start leading-none shadow-none shadow-none">
                                       {Object.entries(SIZE_LABELS).map(([sz_k_v, sz_l_v]) => {
                                         const isSz_active_v = variants[activeVariantColor!]?.sizes?.includes(sz_k_v);
                                         return (
                                           <button 
                                              key={sz_k_v} 
                                              onClick={() => {
                                                  const currList_v = [...(variants[activeVariantColor!]?.sizes || [])];
                                                  updateActiveVariantData('sizes', isSz_active_v ? currList_v.filter(k_v=>k_v!==sz_k_v) : [...currList_v, sz_k_v]);
                                              }} 
                                              className={`py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[11px] md:text-[13px] uppercase transition-all border-2 md:border-4 active:scale-90 relative overflow-hidden group/sz-btn-v leading-none shadow-sm shadow-none ${isSz_active_v ? 'bg-zinc-950 text-white border-black shadow-2xl scale-105 z-10 shadow-black/60 shadow-none' : 'bg-white border-zinc-100 text-zinc-200 hover:border-zinc-950 hover:text-black hover:shadow-xl shadow-none'}`}
                                           >
                                             <div className="relative z-10 text-center leading-none shadow-none shadow-none">
                                                 {sz_l_v.en} 
                                                 <span className={`block text-[6px] md:text-[8px] mt-0.5 md:mt-1 italic tracking-[0.1em] font-black transition-opacity duration-700 leading-none shadow-none shadow-none ${isSz_active_v ? 'opacity-40 shadow-none' : 'opacity-10 group-hover:opacity-40 shadow-none'}`}>{sz_l_v.ar}</span>
                                             </div>
                                           </button>
                                         );
                                       })}
                                    </div>
                                 </div>

                                 <div className="bg-zinc-50 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-2 md:border-4 border-white shadow-xl space-y-4 md:space-y-6 relative overflow-hidden group/vid-node-v text-start leading-none shadow-black/5 shadow-none shadow-none">
                                      <div className="relative group/vid-fld-v z-10 text-start leading-none shadow-sm shadow-black/5 shadow-none shadow-none">
                                          <LinkIcon className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-zinc-100 group-focus-within:text-black transition-colors md:w-6 md:h-6 shrink-0 shadow-none" size={20} />
                                          <input 
                                              value={variants[activeVariantColor]?.videoUrl || ''} 
                                              onChange={e=>updateActiveVariantData('videoUrl', e.target.value)} 
                                              placeholder="INJECT ARCHIVAL MP4 SOURCE OR NEURAL CORE STREAM LINK..." 
                                              className="w-full bg-white p-4 md:p-5 pl-12 md:pl-14 rounded-xl md:rounded-2xl font-black border-none text-[10px] md:text-[13px] outline-none shadow-inner italic focus:ring-4 md:focus:ring-8 focus:ring-black/5 transition-all text-black leading-none shadow-md shadow-black/10 shadow-none uppercase" 
                                          />
                                      </div>
                                 </div>
                              </div>
                            )}
                        </div>
                      </div>
                  </div>

                  {/* MODAL ACTION HANDSHAKE PROTOCOL - PRESERVED COMPLETELY */}
                  <div className="p-6 md:p-8 bg-zinc-50/95 backdrop-blur-2xl border-t-4 md:border-t-8 border-zinc-100 shrink-0 flex flex-col md:flex-row gap-3 md:gap-6 z-[1000] shadow-2xl relative text-start leading-none shadow-black/10 shadow-none">
                      <button 
                        onClick={() => setShowForm(false)} 
                        disabled={isSaving} 
                        className="flex-1 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-base md:text-xl uppercase tracking-widest border-2 md:border-4 border-zinc-200 hover:bg-white hover:text-rose-600 hover:border-rose-600 transition-all italic active:scale-95 disabled:opacity-20 leading-none shadow-none"
                      >
                          Abort Protocol
                      </button>
                      <button 
                        onClick={commitMasterRegistrySync} 
                        disabled={isSaving || Object.keys(variants).length === 0} 
                        className="flex-[2] py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-lg md:text-2xl uppercase tracking-[0.2em] md:tracking-[0.3em] bg-black text-white hover:bg-red-600 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.5)] active:scale-90 disabled:bg-zinc-200 italic flex items-center justify-center gap-4 md:gap-5 leading-none shadow-none"
                      >
                          <div className="relative z-10 flex items-center justify-center gap-3 md:gap-5 shadow-none">
                             {isSaving ? (
                                <>
                                   <Loader2 className="animate-spin shadow-xl shrink-0 shadow-none" size={24}/> 
                                   <span className="tracking-widest text-xs md:text-xl shadow-none">Synchronizing Registry...</span>
                                </>
                             ) : (
                                <>
                                   <Save size={24} className="md:w-7 md:h-7 group-hover:rotate-12 transition-transform duration-700 shadow-xl shadow-white/5 ring-1 ring-white/20 shrink-0 shadow-none"/>
                                   <span className="tracking-[0.3em] md:tracking-[0.4em] transition-all duration-700 text-sm md:text-xl shadow-none">Commit Neural Sync Protocol</span>
                                </>
                             )}
                          </div>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* FIXED GLOBAL PULSE CONTROLS FOR ALL VIEWPORTS */}
      <div className="fixed bottom-14 md:bottom-16 right-4 md:right-6 flex flex-col gap-3 md:gap-4 z-[1000] text-start leading-none shadow-none uppercase">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="p-3 md:p-3.5 bg-black text-white rounded-full shadow-2xl hover:bg-red-600 transition-all active:scale-75 border-2 md:border-4 border-white/10 ring-1 ring-black/10 group shadow-black/60 shadow-xl ring-offset-2 ring-offset-zinc-50 group-hover:rotate-45 leading-none shadow-none uppercase"><ArrowUpRight size={20} className="md:w-5 md:h-5 group-hover:rotate-45 transition-transform duration-500 shadow-md shrink-0 shadow-none"/></button>
          <button onClick={() => addLog("System wide sync manual pulse heartbeat initiated", "success")} className="p-3 md:p-3.5 bg-white text-black rounded-full shadow-2xl hover:bg-zinc-100 transition-all active:scale-75 border-2 md:border-4 border-zinc-50 ring-1 ring-black/10 shadow-black/10 shadow-xl ring-offset-2 ring-offset-zinc-50 leading-none shadow-none uppercase"><ZapIcon size={20} className="md:w-5 md:h-5 text-zinc-900 animate-pulse shadow-md shrink-0 shadow-none"/></button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; border: 1px solid white; box-shadow: inset 0 0 5px rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .arabic { font-family: 'Tajawal', sans-serif; font-weight: 900; }
        .italic { font-style: italic; }
        .scale-102 { transform: scale(1.015); }
        .animate-spin-slow { animation: spin 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
      `}</style>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Admin;