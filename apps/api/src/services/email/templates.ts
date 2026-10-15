export interface EmailTemplateData {
  orderNumber: string;
  accessToken: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  items: Array<{
    productName: string;
    variantName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  shippingAddress: {
    province: string;
    city: string;
    district: string;
    postalCode: string;
    address: string;
  };
  trackingNumber?: string | null;
  paymentUrl?: string;
  appUrl: string;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

function baseEmailWrapper(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      background-color: #F8EDE3;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1A1A1A;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #DFD3C3;
      border: 4px solid #1A1A1A;
      box-shadow: 6px 6px 0px #1A1A1A;
      padding: 32px 24px;
    }
    .header {
      border-bottom: 4px solid #1A1A1A;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .logo {
      font-family: "Impact", "Arial Black", sans-serif;
      font-size: 32px;
      letter-spacing: -1px;
      color: #1A1A1A;
      text-transform: uppercase;
      margin: 0;
    }
    .badge {
      display: inline-block;
      background-color: #85586F;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 13px;
      padding: 6px 14px;
      border: 3px solid #1A1A1A;
      box-shadow: 3px 3px 0px #1A1A1A;
      margin-top: 12px;
      text-transform: uppercase;
    }
    .btn {
      display: inline-block;
      background-color: #85586F;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 15px;
      padding: 14px 28px;
      border: 3px solid #1A1A1A;
      box-shadow: 5px 5px 0px #1A1A1A;
      text-transform: uppercase;
      margin: 16px 0;
    }
    .btn-secondary {
      background-color: #D0B8A8;
      color: #1A1A1A !important;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      border: 3px solid #1A1A1A;
      background-color: #FFFFFF;
    }
    .item-table th {
      background-color: #1A1A1A;
      color: #FFFFFF;
      padding: 10px 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
    }
    .item-table td {
      padding: 12px;
      border-bottom: 2px solid #1A1A1A;
      font-size: 14px;
    }
    .totals {
      background-color: #FFFFFF;
      border: 3px solid #1A1A1A;
      padding: 16px;
      margin-top: 16px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .totals-grand {
      display: flex;
      justify-content: space-between;
      border-top: 3px solid #1A1A1A;
      padding-top: 10px;
      margin-top: 10px;
      font-weight: 800;
      font-size: 18px;
    }
    .footer {
      margin-top: 32px;
      border-top: 3px solid #1A1A1A;
      padding-top: 16px;
      font-size: 12px;
      color: #6B6B6B;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">VOID/ROSE</div>
      <div style="font-size: 13px; font-weight: 700; margin-top: 4px; letter-spacing: 1px;">OFFICIAL MERCHANDISE</div>
    </div>
    ${contentHtml}
    <div class="footer">
      <p>© 2026 VOID/ROSE. ALL RIGHTS RESERVED.</p>
      <p>Ini adalah email otomatis. Simpan nomor pesanan dan link tracking Anda untuk memantau status pengiriman.</p>
    </div>
  </div>
</body>
</html>`;
}

export function renderOrderCreatedEmail(data: EmailTemplateData): { subject: string; html: string } {
  const trackingUrl = `${data.appUrl}/order/${data.orderNumber}?token=${data.accessToken}`;
  const payUrl = data.paymentUrl || trackingUrl;

  const content = `
    <div class="badge" style="background-color: #D0B8A8; color: #1A1A1A;">MENUNGGU PEMBAYARAN</div>
    <h2 style="font-size: 24px; text-transform: uppercase; margin: 16px 0 8px;">Pesanan #${data.orderNumber} Dibuat</h2>
    <p>Halo <strong>${data.customerName}</strong>, terima kasih telah memesan merchandise resmi VOID/ROSE. Stok item Anda telah kami reservasi.</p>
    <p>Silakan selesaikan pembayaran Anda sekarang agar pesanan dapat segera diproses:</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="${payUrl}" class="btn">Lanjutkan Pembayaran →</a>
    </div>

    <h3 style="font-size: 16px; text-transform: uppercase; margin-top: 24px;">Rincian Item</h3>
    <table class="item-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${data.items
          .map(
            (i) => `
          <tr>
            <td><strong>${i.productName}</strong><br><small style="color: #6B6B6B;">${i.variantName}</small></td>
            <td>${i.quantity}</td>
            <td>${formatIDR(i.subtotal)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row"><span>Subtotal:</span><span>${formatIDR(data.subtotal)}</span></div>
      <div class="totals-row"><span>Ongkos Kirim:</span><span>${formatIDR(data.shippingCost)}</span></div>
      <div class="totals-grand"><span>TOTAL:</span><span>${formatIDR(data.total)}</span></div>
    </div>

    <p style="margin-top: 24px; font-size: 13px;">
      Alamat Pengiriman:<br>
      <strong>${data.customerName}</strong> (${data.customerEmail})<br>
      ${data.shippingAddress.address}, Kec. ${data.shippingAddress.district}, ${data.shippingAddress.city}, ${data.shippingAddress.province} ${data.shippingAddress.postalCode}
    </p>

    <p style="font-size: 13px;">Link pelacakan pesanan Anda:<br><a href="${trackingUrl}" style="color: #85586F; font-weight: 700;">${trackingUrl}</a></p>
  `;

  return {
    subject: `[VOID/ROSE] Menunggu Pembayaran — Pesanan #${data.orderNumber}`,
    html: baseEmailWrapper(`Pesanan #${data.orderNumber} Menunggu Pembayaran`, content)
  };
}

export function renderOrderPaidEmail(data: EmailTemplateData): { subject: string; html: string } {
  const trackingUrl = `${data.appUrl}/order/${data.orderNumber}?token=${data.accessToken}`;

  const content = `
    <div class="badge" style="background-color: #85586F; color: #FFFFFF;">PEMBAYARAN BERHASIL</div>
    <h2 style="font-size: 24px; text-transform: uppercase; margin: 16px 0 8px;">Terima Kasih Atas Pembayaran Anda!</h2>
    <p>Halo <strong>${data.customerName}</strong>, pembayaran untuk pesanan <strong>#${data.orderNumber}</strong> telah kami terima. Tim kami sedang menyiapkan paket merch Anda.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${trackingUrl}" class="btn">Cek Status Pesanan →</a>
    </div>

    <h3 style="font-size: 16px; text-transform: uppercase; margin-top: 24px;">Rincian Pesanan</h3>
    <table class="item-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Harga</th>
        </tr>
      </thead>
      <tbody>
        ${data.items
          .map(
            (i) => `
          <tr>
            <td><strong>${i.productName}</strong><br><small style="color: #6B6B6B;">${i.variantName}</small></td>
            <td>${i.quantity}</td>
            <td>${formatIDR(i.subtotal)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row"><span>Total Terbayar:</span><strong style="font-size: 16px;">${formatIDR(data.total)}</strong></div>
    </div>

    <p style="margin-top: 24px; font-size: 13px;">
      Tujuan Pengiriman:<br>
      ${data.shippingAddress.address}, Kec. ${data.shippingAddress.district}, ${data.shippingAddress.city}, ${data.shippingAddress.province} ${data.shippingAddress.postalCode}
    </p>
  `;

  return {
    subject: `[VOID/ROSE] Pembayaran Diterima — Pesanan #${data.orderNumber}`,
    html: baseEmailWrapper(`Pembayaran Berhasil #${data.orderNumber}`, content)
  };
}

export function renderOrderFailedEmail(data: EmailTemplateData): { subject: string; html: string } {
  const trackingUrl = `${data.appUrl}/order/${data.orderNumber}?token=${data.accessToken}`;

  const content = `
    <div class="badge" style="background-color: #1A1A1A; color: #FFFFFF;">PEMBAYARAN GAGAL / KEDALUWARSA</div>
    <h2 style="font-size: 24px; text-transform: uppercase; margin: 16px 0 8px;">Pembayaran Tidak Berhasil</h2>
    <p>Halo <strong>${data.customerName}</strong>, pembayaran untuk pesanan <strong>#${data.orderNumber}</strong> tidak berhasil atau batas waktu transaksi telah habis.</p>
    <p>Jangan khawatir, Anda dapat mencoba melakukan pembayaran ulang:</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${trackingUrl}" class="btn">Bayar Ulang Sekarang →</a>
    </div>

    <p style="font-size: 13px; color: #6B6B6B;">Jika Anda mengalami kendala atau merasa sudah terpotong saldonya, silakan balas email ini beserta bukti transfer.</p>
  `;

  return {
    subject: `[VOID/ROSE] Pembayaran Gagal — Pesanan #${data.orderNumber}`,
    html: baseEmailWrapper(`Pembayaran Gagal #${data.orderNumber}`, content)
  };
}

export function renderOrderShippedEmail(data: EmailTemplateData): { subject: string; html: string } {
  const trackingUrl = `${data.appUrl}/order/${data.orderNumber}?token=${data.accessToken}`;

  const content = `
    <div class="badge" style="background-color: #DFD3C3; color: #1A1A1A;">PESANAN SEDANG DIKIRIM</div>
    <h2 style="font-size: 24px; text-transform: uppercase; margin: 16px 0 8px;">Paket Anda Sedang Meluncur!</h2>
    <p>Halo <strong>${data.customerName}</strong>, paket pesanan <strong>#${data.orderNumber}</strong> telah diserahkan ke kurir pengiriman.</p>

    <div style="background-color: #FFFFFF; border: 3px solid #1A1A1A; padding: 18px; margin: 20px 0;">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6B6B6B;">NOMOR RESI PENGIRIMAN</div>
      <div style="font-family: monospace; font-size: 22px; font-weight: 800; color: #85586F; margin-top: 4px;">
        ${data.trackingNumber || 'RESI-IN-PROGRESS'}
      </div>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${trackingUrl}" class="btn">Lacak Pengiriman →</a>
    </div>
  `;

  return {
    subject: `[VOID/ROSE] Pesanan Dikirim — #${data.orderNumber} (Resi: ${data.trackingNumber || '-'})`,
    html: baseEmailWrapper(`Pesanan #${data.orderNumber} Dikirim`, content)
  };
}
