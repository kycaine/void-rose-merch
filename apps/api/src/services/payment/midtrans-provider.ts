import { Order, OrderItem } from '@merch-band/shared';
import { PaymentProvider, CreateTransactionResult } from './payment-provider.interface.js';

export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function sha512Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class MidtransProvider implements PaymentProvider {
  name = 'midtrans' as const;
  private serverKey: string;
  private isProduction: boolean;
  private snapBaseUrl: string;
  private apiBaseUrl: string;

  constructor(serverKey: string, isProduction: boolean = false) {
    this.serverKey = serverKey;
    this.isProduction = isProduction;
    this.snapBaseUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1'
      : 'https://app.sandbox.midtrans.com/snap/v1';
    this.apiBaseUrl = isProduction
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2';
  }

  private getAuthHeader(): string {
    const authString = `${this.serverKey}:`;
    const encoded = btoa(authString);
    return `Basic ${encoded}`;
  }

  async createTransaction(order: Order, items: OrderItem[]): Promise<CreateTransactionResult> {
    const payload = {
      transaction_details: {
        order_id: `${order.orderNumber}-${Date.now().toString().slice(-4)}`,
        gross_amount: Math.round(order.total)
      },
      item_details: [
        ...items.map((i) => ({
          id: i.variantId,
          price: Math.round(i.price),
          quantity: i.quantity,
          name: `${i.productName} (${i.variantName})`.substring(0, 50)
        })),
        ...(order.shippingCost > 0
          ? [
              {
                id: 'SHIPPING',
                price: Math.round(order.shippingCost),
                quantity: 1,
                name: 'Biaya Pengiriman'
              }
            ]
          : [])
      ],
      customer_details: {
        first_name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        shipping_address: {
          first_name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          address: order.shippingAddress,
          city: order.shippingCity,
          postal_code: order.shippingPostalCode,
          country_code: 'IDN'
        }
      }
    };

    const res = await fetch(`${this.snapBaseUrl}/transactions`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.getAuthHeader()
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Midtrans Snap error (${res.status}): ${errBody}`);
    }

    const data = (await res.json()) as { token: string; redirect_url: string };
    return {
      token: data.token,
      redirectUrl: data.redirect_url
    };
  }

  async verifySignature(payload: {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
  }): Promise<boolean> {
    const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${this.serverKey}`;
    const expectedSignature = await sha512Hex(raw);
    return constantTimeCompare(payload.signature_key.toLowerCase(), expectedSignature.toLowerCase());
  }

  async checkTransactionStatus(orderId: string): Promise<{
    transactionStatus: string;
    fraudStatus?: string;
    grossAmount: number;
    raw: unknown;
  }> {
    const res = await fetch(`${this.apiBaseUrl}/${orderId}/status`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.getAuthHeader()
      }
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Midtrans Status API error (${res.status}): ${err}`);
    }

    const data = (await res.json()) as {
      transaction_status: string;
      fraud_status?: string;
      gross_amount: string;
    };

    return {
      transactionStatus: data.transaction_status,
      fraudStatus: data.fraud_status,
      grossAmount: parseFloat(data.gross_amount),
      raw: data
    };
  }
}
