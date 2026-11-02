'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { PageContainer } from './PageContainer';
import { APP_ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

/**
 * Shared Header component for the Cotton Clique storefront.
 * Aligned with the green-and-cream premium branding.
 * Supports compact hamburger navigation on tablet/mobile (<1024px)
 * to avoid brand collision and horizontal overflow.
 */
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const { cart, openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('auth_token'));
    };
    checkAuth();
    window.addEventListener('auth_change', checkAuth);
    return () => {
      window.removeEventListener('auth_change', checkAuth);
    };
  }, []);

  // Keyboard accessibility: close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu if resized to desktop (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  const cartCount = cart?.totalQuantity ?? 0;

  const isNavActive = (href: string) =>
    pathname === href ||
    (href === APP_ROUTES.PROFILE && pathname.startsWith(`${APP_ROUTES.PROFILE}/`));

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
          {/* Logo / Brand Name - Cotton Clique */}
          <div className="shrink-0">
            <Link
              href={APP_ROUTES.HOME}
              className="flex items-center gap-3 rounded py-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Cotton Clique Home"
            >
              <Image
                src="/brand/cotton-clique-logo.jpg"
                alt="Cotton Clique Logo"
                width={52}
                height={52}
                priority
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-105 shrink-0"
              />
              <span className="font-serif text-xl sm:text-2xl font-normal uppercase tracking-[0.2em] text-primary whitespace-nowrap transition-colors group-hover:text-primary-dark">
                Cotton Clique
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - shown on lg (1024px) and above */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = isNavActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-[11px] font-medium uppercase tracking-[0.2em] transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-1.5 py-1 relative whitespace-nowrap',
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

            {/* Wishlist link */}
            <Link
              href="/wishlist"
              className={cn(
                'relative flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-1.5 py-1 whitespace-nowrap',
                pathname === '/wishlist'
                  ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-primary'
                  : 'text-text-secondary'
              )}
              aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : 'Wishlist'}
              aria-current={pathname === '/wishlist' ? 'page' : undefined}
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
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span
                  className="flex h-4 min-w-[1rem] items-center justify-center bg-primary px-1 text-[8px] font-bold text-white leading-none"
                  aria-hidden="true"
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Bag icon button */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={cartCount > 0 ? `Open bag, ${cartCount} items` : 'Open bag'}
              className="relative flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-text-secondary transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-1.5 py-1 whitespace-nowrap"
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

          {/* Mobile & Tablet controls (< 1024px): wishlist + bag + hamburger menu button */}
          <div className="flex lg:hidden items-center gap-2 sm:gap-3">
            {/* Mobile/Tablet wishlist link */}
            <Link
              href="/wishlist"
              aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : 'Wishlist'}
              className="relative flex items-center p-2 text-text-base rounded-md hover:bg-border-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
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
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute 0.5 top-0.5 right-0.5 flex h-4 min-w-[1rem] items-center justify-center bg-primary px-1 text-[8px] font-bold text-white leading-none" aria-hidden="true">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Mobile/Tablet bag button */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={cartCount > 0 ? `Open bag, ${cartCount} items` : 'Open bag'}
              className="relative flex items-center p-2 text-text-base rounded-md hover:bg-border-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
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
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[1rem] items-center justify-center bg-primary px-1 text-[8px] font-bold text-white leading-none" aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger button */}
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 text-text-base rounded-md hover:bg-border-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
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
                  strokeWidth={1.5}
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

      {/* Mobile/Tablet Menu panel (visible below lg) */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden border-t border-border-base bg-bg-base/95 backdrop-blur-md animate-fade-in shadow-sm"
          id="mobile-menu"
        >
          <nav className="space-y-1 px-6 py-4" aria-label="Mobile Navigation">
            {navItems.map((item) => {
              const isActive = isNavActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'block py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-2',
                    isActive ? 'text-primary' : 'text-text-secondary'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* Wishlist link in mobile/tablet menu */}
            <Link
              href="/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center justify-between py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-2',
                pathname === '/wishlist' ? 'text-primary' : 'text-text-secondary'
              )}
              aria-current={pathname === '/wishlist' ? 'page' : undefined}
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="flex h-4 min-w-[1rem] items-center justify-center bg-primary px-1 text-[8px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Bag link in mobile/tablet menu */}
            <Link
              href={APP_ROUTES.CART}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center justify-between py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-2',
                pathname === APP_ROUTES.CART ? 'text-primary' : 'text-text-secondary'
              )}
              aria-current={pathname === APP_ROUTES.CART ? 'page' : undefined}
            >
              <span>Bag</span>
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

