export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description: string;
  category: string;
  sizes: string[];
  colors: ProductColor[];
  material?: string;
  length?: string;
  season?: string;
  rating?: number;
  isNew?: boolean;
  isSale?: boolean;
}
export interface ProductColor {
  name: string;
  hex: string;
}
export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: ProductColor;
}
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  location?: string;
}
export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  customerName: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Pending'; // Pending kept for legacy mock data compatibility
  cancelReason?: string;
  shippingAddress?: Address;
  paymentMethod?: PaymentMethod;
}
export interface Category {
  id: string;
  name: string;
  icon: string;
}
export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  tag?: string;
  image: string;
  backgroundColor: string;
}
