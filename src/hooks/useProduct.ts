import { useState, useEffect, useCallback } from 'react';
import { catalogService } from '@/services/api/catalog';
import { PublicProductDetail, ApiError } from '@/types/api';

interface FetchedState {
  product: PublicProductDetail | null;
  error: string | null;
  notFound: boolean;
  /** Slug + retry for which the last fetch completed. */
  fetchedKey: string | null;
}

/**
 * Fetches a single product by slug from the catalog API.
 * Loading state is derived: true when the current slug hasn't been fetched yet.
 */
export function useProduct(slug: string) {
  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<FetchedState>({
    product: null,
    error: null,
    notFound: false,
    fetchedKey: null,
  });

  const fetchKey = `${slug}::${retryCount}`;
  const isLoading = Boolean(slug) && state.fetchedKey !== fetchKey;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    catalogService
      .getProduct(slug)
      .then((res) => {
        if (!cancelled) {
          setState({ product: res.data, error: null, notFound: false, fetchedKey: fetchKey });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const isNotFound = err instanceof ApiError && err.statusCode === 404;
          const message = isNotFound
            ? 'This product could not be found.'
            : err instanceof ApiError
              ? err.message
              : 'Failed to load product';
          setState({ product: null, error: message, notFound: isNotFound, fetchedKey: fetchKey });
        }
      });

    return () => {
      cancelled = true;
    };
    // fetchKey already encodes slug + retryCount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  const refetch = useCallback(() => setRetryCount((n) => n + 1), []);

  return {
    product: state.product,
    isLoading,
    error: state.error,
    notFound: state.notFound,
    refetch,
  };
}
