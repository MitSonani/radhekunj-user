import React from 'react';
import { cn } from '@/lib/utils';
import { PublicAttributeGroup, PublicVariant } from '@/types/api';
import { getAvailableValuesForAttribute } from '@/lib/product';

interface AttributeSelectorProps {
  groups: PublicAttributeGroup[];
  variants: PublicVariant[];
  selectedAttributes: Record<string, string>;
  onAttributeChange: (attributeId: string, valueId: string) => void;
}

/**
 * Renders attribute selectors (color swatches + text chips) for a product.
 * Marks values that are incompatible with the current selection as unavailable.
 */
export function AttributeSelector({
  groups,
  variants,
  selectedAttributes,
  onAttributeChange,
}: AttributeSelectorProps) {
  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const { attribute, values } = group;
        const isColor = attribute.slug === 'color';

        // Other selections (excluding the current attribute)
        const otherSelections = Object.fromEntries(
          Object.entries(selectedAttributes).filter(([id]) => id !== attribute.id),
        );
        const availableValueIds = getAvailableValuesForAttribute(
          variants,
          attribute.id,
          otherSelections,
        );

        const selectedValueId = selectedAttributes[attribute.id];

        return (
          <div key={attribute.id}>
            {/* Attribute label */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                {attribute.name}
              </span>
              {selectedValueId && (
                <span className="text-[9px] uppercase tracking-[0.15em] text-text-muted">
                  {values.find((v) => v.id === selectedValueId)?.value}
                </span>
              )}
            </div>

            {/* Options */}
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label={`Select ${attribute.name}`}
            >
              {values.map((val) => {
                const isSelected = selectedValueId === val.id;
                const isAvailable = availableValueIds.size === 0 || availableValueIds.has(val.id);

                if (isColor) {
                  // Color swatch
                  return (
                    <button
                      key={val.id}
                      type="button"
                      aria-label={`${val.value}${!isAvailable ? ' (unavailable)' : ''}`}
                      aria-pressed={isSelected}
                      disabled={!isAvailable}
                      onClick={() => isAvailable && onAttributeChange(attribute.id, val.id)}
                      className={cn(
                        'relative h-7 w-7 flex-shrink-0 rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                        isSelected
                          ? 'border-primary scale-110'
                          : 'border-border-base hover:border-text-secondary',
                        !isAvailable && 'opacity-30 cursor-not-allowed',
                      )}
                      style={{
                        backgroundColor: val.colorCode ?? undefined,
                        // Fallback background if no colorCode: readable neutral
                        background: val.colorCode ? val.colorCode : '#e8ece8',
                      }}
                    >
                      {/* Strikethrough diagonal for unavailable */}
                      {!isAvailable && (
                        <span
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          aria-hidden="true"
                        >
                          <span className="block w-full h-px bg-text-muted rotate-45 absolute" />
                        </span>
                      )}
                      {/* Checkmark for selected */}
                      {isSelected && (
                        <span
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          aria-hidden="true"
                        >
                          <svg
                            className="h-3 w-3 drop-shadow"
                            style={{ color: val.colorCode ? getContrastColor(val.colorCode) : '#164A35' }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                }

                // Text chip (size, material, etc.)
                return (
                  <button
                    key={val.id}
                    type="button"
                    aria-label={`${val.value}${!isAvailable ? ' (unavailable)' : ''}`}
                    aria-pressed={isSelected}
                    disabled={!isAvailable}
                    onClick={() => isAvailable && onAttributeChange(attribute.id, val.id)}
                    className={cn(
                      'relative px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                      isSelected
                        ? 'border-primary bg-primary text-white'
                        : isAvailable
                          ? 'border-border-base text-text-secondary hover:border-primary hover:text-primary'
                          : 'border-border-soft text-text-muted cursor-not-allowed opacity-40',
                    )}
                  >
                    {val.value}
                    {!isAvailable && (
                      <span
                        className="absolute inset-0 pointer-events-none"
                        aria-hidden="true"
                        style={{
                          background: 'repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Returns black or white depending on background luminance for the checkmark. */
function getContrastColor(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return '#ffffff';
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1c2822' : '#ffffff';
}
