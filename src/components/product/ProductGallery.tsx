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
 * Product image gallery: large main image with a scrollable thumbnail strip.
 * Clicking a thumbnail updates the main image. Keyboard navigation supported.
 */
export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset to 0 when images array identity changes (e.g., color switched)
  const safeIndex = Math.min(selectedIndex, Math.max(0, images.length - 1));

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setSelectedIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setSelectedIndex((i) => Math.min(images.length - 1, i + 1));
    },
    [images.length],
  );

  const selectedImage = images[safeIndex] ?? null;

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

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Main image */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-green-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        tabIndex={0}
        role="img"
        aria-label={selectedImage?.altText || productName}
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

        {/* Arrow navigation */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
              disabled={safeIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center bg-bg-base/80 backdrop-blur-sm text-text-base hover:bg-bg-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setSelectedIndex((i) => Math.min(images.length - 1, i + 1))}
              disabled={safeIndex === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center bg-bg-base/80 backdrop-blur-sm text-text-base hover:bg-bg-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <ul
          className="flex gap-2 overflow-x-auto pb-1 list-none"
          aria-label="Product image thumbnails"
        >
          {images.map((img, index) => (
            <li key={img.id} className="flex-shrink-0">
              <button
                type="button"
                aria-label={img.altText || `Image ${index + 1}`}
                aria-pressed={index === safeIndex}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'relative h-16 w-12 block overflow-hidden border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                  index === safeIndex
                    ? 'border-primary'
                    : 'border-border-base hover:border-text-muted',
                )}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `Thumbnail ${index + 1}`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
