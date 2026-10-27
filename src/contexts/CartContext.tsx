'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { cartService } from '@/services/api/cart';
import { ApiError } from '@/types/api';
import type {
  Cart,
  CartItem,
  GuestCartItem,
  GuestCartItemMetadata,
  GuestCartStorage,
} from '@/types/cart';

const GUEST_CART_KEY = 'radhekunj_guest_cart_v1';

function getGuestCartStorage(): GuestCartStorage {
  if (typeof window === 'undefined') {
    return { version: 1, items: [], updatedAt: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return { version: 1, items: [], updatedAt: new Date().toISOString() };
    const parsed = JSON.parse(raw) as GuestCartStorage;
    if (parsed && parsed.version === 1 && Array.isArray(parsed.items)) {
      return parsed;
    }
    return { version: 1, items: [], updatedAt: new Date().toISOString() };
  } catch {
    return { version: 1, items: [], updatedAt: new Date().toISOString() };
  }
}

function saveGuestCartStorage(storage: GuestCartStorage): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(storage));
  } catch {
    // Ignore storage quota errors
  }
}

function buildCartFromGuestItems(items: GuestCartItem[]): Cart {
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

// ── Context value shape ───────────────────────────────────────────────────────

export interface CartContextValue {
  cart: Cart | null;
  /** True while the initial cart fetch is in-flight */
  isLoading: boolean;
  /** Non-null when the initial cart fetch fails */
  cartError: string | null;
  /** Whether the slide-in Cart Drawer is visible */
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

  /** True while an add-to-cart request is in-flight */
  isAddingToCart: boolean;
  /** True while the clear-cart request is in-flight */
  isClearing: boolean;
  /** Map of cartItemId -> true while that item is being updated */
  updatingItems: Record<string, boolean>;
  /** Map of cartItemId -> true while that item is being removed */
  removingItems: Record<string, boolean>;

  /**
   * Adds variantId to cart (default quantity = 1).
   * Optional metadata populates the guest cart preview if unauthenticated.
   * Opens the Cart Drawer on success.
   */
  addToCart: (
    variantId: string,
    quantity?: number,
    metadata?: GuestCartItemMetadata,
  ) => Promise<void>;
  /**
   * Replaces the absolute quantity for a cart item.
   */
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  /**
   * Removes a single item from the cart.
   */
  removeItem: (cartItemId: string) => Promise<void>;
  /**
   * Removes all items from the cart.
   */
  clearCart: () => Promise<void>;
  /** True while an apply-coupon request is in-flight */
  isApplyingCoupon: boolean;
  /** True while a remove-coupon request is in-flight */
  isRemovingCoupon: boolean;
  /**
   * Applies a coupon code to the user's cart.
   */
  applyCoupon: (code: string) => Promise<void>;
  /**
   * Removes the applied coupon from the user's cart.
   */
  removeCoupon: () => Promise<void>;
  /** Manually re-fetches the cart from the backend. */
  refreshCart: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});
  const [removingItems, setRemovingItems] = useState<Record<string, boolean>>({});

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  // ── Cart fetch / merge ─────────────────────────────────────────────────────

  const refreshCart = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const authToken = localStorage.getItem('auth_token');

    // Guest Mode: load from local storage
    if (!authToken) {
      const guestStorage = getGuestCartStorage();
      if (guestStorage.items.length > 0) {
        setCart(buildCartFromGuestItems(guestStorage.items));
      } else {
        setCart(null);
      }
      return;
    }

    // Authenticated Mode
    setIsLoading(true);
    setCartError(null);
    try {
      const guestStorage = getGuestCartStorage();
      if (guestStorage.items.length > 0) {
        // Atomic one-time merge: immediately clear guest storage to prevent duplicate merge
        const itemsToMerge = [...guestStorage.items];
        localStorage.removeItem(GUEST_CART_KEY);

        try {
          const mergeRes = await cartService.mergeCart({
            items: itemsToMerge.map((i) => ({
              variantId: i.variantId,
              quantity: i.quantity,
            })),
          });
          setCart(mergeRes.data);
          return;
        } catch {
          // If merge fails, fallback to getCart
          const res = await cartService.getCart();
          setCart(res.data);
          return;
        }
      }

      const res = await cartService.getCart();
      setCart(res.data);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setCart(null);
      } else {
        const msg = err instanceof ApiError ? err.message : 'Failed to load cart';
        setCartError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch cart once on mount (or load guest cart); re-fetch/merge on auth changes.
  useEffect(() => {
    const handleAuthChange = () => {
      void refreshCart();
    };

    window.addEventListener('auth_change', handleAuthChange);

    // Initial sync
    handleAuthChange();

    return () => window.removeEventListener('auth_change', handleAuthChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addToCart = useCallback(
    async (
      variantId: string,
      quantity = 1,
      metadata?: GuestCartItemMetadata,
    ) => {
      setIsAddingToCart(true);
      try {
        const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

        if (!authToken) {
          // Guest Cart operation
          const storage = getGuestCartStorage();
          const existingIndex = storage.items.findIndex((item) => item.variantId === variantId);

          if (existingIndex >= 0) {
            const existing = storage.items[existingIndex]!;
            existing.quantity = Math.min(10, existing.quantity + quantity);
            existing.updatedAt = new Date().toISOString();
          } else {
            const newItem: GuestCartItem = {
              id: `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              variantId,
              quantity: Math.min(10, Math.max(1, quantity)),
              variant: {
                id: variantId,
                sku: metadata?.sku || 'SKU',
                price: metadata?.price || '0.00',
                compareAtPrice: metadata?.compareAtPrice || null,
                status: 'ACTIVE',
                product: {
                  id: 'prod_' + variantId,
                  name: metadata?.productName || 'Product',
                  slug: metadata?.productSlug || '',
                  status: 'ACTIVE',
                },
                attributes: metadata?.attributes || [],
                image: metadata?.image || null,
                isAvailable: true,
                stockWarning: false,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            storage.items.push(newItem);
          }

          storage.updatedAt = new Date().toISOString();
          saveGuestCartStorage(storage);
          setCart(buildCartFromGuestItems(storage.items));
          setIsDrawerOpen(true);
          return;
        }

        // Authenticated operation
        const res = await cartService.addItem({ variantId, quantity });
        setCart(res.data);
        setIsDrawerOpen(true);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [],
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      setUpdatingItems((prev) => ({ ...prev, [cartItemId]: true }));
      try {
        const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

        if (!authToken) {
          const storage = getGuestCartStorage();
          if (quantity <= 0) {
            storage.items = storage.items.filter(
              (i) => i.id !== cartItemId && i.variantId !== cartItemId,
            );
          } else {
            const item = storage.items.find(
              (i) => i.id !== cartItemId && i.variantId === cartItemId,
            ) || storage.items.find((i) => i.id === cartItemId);
            if (item) {
              item.quantity = Math.min(10, quantity);
              item.updatedAt = new Date().toISOString();
            }
          }
          storage.updatedAt = new Date().toISOString();
          saveGuestCartStorage(storage);
          setCart(storage.items.length > 0 ? buildCartFromGuestItems(storage.items) : null);
          return;
        }

        const res = await cartService.updateItem(cartItemId, { quantity });
        setCart(res.data);
      } finally {
        setUpdatingItems((prev) => {
          const next = { ...prev };
          delete next[cartItemId];
          return next;
        });
      }
    },
    [],
  );

  const removeItem = useCallback(async (cartItemId: string) => {
    setRemovingItems((prev) => ({ ...prev, [cartItemId]: true }));
    try {
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      if (!authToken) {
        const storage = getGuestCartStorage();
        storage.items = storage.items.filter(
          (i) => i.id !== cartItemId && i.variantId !== cartItemId,
        );
        storage.updatedAt = new Date().toISOString();
        saveGuestCartStorage(storage);
        setCart(storage.items.length > 0 ? buildCartFromGuestItems(storage.items) : null);
        return;
      }

      const res = await cartService.removeItem(cartItemId);
      setCart(res.data);
    } finally {
      setRemovingItems((prev) => {
        const next = { ...prev };
        delete next[cartItemId];
        return next;
      });
    }
  }, []);

  const clearCart = useCallback(async () => {
    setIsClearing(true);
    try {
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      if (!authToken) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(GUEST_CART_KEY);
        }
        setCart(null);
        return;
      }

      const res = await cartService.clearCart();
      setCart(res.data);
    } finally {
      setIsClearing(false);
    }
  }, []);

  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isRemovingCoupon, setIsRemovingCoupon] = useState(false);

  const applyCoupon = useCallback(async (code: string) => {
    setIsApplyingCoupon(true);
    try {
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!authToken) {
        throw new ApiError(401, 'Please sign in to apply coupons to your order.');
      }
      const res = await cartService.applyCoupon({ code });
      setCart(res.data);
    } finally {
      setIsApplyingCoupon(false);
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    setIsRemovingCoupon(true);
    try {
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!authToken) {
        return;
      }
      const res = await cartService.removeCoupon();
      setCart(res.data);
    } finally {
      setIsRemovingCoupon(false);
    }
  }, []);

  // ── Context value ──────────────────────────────────────────────────────────

  const value: CartContextValue = {
    cart,
    isLoading,
    cartError,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    isAddingToCart,
    isClearing,
    updatingItems,
    removingItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    isApplyingCoupon,
    isRemovingCoupon,
    applyCoupon,
    removeCoupon,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Consumer hook ─────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
