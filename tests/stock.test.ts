import { describe, it, expect, beforeEach } from 'vitest';

describe('Stock Reservation and Restoration', () => {
  let inventory: Record<string, number>;

  beforeEach(() => {
    inventory = {
      'var_1_m': 10,
      'var_2_l': 2,
      'var_7_os': 0 // Sold out
    };
  });

  // Simulates atomic update statement:
  // UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?
  function atomicReserve(variantId: string, quantity: number): boolean {
    const current = inventory[variantId] ?? 0;
    if (current >= quantity && quantity > 0) {
      inventory[variantId] = current - quantity;
      return true;
    }
    return false;
  }

  function restoreStock(variantId: string, quantity: number): void {
    inventory[variantId] = (inventory[variantId] ?? 0) + quantity;
  }

  it('successfully reserves available stock atomically', () => {
    const ok = atomicReserve('var_1_m', 3);
    expect(ok).toBe(true);
    expect(inventory['var_1_m']).toBe(7);
  });

  it('fails reservation and prevents overselling when requested stock > available', () => {
    const ok = atomicReserve('var_2_l', 5); // only 2 available
    expect(ok).toBe(false);
    expect(inventory['var_2_l']).toBe(2); // unchanged
  });

  it('fails reservation for sold out product', () => {
    const ok = atomicReserve('var_7_os', 1);
    expect(ok).toBe(false);
    expect(inventory['var_7_os']).toBe(0);
  });

  it('rolls back previously reserved items if one item in cart fails', () => {
    const cart = [
      { variantId: 'var_1_m', quantity: 2 },
      { variantId: 'var_2_l', quantity: 5 } // will fail
    ];

    const reserved: Array<{ variantId: string; quantity: number }> = [];
    let success = true;

    for (const item of cart) {
      const ok = atomicReserve(item.variantId, item.quantity);
      if (!ok) {
        success = false;
        break;
      }
      reserved.push(item);
    }

    if (!success) {
      // Rollback
      for (const res of reserved) {
        restoreStock(res.variantId, res.quantity);
      }
    }

    expect(success).toBe(false);
    expect(inventory['var_1_m']).toBe(10); // completely rolled back
    expect(inventory['var_2_l']).toBe(2); // untouched
  });

  it('restores stock when order fails or is cancelled', () => {
    // 1. Order pending reserves 2 items
    atomicReserve('var_1_m', 2);
    expect(inventory['var_1_m']).toBe(8);

    // 2. Payment fails or expires -> restore stock
    restoreStock('var_1_m', 2);
    expect(inventory['var_1_m']).toBe(10);
  });
});
