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
import type { Cart } from '@/types/cart';

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
  /** Map of cartItemId → true while that item's quantity is being updated */
  updatingItems: Record<string, boolean>;
  /** Map of cartItemId → true while that item is being removed */
  removingItems: Record<string, boolean>;

  /**
   * Adds variantId to cart (default quantity = 1).
   * Opens the Cart Drawer on success.
   * Throws ApiError on failure — callers should catch and surface to the user.
   */
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  /**
   * Replaces the absolute quantity for a cart item.
   * Throws ApiError on failure — callers should catch and surface to the user.
   */
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  /**
   * Removes a single item from the cart.
   * Throws ApiError on failure — callers should catch and surface to the user.
   */
  removeItem: (cartItemId: string) => Promise<void>;
  /**
   * Removes all items from the cart.
   * Throws ApiError on failure — callers should catch and surface to the user.
   */
  clearCart: () => Promise<void>;
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

  // ── Cart fetch ─────────────────────────────────────────────────────────────

  const refreshCart = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('auth_token')) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    setCartError(null);
    try {
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

  // Fetch cart once on mount (if authenticated); re-fetch on auth changes.
  useEffect(() => {
    const handleAuthChange = () => {
      if (localStorage.getItem('auth_token')) {
        void refreshCart();
      } else {
        setCart(null);
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('auth_change', handleAuthChange);

    // Sync with current auth state on mount via the same callback path
    handleAuthChange();

    return () => window.removeEventListener('auth_change', handleAuthChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      setIsAddingToCart(true);
      try {
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
      const res = await cartService.clearCart();
      setCart(res.data);
    } finally {
      setIsClearing(false);
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
