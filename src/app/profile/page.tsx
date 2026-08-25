'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { Button, LoadingState } from '@/components/common';
import { UserProfile } from '@/services/api';

/**
 * Customer Profile Dashboard page (Client-side protected route).
 */
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read user profile from localStorage
    const cachedProfile = localStorage.getItem('user_profile');
    const cachedToken = localStorage.getItem('auth_token');

    if (!cachedToken || !cachedProfile) {
      // Clear half-cached state and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
      router.replace('/login');
    } else {
      try {
        const parsed = JSON.parse(cachedProfile);
        setTimeout(() => {
          setProfile(parsed);
          setIsLoading(false);
        }, 0);
      } catch {
        // Fallback for corrupted cache
        localStorage.clear();
        router.replace('/login');
      }
    }
  }, [router]);

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

          {/* Profile Card details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1 p-4 bg-bg-soft border border-border-soft">
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                Full Name
              </span>
              <span className="text-sm font-medium text-text-base">
                {profile?.name || 'Customer'}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-4 bg-bg-soft border border-border-soft">
              <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                User Role
              </span>
              <span className="text-sm font-medium text-primary capitalize">
                {profile?.role?.name || 'Customer'}
              </span>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
