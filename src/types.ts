export type Language = 'en' | 'ar';

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: 'Men' | 'Women' | 'New Collection' | 'Best Sellers' | 'Offers';
  subCategory: string;
  sizes: string[];
  colors: string[];
  images: string[];
  videoUrl?: string;
  stock: number;
  views: number;
  salesCount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'Online' | 'COD';
  date: string;
  day: string;
  time: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Translation {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export type SortOrder = 'newest' | 'price-asc' | 'price-desc';
