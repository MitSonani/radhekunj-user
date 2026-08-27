'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { EmptyState, ErrorState, LoadingState, Toast } from '@/components/common';
import { AddressCard, AddressCardSkeleton, AddressForm } from '@/components/address';
import { useAddresses } from '@/hooks/useAddresses';
import { EMPTY_ADDRESS_FORM, addressToFormValues } from '@/lib/address';
import { APP_ROUTES } from '@/constants';
import { ApiError } from '@/types/api';
import type { AddressFormValues, CreateAddressPayload } from '@/types/address';
import type { UserProfile } from '@/services/api';

type FormMode = { type: 'closed' } | { type: 'create' } | { type: 'edit'; id: string };

/**
 * /profile/addresses — authenticated customer's saved addresses.
 */
export default function AddressesPage() {
  const router = useRouter();
  const {
    addresses,
    count,
    isLoading,
    error,
    isCreating,
    updatingIds,
    deletingIds,
    settingDefaultIds,
    refreshAddresses,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
  } = useAddresses();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [formMode, setFormMode] = useState<FormMode>({ type: 'closed' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const check = () => {
      const hasToken = !!localStorage.getItem('auth_token');
      setIsAuthenticated(hasToken);
      if (!hasToken) {
        router.push(`/login?redirect=${encodeURIComponent(APP_ROUTES.ADDRESSES)}`);
      }
    };
    check();
    window.addEventListener('auth_change', check);
    return () => window.removeEventListener('auth_change', check);
  }, [router]);

  useEffect(() => {
    if (error === 'Authentication required') {
      router.push(`/login?redirect=${encodeURIComponent(APP_ROUTES.ADDRESSES)}`);
    }
  }, [error, router]);

  const createInitialValues = useMemo<Partial<AddressFormValues>>(() => {
    if (typeof window === 'undefined') return EMPTY_ADDRESS_FORM;
    try {
      const cached = localStorage.getItem('user_profile');
      if (!cached) return EMPTY_ADDRESS_FORM;
      const profile = JSON.parse(cached) as UserProfile;
      return { ...EMPTY_ADDRESS_FORM, fullName: profile.name ?? '' };
    } catch {
      return EMPTY_ADDRESS_FORM;
    }
  }, [isAuthenticated]);

  const handleCreate = async (payload: CreateAddressPayload) => {
    await createAddress(payload);
    setFormMode({ type: 'closed' });
    setToast({ message: 'Address saved', type: 'success' });
  };

  const handleUpdate = async (id: string, payload: CreateAddressPayload) => {
    await updateAddress(id, payload);
    setFormMode({ type: 'closed' });
    setToast({ message: 'Address updated', type: 'success' });
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      setToast({ message: 'Default address updated', type: 'success' });
    } catch (err) {
      throw err instanceof ApiError ? err : new Error('Unable to set default address.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      if (formMode.type === 'edit' && formMode.id === id) {
        setFormMode({ type: 'closed' });
      }
      setToast({ message: 'Address deleted', type: 'success' });
    } catch (err) {
      throw err instanceof ApiError ? err : new Error('Unable to delete address.');
    }
  };

  if (isAuthenticated === null) {
    return <LoadingState message="Verifying session…" className="min-h-[60vh]" />;
  }

  if (!isAuthenticated) return null;

  if (error && error === 'Authentication required') {
    return <LoadingState message="Redirecting to sign in…" className="min-h-[60vh]" />;
  }

  const editingAddress =
    formMode.type === 'edit' ? addresses.find((a) => a.id === formMode.id) : undefined;

  return (
    <div className="flex flex-col flex-grow py-12 md:py-16 bg-bg-base">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={2800}
          onDismiss={() => setToast(null)}
        />
      )}

      <PageContainer className="max-w-2xl">
        {/* Page header */}
        <div className="mb-10 border-b border-border-base pb-6">
          <Link
            href={APP_ROUTES.PROFILE}
            className="text-[9px] font-semibold uppercase tracking-[0.28em] text-text-muted hover:text-primary transition-colors"
          >
            Account
          </Link>
          <div className="mt-2 flex items-baseline gap-3">
            <h1 className="font-serif text-3xl font-normal uppercase tracking-widest text-text-base">
              My Addresses
            </h1>
            {count > 0 && (
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-[0.15em]">
                {count} {count === 1 ? 'address' : 'addresses'}
              </span>
            )}
          </div>
        </div>

        {error && !isLoading && (
          <ErrorState
            title="Unable to load addresses"
            message={error}
            onRetry={refreshAddresses}
          />
        )}

        {isLoading && addresses.length === 0 && !error && (
          <div className="flex flex-col gap-4">
            <AddressCardSkeleton />
            <AddressCardSkeleton />
          </div>
        )}

        {!error && !isLoading && count === 0 && formMode.type !== 'create' && (
          <EmptyState
            title="No Saved Addresses"
            description="Add a delivery address to use at checkout."
            actionLabel="Add New Address"
            onActionClick={() => setFormMode({ type: 'create' })}
            icon={
              <svg
                className="mx-auto h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
            }
          />
        )}

        {/* Add form */}
        {formMode.type === 'create' && (
          <section className="mb-10 border border-border-base bg-surface p-6 md:p-8">
            <h2 className="font-serif text-xl font-normal uppercase tracking-widest text-text-base mb-8">
              Add New Address
            </h2>
            <AddressForm
              key="create"
              initialValues={createInitialValues}
              submitLabel="Save Address"
              onSubmit={handleCreate}
              onCancel={() => setFormMode({ type: 'closed' })}
              isSubmitting={isCreating}
              showDefaultToggle={count > 0}
              defaultToggleLocked={count === 0}
            />
          </section>
        )}

        {/* Address list */}
        {addresses.length > 0 && (
          <div className="flex flex-col gap-4">
            {addresses.map((address) => {
              if (formMode.type === 'edit' && formMode.id === address.id && editingAddress) {
                return (
                  <section
                    key={address.id}
                    className="border border-border-base bg-surface p-6 md:p-8"
                  >
                    <h2 className="font-serif text-xl font-normal uppercase tracking-widest text-text-base mb-8">
                      Edit Address
                    </h2>
                    <AddressForm
                      key={address.id}
                      initialValues={addressToFormValues(editingAddress)}
                      submitLabel="Update Address"
                      onSubmit={(payload) => handleUpdate(address.id, payload)}
                      onCancel={() => setFormMode({ type: 'closed' })}
                      isSubmitting={updatingIds.has(address.id)}
                      showDefaultToggle={!editingAddress.isDefault}
                    />
                  </section>
                );
              }

              const isMutating =
                updatingIds.has(address.id) ||
                deletingIds.has(address.id) ||
                settingDefaultIds.has(address.id);

              return (
                <AddressCard
                  key={address.id}
                  address={address}
                  isLoading={isMutating}
                  onEdit={() => setFormMode({ type: 'edit', id: address.id })}
                  onDelete={() => handleDelete(address.id)}
                  onSetDefault={
                    address.isDefault ? undefined : () => handleSetDefault(address.id)
                  }
                />
              );
            })}
          </div>
        )}

        {/* Add trigger — shown once the list has at least one address */}
        {formMode.type !== 'create' && count > 0 && (
          <div className="mt-10">
            <button
              type="button"
              onClick={() => setFormMode({ type: 'create' })}
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary border-b border-primary pb-0.5 hover:text-primary-dark hover:border-primary-dark transition-colors"
            >
              + Add New Address
            </button>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
