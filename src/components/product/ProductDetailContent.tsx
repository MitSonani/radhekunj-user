'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { Button, ErrorState, EmptyState, Toast } from '@/components/common';
import { useProduct } from '@/hooks/useProduct';
import { useCart } from '@/contexts/CartContext';
import { ApiError } from '@/types/api';
import { PublicVariant } from '@/types/api';
import {
  findMatchingVariant,
  getGalleryImages,
  getInitialAttributes,
} from '@/lib/product';
import { APP_ROUTES } from '@/constants';
import { ProductGallery } from './ProductGallery';
import { PriceDisplay } from './PriceDisplay';
import { AttributeSelector } from './AttributeSelector';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';
import { MoreFromCategory } from './MoreFromCategory';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

// ── Accordion item ─────────────────────────────────────────────────────────────
function AccordionItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left focus-visible:outline-none"
        aria-expanded={open}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-base">
          {label}
        </span>
        <svg
          className={`h-3.5 w-3.5 text-text-muted transition-transform duration-200 flex-shrink-0 ${
            open ? 'rotate-90' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      {open && (
        <div className="pb-5 text-[11px] text-text-secondary leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Trust badge ────────────────────────────────────────────────────────────────
function TrustBadge({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-base">
        + {title}
      </span>
      <span className="text-[10px] text-text-muted">{subtitle}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface ProductDetailContentProps {
  slug: string;
}

export function ProductDetailContent({ slug }: ProductDetailContentProps) {
  const { product, isLoading, error, notFound, refetch } = useProduct(slug);
  const { addToCart, isAddingToCart } = useCart();
  const router = useRouter();

  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  // Auto-select the best initial variant whenever a new product loads
  if (product !== null && product.id !== currentProductId) {
    setCurrentProductId(product.id);
    setSelectedAttributes(getInitialAttributes(product.variants));
  }

  const handleAttributeChange = useCallback(
    (attributeId: string, valueId: string) => {
      setSelectedAttributes((prev) => ({ ...prev, [attributeId]: valueId }));
    },
    [],
  );

  // ── Derived state ────────────────────────────────────────────────────────────
  const colorGroup = product?.availableOptions.find(
    (g) => g.attribute.slug === 'color',
  );
  const selectedColorValueId = colorGroup
    ? (selectedAttributes[colorGroup.attribute.id] ?? null)
    : null;

  const displayImages = product
    ? getGalleryImages(product.images, selectedColorValueId)
    : [];

  const selectedVariant: PublicVariant | null = product
    ? findMatchingVariant(product.variants, selectedAttributes)
    : null;

  const allAttributesSelected =
    product !== null &&
    product.availableOptions.length > 0 &&
    product.availableOptions.every(
      (g) => selectedAttributes[g.attribute.id] !== undefined,
    );

  const displayPrice = selectedVariant?.price ?? product?.price ?? null;
  const displayCompareAtPrice = selectedVariant?.compareAtPrice ?? null;

  const isOutOfStock =
    selectedVariant !== null && selectedVariant.availability === 'OUT_OF_STOCK';

  const canAddToBag =
    product !== null &&
    allAttributesSelected &&
    selectedVariant !== null &&
    !isOutOfStock &&
    !isAddingToCart;

  const missingAttributeNames =
    product?.availableOptions
      .filter((g) => !selectedAttributes[g.attribute.id])
      .map((g) => g.attribute.name) ?? [];

  let bagButtonLabel = 'Add to Bag';
  if (isAddingToCart) bagButtonLabel = 'Adding...';
  else if (!allAttributesSelected && (product?.availableOptions.length ?? 0) > 0)
    bagButtonLabel = 'Select Options';
  else if (isOutOfStock) bagButtonLabel = 'Out of Stock';

  const handleAddToBag = useCallback(async () => {
    if (!canAddToBag || !selectedVariant) return;

    // Check authentication — redirect to login preserving return URL
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setAddError(null);
    try {
      await addToCart(selectedVariant.id, 1);
      // Cart drawer opens automatically on success (inside CartContext)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Failed to add to bag. Please try again.';
      setAddError(message);
    }
  }, [canAddToBag, selectedVariant, addToCart, router]);

  // ── Loading / error states ────────────────────────────────────────────────────
  if (isLoading) return <ProductDetailSkeleton />;

  if (notFound) {
    return (
      <EmptyState
        title="Product Not Found"
        description="The product you're looking for may have been removed or is no longer available."
        actionLabel="Continue Shopping"
        onActionClick={() => (window.location.href = APP_ROUTES.PRODUCTS)}
        className="min-h-[60vh]"
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
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
            />
          </svg>
        }
      />
    );
  }

  if (error || !product) {
    return (
      <ErrorState
        title="Unable to load this product"
        message="Please check your connection and try again."
        onRetry={refetch}
        className="min-h-[60vh]"
      />
    );
  }

  const hasVariants = product.variants.length > 0;
  const hasOptions = product.availableOptions.length > 0;

  return (
    <div className="flex flex-col flex-grow bg-bg-base pb-24 md:pb-0">

      {/* Add-to-bag error toast */}
      {addError && (
        <Toast
          message={addError}
          type="error"
          duration={4000}
          onDismiss={() => setAddError(null)}
        />
      )}

      {/* ── Product info section ─────────────────────────────────────────────── */}
      <div className="py-8 md:py-14">
      <PageContainer>

        {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 flex-wrap text-[9px] uppercase tracking-[0.2em] text-text-muted"
        >
          <Link href={APP_ROUTES.PRODUCTS} className="hover:text-text-base transition-colors">
            Collection
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={APP_ROUTES.CATEGORY(product.category.slug)}
            className="hover:text-text-base transition-colors"
          >
            {product.category.name}
          </Link>
        </nav>

        {/* ── Main 2-column layout ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-24">

          {/* LEFT — gallery, sticky on desktop */}
          <div className="md:sticky md:top-28 md:self-start">
            <ProductGallery images={displayImages} productName={product.name} />
          </div>

          {/* RIGHT — product info */}
          <div className="flex flex-col gap-5 md:pt-1">

            {/* Category */}
            <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-text-muted">
              {product.category.name}
            </span>

            {/* Product name */}
            <h1 className="font-serif text-2xl md:text-3xl font-normal uppercase tracking-widest text-text-base leading-snug -mt-1">
              {product.name}
            </h1>

            {/* Price + tax line — hidden on mobile (shown in sticky bottom bar) */}
            {displayPrice && (
              <div className="hidden md:flex flex-col gap-0.5">
                <PriceDisplay
                  price={displayPrice}
                  compareAtPrice={displayCompareAtPrice}
                  size="lg"
                />
                <p className="text-[9px] uppercase tracking-[0.18em] text-text-muted">
                  MRP Incl. of all taxes
                </p>
              </div>
            )}

            <div className="border-t border-border-soft" />

            {/* Attribute selectors */}
            {hasOptions && hasVariants && (
              <AttributeSelector
                groups={product.availableOptions}
                variants={product.variants}
                selectedAttributes={selectedAttributes}
                onAttributeChange={handleAttributeChange}
              />
            )}

            {/* Out-of-stock notice */}
            {isOutOfStock && (
              <div className="flex items-center gap-2 py-2.5 px-3 border border-border-base bg-bg-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-danger flex-shrink-0" aria-hidden="true" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-danger">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Selection nudge */}
            {!allAttributesSelected && hasOptions && missingAttributeNames.length > 0 && (
              <p className="text-[10px] text-text-muted -mt-1" aria-live="polite">
                Please select{' '}
                <span className="font-medium text-text-secondary">
                  {missingAttributeNames.map((n) => n.toLowerCase()).join(' and ')}
                </span>{' '}
                to continue.
              </p>
            )}

            {/* Add to bag — hidden on mobile (shown in sticky bottom bar) */}
            <Button
              variant="primary"
              size="lg"
              disabled={!canAddToBag}
              isLoading={isAddingToCart}
              onClick={handleAddToBag}
              className="hidden md:flex w-full justify-center mt-1"
              aria-label={bagButtonLabel}
              aria-disabled={!canAddToBag}
            >
              {bagButtonLabel}
            </Button>

            {/* Wishlist toggle — desktop only; also present in mobile sticky bar */}
            <div className="hidden md:flex">
              <WishlistButton
                productId={product.id}
                productName={product.name}
                variant="pill"
              />
            </div>

            {/* No variants notice */}
            {!hasVariants && (
              <p className="text-[10px] text-text-muted text-center">
                This product is not currently available for purchase.
              </p>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-[11px] text-text-secondary leading-relaxed uppercase tracking-[0.06em]">
                {product.description}
              </p>
            )}

            {/* Accordions */}
            <div>
              <AccordionItem label="Product Measurements">
                Please refer to our size guide for detailed measurements. Sizes
                may vary slightly due to the handcrafted nature of our garments.
              </AccordionItem>
              <AccordionItem label="Composition &amp; Care">
                Dry clean or hand wash separately in cold water. Do not wring.
                Iron on medium heat. Store flat or rolled — avoid hanging for
                extended periods to retain shape.
              </AccordionItem>
              <AccordionItem label="Shipping &amp; Returns">
                Free shipping on all prepaid orders. Delivery within 7–10
                business days. Easy exchanges within 15 days of delivery.
                Returns are accepted for unused items in original packaging.
              </AccordionItem>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 pt-5 border-t border-border-soft">
              <TrustBadge title="Free Shipping" subtitle="7–10 days delivery" />
              <TrustBadge title="Easy Exchanges" subtitle="15-day policy" />
              <TrustBadge title="Secure Payments" subtitle="UPI, Cards, COD" />
              <TrustBadge title="Customer Support" subtitle="Instagram & Email" />
            </div>

          </div>
        </div>

      </PageContainer>
      </div>

      {/* ── Editorial image strip — aligned with PageContainer ──────────────── */}
      {displayImages.length > 1 && (
        <PageContainer className="pb-8 md:pb-14">
        <div className="grid grid-cols-2 gap-8">
          {displayImages.slice(1).map((img) => (
            <div
              key={img.id}
              className="relative aspect-[3/4] bg-bg-soft"
            >
              <Image
                src={img.url}
                alt={img.altText || product.name}
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
          ))}
          {/* If odd number of extra images, fill the last cell with a text panel */}
          {displayImages.slice(1).length % 2 !== 0 && (
            <div className="aspect-[3/4] bg-bg-soft flex items-end p-10 md:p-14">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-text-muted mb-2">
                  Material
                </p>
                <p className="font-serif text-xl md:text-2xl uppercase tracking-widest text-text-base">
                  {product.name}
                </p>
              </div>
            </div>
          )}
        </div>
        </PageContainer>
      )}

      {/* ── More from this category ──────────────────────────────────────────── */}
      <PageContainer className="py-6">
        <MoreFromCategory
          categorySlug={product.category.slug}
          categoryName={product.category.name}
          currentProductId={product.id}
        />
      </PageContainer>

      {/* ── Mobile sticky bottom bar ─────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-base border-t border-border-soft">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Price */}
          <div className="flex flex-col flex-shrink-0">
            {displayPrice && (
              <PriceDisplay
                price={displayPrice}
                compareAtPrice={displayCompareAtPrice}
                size="lg"
              />
            )}
          </div>

          {/* Add to bag */}
          <Button
            variant="primary"
            size="lg"
            disabled={!canAddToBag}
            isLoading={isAddingToCart}
            onClick={handleAddToBag}
            className="flex-1 justify-center"
            aria-label={bagButtonLabel}
            aria-disabled={!canAddToBag}
          >
            {bagButtonLabel}
          </Button>

          {/* Wishlist toggle */}
          <WishlistButton
            productId={product.id}
            productName={product.name}
            variant="icon"
            className="flex-shrink-0 w-10 h-10"
          />
        </div>
      </div>

    </div>
  );
}
