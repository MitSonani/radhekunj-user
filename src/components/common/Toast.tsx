'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error';
  /** Duration in ms before auto-dismiss. Set to 0 to disable. */
  duration?: number;
  onDismiss?: () => void;
}

/**
 * Minimal inline toast notification aligned with the AURA brand system.
 * Fades in from the bottom-center of the viewport.
 */
export function Toast({ message, type = 'info', duration = 3000, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on mount
    const enter = requestAnimationFrame(() => setVisible(true));

    let exit: ReturnType<typeof setTimeout>;
    if (duration > 0) {
      exit = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDismiss?.(), 300);
      }, duration);
    }

    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(exit);
    };
  }, [duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed top-6 right-6 z-50 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
        {
          'bg-text-base text-bg-base': type === 'info',
          'bg-primary text-white': type === 'success',
          'bg-danger text-white': type === 'error',
        }
      )}
    >
      {message}
    </div>
  );
}
