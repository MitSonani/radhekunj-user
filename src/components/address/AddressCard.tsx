'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatMobile } from '@/lib/address';
import { ApiError } from '@/types/api';
import type { Address } from '@/types/address';

export interface AddressCardProps {
  address: Address;
  /** True while a mutation for this address is in-flight. */
  isLoading?: boolean;
  onEdit?: () => void;
  onDelete?: () => Promise<void> | void;
  onSetDefault?: () => Promise<void> | void;
}

/**
 * Reusable saved-address card for Account and later Checkout.
 * Supports default, normal, loading, and delete-confirm states.
 */
export function AddressCard({
  address,
  isLoading = false,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!onDelete) return;
    setActionError(null);
    try {
      await onDelete();
      setConfirmDelete(false);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Unable to delete address.');
    }
  };

  const handleSetDefault = async () => {
    if (!onSetDefault) return;
    setActionError(null);
    try {
      await onSetDefault();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Unable to set default address.');
    }
  };

  return (
    <article
      className={cn(
        'border bg-surface p-6 md:p-8 transition-opacity duration-200',
        address.isDefault ? 'border-primary/40' : 'border-border-base',
        isLoading && 'opacity-50 pointer-events-none',
      )}
      aria-busy={isLoading}
    >
      {/* Label + default badge */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-base">
          {address.label || 'Address'}
        </h3>
        {address.isDefault && (
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-primary shrink-0">
            Default
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1 text-sm text-text-base leading-relaxed">
        <p className="font-medium">{address.fullName}</p>
        <p className="text-text-secondary text-[13px]">
          {formatMobile(address.countryCode, address.mobileNumber)}
        </p>
        <p className="mt-2 text-[13px] text-text-secondary">
          {address.addressLine1}
          {address.addressLine2 ? (
            <>
              <br />
              {address.addressLine2}
            </>
          ) : null}
          <br />
          {address.city}, {address.state} — {address.postalCode}
          <br />
          {address.country}
        </p>
      </div>

      {actionError && (
        <p className="mt-4 text-[10px] uppercase tracking-wide font-medium text-danger" role="alert">
          {actionError}
        </p>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border-soft pt-5">
        <div>
          {!address.isDefault && onSetDefault && (
            <button
              type="button"
              onClick={handleSetDefault}
              disabled={isLoading}
              className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-secondary transition-colors hover:text-primary disabled:opacity-40"
            >
              Set as Default
            </button>
          )}
        </div>

        <div className="flex items-center gap-6">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              disabled={isLoading}
              className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-secondary transition-colors hover:text-primary disabled:opacity-40"
            >
              Edit
            </button>
          )}

          {onDelete &&
            (confirmDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-text-muted">Delete this address?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="text-[9px] font-semibold uppercase tracking-[0.16em] text-danger hover:underline disabled:opacity-40"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isLoading}
                  className="text-[9px] font-medium uppercase tracking-[0.16em] text-text-muted hover:text-text-base"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={isLoading}
                className="text-[9px] font-medium uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-danger disabled:opacity-40"
              >
                Delete
              </button>
            ))}
        </div>
      </div>
    </article>
  );
}

export function AddressCardSkeleton() {
  return (
    <div className="border border-border-soft bg-surface p-6 md:p-8 animate-pulse" aria-hidden="true">
      <div className="flex justify-between mb-5">
        <div className="h-2.5 w-16 bg-bg-soft" />
        <div className="h-2.5 w-14 bg-bg-soft" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3.5 w-36 bg-bg-soft" />
        <div className="h-3 w-28 bg-bg-soft" />
        <div className="mt-2 h-3 w-48 bg-bg-soft" />
        <div className="h-3 w-40 bg-bg-soft" />
        <div className="h-3 w-20 bg-bg-soft" />
      </div>
      <div className="mt-6 flex gap-6 border-t border-border-soft pt-5">
        <div className="h-2.5 w-10 bg-bg-soft" />
        <div className="h-2.5 w-12 bg-bg-soft" />
      </div>
    </div>
  );
}
