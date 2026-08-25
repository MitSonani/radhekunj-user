import React from 'react';
import { PageContainer } from '@/components/layout';

/**
 * Skeleton placeholder for the Product Detail page.
 * Mirrors the actual PDP layout (gallery + info panel) so the page structure
 * is visible while the API call is in flight.
 */
export function ProductDetailSkeleton() {
  return (
    <div
      className="flex flex-col flex-grow bg-bg-base py-8 md:py-14 animate-pulse"
      aria-busy="true"
      aria-label="Loading product"
    >
      <PageContainer>
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2">
          <div className="h-2 w-16 bg-border-soft rounded-none" />
          <div className="h-2 w-1.5 bg-border-soft rounded-none" />
          <div className="h-2 w-16 bg-border-soft rounded-none" />
          <div className="h-2 w-1.5 bg-border-soft rounded-none" />
          <div className="h-2 w-28 bg-border-soft rounded-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-24">
          {/* Gallery skeleton */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[3/4] w-full bg-border-soft" />
            <div className="flex gap-2 overflow-hidden">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-12 flex-shrink-0 bg-border-soft" />
              ))}
            </div>
          </div>

          {/* Info skeleton */}
          <div className="flex flex-col gap-5 md:pt-1">
            {/* Category */}
            <div className="h-2 w-16 bg-border-soft" />
            {/* Product name */}
            <div className="flex flex-col gap-2 -mt-1">
              <div className="h-5 w-4/5 bg-border-soft" />
              <div className="h-5 w-3/5 bg-border-soft" />
            </div>
            {/* Price */}
            <div className="flex items-center gap-3">
              <div className="h-6 w-20 bg-border-soft" />
              <div className="h-4 w-16 bg-border-soft opacity-60" />
            </div>

            <div className="border-t border-border-soft" />

            {/* Description */}
            <div className="flex flex-col gap-2">
              <div className="h-2 w-full bg-border-soft" />
              <div className="h-2 w-11/12 bg-border-soft" />
              <div className="h-2 w-4/5 bg-border-soft" />
              <div className="h-2 w-3/5 bg-border-soft" />
            </div>

            {/* Color attribute */}
            <div>
              <div className="h-2 w-12 bg-border-soft mb-3" />
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-border-soft" />
                <div className="h-7 w-7 rounded-full bg-border-soft" />
                <div className="h-7 w-7 rounded-full bg-border-soft" />
              </div>
            </div>

            {/* Size attribute */}
            <div>
              <div className="h-2 w-8 bg-border-soft mb-3" />
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-9 w-11 bg-border-soft" />
                ))}
              </div>
            </div>

            {/* Add to Bag button */}
            <div className="h-12 w-full bg-border-soft mt-2" />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
