-- Seed Products and Variants for VOID/ROSE Band Merch

INSERT OR REPLACE INTO products (id, slug, name, description, category, badge, details, shipping_info, returns_info, image_url, thumbnail_urls, is_featured, is_active, created_at, updated_at)
VALUES
(
  'prod_1',
  'void-rose-tee',
  'Void Rose Tee',
  'Boxy 280gsm cotton tee with a screen-printed rose and thorn graphic on the back. Pre-washed, oversized fit.',
  'T-SHIRT',
  'NEW',
  '100% organic cotton, 280gsm. Screen print, water-based inks. Pre-washed, oversized fit.',
  'Pengiriman menggunakan JNE / SiCepat / J&T dengan nomor resi otomatis. Dikirim dalam 1-3 hari kerja.',
  'Garansi retur 7 hari jika barang cacat produksi atau ukuran salah dari kami (wajib sertakan video unboxing).',
  '/assets/products/void-rose-tee.svg',
  '["/assets/products/void-rose-tee.svg", "/assets/products/void-rose-tee-back.svg", "/assets/products/void-rose-tee-detail.svg"]',
  1,
  1,
  datetime('now'),
  datetime('now')
),
(
  'prod_2',
  'thorn-heavy-hoodie',
  'Thorn Heavy Hoodie',
  'Heavyweight French Terry hoodie with barbed thorn screen-print along sleeves and chest.',
  'HOODIE',
  'BEST SELLER',
  '450gsm heavyweight French Terry, custom double-layered hood, thorn graphic print, kangaroo pocket.',
  'Pengiriman menggunakan JNE / SiCepat / J&T dengan nomor resi otomatis. Dikirim dalam 1-3 hari kerja.',
  'Garansi retur 7 hari jika barang cacat produksi atau ukuran salah dari kami.',
  '/assets/products/thorn-heavy-hoodie.svg',
  '["/assets/products/thorn-heavy-hoodie.svg", "/assets/products/thorn-heavy-hoodie-back.svg"]',
  1,
  1,
  datetime('now'),
  datetime('now')
),
(
  'prod_3',
  'static-bloom-lp',
  'Static Bloom LP',
  'Limited edition 180g clear vinyl with smoke swirl packaging. Includes lyric booklet and poster.',
  'VINYL',
  'LIMITED',
  '180g heavyweight vinyl pressed in clear with black smoke swirl. Gatefold packaging with silver foil stamping.',
  'Dikemas khusus dengan kardus double-wall vinyl mailer untuk mencegah benturan dan lipatan sudut cover.',
  'Retur hanya berlaku jika piringan hitam mengalami skipping atau cacat audio permanen.',
  '/assets/products/static-bloom-lp.svg',
  '["/assets/products/static-bloom-lp.svg", "/assets/products/static-bloom-lp-gatefold.svg"]',
  1,
  1,
  datetime('now'),
  datetime('now')
),
(
  'prod_4',
  'barbed-tote-bag',
  'Barbed Tote Bag',
  'Heavyweight 16oz canvas tote with industrial stitch reinforcement and barbed wire graphics.',
  'ACCESSORIES',
  'HOT',
  '16oz heavy organic canvas, reinforced cross-stitching on handles, inner zippered stash pocket.',
  'Dikirim dalam 1-3 hari kerja.',
  'Garansi retur 7 hari untuk cacat jahitan.',
  '/assets/products/barbed-tote-bag.svg',
  '["/assets/products/barbed-tote-bag.svg"]',
  1,
  1,
  datetime('now'),
  datetime('now')
),
(
  'prod_5',
  'midnight-bloom-tee',
  'Midnight Bloom Tee',
  'Glow-in-the-dark graphic prints on boxy heavyweight tees. Gone when the box is empty.',
  'T-SHIRT',
  'NEW',
  '280gsm combed cotton, special photo-luminescent screenprint, ribbed collar.',
  'Dikirim dalam 1-3 hari kerja.',
  'Garansi retur 7 hari untuk cacat produksi.',
  '/assets/products/midnight-bloom-tee.svg',
  '["/assets/products/midnight-bloom-tee.svg"]',
  0,
  1,
  datetime('now'),
  datetime('now')
),
(
  'prod_6',
  'crimson-zip-hoodie',
  'Crimson Zip Hoodie',
  'Custom YKK two-way zipper hoodie with embroidered rose emblem on chest.',
  'HOODIE',
  NULL,
  '420gsm loopback fleece, custom gunmetal YKK two-way zipper, tonal embroidery.',
  'Dikirim dalam 1-3 hari kerja.',
  'Garansi retur 7 hari untuk cacat produksi.',
  '/assets/products/crimson-zip-hoodie.svg',
  '["/assets/products/crimson-zip-hoodie.svg"]',
  0,
  1,
  datetime('now'),
  datetime('now')
),
(
  'prod_7',
  'noise-floor-12-ep',
  'Noise Floor 12" EP',
  'Recorded live at Jakarta & Bandung. 45RPM audiophile pressing. Limited to 300 numbered copies.',
  'VINYL',
  'SOLD OUT',
  '12-inch 45 RPM audiophile cut. Red marble vinyl, hand-numbered outer sleeve.',
  'Barang habis / Sold out.',
  'Tidak menerima penukaran untuk produk edisi terbatas yang habis.',
  '/assets/products/noise-floor-12-ep.svg',
  '["/assets/products/noise-floor-12-ep.svg"]',
  0,
  1,
  datetime('now'),
  datetime('now')
),
(
  'prod_8',
  'rose-enamel-pin-set',
  'Rose Enamel Pin Set',
  'Set of 3 die-cast hard enamel pins with rubber clutch backings on branded cardboard backer.',
  'ACCESSORIES',
  NULL,
  'Hard enamel, polished black nickel plating, dual rubber pin posts for secure hold.',
  'Dikirim dalam 1-3 hari kerja.',
  'Garansi retur 7 hari.',
  '/assets/products/rose-enamel-pin-set.svg',
  '["/assets/products/rose-enamel-pin-set.svg"]',
  0,
  1,
  datetime('now'),
  datetime('now')
);

-- Variants for Void Rose Tee
INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, price, stock, created_at, updated_at) VALUES
('var_1_s', 'prod_1', 'VR-TEE-BLK-S', 'S', 'BLACK', 350000, 15, datetime('now'), datetime('now')),
('var_1_m', 'prod_1', 'VR-TEE-BLK-M', 'M', 'BLACK', 350000, 20, datetime('now'), datetime('now')),
('var_1_l', 'prod_1', 'VR-TEE-BLK-L', 'L', 'BLACK', 350000, 18, datetime('now'), datetime('now')),
('var_1_xl', 'prod_1', 'VR-TEE-BLK-XL', 'XL', 'BLACK', 350000, 12, datetime('now'), datetime('now'));

-- Variants for Thorn Heavy Hoodie
INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, price, stock, created_at, updated_at) VALUES
('var_2_s', 'prod_2', 'VR-HD-CHR-S', 'S', 'CHARCOAL', 780000, 8, datetime('now'), datetime('now')),
('var_2_m', 'prod_2', 'VR-HD-CHR-M', 'M', 'CHARCOAL', 780000, 14, datetime('now'), datetime('now')),
('var_2_l', 'prod_2', 'VR-HD-CHR-L', 'L', 'CHARCOAL', 780000, 10, datetime('now'), datetime('now')),
('var_2_xl', 'prod_2', 'VR-HD-CHR-XL', 'XL', 'CHARCOAL', 780000, 6, datetime('now'), datetime('now'));

-- Variants for Static Bloom LP
INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, price, stock, created_at, updated_at) VALUES
('var_3_os', 'prod_3', 'VR-LP-CLR-OS', 'ONE SIZE', 'CLEAR SMOKE', 320000, 25, datetime('now'), datetime('now'));

-- Variants for Barbed Tote Bag
INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, price, stock, created_at, updated_at) VALUES
('var_4_os', 'prod_4', 'VR-TB-NAT-OS', 'ONE SIZE', 'NATURAL', 220000, 30, datetime('now'), datetime('now'));

-- Variants for Midnight Bloom Tee
INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, price, stock, created_at, updated_at) VALUES
('var_5_s', 'prod_5', 'VR-MB-BLK-S', 'S', 'FADED BLACK', 380000, 10, datetime('now'), datetime('now')),
('var_5_m', 'prod_5', 'VR-MB-BLK-M', 'M', 'FADED BLACK', 380000, 15, datetime('now'), datetime('now')),
('var_5_l', 'prod_5', 'VR-MB-BLK-L', 'L', 'FADED BLACK', 380000, 12, datetime('now'), datetime('now')),
('var_5_xl', 'prod_5', 'VR-MB-BLK-XL', 'XL', 'FADED BLACK', 380000, 8, datetime('now'), datetime('now'));

-- Variants for Crimson Zip Hoodie
INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, price, stock, created_at, updated_at) VALUES
('var_6_s', 'prod_6', 'VR-ZH-CRM-S', 'S', 'DEEP CRIMSON', 850000, 5, datetime('now'), datetime('now')),
('var_6_m', 'prod_6', 'VR-ZH-CRM-M', 'M', 'DEEP CRIMSON', 850000, 8, datetime('now'), datetime('now')),
('var_6_l', 'prod_6', 'VR-ZH-CRM-L', 'L', 'DEEP CRIMSON', 850000, 6, datetime('now'), datetime('now')),
('var_6_xl', 'prod_6', 'VR-ZH-CRM-XL', 'XL', 'DEEP CRIMSON', 850000, 4, datetime('now'), datetime('now'));

-- Variants for Noise Floor 12" EP (Sold Out)
INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, price, stock, created_at, updated_at) VALUES
('var_7_os', 'prod_7', 'VR-NF-MAR-OS', 'ONE SIZE', 'RED MARBLE', 280000, 0, datetime('now'), datetime('now'));

-- Variants for Rose Enamel Pin Set
INSERT OR REPLACE INTO product_variants (id, product_id, sku, size, color, price, stock, created_at, updated_at) VALUES
('var_8_os', 'prod_8', 'VR-PIN-SIL-OS', 'ONE SIZE', 'ANTIQUE SILVER', 140000, 40, datetime('now'), datetime('now'));
