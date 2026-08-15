import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * Standardized error state component.
 * Reformatted for premium fashion boutique editorial styles.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while fetching information. Please check your network connection and try again.',
  onRetry,
  retryLabel = 'Try Again',
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex w-full min-h-[350px] flex-col items-center justify-center p-8 text-center animate-fade-in',
        className
      )}
      role="alert"
    >
      {/* Warning Icon */}
      <div className="mb-6 text-danger">
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
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      {/* Error Details - Serif titles */}
      <h3 className="font-serif text-xl font-normal text-text-base tracking-wide">{title}</h3>
      {message && <p className="mt-2 text-xs text-muted max-w-sm leading-relaxed">{message}</p>}

      {/* Optional Retry Button */}
      {onRetry && (
        <div className="mt-8">
          <Button
            variant="outline"
            className="border-danger text-danger hover:bg-danger hover:text-bg-base"
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
