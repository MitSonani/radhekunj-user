import React from 'react';
import { PageContainer } from '@/components/layout';
import { Button, Input } from '@/components/common';

/**
 * Editorial Homepage for AURA storefront.
 * Fully aligned with the premium green & cream brand system.
 */
export default function Home() {
  return (
    <div className="flex flex-col gap-24 py-12 md:py-20 transition-colors duration-200">
      {/* 1. Campaign Hero Section */}
      <PageContainer>
        <div className="relative w-full h-[70vh] bg-green-light border border-border-base flex flex-col justify-end p-8 md:p-16 overflow-hidden">
          {/* Subtle brand soft green radial background overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-soft/30 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-xl flex flex-col gap-4 items-start animate-fade-in">
            {/* Premium Gold badge accent for luxury campaign detail */}
            <span className="inline-flex items-center gap-1.5 rounded-none bg-accent/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-accent">
              <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse" />
              Autumn / Winter 2026 Collection
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.1] text-text-base uppercase tracking-wide">
              The Art of <br /> Quiet Luxury
            </h1>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed max-w-sm">
              Structured silhouettes, natural organic fabrics, and a neutral palette. Tailored for
              conscious, minimalist living.
            </p>
            <Button variant="primary" size="lg" className="mt-4">
              Explore Collection
            </Button>
          </div>
        </div>
      </PageContainer>

      {/* 2. Shop by Category / Collections Grid */}
      <PageContainer>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-text-secondary">
              Curated Segments
            </span>
            <h2 className="font-serif text-2xl font-normal uppercase tracking-widest text-text-base">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Category 1 */}
            <div className="group relative aspect-[3/4] w-full bg-surface border border-border-base hover:border-primary-medium/40 hover:bg-green-light/35 transition-all duration-300 flex flex-col justify-end p-6 cursor-pointer">
              <div className="relative z-10 flex flex-col gap-2">
                <h3 className="font-serif text-lg font-normal text-text-base uppercase tracking-wider">
                  The Tailored Suit
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary group-hover:text-primary transition-colors">
                  Shop Category &rarr;
                </span>
              </div>
            </div>

            {/* Category 2 */}
            <div className="group relative aspect-[3/4] w-full bg-surface border border-border-base hover:border-primary-medium/40 hover:bg-green-light/35 transition-all duration-300 flex flex-col justify-end p-6 cursor-pointer">
              <div className="relative z-10 flex flex-col gap-2">
                <h3 className="font-serif text-lg font-normal text-text-base uppercase tracking-wider">
                  Casual Knitwear
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary group-hover:text-primary transition-colors">
                  Shop Category &rarr;
                </span>
              </div>
            </div>

            {/* Category 3 */}
            <div className="group relative aspect-[3/4] w-full bg-surface border border-border-base hover:border-primary-medium/40 hover:bg-green-light/35 transition-all duration-300 flex flex-col justify-end p-6 cursor-pointer">
              <div className="relative z-10 flex flex-col gap-2">
                <h3 className="font-serif text-lg font-normal text-text-base uppercase tracking-wider">
                  Minimalist Accessories
                </h3>
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary group-hover:text-primary transition-colors">
                  Shop Category &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* 3. Featured / Trending Products Showcase */}
      <PageContainer>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-text-secondary">
              Seasonal Selects
            </span>
            <h2 className="font-serif text-2xl font-normal uppercase tracking-widest text-text-base">
              New Arrivals
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Product Card 1 */}
            <div className="group flex flex-col cursor-pointer">
              <div className="relative aspect-[3/4] w-full bg-bg-soft border border-border-base group-hover:border-primary-medium/30 transition-all duration-300 flex items-center justify-center text-text-secondary select-none">
                <span className="text-[10px] uppercase tracking-widest font-semibold opacity-60">
                  Image Placeholder
                </span>
                <span className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                  New
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <h3 className="font-serif text-sm font-normal text-text-base tracking-wide uppercase">
                  Cashmere Wool Overcoat
                </h3>
                <p className="text-xs text-primary font-semibold tracking-wider">$450.00</p>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="group flex flex-col cursor-pointer">
              <div className="relative aspect-[3/4] w-full bg-bg-soft border border-border-base group-hover:border-primary-medium/30 transition-all duration-300 flex items-center justify-center text-text-secondary select-none">
                <span className="text-[10px] uppercase tracking-widest font-semibold opacity-60">
                  Image Placeholder
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <h3 className="font-serif text-sm font-normal text-text-base tracking-wide uppercase">
                  Silk Ribbed Knit Top
                </h3>
                <p className="text-xs text-primary font-semibold tracking-wider">$180.00</p>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="group flex flex-col cursor-pointer">
              <div className="relative aspect-[3/4] w-full bg-bg-soft border border-border-base group-hover:border-primary-medium/30 transition-all duration-300 flex items-center justify-center text-text-secondary select-none">
                <span className="text-[10px] uppercase tracking-widest font-semibold opacity-60">
                  Image Placeholder
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <h3 className="font-serif text-sm font-normal text-text-base tracking-wide uppercase">
                  Relaxed Pleated Trousers
                </h3>
                <p className="text-xs text-primary font-semibold tracking-wider">$220.00</p>
              </div>
            </div>

            {/* Product Card 4 */}
            <div className="group flex flex-col cursor-pointer">
              <div className="relative aspect-[3/4] w-full bg-bg-soft border border-border-base group-hover:border-primary-medium/30 transition-all duration-300 flex items-center justify-center text-text-secondary select-none">
                <span className="text-[10px] uppercase tracking-widest font-semibold opacity-60">
                  Image Placeholder
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <h3 className="font-serif text-sm font-normal text-text-base tracking-wide uppercase">
                  Leather Slip-On Loafer
                </h3>
                <p className="text-xs text-primary font-semibold tracking-wider">$310.00</p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* 4. Editorial Brand Philosophy Section */}
      <div className="w-full bg-bg-soft border-y border-border-base py-20 transition-colors duration-200">
        <PageContainer>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-secondary">
                Our Philosophy
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-normal uppercase tracking-wide text-text-base leading-tight">
                The Architecture <br /> of Clothing
              </h2>
            </div>
            <div className="flex flex-col gap-4 text-xs md:text-sm text-text-secondary leading-relaxed">
              <p>
                AURA is founded on the idea that clothing should act as a subtle extension of
                oneself. We reject seasonal trends in favor of structural integrity, premium organic
                materials, and slow local tailoring.
              </p>
              <p>
                Every garment is meticulously crafted in limited runs, honoring classic sartorial
                techniques while serving the requirements of a modern wardrobe. We believe in owning
                fewer, but infinitely better, items.
              </p>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* 5. Newsletter Sign-Up Section */}
      <PageContainer>
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6 items-center">
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-text-secondary">
            Stay Connected
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-normal uppercase tracking-widest text-text-base">
            The Aura Journal
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-md">
            Subscribe to receive editorial campaign launch notifications, private collection
            previews, and studio notes.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 w-full mt-4 justify-center items-stretch">
            <Input
              type="email"
              placeholder="ENTER YOUR EMAIL"
              className="min-w-[280px]"
              aria-label="Email address for newsletter sign-up"
              required
            />
            <Button variant="primary" type="submit" size="md">
              Subscribe
            </Button>
          </form>
        </div>
      </PageContainer>
    </div>
  );
}
