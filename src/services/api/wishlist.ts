import { apiClient } from './apiClient';
import type {
  WishlistApiResponse,
  AddToWishlistPayload,
  AddToWishlistApiResponse,
  RemoveFromWishlistApiResponse,
  WishlistCheckApiResponse,
} from '@/types/wishlist';

/**
 * Service for the authenticated Wishlist API.
 * All endpoints require a valid JWT (sent automatically by apiClient via localStorage).
 *
 * Routes (all under /wishlist):
 *   GET    /wishlist                     → get user's wishlist
 *   POST   /wishlist                     → add product to wishlist
 *   DELETE /wishlist/:productId          → remove product from wishlist
 *   GET    /wishlist/:productId/check    → check if product is wishlisted
 */
export const wishlistService = {
  getWishlist: () =>
    apiClient.get<WishlistApiResponse>('/wishlist'),

  addToWishlist: (payload: AddToWishlistPayload) =>
    apiClient.post<AddToWishlistApiResponse>('/wishlist', payload),

  removeFromWishlist: (productId: string) =>
    apiClient.delete<RemoveFromWishlistApiResponse>(`/wishlist/${productId}`),

  checkWishlistStatus: (productId: string) =>
    apiClient.get<WishlistCheckApiResponse>(`/wishlist/${productId}/check`),
};
