import { apiClient } from './apiClient';
import type { CartApiResponse, AddToCartPayload, UpdateCartItemPayload } from '@/types/cart';

/**
 * Service for the authenticated Cart API.
 * All endpoints require a valid JWT (sent automatically by apiClient via localStorage).
 *
 * Routes (all under /cart):
 *   GET    /cart                    → get current cart
 *   POST   /cart/items              → add item
 *   PATCH  /cart/items/:cartItemId  → update item quantity
 *   DELETE /cart/items/:cartItemId  → remove item
 *   DELETE /cart                    → clear cart
 */
export const cartService = {
  getCart: () =>
    apiClient.get<CartApiResponse>('/cart'),

  addItem: (payload: AddToCartPayload) =>
    apiClient.post<CartApiResponse>('/cart/items', payload),

  updateItem: (cartItemId: string, payload: UpdateCartItemPayload) =>
    apiClient.patch<CartApiResponse>(`/cart/items/${cartItemId}`, payload),

  removeItem: (cartItemId: string) =>
    apiClient.delete<CartApiResponse>(`/cart/items/${cartItemId}`),

  clearCart: () =>
    apiClient.delete<CartApiResponse>('/cart'),
};
