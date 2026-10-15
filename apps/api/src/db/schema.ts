import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  badge: text('badge'),
  details: text('details').notNull(),
  shippingInfo: text('shipping_info').notNull(),
  returnsInfo: text('returns_info').notNull(),
  imageUrl: text('image_url').notNull(),
  thumbnailUrls: text('thumbnail_urls').notNull(), // JSON array
  isFeatured: integer('is_featured').notNull().default(0),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const productVariants = sqliteTable('product_variants', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  sku: text('sku').notNull().unique(),
  size: text('size').notNull(),
  color: text('color').notNull(),
  price: integer('price').notNull(), // in IDR
  stock: integer('stock').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  accessToken: text('access_token').notNull(),
  status: text('status').notNull().default('pending'), // pending, paid, failed, expired, cancelled, shipped, completed
  subtotal: integer('subtotal').notNull(),
  shippingCost: integer('shipping_cost').notNull(),
  tax: integer('tax').notNull(),
  total: integer('total').notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  shippingProvince: text('shipping_province').notNull(),
  shippingCity: text('shipping_city').notNull(),
  shippingDistrict: text('shipping_district').notNull(),
  shippingPostalCode: text('shipping_postal_code').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  notes: text('notes'),
  trackingNumber: text('tracking_number'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  variantId: text('variant_id').notNull().references(() => productVariants.id),
  productName: text('product_name').notNull(),
  variantName: text('variant_name').notNull(),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
  subtotal: integer('subtotal').notNull()
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  provider: text('provider').notNull(), // 'simulated' | 'midtrans'
  transactionId: text('transaction_id'),
  status: text('status').notNull(),
  paymentType: text('payment_type'),
  grossAmount: integer('gross_amount').notNull(),
  rawPayload: text('raw_payload'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const emailLogs = sqliteTable('email_logs', {
  id: text('id').primaryKey(),
  orderId: text('order_id'),
  recipient: text('recipient').notNull(),
  subject: text('subject').notNull(),
  template: text('template').notNull(),
  status: text('status').notNull(), // 'sent' | 'failed' | 'logged'
  errorMessage: text('error_message'),
  createdAt: text('created_at').notNull()
});

export const webhookEvents = sqliteTable('webhook_events', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().unique(),
  provider: text('provider').notNull(),
  payloadHash: text('payload_hash').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull()
});
