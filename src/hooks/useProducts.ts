import { useState, useEffect, useCallback } from 'react';
import { catalogService } from '@/services/api/catalog';
import {
  PublicProductListItem,
  CatalogPagination,
  ListProductsParams,
  ApiError,
} from '@/types/api';

interface FetchedState {
  products: PublicProductListItem[];
  pagination: CatalogPagination | null;
  error: string | null;
  /** Serialized params of the last completed fetch (success or error). */
  fetchedKey: string | null;
}

/**
 * Fetches a paginated list of products from the catalog API.
 * Re-fetches automatically whenever any query parameter changes.
 * Loading state is derived from whether the current params have been fetched yet.
 */
export function useProducts(params: ListProductsParams) {
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<FetchedState>({
    products: [],
    pagination: null,
    error: null,
    fetchedKey: null,
  });

  // Single stable key covering all params + manual retries
  const paramsKey = JSON.stringify({ ...params, retryCount });

  // isLoading is true until the current paramsKey has been fetched
  const isLoading = state.fetchedKey !== paramsKey;

  useEffect(() => {
    let cancelled = false;

    catalogService
      .listProducts(params)
      .then((res) => {
        if (!cancelled) {
          setState({
            products: res.data,
            pagination: res.pagination,
            error: null,
            fetchedKey: paramsKey,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message =
            err instanceof ApiError ? err.message : 'Failed to load products';
          setState((prev) => ({ ...prev, error: message, fetchedKey: paramsKey }));
        }
      });

    return () => {
      cancelled = true;
    };
    // paramsKey already encodes all relevant params + retryCount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const refetch = useCallback(() => setRetryCount((n) => n + 1), []);

  return {
    products: state.products,
    pagination: state.pagination,
    isLoading,
    error: state.error,
    refetch,
  };
}
