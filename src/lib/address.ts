import type { Address, AddressFormValues, CreateAddressPayload } from '@/types/address';

/**
 * Field constraints mirrored from backend/src/shared/constants/index.ts (ADDRESS).
 * Used for frontend UX validation only — the Backend remains authoritative.
 */
export const ADDRESS_CONSTRAINTS = {
  FULL_NAME_MAX: 200,
  COUNTRY_CODE_MAX: 8,
  COUNTRY_CODE_PATTERN: /^\+[1-9]\d{0,3}$/,
  MOBILE_NUMBER_MIN: 4,
  MOBILE_NUMBER_MAX: 15,
  MOBILE_NUMBER_PATTERN: /^\d{4,15}$/,
  LINE_MAX: 255,
  CITY_MAX: 100,
  STATE_MAX: 100,
  POSTAL_CODE_MIN: 2,
  POSTAL_CODE_MAX: 20,
  POSTAL_CODE_PATTERN: /^[A-Za-z0-9][A-Za-z0-9 -]{0,18}[A-Za-z0-9]$/,
  COUNTRY_MAX: 100,
  LABEL_MAX: 50,
} as const;

export const EMPTY_ADDRESS_FORM: AddressFormValues = {
  fullName: '',
  countryCode: '+91',
  mobileNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  label: '',
  isDefault: false,
};

export function addressToFormValues(address: Address): AddressFormValues {
  return {
    fullName: address.fullName,
    countryCode: address.countryCode,
    mobileNumber: address.mobileNumber,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? '',
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    label: address.label ?? '',
    isDefault: address.isDefault,
  };
}

export type AddressFormErrors = Partial<Record<keyof AddressFormValues, string>>;

/**
 * Client-side UX validation matching Backend address field rules.
 * Returns a map of field → user-facing error. Empty object means valid.
 */
export function validateAddressForm(values: AddressFormValues): AddressFormErrors {
  const errors: AddressFormErrors = {};
  const { FULL_NAME_MAX, COUNTRY_CODE_PATTERN, MOBILE_NUMBER_MIN, MOBILE_NUMBER_MAX, MOBILE_NUMBER_PATTERN, LINE_MAX, CITY_MAX, STATE_MAX, POSTAL_CODE_MIN, POSTAL_CODE_MAX, POSTAL_CODE_PATTERN, COUNTRY_MAX, LABEL_MAX } =
    ADDRESS_CONSTRAINTS;

  const fullName = values.fullName.trim();
  if (!fullName) {
    errors.fullName = 'Full name is required';
  } else if (fullName.length > FULL_NAME_MAX) {
    errors.fullName = `Full name cannot exceed ${FULL_NAME_MAX} characters`;
  }

  const countryCode = values.countryCode.trim();
  if (!countryCode) {
    errors.countryCode = 'Country code is required';
  } else if (!COUNTRY_CODE_PATTERN.test(countryCode)) {
    errors.countryCode = 'Enter a valid country code';
  }

  const mobileNumber = values.mobileNumber.replace(/\D/g, '');
  if (!mobileNumber) {
    errors.mobileNumber = 'Mobile number is required';
  } else if (
    mobileNumber.length < MOBILE_NUMBER_MIN ||
    mobileNumber.length > MOBILE_NUMBER_MAX ||
    !MOBILE_NUMBER_PATTERN.test(mobileNumber)
  ) {
    errors.mobileNumber = 'Enter a valid mobile number';
  }

  const addressLine1 = values.addressLine1.trim();
  if (!addressLine1) {
    errors.addressLine1 = 'Address is required';
  } else if (addressLine1.length > LINE_MAX) {
    errors.addressLine1 = `Address cannot exceed ${LINE_MAX} characters`;
  }

  const addressLine2 = values.addressLine2.trim();
  if (addressLine2.length > LINE_MAX) {
    errors.addressLine2 = `Address line 2 cannot exceed ${LINE_MAX} characters`;
  }

  const city = values.city.trim();
  if (!city) {
    errors.city = 'City is required';
  } else if (city.length > CITY_MAX) {
    errors.city = `City cannot exceed ${CITY_MAX} characters`;
  }

  const state = values.state.trim();
  if (!state) {
    errors.state = 'State is required';
  } else if (state.length > STATE_MAX) {
    errors.state = `State cannot exceed ${STATE_MAX} characters`;
  }

  const postalCode = values.postalCode.trim();
  if (!postalCode) {
    errors.postalCode = 'Postal code is required';
  } else if (postalCode.length < POSTAL_CODE_MIN || postalCode.length > POSTAL_CODE_MAX) {
    errors.postalCode = 'Enter a valid postal code';
  } else if (!POSTAL_CODE_PATTERN.test(postalCode)) {
    errors.postalCode = 'Postal code may contain letters, digits, spaces, and hyphens';
  }

  const country = values.country.trim();
  if (!country) {
    errors.country = 'Country is required';
  } else if (country.length > COUNTRY_MAX) {
    errors.country = `Country cannot exceed ${COUNTRY_MAX} characters`;
  }

  const label = values.label.trim();
  if (label.length > LABEL_MAX) {
    errors.label = `Label cannot exceed ${LABEL_MAX} characters`;
  }

  return errors;
}

/**
 * Maps validated form values to the Backend create/update payload.
 * Empty optional fields are sent as null so Edit can clear them.
 */
export function formValuesToPayload(values: AddressFormValues): CreateAddressPayload {
  const payload: CreateAddressPayload = {
    fullName: values.fullName.trim(),
    countryCode: values.countryCode.trim(),
    mobileNumber: values.mobileNumber.replace(/\D/g, ''),
    addressLine1: values.addressLine1.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    postalCode: values.postalCode.trim(),
    country: values.country.trim(),
  };

  const addressLine2 = values.addressLine2.trim();
  payload.addressLine2 = addressLine2 ? addressLine2 : null;

  const label = values.label.trim();
  payload.label = label ? label : null;

  if (values.isDefault) {
    payload.isDefault = true;
  }

  return payload;
}

/** Display helper: "+91 98765 43210" for 10-digit Indian numbers, otherwise "+XX number". */
export function formatMobile(countryCode: string, mobileNumber: string): string {
  if (countryCode === '+91' && mobileNumber.length === 10) {
    return `${countryCode} ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5)}`;
  }
  return `${countryCode} ${mobileNumber}`;
}
