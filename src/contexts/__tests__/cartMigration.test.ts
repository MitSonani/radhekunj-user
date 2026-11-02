import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CURRENT_GUEST_CART_KEY,
  LEGACY_GUEST_CART_KEY,
  migrateAndGetGuestCartStorage,
  saveGuestCartStorage,
  clearGuestCartStorage,
  mergeGuestCartItems,
  type StorageLike,
} from '../../lib/cartStorage.ts';
import type { GuestCartItem, GuestCartStorage } from '../../types/cart.ts';

/**
 * In-memory MockStorage implementing StorageLike interface
 */
class MockStorage implements StorageLike {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

function createDummyItem(variantId: string, quantity = 1, price = '1299.00'): GuestCartItem {
  return {
    id: `item_${variantId}`,
    variantId,
    quantity,
    variant: {
      id: variantId,
      sku: `SKU-${variantId}`,
      price,
      compareAtPrice: null,
      status: 'ACTIVE',
      product: {
        id: `prod_${variantId}`,
        name: `Product ${variantId}`,
        slug: `product-${variantId}`,
        status: 'ACTIVE',
      },
      attributes: [],
      image: null,
      isAvailable: true,
      stockWarning: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

test('CartContext Migration: Empty cart when no keys exist', () => {
  const storage = new MockStorage();
  const cart = migrateAndGetGuestCartStorage(storage);

  assert.equal(cart.version, 1);
  assert.equal(cart.items.length, 0);
  assert.equal(storage.getItem(CURRENT_GUEST_CART_KEY), null);
  assert.equal(storage.getItem(LEGACY_GUEST_CART_KEY), null);
});

test('CartContext Migration: Safely migrates legacy radhekunj_guest_cart_v1 to cotton_clique_guest_cart_v1', () => {
  const storage = new MockStorage();
  const legacyData: GuestCartStorage = {
    version: 1,
    items: [createDummyItem('var_1', 2), createDummyItem('var_2', 1)],
    updatedAt: '2026-10-25T10:00:00.000Z',
  };

  storage.setItem(LEGACY_GUEST_CART_KEY, JSON.stringify(legacyData));

  // Run migration
  const migrated = migrateAndGetGuestCartStorage(storage);

  // Assert return value
  assert.equal(migrated.version, 1);
  assert.equal(migrated.items.length, 2);
  assert.equal(migrated.items[0]?.variantId, 'var_1');
  assert.equal(migrated.items[0]?.quantity, 2);
  assert.equal(migrated.items[1]?.variantId, 'var_2');
  assert.equal(migrated.items[1]?.quantity, 1);

  // Assert cotton_clique_guest_cart_v1 is now populated
  const savedCurrent = storage.getItem(CURRENT_GUEST_CART_KEY);
  assert.ok(savedCurrent !== null, 'cotton_clique_guest_cart_v1 must be set');
  const parsedCurrent = JSON.parse(savedCurrent) as GuestCartStorage;
  assert.equal(parsedCurrent.items.length, 2);
  assert.equal(parsedCurrent.items[0]?.variantId, 'var_1');

  // Assert legacy key is safely deleted AFTER successful migration
  assert.equal(storage.getItem(LEGACY_GUEST_CART_KEY), null, 'Legacy key must be removed');
});

test('CartContext Migration: Reads from already-migrated cart without re-migrating', () => {
  const storage = new MockStorage();
  const currentData: GuestCartStorage = {
    version: 1,
    items: [createDummyItem('var_3', 3)],
    updatedAt: '2026-10-26T12:00:00.000Z',
  };

  storage.setItem(CURRENT_GUEST_CART_KEY, JSON.stringify(currentData));

  const cart = migrateAndGetGuestCartStorage(storage);

  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0]?.variantId, 'var_3');
  assert.equal(cart.items[0]?.quantity, 3);
  assert.equal(storage.getItem(LEGACY_GUEST_CART_KEY), null);
});

test('CartContext Migration: Idempotently merges both keys if both exist', () => {
  const storage = new MockStorage();
  const currentData: GuestCartStorage = {
    version: 1,
    items: [createDummyItem('var_shared', 2), createDummyItem('var_current_only', 1)],
    updatedAt: '2026-10-26T12:00:00.000Z',
  };
  const legacyData: GuestCartStorage = {
    version: 1,
    items: [createDummyItem('var_shared', 3), createDummyItem('var_legacy_only', 4)],
    updatedAt: '2026-10-25T10:00:00.000Z',
  };

  storage.setItem(CURRENT_GUEST_CART_KEY, JSON.stringify(currentData));
  storage.setItem(LEGACY_GUEST_CART_KEY, JSON.stringify(legacyData));

  const merged = migrateAndGetGuestCartStorage(storage);

  assert.equal(merged.items.length, 3);
  const sharedItem = merged.items.find((i) => i.variantId === 'var_shared');
  assert.ok(sharedItem);
  assert.equal(sharedItem.quantity, 5, 'Quantities should be summed');

  const currentOnly = merged.items.find((i) => i.variantId === 'var_current_only');
  assert.ok(currentOnly);
  assert.equal(currentOnly.quantity, 1);

  const legacyOnly = merged.items.find((i) => i.variantId === 'var_legacy_only');
  assert.ok(legacyOnly);
  assert.equal(legacyOnly.quantity, 4);

  // Assert legacy key removed
  assert.equal(storage.getItem(LEGACY_GUEST_CART_KEY), null);
});

test('CartContext Migration: Gracefully handles corrupted legacy JSON', () => {
  const storage = new MockStorage();
  storage.setItem(LEGACY_GUEST_CART_KEY, '{invalid-json');

  const cart = migrateAndGetGuestCartStorage(storage);
  assert.equal(cart.version, 1);
  assert.equal(cart.items.length, 0);
  // Corrupt legacy key is purged
  assert.equal(storage.getItem(LEGACY_GUEST_CART_KEY), null);
});

test('CartContext Migration: saveGuestCartStorage and clearGuestCartStorage work with new key', () => {
  const storage = new MockStorage();
  const toSave: GuestCartStorage = {
    version: 1,
    items: [createDummyItem('var_test', 1)],
    updatedAt: new Date().toISOString(),
  };

  saveGuestCartStorage(toSave, storage);
  assert.ok(storage.getItem(CURRENT_GUEST_CART_KEY) !== null);

  clearGuestCartStorage(storage);
  assert.equal(storage.getItem(CURRENT_GUEST_CART_KEY), null);
  assert.equal(storage.getItem(LEGACY_GUEST_CART_KEY), null);
});

test('CartContext Migration: mergeGuestCartItems caps quantity at 10', () => {
  const itemA = createDummyItem('v1', 7);
  const itemB = createDummyItem('v1', 8);
  const result = mergeGuestCartItems([itemA], [itemB]);

  assert.equal(result.length, 1);
  assert.equal(result[0]?.quantity, 10, 'Total should be capped at 10');
});

