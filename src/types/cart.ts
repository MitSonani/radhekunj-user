/**
 * Cart types matching the Backend CartResponse contract exactly.
 * Source of truth: backend/src/modules/cart/service.ts
 */

export type CartAttributeSummary = {
  id: string;
  name: string;
  slug: string;
};

export type CartAttributeValue = {
  id: string;
  attributeId: string;
  value: string;
  slug: string;
  colorCode: string | null;
  attribute: CartAttributeSummary;
};

export type CartItemAttribute = {
  id: string;
  attributeValueId: string;
  attributeValue: CartAttributeValue;
};

export type CartItemImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
} | null;

export type CartItemVariant = {
  id: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  status: string;
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
  attributes: CartItemAttribute[];
  image: CartItemImage;
  /** true when variant is active, product is active, and stock > 0 */
  isAvailable: boolean;
  /** true when cart quantity exceeds currently available stock */
  stockWarning: boolean;
};

export type CartItem = {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: CartItemVariant;
  createdAt: string;
  updatedAt: string;
};

export type Cart = {
  id: string | null;
  items: CartItem[];
  /** Number of unique line items */
  itemsCount: number;
  /** Sum of all item quantities */
  totalQuantity: number;
  /** Authoritative subtotal calculated from current variant prices */
  subtotal: string;
};

export interface CartApiResponse {
  success: boolean;
  message?: string;
  data: Cart;
}

export interface AddToCartPayload {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
