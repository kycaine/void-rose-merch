import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { orders, orderItems } from '../db/schema.js';
import { AdminShipSchema } from '@merch-band/shared';
import { OrderService } from '../services/order.service.js';
import { EmailService } from '../services/email/email-service.js';
import { renderOrderShippedEmail } from '../services/email/templates.js';
import { getFrontendBaseUrl } from '../lib/origin.js';

export const adminRouter = new Hono<{
  Bindings: {
    DB: D1Database;
    ADMIN_SECRET_KEY?: string;
    RESEND_API_KEY?: string;
    RESEND_FROM?: string;
    APP_URL?: string;
  };
}>();

// Auth Middleware: Token check
adminRouter.use('*', async (c, next) => {
  const token = c.req.header('X-Admin-Token') || c.req.query('token');
  const expectedToken = c.env.ADMIN_SECRET_KEY || 'void-rose-super-secret-admin-key-2026';

  if (!token || token !== expectedToken) {
    return c.json({ error: 'Unauthorized: Admin token invalid' }, 401);
  }

  await next();
});

// GET /api/admin/orders
adminRouter.get('/orders', async (c) => {
  const orm = drizzle(c.env.DB);
  const statusFilter = c.req.query('status');

  const allOrders = await orm
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const filtered = statusFilter
    ? allOrders.filter((o) => o.status === statusFilter)
    : allOrders;

  // Enrich with item counts
  const allItems = await orm.select().from(orderItems);

  const result = filtered.map((ord) => ({
    ...ord,
    itemsCount: allItems.filter((i) => i.orderId === ord.id).length
  }));

  return c.json({ success: true, data: result });
});

// POST /api/admin/orders/:orderNumber/ship
adminRouter.post('/orders/:orderNumber/ship', zValidator('json', AdminShipSchema), async (c) => {
  const orderNumber = c.req.param('orderNumber');
  const { trackingNumber } = c.req.valid('json');
  const orm = drizzle(c.env.DB);

  const order = await OrderService.getOrder(c.env.DB, orderNumber);
  if (!order) {
    return c.json({ success: false, error: 'Pesanan tidak ditemukan' }, 404);
  }

  const now = new Date().toISOString();
  await orm
    .update(orders)
    .set({
      status: 'shipped',
      trackingNumber: trackingNumber.trim(),
      updatedAt: now
    })
    .where(eq(orders.id, order.id));

  // Send Order Shipped transactional email
  const appUrl = getFrontendBaseUrl(c);
  const emailService = new EmailService({
    RESEND_API_KEY: c.env.RESEND_API_KEY,
    RESEND_FROM: c.env.RESEND_FROM,
    DB: c.env.DB
  });

  const { subject, html } = renderOrderShippedEmail({
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
    trackingNumber: trackingNumber.trim(),
    appUrl
  });

  const emailPromise = emailService.send({
    to: order.customerEmail,
    subject,
    html,
    orderId: order.id,
    template: 'order_shipped'
  });

  c.executionCtx.waitUntil(emailPromise);

  return c.json({
    success: true,
    data: {
      orderNumber,
      status: 'shipped',
      trackingNumber: trackingNumber.trim()
    }
  });
});
