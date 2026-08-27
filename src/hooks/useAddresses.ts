'use client';

import { useCallback, useEffect, useState } from 'react';
import { addressService } from '@/services/api/address';
import { ApiError } from '@/types/api';
import type { Address, CreateAddressPayload, UpdateAddressPayload } from '@/types/address';

/**
 * Fetches and mutates the authenticated user's saved addresses.
 * Re-fetches after every mutation so list order (default first) stays in sync
 * with the Backend.
 */
export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [settingDefaultIds, setSettingDefaultIds] = useState<Set<string>>(new Set());

  const refreshAddresses = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('auth_token')) {
      setAddresses([]);
      setCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await addressService.getAddresses();
      setAddresses(res.data.items);
      setCount(res.data.count);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        setAddresses([]);
        setCount(0);
        setError('Authentication required');
      } else {
        const msg = err instanceof ApiError ? err.message : 'Failed to load addresses';
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      if (localStorage.getItem('auth_token')) {
        void refreshAddresses();
      } else {
        setAddresses([]);
        setCount(0);
      }
    };

    window.addEventListener('auth_change', handleAuthChange);
    handleAuthChange();

    return () => window.removeEventListener('auth_change', handleAuthChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createAddress = useCallback(
    async (payload: CreateAddressPayload) => {
      setIsCreating(true);
      try {
        const res = await addressService.createAddress(payload);
        await refreshAddresses();
        return res.data;
      } finally {
        setIsCreating(false);
      }
    },
    [refreshAddresses],
  );

  const updateAddress = useCallback(
    async (id: string, payload: UpdateAddressPayload) => {
      setUpdatingIds((prev) => new Set(prev).add(id));
      try {
        const res = await addressService.updateAddress(id, payload);
        await refreshAddresses();
        return res.data;
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [refreshAddresses],
  );

  const setDefaultAddress = useCallback(
    async (id: string) => {
      setSettingDefaultIds((prev) => new Set(prev).add(id));
      try {
        const res = await addressService.setDefaultAddress(id);
        await refreshAddresses();
        return res.data;
      } finally {
        setSettingDefaultIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [refreshAddresses],
  );

  const deleteAddress = useCallback(
    async (id: string) => {
      setDeletingIds((prev) => new Set(prev).add(id));
      try {
        await addressService.deleteAddress(id);
        await refreshAddresses();
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [refreshAddresses],
  );

  return {
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
  };
}
