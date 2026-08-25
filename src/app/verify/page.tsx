'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/layout';
import { Button, LoadingState } from '@/components/common';
import { authService } from '@/services/api';
import { ApiError } from '@/types/api';
import { useOtpCountdown } from '@/hooks/useOtpCountdown';
import { cn } from '@/lib/utils';

const OTP_LENGTH = 6;
const INITIAL_COOLDOWN = 60;

/**
 * Handles OTP verification form and submission.
 */
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const phone = searchParams.get('phone') || '';
  const countryCode = searchParams.get('countryCode') || '';
  const name = searchParams.get('name') || '';
  const redirectTo = searchParams.get('redirect') || '/';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const { countdown, startCountdown } = useOtpCountdown(INITIAL_COOLDOWN);
  const canResend = countdown === 0;

  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect to login if phone param is missing
  useEffect(() => {
    if (!phone) router.replace('/login');
  }, [phone, router]);

  // Focus first digit box on mount
  useEffect(() => {
    digitRefs.current[0]?.focus();
  }, []);

  const otpValue = digits.join('');

  const handleDigitChange = (raw: string, index: number) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setValidationError(null);

    if (digit && index < OTP_LENGTH - 1) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        digitRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);

    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    digitRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);
    setApiSuccess(null);

    if (otpValue.length !== OTP_LENGTH) {
      setValidationError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyOtp({
        countryCode: countryCode || undefined,
        mobileNumber: phone,
        otp: otpValue,
        name: name || undefined,
      });

      if (response.success && response.data) {
        setApiSuccess('Welcome back.');

        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_profile', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('auth_change'));

        setTimeout(() => router.replace(redirectTo), 200);
      } else {
        setApiError(response.message || 'Verification failed');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
          setApiError('That code didn\'t work. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    // Guard: prevent duplicate requests
    if (!canResend || isResending) return;

    setApiError(null);
    setApiSuccess(null);
    setValidationError(null);
    setIsResending(true);

    try {
      const response = await authService.sendOtp({
        countryCode: countryCode || undefined,
        mobileNumber: phone,
      });

      if (response.success) {
        // Clear digits and restart cooldown from the top
        setDigits(Array(OTP_LENGTH).fill(''));
        startCountdown(INITIAL_COOLDOWN);
        digitRefs.current[0]?.focus();
        setApiSuccess('A fresh code is on its way.');

        if (response.data?.otp) {
          console.log(`[AURA DEV NOTICE] Resent OTP for testing: ${response.data.otp}`);
        }
      } else {
        setApiError(response.message || 'Failed to resend code');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 429) {
          // Backend is still rate-limiting — sync our countdown to its remaining seconds
          const remaining = err.retryAfterSeconds ?? INITIAL_COOLDOWN;
          startCountdown(remaining);
          // No error toast: the countdown updating is the UX signal
        } else {
          setApiError(err.message);
        }
      } else {
        setApiError('Failed to resend. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const maskedPhone =
    phone.length > 5
      ? `${phone.slice(0, -5).replace(/\d/g, '·')}${phone.slice(-5)}`
      : phone;

  return (
    <AuthLayout subtitle={`Your code was sent to ${countryCode} ${maskedPhone}`}>
      <form onSubmit={handleVerify} className="flex flex-col gap-7">
        {/* OTP digit boxes */}
        <div className="flex flex-col gap-3">
          <label className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-secondary select-none">
            Verification Code
          </label>

          <div className="flex gap-2 sm:gap-3" role="group" aria-label="One-time password">
            {Array.from({ length: OTP_LENGTH }, (_, i) => (
              <input
                key={i}
                ref={(el) => {
                  digitRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digits[i]}
                onChange={(e) => handleDigitChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={i === 0 ? handlePaste : undefined}
                onFocus={(e) => e.target.select()}
                disabled={isLoading}
                aria-label={`Digit ${i + 1}`}
                className={cn(
                  'w-10 sm:w-11 h-12 text-center text-base font-mono bg-transparent border-b-2 transition-colors duration-200 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed',
                  validationError
                    ? 'border-danger text-danger'
                    : digits[i]
                      ? 'border-primary text-text-base'
                      : 'border-border-base text-text-base focus-visible:border-primary',
                )}
              />
            ))}
          </div>

          {validationError && (
            <p
              className="text-[10px] uppercase tracking-wide font-medium text-danger animate-fade-in"
              role="alert"
            >
              {validationError}
            </p>
          )}
        </div>

        {/* API error */}
        {apiError && (
          <p
            className="text-[10px] uppercase tracking-wider font-medium text-danger text-center animate-fade-in"
            role="alert"
          >
            {apiError}
          </p>
        )}

        {/* API success */}
        {apiSuccess && (
          <p
            className="text-[10px] uppercase tracking-wider font-medium text-primary text-center animate-fade-in"
            role="status"
          >
            {apiSuccess}
          </p>
        )}

        <Button variant="primary" type="submit" size="md" isLoading={isLoading} className="w-full">
          {isLoading ? 'One moment…' : 'Confirm'}
        </Button>
      </form>

      {/* Resend + change number */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[9px] uppercase tracking-[0.12em] text-text-muted">
            Didn&apos;t receive the code?
          </p>

          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              aria-busy={isResending}
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-base hover:text-primary transition-colors focus-visible:outline-none disabled:opacity-40"
            >
              {isResending ? 'Sending…' : 'Send Again'}
            </button>
          ) : (
            <p
              className="text-[10px] uppercase tracking-[0.1em] text-text-muted"
              aria-live="polite"
              aria-label={`Resend available in ${countdown} seconds`}
            >
              Resend in{' '}
              <span className="font-semibold text-text-secondary tabular-nums">{countdown}s</span>
            </p>
          )}
        </div>

        <Link
          href="/login"
          className="text-[9px] uppercase tracking-[0.12em] text-text-muted hover:text-text-base transition-colors focus-visible:outline-none"
        >
          Change Number
        </Link>
      </div>
    </AuthLayout>
  );
}

/**
 * OTP verification page — wrapped in Suspense to safely read searchParams.
 */
export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading…" />}>
      <VerifyContent />
    </Suspense>
  );
}
