'use client';

import React from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { APP_ROUTES } from '@/constants';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface MoreFromCategoryProps {
  categorySlug: string;
  categoryName: string;
  /** ID of the currently displayed product — excluded from the grid. */
  currentProductId: string;
}

/**
 * Fetches up to 4 other products from the same category and renders them
 * in a clean editorial grid below the product detail. Silently disappears
 * when there are no other products to show.
 */
export function MoreFromCategory({
  categorySlug,
  categoryName,
  currentProductId,
}: MoreFromCategoryProps) {
  // Fetch a few more than we need so we can exclude the current product
  const { products, isLoading } = useProducts({
    categorySlug,
    limit: 5,
    sort: 'newest',
  });

  // Remove current product, cap at 4
  const related = products.filter((p) => p.id !== currentProductId).slice(0, 4);

  // Hide the section entirely if there's nothing to show (and we've finished loading)
  if (!isLoading && related.length === 0) return null;

  return (
    <section aria-label={`More from ${categoryName}`} className="border-t border-border-base mt-16 pt-12 pb-16">
      {/* Section header */}
      <div className="flex items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-text-muted block mb-1">
            Continue Browsing
          </span>
          <h2 className="font-serif text-2xl font-normal uppercase tracking-widest text-text-base leading-tight">
            More from {categoryName}
          </h2>
        </div>

        <Link
          href={APP_ROUTES.CATEGORY(categorySlug)}
          className="flex-shrink-0 text-[9px] font-semibold uppercase tracking-[0.2em] text-text-secondary border-b border-text-secondary hover:text-primary hover:border-primary transition-colors pb-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          View All
        </Link>
      </div>

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
          {[0, 1, 2, 3].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
          {related.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index === 0} />
          ))}
        </div>
      )}
    </section>
  );
}
