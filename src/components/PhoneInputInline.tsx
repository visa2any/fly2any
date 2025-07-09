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
  { code: 'MX', name: 'México', flag: '🇲🇽', dialCode: '+52' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸', dialCode: '+34' },
  { code: 'FR', name: 'França', flag: '🇫🇷', dialCode: '+33' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪', dialCode: '+49' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹', dialCode: '+39' },
];

interface PhoneInputInlineProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  label?: string;
  defaultCountry?: string;
}

const PhoneInputInline: React.FC<PhoneInputInlineProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Número de telefone',
  error,
  required = false,
  label,
  defaultCountry = 'BR'
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Initialize country selection only on client
  React.useEffect(() => {
    setIsClient(true);
    setSelectedCountry(countries.find(c => c.code === defaultCountry) || countries[0]);
  }, [defaultCountry]);

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
    const fullNumber = selectedCountry?.dialCode + ' ' + inputValue;
    onChange(fullNumber);
  };

  const phoneNumber = value.replace(/^\+\d+\s?/, '');

  if (!isClient || !selectedCountry) {
    return (
      <div style={{ position: 'relative' }}>
        {label && (
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: 500, 
            color: '#374151', 
            marginBottom: '4px' 
          }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
        )}
        <input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        />
        {error && (
          <div style={{
            color: '#ef4444',
            fontSize: '12px',
            marginTop: '4px'
          }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: 500, 
          color: '#374151', 
          marginBottom: '4px' 
        }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      
      <div style={{
        display: 'flex',
        border: error ? '2px solid #ef4444' : '1px solid #d1d5db',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'white',
        transition: 'all 0.2s ease'
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
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderRight: '1px solid #d1d5db',
              cursor: 'pointer',
              minWidth: '80px',
              transition: 'background-color 0.2s ease'
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
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
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
                    padding: '8px 12px',
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
            style={{
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: 'transparent'
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
      {error && (
        <div style={{
          color: '#ef4444',
          fontSize: '12px',
          marginTop: '4px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default PhoneInputInline;