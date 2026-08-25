// ─── Catalog public types ─────────────────────────────────────────────────────

/** Pagination envelope returned by GET /products */
export interface CatalogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CatalogListResponse<T> {
  success: boolean;
  data: T[];
  pagination: CatalogPagination;
}

export interface CatalogDetailResponse<T> {
  success: boolean;
  data: T;
}

export interface PublicCategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface PublicAttributeSummary {
  id: string;
  name: string;
  slug: string;
}

export interface PublicAttributeValueSummary {
  id: string;
  value: string;
  slug: string;
  colorCode: string | null;
}

/** One product image. `attributeValueId === null` means generic; otherwise color-specific. */
export interface PublicImageItem {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  attributeValueId: string | null;
  attributeValue:
    | (PublicAttributeValueSummary & { attribute: PublicAttributeSummary })
    | null;
}

export type VariantAvailability = 'IN_STOCK' | 'OUT_OF_STOCK';

export interface PublicVariant {
  id: string;
  price: string;
  compareAtPrice: string | null;
  availability: VariantAvailability;
  attributes: Array<{
    attribute: PublicAttributeSummary;
    attributeValue: PublicAttributeValueSummary;
  }>;
}

/** Deduped attribute + values derived from ACTIVE variants only */
export interface PublicAttributeGroup {
  attribute: PublicAttributeSummary;
  values: PublicAttributeValueSummary[];
}

/** Shape returned in GET /products list */
export interface PublicProductListItem {
  id: string;
  name: string;
  slug: string;
  price: string;
  category: PublicCategorySummary;
  primaryImage: PublicImageItem | null;
}

/** Shape returned in GET /products/:slug detail */
export interface PublicProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  category: PublicCategorySummary;
  images: PublicImageItem[];
  variants: PublicVariant[];
  availableOptions: PublicAttributeGroup[];
}

export type ProductSortOption = 'newest' | 'price_asc' | 'price_desc';

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  sort?: ProductSortOption;
}

// ─── Generic API types ────────────────────────────────────────────────────────

/**
 * Base structure of API error responses returned by the backend.
 * `retryAfterSeconds` is included on 429 Too Many Requests responses.
 */
export interface ApiErrorResponse {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
  retryAfterSeconds?: number;
  stack?: string; // Only populated in development environment
}

/**
 * Standard pagination wrapper for API listing endpoints.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Custom error class to represent API failures.
 * `retryAfterSeconds` is populated when the backend returns 429 Too Many Requests.
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;
  retryAfterSeconds?: number;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
