'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ProductSortOption, FilterOptionsResponse } from '@/types/api';
import { SORT_LABELS } from '@/constants';

export interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: ProductSortOption;
  onSortChange: (value: ProductSortOption) => void;
  totalCount?: number;
  className?: string;

  // Dynamic filter options & active selections
  filterOptions?: FilterOptionsResponse | null;
  minPrice?: string;
  maxPrice?: string;
  color?: string;
  size?: string;
  inStock?: boolean;
  categorySlug?: string;
  isCategoryPage?: boolean;
  onFilterChange: (updates: Record<string, string | null>) => void;
  onClearAllFilters: () => void;
}

const SORT_OPTIONS: ProductSortOption[] = ['newest', 'price_asc', 'price_desc'];

export function ProductFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  totalCount,
  className,
  filterOptions,
  minPrice = '',
  maxPrice = '',
  color = '',
  size = '',
  inStock = false,
  categorySlug = '',
  isCategoryPage = false,
  onFilterChange,
  onClearAllFilters,
}: ProductFiltersProps) {
  const [inputValue, setInputValue] = useState(search);
  const [isOpen, setIsOpen] = useState(false);

  // Local price input state
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [priceError, setPriceError] = useState<string | null>(null);

  // React derived state during render
  const [prevSearch, setPrevSearch] = useState(search);
  if (prevSearch !== search) {
    setPrevSearch(search);
    setInputValue(search);
  }

  const [prevPrices, setPrevPrices] = useState({ minPrice, maxPrice });
  if (prevPrices.minPrice !== minPrice || prevPrices.maxPrice !== maxPrice) {
    setPrevPrices({ minPrice, maxPrice });
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
    setPriceError(null);
  }

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (inputValue === search) return;
    debounceRef.current = setTimeout(() => {
      onSearchChange(inputValue);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, search, onSearchChange]);

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const minNum = localMinPrice ? parseFloat(localMinPrice) : undefined;
    const maxNum = localMaxPrice ? parseFloat(localMaxPrice) : undefined;

    if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
      setPriceError('Min price cannot be greater than Max price');
      return;
    }

    setPriceError(null);
    onFilterChange({
      minPrice: localMinPrice || null,
      maxPrice: localMaxPrice || null,
    });
  };

  // Count active filters
  let activeFilterCount = 0;
  if (minPrice || maxPrice) activeFilterCount++;
  if (color) activeFilterCount++;
  if (size) activeFilterCount++;
  if (inStock) activeFilterCount++;
  if (categorySlug && !isCategoryPage) activeFilterCount++;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-soft pb-4">
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

        {/* Right Actions: Filter Toggle, Count, Sort */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              'inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors',
              isOpen || activeFilterCount > 0
                ? 'border-primary text-primary bg-primary/5'
                : 'border-border-base text-text-base hover:border-primary',
            )}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
            <svg
              className={cn('h-3 w-3 transition-transform duration-200', isOpen ? 'rotate-180' : '')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

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

      {/* Expanded Filter Panel */}
      {isOpen && (
        <div className="p-6 bg-surface border border-border-soft flex flex-col gap-6 shadow-sm transition-all duration-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Price Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-base">
                Price Range (₹)
              </span>
              <form onSubmit={handleApplyPrice} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder={filterOptions?.priceRange?.min ? `Min: ${filterOptions.priceRange.min}` : 'Min'}
                    value={localMinPrice}
                    onChange={(e) => {
                      setLocalMinPrice(e.target.value);
                      if (priceError) setPriceError(null);
                    }}
                    className="w-full border border-border-base bg-bg-base px-2.5 py-1.5 text-xs text-text-base focus:outline-none focus:border-primary"
                  />
                  <span className="text-text-muted text-xs">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder={filterOptions?.priceRange?.max ? `Max: ${filterOptions.priceRange.max}` : 'Max'}
                    value={localMaxPrice}
                    onChange={(e) => {
                      setLocalMaxPrice(e.target.value);
                      if (priceError) setPriceError(null);
                    }}
                    className="w-full border border-border-base bg-bg-base px-2.5 py-1.5 text-xs text-text-base focus:outline-none focus:border-primary"
                  />
                </div>

                {priceError && (
                  <span className="text-[10px] text-danger">{priceError}</span>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-text-base text-bg-base text-[10px] font-semibold uppercase tracking-wider hover:bg-primary transition-colors"
                  >
                    Apply
                  </button>
                  {(minPrice || maxPrice) && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalMinPrice('');
                        setLocalMaxPrice('');
                        onFilterChange({ minPrice: null, maxPrice: null });
                      }}
                      className="text-[10px] uppercase font-semibold text-text-muted hover:text-danger"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Color Filter */}
            {filterOptions?.colors && filterOptions.colors.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-base">
                  Color
                </span>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.colors.map((c) => {
                    const isSelected = color.toLowerCase() === c.slug.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          onFilterChange({ color: isSelected ? null : c.slug })
                        }
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 border text-[10px] uppercase tracking-wider transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-border-base bg-bg-base text-text-base hover:border-primary',
                        )}
                      >
                        {c.colorCode && (
                          <span
                            className="h-2.5 w-2.5 rounded-full border border-border-soft"
                            style={{ backgroundColor: c.colorCode }}
                          />
                        )}
                        <span>{c.value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Filter */}
            {filterOptions?.sizes && filterOptions.sizes.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-base">
                  Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.sizes.map((s) => {
                    const isSelected = size.toLowerCase() === s.slug.toLowerCase();
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          onFilterChange({ size: isSelected ? null : s.slug })
                        }
                        className={cn(
                          'min-w-[32px] px-2 py-1 border text-[10px] font-semibold uppercase text-center transition-colors',
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-border-base bg-bg-base text-text-base hover:border-primary',
                        )}
                      >
                        {s.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Availability & Category */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-base">
                  Availability
                </span>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-text-base">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) =>
                      onFilterChange({ inStock: e.target.checked ? 'true' : null })
                    }
                    className="h-3.5 w-3.5 text-primary border-border-base focus:ring-primary"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              {!isCategoryPage && filterOptions?.categories && filterOptions.categories.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-base">
                    Category
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {filterOptions.categories.map((cat) => {
                      const isSelected = categorySlug.toLowerCase() === cat.slug.toLowerCase();
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            onFilterChange({ categorySlug: isSelected ? null : cat.slug })
                          }
                          className={cn(
                            'px-2 py-0.5 border text-[9px] uppercase tracking-wider transition-colors',
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-border-base bg-bg-base text-text-base hover:border-primary',
                          )}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips Bar */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
            Active:
          </span>

          {minPrice && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-bg-soft border border-border-soft text-[10px] text-text-base">
              <span>Min: ₹{minPrice}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ minPrice: null })}
                className="hover:text-danger"
              >
                ✕
              </button>
            </span>
          )}

          {maxPrice && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-bg-soft border border-border-soft text-[10px] text-text-base">
              <span>Max: ₹{maxPrice}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ maxPrice: null })}
                className="hover:text-danger"
              >
                ✕
              </button>
            </span>
          )}

          {color && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-bg-soft border border-border-soft text-[10px] text-text-base capitalize">
              <span>Color: {color}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ color: null })}
                className="hover:text-danger"
              >
                ✕
              </button>
            </span>
          )}

          {size && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-bg-soft border border-border-soft text-[10px] text-text-base uppercase">
              <span>Size: {size}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ size: null })}
                className="hover:text-danger"
              >
                ✕
              </button>
            </span>
          )}

          {inStock && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-bg-soft border border-border-soft text-[10px] text-text-base">
              <span>In Stock Only</span>
              <button
                type="button"
                onClick={() => onFilterChange({ inStock: null })}
                className="hover:text-danger"
              >
                ✕
              </button>
            </span>
          )}

          {categorySlug && !isCategoryPage && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-bg-soft border border-border-soft text-[10px] text-text-base capitalize">
              <span>Category: {categorySlug}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ categorySlug: null })}
                className="hover:text-danger"
              >
                ✕
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onClearAllFilters}
            className="text-[9px] font-semibold uppercase tracking-wider text-danger hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
