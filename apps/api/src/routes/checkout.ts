import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { D1Database } from '@cloudflare/workers-types';
import { CheckoutFormSchema, CheckoutItemSchema } from '@merch-band/shared';
import { OrderService } from '../services/order.service.js';
import { SimulatedProvider } from '../services/payment/simulated-provider.js';
import { MidtransProvider } from '../services/payment/midtrans-provider.js';
import { getFrontendBaseUrl } from '../lib/origin.js';
import { z } from 'zod';

export const checkoutRouter = new Hono<{
  Bindings: {
    DB: D1Database;
    PAYMENT_MODE?: string;
    ENVIRONMENT?: string;
    MIDTRANS_SERVER_KEY?: string;
    MIDTRANS_IS_PRODUCTION?: string;
    RESEND_API_KEY?: string;
    RESEND_FROM?: string;
    APP_URL?: string;
  };
}>();

// POST /api/checkout/validate
// Calculates server-side prices and totals without saving order
checkoutRouter.post(
  '/validate',
  zValidator('json', z.object({ items: z.array(CheckoutItemSchema).min(1) })),
  async (c) => {
    try {
      const { items } = c.req.valid('json');
      const calculation = await OrderService.calculateTotals(c.env.DB, items);
      return c.json({ success: true, data: calculation });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memvalidasi keranjang';
      return c.json({ success: false, error: message }, 400);
    }
  }
);

// POST /api/checkout
// Creates order with atomic stock reservation and initializes payment
checkoutRouter.post('/', zValidator('json', CheckoutFormSchema), async (c) => {
  try {
    const input = c.req.valid('json');
    const frontendUrl = getFrontendBaseUrl(c);

    // 1. Create order and reserve stock
    const { order, items } = await OrderService.createOrder(
      c.env.DB,
      {
        RESEND_API_KEY: c.env.RESEND_API_KEY,
        RESEND_FROM: c.env.RESEND_FROM,
        APP_URL: frontendUrl,
        PAYMENT_MODE: c.env.PAYMENT_MODE
      },
      input,
      (p) => c.executionCtx.waitUntil(p)
    );

    // 2. Initialize payment with selected provider
    const paymentMode = c.env.PAYMENT_MODE || 'simulated';
    let paymentResult: { token?: string; redirectUrl: string };

    if (paymentMode === 'midtrans') {
      const serverKey = c.env.MIDTRANS_SERVER_KEY || '';
      const isProduction = c.env.MIDTRANS_IS_PRODUCTION === 'true';
      const provider = new MidtransProvider(serverKey, isProduction);
      paymentResult = await provider.createTransaction(order, items);
    } else {
      const provider = new SimulatedProvider(frontendUrl);
      paymentResult = await provider.createTransaction(order, items);
    }

    return c.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        accessToken: order.accessToken,
        total: order.total,
        paymentMode,
        paymentToken: paymentResult.token,
        paymentUrl: paymentResult.redirectUrl,
        trackingUrl: `${frontendUrl}/order/${order.orderNumber}?token=${order.accessToken}`
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal membuat pesanan';
    console.error('Checkout error:', err);
    return c.json({ success: false, error: message }, 400);
  }
});
