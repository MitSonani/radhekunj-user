import { apiClient } from './apiClient';
import type {
  AddressApiResponse,
  AddressListApiResponse,
  CreateAddressPayload,
  DeleteAddressApiResponse,
  UpdateAddressPayload,
} from '@/types/address';

/**
 * Service for the authenticated Address Management API.
 * All endpoints require a valid JWT (sent automatically by apiClient via localStorage).
 *
 * Routes (all under /addresses):
 *   GET    /addresses              → list user's addresses
 *   POST   /addresses              → create address
 *   GET    /addresses/:id          → get one address
 *   PATCH  /addresses/:id          → update address
 *   PATCH  /addresses/:id/default  → set as default
 *   DELETE /addresses/:id          → delete address
 */
export const addressService = {
  getAddresses: () => apiClient.get<AddressListApiResponse>('/addresses'),

  getAddress: (id: string) => apiClient.get<AddressApiResponse>(`/addresses/${id}`),

  createAddress: (payload: CreateAddressPayload) =>
    apiClient.post<AddressApiResponse>('/addresses', payload),

  updateAddress: (id: string, payload: UpdateAddressPayload) =>
    apiClient.patch<AddressApiResponse>(`/addresses/${id}`, payload),

  setDefaultAddress: (id: string) =>
    apiClient.patch<AddressApiResponse>(`/addresses/${id}/default`),

  deleteAddress: (id: string) =>
    apiClient.delete<DeleteAddressApiResponse>(`/addresses/${id}`),
};
