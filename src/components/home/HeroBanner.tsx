'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/common';
import type { PublicBannerItem } from '@/services/api';

export interface HeroBannerProps {
  banner?: PublicBannerItem | null;
  defaultTitle?: string;
  defaultSubtitle?: string;
  defaultBadgeText?: string;
  defaultCtaLabel?: string;
  defaultCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  className?: string;
}

export function HeroBanner({
  banner,
  defaultTitle = 'The Art of Quiet Luxury',
  defaultSubtitle = 'Structured silhouettes, natural organic fabrics, and a neutral palette. Hand-tailored for conscious, timeless living.',
  defaultBadgeText = 'Artisan Heritage Edit',
  defaultCtaLabel = 'Explore Collection',
  defaultCtaLink = '/products',
  secondaryCtaLabel = 'Shop by Category',
  secondaryCtaLink = '/categories',
  className = '',
}: HeroBannerProps) {
  const title = banner?.title || defaultTitle;
  const subtitle = banner?.subtitle ?? defaultSubtitle;
  const badgeText = banner?.badgeText ?? defaultBadgeText;
  const ctaLabel = banner?.ctaLabel ?? defaultCtaLabel;
  const ctaLink = banner?.ctaLink ?? defaultCtaLink;
  const altText = banner?.altText || title;
  const alignment = banner?.textAlignment || 'left';

  const desktopImage = banner?.desktopImageUrl;
  const tabletImage = banner?.tabletImageUrl || desktopImage;
  const mobileImage = banner?.mobileImageUrl || tabletImage || desktopImage;

  const alignmentClasses = {
    left: 'items-start text-left justify-end',
    center: 'items-center text-center justify-center mx-auto',
    right: 'items-end text-right justify-end ml-auto',
  }[alignment];

  return (
    <section
      aria-label="Campaign Hero"
      className={`relative w-full h-[65vh] min-h-[460px] max-h-[720px] bg-green-light border border-border-base overflow-hidden shadow-xs ${className}`}
    >
      {/* 1. Responsive Picture Element with Breakpoint Fallbacks */}
      {desktopImage ? (
        <picture className="absolute inset-0 w-full h-full block">
          {/* Desktop breakpoint (>= 1024px) */}
          <source media="(min-width: 1024px)" srcSet={desktopImage} />
          {/* Tablet breakpoint (>= 640px) */}
          {tabletImage && <source media="(min-width: 640px)" srcSet={tabletImage} />}
          {/* Mobile image fallback */}
          <img
            src={mobileImage}
            alt={altText}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out"
          />
        </picture>
      ) : (
        /* Fallback branded backdrop when no photograph is configured */
        <div className="absolute inset-0 bg-gradient-to-br from-green-light via-surface to-green-soft/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-soft/30 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* 2. Accessible High-Contrast Readability Gradient Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          desktopImage
            ? alignment === 'center'
              ? 'bg-gradient-to-t from-black/85 via-black/50 to-black/30'
              : alignment === 'right'
              ? 'bg-gradient-to-l from-black/85 via-black/50 to-transparent sm:from-black/80'
              : 'bg-gradient-to-r from-black/85 via-black/50 to-transparent sm:from-black/80'
            : 'bg-gradient-to-t from-black/20 via-transparent to-transparent'
        }`}
      />

      {/* 3. Content Container */}
      <div className="relative z-10 w-full h-full p-6 sm:p-10 md:p-16 flex flex-col justify-end">
        <div className={`max-w-xl flex flex-col gap-3 sm:gap-4 ${alignmentClasses} animate-fade-in`}>
          {/* Badge */}
          {badgeText && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-none px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] ${
                desktopImage
                  ? 'bg-accent/25 text-accent border border-accent/30 shadow-xs'
                  : 'bg-accent/15 text-accent'
              }`}
            >
              <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse" />
              {badgeText}
            </span>
          )}

          {/* Headline */}
          <h1
            className={`font-serif text-3xl sm:text-5xl md:text-6xl font-normal leading-[1.1] uppercase tracking-wide ${
              desktopImage ? 'text-white drop-shadow-sm' : 'text-text-base'
            }`}
          >
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p
              className={`text-xs sm:text-sm md:text-base leading-relaxed max-w-md ${
                desktopImage ? 'text-white/85 drop-shadow-xs' : 'text-text-secondary'
              }`}
            >
              {subtitle}
            </p>
          )}

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap items-center gap-3 mt-2 sm:mt-4 ${
              alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'
            }`}
          >
            {ctaLabel && ctaLink && (
              <Link
                href={ctaLink}
                className="focus-visible:outline-2 focus-visible:outline-white focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className={
                    desktopImage
                      ? 'bg-white text-primary border-white hover:bg-white/90 hover:border-white shadow-md'
                      : undefined
                  }
                >
                  {ctaLabel}
                </Button>
              </Link>
            )}

            {secondaryCtaLabel && secondaryCtaLink && (
              <Link
                href={secondaryCtaLink}
                className="focus-visible:outline-2 focus-visible:outline-white focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className={
                    desktopImage
                      ? 'border-white/60 text-white hover:bg-white/10 hover:border-white'
                      : undefined
                  }
                >
                  {secondaryCtaLabel}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
