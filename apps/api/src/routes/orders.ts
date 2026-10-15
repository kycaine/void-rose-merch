import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { orders } from '../db/schema.js';
import { OrderLookupSchema } from '@merch-band/shared';
import { OrderService } from '../services/order.service.js';

export const ordersRouter = new Hono<{ Bindings: { DB: D1Database } }>();

// GET /api/orders/:orderNumber
// Validates token when opening order page
ordersRouter.get('/:orderNumber', async (c) => {
  const orderNumber = c.req.param('orderNumber');
  const token = c.req.query('token');

  const order = await OrderService.getOrder(c.env.DB, orderNumber, token);
  if (!order) {
    return c.json({ success: false, error: 'Pesanan tidak ditemukan atau token tidak valid' }, 404);
  }

  return c.json({ success: true, data: order });
});

// POST /api/orders/lookup
// Look up order using order number and buyer's email (for "Cek Pesanan" page)
ordersRouter.post('/lookup', zValidator('json', OrderLookupSchema), async (c) => {
  const { orderNumber, email } = c.req.valid('json');
  const orm = drizzle(c.env.DB);

  const rows = await orm
    .select({
      orderNumber: orders.orderNumber,
      accessToken: orders.accessToken,
      customerEmail: orders.customerEmail
    })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber.trim()))
    .limit(1);

  if (!rows || rows.length === 0) {
    return c.json({ success: false, error: 'Pesanan tidak ditemukan' }, 404);
  }

  const found = rows[0];
  if (found.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
    return c.json({ success: false, error: 'Email tidak sesuai dengan pesanan' }, 401);
  }

  const fullOrder = await OrderService.getOrder(c.env.DB, found.orderNumber, found.accessToken);
  return c.json({
    success: true,
    data: fullOrder
  });
});
