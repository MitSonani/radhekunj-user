import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Reusable countdown timer for OTP resend cooldown.
 *
 * - Starts automatically from `initialSeconds` on mount.
 * - `startCountdown(n)` resets and re-starts the timer with a new value —
 *   use this after a successful resend or when the backend returns 429 with
 *   `retryAfterSeconds` so the UI stays in sync with the server's cooldown.
 * - The interval is cleared on unmount to prevent memory leaks.
 * - Only one interval is ever active at a time (old one is cleared before
 *   starting a new one).
 */
export function useOtpCountdown(initialSeconds: number) {
  const [countdown, setCountdown] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((seconds: number) => {
    // Always clear any existing interval before starting a new one
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setCountdown(seconds);

    if (seconds <= 0) return;

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Auto-start on mount; clean up on unmount
  useEffect(() => {
    startCountdown(initialSeconds);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
    // Only run once on mount — intentionally omitting deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { countdown, startCountdown };
}
