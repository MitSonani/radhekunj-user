import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Standardized empty state layout component.
 * Reformatted for premium fashion boutique editorial styles.
 */
export function EmptyState({
  title = 'No items found',
  description = 'There is no data to display at this time.',
  actionLabel,
  onActionClick,
  className,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex w-full min-h-[350px] flex-col items-center justify-center p-8 text-center animate-fade-in',
        className
      )}
    >
      {/* Icon Area */}
      <div className="mb-6 text-muted/65">
        {icon || (
          <svg
            className="mx-auto h-10 w-10 stroke-[1.2]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        )}
      </div>

      {/* Heading & Info - Serif titles */}
      <h3 className="font-serif text-xl font-normal text-text-base tracking-wide">{title}</h3>
      {description && (
        <p className="mt-2 text-xs text-muted max-w-xs leading-relaxed">{description}</p>
      )}

      {/* Action Button */}
      {actionLabel && onActionClick && (
        <div className="mt-8">
          <Button variant="primary" size="md" onClick={onActionClick}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
