/**
 * Address types matching the Backend Address API contract exactly.
 * Source of truth: backend/src/modules/addresses/service.ts
 */

export interface Address {
  id: string;
  fullName: string;
  countryCode: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressListData {
  items: Address[];
  count: number;
}

export interface AddressListApiResponse {
  success: boolean;
  data: AddressListData;
}

export interface AddressApiResponse {
  success: boolean;
  message?: string;
  data: Address;
}

export interface DeleteAddressApiResponse {
  success: boolean;
  message: string;
}

/** POST /addresses body — matches CreateAddressInput. */
export interface CreateAddressPayload {
  fullName: string;
  countryCode: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label?: string | null;
  isDefault?: boolean;
}

/** PATCH /addresses/:id body — matches UpdateAddressInput. */
export interface UpdateAddressPayload {
  fullName?: string;
  countryCode?: string;
  mobileNumber?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  label?: string | null;
  isDefault?: boolean;
}

/** Local form values used by AddressForm (Add and Edit). */
export interface AddressFormValues {
  fullName: string;
  countryCode: string;
  mobileNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label: string;
  isDefault: boolean;
}
