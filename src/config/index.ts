/**
 * Application environment configurations.
 * Both server-side and client-side use the same backend URL directly.
 * Set NEXT_PUBLIC_API_URL in .env.local to override (e.g. staging/production).
 */
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
