import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

/**
 * Reusable Button component aligned with AURA's premium green brand system.
 * Features sharp corners (rounded-none), uppercase tracked text, and custom brand inversions.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-none font-medium uppercase tracking-[0.18em] transition-all duration-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 select-none border border-transparent',
          // Variants
          {
            // Primary Green (#164A35), Hovers to Dark Green (#0F3326)
            'bg-primary text-white border-primary hover:bg-primary-dark hover:border-primary-dark':
              variant === 'primary',
            // Soft Green background, Primary Green text, hovers to Medium Green
            'bg-green-soft text-primary border-green-soft hover:bg-primary hover:text-white hover:border-primary':
              variant === 'secondary',
            // Outline Primary Green
            'bg-transparent text-primary border-primary hover:bg-primary hover:text-white':
              variant === 'outline',
            // Clean text button with transition to primary green
            'bg-transparent text-text-secondary hover:text-primary border-none hover:underline underline-offset-4':
              variant === 'text',
            // Premium danger red style
            'bg-danger text-white border-danger hover:bg-danger-hover': variant === 'danger',
          },
          // Sizes
          {
            'px-4 py-2 text-[9px]': size === 'sm',
            'px-6 py-3 text-[10px]': size === 'md',
            'px-8 py-4 text-xs': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <svg
            className="mr-2.5 h-3.5 w-3.5 animate-spin text-current"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
