import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: 'div' | 'section' | 'main';
}

/**
 * Standard container that enforces maximum width, centering, and responsive side-paddings.
 * Reused across all consumer-facing pages.
 */
export function PageContainer({
  children,
  className,
  as: Component = 'div',
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </Component>
  );
}
