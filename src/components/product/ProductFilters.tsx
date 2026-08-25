'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ProductSortOption } from '@/types/api';
import { SORT_LABELS } from '@/constants';

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: ProductSortOption;
  onSortChange: (value: ProductSortOption) => void;
  totalCount?: number;
  className?: string;
}

const SORT_OPTIONS: ProductSortOption[] = ['newest', 'price_asc', 'price_desc'];

/**
 * Search input (with 400 ms debounce) and sort dropdown for the product listing.
 * Debounce is handled internally — parent receives the settled value.
 */
export function ProductFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  totalCount,
  className,
}: ProductFiltersProps) {
  const [inputValue, setInputValue] = useState(search);

  // React "derived state on prop change" pattern — runs during render, not in an effect.
  // If search changed externally (e.g. "Clear Search"), bring the input in sync.
  const [prevSearch, setPrevSearch] = useState(search);
  if (prevSearch !== search) {
    setPrevSearch(search);
    setInputValue(search);
  }

  // Track whether the debounce timer is "ours" so we don't double-fire on sync
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce: push value to parent 400 ms after user stops typing
  useEffect(() => {
    if (inputValue === search) return;
    debounceRef.current = setTimeout(() => {
      onSearchChange(inputValue);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // onSearchChange identity is stable (useCallback in parent); search intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, onSearchChange]);

  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
        </div>
        <input
          id="product-search"
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search products..."
          className="w-full border-b border-border-base bg-transparent pl-6 pr-3 py-2 text-xs text-text-base placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors duration-200"
        />
        {inputValue && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setInputValue('');
              onSearchChange('');
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-base transition-colors"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Count */}
        {totalCount !== undefined && (
          <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted whitespace-nowrap">
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </span>
        )}

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="product-sort"
            className="text-[9px] uppercase tracking-[0.15em] text-text-muted whitespace-nowrap"
          >
            Sort
          </label>
          <div className="relative">
            <select
              id="product-sort"
              value={sort}
              onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
              className="appearance-none border-b border-border-base bg-transparent pr-5 py-1 text-[10px] uppercase tracking-[0.1em] text-text-base focus:outline-none focus:border-primary transition-colors duration-200 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {SORT_LABELS[opt]}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-text-muted"
              viewBox="0 0 10 6"
              fill="none"
              aria-hidden="true"
            >
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
