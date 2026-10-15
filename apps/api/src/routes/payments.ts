import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { webhookEvents } from '../db/schema.js';
import {
  MidtransNotificationSchema,
  SimulatePaymentSchema
} from '@merch-band/shared';
import { PaymentService } from '../services/payment/payment.service.js';
import { MidtransProvider, sha512Hex } from '../services/payment/midtrans-provider.js';
import { SimulatedProvider } from '../services/payment/simulated-provider.js';
import { OrderService } from '../services/order.service.js';
import { getFrontendBaseUrl } from '../lib/origin.js';
import { z } from 'zod';

export const paymentsRouter = new Hono<{
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

// POST /api/payments/create
// Creates or re-issues a payment transaction for an existing pending order
paymentsRouter.post(
  '/create',
  zValidator('json', z.object({ orderNumber: z.string(), token: z.string() })),
  async (c) => {
    try {
      const { orderNumber, token } = c.req.valid('json');
      const order = await OrderService.getOrder(c.env.DB, orderNumber, token);
      if (!order) {
        return c.json({ success: false, error: 'Pesanan tidak ditemukan atau token tidak valid' }, 404);
      }

      if (order.status === 'paid') {
        return c.json({ success: false, error: 'Pesanan ini sudah dibayar' }, 400);
      }

      const paymentMode = c.env.PAYMENT_MODE || 'simulated';
      let result: { token?: string; redirectUrl: string };

      if (paymentMode === 'midtrans') {
        const serverKey = c.env.MIDTRANS_SERVER_KEY || '';
        const isProduction = c.env.MIDTRANS_IS_PRODUCTION === 'true';
        const provider = new MidtransProvider(serverKey, isProduction);
        result = await provider.createTransaction(order, order.items || []);
      } else {
        const frontendUrl = getFrontendBaseUrl(c);
        const provider = new SimulatedProvider(frontendUrl);
        result = await provider.createTransaction(order, order.items || []);
      }

      return c.json({
        success: true,
        data: {
          paymentMode,
          paymentToken: result.token,
          paymentUrl: result.redirectUrl
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses pembayaran';
      return c.json({ success: false, error: msg }, 500);
    }
  }
);

// POST /api/payments/simulated
// DEV simulated payment execution endpoint
paymentsRouter.post(
  '/simulated',
  zValidator(
    'json',
    z.object({
      orderNumber: z.string(),
      action: z.enum(['success', 'fail'])
    })
  ),
  async (c) => {
    const paymentMode = c.env.PAYMENT_MODE || 'simulated';

    // Must return 404 only when PAYMENT_MODE is not simulated
    if (paymentMode !== 'simulated') {
      return c.json({ error: 'Payment simulation is only enabled when PAYMENT_MODE=simulated' }, 404);
    }

    try {
      const { orderNumber, action } = c.req.valid('json');
      const targetStatus = action === 'success' ? 'paid' : 'failed';

      const transitionResult = await PaymentService.handlePaymentTransition(c.env.DB, {
        orderNumber,
        targetStatus,
        provider: 'simulated',
        paymentType: 'simulated_instant',
        env: {
          RESEND_API_KEY: c.env.RESEND_API_KEY,
          RESEND_FROM: c.env.RESEND_FROM,
          APP_URL: getFrontendBaseUrl(c)
        },
        waitUntil: (p) => c.executionCtx.waitUntil(p)
      });

      return c.json({
        success: true,
        data: transitionResult
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses simulasi pembayaran';
      return c.json({ success: false, error: msg }, 400);
    }
  }
);

// POST /api/payments/midtrans/notification
// Midtrans Webhook Notification Handler with Web Crypto signature & status re-verification
paymentsRouter.post(
  '/midtrans/notification',
  zValidator('json', MidtransNotificationSchema),
  async (c) => {
    const orm = drizzle(c.env.DB);
    const body = c.req.valid('json');
    const serverKey = c.env.MIDTRANS_SERVER_KEY || '';
    const isProduction = c.env.MIDTRANS_IS_PRODUCTION === 'true';

    // 1. Webhook Idempotency check via payload hash & event id
    const eventId = `${body.order_id}_${body.transaction_status}_${body.status_code}`;
    const payloadHash = await sha512Hex(JSON.stringify(body));

    const existingEvent = await orm
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId))
      .limit(1);

    if (existingEvent && existingEvent.length > 0) {
      // Event already processed: return 200 OK immediately without double processing
      return c.json({ status: 'ok', message: 'Event already processed (idempotent)' });
    }

    // 2. Signature verification with constant-time comparison
    const provider = new MidtransProvider(serverKey, isProduction);
    const isValidSignature = await provider.verifySignature({
      order_id: body.order_id,
      status_code: body.status_code,
      gross_amount: body.gross_amount,
      signature_key: body.signature_key
    });

    if (!isValidSignature) {
      console.error('[Midtrans Webhook] Invalid signature detected for order:', body.order_id);
      return c.json({ error: 'Invalid signature' }, 401);
    }

    // 3. Re-verify status with Midtrans Status API (never trust raw payload blindly)
    let verifiedStatus = body.transaction_status;
    let verifiedFraud = body.fraud_status;

    try {
      const statusApiResult = await provider.checkTransactionStatus(body.order_id);
      verifiedStatus = statusApiResult.transactionStatus;
      verifiedFraud = statusApiResult.fraudStatus;
    } catch (statusErr) {
      console.warn('[Midtrans Webhook] Status API check failed, fallback to payload:', statusErr);
    }

    // Map order number (order_id in Snap might be "VR-123456-789-0123" to allow retries)
    // Extract base order number
    const baseOrderNumber = body.order_id.replace(/-\d{4}$/, '');

    // 4. Map Midtrans transaction status to internal OrderStatus
    let targetStatus: 'paid' | 'failed' | 'expired' | 'cancelled' | null = null;

    if (verifiedStatus === 'capture') {
      if (verifiedFraud === 'challenge') {
        // Challenge status: pending review
        targetStatus = null;
      } else {
        targetStatus = 'paid';
      }
    } else if (verifiedStatus === 'settlement') {
      targetStatus = 'paid';
    } else if (verifiedStatus === 'cancel' || verifiedStatus === 'deny') {
      targetStatus = 'failed';
    } else if (verifiedStatus === 'expire') {
      targetStatus = 'expired';
    } else if (verifiedStatus === 'pending') {
      // Still pending
      targetStatus = null;
    }

    // Record webhook event for idempotency
    const weId = `we_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await orm.insert(webhookEvents).values({
      id: weId,
      eventId,
      provider: 'midtrans',
      payloadHash,
      status: targetStatus || verifiedStatus,
      createdAt: new Date().toISOString()
    });

    if (targetStatus) {
      await PaymentService.handlePaymentTransition(c.env.DB, {
        orderNumber: baseOrderNumber,
        targetStatus,
        provider: 'midtrans',
        transactionId: body.transaction_id,
        paymentType: body.payment_type,
        grossAmount: parseFloat(body.gross_amount),
        rawPayload: JSON.stringify(body),
        env: {
          RESEND_API_KEY: c.env.RESEND_API_KEY,
          RESEND_FROM: c.env.RESEND_FROM,
          APP_URL: c.env.APP_URL
        },
        waitUntil: (p) => c.executionCtx.waitUntil(p)
      });
    }

    return c.json({ status: 'ok', mappedStatus: targetStatus });
  }
);
