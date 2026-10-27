import { apiClient } from './apiClient';
import {
  CatalogListResponse,
  CatalogDetailResponse,
  PublicProductListItem,
  PublicProductDetail,
  ListProductsParams,
  PublicCategoryItem,
  FilterOptionsResponse,
} from '@/types/api';

export interface ListCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Service for the public customer-facing catalog API.
 * Endpoints: GET /products, GET /products/:slug
 */
export const catalogService = {
  listProducts: (params?: ListProductsParams) => {
    const query: Record<string, string | number | boolean> = {};
    if (params?.page !== undefined) query.page = params.page;
    if (params?.limit !== undefined) query.limit = params.limit;
    if (params?.search) query.search = params.search;
    if (params?.categorySlug) query.categorySlug = params.categorySlug;
    if (params?.sort) query.sort = params.sort;
    if (params?.minPrice !== undefined) query.minPrice = params.minPrice;
    if (params?.maxPrice !== undefined) query.maxPrice = params.maxPrice;
    if (params?.color) query.color = params.color;
    if (params?.size) query.size = params.size;
    if (params?.inStock !== undefined) query.inStock = params.inStock;

    return apiClient.get<CatalogListResponse<PublicProductListItem>>('/products', {
      params: Object.keys(query).length ? query : undefined,
    });
  },

  listCategories: (params?: ListCategoriesParams) => {
    const query: Record<string, string | number | boolean> = {};
    if (params?.page !== undefined) query.page = params.page;
    if (params?.limit !== undefined) query.limit = params.limit;
    if (params?.search) query.search = params.search;

    return apiClient.get<CatalogListResponse<PublicCategoryItem>>("/categories", {
      params: Object.keys(query).length ? query : undefined,
    });
  },

  getProduct: (slug: string) =>
    apiClient.get<CatalogDetailResponse<PublicProductDetail>>(`/products/${encodeURIComponent(slug)}`),

  getFilterOptions: () =>
    apiClient.get<{ success: boolean; data: FilterOptionsResponse }>('/products/filters'),
};

export type { PublicCategoryItem };
