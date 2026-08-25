import React from 'react';
import { cn } from '@/lib/utils';

interface ProductPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Minimal editorial pagination for the product listing.
 * Shows prev / next and a small window of page numbers.
 */
export function ProductPagination({
  page,
  totalPages,
  onPageChange,
  className,
}: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  // Build visible page numbers (up to 5 around current)
  const pages: (number | 'ellipsis')[] = [];
  const delta = 2;
  const left = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  if (left > 1) {
    pages.push(1);
    if (left > 2) pages.push('ellipsis');
  }
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages) {
    if (right < totalPages - 1) pages.push('ellipsis');
    pages.push(totalPages);
  }

  const btnBase =
    'inline-flex items-center justify-center h-8 min-w-8 px-2 text-[10px] uppercase tracking-[0.1em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary';

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1 mt-12', className)}
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={cn(
          btnBase,
          'border border-border-base text-text-secondary hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed',
        )}
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-text-muted text-[10px]">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              btnBase,
              'border',
              p === page
                ? 'border-primary bg-primary text-white cursor-default'
                : 'border-border-base text-text-secondary hover:border-primary hover:text-primary',
            )}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={cn(
          btnBase,
          'border border-border-base text-text-secondary hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed',
        )}
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </nav>
  );
}
