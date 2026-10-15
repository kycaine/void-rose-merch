import { z } from 'zod';

export const CheckoutItemSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1')
});

export const CheckoutFormSchema = z.object({
  customerName: z.string().min(2, 'Nama lengkap wajib diisi').max(100),
  customerEmail: z.string().email('Format email tidak valid'),
  customerPhone: z.string().min(8, 'Nomor telepon/WhatsApp minimal 8 digit').max(20),
  shippingProvince: z.string().min(2, 'Provinsi wajib diisi'),
  shippingCity: z.string().min(2, 'Kota/Kabupaten wajib diisi'),
  shippingDistrict: z.string().min(2, 'Kecamatan wajib diisi'),
  shippingPostalCode: z.string().min(4, 'Kode pos minimal 4 digit').max(10),
  shippingAddress: z.string().min(5, 'Alamat lengkap pengiriman wajib diisi').max(300),
  notes: z.string().max(300).optional().nullable(),
  paymentMethod: z.string().optional().default('qris'),
  paymentProvider: z.string().optional().nullable(),
  items: z.array(CheckoutItemSchema).min(1, 'Keranjang belanja tidak boleh kosong')
});

export type CheckoutFormInput = z.infer<typeof CheckoutFormSchema>;

export const OrderLookupSchema = z.object({
  orderNumber: z.string().min(3, 'Nomor pesanan wajib diisi'),
  email: z.string().email('Format email tidak valid')
});

export type OrderLookupInput = z.infer<typeof OrderLookupSchema>;

export const AdminShipSchema = z.object({
  trackingNumber: z.string().min(3, 'Nomor resi wajib diisi')
});

export type AdminShipInput = z.infer<typeof AdminShipSchema>;

export const SimulatePaymentSchema = z.object({
  action: z.enum(['success', 'fail'])
});

export type SimulatePaymentInput = z.infer<typeof SimulatePaymentSchema>;

export const MidtransNotificationSchema = z.object({
  order_id: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  transaction_status: z.string(),
  fraud_status: z.string().optional(),
  payment_type: z.string().optional(),
  transaction_id: z.string().optional()
});

export type MidtransNotificationInput = z.infer<typeof MidtransNotificationSchema>;
