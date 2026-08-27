'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { wishlistService } from '@/services/api/wishlist';
import { ApiError } from '@/types/api';
import type { WishlistItem } from '@/types/wishlist';

// ── Context value shape ───────────────────────────────────────────────────────

export interface WishlistContextValue {
  /** Full wishlist items — used on the Wishlist page. */
  wishlistItems: WishlistItem[];
  /** Fast O(1) lookup set for product IDs. */
  wishlistProductIds: Set<string>;
  /** Total wishlisted product count. */
  count: number;
  /** True while the initial wishlist fetch is in-flight. */
  isLoading: boolean;
  /** Non-null when the initial wishlist fetch fails. */
  wishlistError: string | null;
  /** Set of productIds currently being toggled (prevents duplicate requests). */
  togglingIds: Set<string>;

  /** Returns true if the given productId is in the wishlist. */
  isWishlisted: (productId: string) => boolean;
  /**
   * Toggles wishlist state for a product.
   * Returns the new wishlisted state (true = added, false = removed).
   * Throws when the user is not authenticated.
   */
  toggleWishlist: (productId: string) => Promise<boolean>;
  /** Manually re-fetches the wishlist from the backend. */
  refreshWishlist: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const WishlistContext = createContext<WishlistContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // ── Wishlist fetch ──────────────────────────────────────────────────────────

  const refreshWishlist = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('auth_token')) {
      setWishlistItems([]);
      setWishlistProductIds(new Set());
      return;
    }
    setIsLoading(true);
    setWishlistError(null);
    try {
      const res = await wishlistService.getWishlist();
      const items = res.data.items;
      setWishlistItems(items);
      setWishlistProductIds(new Set(items.map((item) => item.productId)));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setWishlistItems([]);
        setWishlistProductIds(new Set());
      } else {
        const msg = err instanceof ApiError ? err.message : 'Failed to load wishlist';
        setWishlistError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch wishlist on mount and whenever auth changes.
  useEffect(() => {
    const handleAuthChange = () => {
      if (localStorage.getItem('auth_token')) {
        void refreshWishlist();
      } else {
        setWishlistItems([]);
        setWishlistProductIds(new Set());
      }
    };

    window.addEventListener('auth_change', handleAuthChange);
    handleAuthChange();

    return () => window.removeEventListener('auth_change', handleAuthChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle ─────────────────────────────────────────────────────────────────

  const toggleWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      // Prevent duplicate in-flight requests for the same product
      if (togglingIds.has(productId)) return wishlistProductIds.has(productId);

      const wasWishlisted = wishlistProductIds.has(productId);
      const newState = !wasWishlisted;

      // Optimistic update
      setTogglingIds((prev) => new Set(prev).add(productId));
      if (newState) {
        setWishlistProductIds((prev) => new Set(prev).add(productId));
      } else {
        setWishlistProductIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));
      }

      try {
        if (newState) {
          await wishlistService.addToWishlist({ productId });
          // Re-fetch to get full product data for the Wishlist page
          void refreshWishlist();
          return true;
        } else {
          await wishlistService.removeFromWishlist(productId);
          return false;
        }
      } catch (err) {
        // Rollback optimistic update on failure
        if (newState) {
          setWishlistProductIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
        } else {
          setWishlistProductIds((prev) => new Set(prev).add(productId));
          // Restore the item in the list (re-fetch for accuracy)
          void refreshWishlist();
        }
        throw err;
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
    },
    [togglingIds, wishlistProductIds, refreshWishlist],
  );

  // ── Helpers ────────────────────────────────────────────────────────────────

  const isWishlisted = useCallback(
    (productId: string) => wishlistProductIds.has(productId),
    [wishlistProductIds],
  );

  // ── Context value ──────────────────────────────────────────────────────────

  const value: WishlistContextValue = {
    wishlistItems,
    wishlistProductIds,
    count: wishlistProductIds.size,
    isLoading,
    wishlistError,
    togglingIds,
    isWishlisted,
    toggleWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

// ── Consumer hook ─────────────────────────────────────────────────────────────

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
}
