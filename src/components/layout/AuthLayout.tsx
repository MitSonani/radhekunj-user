import React from 'react';
import { PageContainer } from './PageContainer';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Reusable layout wrapper for authentication pages (Login, Signup, OTP Verify).
 * Minimal editorial layout aligned with the AURA fashion storefront — no card, no shadow.
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex flex-col flex-grow justify-center py-16 md:py-28 bg-bg-base transition-colors duration-200">
      <PageContainer className="max-w-sm">
        <div className="flex flex-col gap-10">
          {/* Editorial heading */}
          <div className="flex flex-col gap-3 text-center">
            <span className="font-serif text-[10px] font-normal uppercase tracking-[0.4em] text-text-muted select-none">
              Aura Studio
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
