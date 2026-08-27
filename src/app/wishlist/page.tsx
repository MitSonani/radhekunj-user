'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice } from '@/lib/product';
import { APP_ROUTES } from '@/constants';

/**
 * /wishlist — Customer's saved-items wishlist page.
 * Requires authentication; redirects to login otherwise.
 * Renders each wishlisted product with the shared WishlistButton so removals
 * update global state (ProductCard hearts update too).
 */
export default function WishlistPage() {
  const router = useRouter();
  const { wishlistItems, isLoading, count } = useWishlist();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const hasToken = !!localStorage.getItem('auth_token');
      setIsAuthenticated(hasToken);
      if (!hasToken) {
        router.push(`/login?redirect=${encodeURIComponent('/wishlist')}`);
      }
    };
    check();
    window.addEventListener('auth_change', check);
    return () => window.removeEventListener('auth_change', check);
  }, [router]);

  // Not yet determined — avoid flash of content
  if (isAuthenticated === null || (isAuthenticated && isLoading)) {
    return <LoadingState message="Loading your wishlist..." className="min-h-[60vh]" />;
  }

  if (!isAuthenticated) return null;

  return (
    <PageContainer className="py-12 md:py-16 flex-grow">
      {/* Page header */}
      <div className="mb-10 border-b border-border-base pb-6">
        <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-text-muted block mb-1">
          Your saved items
        </span>
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif text-3xl font-normal uppercase tracking-widest text-text-base">
            Wishlist
          </h1>
          {count > 0 && (
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-[0.15em]">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      </div>

      {/* Empty state */}
      {count === 0 && !isLoading && (
        <EmptyState
          title="Your Wishlist Is Empty"
          description="Discover something you'll love and save it here."
          actionLabel="Shop Now"
          onActionClick={() => router.push(APP_ROUTES.PRODUCTS)}
          icon={
            <svg
              className="mx-auto h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          }
        />
      )}

      {/* Product grid */}
      {wishlistItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {wishlistItems.map((item) => {
            const { product } = item;
            return (
              <div key={item.id} className="flex flex-col gap-3">
                {/* Image + wishlist button */}
                <Link
                  href={APP_ROUTES.PRODUCT_DETAIL(product.slug)}
                  className="group relative block aspect-[3/4] overflow-hidden bg-border-soft focus-visible:outline-none"
                  aria-label={`View ${product.name}`}
                >
                  {product.primaryImage?.url ? (
                    <Image
                      src={product.primaryImage.url}
                      alt={product.primaryImage.altText || product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-light">
                      <svg
                        className="h-12 w-12 text-border-base"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Unavailable badge */}
                  {!product.isAvailable && (
                    <div className="absolute bottom-0 left-0 right-0 bg-text-base/70 px-3 py-1.5">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Wishlist remove button */}
                  <div className="absolute top-2 right-2 z-10">
                    <WishlistButton
                      productId={product.id}
                      productName={product.name}
                      variant="icon"
                    />
                  </div>
                </Link>

                {/* Product info */}
                <div className="flex flex-col gap-1">
                  <h2 className="text-xs font-medium text-text-base leading-snug tracking-wide line-clamp-2">
                    <Link
                      href={APP_ROUTES.PRODUCT_DETAIL(product.slug)}
                      className="hover:text-primary transition-colors focus-visible:outline-none"
                    >
                      {product.name}
                    </Link>
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-text-secondary">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-[10px] text-text-muted line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick action links */}
                <div className="flex items-center gap-3 mt-0.5">
                  <Link
                    href={APP_ROUTES.PRODUCT_DETAIL(product.slug)}
                    className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-secondary border-b border-text-secondary hover:text-primary hover:border-primary transition-colors pb-0.5 focus-visible:outline-none"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
