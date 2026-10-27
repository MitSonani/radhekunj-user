import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PageContainer } from './PageContainer';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Reusable layout wrapper for authentication pages (Login, Signup, OTP Verify).
 * Minimal editorial layout aligned with the Cotton Clique fashion storefront — no card, no shadow.
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex flex-col flex-grow justify-center py-16 md:py-28 bg-bg-base transition-colors duration-200">
      <PageContainer className="max-w-sm">
        <div className="flex flex-col gap-10">
          {/* Editorial heading */}
          <div className="flex flex-col items-center gap-3 text-center">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90" aria-label="Cotton Clique Home">
              <Image
                src="/brand/cotton-clique-logo.jpg"
                alt="Cotton Clique"
                width={72}
                height={72}
                priority
                className="h-16 w-16 object-contain mix-blend-multiply mx-auto"
              />
            </Link>
            <span className="font-serif text-[11px] font-normal uppercase tracking-[0.35em] text-text-muted select-none">
              Cotton Clique
            </span>
            {title && (
              <h1 className="font-serif text-[2rem] font-normal uppercase tracking-widest text-text-base mt-1 leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-text-secondary leading-relaxed mt-1">{subtitle}</p>
            )}
          </div>

          {/* Form content */}
          <div className="flex flex-col gap-7">{children}</div>
        </div>
      </PageContainer>
    </div>
  );
}
export default AuthLayout;
