import { Order, OrderItem } from '@merch-band/shared';
import { PaymentProvider, CreateTransactionResult } from './payment-provider.interface.js';

export class SimulatedProvider implements PaymentProvider {
  name = 'simulated' as const;
  private appUrl: string;

  constructor(appUrl: string) {
    this.appUrl = appUrl.replace(/\/$/, '');
  }

  async createTransaction(order: Order, _items: OrderItem[]): Promise<CreateTransactionResult> {
    const methodParam = order.paymentMethod ? `&method=${encodeURIComponent(order.paymentMethod)}` : '';
    const redirectUrl = `${this.appUrl}/dev/pay/${order.orderNumber}?token=${order.accessToken}${methodParam}`;
    return {
      token: `sim_token_${order.orderNumber}_${Date.now()}`,
      redirectUrl
    };
  }
}
