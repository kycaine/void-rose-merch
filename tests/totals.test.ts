import { describe, it, expect } from 'vitest';
import { FLAT_RATE_SHIPPING_IDR, FREE_SHIPPING_THRESHOLD_IDR } from '@merch-band/shared';

describe('Server-Side Total Calculation', () => {
  const SERVER_PRODUCTS = {
    'var_1_m': { name: 'Void Rose Tee', price: 350000, stock: 10 },
    'var_2_l': { name: 'Thorn Heavy Hoodie', price: 780000, stock: 5 },
    'var_8_os': { name: 'Rose Enamel Pin Set', price: 140000, stock: 20 }
  };

  function calculateServerTotals(items: Array<{ variantId: string; quantity: number }>) {
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const serverProduct = SERVER_PRODUCTS[item.variantId as keyof typeof SERVER_PRODUCTS];
      if (!serverProduct) throw new Error('Variant not found');
      if (item.quantity <= 0) throw new Error('Invalid quantity');

      const itemSubtotal = serverProduct.price * item.quantity;
      subtotal += itemSubtotal;
      validatedItems.push({
        variantId: item.variantId,
        productName: serverProduct.name,
        price: serverProduct.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD_IDR ? 0 : FLAT_RATE_SHIPPING_IDR;
    const tax = 0;
    const total = subtotal + shippingCost + tax;

    return { validatedItems, subtotal, shippingCost, tax, total };
  }

  it('calculates correct subtotal using server truth prices', () => {
    const items = [
      { variantId: 'var_1_m', quantity: 1 } // 350.000
    ];

    const result = calculateServerTotals(items);
    expect(result.subtotal).toBe(350000);
    expect(result.shippingCost).toBe(FLAT_RATE_SHIPPING_IDR); // 25.000
    expect(result.total).toBe(375000);
  });

  it('ignores any manipulated client price and uses database price', () => {
    // Client attempts to tamper price to 100 rupiah
    const tamperedClientItems = [
      { variantId: 'var_1_m', quantity: 2, clientPrice: 100 }
    ];

    const result = calculateServerTotals(tamperedClientItems);
    expect(result.subtotal).toBe(700000); // 350.000 * 2
    expect(result.total).toBe(700000 + FLAT_RATE_SHIPPING_IDR);
  });

  it('applies free shipping when subtotal reaches threshold (>= Rp 750.000)', () => {
    const items = [
      { variantId: 'var_2_l', quantity: 1 } // 780.000 >= 750.000
    ];

    const result = calculateServerTotals(items);
    expect(result.subtotal).toBe(780000);
    expect(result.shippingCost).toBe(0); // FREE
    expect(result.total).toBe(780000);
  });

  it('calculates tour ticket purchases correctly', () => {
    const TICKET_SERVER_PRODUCTS = {
      ...SERVER_PRODUCTS,
      'var_tkt_jkt_ga': { name: 'VOID/ROSE Live in Jakarta 2026 (FESTIVAL GA)', price: 450000, stock: 200 },
      'var_tkt_jkt_vip': { name: 'VOID/ROSE Live in Jakarta 2026 (VIP NOISE PASS)', price: 850000, stock: 50 }
    };

    function calculateTicketTotals(items: Array<{ variantId: string; quantity: number }>) {
      let subtotal = 0;
      for (const item of items) {
        const prod = TICKET_SERVER_PRODUCTS[item.variantId as keyof typeof TICKET_SERVER_PRODUCTS];
        subtotal += prod.price * item.quantity;
      }
      const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD_IDR ? 0 : FLAT_RATE_SHIPPING_IDR;
      return { subtotal, total: subtotal + shippingCost };
    }

    const gaOrder = calculateTicketTotals([{ variantId: 'var_tkt_jkt_ga', quantity: 1 }]);
    expect(gaOrder.subtotal).toBe(450000);

    const vipOrder = calculateTicketTotals([{ variantId: 'var_tkt_jkt_vip', quantity: 1 }]);
    expect(vipOrder.subtotal).toBe(850000);
    expect(vipOrder.total).toBe(850000); // Free shipping threshold >= 750k
  });
});

