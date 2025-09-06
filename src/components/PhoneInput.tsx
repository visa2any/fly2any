'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PhoneIcon } from './Icons';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format: string;
}

const countries: Country[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', dialCode: '+55', format: '(##) #####-####' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', dialCode: '+1', format: '(###) ###-####' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', dialCode: '+1', format: '(###) ###-####' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54', format: '(##) ####-####' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56', format: '# ####-####' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴', dialCode: '+57', format: '(###) ###-####' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51', format: '(###) ###-####' },
  { code: 'UY', name: 'Uruguai', flag: '🇺🇾', dialCode: '+598', format: '(##) ###-####' },
  { code: 'PY', name: 'Paraguai', flag: '🇵🇾', dialCode: '+595', format: '(###) ###-####' },
  { code: 'MX', name: 'México', flag: '🇲🇽', dialCode: '+52', format: '(###) ###-####' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351', format: '(###) ###-####' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸', dialCode: '+34', format: '(###) ###-####' },
  { code: 'FR', name: 'França', flag: '🇫🇷', dialCode: '+33', format: '(##) ## ## ## ##' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪', dialCode: '+49', format: '(###) ###-####' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹', dialCode: '+39', format: '(###) ###-####' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', dialCode: '+44', format: '(####) ###-####' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺', dialCode: '+61', format: '(###) ###-####' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵', dialCode: '+81', format: '(###) ###-####' },
  { code: 'KR', name: 'Coreia do Sul', flag: '🇰🇷', dialCode: '+82', format: '(###) ###-####' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86', format: '(###) ####-####' },
];

interface PhoneInputProps {
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
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Número de telefone',
  error,
  touched,
  required = false,
  label,
  defaultCountry = 'BR',
  className
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parse existing value to extract country and phone number
    if (value) {
      const country = countries.find(c => value.startsWith(c.dialCode));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.replace(country.dialCode, '').trim());
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  const handleClickOutside = useCallback((event: Event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
      setSearchTerm('');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const formatPhoneNumber = useCallback((number: string, format: string): string => {
    try {
      const cleaned = number.replace(/\D/g, '');
      let formatted = '';
      let numberIndex = 0;

      for (let i = 0; i < format.length && numberIndex < cleaned.length; i++) {
        if (format[i] === '#') {
          formatted += cleaned[numberIndex];
          numberIndex++;
        } else if (numberIndex > 0) {
          formatted += format[i];
        }
      }

      return formatted;
    } catch (error) {
      console.error('Phone formatting error:', error);
      return number;
    }
  }, []);

  const handlePhoneNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanedValue = inputValue.replace(/\D/g, '');
    
    const formattedNumber = formatPhoneNumber(cleanedValue, selectedCountry.format);
    setPhoneNumber(formattedNumber);
    
    const fullNumber = selectedCountry.dialCode + ' ' + formattedNumber;
    onChange(fullNumber);
  }, [formatPhoneNumber, selectedCountry.format, selectedCountry.dialCode, onChange]);

  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchTerm('');
    
    const fullNumber = country.dialCode + ' ' + phoneNumber;
    onChange(fullNumber);
  }, [phoneNumber, onChange]);

  const filteredCountries = React.useMemo(() => 
    countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm)
    ), [searchTerm]
  );

  return (
    <div className={className} style={{ position: 'relative' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '4px', 
          fontWeight: 500,
          color: '#1f2937'
        }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      
      <div style={{ 
        display: 'flex', 
        border: (touched && error) ? '2px solid #ef4444' : '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#ffffff',
        transition: 'all 0.2s ease'
      }}>
        {/* Country Selector */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRight: '1px solid #e5e7eb',
              background: '#f9fafb',
              cursor: 'pointer',
              minWidth: '80px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
          >
            <span style={{ fontSize: '16px' }}>{selectedCountry.flag}</span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {selectedCountry.dialCode}
            </span>
            <span style={{ 
              fontSize: '12px', 
              color: '#9ca3af',
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
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
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              zIndex: 11000,
              maxHeight: '300px',
              overflowY: 'auto',
              marginTop: '2px'
            }}>
              {/* Search */}
              <div style={{ padding: '8px' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  placeholder="Buscar país..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Countries List */}
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      width: '100%',
                      border: 'none',
                      background: selectedCountry.code === country.code ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 
                      selectedCountry.code === country.code ? '#f0f9ff' : '#ffffff'
                    }
                  >
                    <span style={{ fontSize: '16px' }}>{country.flag}</span>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      {country.dialCode}
                    </span>
                    <span style={{ fontSize: '14px', color: '#1f2937' }}>
                      {country.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            onBlur={onBlur}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              background: 'transparent'
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
          fontSize: '11px',
          marginTop: '2px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export { PhoneInput };
export default PhoneInput;