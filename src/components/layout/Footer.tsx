import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PageContainer } from './PageContainer';
import { APP_ROUTES } from '@/constants';

/**
 * Shared Footer component for the Cotton Clique storefront.
 * Redesigned in premium Dark Green (#0F3326) with cream text.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-primary-medium/35 bg-primary-dark py-16 text-bg-base/80 transition-colors duration-200">
      <PageContainer>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-bg-base/95 p-1 flex items-center justify-center overflow-hidden">
                <Image
                  src="/brand/cotton-clique-logo.jpg"
                  alt="Cotton Clique"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>
              <span className="font-serif text-xl font-normal uppercase tracking-[0.25em] text-bg-base">
                Cotton Clique
              </span>
            </div>
            <p className="text-xs text-green-soft/80 leading-relaxed max-w-xs">
              A curated space for the modern wardrobe. Designed for slow living, quiet luxury, and
              sustainable style.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[11px] font-semibold text-bg-base uppercase tracking-[0.2em]">
              Navigation
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={APP_ROUTES.HOME}
                  className="text-xs text-green-soft/80 hover:text-bg-base transition-colors focus-visible:outline-none rounded"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href={APP_ROUTES.PRODUCTS}
                  className="text-xs text-green-soft/80 hover:text-bg-base transition-colors focus-visible:outline-none rounded"
                >
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Service */}
          <div>
            <h3 className="text-[11px] font-semibold text-bg-base uppercase tracking-[0.2em]">
              Customer Care
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <span className="text-xs text-green-soft/80 block">
                  Support: concierge@cottonclique.example.com
                </span>
              </li>
              <li>
                <span className="text-xs text-green-soft/80 block">Inquiries: Mon–Sat 10:00–18:00 IST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-primary-medium/35 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] uppercase tracking-[0.1em] text-green-soft/60">
            &copy; {currentYear} Cotton Clique. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-[10px] uppercase tracking-[0.1em] text-green-soft/60 hover:text-bg-base cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="text-[10px] uppercase tracking-[0.1em] text-green-soft/60 hover:text-bg-base cursor-pointer transition-colors">
              Terms of Service
            </span>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
