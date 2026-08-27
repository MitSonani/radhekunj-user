'use client';

import React, { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/common/Button';
import { formatPrice } from '@/lib/product';
import { ApiError } from '@/types/api';
import type { CartItem } from '@/types/cart';
import { APP_ROUTES } from '@/constants';

// ── Quantity control ──────────────────────────────────────────────────────────

interface QuantityControlProps {
  item: CartItem;
  isUpdating: boolean;
  isRemoving: boolean;
}

function QuantityControl({ item, isUpdating, isRemoving }: QuantityControlProps) {
  const { updateQuantity, removeItem } = useCart();
  const [itemError, setItemError] = useState<string | null>(null);

  const isInactive = !item.variant.isAvailable;
  const isDisabled = isUpdating || isRemoving;

  const handleDecrease = async () => {
    if (item.quantity <= 1 || isDisabled) return;
    setItemError(null);
    try {
      await updateQuantity(item.id, item.quantity - 1);
    } catch (err) {
      setItemError(err instanceof ApiError ? err.message : 'Update failed. Please try again.');
    }
  };

  const handleIncrease = async () => {
    if (isDisabled || isInactive) return;
    setItemError(null);
    try {
      await updateQuantity(item.id, item.quantity + 1);
    } catch (err) {
      setItemError(err instanceof ApiError ? err.message : 'Update failed. Please try again.');
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;
    setItemError(null);
    try {
      await removeItem(item.id);
    } catch (err) {
      setItemError(err instanceof ApiError ? err.message : 'Remove failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        {/* Quantity stepper */}
        <div className="flex items-center border border-border-base">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={isDisabled || item.quantity <= 1}
            aria-label={`Decrease quantity for ${item.variant.product.name}`}
            className="flex h-7 w-7 items-center justify-center text-text-secondary transition-colors hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <span
            className="min-w-[2rem] text-center text-[11px] font-medium text-text-base select-none"
            aria-live="polite"
            aria-label={`Quantity: ${item.quantity}`}
          >
            {isUpdating ? (
              <span className="inline-flex items-center justify-center">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border border-t-primary border-border-base" aria-hidden="true" />
              </span>
            ) : (
              item.quantity
            )}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={isDisabled || isInactive}
            aria-label={`Increase quantity for ${item.variant.product.name}`}
            className="flex h-7 w-7 items-center justify-center text-text-secondary transition-colors hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isDisabled}
          aria-label={`Remove ${item.variant.product.name} from bag`}
          className="text-[9px] font-medium uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-danger disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRemoving ? 'Removing...' : 'Remove'}
        </button>
      </div>

      {itemError && (
        <p className="text-[9px] text-danger" role="alert">{itemError}</p>
      )}
    </div>
  );
}

// ── Cart item row ─────────────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const { updatingItems, removingItems } = useCart();
  const isUpdating = !!updatingItems[item.id];
  const isRemoving = !!removingItems[item.id];

  const { variant } = item;
  const isInactive = !variant.isAvailable;

  const attributeLabel = variant.attributes
    .map((a) => a.attributeValue.value)
    .join(' / ');

  const lineTotal = (parseFloat(variant.price) * item.quantity).toFixed(2);

  return (
    <div className={`flex gap-4 py-5 transition-opacity duration-200 ${isRemoving ? 'opacity-40 pointer-events-none' : ''}`}>
      {/* Product image */}
      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-bg-soft">
        {variant.image ? (
          <Image
            src={variant.image.imageUrl}
            alt={variant.image.altText || variant.product.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bg-soft">
            <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.1em] text-text-base">
              {variant.product.name}
            </p>
            {attributeLabel && (
              <p className="mt-0.5 text-[10px] text-text-muted">{attributeLabel}</p>
            )}
            <p className="mt-1 text-[11px] font-medium text-text-base">
              {formatPrice(variant.price)}
            </p>
          </div>
          <p className="flex-shrink-0 text-[11px] font-medium text-text-base">
            {formatPrice(lineTotal)}
          </p>
        </div>

        {/* Availability */}
        {isInactive && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger" aria-hidden="true" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-danger">
              Out of Stock
            </span>
          </div>
        )}

        {/* Stock warning */}
        {!isInactive && variant.stockWarning && (
          <p className="mt-1.5 text-[9px] text-warning" role="alert">
            Limited stock available
          </p>
        )}

        <div className="mt-2">
          <QuantityControl item={item} isUpdating={isUpdating} isRemoving={isRemoving} />
        </div>
      </div>
    </div>
  );
}

// ── Cart Drawer ───────────────────────────────────────────────────────────────

export function CartDrawer() {
  const {
    cart,
    isLoading,
    cartError,
    isDrawerOpen,
    closeDrawer,
    clearCart,
    isClearing,
  } = useCart();
  const router = useRouter();
  const [clearError, setClearError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    },
    [isDrawerOpen, closeDrawer],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleViewBag = () => {
    closeDrawer();
    router.push(APP_ROUTES.CART);
  };

  const handleShopNow = () => {
    closeDrawer();
    router.push(APP_ROUTES.PRODUCTS);
  };

  const handleClearCart = async () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      return;
    }
    setClearError(null);
    setShowClearConfirm(false);
    try {
      await clearCart();
    } catch (err) {
      setClearError(err instanceof ApiError ? err.message : 'Failed to clear cart. Please try again.');
    }
  };

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity animate-fade-in"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your Bag"
        className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-bg-base shadow-2xl transition-transform duration-300 ease-in-out sm:w-[400px] ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-soft px-6 py-5">
          <div className="flex items-center gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-text-base">
              Your Bag
            </h2>
            {cart && cart.totalQuantity > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center bg-primary px-1.5 text-[9px] font-bold text-white">
                {cart.totalQuantity}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close bag"
            className="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:text-text-base focus-visible:outline-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6">
          {isLoading && !cart ? (
            <div className="flex items-center justify-center py-16">
              <div className="relative h-6 w-6">
                <div className="absolute inset-0 rounded-full border-[1.5px] border-primary/10" />
                <div className="absolute inset-0 animate-spin rounded-full border-[1.5px] border-t-primary" />
              </div>
            </div>
          ) : cartError ? (
            <div className="py-10 text-center">
              <p className="text-[10px] text-danger">{cartError}</p>
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                className="mb-5 h-10 w-10 text-text-muted stroke-[1]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              <p className="font-serif text-lg uppercase tracking-widest text-text-base">
                Your bag is empty
              </p>
              <p className="mt-2 text-[10px] text-text-muted">
                Explore our latest collection
              </p>
              <Button
                variant="primary"
                size="md"
                className="mt-8"
                onClick={handleShopNow}
              >
                Shop Now
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border-soft">
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && !isLoading && !cartError && cart && (
          <div className="border-t border-border-soft px-6 py-5">
            {/* Subtotal */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                Subtotal
              </span>
              <span className="text-base font-medium text-text-base">
                {formatPrice(cart.subtotal)}
              </span>
            </div>

            {clearError && (
              <p className="mb-3 text-[9px] text-danger" role="alert">{clearError}</p>
            )}

            <div className="flex flex-col gap-2.5">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                onClick={handleViewBag}
              >
                View Bag
              </Button>

              {/* Clear cart with confirmation */}
              {showClearConfirm ? (
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-[9px] text-text-muted">Clear all items?</span>
                  <button
                    type="button"
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="text-[9px] font-semibold uppercase tracking-[0.16em] text-danger transition-colors hover:underline disabled:opacity-40"
                  >
                    {isClearing ? 'Clearing...' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="text-[9px] font-medium uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-text-base"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-[9px] font-medium uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-danger"
                >
                  Clear Bag
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
