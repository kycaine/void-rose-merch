import { useLanguageStore, Language } from '../store/languageStore';

export const translations = {
  id: {
    nav: {
      shop: 'SHOP',
      drops: 'DROPS',
      tour: 'TOUR',
      about: 'TENTANG',
      checkOrder: 'CEK PESANAN',
      cart: 'KERANJANG',
      adminPortal: '⚙ Portal Admin'
    },
    devBanner: {
      devMode: 'MODE DEV',
      simulatedNotice: '★ SIMULATED PAYMENT AKTIF (TANPA KARTU/UANG ASLI) ★'
    },
    marquee: [
      'DROP TERBATAS — TANPA RESTOCK',
      '★ GRATIS ONGKIR MIN. RP 750.000',
      'DROP TERBATAS — TANPA RESTOCK',
      '★ GRATIS ONGKIR MIN. RP 750.000'
    ],
    hero: {
      badge: 'MERCH RESMI — FW26',
      titlePart1: 'WEAR THE',
      titlePart2: 'NOISE.',
      description:
        'Kaos boxy fit edisi terbatas, hoodie katun tebal, dan piringan hitam resmi VOID/ROSE. Produksi terbatas. Tanpa restock.',
      shopBtn: 'BELANJA KOLEKSI',
      tourBtn: 'JADWAL TOUR',
      stickerTop: 'HANYA',
      stickerBottom: '500 PCS'
    },
    featured: {
      title: 'MERCH UNGGULAN',
      subtitle: 'BUATAN TANGAN • CETAKAN EDISI PERTAMA',
      viewAll: 'LIHAT SEMUA'
    },
    drops: {
      badge: 'DROP TERBARU • 31 OKT',
      title: 'MIDNIGHT BLOOM COLLECTION',
      description:
        'Sablon glow-in-the-dark pada kaos boxy katun tebal. Sablon tangan terbatas 150 potong. Habis saat kotak kosong.',
      exploreBtn: 'JELAJAHI DROP →'
    },
    tour: {
      title: 'JADWAL TOUR',
      subtitle: 'TUR UTAMA ASIA TENGGARA',
      getTickets: 'BELI TIKET',
      soldOut: 'HABIS TERJUAL',
      ticketAlert: 'Tiket dibuka segera di loket mitra!'
    },
    ticketModal: {
      badge: 'TIKET KONSER RESMI',
      title: 'BELI TIKET TOUR 2026',
      subtitle: 'E-Ticket resmi ber-barcode instan dikirim via Email setelah pembayaran.',
      selectTier: 'PILIH KATEGORI TIKET:',
      quantity: 'JUMLAH TIKET:',
      maxNotice: 'Maks. 4 tiket per transaksi',
      buyNow: 'BELI SEKARANG (CHECKOUT) →',
      addToCart: '+ MASUKKAN KERANJANG',
      ticketAdded: 'TIKET DITAMBAHKAN! ✓',
      total: 'TOTAL PEMBAYARAN:',
      remaining: 'Tersisa'
    },
    newsletter: {
      title: 'GABUNG KE PIT.',
      description:
        'Akses awal ke secret drops, kode presale tiket konser, dan merch backstage. Tanpa spam, murni distorsi.',
      placeholder: 'MASUKKAN EMAIL ANDA...',
      subscribeBtn: 'BERLANGGANAN',
      success: "KAMU SUDAH MASUK PIT. CEK INBOX KAMU!"
    },
    shop: {
      breadcrumbHome: 'BERANDA',
      breadcrumbShop: 'SHOP',
      title: 'KOLEKSI RESMI',
      itemsCount: 'PRODUK',
      categories: {
        ALL: 'SEMUA',
        'T-SHIRT': 'T-SHIRT',
        HOODIE: 'HOODIE',
        VINYL: 'VINYL',
        ACCESSORIES: 'AKSESORIS'
      },
      sortLabel: 'URUTKAN:',
      sortFeatured: 'Unggulan',
      sortLowToHigh: 'Harga: Termurah',
      sortHighToLow: 'Harga: Termahal',
      noProducts: 'Tidak ada produk ditemukan di kategori ini.'
    },
    productCard: {
      soldOut: 'HABIS',
      quickAdd: '+ CEPAT',
      added: 'DITAMBAH ✓'
    },
    productDetail: {
      breadcrumbHome: 'BERANDA',
      breadcrumbShop: 'SHOP',
      loading: 'MEMUAT DETAIL PRODUK...',
      notFound: 'PRODUK TIDAK DITEMUKAN',
      backToShop: 'KEMBALI KE SHOP',
      selectSize: 'PILIH UKURAN',
      selectColor: 'WARNA',
      sizeGuide: 'PANDUAN UKURAN',
      stockRemaining: 'Sisa stok:',
      inStock: 'Stok tersedia',
      soldOut: 'HABIS TERJUAL',
      quantity: 'JUMLAH',
      addToCart: 'TAMBAH KE KERANJANG',
      addedToCart: 'BERHASIL DITAMBAHKAN!',
      tabs: {
        details: 'DETAIL & SPESIFIKASI',
        shipping: 'INFORMASI PENGIRIMAN',
        returns: 'GARANSI & PENGEMBALIAN'
      }
    },
    cart: {
      title: 'KERANJANG KAMU',
      step1: '1 KERANJANG',
      step2: '2 DATA PESANAN',
      step3: '3 PEMBAYARAN',
      emptyTitle: 'KERANJANG KOSONG',
      emptyDesc:
        'Belum ada merch yang kamu pilih. Ayo jelajahi koleksi terbaru VOID/ROSE sebelum kehabisan!',
      startShopping: 'MULAI BELANJA MERCH →',
      table: {
        product: 'PRODUK',
        price: 'HARGA',
        quantity: 'JUMLAH',
        total: 'TOTAL',
        action: 'AKSI'
      },
      summaryTitle: 'RINGKASAN PESANAN',
      subtotal: 'Subtotal',
      shipping: 'Ongkos Kirim',
      freeShippingNotice: 'Gratis ongkir untuk pesanan di atas Rp 750.000',
      freeShippingUnlocked: '★ Kamu mendapatkan GRATIS ONGKIR!',
      free: 'GRATIS',
      total: 'Total Akhir',
      checkoutBtn: 'LANJUT KE CHECKOUT →',
      clearCart: 'KOSONGKAN KERANJANG',
      continueShopping: '← LANJUT BELANJA'
    },
    floatingCart: {
      title: 'KERANJANG',
      items: 'barang',
      total: 'Total',
      payNow: 'BAYAR SEKARANG →',
      clearCart: 'KOSONGKAN CART',
      clearConfirm: 'Kosongkan keranjang belanja?',
      viewCart: 'Lihat Keranjang Lengkap',
      addedNotice: 'Masuk Keranjang! 🛒'
    },
    checkout: {
      title: 'CHECKOUT PESANAN',
      emptyTitle: 'KERANJANG ANDA KOSONG',
      backToShop: 'KEMBALI KE KATALOG',
      buyerTitle: '1. DATA PEMBELI',
      buyerDesc: 'Konfirmasi pesanan dan nomor resi akan dikirim ke kontak ini.',
      fullName: 'NAMA LENGKAP *',
      fullNamePlaceholder: 'cth: Arya Wiguna',
      email: 'EMAIL *',
      emailPlaceholder: 'emailmu@domain.com',
      phone: 'NO. WHATSAPP / TELEPON *',
      phonePlaceholder: '081234567890',
      shippingTitle: '2. ALAMAT PENGIRIMAN',
      province: 'PROVINSI *',
      city: 'KOTA / KABUPATEN *',
      district: 'KECAMATAN *',
      postalCode: 'KODE POS *',
      fullAddress: 'ALAMAT LENGKAP *',
      fullAddressPlaceholder: 'Nama jalan, nomor rumah, RT/RW, patokan lokasi...',
      notes: 'CATATAN TAMBAHAN (OPSIONAL)',
      notesPlaceholder: 'cth: Titipkan di pos satpam jika tidak ada orang...',
      paymentSectionTitle: '3. PILIH METODE PEMBAYARAN',
      paymentSectionDesc: 'Semua metode terhubung otomatis & terverifikasi 24/7.',
      paymentCategoryQris: 'QRIS & E-Wallet',
      paymentCategoryVa: 'Virtual Account Bank',
      paymentCategoryPaylater: 'PayLater & Cicilan',
      adminFeeFree: 'Bebas Biaya Admin (Rp 0)',
      summaryTitle: '4. RINGKASAN & PEMBAYARAN',
      orderSummary: 'Ringkasan Pesanan',
      shippingFlat: 'Pengiriman Kurir Cepat (Flat Rate)',
      placeOrderBtn: 'BAYAR SEKARANG',
      processing: 'MEMPROSES PESANAN...',
      secureNotice: 'Sistem belanja tanpa login. Tautan pelacakan unik akan dibuat otomatis.'
    },
    orderLookup: {
      badge: 'PELACAKAN TANPA LOGIN',
      title: 'CEK STATUS PESANAN',
      description:
        'Masukkan Nomor Pesanan dan Email yang Anda gunakan saat checkout untuk melihat rincian pengiriman.',
      orderNumberLabel: 'NOMOR PESANAN *',
      orderNumberPlaceholder: 'misal: VR-849102-452',
      emailLabel: 'EMAIL PEMBELI *',
      emailPlaceholder: 'emailmu@domain.com',
      submitBtn: 'CARI PESANAN →',
      searching: 'MENCARI PESANAN...',
      helpText: 'Butuh bantuan pesanan? Hubungi'
    },
    orderTracking: {
      title: 'STATUS PESANAN',
      loading: 'MEMUAT STATUS PESANAN...',
      notFoundTitle: 'AKSES DITOLAK ATAU TIDAK DITEMUKAN',
      notFoundDesc: 'Pesanan tidak ditemukan atau tautan token akses tidak valid.',
      checkViaLookup: 'CEK DENGAN EMAIL & NO. PESANAN',
      copyLink: 'SALIN TAUTAN PESANAN',
      linkCopied: 'TAUTAN TERSALIN! ✓',
      repayBtn: 'BAYAR SEKARANG / COBA LAGI',
      repaying: 'MEMPROSES PEMBAYARAN...',
      trackingNumberLabel: 'NOMOR RESI KURIR',
      buyerDetails: 'Informasi Pembeli',
      shippingAddress: 'Alamat Pengiriman',
      orderItems: 'Rincian Barang',
      backToShop: '← KEMBALI KE SHOP'
    },
    footer: {
      brandDesc:
        'Merch resmi dari band paling bising di panggung. Dibuat dalam jumlah terbatas, dikirim ke seluruh dunia.',
      cities: 'JAKARTA • BANDUNG • SGP • KL',
      colShop: 'SHOP',
      colBand: 'BAND',
      tourDates: 'Jadwal Tour',
      about: 'Tentang',
      pressKit: 'Press Kit',
      contact: 'Kontak',
      colHelp: 'BANTUAN',
      checkOrder: '★ Cek Status Pesanan',
      shippingInfo: 'Pengiriman (1-3 Hari Kerja)',
      returnsInfo: 'Garansi Retur (7 Hari)',
      adminPortal: '⚙ Portal Admin',
      copyright: 'HAK CIPTA DILINDUNGI. WEAR THE NOISE.'
    }
  },
  en: {
    nav: {
      shop: 'SHOP',
      drops: 'DROPS',
      tour: 'TOUR',
      about: 'ABOUT',
      checkOrder: 'CHECK ORDER',
      cart: 'CART',
      adminPortal: '⚙ Admin Portal'
    },
    devBanner: {
      devMode: 'DEV MODE',
      simulatedNotice: '★ SIMULATED PAYMENT ACTIVE (NO REAL MONEY/CARDS) ★'
    },
    marquee: [
      'LIMITED DROP — NO RESTOCK',
      '★ FREE SHIPPING OVER RP 750.000',
      'LIMITED DROP — NO RESTOCK',
      '★ FREE SHIPPING OVER RP 750.000'
    ],
    hero: {
      badge: 'OFFICIAL MERCH — FW26',
      titlePart1: 'WEAR THE',
      titlePart2: 'NOISE.',
      description:
        'Limited boxy tees, heavyweight French Terry hoodies, and official pressed vinyl from VOID/ROSE. Small batches. No restocks.',
      shopBtn: 'SHOP COLLECTION',
      tourBtn: 'TOUR DATES',
      stickerTop: 'ONLY',
      stickerBottom: '500 PCS'
    },
    featured: {
      title: 'FEATURED MERCH',
      subtitle: 'HAND-CRAFTED • FIRST RUN PRESSING',
      viewAll: 'VIEW ALL'
    },
    drops: {
      badge: 'NEW DROP • OCT 31',
      title: 'MIDNIGHT BLOOM COLLECTION',
      description:
        'Glow-in-the-dark prints on boxy heavyweight tees. Hand-screened in limited batches of 150. Gone when the box is empty.',
      exploreBtn: 'EXPLORE DROP →'
    },
    tour: {
      title: 'ON TOUR',
      subtitle: 'SOUTHEAST ASIA HEADLINE RUN',
      getTickets: 'GET TICKETS',
      soldOut: 'SOLD OUT',
      ticketAlert: 'Tickets opening soon via partner ticketing!'
    },
    ticketModal: {
      badge: 'OFFICIAL CONCERT PASS',
      title: 'GET TOUR 2026 TICKETS',
      subtitle: 'Instant official E-Tickets with QR code emailed upon payment completion.',
      selectTier: 'SELECT TICKET CATEGORY:',
      quantity: 'TICKET QUANTITY:',
      maxNotice: 'Max 4 tickets per transaction',
      buyNow: 'BUY NOW (CHECKOUT) →',
      addToCart: '+ ADD TO CART',
      ticketAdded: 'TICKETS ADDED! ✓',
      total: 'TOTAL PAYMENT:',
      remaining: 'Remaining'
    },
    newsletter: {
      title: 'JOIN THE PIT.',
      description:
        'Early access to secret drops, exclusive presale codes, and backstage merch. No spam, just pure noise.',
      placeholder: 'ENTER YOUR EMAIL...',
      subscribeBtn: 'SUBSCRIBE',
      success: "YOU'RE IN THE PIT. CHECK YOUR INBOX!"
    },
    shop: {
      breadcrumbHome: 'HOME',
      breadcrumbShop: 'SHOP',
      title: 'THE COLLECTION',
      itemsCount: 'ITEMS',
      categories: {
        ALL: 'ALL',
        'T-SHIRT': 'T-SHIRT',
        HOODIE: 'HOODIE',
        VINYL: 'VINYL',
        ACCESSORIES: 'ACCESSORIES'
      },
      sortLabel: 'SORT BY:',
      sortFeatured: 'Featured',
      sortLowToHigh: 'Price: Low to High',
      sortHighToLow: 'Price: High to Low',
      noProducts: 'No products found in this category.'
    },
    productCard: {
      soldOut: 'SOLD OUT',
      quickAdd: '+ QUICK ADD',
      added: 'ADDED ✓'
    },
    productDetail: {
      breadcrumbHome: 'HOME',
      breadcrumbShop: 'SHOP',
      loading: 'LOADING PRODUCT DETAILS...',
      notFound: 'PRODUCT NOT FOUND',
      backToShop: 'BACK TO SHOP',
      selectSize: 'SELECT SIZE',
      selectColor: 'COLOR',
      sizeGuide: 'SIZE GUIDE',
      stockRemaining: 'Stock remaining:',
      inStock: 'In Stock',
      soldOut: 'SOLD OUT',
      quantity: 'QUANTITY',
      addToCart: 'ADD TO CART',
      addedToCart: 'ADDED TO CART!',
      tabs: {
        details: 'SPECIFICATIONS & DETAILS',
        shipping: 'SHIPPING INFORMATION',
        returns: 'RETURNS & WARRANTY'
      }
    },
    cart: {
      title: 'YOUR CART',
      step1: '1 CART',
      step2: '2 DETAILS',
      step3: '3 PAYMENT',
      emptyTitle: 'CART IS EMPTY',
      emptyDesc:
        "You haven't selected any merch yet. Check out the latest VOID/ROSE drop before it sells out!",
      startShopping: 'START SHOPPING MERCH →',
      table: {
        product: 'PRODUCT',
        price: 'PRICE',
        quantity: 'QTY',
        total: 'TOTAL',
        action: 'ACTION'
      },
      summaryTitle: 'ORDER SUMMARY',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      freeShippingNotice: 'Free shipping on orders over Rp 750,000',
      freeShippingUnlocked: '★ Congrats! You unlocked FREE SHIPPING!',
      free: 'FREE',
      total: 'Grand Total',
      checkoutBtn: 'PROCEED TO CHECKOUT →',
      clearCart: 'CLEAR CART',
      continueShopping: '← CONTINUE SHOPPING'
    },
    floatingCart: {
      title: 'CART',
      items: 'items',
      total: 'Total',
      payNow: 'PAY NOW →',
      clearCart: 'CLEAR CART',
      clearConfirm: 'Clear all items from your cart?',
      viewCart: 'View Full Cart',
      addedNotice: 'Added to Cart! 🛒'
    },
    checkout: {
      title: 'CHECKOUT DETAILS',
      emptyTitle: 'YOUR CART IS EMPTY',
      backToShop: 'RETURN TO CATALOG',
      buyerTitle: '1. BUYER INFORMATION',
      buyerDesc: 'Order confirmation and courier tracking will be sent to this contact.',
      fullName: 'FULL NAME *',
      fullNamePlaceholder: 'e.g. John Doe',
      email: 'EMAIL ADDRESS *',
      emailPlaceholder: 'youremail@domain.com',
      phone: 'WHATSAPP / PHONE NUMBER *',
      phonePlaceholder: '+62 812 3456 7890',
      shippingTitle: '2. SHIPPING ADDRESS',
      province: 'PROVINCE *',
      city: 'CITY / REGENCY *',
      district: 'DISTRICT *',
      postalCode: 'POSTAL CODE *',
      fullAddress: 'FULL STREET ADDRESS *',
      fullAddressPlaceholder: 'Street name, house number, apartment/unit, landmarks...',
      notes: 'ORDER NOTES (OPTIONAL)',
      notesPlaceholder: 'e.g. Please leave with building security if unavailable...',
      paymentSectionTitle: '3. SELECT PAYMENT METHOD',
      paymentSectionDesc: 'All methods are auto-verified 24/7 with zero waiting time.',
      paymentCategoryQris: 'QRIS & E-Wallets',
      paymentCategoryVa: 'Bank Virtual Account',
      paymentCategoryPaylater: 'PayLater & Installments',
      adminFeeFree: 'Zero Admin Fee (Rp 0)',
      summaryTitle: '4. SUMMARY & PAYMENT',
      orderSummary: 'Order Summary',
      shippingFlat: 'Standard Express Shipping (Flat Rate)',
      placeOrderBtn: 'PAY NOW',
      processing: 'PROCESSING ORDER...',
      secureNotice: 'Guest checkout with zero registration. Unique secure token generated automatically.'
    },
    orderLookup: {
      badge: 'GUEST TRACKING (NO LOGIN)',
      title: 'CHECK ORDER STATUS',
      description:
        'Enter the Order Number and Email you used during checkout to view shipment details.',
      orderNumberLabel: 'ORDER NUMBER *',
      orderNumberPlaceholder: 'e.g. VR-849102-452',
      emailLabel: 'BUYER EMAIL *',
      emailPlaceholder: 'youremail@domain.com',
      submitBtn: 'SEARCH ORDER →',
      searching: 'SEARCHING ORDER...',
      helpText: 'Need help with an order? Contact'
    },
    orderTracking: {
      title: 'ORDER STATUS',
      loading: 'LOADING ORDER STATUS...',
      notFoundTitle: 'ACCESS DENIED OR NOT FOUND',
      notFoundDesc: 'Order not found or the access token link is invalid.',
      checkViaLookup: 'LOOKUP VIA EMAIL & ORDER NUMBER',
      copyLink: 'COPY ORDER LINK',
      linkCopied: 'LINK COPIED! ✓',
      repayBtn: 'RETRY PAYMENT NOW',
      repaying: 'PROCESSING PAYMENT...',
      trackingNumberLabel: 'COURIER TRACKING NUMBER',
      buyerDetails: 'Buyer Information',
      shippingAddress: 'Shipping Destination',
      orderItems: 'Order Items',
      backToShop: '← BACK TO SHOP'
    },
    footer: {
      brandDesc:
        'Official merch from the loudest band in the room. Made in small batches, shipped worldwide.',
      cities: 'JAKARTA • BANDUNG • SGP • KL',
      colShop: 'SHOP',
      colBand: 'BAND',
      tourDates: 'Tour Dates',
      about: 'About',
      pressKit: 'Press Kit',
      contact: 'Contact',
      colHelp: 'HELP',
      checkOrder: '★ Check Order Status',
      shippingInfo: 'Shipping (1-3 Business Days)',
      returnsInfo: 'Returns (7-Day Warranty)',
      adminPortal: '⚙ Admin Portal',
      copyright: 'ALL RIGHTS RESERVED. WEAR THE NOISE.'
    }
  }
} as const;

export type TranslationSchema = typeof translations.id;

export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguageStore();
  const t = translations[language] || translations.id;
  return {
    lang: language,
    setLanguage,
    toggleLanguage,
    t,
    isId: language === 'id',
    isEn: language === 'en'
  };
}
