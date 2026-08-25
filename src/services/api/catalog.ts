import { apiClient } from './apiClient';
import {
  CatalogListResponse,
  CatalogDetailResponse,
  PublicProductListItem,
  PublicProductDetail,
  ListProductsParams,
} from '@/types/api';

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

    return apiClient.get<CatalogListResponse<PublicProductListItem>>('/products', {
      params: Object.keys(query).length ? query : undefined,
    });
  },

  getProduct: (slug: string) =>
    apiClient.get<CatalogDetailResponse<PublicProductDetail>>(`/products/${encodeURIComponent(slug)}`),
};
