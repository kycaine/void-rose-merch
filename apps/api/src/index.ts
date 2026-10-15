import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { D1Database, KVNamespace } from '@cloudflare/workers-types';
import { productsRouter } from './routes/products.js';
import { checkoutRouter } from './routes/checkout.js';
import { paymentsRouter } from './routes/payments.js';
import { ordersRouter } from './routes/orders.js';
import { adminRouter } from './routes/admin.js';
import { getCorsOrigin } from './lib/origin.js';

export interface Env {
  DB: D1Database;
  CACHE_KV?: KVNamespace;
  ENVIRONMENT?: string;
  PAYMENT_MODE?: string;
  MIDTRANS_SERVER_KEY?: string;
  MIDTRANS_CLIENT_KEY?: string;
  MIDTRANS_IS_PRODUCTION?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  APP_URL?: string;
  API_URL?: string;
  ADMIN_SECRET_KEY?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Logger
app.use('*', logger());

// CORS
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: (origin) => {
      return getCorsOrigin(origin, c.env?.APP_URL);
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token'],
    credentials: true
  });
  return corsMiddleware(c, next);
});

// Simple Rate Limiting for checkout & order lookup via KV or memory
app.use('/api/checkout/*', async (c, next) => {
  if (c.env.CACHE_KV) {
    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const key = `ratelimit:checkout:${ip}`;
    const countStr = await c.env.CACHE_KV.get(key);
    const count = countStr ? parseInt(countStr, 10) : 0;
    if (count > 60) {
      // 60 requests per minute
      return c.json({ error: 'Terlalu banyak permintaan. Silakan coba sesaat lagi.' }, 429);
    }
    await c.env.CACHE_KV.put(key, (count + 1).toString(), { expirationTtl: 60 });
  }
  await next();
});

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    app: 'VOID/ROSE Merch API',
    environment: c.env.ENVIRONMENT || 'development',
    paymentMode: c.env.PAYMENT_MODE || 'simulated',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.route('/api/products', productsRouter);
app.route('/api/checkout', checkoutRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/orders', ordersRouter);
app.route('/api/admin', adminRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint tidak ditemukan' }, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error('[Hono Error]', err);
  return c.json(
    {
      success: false,
      error: err instanceof Error ? err.message : 'Internal Server Error'
    },
    500
  );
});

export default app;
