const API_URL = 'http://localhost:8787';

async function main() {
  console.log('🚀 Starting E2E Flow Test on Local API...');

  // 1. Get initial product and variant stock
  const prodRes = await fetch(`${API_URL}/api/products/void-rose-tee`);
  const prodData = await prodRes.json();
  const initialVariant = prodData.data.variants.find((v) => v.id === 'var_1_m');
  const initialStock = initialVariant.stock;
  console.log(`[1] Initial Stock of Void Rose Tee (Size M): ${initialStock}`);

  // 2. Checkout Order 1 (Success Flow)
  console.log('\n[2] Placing Order 1 (2 pcs)...');
  const checkoutRes = await fetch(`${API_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Rama Danendra',
      customerEmail: 'rama@example.com',
      customerPhone: '081298765432',
      shippingProvince: 'DKI Jakarta',
      shippingCity: 'Jakarta Selatan',
      shippingDistrict: 'Kebayoran Baru',
      shippingPostalCode: '12180',
      shippingAddress: 'Jl. Senopati No. 42',
      notes: 'Tolong packing aman',
      items: [{ variantId: 'var_1_m', quantity: 2 }]
    })
  });

  const order1 = await checkoutRes.json();
  console.log('Order 1 Created:', order1.data.orderNumber, 'Total:', order1.data.total);

  // Check stock reservation
  const prodResAfter1 = await fetch(`${API_URL}/api/products/void-rose-tee`);
  const prodDataAfter1 = await prodResAfter1.json();
  const stockAfter1 = prodDataAfter1.data.variants.find((v) => v.id === 'var_1_m').stock;
  console.log(`Stock after Order 1 reserved: ${stockAfter1} (Expected: ${initialStock - 2})`);
  if (stockAfter1 !== initialStock - 2) throw new Error('Stock reservation failed!');

  // 3. Dev Pay Success for Order 1
  console.log('\n[3] Triggering Dev Pay Success for Order 1...');
  const pay1Res = await fetch(`${API_URL}/api/payments/simulated`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderNumber: order1.data.orderNumber,
      action: 'success'
    })
  });
  const pay1Data = await pay1Res.json();
  console.log('Pay 1 Result:', pay1Data);

  // Verify status is now 'paid'
  const check1Res = await fetch(`${API_URL}/api/orders/${order1.data.orderNumber}?token=${order1.data.accessToken}`);
  const check1Data = await check1Res.json();
  console.log(`Order 1 Status: ${check1Data.data.status} (Expected: paid)`);
  if (check1Data.data.status !== 'paid') throw new Error('Order 1 not marked paid!');

  // 4. Checkout Order 2 (Fail Flow)
  console.log('\n[4] Placing Order 2 (1 pc)...');
  const checkout2Res = await fetch(`${API_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Budi Santoso',
      customerEmail: 'budi@example.com',
      customerPhone: '081234567890',
      shippingProvince: 'Jawa Barat',
      shippingCity: 'Bandung',
      shippingDistrict: 'Coblong',
      shippingPostalCode: '40132',
      shippingAddress: 'Jl. Dago No. 10',
      items: [{ variantId: 'var_1_m', quantity: 1 }]
    })
  });

  const order2 = await checkout2Res.json();
  console.log('Order 2 Created:', order2.data.orderNumber);

  // Stock should now be stockAfter1 - 1
  const prodResAfter2 = await fetch(`${API_URL}/api/products/void-rose-tee`);
  const prodDataAfter2 = await prodResAfter2.json();
  const stockAfter2 = prodDataAfter2.data.variants.find((v) => v.id === 'var_1_m').stock;
  console.log(`Stock after Order 2 reserved: ${stockAfter2} (Expected: ${stockAfter1 - 1})`);

  // 5. Dev Pay Fail for Order 2
  console.log('\n[5] Triggering Dev Pay Fail for Order 2...');
  const pay2Res = await fetch(`${API_URL}/api/payments/simulated`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderNumber: order2.data.orderNumber,
      action: 'fail'
    })
  });
  const pay2Data = await pay2Res.json();
  console.log('Pay 2 Result:', pay2Data);

  // Verify status is 'failed' and stock was restored
  const check2Res = await fetch(`${API_URL}/api/orders/${order2.data.orderNumber}?token=${order2.data.accessToken}`);
  const check2Data = await check2Res.json();
  console.log(`Order 2 Status: ${check2Data.data.status} (Expected: failed)`);
  if (check2Data.data.status !== 'failed') throw new Error('Order 2 not marked failed!');

  const prodResRestored = await fetch(`${API_URL}/api/products/void-rose-tee`);
  const prodDataRestored = await prodResRestored.json();
  const stockRestored = prodDataRestored.data.variants.find((v) => v.id === 'var_1_m').stock;
  console.log(`Stock after Order 2 Fail: ${stockRestored} (Expected restored back to: ${stockAfter1})`);
  if (stockRestored !== stockAfter1) throw new Error('Stock restoration failed!');

  // 6. Test Order Lookup endpoint
  console.log('\n[6] Testing Guest Order Lookup (/api/orders/lookup)...');
  const lookupRes = await fetch(`${API_URL}/api/orders/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderNumber: order1.data.orderNumber,
      email: 'rama@example.com'
    })
  });
  const lookupData = await lookupRes.json();
  console.log(`Lookup succeeded: #${lookupData.data.orderNumber}, Status: ${lookupData.data.status}`);

  // 7. Test Admin Shipping & Tracking Number update
  console.log('\n[7] Testing Admin Update Shipping Resi...');
  const shipRes = await fetch(`${API_URL}/api/admin/orders/${order1.data.orderNumber}/ship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': 'void-rose-super-secret-admin-key-2026'
    },
    body: JSON.stringify({
      trackingNumber: 'JNE8829104819'
    })
  });
  const shipData = await shipRes.json();
  console.log(`Admin Ship updated: #${shipData.data.orderNumber}, Status: ${shipData.data.status}, Resi: ${shipData.data.trackingNumber}`);

  console.log('\n🎉 ALL E2E WORKFLOW CHECKS PASSED PERFECTLY!');
}

main().catch((err) => {
  console.error('❌ E2E Test failed:', err);
  process.exit(1);
});
