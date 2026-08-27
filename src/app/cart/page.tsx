'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/common';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/product';
import { ApiError } from '@/types/api';
import type { CartItem } from '@/types/cart';
import { APP_ROUTES } from '@/constants';

// ── Cart item skeleton ────────────────────────────────────────────────────────

function CartItemSkeleton() {
  return (
    <div className="flex gap-6 py-8 animate-pulse">
      <div className="h-28 w-24 flex-shrink-0 bg-bg-soft" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="h-3 w-40 bg-bg-soft" />
        <div className="h-2.5 w-24 bg-bg-soft" />
        <div className="h-3 w-20 bg-bg-soft" />
        <div className="mt-auto h-7 w-28 bg-bg-soft" />
      </div>
    </div>
  );
}

// ── Quantity control ──────────────────────────────────────────────────────────

interface CartPageQuantityControlProps {
  item: CartItem;
}

function CartPageQuantityControl({ item }: CartPageQuantityControlProps) {
  const { updateQuantity, removeItem, updatingItems, removingItems } = useCart();
  const [itemError, setItemError] = useState<string | null>(null);

  const isUpdating = !!updatingItems[item.id];
  const isRemoving = !!removingItems[item.id];
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-border-base">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={isDisabled || item.quantity <= 1}
            aria-label={`Decrease quantity for ${item.variant.product.name}`}
            className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span
            className="min-w-[3rem] text-center text-[12px] font-medium text-text-base select-none"
            aria-live="polite"
            aria-label={`Quantity: ${item.quantity}`}
          >
            {isUpdating ? (
              <span className="inline-flex items-center justify-center py-0.5">
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
            className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isDisabled}
          aria-label={`Remove ${item.variant.product.name} from bag`}
          className="text-[9px] font-medium uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-danger disabled:opacity-40 disabled:cursor-not-allowed"
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

function CartPageItemRow({ item }: { item: CartItem }) {
  const { removingItems } = useCart();
  const isRemoving = !!removingItems[item.id];
  const { variant } = item;
  const isInactive = !variant.isAvailable;
  const attributeLabel = variant.attributes
    .map((a) => a.attributeValue.value)
    .join(' / ');
  const lineTotal = (parseFloat(variant.price) * item.quantity).toFixed(2);

  return (
    <div className={`flex gap-6 py-8 border-b border-border-soft transition-opacity duration-200 ${isRemoving ? 'opacity-40 pointer-events-none' : ''}`}>
      {/* Image */}
      <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden bg-bg-soft">
        {variant.image ? (
          <Image
            src={variant.image.imageUrl}
            alt={variant.image.altText || variant.product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bg-soft">
            <svg className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-base">
              {variant.product.name}
            </p>
            {attributeLabel && (
              <p className="mt-1 text-[10px] text-text-muted">{attributeLabel}</p>
            )}
            <p className="mt-2 text-sm font-medium text-text-base">
              {formatPrice(variant.price)}
            </p>
          </div>
          {/* Line subtotal */}
          <div className="text-right">
            <p className="text-xs font-medium text-text-base">{formatPrice(lineTotal)}</p>
            {item.quantity > 1 && (
              <p className="mt-0.5 text-[9px] text-text-muted">
                {item.quantity} × {formatPrice(variant.price)}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        {isInactive && (
          <div className="flex items-center gap-2 px-3 py-2 border border-border-base bg-bg-soft w-fit">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger" aria-hidden="true" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-danger">
              Out of Stock — Please Remove
            </span>
          </div>
        )}

        {!isInactive && variant.stockWarning && (
          <p className="text-[9px] text-warning font-medium" role="alert">
            Limited stock — order soon
          </p>
        )}

        <CartPageQuantityControl item={item} />
      </div>
    </div>
  );
}

// ── Cart Page ─────────────────────────────────────────────────────────────────

export default function CartPage() {
  const router = useRouter();
  const { cart, isLoading, cartError, clearCart, isClearing, refreshCart } = useCart();
  const [clearError, setClearError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
      router.replace(`/login?redirect=${encodeURIComponent(APP_ROUTES.CART)}`);
    }
  }, [router]);

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

  const hasUnavailableItems = cart?.items.some((i) => !i.variant.isAvailable) ?? false;
  const isEmpty = !cart || cart.items.length === 0;

  if (isLoading && !cart) {
    return (
      <PageContainer className="py-12 md:py-16">
        <div className="mb-10">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-text-muted">
            Your Bag
          </p>
          <div className="mt-3 h-7 w-36 animate-pulse bg-bg-soft" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-2 divide-y divide-border-soft">
            {[0, 1, 2].map((i) => <CartItemSkeleton key={i} />)}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (cartError) {
    return (
      <PageContainer className="py-12 md:py-16">
        <div className="flex flex-col items-center py-20 text-center">
          <p className="font-serif text-xl text-text-base">Unable to load your bag</p>
          <p className="mt-2 text-[10px] text-danger">{cartError}</p>
          <Button variant="outline" size="md" className="mt-8" onClick={refreshCart}>
            Try Again
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (isEmpty) {
    return (
      <PageContainer className="py-12 md:py-16">
        <div className="flex flex-col items-center py-20 text-center">
          <svg
            className="mb-6 h-12 w-12 text-text-muted stroke-[0.8]"
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
          <h1 className="font-serif text-2xl font-normal uppercase tracking-widest text-text-base">
            Your Bag Is Empty
          </h1>
          <p className="mt-3 text-[11px] text-text-muted max-w-xs">
            Explore our latest collection and find something you love.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="mt-10"
            onClick={() => router.push(APP_ROUTES.PRODUCTS)}
          >
            Shop Now
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-12 md:py-16">
      {/* Page heading */}
      <div className="mb-10">
        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-text-muted">
          Shopping
        </p>
        <h1 className="mt-2 font-serif text-2xl md:text-3xl font-normal uppercase tracking-widest text-text-base">
          Your Bag
          {cart && cart.totalQuantity > 0 && (
            <span className="ml-3 text-base font-sans text-text-muted font-normal normal-case tracking-normal">
              ({cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'})
            </span>
          )}
        </h1>
      </div>

      {/* Unavailable items notice */}
      {hasUnavailableItems && (
        <div className="mb-6 flex items-start gap-3 border border-danger/30 bg-danger/5 px-4 py-3">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-[10px] text-danger">
            Some items in your bag are out of stock or no longer available. Please remove them before checking out.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
        {/* Items list */}
        <div className="lg:col-span-2">
          <div className="border-t border-border-soft">
            {cart.items.map((item) => (
              <CartPageItemRow key={item.id} item={item} />
            ))}
          </div>

          {/* Clear cart */}
          <div className="mt-6 flex items-center gap-4">
            {clearError && (
              <p className="text-[9px] text-danger" role="alert">{clearError}</p>
            )}
            {showClearConfirm ? (
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-text-muted">Clear all items?</span>
                <button
                  type="button"
                  onClick={handleClearCart}
                  disabled={isClearing}
                  className="text-[9px] font-semibold uppercase tracking-[0.16em] text-danger hover:underline disabled:opacity-40"
                >
                  {isClearing ? 'Clearing...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="text-[9px] font-medium uppercase tracking-[0.16em] text-text-muted hover:text-text-base"
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

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 border border-border-soft p-6">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-base mb-5">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[10px] text-text-muted uppercase tracking-[0.1em]">
                  Subtotal ({cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'})
                </span>
                <span className="text-[11px] font-medium text-text-base">
                  {formatPrice(cart.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span className="text-[10px] uppercase tracking-[0.1em]">Shipping</span>
                <span className="text-[10px]">Calculated at checkout</span>
              </div>
            </div>

            <div className="my-5 border-t border-border-soft" />

            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-base">
                Total
              </span>
              <span className="text-xl font-medium text-text-base">
                {formatPrice(cart.subtotal)}
              </span>
            </div>

            {/* Checkout — not yet implemented */}
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center"
              disabled={hasUnavailableItems || isLoading}
              aria-disabled="true"
              title="Checkout will be available soon"
            >
              Continue to Checkout
            </Button>
            <p className="mt-3 text-center text-[9px] text-text-muted">
              Checkout coming soon
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
