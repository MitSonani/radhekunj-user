import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PublicProductListItem } from '@/types/api';
import { formatPrice } from '@/lib/product';
import { APP_ROUTES } from '@/constants';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

interface ProductCardProps {
  product: PublicProductListItem;
  className?: string;
  priority?: boolean;
}

/**
 * Customer-facing product card for the product grid.
 * Displays primary image, product name, and base price.
 * Links to the product detail page.
 * Includes a WishlistButton overlay that stops event propagation.
 */
export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const { id, name, slug, price, primaryImage, category } = product;
  const imageUrl = primaryImage?.url ?? null;
  const altText = primaryImage?.altText || name;

  return (
    <Link
      href={APP_ROUTES.PRODUCT_DETAIL(slug)}
      className={cn('group flex flex-col gap-3 focus-visible:outline-none', className)}
      aria-label={`View ${name}`}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-border-soft">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={altText}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={priority}
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

        {/* Wishlist button — top-right overlay, stops propagation so it doesn't open the product page */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton productId={id} productName={name} variant="icon" />
        </div>
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-1">
        <span className="text-[9px] uppercase tracking-[0.15em] text-text-muted">
          {category.name}
        </span>
        <h3 className="text-xs font-medium text-text-base leading-snug tracking-wide group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {name}
        </h3>
        <span className="text-xs text-text-secondary mt-0.5">{formatPrice(price)}</span>
      </div>
    </Link>
  );
}
