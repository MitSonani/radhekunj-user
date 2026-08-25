import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  /** 'minimal' uses only a bottom border — suited for editorial/fashion auth forms */
  variant?: 'default' | 'minimal';
}

/**
 * Reusable Input component aligned with AURA's premium green brand system.
 * Features sharp edges (rounded-none), clean thin border transitions, and uppercase label text.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      disabled,
      type = 'text',
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const fallbackId = useId();
    const inputId = props.id || fallbackId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={cn('flex flex-col gap-2', { 'w-full': fullWidth })}>
        {/* Label - tiny uppercase letter-spaced in Secondary Text */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-[9px] font-semibold uppercase tracking-[0.15em] text-text-secondary select-none"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-danger" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input box - sharp edges, transitions focus to brand green */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              cn(error ? errorId : undefined, helperText ? helperId : undefined) || undefined
            }
            className={cn(
              'w-full rounded-none text-xs text-text-base transition-colors duration-200 placeholder:text-text-muted/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40',
              variant === 'default' && [
                'border border-border-base bg-surface px-4 py-3 focus-visible:border-primary disabled:bg-border-soft',
                error && 'border-danger focus-visible:border-danger',
              ],
              variant === 'minimal' && [
                'border-b border-border-base bg-transparent px-0 py-3 focus-visible:border-b-primary',
                error && 'border-b-danger focus-visible:border-b-danger',
              ],
              className
            )}
            {...props}
          />
        </div>

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="text-[10px] uppercase tracking-wide font-medium text-danger animate-fade-in"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <p id={helperId} className="text-[10px] text-text-muted italic">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
