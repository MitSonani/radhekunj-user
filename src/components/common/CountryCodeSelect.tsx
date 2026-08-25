'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CountryCode {
  code: string;
  country: string;
  iso: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+91', country: 'India', iso: 'IN' },
  { code: '+1', country: 'United States', iso: 'US' },
  { code: '+1', country: 'Canada', iso: 'CA' },
  { code: '+44', country: 'United Kingdom', iso: 'GB' },
  { code: '+61', country: 'Australia', iso: 'AU' },
  { code: '+64', country: 'New Zealand', iso: 'NZ' },
  { code: '+971', country: 'UAE', iso: 'AE' },
  { code: '+966', country: 'Saudi Arabia', iso: 'SA' },
  { code: '+974', country: 'Qatar', iso: 'QA' },
  { code: '+965', country: 'Kuwait', iso: 'KW' },
  { code: '+973', country: 'Bahrain', iso: 'BH' },
  { code: '+968', country: 'Oman', iso: 'OM' },
  { code: '+65', country: 'Singapore', iso: 'SG' },
  { code: '+60', country: 'Malaysia', iso: 'MY' },
  { code: '+66', country: 'Thailand', iso: 'TH' },
  { code: '+62', country: 'Indonesia', iso: 'ID' },
  { code: '+63', country: 'Philippines', iso: 'PH' },
  { code: '+880', country: 'Bangladesh', iso: 'BD' },
  { code: '+94', country: 'Sri Lanka', iso: 'LK' },
  { code: '+92', country: 'Pakistan', iso: 'PK' },
  { code: '+977', country: 'Nepal', iso: 'NP' },
  { code: '+33', country: 'France', iso: 'FR' },
  { code: '+49', country: 'Germany', iso: 'DE' },
  { code: '+39', country: 'Italy', iso: 'IT' },
  { code: '+34', country: 'Spain', iso: 'ES' },
  { code: '+31', country: 'Netherlands', iso: 'NL' },
  { code: '+46', country: 'Sweden', iso: 'SE' },
  { code: '+47', country: 'Norway', iso: 'NO' },
  { code: '+45', country: 'Denmark', iso: 'DK' },
  { code: '+41', country: 'Switzerland', iso: 'CH' },
  { code: '+7', country: 'Russia', iso: 'RU' },
  { code: '+81', country: 'Japan', iso: 'JP' },
  { code: '+82', country: 'South Korea', iso: 'KR' },
  { code: '+86', country: 'China', iso: 'CN' },
  { code: '+852', country: 'Hong Kong', iso: 'HK' },
  { code: '+886', country: 'Taiwan', iso: 'TW' },
  { code: '+55', country: 'Brazil', iso: 'BR' },
  { code: '+52', country: 'Mexico', iso: 'MX' },
  { code: '+27', country: 'South Africa', iso: 'ZA' },
  { code: '+234', country: 'Nigeria', iso: 'NG' },
  { code: '+254', country: 'Kenya', iso: 'KE' },
  { code: '+20', country: 'Egypt', iso: 'EG' },
];

export interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Minimal country code dropdown aligned with the AURA fashion form aesthetic.
 * Uses a native <select> for accessibility and mobile compatibility.
 */
export function CountryCodeSelect({
  value,
  onChange,
  disabled,
  className,
  onFocus,
  onBlur,
}: CountryCodeSelectProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        aria-label="Country code"
        className="appearance-none w-full bg-transparent border-0 outline-none text-xs text-text-base py-1 pr-5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={`${c.iso}-${c.code}`} value={c.code}>
            {c.code}
          </option>
        ))}
      </select>

      {/* Minimal chevron indicator */}
      <svg
        className="pointer-events-none absolute right-0 h-2.5 w-2.5 text-text-muted shrink-0"
        viewBox="0 0 10 6"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M1 1l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
