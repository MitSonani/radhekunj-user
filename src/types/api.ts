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
