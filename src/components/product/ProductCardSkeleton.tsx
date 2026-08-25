import React from 'react';
import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
  className?: string;
}

/**
 * Animated placeholder skeleton for a product card — used during loading.
 */
export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-3 animate-pulse', className)} aria-hidden="true">
      {/* Image placeholder */}
      <div className="aspect-[3/4] w-full bg-border-soft" />
      {/* Name placeholder */}
      <div className="h-3 w-3/4 bg-border-soft" />
      <div className="h-3 w-1/2 bg-border-soft" />
      {/* Price placeholder */}
      <div className="h-3 w-1/3 bg-border-soft" />
    </div>
  );
}
