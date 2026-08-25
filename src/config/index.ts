const isServer = typeof window === 'undefined';

/**
 * Application environment configurations.
 * Handles server and client environment parameters.
 */
export const config = {
  apiUrl: isServer
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1')
    : '/api/v1',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
