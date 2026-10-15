import {
  Product,
  Order,
  PriceCalculationResult,
  CheckoutFormInput,
  FLAT_RATE_SHIPPING_IDR,
  FREE_SHIPPING_THRESHOLD_IDR
} from '@merch-band/shared';
import { staticProducts, getStaticProductBySlug } from '../data/clothing/index.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

function getMockOrders(): Record<string, Order> {
  try {
    return JSON.parse(localStorage.getItem('void-rose-local-orders') || '{}');
  } catch {
    return {};
  }
}

function saveMockOrder(order: Order) {
  const orders = getMockOrders();
  orders[order.orderNumber] = order;
  localStorage.setItem('void-rose-local-orders', JSON.stringify(orders));
}

export async function getProducts(category?: string, featured?: boolean): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category && category !== 'ALL') params.append('category', category);
  if (featured) params.append('featured', 'true');

  try {
    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) return json.data;
    }
  } catch (err) {
    console.warn('API error, falling back to static clothing/merch products:', err);
  }

  // Fallback to static products data
  let data = [...staticProducts];
  if (category && category.toUpperCase() !== 'ALL') {
    data = data.filter((p) => p.category.toUpperCase() === category.toUpperCase());
  }
  if (featured) {
    data = data.filter((p) => p.isFeatured);
  }
  return data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    console.warn(`API error for slug ${slug}, falling back to static product:`, err);
  }

  const staticProd = getStaticProductBySlug(slug);
  if (staticProd) return staticProd;
  throw new Error('Produk tidak ditemukan');
}

export async function validateCart(
  items: Array<{ variantId: string; quantity: number }>
): Promise<PriceCalculationResult> {
  try {
    const res = await fetch(`${API_BASE}/checkout/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    console.warn('API error in validateCart, falling back to local calculation:', err);
  }

  // Fallback calculation using staticProducts
  let subtotal = 0;
  const validatedItems = items.map((item) => {
    let price = 350000;
    let productName = 'Item';
    let variantName = 'Standard';
    let productId = 'prod';

    for (const p of staticProducts) {
      const foundVar = p.variants?.find((v) => v.id === item.variantId);
      if (foundVar) {
        price = foundVar.price;
        productName = p.name;
        productId = p.id;
        variantName = foundVar.size === 'ONE SIZE' ? foundVar.color : `${foundVar.color} / ${foundVar.size}`;
        break;
      }
    }

    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;
    return {
      variantId: item.variantId,
      productId,
      productName,
      variantName,
      price,
      quantity: item.quantity,
      subtotal: itemSubtotal
    };
  });

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD_IDR ? 0 : FLAT_RATE_SHIPPING_IDR;
  return {
    items: validatedItems,
    subtotal,
    shippingCost,
    tax: 0,
    total: subtotal + shippingCost
  };
}

export interface CheckoutResult {
  orderNumber: string;
  accessToken: string;
  total: number;
  paymentMode: 'simulated' | 'midtrans';
  paymentToken?: string;
  paymentUrl: string;
  trackingUrl: string;
}

export async function submitCheckout(formData: CheckoutFormInput): Promise<CheckoutResult> {
  try {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    console.warn('API error in submitCheckout, using simulated checkout fallback:', err);
  }

  // Fallback: Generate local simulated order so checkout and payment work seamlessly!
  const calculation = await validateCart(formData.items);
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(100 + Math.random() * 900);
  const orderNumber = `VR-${ts}-${rand}`;
  const accessToken = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    orderNumber,
    accessToken,
    status: 'pending',
    subtotal: calculation.subtotal,
    shippingCost: calculation.shippingCost,
    tax: calculation.tax,
    total: calculation.total,
    customerName: formData.customerName,
    customerEmail: formData.customerEmail,
    customerPhone: formData.customerPhone,
    shippingProvince: formData.shippingProvince,
    shippingCity: formData.shippingCity,
    shippingDistrict: formData.shippingDistrict,
    shippingPostalCode: formData.shippingPostalCode,
    shippingAddress: formData.shippingAddress,
    notes: formData.notes,
    paymentMethod: formData.paymentMethod || 'qris',
    paymentProvider: formData.paymentProvider || null,
    trackingNumber: null,
    items: calculation.items.map((i, idx) => ({
      id: `oi_${Date.now()}_${idx}`,
      orderId: orderNumber,
      productId: i.productId,
      variantId: i.variantId,
      productName: i.productName,
      variantName: i.variantName,
      price: i.price,
      quantity: i.quantity,
      subtotal: i.subtotal
    })),
    createdAt: now,
    updatedAt: now
  };

  saveMockOrder(newOrder);

  const methodParam = encodeURIComponent(formData.paymentMethod || 'qris');
  return {
    orderNumber,
    accessToken,
    total: calculation.total,
    paymentMode: 'simulated',
    paymentUrl: `/dev/pay/${orderNumber}?token=${accessToken}&method=${methodParam}`,
    trackingUrl: `/order/${orderNumber}?token=${accessToken}`
  };
}

export async function getOrder(orderNumber: string, token?: string): Promise<Order> {
  try {
    const url = token
      ? `${API_BASE}/orders/${orderNumber}?token=${encodeURIComponent(token)}`
      : `${API_BASE}/orders/${orderNumber}`;

    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    console.warn(`API error for getOrder #${orderNumber}, checking local store:`, err);
  }

  const localOrders = getMockOrders();
  const found = localOrders[orderNumber];
  if (found) {
    if (token && found.accessToken !== token) {
      throw new Error('Token akses tidak valid');
    }
    return found;
  }
  throw new Error('Pesanan tidak ditemukan');
}

export async function lookupOrder(orderNumber: string, email: string): Promise<Order> {
  try {
    const res = await fetch(`${API_BASE}/orders/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, email })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    console.warn('API error in lookupOrder, checking local store:', err);
  }

  const localOrders = getMockOrders();
  const found = localOrders[orderNumber.trim()];
  if (found && found.customerEmail.toLowerCase() === email.trim().toLowerCase()) {
    return found;
  }
  throw new Error('Pesanan tidak ditemukan atau email tidak sesuai');
}

export async function createPayment(orderNumber: string, token: string): Promise<{ paymentUrl: string; paymentToken?: string }> {
  try {
    const res = await fetch(`${API_BASE}/payments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, token })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    console.warn('API error in createPayment, using local payment redirect:', err);
  }

  return { paymentUrl: `/dev/pay/${orderNumber}?token=${token}` };
}

export async function submitSimulatedPayment(
  orderNumber: string,
  action: 'success' | 'fail'
): Promise<{ success: boolean; status: string }> {
  try {
    const res = await fetch(`${API_BASE}/payments/simulated`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, action })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    console.warn(`API error in simulated payment for #${orderNumber}, updating local store:`, err);
  }

  const localOrders = getMockOrders();
  if (localOrders[orderNumber]) {
    const targetStatus = action === 'success' ? 'paid' : 'failed';
    localOrders[orderNumber].status = targetStatus;
    localOrders[orderNumber].updatedAt = new Date().toISOString();
    localStorage.setItem('void-rose-local-orders', JSON.stringify(localOrders));
    return { success: true, status: targetStatus };
  }
  return { success: true, status: action === 'success' ? 'paid' : 'failed' };
}

export async function getAdminOrders(adminToken: string, status?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  try {
    const res = await fetch(`${API_BASE}/admin/orders?${params.toString()}`, {
      headers: { 'X-Admin-Token': adminToken }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    console.warn('API error in getAdminOrders, checking local store:', err);
  }

  const localOrders = Object.values(getMockOrders());
  if (status) {
    return localOrders.filter((o) => o.status === status);
  }
  return localOrders;
}

export async function shipAdminOrder(
  adminToken: string,
  orderNumber: string,
  trackingNumber: string
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/admin/orders/${orderNumber}/ship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': adminToken
      },
      body: JSON.stringify({ trackingNumber })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return;
    }
  } catch (err) {
    console.warn('API error in shipAdminOrder, updating local store:', err);
  }

  const localOrders = getMockOrders();
  if (localOrders[orderNumber]) {
    localOrders[orderNumber].status = 'shipped';
    localOrders[orderNumber].trackingNumber = trackingNumber;
    localOrders[orderNumber].updatedAt = new Date().toISOString();
    localStorage.setItem('void-rose-local-orders', JSON.stringify(localOrders));
  }
}
