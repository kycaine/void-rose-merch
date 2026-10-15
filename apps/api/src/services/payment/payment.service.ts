import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { orders, payments } from '../../db/schema.js';
import { OrderService } from '../order.service.js';
import { EmailService } from '../email/email-service.js';
import {
  renderOrderPaidEmail,
  renderOrderFailedEmail
} from '../email/templates.js';
import { OrderStatus, PaymentProviderType } from '@merch-band/shared';

export interface TransitionPaymentOptions {
  orderNumber: string;
  targetStatus: 'paid' | 'failed' | 'expired' | 'cancelled';
  provider: PaymentProviderType;
  transactionId?: string;
  paymentType?: string;
  grossAmount?: number;
  rawPayload?: string;
  env: {
    RESEND_API_KEY?: string;
    RESEND_FROM?: string;
    APP_URL?: string;
  };
  waitUntil?: (promise: Promise<unknown>) => void;
}

export class PaymentService {
  /**
   * Unified, shared state machine transition for payments.
   * Ensures identical handling of stock, status, and emails across Simulated and Midtrans modes.
   */
  static async handlePaymentTransition(
    db: D1Database,
    opts: TransitionPaymentOptions
  ): Promise<{ success: boolean; alreadyProcessed?: boolean; status: OrderStatus }> {
    const orm = drizzle(db);

    const order = await OrderService.getOrder(db, opts.orderNumber);
    if (!order) {
      throw new Error(`Order #${opts.orderNumber} not found`);
    }

    // Idempotency: If order is already paid, do nothing
    if (order.status === 'paid' && opts.targetStatus === 'paid') {
      return { success: true, alreadyProcessed: true, status: order.status };
    }

    // Idempotency: If order is already in terminal fail state
    if (
      ['failed', 'expired', 'cancelled'].includes(order.status) &&
      ['failed', 'expired', 'cancelled'].includes(opts.targetStatus)
    ) {
      return { success: true, alreadyProcessed: true, status: order.status };
    }

    const now = new Date().toISOString();
    const appUrl = opts.env.APP_URL || 'http://localhost:5173';
    const emailService = new EmailService({
      RESEND_API_KEY: opts.env.RESEND_API_KEY,
      RESEND_FROM: opts.env.RESEND_FROM,
      DB: db
    });

    if (opts.targetStatus === 'paid') {
      // 1. Update order status to paid
      await orm
        .update(orders)
        .set({
          status: 'paid',
          updatedAt: now
        })
        .where(eq(orders.id, order.id));

      // 2. Insert payment record
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await orm.insert(payments).values({
        id: paymentId,
        orderId: order.id,
        provider: opts.provider,
        transactionId: opts.transactionId || null,
        status: 'settlement',
        paymentType: opts.paymentType || 'simulated',
        grossAmount: opts.grossAmount ?? order.total,
        rawPayload: opts.rawPayload || null,
        createdAt: now,
        updatedAt: now
      });

      // 3. Send payment success email
      const { subject, html } = renderOrderPaidEmail({
        orderNumber: order.orderNumber,
        accessToken: order.accessToken,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
        items: order.items || [],
        shippingAddress: {
          province: order.shippingProvince,
          city: order.shippingCity,
          district: order.shippingDistrict,
          postalCode: order.shippingPostalCode,
          address: order.shippingAddress
        },
        appUrl
      });

      const emailPromise = emailService.send({
        to: order.customerEmail,
        subject,
        html,
        orderId: order.id,
        template: 'order_paid'
      });

      if (opts.waitUntil) {
        opts.waitUntil(emailPromise);
      } else {
        emailPromise.catch((e) => console.error('Error sending order paid email:', e));
      }

      return { success: true, status: 'paid' };
    } else {
      // Failed, Expired, or Cancelled
      // Only restore stock if order was previously pending (do not double restore)
      if (order.status === 'pending') {
        await OrderService.restoreOrderStock(db, order.id);
      }

      // Update order status
      await orm
        .update(orders)
        .set({
          status: opts.targetStatus,
          updatedAt: now
        })
        .where(eq(orders.id, order.id));

      // Insert payment record
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await orm.insert(payments).values({
        id: paymentId,
        orderId: order.id,
        provider: opts.provider,
        transactionId: opts.transactionId || null,
        status: opts.targetStatus,
        paymentType: opts.paymentType || 'simulated',
        grossAmount: opts.grossAmount ?? order.total,
        rawPayload: opts.rawPayload || null,
        createdAt: now,
        updatedAt: now
      });

      // Send payment failed email
      const { subject, html } = renderOrderFailedEmail({
        orderNumber: order.orderNumber,
        accessToken: order.accessToken,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
        items: order.items || [],
        shippingAddress: {
          province: order.shippingProvince,
          city: order.shippingCity,
          district: order.shippingDistrict,
          postalCode: order.shippingPostalCode,
          address: order.shippingAddress
        },
        appUrl
      });

      const emailPromise = emailService.send({
        to: order.customerEmail,
        subject,
        html,
        orderId: order.id,
        template: 'order_failed'
      });

      if (opts.waitUntil) {
        opts.waitUntil(emailPromise);
      } else {
        emailPromise.catch((e) => console.error('Error sending order failed email:', e));
      }

      return { success: true, status: opts.targetStatus };
    }
  }
}
