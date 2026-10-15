import { describe, it, expect } from 'vitest';
import { sha512Hex, constantTimeCompare } from '../apps/api/src/services/payment/midtrans-provider';

describe('Midtrans Web Crypto SHA512 Signature & Verification', () => {
  const SERVER_KEY = 'SB-Mid-server-test-secret-key-12345';

  it('generates reproducible SHA512 hash using Web Crypto', async () => {
    const raw = 'test-string-for-hash';
    const hash = await sha512Hex(raw);
    expect(hash).toHaveLength(128); // 64 bytes = 128 hex chars
    expect(typeof hash).toBe('string');
  });

  it('verifies valid Midtrans signature correctly', async () => {
    const payload = {
      order_id: 'VR-123456-789',
      status_code: '200',
      gross_amount: '375000.00'
    };

    // Correct formula: SHA512(order_id + status_code + gross_amount + SERVER_KEY)
    const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${SERVER_KEY}`;
    const validSignature = await sha512Hex(raw);

    // Verify
    const checkRaw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${SERVER_KEY}`;
    const calculated = await sha512Hex(checkRaw);
    const isValid = constantTimeCompare(validSignature.toLowerCase(), calculated.toLowerCase());

    expect(isValid).toBe(true);
  });

  it('rejects tampered gross_amount in signature', async () => {
    const payload = {
      order_id: 'VR-123456-789',
      status_code: '200',
      gross_amount: '375000.00'
    };

    const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${SERVER_KEY}`;
    const validSignature = await sha512Hex(raw);

    // Attacker modifies gross_amount to 1.00
    const tamperedPayload = {
      ...payload,
      gross_amount: '1.00'
    };

    const tamperedRaw = `${tamperedPayload.order_id}${tamperedPayload.status_code}${tamperedPayload.gross_amount}${SERVER_KEY}`;
    const tamperedCalculated = await sha512Hex(tamperedRaw);
    const isValid = constantTimeCompare(validSignature.toLowerCase(), tamperedCalculated.toLowerCase());

    expect(isValid).toBe(false);
  });

  it('rejects tampered order_id in signature', async () => {
    const payload = {
      order_id: 'VR-123456-789',
      status_code: '200',
      gross_amount: '375000.00'
    };

    const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${SERVER_KEY}`;
    const validSignature = await sha512Hex(raw);

    const wrongRaw = `VR-999999-000${payload.status_code}${payload.gross_amount}${SERVER_KEY}`;
    const wrongCalculated = await sha512Hex(wrongRaw);
    const isValid = constantTimeCompare(validSignature.toLowerCase(), wrongCalculated.toLowerCase());

    expect(isValid).toBe(false);
  });

  it('constantTimeCompare safely handles length mismatches and equal strings', () => {
    expect(constantTimeCompare('abc', 'abc')).toBe(true);
    expect(constantTimeCompare('abc', 'abd')).toBe(false);
    expect(constantTimeCompare('abc', 'abcd')).toBe(false);
    expect(constantTimeCompare('', '')).toBe(true);
  });
});
