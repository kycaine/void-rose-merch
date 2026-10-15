export const DESIGN_TOKENS = {
  colors: {
    bg: '#F8EDE3',
    surface: '#DFD3C3',
    accent2: '#D0B8A8',
    brand: '#85586F',
    brandHover: '#6B4559',
    ink: '#1A1A1A',
    white: '#FFFFFF',
    disabled: '#6B6B6B'
  },
  fonts: {
    display: "'Archivo Black', sans-serif",
    body: "'Space Grotesk', sans-serif",
    mono: "'Space Mono', monospace"
  },
  borders: {
    default: '3px solid #1A1A1A',
    emphasis: '4px solid #1A1A1A',
    focus: '5px solid #85586F'
  },
  shadows: {
    xs: '3px 3px 0px #1A1A1A',
    sm: '4px 4px 0px #1A1A1A',
    md: '6px 6px 0px #1A1A1A',
    lg: '8px 8px 0px #1A1A1A',
    xl: '10px 10px 0px #1A1A1A'
  }
} as const;

export const CATEGORIES = ['ALL', 'T-SHIRT', 'HOODIE', 'VINYL', 'ACCESSORIES', 'TICKETS'] as const;

export const FLAT_RATE_SHIPPING_IDR = 25000;
export const FREE_SHIPPING_THRESHOLD_IDR = 750000; // Free shipping over Rp 750.000 (matching banner)

export const ORDER_STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: 'MENUNGGU PEMBAYARAN', bg: '#D0B8A8', color: '#1A1A1A' },
  paid: { label: 'SUDAH DIBAYAR', bg: '#85586F', color: '#FFFFFF' },
  failed: { label: 'PEMBAYARAN GAGAL', bg: '#1A1A1A', color: '#FFFFFF' },
  expired: { label: 'KEDALUWARSA', bg: '#6B6B6B', color: '#FFFFFF' },
  cancelled: { label: 'DIBATALKAN', bg: '#6B6B6B', color: '#FFFFFF' },
  shipped: { label: 'SEDANG DIKIRIM', bg: '#DFD3C3', color: '#1A1A1A' },
  completed: { label: 'SELESAI', bg: '#85586F', color: '#FFFFFF' }
};

export const ORDER_STATUS_LABELS_EN: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: 'PENDING PAYMENT', bg: '#D0B8A8', color: '#1A1A1A' },
  paid: { label: 'PAID', bg: '#85586F', color: '#FFFFFF' },
  failed: { label: 'PAYMENT FAILED', bg: '#1A1A1A', color: '#FFFFFF' },
  expired: { label: 'EXPIRED', bg: '#6B6B6B', color: '#FFFFFF' },
  cancelled: { label: 'CANCELLED', bg: '#6B6B6B', color: '#FFFFFF' },
  shipped: { label: 'SHIPPED', bg: '#DFD3C3', color: '#1A1A1A' },
  completed: { label: 'COMPLETED', bg: '#85586F', color: '#FFFFFF' }
};

export function getOrderStatusLabel(status: string, lang: 'id' | 'en' = 'en') {
  const dict = lang === 'id' ? ORDER_STATUS_LABELS : ORDER_STATUS_LABELS_EN;
  return dict[status] || { label: status.toUpperCase(), bg: '#DFD3C3', color: '#1A1A1A' };
}

export const MARQUEE_ITEMS = [
  'LIMITED DROP — NO RESTOCK',
  '★ FREE SHIPPING OVER RP 750.000',
  'LIMITED DROP — NO RESTOCK',
  '★ FREE SHIPPING OVER RP 750.000',
  'LIMITED DROP — NO RESTOCK',
  '★ FREE SHIPPING OVER RP 750.000',
  'LIMITED DROP — NO RESTOCK',
  '★ FREE SHIPPING OVER RP 750.000'
];

export interface TourTier {
  variantId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  desc: string;
}

export interface TourShow {
  id: string;
  day: string;
  month: string;
  city: string;
  venue: string;
  active: boolean;
  ticketSlug: string;
  priceFrom: number;
  tiers: TourTier[];
}

export const TOUR_DATES: TourShow[] = [
  {
    id: 'prod_ticket_jkt',
    day: '14',
    month: 'NOV',
    city: 'JAKARTA, ID',
    venue: 'Istora Senayan',
    active: true,
    ticketSlug: 'ticket-jakarta-tour-2026',
    priceFrom: 450000,
    tiers: [
      {
        variantId: 'var_tkt_jkt_ga',
        name: 'FESTIVAL GA',
        sku: 'VR-TKT-JKT-GA',
        price: 450000,
        stock: 200,
        desc: 'Akses festival & moshpit area'
      },
      {
        variantId: 'var_tkt_jkt_vip',
        name: 'VIP NOISE PASS',
        sku: 'VR-TKT-JKT-VIP',
        price: 850000,
        stock: 50,
        desc: 'Priority lane, VIP lanyard, & Official Tour Poster'
      }
    ]
  },
  {
    id: 'prod_ticket_bdg',
    day: '21',
    month: 'NOV',
    city: 'BANDUNG, ID',
    venue: 'Saparua Hall',
    active: true,
    ticketSlug: 'ticket-bandung-tour-2026',
    priceFrom: 350000,
    tiers: [
      {
        variantId: 'var_tkt_bdg_ga',
        name: 'FESTIVAL GA',
        sku: 'VR-TKT-BDG-GA',
        price: 350000,
        stock: 150,
        desc: 'Akses festival & moshpit area'
      },
      {
        variantId: 'var_tkt_bdg_vip',
        name: 'VIP NOISE PASS',
        sku: 'VR-TKT-BDG-VIP',
        price: 750000,
        stock: 35,
        desc: 'Priority lane, VIP lanyard, & Official Tour Poster'
      }
    ]
  },
  {
    id: 'prod_ticket_sgp',
    day: '05',
    month: 'DEC',
    city: 'SINGAPORE',
    venue: 'The Substation',
    active: true,
    ticketSlug: 'ticket-singapore-tour-2026',
    priceFrom: 650000,
    tiers: [
      {
        variantId: 'var_tkt_sgp_ga',
        name: 'FESTIVAL GA',
        sku: 'VR-TKT-SGP-GA',
        price: 650000,
        stock: 100,
        desc: 'General admission standing area'
      },
      {
        variantId: 'var_tkt_sgp_vip',
        name: 'VIP NOISE PASS',
        sku: 'VR-TKT-SGP-VIP',
        price: 1100000,
        stock: 25,
        desc: 'Priority gate entry, VIP lanyard, & Tour Poster'
      }
    ]
  },
  {
    id: 'prod_ticket_kl',
    day: '12',
    month: 'DEC',
    city: 'KUALA LUMPUR',
    venue: 'Zepp KL',
    active: false,
    ticketSlug: 'ticket-kuala-lumpur-tour-2026',
    priceFrom: 400000,
    tiers: []
  }
];

export interface PaymentMethodOption {
  id: string;
  name: string;
  category: 'QRIS' | 'VA' | 'PAYLATER';
  categoryLabel: string;
  description: string;
  badge?: string;
  iconType: 'qris' | 'bank' | 'paylater';
  vaPrefix?: string;
  shortName: string;
  instructionTitle: string;
  steps: string[];
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  // 1. QRIS
  {
    id: 'qris',
    name: 'QRIS (Gopay, OVO, Dana, ShopeePay, BCA, Livin, dll)',
    shortName: 'QRIS Realtime',
    category: 'QRIS',
    categoryLabel: 'QRIS & E-Wallet',
    description: 'Scan kode QR langsung dari semua aplikasi mobile banking dan dompet digital.',
    badge: 'INSTANT AUTO-CHECK',
    iconType: 'qris',
    instructionTitle: 'Cara Pembayaran QRIS:',
    steps: [
      'Buka aplikasi e-Wallet (GoPay, OVO, Dana, ShopeePay) atau Mobile Banking favoritmu.',
      'Pilih menu "Scan" atau "Bayar" lalu scan kode QR di layar.',
      'Periksa nama merchant: VOID/ROSE MERCH dan nominal total pembayaran.',
      'Masukkan PIN transaksimu untuk menyelesaikan pembayaran instan.'
    ]
  },

  // 2. Virtual Account (VA Bank)
  {
    id: 'va_bca',
    name: 'BCA Virtual Account',
    shortName: 'BCA VA',
    category: 'VA',
    categoryLabel: 'Virtual Account Bank',
    description: 'Transfer otomatis via m-BCA, KlikBCA, atau ATM BCA 24 jam.',
    badge: 'OTOMATIS',
    iconType: 'bank',
    vaPrefix: '8808',
    instructionTitle: 'Cara Pembayaran via m-BCA:',
    steps: [
      'Buka aplikasi BCA Mobile, pilih m-BCA dan masukkan Kode Akses.',
      'Pilih m-Transfer > BCA Virtual Account.',
      'Masukkan Nomor Virtual Account yang tertera di bawah.',
      'Konfirmasi rincian tagihan, lalu masukkan PIN m-BCA kamu.'
    ]
  },
  {
    id: 'va_mandiri',
    name: 'Mandiri Virtual Account (Livin by Mandiri)',
    shortName: 'Mandiri VA',
    category: 'VA',
    categoryLabel: 'Virtual Account Bank',
    description: 'Bayar via aplikasi Livin by Mandiri atau ATM Mandiri tanpa konfirmasi manual.',
    badge: 'OTOMATIS',
    iconType: 'bank',
    vaPrefix: '8902',
    instructionTitle: 'Cara Pembayaran via Livin by Mandiri:',
    steps: [
      'Buka aplikasi Livin by Mandiri dan login.',
      'Pilih menu Bayar > Buat Pembayaran Baru > Multipayment.',
      'Pilih penyedia jasa atau masukkan Kode Perusahaan / Nomor VA.',
      'Periksa jumlah tagihan dan konfirmasi dengan PIN Livin.'
    ]
  },
  {
    id: 'va_bni',
    name: 'BNI Virtual Account',
    shortName: 'BNI VA',
    category: 'VA',
    categoryLabel: 'Virtual Account Bank',
    description: 'Transfer via BNI Mobile Banking, Internet Banking, atau ATM BNI.',
    badge: 'OTOMATIS',
    iconType: 'bank',
    vaPrefix: '8810',
    instructionTitle: 'Cara Pembayaran via BNI Mobile Banking:',
    steps: [
      'Buka BNI Mobile Banking dan masukkan User ID serta MPIN.',
      'Pilih menu Pembayaran > Virtual Account Billing.',
      'Input Nomor Virtual Account lalu periksa nominal tagihan.',
      'Masukkan Password Transaksi BNI kamu untuk menyelesaikan pembayaran.'
    ]
  },
  {
    id: 'va_bri',
    name: 'BRI Virtual Account (BRIVA)',
    shortName: 'BRI BRIVA',
    category: 'VA',
    categoryLabel: 'Virtual Account Bank',
    description: 'Pembayaran instan via aplikasi BRImo, Internet Banking BRI, atau ATM BRI.',
    badge: 'OTOMATIS',
    iconType: 'bank',
    vaPrefix: '8820',
    instructionTitle: 'Cara Pembayaran via BRImo:',
    steps: [
      'Buka aplikasi BRImo dan login dengan akunmu.',
      'Pilih menu Tagihan > BRIVA.',
      'Masukkan Nomor BRIVA yang tertera, lalu klik Lanjut.',
      'Periksa detail nama pesanan dan masukkan PIN BRImo kamu.'
    ]
  },
  {
    id: 'va_permata',
    name: 'Permata Virtual Account',
    shortName: 'Permata VA',
    category: 'VA',
    categoryLabel: 'Virtual Account Bank',
    description: 'Transfer via PermataMobile X, PermataNet, atau ATM bersama.',
    badge: 'OTOMATIS',
    iconType: 'bank',
    vaPrefix: '8830',
    instructionTitle: 'Cara Pembayaran via PermataMobile X:',
    steps: [
      'Buka PermataMobile X dan login.',
      'Pilih menu Pay Bills > Virtual Account.',
      'Masukkan Nomor Permata VA dan klik Lanjut.',
      'Konfirmasi detail tagihan dan masukkan Mobile PIN.'
    ]
  },
  {
    id: 'va_cimb',
    name: 'CIMB Niaga Virtual Account',
    shortName: 'CIMB Niaga VA',
    category: 'VA',
    categoryLabel: 'Virtual Account Bank',
    description: 'Bayar via OCTO Mobile, OCTO Clicks, atau ATM CIMB Niaga.',
    badge: 'OTOMATIS',
    iconType: 'bank',
    vaPrefix: '8840',
    instructionTitle: 'Cara Pembayaran via OCTO Mobile:',
    steps: [
      'Buka aplikasi OCTO Mobile dan lakukan login.',
      'Pilih menu Pembayaran Tagihan > Virtual Account.',
      'Masukkan Nomor Virtual Account CIMB Niaga.',
      'Verifikasi detail pembayaran dan masukkan PIN OCTO Mobile.'
    ]
  },

  // 3. PayLater
  {
    id: 'paylater_gopay',
    name: 'GoPay Later (Cicil s/d 12 Bulan)',
    shortName: 'GoPay Later',
    category: 'PAYLATER',
    categoryLabel: 'PayLater & Cicilan',
    description: 'Beli merch sekarang, bayar bulan depan atau cicil hingga 12 bulan.',
    badge: 'BUNGA 0%',
    iconType: 'paylater',
    instructionTitle: 'Cara Pembayaran via GoPay Later:',
    steps: [
      'Pilih tenor cicilan yang kamu inginkan (30 Hari, 3, 6, atau 12 Bulan).',
      'Pastikan limit kredit GoPay Later kamu mencukupi total belanja.',
      'Klik tombol otorisasi untuk membuka konfirmasi GoPay Later.',
      'Masukkan PIN GoPay untuk menyetujui transaksi.'
    ]
  },
  {
    id: 'paylater_kredivo',
    name: 'Kredivo PayLater',
    shortName: 'Kredivo',
    category: 'PAYLATER',
    categoryLabel: 'PayLater & Cicilan',
    description: 'Bunga 0% untuk bayar 30 hari, atau cicilan fleksibel 3, 6, 12 bulan.',
    badge: 'POPULER',
    iconType: 'paylater',
    instructionTitle: 'Cara Pembayaran via Kredivo:',
    steps: [
      'Login ke akun Kredivo saat halaman otorisasi terbuka.',
      'Pilih skema pembayaran: Bayar dalam 30 Hari atau Cicilan.',
      'Masukkan kode OTP yang dikirimkan via SMS ke nomor HP terdaftar.',
      'Klik Bayar untuk memfinalisasi transaksi.'
    ]
  },
  {
    id: 'paylater_akulaku',
    name: 'Akulaku PayLater',
    shortName: 'Akulaku',
    category: 'PAYLATER',
    categoryLabel: 'PayLater & Cicilan',
    description: 'Cicilan tanpa kartu kredit mudah dan instan dengan Akulaku.',
    badge: 'CICILAN INSTAN',
    iconType: 'paylater',
    instructionTitle: 'Cara Pembayaran via Akulaku:',
    steps: [
      'Pilih Akulaku PayLater dan pilih rencana pembayaran cicilan.',
      'Login ke akun Akulaku dengan nomor telepon dan password/OTP.',
      'Konfirmasi uang muka (Rp 0) dan nominal cicilan bulanan.',
      'Selesaikan transaksi dengan menekan tombol Konfirmasi.'
    ]
  },
  {
    id: 'paylater_spaylater',
    name: 'ShopeePay Later (SPayLater)',
    shortName: 'SPayLater',
    category: 'PAYLATER',
    categoryLabel: 'PayLater & Cicilan',
    description: 'Gunakan limit SPayLater kamu untuk checkout merchandise VOID/ROSE.',
    badge: 'SPayLater',
    iconType: 'paylater',
    instructionTitle: 'Cara Pembayaran via SPayLater:',
    steps: [
      'Buka notifikasi aplikasi Shopee atau scan verifikasi SPayLater.',
      'Pilih opsi pembayaran Beli Sekarang Bayar Nanti (Next Month) atau Cicilan.',
      'Cek rincian pembayaran jatuh tempo dan biaya penanganan.',
      'Masukkan PIN ShopeePay / SPayLater kamu untuk otorisasi.'
    ]
  }
];

