'use client';

import React, { useState } from 'react';
import { Button, Input, CountryCodeSelect } from '@/components/common';
import { cn } from '@/lib/utils';
import { ApiError } from '@/types/api';
import {
  ADDRESS_CONSTRAINTS,
  EMPTY_ADDRESS_FORM,
  validateAddressForm,
  formValuesToPayload,
} from '@/lib/address';
import type { AddressFormValues, CreateAddressPayload } from '@/types/address';

export interface AddressFormProps {
  initialValues?: Partial<AddressFormValues>;
  submitLabel?: string;
  onSubmit: (payload: CreateAddressPayload) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  /** Show the "Set as default" checkbox. Hide when editing the current default. */
  showDefaultToggle?: boolean;
  /** Disable unchecking — used when this is the user's first address. */
  defaultToggleLocked?: boolean;
}

/**
 * Shared Add / Edit address form.
 * Reused on Account → Addresses and later Checkout → Add Address.
 */
export function AddressForm({
  initialValues,
  submitLabel = 'Save Address',
  onSubmit,
  onCancel,
  isSubmitting = false,
  showDefaultToggle = true,
  defaultToggleLocked = false,
}: AddressFormProps) {
  const [values, setValues] = useState<AddressFormValues>({
    ...EMPTY_ADDRESS_FORM,
    ...initialValues,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormValues, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [phoneFocused, setPhoneFocused] = useState(false);

  const updateField = <K extends keyof AddressFormValues>(field: K, value: AddressFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const nextErrors = validateAddressForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await onSubmit(formValuesToPayload(values));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Unable to save address. Please try again.';
      setApiError(message);
    }
  };

  const phoneError = errors.mobileNumber || errors.countryCode;
  const { LINE_MAX, CITY_MAX, STATE_MAX, POSTAL_CODE_MAX, COUNTRY_MAX, FULL_NAME_MAX, LABEL_MAX, MOBILE_NUMBER_MAX } =
    ADDRESS_CONSTRAINTS;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <Input
        label="Full Name"
        value={values.fullName}
        onChange={(e) => updateField('fullName', e.target.value)}
        error={errors.fullName}
        required
        disabled={isSubmitting}
        autoComplete="name"
        maxLength={FULL_NAME_MAX}
        placeholder="Name as it should appear on deliveries"
      />

      {/* Mobile — country code + number, matching the auth phone row */}
      <div className="flex flex-col gap-2">
        <label className="text-[9px] font-semibold uppercase tracking-[0.15em] text-text-secondary select-none">
          Mobile Number <span className="ml-1 text-danger" aria-hidden="true">*</span>
        </label>
        <div
          className={cn(
            'flex items-center border bg-surface px-4 py-3 transition-colors duration-200',
            phoneError
              ? 'border-danger'
              : phoneFocused
                ? 'border-primary'
                : 'border-border-base',
          )}
        >
          <CountryCodeSelect
            value={values.countryCode}
            onChange={(code) => updateField('countryCode', code)}
            disabled={isSubmitting}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
            className="w-14 shrink-0"
          />
          <span className="text-border-base select-none px-2 text-lg leading-none" aria-hidden="true">
            |
          </span>
          <input
            type="tel"
            value={values.mobileNumber}
            onChange={(e) => updateField('mobileNumber', e.target.value.replace(/\D/g, ''))}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
            disabled={isSubmitting}
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={MOBILE_NUMBER_MAX}
            placeholder="Mobile number"
            aria-label="Mobile number"
            aria-invalid={!!phoneError}
            aria-describedby={phoneError ? 'address-phone-error' : undefined}
            className="flex-grow bg-transparent border-0 outline-none text-xs text-text-base py-0 placeholder:text-text-muted/50 disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
        {phoneError && (
          <p
            id="address-phone-error"
            className="text-[10px] uppercase tracking-wide font-medium text-danger animate-fade-in"
            role="alert"
          >
            {phoneError}
          </p>
        )}
      </div>

      <Input
        label="Label"
        value={values.label}
        onChange={(e) => updateField('label', e.target.value)}
        error={errors.label}
        disabled={isSubmitting}
        maxLength={LABEL_MAX}
        placeholder="Home, Office…"
        helperText="Optional — a short name for this address"
      />

      <Input
        label="Address"
        value={values.addressLine1}
        onChange={(e) => updateField('addressLine1', e.target.value)}
        error={errors.addressLine1}
        required
        disabled={isSubmitting}
        autoComplete="address-line1"
        maxLength={LINE_MAX}
        placeholder="Street address, house number"
      />

      <Input
        label="Address Line 2"
        value={values.addressLine2}
        onChange={(e) => updateField('addressLine2', e.target.value)}
        error={errors.addressLine2}
        disabled={isSubmitting}
        autoComplete="address-line2"
        maxLength={LINE_MAX}
        placeholder="Apartment, suite, landmark"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="City"
          value={values.city}
          onChange={(e) => updateField('city', e.target.value)}
          error={errors.city}
          required
          disabled={isSubmitting}
          autoComplete="address-level2"
          maxLength={CITY_MAX}
        />
        <Input
          label="State"
          value={values.state}
          onChange={(e) => updateField('state', e.target.value)}
          error={errors.state}
          required
          disabled={isSubmitting}
          autoComplete="address-level1"
          maxLength={STATE_MAX}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="Postal Code"
          value={values.postalCode}
          onChange={(e) => updateField('postalCode', e.target.value)}
          error={errors.postalCode}
          required
          disabled={isSubmitting}
          autoComplete="postal-code"
          maxLength={POSTAL_CODE_MAX}
        />
        <Input
          label="Country"
          value={values.country}
          onChange={(e) => updateField('country', e.target.value)}
          error={errors.country}
          required
          disabled={isSubmitting}
          autoComplete="country-name"
          maxLength={COUNTRY_MAX}
        />
      </div>

      {showDefaultToggle && (
        <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={values.isDefault || defaultToggleLocked}
            onChange={(e) => updateField('isDefault', e.target.checked)}
            disabled={isSubmitting || defaultToggleLocked}
            className="h-3.5 w-3.5 shrink-0 rounded-none border-border-base text-primary accent-primary disabled:opacity-40"
          />
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Set as default address
          </span>
        </label>
      )}

      {apiError && (
        <p className="text-[10px] uppercase tracking-wider font-medium text-danger animate-fade-in" role="alert">
          {apiError}
        </p>
      )}

      <div className="flex items-center gap-6 pt-2">
        <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-[9px] font-medium uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-text-base disabled:opacity-40"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
