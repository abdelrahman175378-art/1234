/**
 * AK ATELIER - ARCHIVAL TYPE DEFINITIONS
 * =========================================================================================
 * VERSION: 2.1.0 (NEURAL SYNC EDITION)
 * This file defines the structural integrity of the commercial and identity data models.
 * =========================================================================================
 */

export type Language = 'en' | 'ar';

/** 🧬 THE CHROMATIC ASSET MODEL */
export interface ProductVariant {
  color: string;
  category: 'Men' | 'Women' | 'New Collection' | 'Best Sellers' | 'Offers';
  subCategory: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  originalPrice: number;
  price: number;
  discountPercentage: number;
  stock: number;
  views: number;
  salesCount: number;
  sizes: string[];
  images: string[];
  videoUrl: string;
}

/** 📦 THE MASTER ARCHIVE ENTRY */
export interface Product {
  id: string;
  createdAt: string;
  variants: { [color: string]: ProductVariant }; 
  outfitRecommendationIds?: string[];
}

/** 👤 THE IDENTITY PERSONA MODEL */
export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  photo?: string;
  registrationDate: string;
  registrationTime: string;
  loginMethod: 'Email' | 'Phone' | 'Biometric' | 'Social' | 'Neural' | 'Standard'; 
  biometricVerified?: boolean;
}

/** 📝 THE ARCHIVAL FEEDBACK PROTOCOL */
export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  photos: string[];
  date: string;
}

/** 🛒 THE TRANSACTIONAL UNIT MODEL */
export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  selectedSize: string;
}

/** 🛍️ THE COMMERCIAL IDENTITY PACKET (ORDER) */
export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Completed'; 
  paymentMethod: 'Online' | 'COD';
  date: string;
  day: string;
  time: string;
  createdAt: any;
  /** 🔄 NEURAL DELIVERY PROTOCOL */
  estimatedDeliveryDays?: number; 
  /** 🔗 IDENTITY BRIDGING */
  userEmail?: string;
  userId?: string;
  userName?: string; 
}

/** 🔄 REFUND REQUISITION PROTOCOL */
export interface RefundRequest {
  id?: string;
  refundId: string;
  orderId: string;
  userEmail: string;
  userName: string;
  reason: string;
  method: 'whatsapp' | 'email';
  evidence?: string; // Base64 or Cloudinary URL
  timestamp: string;
  status: 'pending' | 'Processing' | 'Completed' | 'Rejected';
}

/** 📊 ANALYTICS SORTING PROTOCOLS */
export type SortOrder = 'newest' | 'price-asc' | 'price-desc' | 'popular';