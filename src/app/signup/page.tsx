'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/layout';
import { Button, Input, LoadingState, CountryCodeSelect } from '@/components/common';
import { authService } from '@/services/api';
import { ApiError } from '@/types/api';
import { useOtpCountdown } from '@/hooks/useOtpCountdown';
import { cn } from '@/lib/utils';

/**
 * Inner signup form — separated to safely use useSearchParams inside Suspense.
 *
 * Two modes:
 *  - otpSent=true  → redirected from login (OTP already dispatched). Phone is locked.
 *                    Clicking "Continue" skips sendOtp and goes straight to /verify.
 *  - otpSent absent → fresh signup. Clicking "Create Account" calls sendOtp normally.
 */
function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // When the login page detects an unregistered number it already calls sendOtp.
  // It passes otpSent=true so we don't double-send (and hit the 60-second rate limit).
  const otpAlreadySent = searchParams.get('otpSent') === 'true';

  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState(searchParams.get('countryCode') || '+91');
  const [mobileNumber, setMobileNumber] = useState(searchParams.get('phone') || '');
  const [isFocused, setIsFocused] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Countdown used only for fresh-signup 429 rate-limit feedback.
  // Starts at 0 so the button is never blocked on initial render.
  const { countdown, startCountdown } = useOtpCountdown(0);
  const isRateLimited = countdown > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setMobileError(null);
    setApiError(null);

    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    const digitsOnly = mobileNumber.replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length < 4) {
      setMobileError('Please enter a valid mobile number');
      return;
    }

    // OTP was already sent by the login page — skip sendOtp and go straight to verify
    if (otpAlreadySent) {
      const queryParams = new URLSearchParams({
        phone: digitsOnly,
        countryCode: countryCode.trim(),
        name: name.trim(),
      });
      router.push(`/verify?${queryParams.toString()}`);
      return;
    }

    // Fresh signup — call sendOtp as normal
    setIsLoading(true);
    try {
      const response = await authService.sendOtp({
        countryCode: countryCode.trim(),
        mobileNumber: digitsOnly,
      });

      if (response.success) {
        const queryParams = new URLSearchParams({
          phone: digitsOnly,
          countryCode: countryCode.trim(),
          name: name.trim(),
        });

        if (response.data?.otp) {
          console.log(`[AURA DEV NOTICE] Generated OTP for testing: ${response.data.otp}`);
        }

        router.push(`/verify?${queryParams.toString()}`);
      } else {
        setApiError(response.message || 'Failed to send verification code');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 429) {
          // Sync countdown to the backend's remaining cooldown
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
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError || undefined}
          variant="minimal"
          required
          disabled={isLoading}
          autoComplete="name"
          autoFocus
        />

        {/* Combined phone number row */}
        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-secondary select-none">
            Mobile Number{' '}
            {!otpAlreadySent && (
              <span className="text-danger" aria-hidden="true">*</span>
            )}
          </label>

          <div
            className={cn(
              'flex items-center border-b pb-2 transition-colors duration-200',
              mobileError
                ? 'border-danger'
                : isFocused && !otpAlreadySent
                  ? 'border-primary'
                  : 'border-border-base',
            )}
          >
            <CountryCodeSelect
              value={countryCode}
              onChange={setCountryCode}
              disabled={isLoading || otpAlreadySent}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-14 shrink-0"
            />

            <span className="text-border-base select-none px-2 text-lg leading-none" aria-hidden="true">
              |
            </span>

            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading || otpAlreadySent}
              inputMode="numeric"
              placeholder="Mobile number"
              aria-label="Mobile number"
              aria-invalid={!!mobileError}
              aria-describedby={mobileError ? 'mobile-error' : undefined}
              className="flex-grow bg-transparent border-0 outline-none text-xs text-text-base py-1 placeholder:text-text-muted/60 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {mobileError && (
            <p
              id="mobile-error"
              className="text-[10px] uppercase tracking-wide font-medium text-danger animate-fade-in"
              role="alert"
            >
              {mobileError}
            </p>
          )}
        </div>

        {/* API error (non-429) */}
        {apiError && (
          <p
            className="text-[10px] uppercase tracking-wider font-medium text-danger text-center animate-fade-in"
            role="alert"
          >
            {apiError}
          </p>
        )}

        {/* Rate-limit cooldown feedback */}
        {isRateLimited && (
          <p
            className="text-[10px] uppercase tracking-[0.12em] text-text-muted text-center animate-fade-in"
            aria-live="polite"
            aria-label={`Please wait ${countdown} seconds before requesting another code`}
          >
            Please wait{' '}
            <span className="font-semibold text-text-secondary tabular-nums">{countdown}s</span>
            {' '}before requesting another code
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
          {isLoading
            ? 'One moment…'
            : otpAlreadySent
              ? 'Continue'
              : 'Create Account'}
        </Button>
      </form>

      {/* Sign in link */}
      <div className="text-center pt-1">
        <p className="text-[10px] text-text-muted uppercase tracking-[0.12em]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-text-base font-semibold hover:text-primary transition-colors underline-offset-4 hover:underline focus-visible:outline-none"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

/**
 * Customer Signup Page — wrapped in Suspense to safely read searchParams.
 */
export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading…" />}>
      <SignupContent />
    </Suspense>
  );
}
