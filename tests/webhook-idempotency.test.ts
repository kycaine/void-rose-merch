import { describe, it, expect, beforeEach } from 'vitest';

describe('Webhook Notification Idempotency', () => {
  let webhookEventsDb: Set<string>;
  let emailSentCount: number;
  let stockRestoredCount: number;

  beforeEach(() => {
    webhookEventsDb = new Set();
    emailSentCount = 0;
    stockRestoredCount = 0;
  });

  async function processWebhookNotification(event: {
    order_id: string;
    transaction_status: string;
    status_code: string;
  }) {
    const eventId = `${event.order_id}_${event.transaction_status}_${event.status_code}`;

    // 1. Idempotency Check
    if (webhookEventsDb.has(eventId)) {
      return { status: 'ok', message: 'Event already processed (idempotent)' };
    }

    // 2. Mark event as processed
    webhookEventsDb.add(eventId);

    // 3. Execute business logic
    if (event.transaction_status === 'settlement') {
      emailSentCount++;
    } else if (event.transaction_status === 'expire') {
      stockRestoredCount++;
      emailSentCount++;
    }

    return { status: 'ok', processed: true };
  }

  it('processes new webhook notification once', async () => {
    const payload = {
      order_id: 'VR-100200-300',
      transaction_status: 'settlement',
      status_code: '200'
    };

    const res1 = await processWebhookNotification(payload);
    expect(res1.processed).toBe(true);
    expect(emailSentCount).toBe(1);
  });

  it('ignores duplicate webhook notifications and does not resend emails', async () => {
    const payload = {
      order_id: 'VR-100200-300',
      transaction_status: 'settlement',
      status_code: '200'
    };

    // First delivery
    await processWebhookNotification(payload);
    expect(emailSentCount).toBe(1);

    // Midtrans retry / duplicate webhook delivery
    const res2 = await processWebhookNotification(payload);
    expect(res2.message).toContain('idempotent');
    expect(emailSentCount).toBe(1); // Still 1, NOT 2
  });

  it('does not restore stock twice upon duplicate expire notifications', async () => {
    const payload = {
      order_id: 'VR-100200-400',
      transaction_status: 'expire',
      status_code: '202'
    };

    await processWebhookNotification(payload);
    expect(stockRestoredCount).toBe(1);

    // Duplicate webhook
    await processWebhookNotification(payload);
    expect(stockRestoredCount).toBe(1); // Still 1, NOT 2
  });
});
