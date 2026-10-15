import { Hono } from 'hono';
import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { products, productVariants } from '../db/schema.js';

export const productsRouter = new Hono<{ Bindings: { DB: D1Database } }>();

// GET /api/products
productsRouter.get('/', async (c) => {
  const orm = drizzle(c.env.DB);
  const category = c.req.query('category')?.toUpperCase();
  const featured = c.req.query('featured');

  let query = orm.select().from(products).where(eq(products.isActive, 1));
  const allProducts = await query;

  let filtered = allProducts;
  if (category && category !== 'ALL') {
    filtered = filtered.filter((p) => p.category.toUpperCase() === category);
  }
  if (featured === 'true' || featured === '1') {
    filtered = filtered.filter((p) => p.isFeatured === 1);
  }

  // Fetch variants for filtered products
  const productIds = filtered.map((p) => p.id);
  const allVariants =
    productIds.length > 0
      ? await orm.select().from(productVariants)
      : [];

  const result = filtered.map((p) => {
    const variants = allVariants.filter((v) => v.productId === p.id);
    let thumbnails: string[] = [];
    try {
      thumbnails = JSON.parse(p.thumbnailUrls);
    } catch {
      thumbnails = [p.imageUrl];
    }

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: p.category,
      badge: p.badge,
      details: p.details,
      shippingInfo: p.shippingInfo,
      returnsInfo: p.returnsInfo,
      imageUrl: p.imageUrl,
      thumbnailUrls: thumbnails,
      isFeatured: Boolean(p.isFeatured),
      isActive: Boolean(p.isActive),
      variants: variants.map((v) => ({
        id: v.id,
        productId: v.productId,
        sku: v.sku,
        size: v.size,
        color: v.color,
        price: v.price,
        stock: v.stock
      })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    };
  });

  return c.json({ success: true, data: result });
});

// GET /api/products/:slug
productsRouter.get('/:slug', async (c) => {
  const orm = drizzle(c.env.DB);
  const slug = c.req.param('slug');

  const rows = await orm
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, 1)))
    .limit(1);

  if (!rows || rows.length === 0) {
    return c.json({ success: false, error: 'Produk tidak ditemukan' }, 404);
  }

  const p = rows[0];
  const variants = await orm
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, p.id));

  let thumbnails: string[] = [];
  try {
    thumbnails = JSON.parse(p.thumbnailUrls);
  } catch {
    thumbnails = [p.imageUrl];
  }

  return c.json({
    success: true,
    data: {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: p.category,
      badge: p.badge,
      details: p.details,
      shippingInfo: p.shippingInfo,
      returnsInfo: p.returnsInfo,
      imageUrl: p.imageUrl,
      thumbnailUrls: thumbnails,
      isFeatured: Boolean(p.isFeatured),
      isActive: Boolean(p.isActive),
      variants: variants.map((v) => ({
        id: v.id,
        productId: v.productId,
        sku: v.sku,
        size: v.size,
        color: v.color,
        price: v.price,
        stock: v.stock
      })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }
  });
});
