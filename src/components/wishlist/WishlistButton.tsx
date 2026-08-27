'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/contexts/WishlistContext';
import { ApiError } from '@/types/api';
import { cn } from '@/lib/utils';
import { Toast } from '@/components/common/Toast';

interface WishlistButtonProps {
  productId: string;
  productName: string;
  /** Extra classes applied to the button element. */
  className?: string;
  /**
   * Visual variant:
   * - "icon" — bare heart icon (used on ProductCard overlay)
   * - "pill" — icon + label row (used on Product Details)
   */
  variant?: 'icon' | 'pill';
}

/**
 * Reusable wishlist toggle button.
 * Reads and writes global wishlist state via WishlistContext.
 * Redirects unauthenticated users to the login page.
 * Prevents duplicate in-flight requests via the togglingIds Set in context.
 */
export function WishlistButton({
  productId,
  productName,
  className,
  variant = 'icon',
}: WishlistButtonProps) {
  const { isWishlisted, toggleWishlist, togglingIds } = useWishlist();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wishlisted = isWishlisted(productId);
  const isToggling = togglingIds.has(productId);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      // Stop bubbling so clicking the heart inside a <Link> doesn't navigate
      e.preventDefault();
      e.stopPropagation();

      if (isToggling) return;

      // Redirect unauthenticated users to login
      if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      try {
        setErrorMsg(null);
        await toggleWishlist(productId);
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : 'Unable to update your wishlist.';
        setErrorMsg(msg);
      }
    },
    [isToggling, productId, toggleWishlist, router],
  );

  const ariaLabel = wishlisted
    ? `Remove ${productName} from wishlist`
    : `Add ${productName} to wishlist`;

  if (variant === 'pill') {
    return (
      <>
        {errorMsg && (
          <Toast
            message={errorMsg}
            type="error"
            duration={3500}
            onDismiss={() => setErrorMsg(null)}
          />
        )}
        <button
          type="button"
          onClick={handleClick}
          disabled={isToggling}
          aria-label={ariaLabel}
          aria-pressed={wishlisted}
          className={cn(
            'inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-wait select-none',
            wishlisted
              ? 'text-primary'
              : 'text-text-secondary hover:text-primary',
            className,
          )}
        >
          <HeartIcon filled={wishlisted} spinning={isToggling} size={14} />
          <span>{wishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
        </button>
      </>
    );
  }

  // icon variant — compact, for ProductCard overlay
  return (
    <>
      {errorMsg && (
        <Toast
          message={errorMsg}
          type="error"
          duration={3500}
          onDismiss={() => setErrorMsg(null)}
        />
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={isToggling}
        aria-label={ariaLabel}
        aria-pressed={wishlisted}
        className={cn(
          'flex items-center justify-center w-7 h-7 transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-wait select-none group/heart',
          'bg-bg-base/80 backdrop-blur-sm hover:bg-bg-base',
          className,
        )}
      >
        <HeartIcon
          filled={wishlisted}
          spinning={isToggling}
          size={13}
          className={cn(
            'transition-all duration-200',
            wishlisted
              ? 'text-primary'
              : 'text-text-muted group-hover/heart:text-primary',
          )}
        />
      </button>
    </>
  );
}

// ── Heart icon ─────────────────────────────────────────────────────────────────

function HeartIcon({
  filled,
  spinning,
  size = 14,
  className,
}: {
  filled: boolean;
  spinning: boolean;
  size?: number;
  className?: string;
}) {
  if (spinning) {
    return (
      <svg
        className={cn('animate-spin', className)}
        width={size}
        height={size}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }

  if (filled) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}
