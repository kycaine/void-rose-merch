-- Tour Tickets Products and Variants
INSERT OR REPLACE INTO products (id, slug, name, description, category, badge, details, shipping_info, returns_info, image_url, thumbnail_urls, is_featured, is_active, created_at, updated_at)
VALUES
(
  'prod_ticket_jkt',
  'ticket-jakarta-tour-2026',
  'VOID/ROSE Live in Jakarta 2026',
  'Official Tour Ticket: VOID/ROSE Live at Istora Senayan, Jakarta. 14 November 2026. Southeast Asia Headline Run.',
  'TICKETS',
  'TOUR',
  'Istora Senayan, Jakarta. Open Gate: 17:00 WIB. Show Starts: 19:30 WIB. E-Ticket QR code issued upon payment. Age limit: 15+.',
  'E-Ticket Instan dikirim via Email dengan QR Code akses masuk.',
  'Tiket konser tidak dapat di-refund setelah pembayaran berhasil.',
  '/assets/products/tour-ticket.svg',
  '["/assets/products/tour-ticket.svg"]',
  0,
  1,
  datetime('now'),
  datetime('now')
),
(
  'prod_ticket_bdg',
  'ticket-bandung-tour-2026',
  'VOID/ROSE Live in Bandung 2026',
  'Official Tour Ticket: VOID/ROSE Live at Saparua Hall, Bandung. 21 November 2026. Southeast Asia Headline Run.',
  'TICKETS',
  'TOUR',
  'Saparua Hall, Bandung. Open Gate: 17:00 WIB. Show Starts: 19:30 WIB. E-Ticket QR code issued upon payment.',
  'E-Ticket Instan dikirim via Email dengan QR Code akses masuk.',
  'Tiket konser tidak dapat di-refund setelah pembayaran berhasil.',
  '/assets/products/tour-ticket.svg',
  '["/assets/products/tour-ticket.svg"]',
  0,
  1,
  datetime('now'),
  datetime('now')
),
(
  'prod_ticket_sgp',
  'ticket-singapore-tour-2026',
  'VOID/ROSE Live in Singapore 2026',
  'Official Tour Ticket: VOID/ROSE Live at The Substation, Singapore. 05 December 2026. Southeast Asia Headline Run.',
  'TICKETS',
  'TOUR',
  'The Substation, Singapore. Doors: 18:30 SGT. Show: 20:00 SGT. E-Ticket QR code issued upon payment.',
  'Instant E-Ticket sent to your email with check-in QR code.',
  'Concert tickets are non-refundable once purchased.',
  '/assets/products/tour-ticket.svg',
  '["/assets/products/tour-ticket.svg"]',
  0,
  1,
  datetime('now'),
  datetime('now')
);

-- Variants for Jakarta Tour Tickets
INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, price, stock, created_at, updated_at) VALUES
('var_tkt_jkt_ga', 'prod_ticket_jkt', 'VR-TKT-JKT-GA', 'FESTIVAL GA', 'GENERAL', 450000, 200, datetime('now'), datetime('now')),
('var_tkt_jkt_vip', 'prod_ticket_jkt', 'VR-TKT-JKT-VIP', 'VIP NOISE PASS', 'VIP', 850000, 50, datetime('now'), datetime('now'));

-- Variants for Bandung Tour Tickets
INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, price, stock, created_at, updated_at) VALUES
('var_tkt_bdg_ga', 'prod_ticket_bdg', 'VR-TKT-BDG-GA', 'FESTIVAL GA', 'GENERAL', 350000, 150, datetime('now'), datetime('now')),
('var_tkt_bdg_vip', 'prod_ticket_bdg', 'VR-TKT-BDG-VIP', 'VIP NOISE PASS', 'VIP', 750000, 35, datetime('now'), datetime('now'));

-- Variants for Singapore Tour Tickets
INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, price, stock, created_at, updated_at) VALUES
('var_tkt_sgp_ga', 'prod_ticket_sgp', 'VR-TKT-SGP-GA', 'FESTIVAL GA', 'GENERAL', 650000, 100, datetime('now'), datetime('now')),
('var_tkt_sgp_vip', 'prod_ticket_sgp', 'VR-TKT-SGP-VIP', 'VIP NOISE PASS', 'VIP', 1100000, 25, datetime('now'), datetime('now'));
