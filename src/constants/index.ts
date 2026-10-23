/**
 * Global application constants.
 */
export const APP_ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  CATEGORY: (slug: string) => `/categories/${slug}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  ADDRESSES: '/profile/addresses',
  ORDERS: '/orders',
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
};

export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  CART: '/cart',
  WISHLIST: '/wishlist',
  ADDRESSES: '/addresses',
  ORDERS: '/orders',
  PROFILE: '/users/profile',
};

export const SORT_LABELS: Record<string, string> = {
  newest: 'Newest',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
};

export const DEFAULT_TIMEOUT = 10000; // 10 seconds
