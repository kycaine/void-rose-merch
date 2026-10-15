import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql } from 'drizzle-orm';
import {
  products,
  productVariants,
  orders,
  orderItems,
  payments
} from '../db/schema.js';
import {
  CheckoutFormInput,
  Order,
  OrderItem,
  FLAT_RATE_SHIPPING_IDR,
  FREE_SHIPPING_THRESHOLD_IDR
} from '@merch-band/shared';
import { EmailService } from './email/email-service.js';
import { renderOrderCreatedEmail } from './email/templates.js';

export function generateRandomToken(bytes: number = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(100 + Math.random() * 900);
  return `VR-${ts}-${rand}`;
}

export interface ValidatedItem {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface PriceCalculationResult {
  items: ValidatedItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export class OrderService {
  /**
   * Calculates order totals strictly from server-side database prices.
   * Client price values are never trusted.
   */
  static async calculateTotals(
    db: D1Database,
    rawItems: Array<{ variantId: string; quantity: number }>
  ): Promise<PriceCalculationResult> {
    const orm = drizzle(db);
    const validatedItems: ValidatedItem[] = [];
    let subtotal = 0;

    for (const item of rawItems) {
      if (item.quantity <= 0) {
        throw new Error(`Kuantitas item tidak valid`);
      }

      const variantRows = await orm
        .select({
          variantId: productVariants.id,
          productId: productVariants.productId,
          sku: productVariants.sku,
          size: productVariants.size,
          color: productVariants.color,
          price: productVariants.price,
          stock: productVariants.stock,
          productName: products.name
        })
        .from(productVariants)
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(eq(productVariants.id, item.variantId))
        .limit(1);

      if (!variantRows || variantRows.length === 0) {
        throw new Error(`Produk varian dengan ID '${item.variantId}' tidak ditemukan`);
      }

      const v = variantRows[0];
      const itemSubtotal = v.price * item.quantity;
      subtotal += itemSubtotal;

      const variantName = v.size === 'ONE SIZE' ? v.color : `${v.color} / ${v.size}`;

      validatedItems.push({
        variantId: v.variantId,
        productId: v.productId,
        productName: v.productName,
        variantName,
        price: v.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD_IDR ? 0 : FLAT_RATE_SHIPPING_IDR;
    const tax = 0; // Tax included or 0
    const total = subtotal + shippingCost + tax;

    return {
      items: validatedItems,
      subtotal,
      shippingCost,
      tax,
      total
    };
  }

  /**
   * Creates a new order with atomic stock reservation.
   * Prevents overselling using atomic conditional updates.
   */
  static async createOrder(
    db: D1Database,
    env: {
      RESEND_API_KEY?: string;
      RESEND_FROM?: string;
      APP_URL?: string;
      PAYMENT_MODE?: string;
    },
    input: CheckoutFormInput,
    waitUntil?: (promise: Promise<unknown>) => void
  ): Promise<{ order: Order; items: OrderItem[] }> {
    const orm = drizzle(db);

    // 1. Calculate totals from server-side price truth
    const calculation = await this.calculateTotals(db, input.items);

    // 2. Atomically reserve stock for each item
    // We check and decrement stock in one atomic statement
    const reservedItems: Array<{ variantId: string; quantity: number }> = [];

    try {
      for (const item of calculation.items) {
        // Atomic update with stock check: only decrements if stock >= quantity
        const updateResult = await db
          .prepare(
            `UPDATE product_variants 
             SET stock = stock - ?, updated_at = datetime('now') 
             WHERE id = ? AND stock >= ?`
          )
          .bind(item.quantity, item.variantId, item.quantity)
          .run();

        if (!updateResult.success || (updateResult.meta.changes ?? 0) === 0) {
          throw new Error(
            `Stok tidak mencukupi untuk item '${item.productName} (${item.variantName})'`
          );
        }

        reservedItems.push({ variantId: item.variantId, quantity: item.quantity });
      }

      // 3. Insert order
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const orderNumber = generateOrderNumber();
      const accessToken = generateRandomToken(16);
      const now = new Date().toISOString();

      await orm.insert(orders).values({
        id: orderId,
        orderNumber,
        accessToken,
        status: 'pending',
        subtotal: calculation.subtotal,
        shippingCost: calculation.shippingCost,
        tax: calculation.tax,
        total: calculation.total,
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.trim().toLowerCase(),
        customerPhone: input.customerPhone.trim(),
        shippingProvince: input.shippingProvince.trim(),
        shippingCity: input.shippingCity.trim(),
        shippingDistrict: input.shippingDistrict.trim(),
        shippingPostalCode: input.shippingPostalCode.trim(),
        shippingAddress: input.shippingAddress.trim(),
        notes: input.notes?.trim() || null,
        trackingNumber: null,
        createdAt: now,
        updatedAt: now
      });

      // 4. Insert order items
      const createdItems: OrderItem[] = [];
      for (const item of calculation.items) {
        const itemId = `oi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await orm.insert(orderItems).values({
          id: itemId,
          orderId,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal
        });

        createdItems.push({
          id: itemId,
          orderId,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal
        });
      }

      const createdOrder: Order = {
        id: orderId,
        orderNumber,
        accessToken,
        status: 'pending',
        subtotal: calculation.subtotal,
        shippingCost: calculation.shippingCost,
        tax: calculation.tax,
        total: calculation.total,
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.trim().toLowerCase(),
        customerPhone: input.customerPhone.trim(),
        shippingProvince: input.shippingProvince.trim(),
        shippingCity: input.shippingCity.trim(),
        shippingDistrict: input.shippingDistrict.trim(),
        shippingPostalCode: input.shippingPostalCode.trim(),
        shippingAddress: input.shippingAddress.trim(),
        notes: input.notes?.trim() || null,
        trackingNumber: null,
        items: createdItems,
        createdAt: now,
        updatedAt: now
      };

      // 5. Send Order Created transactional email in background
      const appUrl = env.APP_URL || 'http://localhost:5173';
      const emailService = new EmailService({
        RESEND_API_KEY: env.RESEND_API_KEY,
        RESEND_FROM: env.RESEND_FROM,
        DB: db
      });

      const { subject, html } = renderOrderCreatedEmail({
        orderNumber,
        accessToken,
        customerName: createdOrder.customerName,
        customerEmail: createdOrder.customerEmail,
        subtotal: createdOrder.subtotal,
        shippingCost: createdOrder.shippingCost,
        total: createdOrder.total,
        items: createdItems,
        shippingAddress: {
          province: createdOrder.shippingProvince,
          city: createdOrder.shippingCity,
          district: createdOrder.shippingDistrict,
          postalCode: createdOrder.shippingPostalCode,
          address: createdOrder.shippingAddress
        },
        appUrl
      });

      const sendPromise = emailService.send({
        to: createdOrder.customerEmail,
        subject,
        html,
        orderId: createdOrder.id,
        template: 'order_created'
      });

      if (waitUntil) {
        waitUntil(sendPromise);
      } else {
        sendPromise.catch((e) => console.error('Error sending order created email:', e));
      }

      return { order: createdOrder, items: createdItems };
    } catch (err) {
      // Rollback any reserved stock on failure
      for (const item of reservedItems) {
        try {
          await db
            .prepare(
              `UPDATE product_variants 
               SET stock = stock + ?, updated_at = datetime('now') 
               WHERE id = ?`
            )
            .bind(item.quantity, item.variantId)
            .run();
        } catch (rollbackErr) {
          console.error('Failed to rollback reserved stock:', rollbackErr);
        }
      }
      throw err;
    }
  }

  /**
   * Restores reserved stock back to inventory.
   */
  static async restoreOrderStock(db: D1Database, orderId: string): Promise<void> {
    const orm = drizzle(db);
    const items = await orm.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      await db
        .prepare(
          `UPDATE product_variants 
           SET stock = stock + ?, updated_at = datetime('now') 
           WHERE id = ?`
        )
        .bind(item.quantity, item.variantId)
        .run();
    }
  }

  /**
   * Retrieves order by order number and optionally validates access token.
   */
  static async getOrder(
    db: D1Database,
    orderNumber: string,
    accessToken?: string
  ): Promise<Order | null> {
    const orm = drizzle(db);
    const orderRows = await orm
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);

    if (!orderRows || orderRows.length === 0) {
      return null;
    }

    const ord = orderRows[0];
    if (accessToken && ord.accessToken !== accessToken) {
      return null;
    }

    const items = await orm.select().from(orderItems).where(eq(orderItems.orderId, ord.id));
    const payRows = await orm.select().from(payments).where(eq(payments.orderId, ord.id));

    return {
      id: ord.id,
      orderNumber: ord.orderNumber,
      accessToken: ord.accessToken,
      status: ord.status as any,
      subtotal: ord.subtotal,
      shippingCost: ord.shippingCost,
      tax: ord.tax,
      total: ord.total,
      customerName: ord.customerName,
      customerEmail: ord.customerEmail,
      customerPhone: ord.customerPhone,
      shippingProvince: ord.shippingProvince,
      shippingCity: ord.shippingCity,
      shippingDistrict: ord.shippingDistrict,
      shippingPostalCode: ord.shippingPostalCode,
      shippingAddress: ord.shippingAddress,
      notes: ord.notes,
      trackingNumber: ord.trackingNumber,
      items: items.map((i) => ({
        id: i.id,
        orderId: i.orderId,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantName: i.variantName,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.subtotal
      })),
      payments: payRows.map((p) => ({
        id: p.id,
        orderId: p.orderId,
        provider: p.provider as any,
        transactionId: p.transactionId,
        status: p.status,
        paymentType: p.paymentType,
        grossAmount: p.grossAmount,
        rawPayload: p.rawPayload,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      })),
      createdAt: ord.createdAt,
      updatedAt: ord.updatedAt
    };
  }
}
