'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { Button, LoadingState } from '@/components/common';
import { authService, UserProfile } from '@/services/api';
import { ApiError } from '@/types/api';
import { APP_ROUTES } from '@/constants';

/**
 * Customer Profile Dashboard page (Client-side protected route).
 */
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Edit State
  const [nameInput, setNameInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const cachedToken = localStorage.getItem('auth_token');

    if (!cachedToken) {
      router.replace('/login');
      return;
    }

    // Fetch authoritative user profile from server
    authService
      .getProfile()
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
          setNameInput(res.data.name || '');
          localStorage.setItem('user_profile', JSON.stringify(res.data));
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.statusCode === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_profile');
          router.replace('/login');
          return;
        }

        // Fallback to cached profile if offline
        const cachedProfile = localStorage.getItem('user_profile');
        if (cachedProfile) {
          try {
            const parsed = JSON.parse(cachedProfile) as UserProfile;
            setProfile(parsed);
            setNameInput(parsed.name || '');
          } catch {
            // ignore
          }
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) {
      setErrorMessage('Full name must be at least 2 characters long.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await authService.updateProfile({ name: trimmed });
      if (res.data) {
        setProfile(res.data);
        setNameInput(res.data.name);
        localStorage.setItem('user_profile', JSON.stringify(res.data));
        setSuccessMessage('Profile updated successfully.');
        setIsEditing(false);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update profile. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    // Clear auth credentials from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_profile');

    // Notify other client components (like header navigation changes)
    window.dispatchEvent(new Event('auth_change'));

    // Redirect to login
    router.replace('/login');
  };

  if (isLoading) {
    return <LoadingState message="Verifying session credentials..." />;
  }

  const mobileDisplay = profile?.mobileNumber
    ? `${profile.countryCode || '+91'} ${profile.mobileNumber}`
    : 'Not provided';

  return (
    <div className="flex flex-col flex-grow py-12 md:py-20 bg-bg-base transition-colors duration-200">
      <PageContainer className="max-w-2xl">
        <div className="bg-surface p-8 md:p-12 border border-border-base flex flex-col gap-8 shadow-sm">
          {/* Header */}
          <div className="border-b border-border-soft pb-6 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                Customer Console
              </span>
              <h1 className="font-serif text-3xl font-normal uppercase tracking-wider text-text-base mt-2">
                My Account
              </h1>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>

          {/* Feedback alerts */}
          {successMessage && (
            <div className="p-3 bg-primary/10 border border-primary/30 text-primary text-xs flex items-center justify-between">
              <span>{successMessage}</span>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-primary hover:opacity-75"
              >
                ✕
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-danger hover:opacity-75"
              >
                ✕
              </button>
            </div>
          )}

          {/* Profile Card details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name Section */}
            <div className="flex flex-col gap-2 p-4 bg-bg-soft border border-border-soft">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                  Full Name
                </span>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setSuccessMessage(null);
                      setErrorMessage(null);
                    }}
                    className="text-[9px] uppercase font-semibold text-primary hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-3 mt-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isSaving}
                    minLength={2}
                    maxLength={100}
                    className="border border-border-base bg-surface px-3 py-1.5 text-xs text-text-base focus:outline-none focus:border-primary"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSaving}
                      disabled={isSaving || nameInput.trim().length < 2}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSaving}
                      onClick={() => {
                        setIsEditing(false);
                        setNameInput(profile?.name || '');
                        setErrorMessage(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <span className="text-sm font-medium text-text-base">
                  {profile?.name || 'Customer'}
                </span>
              )}
            </div>

            {/* Mobile Number Section */}
            <div className="flex flex-col gap-1 p-4 bg-bg-soft border border-border-soft">
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                Registered Mobile
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-mono font-medium text-text-base">
                  {mobileDisplay}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  Verified
                </span>
              </div>
              <span className="text-[9px] text-text-muted mt-1">
                Mobile number changes require OTP re-verification
              </span>
            </div>
          </div>

          {/* Account sections */}
          <nav aria-label="Account sections" className="flex flex-col divide-y divide-border-soft border-t border-border-soft">
            <Link
              href={APP_ROUTES.ORDERS}
              className="flex items-center justify-between py-5 group focus-visible:outline-none"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                  Orders
                </span>
                <span className="text-sm font-medium text-text-base group-hover:text-primary transition-colors">
                  View your order history and details
                </span>
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary">
                View
              </span>
            </Link>

            <Link
              href={APP_ROUTES.ADDRESSES}
              className="flex items-center justify-between py-5 group focus-visible:outline-none"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                  Addresses
                </span>
                <span className="text-sm font-medium text-text-base group-hover:text-primary transition-colors">
                  Manage delivery addresses
                </span>
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-primary">
                View
              </span>
            </Link>
          </nav>
        </div>
      </PageContainer>
    </div>
  );
}
