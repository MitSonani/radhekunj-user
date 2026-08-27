'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
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
  const { cart, openDrawer } = useCart();

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

  const cartCount = cart?.totalQuantity ?? 0;

  const navItems = [
    { label: 'Collections', href: APP_ROUTES.HOME },
    { label: 'New Arrivals', href: APP_ROUTES.PRODUCTS },
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
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
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

            {/* Bag icon button */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={cartCount > 0 ? `Open bag, ${cartCount} items` : 'Open bag'}
              className="relative flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-text-secondary transition-all hover:text-primary focus-visible:outline-none rounded py-1"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              <span>Bag</span>
              {cartCount > 0 && (
                <span
                  className="flex h-4 min-w-[1rem] items-center justify-center bg-primary px-1 text-[8px] font-bold text-white leading-none"
                  aria-hidden="true"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile: bag icon + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            {/* Mobile bag button */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={cartCount > 0 ? `Open bag, ${cartCount} items` : 'Open bag'}
              className="relative flex items-center p-1 text-text-base"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center bg-primary px-0.5 text-[8px] font-bold text-white leading-none" aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger */}
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
            {/* Cart link in mobile menu */}
            <Link
              href={APP_ROUTES.CART}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-2 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:text-primary',
                pathname === APP_ROUTES.CART ? 'text-primary' : 'text-text-secondary'
              )}
              aria-current={pathname === APP_ROUTES.CART ? 'page' : undefined}
            >
              Bag
              {cartCount > 0 && (
                <span className="flex h-4 min-w-[1rem] items-center justify-center bg-primary px-1 text-[8px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
