'use client';

import React, { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { EmptyState, ErrorState } from '@/components/common';
import { useProducts } from '@/hooks/useProducts';
import { ProductSortOption } from '@/types/api';
import { ProductGrid } from './ProductGrid';
import { ProductFilters } from './ProductFilters';
import { ProductPagination } from './ProductPagination';

interface ProductsListingProps {
  /** Fixed category slug (from /categories/[slug] page). Omit on /products. */
  categorySlug?: string;
  /** Category display name for the heading. Falls back to formatted slug. */
  categoryName?: string;
}

/**
 * Reusable client component for the product listing experience.
 * Manages URL-based filter/sort/pagination state via useSearchParams.
 * Used by both /products and /categories/[slug] pages.
 */
export function ProductsListing({ categorySlug, categoryName }: ProductsListingProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const search = searchParams.get('search') || '';
  const sort = (searchParams.get('sort') || 'newest') as ProductSortOption;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      let resetPage = false;
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
        if (key !== 'page') resetPage = true;
      }
      if (resetPage) params.delete('page');
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const { products, pagination, isLoading, error, refetch } = useProducts({
    page,
    search: search || undefined,
    categorySlug,
    sort,
  });

  const heading = categoryName || (categorySlug ? formatSlug(categorySlug) : 'All Products');

  return (
    <div className="flex flex-col flex-grow bg-bg-base py-12 md:py-16">
      <PageContainer>
        {/* Page heading */}
        <div className="mb-10 border-b border-border-base pb-6">
          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-text-muted">
            {categorySlug ? 'Category' : 'Collection'}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-normal uppercase tracking-widest text-text-base mt-2 leading-tight">
            {heading}
          </h1>
        </div>

        {/* Filters */}
        <ProductFilters
          search={search}
          onSearchChange={(val) => updateParams({ search: val || null })}
          sort={sort}
          onSortChange={(val) => updateParams({ sort: val })}
          totalCount={pagination?.total}
          className="mb-8"
        />

        {/* Error state */}
        {error && !isLoading && (
          <ErrorState
            title="Could not load products"
            message="Please check your connection and try again."
            onRetry={refetch}
          />
        )}

        {/* Product grid */}
        {!error && (
          <>
            <ProductGrid
              products={products}
              isLoading={isLoading}
              skeletonCount={8}
            />

            {/* Empty state */}
            {!isLoading && products.length === 0 && (
              <EmptyState
                title="No products found"
                description={
                  search
                    ? `No results for "${search}". Try a different search term.`
                    : 'No products are available in this collection right now.'
                }
                icon={
                  <svg
                    className="mx-auto h-10 w-10 stroke-[1.2]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                }
                actionLabel={search ? 'Clear Search' : undefined}
                onActionClick={search ? () => updateParams({ search: null }) : undefined}
              />
            )}

            {/* Pagination */}
            {!isLoading && pagination && pagination.totalPages > 1 && (
              <ProductPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => updateParams({ page: String(p) })}
              />
            )}
          </>
        )}
      </PageContainer>
    </div>
  );
}

/** Convert a URL slug like "new-arrivals" to "New Arrivals" */
function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
