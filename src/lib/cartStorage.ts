import type {
  Cart,
  CartItem,
  GuestCartItem,
  GuestCartStorage,
} from '../types/cart';

export const CURRENT_GUEST_CART_KEY = 'cotton_clique_guest_cart_v1';
export const LEGACY_GUEST_CART_KEY = 'radhekunj_guest_cart_v1';

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

/**
 * Idempotently merges two arrays of guest cart items by variantId,
 * summing quantities up to the cart limit of 10.
 */
export function mergeGuestCartItems(
  primary: GuestCartItem[],
  secondary: GuestCartItem[],
): GuestCartItem[] {
  const mergedMap = new Map<string, GuestCartItem>();

  for (const item of primary) {
    mergedMap.set(item.variantId, { ...item });
  }

  for (const item of secondary) {
    if (mergedMap.has(item.variantId)) {
      const existing = mergedMap.get(item.variantId)!;
      existing.quantity = Math.min(10, existing.quantity + item.quantity);
      existing.updatedAt = new Date().toISOString();
    } else {
      mergedMap.set(item.variantId, { ...item });
    }
  }

  return Array.from(mergedMap.values());
}

/**
 * Reads guest cart from localStorage, transparently and idempotently migrating
 * legacy 'radhekunj_guest_cart_v1' data to 'cotton_clique_guest_cart_v1'.
 * The legacy key is only removed after the new key is successfully written and verified.
 */
export function migrateAndGetGuestCartStorage(storage?: StorageLike): GuestCartStorage {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  const emptyCart: GuestCartStorage = {
    version: 1,
    items: [],
    updatedAt: new Date().toISOString(),
  };

  if (!store) return emptyCart;

  try {
    const currentRaw = store.getItem(CURRENT_GUEST_CART_KEY);
    const legacyRaw = store.getItem(LEGACY_GUEST_CART_KEY);

    let currentParsed: GuestCartStorage | null = null;
    let legacyParsed: GuestCartStorage | null = null;

    if (currentRaw) {
      try {
        const parsed = JSON.parse(currentRaw) as GuestCartStorage;
        if (parsed && parsed.version === 1 && Array.isArray(parsed.items)) {
          currentParsed = parsed;
        }
      } catch {
        // Current key data corrupted
      }
    }

    if (legacyRaw) {
      try {
        const parsed = JSON.parse(legacyRaw) as GuestCartStorage;
        if (parsed && parsed.version === 1 && Array.isArray(parsed.items)) {
          legacyParsed = parsed;
        }
      } catch {
        // Legacy key data is unparseable; clean it up safely
        try {
          store.removeItem(LEGACY_GUEST_CART_KEY);
        } catch {
          // ignore
        }
      }
    }

    // Case 1: Legacy key exists, current key does not exist -> Migrate
    if (legacyParsed && !currentParsed) {
      const migrated: GuestCartStorage = {
        version: 1,
        items: legacyParsed.items,
        updatedAt: legacyParsed.updatedAt || new Date().toISOString(),
      };
      store.setItem(CURRENT_GUEST_CART_KEY, JSON.stringify(migrated));
      // Only delete legacy key after verifying current key was saved
      if (store.getItem(CURRENT_GUEST_CART_KEY)) {
        store.removeItem(LEGACY_GUEST_CART_KEY);
      }
      return migrated;
    }

    // Case 2: Both keys exist -> Merge idempotently, save to current, remove legacy
    if (legacyParsed && currentParsed) {
      const mergedItems = mergeGuestCartItems(currentParsed.items, legacyParsed.items);
      const mergedStorage: GuestCartStorage = {
        version: 1,
        items: mergedItems,
        updatedAt: new Date().toISOString(),
      };
      store.setItem(CURRENT_GUEST_CART_KEY, JSON.stringify(mergedStorage));
      if (store.getItem(CURRENT_GUEST_CART_KEY)) {
        store.removeItem(LEGACY_GUEST_CART_KEY);
      }
      return mergedStorage;
    }

    // Case 3: Current key exists (already migrated or initialized)
    if (currentParsed) {
      // Clean up legacy key if left behind
      if (legacyRaw) {
        try {
          store.removeItem(LEGACY_GUEST_CART_KEY);
        } catch {
          // ignore
        }
      }
      return currentParsed;
    }

    // Case 4: Neither key exists (empty cart)
    return emptyCart;
  } catch {
    return emptyCart;
  }
}

export function saveGuestCartStorage(storage: GuestCartStorage, customStorage?: StorageLike): void {
  const store = customStorage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return;
  try {
    store.setItem(CURRENT_GUEST_CART_KEY, JSON.stringify(storage));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearGuestCartStorage(customStorage?: StorageLike): void {
  const store = customStorage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return;
  try {
    store.removeItem(CURRENT_GUEST_CART_KEY);
    store.removeItem(LEGACY_GUEST_CART_KEY);
  } catch {
    // Ignore errors
  }
}

export function buildCartFromGuestItems(items: GuestCartItem[]): Cart {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalNum = items.reduce(
    (sum, item) => sum + (parseFloat(item.variant?.price || '0') * item.quantity),
    0,
  );
  const subtotal = subtotalNum.toFixed(2);

  return {
    id: 'guest-cart',
    items: items as unknown as CartItem[],
    itemsCount: items.length,
    totalQuantity,
    subtotal,
    discountAmount: '0.00',
    finalSubtotal: subtotal,
    coupon: null,
  };
}
