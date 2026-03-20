
export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  BUYER = 'BUYER'
}

export enum Language {
  RW = 'rw',
  EN = 'en'
}

export interface BusinessProfile {
  businessName: string;
  tinNumber: string;
  businessAddress: string;
  businessType: string;
  idDocument?: string; // Base64
  submittedAt: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  language: Language;
  avatar?: string;
  isSuspended?: boolean;
  isLive?: boolean;
  isVerified?: boolean;
  verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  invitationStatus?: 'none' | 'invited' | 'accepted';
  businessProfile?: BusinessProfile;
}

export interface UserPreferences {
  locationEnabled: boolean;
  lactationMode: boolean; // Maternal Care Mode
  theme: 'light' | 'dark';
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AdBanner {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: { rw: string; en: string };
  subtitle: { rw: string; en: string };
  ctaText: { rw: string; en: string };
  targetCategory?: string;
  priority: number;
}

export interface LiveStream {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  featuredProductId?: string;
  viewerCount: number;
  startTime: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  status: 'active' | 'draft' | 'scheduled' | 'flagged';
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  variantId?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  storeId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  trackingNumber?: string;
  shippingMethod: string;
  paymentMethod?: 'MOMO' | 'CARD' | 'CASH';
  paymentStatus?: 'UNPAID' | 'PENDING' | 'PAID';
  shippingAddress: {
    district: string;
    sector: string;
    cell: string;
    village: string;
    details: string;
  };
  createdAt: string;
}

export interface SellerWallet {
  balance: number;
  pendingPayout: number;
  totalEarned: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'sale' | 'payout' | 'fee';
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface SystemConfig {
  commissionRate: number;
  vatRate: number;
  withdrawalThreshold: number;
  momoEnabled: boolean;
  maintenanceMode: boolean;
}

export interface Dispute {
  id: string;
  orderId: string;
  reason: string;
  status: 'open' | 'resolved' | 'closed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  timestamp: string;
}

export interface JobPost {
  id: string;
  employerId: string;
  companyName: string;
  title: string;
  description: string;
  category: string;
  salaryRange: string;
  location: string;
  type: string;
  deadline: string;
  status: 'active' | 'closed';
}

export interface SkillAd {
  id: string;
  userId: string;
  fullName: string;
  category: string;
  title: string;
  description: string;
  priceEstimate: number;
  location: string;
  yearsExperience: number;
  verified: boolean;
  status: 'active' | 'inactive';
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
}
