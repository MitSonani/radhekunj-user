import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
  className?: string;
}

/**
 * Standardized loading state indicator.
 * Reformatted for premium fashion boutique editorial styles.
 */
export function LoadingState({
  message = 'Loading details...',
  fullPage = false,
  className,
}: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      {/* Editorial clean custom double-ring spinner */}
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-[2px] border-primary/10" />
        <div className="absolute inset-0 rounded-full border-[2px] border-t-primary animate-spin" />
      </div>
      {message && (
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted">{message}</p>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'flex items-center justify-center p-6',
        {
          'fixed inset-0 z-50 bg-background/90 backdrop-blur-sm h-screen w-screen': fullPage,
          'w-full min-h-[250px]': !fullPage,
        },
        className
      )}
      role="status"
      aria-live="polite"
    >
      {content}
    </div>
  );
}
