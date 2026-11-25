import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CountryOption {
  name: string;
  code: string; // e.g. "+91"
  iso: string;  // e.g. "IN"
  flag: string; // e.g. "🇮🇳"
  placeholder: string;
}

export const COUNTRIES: CountryOption[] = [
  { name: 'India', code: '+91', iso: 'IN', flag: '🇮🇳', placeholder: '98765 43210' },
  { name: 'United States', code: '+1', iso: 'US', flag: '🇺🇸', placeholder: '202 555 0143' },
  { name: 'United Kingdom', code: '+44', iso: 'GB', flag: '🇬🇧', placeholder: '7911 123456' },
  { name: 'United Arab Emirates', code: '+971', iso: 'AE', flag: '🇦🇪', placeholder: '50 123 4567' },
  { name: 'Singapore', code: '+65', iso: 'SG', flag: '🇸🇬', placeholder: '9123 4567' },
  { name: 'Canada', code: '+1', iso: 'CA', flag: '🇨🇦', placeholder: '416 555 0192' },
  { name: 'Australia', code: '+61', iso: 'AU', flag: '🇦🇺', placeholder: '412 345 678' },
  { name: 'Germany', code: '+49', iso: 'DE', flag: '🇩🇪', placeholder: '151 23456789' },
  { name: 'France', code: '+33', iso: 'FR', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { name: 'Saudi Arabia', code: '+966', iso: 'SA', flag: '🇸🇦', placeholder: '50 123 4567' },
  { name: 'Qatar', code: '+974', iso: 'QA', flag: '🇶🇦', placeholder: '3312 3456' },
  { name: 'Kuwait', code: '+965', iso: 'KW', flag: '🇰🇼', placeholder: '9123 4567' },
  { name: 'Oman', code: '+968', iso: 'OM', flag: '🇴🇲', placeholder: '9123 4567' },
  { name: 'Bahrain', code: '+973', iso: 'BH', flag: '🇧🇭', placeholder: '3600 1234' },
  { name: 'Malaysia', code: '+60', iso: 'MY', flag: '🇲🇾', placeholder: '12 345 6789' },
  { name: 'New Zealand', code: '+64', iso: 'NZ', flag: '🇳🇿', placeholder: '21 123 4567' },
  { name: 'Japan', code: '+81', iso: 'JP', flag: '🇯🇵', placeholder: '90 1234 5678' },
  { name: 'South Korea', code: '+82', iso: 'KR', flag: '🇰🇷', placeholder: '10 1234 5678' },
  { name: 'Nepal', code: '+977', iso: 'NP', flag: '🇳🇵', placeholder: '984 1234567' },
  { name: 'Sri Lanka', code: '+94', iso: 'LK', flag: '🇱🇰', placeholder: '71 234 5678' },
  { name: 'Bangladesh', code: '+880', iso: 'BD', flag: '🇧🇩', placeholder: '1712 345678' },
  { name: 'South Africa', code: '+27', iso: 'ZA', flag: '🇿🇦', placeholder: '71 123 4567' },
];

interface PhoneInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  selectedCountryIso?: string;
  onCountryChange?: (country: CountryOption) => void;
  nationalNumber: string;
  onNationalNumberChange: (cleanNumber: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label = 'Phone Number',
  error,
  helperText,
  selectedCountryIso = 'IN',
  onCountryChange,
  nationalNumber,
  onNationalNumberChange,
  required = false,
  disabled = false,
}) => {
  const inputId = useId();
  const [selectedIso, setSelectedIso] = useState<string>(selectedCountryIso);
  const [isFocused, setIsFocused] = useState(false);

  const currentCountry =
    COUNTRIES.find((c) => c.iso === (selectedCountryIso || selectedIso)) || COUNTRIES[0];

  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso = e.target.value;
    setSelectedIso(iso);
    const country = COUNTRIES.find((c) => c.iso === iso) || COUNTRIES[0];
    if (onCountryChange) {
      onCountryChange(country);
    }
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // If user pasted a full number with +countryCode, strip it
    if (raw.startsWith(currentCountry.code)) {
      raw = raw.slice(currentCountry.code.length);
    } else if (raw.startsWith('+')) {
      // Find matching country code if user pasted international format
      const matched = COUNTRIES.find((c) => raw.startsWith(c.code));
      if (matched) {
        setSelectedIso(matched.iso);
        if (onCountryChange) onCountryChange(matched);
        raw = raw.slice(matched.code.length);
      }
    }

    // Keep digits only
    const cleanDigits = raw.replace(/[^\d]/g, '');
    onNationalNumberChange(cleanDigits);
  };

  return (
    <div className="form-group" style={{ marginBottom: 16 }}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span style={{ color: 'var(--color-error, #DC2626)', marginLeft: 3 }}>*</span>}
        </label>
      )}

      {/* Compound Input Container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: 'var(--radius-md, 10px)',
          border: `1px solid ${
            error
              ? 'var(--color-error, #DC2626)'
              : isFocused
              ? 'var(--color-primary, #0F5132)'
              : 'var(--color-border, #EADFC8)'
          }`,
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          boxShadow: isFocused
            ? '0 0 0 3px var(--color-primary-glow, rgba(15, 81, 50, 0.14))'
            : 'none',
          transition: 'all 0.15s ease',
          overflow: 'hidden',
        }}
      >
        {/* Country Code Picker with Native Overlay */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px 0 12px',
            height: 42,
            backgroundColor: 'var(--color-surface-subtle, #FBF6EC)',
            borderRight: '1px solid var(--color-border, #EADFC8)',
            cursor: 'pointer',
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          {/* Visible Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none' }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{currentCountry.flag}</span>
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: 'var(--color-text-main, #1F2937)',
              }}
            >
              {currentCountry.code}
            </span>
            <ChevronDown size={14} color="var(--color-text-muted, #6B7280)" />
          </div>

          {/* Invisible Native Select for accessibility & touch support */}
          <select
            value={currentCountry.iso}
            onChange={handleCountrySelect}
            disabled={disabled}
            aria-label="Select Country Code"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              zIndex: 2,
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.flag} {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Phone Number Input Field */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            id={inputId}
            type="tel"
            inputMode="numeric"
            placeholder={currentCountry.placeholder}
            value={nationalNumber}
            onChange={handleNumberInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            disabled={disabled}
            style={{
              width: '100%',
              height: 42,
              padding: '0 14px',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-text-main, #1F2937)',
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {error && (
        <span
          style={{
            color: 'var(--color-error, #DC2626)',
            fontSize: 12,
            marginTop: 4,
            display: 'block',
          }}
        >
          {error}
        </span>
      )}

      {!error && helperText && (
        <span
          style={{
            color: 'var(--color-text-muted, #6B7280)',
            fontSize: 12,
            marginTop: 4,
            display: 'block',
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};
