// ─── Wishlist API types ───────────────────────────────────────────────────────

export interface WishlistProductImage {
  id: string;
  url: string;
  altText: string | null;
}

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  primaryImage: WishlistProductImage | null;
  isAvailable: boolean;
  status: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: WishlistProduct;
  createdAt: string;
}

export interface WishlistData {
  items: WishlistItem[];
  count: number;
}

export interface WishlistApiResponse {
  success: boolean;
  data: WishlistData;
}

export interface AddToWishlistPayload {
  productId: string;
}

export interface AddToWishlistResult {
  id: string;
  productId: string;
  createdAt: string;
}

export interface AddToWishlistApiResponse {
  success: boolean;
  data: AddToWishlistResult;
  message: string;
}

export interface RemoveFromWishlistApiResponse {
  success: boolean;
  message: string;
}

export interface WishlistCheckApiResponse {
  success: boolean;
  data: { isWishlisted: boolean };
}
