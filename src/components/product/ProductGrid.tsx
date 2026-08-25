import React from 'react';
import { cn } from '@/lib/utils';
import { PublicProductListItem } from '@/types/api';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductGridProps {
  products: PublicProductListItem[];
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
}

const GRID_CLASSES =
  'grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

/**
 * Responsive product grid — 2 columns on mobile, up to 4 on desktop.
 * Shows skeleton placeholders while loading.
 */
export function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={cn(GRID_CLASSES, className)} aria-label="Loading products" aria-busy="true">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(GRID_CLASSES, className)}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
