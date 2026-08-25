'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PublicImageItem } from '@/types/api';

interface ProductGalleryProps {
  images: PublicImageItem[];
  productName: string;
  className?: string;
}

/**
 * Product image gallery: large primary image + scrollable thumbnail strip.
 *
 * Behaviour:
 * - Clicking a thumbnail selects it as the primary image.
 * - Arrow keys on the focused main image navigate between images.
 * - Prev/Next overlay buttons provide pointer-friendly navigation.
 * - When the images array changes (e.g. a colour is selected in the parent),
 *   the selected index resets to 0 — uses React's derived-state-during-render
 *   pattern (no useEffect, no ref) to avoid stale image pointers.
 */
export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ── Reset index when the image set changes (colour switch / product change) ─
  // This is the React-recommended "derive state from props" pattern:
  // call setState in the render body with a guard — React re-renders once more
  // with the corrected state, and the user never sees the intermediate frame.
  const [prevImagesKey, setPrevImagesKey] = useState('');
  const currentImagesKey = images.map((i) => i.id).join('|');
  if (currentImagesKey !== prevImagesKey) {
    setPrevImagesKey(currentImagesKey);
    setSelectedIndex(0);
  }

  // Clamp: guard against any remaining out-of-bound edge cases
  const safeIndex = Math.min(selectedIndex, Math.max(0, images.length - 1));
  const selectedImage = images[safeIndex] ?? null;

  const goTo = useCallback(
    (index: number) => setSelectedIndex(Math.max(0, Math.min(images.length - 1, index))),
    [images.length],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(safeIndex - 1);
      if (e.key === 'ArrowRight') goTo(safeIndex + 1);
    },
    [goTo, safeIndex],
  );

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (images.length === 0) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <div className="aspect-[3/4] bg-green-light flex items-center justify-center">
          <svg
            className="h-16 w-16 text-border-base"
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
      </div>
    );
  }

  const canGoPrev = safeIndex > 0;
  const canGoNext = safeIndex < images.length - 1;

  return (
    <div className={cn('flex flex-col', className)}>
      {/* ── Main image ─────────────────────────────────────────────────────── */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-green-light cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary select-none"
        tabIndex={0}
        role="img"
        aria-label={selectedImage?.altText || productName}
        aria-roledescription="Image gallery"
        onKeyDown={handleKeyDown}
      >
        {selectedImage && (
          <Image
            key={selectedImage.id}
            src={selectedImage.url}
            alt={selectedImage.altText || productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-opacity duration-300"
            priority
          />
        )}

        {/* Counter pill */}
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-bg-base/80 backdrop-blur-sm text-[9px] uppercase tracking-[0.15em] text-text-secondary px-2 py-1 pointer-events-none">
            {safeIndex + 1} / {images.length}
          </span>
        )}

        {/* Prev / Next overlay buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => goTo(safeIndex - 1)}
              disabled={!canGoPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center bg-bg-base/80 backdrop-blur-sm text-text-base hover:bg-bg-base transition-colors disabled:opacity-0 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => goTo(safeIndex + 1)}
              disabled={!canGoNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center bg-bg-base/80 backdrop-blur-sm text-text-base hover:bg-bg-base transition-colors disabled:opacity-0 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

    </div>
  );
}
