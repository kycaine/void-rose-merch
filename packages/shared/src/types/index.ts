export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'cancelled'
  | 'shipped'
  | 'completed';

export type PaymentProviderType = 'simulated' | 'midtrans';

export type PaymentStatus =
  | 'pending'
  | 'settlement'
  | 'capture'
  | 'deny'
  | 'cancel'
  | 'expire'
  | 'failure';

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string; // 'S' | 'M' | 'L' | 'XL' | 'ONE SIZE'
  color: string;
  price: number; // In IDR (Rupiah integer)
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'T-SHIRT' | 'HOODIE' | 'VINYL' | 'ACCESSORIES' | 'TICKETS';
  badge?: string; // 'NEW' | 'BEST SELLER' | 'HOT' | 'LIMITED'
  details: string;
  shippingInfo: string;
  returnsInfo: string;
  imageUrl: string;
  thumbnailUrls: string[];
  isFeatured: boolean;
  isActive: boolean;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  variantName: string; // e.g. "BLACK / M"
  category: string;
  size: string;
  color: string;
  price: number; // Server validates this
  quantity: number;
  imageUrl: string;
  maxStock: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  accessToken: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingProvince: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingPostalCode: string;
  shippingAddress: string;
  notes?: string | null;
  paymentMethod?: string | null;
  paymentProvider?: string | null;
  trackingNumber?: string | null;
  items?: OrderItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: PaymentProviderType;
  transactionId?: string | null;
  status: string;
  paymentType?: string | null;
  grossAmount: number;
  rawPayload?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  orderId?: string | null;
  recipient: string;
  subject: string;
  template: string;
  status: 'sent' | 'failed' | 'logged';
  errorMessage?: string | null;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  eventId: string;
  provider: string;
  payloadHash: string;
  status: string;
  createdAt: string;
}

export interface ShippingCalculation {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export interface PriceCalculationResult {
  items: Array<{
    variantId: string;
    productId: string;
    productName: string;
    variantName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}
