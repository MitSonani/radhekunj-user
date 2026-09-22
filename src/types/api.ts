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

export interface ApiValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Base structure of API error responses returned by the backend.
 */
export interface ApiErrorResponse {
  success?: boolean;
  message: string;
  requestId?: string;
  errors?: Record<string, string[]>;
  details?: ApiValidationErrorDetail[] | unknown;
  retryAfterSeconds?: number;
  stack?: string;
}

/**
 * Standard pagination wrapper matching Backend PaginationMeta contract.
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Custom error class to represent API failures.
 */
export class ApiError extends Error {
  statusCode: number;
  requestId?: string;
  errors?: Record<string, string[]>;
  details?: unknown;
  retryAfterSeconds?: number;

  constructor(
    statusCode: number,
    message: string,
    options?: {
      requestId?: string;
      errors?: Record<string, string[]>;
      details?: unknown;
      retryAfterSeconds?: number;
    } | Record<string, string[]>,
    legacyRetryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;

    if (options && !('errors' in options || 'requestId' in options || 'details' in options || 'retryAfterSeconds' in options)) {
      // Legacy positional call: (statusCode, message, errors, retryAfterSeconds)
      this.errors = options as Record<string, string[]>;
      this.retryAfterSeconds = legacyRetryAfterSeconds;
    } else if (options) {
      const opts = options as {
        requestId?: string;
        errors?: Record<string, string[]>;
        details?: unknown;
        retryAfterSeconds?: number;
      };
      this.requestId = opts.requestId;
      this.errors = opts.errors;
      this.details = opts.details;
      this.retryAfterSeconds = opts.retryAfterSeconds ?? legacyRetryAfterSeconds;
    }
  }
}
