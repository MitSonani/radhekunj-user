'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/layout';
import { Button, LoadingState, Toast, CountryCodeSelect } from '@/components/common';
import { authService } from '@/services/api';
import { ApiError } from '@/types/api';
import { useOtpCountdown } from '@/hooks/useOtpCountdown';
import { cn } from '@/lib/utils';

/**
 * Inner login form. Separated to safely use useSearchParams inside Suspense.
 */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectToast, setRedirectToast] = useState(false);

  const { countdown, startCountdown } = useOtpCountdown(0);
  const isRateLimited = countdown > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setApiError(null);

    const digitsOnly = mobileNumber.replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length < 4) {
      setValidationError('Please enter a valid mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.sendOtp({
        countryCode: countryCode.trim(),
        mobileNumber: digitsOnly,
      });

      if (response.success) {
        if (response.data?.otp) {
          console.log(`[AURA DEV NOTICE] Generated OTP for testing: ${response.data.otp}`);
        }

        // If the number is not registered, show a toast then redirect to signup
        if (response.data?.isNewUser) {
          setIsLoading(false);
          setRedirectToast(true);
          // otpSent=true tells signup to skip sendOtp — the OTP was already dispatched here
          const signupParams = new URLSearchParams({
            phone: digitsOnly,
            countryCode: countryCode.trim(),
            otpSent: 'true',
          });
          setTimeout(() => router.push(`/signup?${signupParams.toString()}`), 200);
          return;
        }

        const queryParams = new URLSearchParams({
          phone: digitsOnly,
          countryCode: countryCode.trim(),
          redirect: redirectTo,
        });
        router.push(`/verify?${queryParams.toString()}`);
      } else {
        setApiError(response.message || 'Failed to send verification code');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 429) {
          startCountdown(err.retryAfterSeconds ?? 60);
        } else {
          setApiError(err.message);
        }
      } else {
        setApiError('A network error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {redirectToast && (
        <Toast
          message="Number not registered — redirecting to sign up"
          type="info"
          duration={1800}
        />
      )}
      <AuthLayout>
        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {/* Combined phone number row with shared bottom border */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-secondary select-none">
              Mobile Number <span className="text-danger" aria-hidden="true">*</span>
            </label>

            <div
              className={cn(
                'flex items-center border-b pb-2 transition-colors duration-200',
                validationError
                  ? 'border-danger'
                  : isFocused
                    ? 'border-primary'
                    : 'border-border-base'
              )}
            >
              {/* Country code dropdown */}
              <CountryCodeSelect
                value={countryCode}
                onChange={setCountryCode}
                disabled={isLoading}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-14 shrink-0"
              />

              {/* Thin vertical separator */}
              <span className="text-border-base select-none px-2 text-lg leading-none" aria-hidden="true">
                |
              </span>

              {/* Mobile number */}
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading}
                inputMode="numeric"
                placeholder="Mobile number"
                aria-label="Mobile number"
                aria-invalid={!!validationError}
                aria-describedby={validationError ? 'phone-error' : undefined}
                className="flex-grow bg-transparent border-0 outline-none text-xs text-text-base py-1 placeholder:text-text-muted/60 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {validationError && (
              <p
                id="phone-error"
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

          {/* Rate-limit cooldown */}
          {isRateLimited && (
            <p
              className="text-[10px] uppercase tracking-[0.12em] text-text-muted text-center animate-fade-in"
              aria-live="polite"
              aria-label={`Please wait ${countdown} seconds before requesting another code`}
            >
              Please wait{' '}
              <span className="font-semibold text-text-secondary tabular-nums">{countdown}s</span>
              {' '}before trying again
            </p>
          )}

          <Button
            variant="primary"
            type="submit"
            size="md"
            isLoading={isLoading}
            disabled={isRateLimited}
            className="w-full"
          >
            {isLoading ? 'One moment…' : 'Continue'}
          </Button>
        </form>

        {/* Create account link */}
        <div className="text-center pt-1">
          <p className="text-[10px] text-text-muted uppercase tracking-[0.12em]">
            New to Aura?{' '}
            <Link
              href="/signup"
              className="text-text-base font-semibold hover:text-primary transition-colors underline-offset-4 hover:underline focus-visible:outline-none"
            >
              Create Account
            </Link>
          </p>
        </div>
      </AuthLayout>
    </>
  );
}

/**
 * Customer Login Page — wrapped in Suspense to safely read searchParams.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading…" />}>
      <LoginContent />
    </Suspense>
  );
}
