import { Suspense } from 'react';
import { LoadingState } from '@/components/common';
import { ProductsListing } from '@/components/product';

/**
 * /products — Customer-facing product listing page.
 * Uses URL search params (page, search, sort) managed inside ProductsListing.
 * Wrapped in Suspense so useSearchParams inside ProductsListing can opt in
 * to streaming without blocking the entire page render.
 */
export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading collection..." className="min-h-[60vh]" />}>
      <ProductsListing />
    </Suspense>
  );
}
