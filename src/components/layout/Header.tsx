'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageContainer } from './PageContainer';
import { APP_ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

/**
 * Shared Header component for the AURA storefront.
 * Aligned with the green-and-cream premium branding.
 */
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('auth_token'));
    };
    checkAuth();
    window.addEventListener('auth_change', checkAuth);
    return () => {
      window.removeEventListener('auth_change', checkAuth);
    };
  }, []);

  const navItems = [
    { label: 'Collections', href: APP_ROUTES.HOME },
    { label: 'New Arrivals', href: APP_ROUTES.PRODUCTS },
    { label: 'Cart', href: APP_ROUTES.CART },
    { label: 'Orders', href: APP_ROUTES.ORDERS },
    isAuthenticated
      ? { label: 'Account', href: APP_ROUTES.PROFILE }
      : { label: 'Sign In', href: '/login' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-base bg-bg-base/85 backdrop-blur-md transition-colors duration-200">
      <PageContainer>
        <div className="flex h-20 items-center justify-between">
          {/* Logo / Brand Name - Serif styled in Primary Green */}
          <div className="flex-shrink-0">
            <Link
              href={APP_ROUTES.HOME}
              className="font-serif text-2xl font-normal uppercase tracking-[0.25em] text-primary transition-colors hover:text-primary-dark focus-visible:outline-none rounded"
              aria-label="AURA Home"
            >
              Aura
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-[11px] font-medium uppercase tracking-[0.2em] transition-all hover:text-primary focus-visible:outline-none rounded py-1 relative',
                    isActive
                      ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-primary'
                      : 'text-text-secondary'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 text-text-base hover:bg-border-base focus-visible:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </PageContainer>

      {/* Mobile Menu panel */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t border-border-base bg-bg-base animate-fade-in"
          id="mobile-menu"
        >
          <nav className="space-y-1 px-6 py-4" aria-label="Mobile Navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'block py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:text-primary',
                    isActive ? 'text-primary' : 'text-text-secondary'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
