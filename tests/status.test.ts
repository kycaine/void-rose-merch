import { describe, it, expect } from 'vitest';
import { OrderStatus } from '@merch-band/shared';

describe('Order Status Transitions State Machine', () => {
  interface MockOrder {
    id: string;
    status: OrderStatus;
    stockRestored: boolean;
  }

  function transitionOrder(
    order: MockOrder,
    target: 'paid' | 'failed' | 'expired' | 'shipped' | 'completed'
  ): { success: boolean; alreadyProcessed?: boolean } {
    if (order.status === 'paid' && target === 'paid') {
      return { success: true, alreadyProcessed: true };
    }

    if (order.status === 'pending') {
      if (target === 'paid') {
        order.status = 'paid';
        return { success: true };
      }
      if (target === 'failed' || target === 'expired') {
        order.status = target;
        order.stockRestored = true;
        return { success: true };
      }
    }

    if (order.status === 'paid') {
      if (target === 'shipped') {
        order.status = 'shipped';
        return { success: true };
      }
      if (target === 'failed') {
        throw new Error('Cannot transition already paid order to failed');
      }
    }

    if (order.status === 'shipped') {
      if (target === 'completed') {
        order.status = 'completed';
        return { success: true };
      }
    }

    return { success: false };
  }

  it('transitions from pending to paid successfully', () => {
    const order: MockOrder = { id: 'ord_1', status: 'pending', stockRestored: false };
    const res = transitionOrder(order, 'paid');
    expect(res.success).toBe(true);
    expect(order.status).toBe('paid');
    expect(order.stockRestored).toBe(false);
  });

  it('restores stock when transitioning from pending to failed', () => {
    const order: MockOrder = { id: 'ord_2', status: 'pending', stockRestored: false };
    const res = transitionOrder(order, 'failed');
    expect(res.success).toBe(true);
    expect(order.status).toBe('failed');
    expect(order.stockRestored).toBe(true);
  });

  it('handles duplicate paid transition idempotently', () => {
    const order: MockOrder = { id: 'ord_3', status: 'paid', stockRestored: false };
    const res = transitionOrder(order, 'paid');
    expect(res.success).toBe(true);
    expect(res.alreadyProcessed).toBe(true);
    expect(order.status).toBe('paid');
  });

  it('rejects transitioning already paid order to failed', () => {
    const order: MockOrder = { id: 'ord_4', status: 'paid', stockRestored: false };
    expect(() => transitionOrder(order, 'failed')).toThrow(
      'Cannot transition already paid order to failed'
    );
  });

  it('progresses from paid to shipped to completed', () => {
    const order: MockOrder = { id: 'ord_5', status: 'paid', stockRestored: false };
    transitionOrder(order, 'shipped');
    expect(order.status).toBe('shipped');

    transitionOrder(order, 'completed');
    expect(order.status).toBe('completed');
  });
});
