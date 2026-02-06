import { Translation } from './types';

// Exhaustive COLOR_MAP with all essential and luxury fashion shades
export const COLOR_MAP: Record<string, string> = {
  'Black': '#000000',
  'Jet Black': '#0A0A0A',
  'Charcoal': '#36454F',
  'Anthracite': '#293133',
  'Slate': '#708090',
  'Grey': '#808080',
  'Silver': '#C0C0C0',
  'White': '#FFFFFF',
  'Off-White': '#F5F5F5',
  'Ivory': '#FFFFF0',
  'Cream': '#FFFDD0',
  'Beige': '#F5F5DC',
  'Champagne': '#F7E7CE',
  'Sand': '#C2B280',
  'Camel': '#C19A6B',
  'Tan': '#D2B48C',
  'Brown': '#964B00',
  'Chocolate': '#7B3F00',
  'Khaki': '#C3B091',
  'Olive': '#808000',
  'Sage': '#BCB88A',
  'Forest Green': '#228B22',
  'Emerald': '#50C878',
  'Mint': '#98FF98',
  'Navy Blue': '#000080',
  'Royal Blue': '#4169E1',
  'Sky Blue': '#87CEEB',
  'Teal': '#008080',
  'Turquoise': '#40E0D0',
  'Cyan': '#00FFFF',
  'Lavender': '#E6E6FA',
  'Purple': '#800080',
  'Magenta': '#FF00FF',
  'Burgundy': '#800020',
  'Maroon': '#800000',
  'Crimson': '#DC143C',
  'Red': '#FF0000',
  'Coral': '#FF7F50',
  'Peach': '#FFDAB9',
  'Orange': '#FFA500',
  'Mustard': '#FFDB58',
  'Yellow': '#FFFF00',
  'Gold': '#D4AF37',
  'Bronze': '#CD7F32',
  'Copper': '#B87333',
  'Rose Pink': '#FF66CC',
  'Hot Pink': '#FF69B4',
  'Baby Pink': '#F4C2C2'
};

export const DELIVERY_FEE = 0;
export const DELIVERY_THRESHOLD = 0;

export const SIZE_LABELS: Record<string, { en: string, ar: string }> = {
  'XXS': { en: 'XXS', ar: 'صغير جداً جداً' },
  'XS': { en: 'XS', ar: 'صغير جداً' },
  'S': { en: 'Small', ar: 'صغير' },
  'M': { en: 'Medium', ar: 'متوسط' },
  'L': { en: 'Large', ar: 'كبير' },
  'XL': { en: 'XL', ar: 'كبير جداً' },
  'XXL': { en: '2XL', ar: 'كبير مضاعف' },
  '3XL': { en: '3XL', ar: 'كبير جداً مضاعف' },
};

export const TRANSLATIONS: Translation = {
  shopNow: { en: 'Shop Now', ar: 'تسوق الآن' },
  explore: { en: 'Explore Collection', ar: 'استكشف التشكيلة' },
  men: { en: 'Men', ar: 'رجالي' },
  women: { en: 'Women', ar: 'نسائي' },
  all: { en: 'All Items', ar: 'كل المنتجات' },
  cart: { en: 'Cart', ar: 'حقيبة التسوق' },
  checkout: { en: 'Checkout', ar: 'إتمام الدفع' },
  admin: { en: 'Admin', ar: 'لوحة التحكم' },
  home: { en: 'Home', ar: 'الرئيسية' },
  deliveryInfo: { en: 'Free delivery across Qatar.', ar: 'توصيل مجاني لجميع مناطق قطر.' },
  contactUs: { en: 'Contact Us', ar: 'اتصل بنا' },
  aboutUs: { en: 'The Narrative', ar: 'روايتنا' },
  addToCart: { en: 'Add to Cart', ar: 'أضف للحقيبة' },
  total: { en: 'Total', ar: 'المجموع الإجمالي' },
  deliveryFee: { en: 'Delivery Fee', ar: 'رسوم التوصيل' },
  free: { en: 'Free', ar: 'مجاني' },
  orderSummary: { en: 'Order Summary', ar: 'ملخص الطلب' },
  placeOrder: { en: 'Secure Order', ar: 'تأكيد الطلب الآمن' },
  verifiedReviews: { en: 'Verified Feedback', ar: 'آراء موثقة' },
  styleWith: { en: 'Complete the Look', ar: 'نسق مع هذه القطعة' },
  lookbook: { en: 'The Editorial', ar: 'الإصدار الحصري' },
  brandVision: { en: 'Design Philosophy', ar: 'فلسفة التصميم' },
  brandStory: { en: 'Born in the heart of Qatar, AK Modern is a movement that bridges traditional elegance with the raw energy of global street luxury.', ar: 'ولدت AK Modern في قلب قطر، وهي حركة تجمع بين الأناقة التقليدية والطاقة الخام لفخامة الشوارع العالمية.' },
  writeReview: { en: 'Write a Review', ar: 'اكتب تقييماً' },
  placeholderName: { en: 'Enter Name', ar: 'أدخل الاسم' },
  placeholderPhone: { en: 'Enter Phone', ar: 'أدخل رقم الهاتف' },
  onlinePayment: { en: 'Online Payment', ar: 'دفع عبر الإنترنت' },
  cod: { en: 'Cash on Delivery', ar: 'الدفع عند الاستلام' },
  
  // Men's Subcategories
  mensLongSleeveTshirt: { en: "Men's Long Sleeve T-shirt", ar: "تي شيرت رجالي بأكمام طويلة" },
  mensPullovers: { en: "Men's Pullovers", ar: "بلوفرات رجالية" },
  mensSweatshirtsHoodies: { en: "Men's Sweatshirts & Hoodies", ar: "سويت شيرت وهوديز رجالي" },
  mensPolo: { en: "Men's Polo", ar: "قمصان بولو رجالية" },
  mensShortSleeveTshirt: { en: "Men's Short Sleeve T-shirt", ar: "تي شيرت رجالي بأكمام قصيرة" },
  mensShirts: { en: "Men's Shirts", ar: "قمصان رجالية" },
  mensSwimwear: { en: "Men's Swimwear", ar: "ملابس سباحة رجالية" },
  mensShorts: { en: "Men's Shorts", ar: "شورتات رجالية" },
  mensJeansPants: { en: "Men's Jeans and Pants", ar: "جينز وبناطيل رجالية" },
  mensFootwear: { en: "Men's Footwear", ar: "أحذية رجالية" },
  mensAccessories: { en: "Men's Accessories", ar: "إكسسوارات رجالية" },

  // Women's Subcategories
  womensPullovers: { en: "Pullover", ar: "بلوفرات نسائية" },
  womensSweatshirts: { en: "Sweatshirts", ar: "سويت شيرت نسائي" },
  womensShirtsBlouses: { en: "Women's Shirts & Blouses", ar: "قمصان وبلوزات نسائية" },
  womensKimonosCardigans: { en: "Women's Kimonos & Cardigans", ar: "كيمونو وكارديجان نسائي" },
  womensJeansPants: { en: "Women's Jeans & Pants", ar: "جينز وبناطيل نسائية" },
  womensRompersJumpsuits: { en: "Women's Rompers & Jumpsuits", ar: "جمبسوت ورومبر نسائي" },
  womensDresses: { en: "Women's Dresses", ar: "فساتين نسائية" },
  womensShorts: { en: "Women's Shorts", ar: "شورتات نسائية" },
  womensSkirts: { en: "Women's Skirts", ar: "تنانير نسائية" },
  womensAccessories: { en: "Women's Accessories", ar: "إكسسوارات نسائية" },
  womensFootwear: { en: "Women's Footwear", ar: "أحذية نسائية" },
};

export const MENS_SUB_CATEGORIES = [
  'mensLongSleeveTshirt', 'mensPullovers', 'mensSweatshirtsHoodies', 'mensPolo', 'mensShortSleeveTshirt', 'mensShirts', 'mensSwimwear', 'mensShorts', 'mensJeansPants', 'mensFootwear', 'mensAccessories'
];

export const WOMENS_SUB_CATEGORIES = [
  'womensPullovers', 'womensSweatshirts', 'womensShirtsBlouses', 'womensKimonosCardigans', 'womensJeansPants', 'womensRompersJumpsuits', 'womensDresses', 'womensShorts', 'womensSkirts', 'womensAccessories', 'womensFootwear'
];

export const MENS_SUB_CATEGORIES_CONFIG = [
  { key: 'mensLongSleeveTshirt', img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800' },
  { key: 'mensPullovers', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800' },
  { key: 'mensSweatshirtsHoodies', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800' },
  { key: 'mensPolo', img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800' },
  { key: 'mensShortSleeveTshirt', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800' },
  { key: 'mensShirts', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800' },
  { key: 'mensSwimwear', img: 'https://images.unsplash.com/photo-1502389614483-e475fc34407e?q=80&w=800' },
  { key: 'mensShorts', img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800' },
  { key: 'mensJeansPants', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800' },
  { key: 'mensFootwear', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800' },
  { key: 'mensAccessories', img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800' }
];

export const WOMENS_SUB_CATEGORIES_CONFIG = [
  { key: 'womensPullovers', img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800' },
  { key: 'womensSweatshirts', img: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?q=80&w=800' },
  { key: 'womensShirtsBlouses', img: 'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?q=80&w=800' },
  { key: 'womensKimonosCardigans', img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800' },
  { key: 'womensJeansPants', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800' },
  { key: 'womensRompersJumpsuits', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800' },
  { key: 'womensDresses', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800' },
  { key: 'womensShorts', img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800' },
  { key: 'womensSkirts', img: 'https://images.unsplash.com/photo-1577900232427-18219b9166a0?q=80&w=800' },
  { key: 'womensAccessories', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800' },
  { key: 'womensFootwear', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800' }
];

export const CONTACT_WHATSAPP = '97470342042';
export const CONTACT_EMAIL = 'akmodernqa@gmail.com';
export const ASSETS = {
  heroBg: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2600&auto=format&fit=crop',
  paymentQR: 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=97470342042&color=000&bgcolor=fff&margin=1',
  backgroundMusic: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  menCover: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200',
  womenCover: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200',
  lookbook1: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200',
  lookbook2: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200',
  lookbook3: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=1200'
};
