'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout';
import { Button, LoadingState, ErrorState, EmptyState } from '@/components/common';
import { useProduct } from '@/hooks/useProduct';
import { PublicVariant } from '@/types/api';
import { findMatchingVariant, getGalleryImages } from '@/lib/product';
import { APP_ROUTES } from '@/constants';
import { ProductGallery } from './ProductGallery';
import { PriceDisplay } from './PriceDisplay';
import { AttributeSelector } from './AttributeSelector';

interface ProductDetailContentProps {
  slug: string;
}

/**
 * Client component for the full product detail experience.
 * Handles attribute selection, variant resolution, gallery update, and Add to Bag.
 */
export function ProductDetailContent({ slug }: ProductDetailContentProps) {
  const { product, isLoading, error, notFound, refetch } = useProduct(slug);

  // attributeId → attributeValueId
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // React "derived state" pattern: reset selections when a different product loads.
  // Done during render (not inside a useEffect) to avoid the effect-setState anti-pattern.
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  if (product?.id !== undefined && product.id !== currentProductId) {
    setCurrentProductId(product.id);
    setSelectedAttributes({});
  }

  const handleAttributeChange = useCallback((attributeId: string, valueId: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [attributeId]: valueId }));
  }, []);

  // ─── Derived state ──────────────────────────────────────────────────────────

  const colorGroup = product?.availableOptions.find((g) => g.attribute.slug === 'color');

  const selectedColorValueId = colorGroup
    ? (selectedAttributes[colorGroup.attribute.id] ?? null)
    : null;

  const displayImages = product ? getGalleryImages(product.images, selectedColorValueId) : [];

  const selectedVariant: PublicVariant | null = product
    ? findMatchingVariant(product.variants, selectedAttributes)
    : null;

  const allAttributesSelected =
    product !== null &&
    product.availableOptions.every((g) => selectedAttributes[g.attribute.id] !== undefined);

  const displayPrice = selectedVariant?.price ?? product?.price ?? null;
  const displayCompareAtPrice = selectedVariant?.compareAtPrice ?? null;

  const isOutOfStock =
    selectedVariant !== null && selectedVariant.availability === 'OUT_OF_STOCK';

  const canAddToBag = allAttributesSelected && selectedVariant !== null && !isOutOfStock;

  // Determine button copy
  let bagButtonLabel = 'Add to Bag';
  if (!allAttributesSelected) bagButtonLabel = 'Select Options';
  else if (isOutOfStock) bagButtonLabel = 'Out of Stock';

  const handleAddToBag = useCallback(() => {
    if (!canAddToBag || !selectedVariant) return;
    // Cart integration goes here when the Cart module is implemented.
    // For now, prepare the selected variant payload and log it.
    console.info('[AURA] Add to bag — variant ready:', {
      variantId: selectedVariant.id,
      price: selectedVariant.price,
      attributes: selectedVariant.attributes.map((a) => ({
        attribute: a.attribute.name,
        value: a.attributeValue.value,
      })),
    });
  }, [canAddToBag, selectedVariant]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return <LoadingState message="Loading product..." className="min-h-[60vh]" />;
  }

  if (notFound) {
    return (
      <EmptyState
        title="Product Not Found"
        description="This product may have been removed or is no longer available."
        actionLabel="Browse Collection"
        onActionClick={() => (window.location.href = APP_ROUTES.PRODUCTS)}
        className="min-h-[60vh]"
      />
    );
  }

  if (error || !product) {
    return (
      <ErrorState
        title="Could not load product"
        message="Please check your connection and try again."
        onRetry={refetch}
        className="min-h-[60vh]"
      />
    );
  }

  const hasVariants = product.variants.length > 0;
  const hasOptions = product.availableOptions.length > 0;

  return (
    <div className="flex flex-col flex-grow bg-bg-base py-8 md:py-14">
      <PageContainer>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-text-muted">
          <Link href={APP_ROUTES.PRODUCTS} className="hover:text-primary transition-colors">
            Collection
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={APP_ROUTES.CATEGORY(product.category.slug)}
            className="hover:text-primary transition-colors"
          >
            {product.category.name}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text-secondary">{product.name}</span>
        </nav>

        {/* Main layout: gallery + info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-24">
          {/* Gallery */}
          <div className="md:sticky md:top-28 md:self-start">
            <ProductGallery images={displayImages} productName={product.name} />
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-7">
            {/* Category label */}
            <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-text-muted">
              {product.category.name}
            </span>

            {/* Name */}
            <h1 className="font-serif text-2xl md:text-3xl font-normal uppercase tracking-widest text-text-base leading-tight -mt-4">
              {product.name}
            </h1>

            {/* Price */}
            {displayPrice && (
              <PriceDisplay
                price={displayPrice}
                compareAtPrice={displayCompareAtPrice}
                size="lg"
              />
            )}

            {/* Thin divider */}
            <div className="border-t border-border-soft" />

            {/* Description */}
            {product.description && (
              <p className="text-xs text-text-secondary leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Attribute selectors */}
            {hasOptions && hasVariants && (
              <AttributeSelector
                groups={product.availableOptions}
                variants={product.variants}
                selectedAttributes={selectedAttributes}
                onAttributeChange={handleAttributeChange}
              />
            )}

            {/* Availability banner */}
            {isOutOfStock && (
              <div className="flex items-center gap-2 py-2 px-3 border border-border-base bg-bg-soft">
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Selection hint */}
            {!allAttributesSelected && hasOptions && (
              <p className="text-[10px] text-text-muted">
                Please select{' '}
                {product.availableOptions
                  .filter((g) => !selectedAttributes[g.attribute.id])
                  .map((g) => g.attribute.name.toLowerCase())
                  .join(' and ')}{' '}
                to continue.
              </p>
            )}

            {/* Add to Bag */}
            <Button
              variant="primary"
              size="lg"
              disabled={!canAddToBag}
              onClick={handleAddToBag}
              className="w-full mt-2"
              aria-label={bagButtonLabel}
            >
              {bagButtonLabel}
            </Button>

            {/* No variants fallback */}
            {!hasVariants && (
              <p className="text-[10px] text-text-muted text-center">
                This product is currently not available for purchase.
              </p>
            )}

            {/* Variant attributes summary (for screenreaders / when selected) */}
            {selectedVariant && (
              <div
                className="text-[9px] uppercase tracking-[0.15em] text-text-muted border-t border-border-soft pt-4 flex flex-wrap gap-4"
                aria-live="polite"
                aria-label="Selected variant details"
              >
                {selectedVariant.attributes.map((a) => (
                  <span key={a.attribute.id}>
                    {a.attribute.name}:{' '}
                    <span className="text-text-secondary">{a.attributeValue.value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
