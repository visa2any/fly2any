'use client';

import React, { useState } from 'react';
import { PhoneIcon } from './Icons';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const countries: Country[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', dialCode: '+1' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴', dialCode: '+57' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51' },
  { code: 'UY', name: 'Uruguai', flag: '🇺🇾', dialCode: '+598' },
  { code: 'PY', name: 'Paraguai', flag: '🇵🇾', dialCode: '+595' },
  { code: 'MX', name: 'México', flag: '🇲🇽', dialCode: '+52' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸', dialCode: '+34' },
  { code: 'FR', name: 'França', flag: '🇫🇷', dialCode: '+33' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪', dialCode: '+49' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹', dialCode: '+39' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', dialCode: '+44' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺', dialCode: '+61' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵', dialCode: '+81' },
  { code: 'KR', name: 'Coreia do Sul', flag: '🇰🇷', dialCode: '+82' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
];

interface PhoneInputSimpleProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  label?: string;
  defaultCountry?: string;
  className?: string;
  inputClassName?: string;
}

const PhoneInputSimple: React.FC<PhoneInputSimpleProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Número de telefone',
  error,
  touched,
  required = false,
  label,
  defaultCountry = 'BR',
  className,
  inputClassName
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    
    // Update value with new country code
    const phoneNumber = value.replace(/^\+\d+\s?/, '');
    const fullNumber = country.dialCode + ' ' + phoneNumber;
    onChange(fullNumber);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const fullNumber = selectedCountry.dialCode + ' ' + inputValue;
    onChange(fullNumber);
  };

  const phoneNumber = value.replace(/^\+\d+\s?/, '');

  return (
    <div className={className} style={{ position: 'relative' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '4px'
        }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      
      <div style={{
        display: 'flex',
        border: touched && error ? '2px solid #ef4444' : '1px solid #d1d5db',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'white',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Country Selector */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: '#f9fafb',
              borderRight: '1px solid #d1d5db',
              minWidth: '85px',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              border: 'none',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
          >
            <span style={{ fontSize: '16px' }}>{selectedCountry.flag}</span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>{selectedCountry.dialCode}</span>
            <span style={{
              fontSize: '12px',
              color: '#9ca3af',
              transition: 'transform 0.2s ease',
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              zIndex: 9999,
              maxHeight: '240px',
              overflowY: 'auto',
              marginTop: '4px'
            }}>
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    textAlign: 'left',
                    backgroundColor: selectedCountry.code === country.code ? '#dbeafe' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCountry.code !== country.code) {
                      e.currentTarget.style.backgroundColor = '#f0f9ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCountry.code !== country.code) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{country.flag}</span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{country.dialCode}</span>
                  <span style={{ fontSize: '14px', color: '#111827' }}>{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={inputClassName}
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: 'transparent',
              color: '#111827'
            }}
          />
          <PhoneIcon style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: '#9ca3af'
          }} />
        </div>
      </div>

      {/* Error Message */}
      {touched && error && (
        <div style={{
          color: '#ef4444',
          fontSize: '12px',
          marginTop: '4px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default PhoneInputSimple;