/**
 * Global application constants.
 */
export const APP_ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  CATEGORY: (slug: string) => `/categories/${slug}`,
  CART: '/cart',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  ORDERS: '/orders',
};

export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  CART: '/cart',
  WISHLIST: '/wishlist',
  ORDERS: '/orders',
  PROFILE: '/users/profile',
};

export const SORT_LABELS: Record<string, string> = {
  newest: 'Newest',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
};

export const DEFAULT_TIMEOUT = 10000; // 10 seconds
