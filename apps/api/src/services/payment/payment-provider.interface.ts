import { Order, OrderItem } from '@merch-band/shared';

export interface CreateTransactionResult {
  token?: string;
  redirectUrl: string;
}

export interface PaymentProvider {
  name: 'simulated' | 'midtrans';
  createTransaction(order: Order, items: OrderItem[]): Promise<CreateTransactionResult>;
  verifySignature?(payload: {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
  }): Promise<boolean>;
  checkTransactionStatus?(orderId: string): Promise<{
    transactionStatus: string;
    fraudStatus?: string;
    grossAmount: number;
    raw: unknown;
  }>;
}
