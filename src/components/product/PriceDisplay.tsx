import React from 'react';
import { cn } from '@/lib/utils';
import { formatPrice, calcDiscountPct } from '@/lib/product';

interface PriceDisplayProps {
  price: string;
  compareAtPrice?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const priceSize = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

const strikeSize = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * Displays a formatted price with optional strikethrough compare-at price and discount badge.
 * Money strings from the backend (e.g. "999.00") are formatted as "₹999".
 */
export function PriceDisplay({
  price,
  compareAtPrice,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const discountPct = calcDiscountPct(price, compareAtPrice ?? null);

  return (
    <div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
      <span className={cn('font-medium text-text-base tracking-wide', priceSize[size])}>
        {formatPrice(price)}
      </span>
      {discountPct !== null && compareAtPrice && (
        <>
          <span
            className={cn('line-through text-text-muted', strikeSize[size])}
            aria-label={`Original price ${formatPrice(compareAtPrice)}`}
          >
            {formatPrice(compareAtPrice)}
          </span>
          <span className="text-[9px] font-semibold text-success uppercase tracking-[0.12em] px-1.5 py-0.5 bg-green-light">
            {discountPct}% off
          </span>
        </>
      )}
    </div>
  );
}
