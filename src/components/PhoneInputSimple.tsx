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
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
  { code: 'FR', name: 'França', flag: '🇫🇷', dialCode: '+33' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹', dialCode: '+39' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪', dialCode: '+49' },
  { code: 'GB', name: 'Inglaterra', flag: '🇬🇧', dialCode: '+44' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸', dialCode: '+34' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴', dialCode: '+57' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51' },
  { code: 'UY', name: 'Uruguai', flag: '🇺🇾', dialCode: '+598' },
  { code: 'PY', name: 'Paraguai', flag: '🇵🇾', dialCode: '+595' },
  { code: 'MX', name: 'México', flag: '🇲🇽', dialCode: '+52' },
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
  defaultCountry = 'US',
  className,
  inputClassName
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || 
                           'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 ||
                           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Calculate dropdown position for mobile fixed positioning
  const calculateDropdownPosition = () => {
    if (!buttonRef.current || !isMobile) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: buttonRect.bottom + window.scrollY + 4,
      left: buttonRect.left + window.scrollX,
      width: Math.max(buttonRect.width, 200)
    });
  };
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('[data-phone-input-container]')) {
        setIsDropdownOpen(false);
      }
    };
    
    const handleScroll = () => {
      if (isDropdownOpen && isMobile) {
        calculateDropdownPosition();
      }
    };
    
    const handleResize = () => {
      if (isDropdownOpen && isMobile) {
        calculateDropdownPosition();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDropdownOpen, isMobile]);

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
    <div className={className} style={{ position: 'relative' }} data-phone-input-container>
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
        overflow: 'visible',
        backgroundColor: 'white',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Country Selector */}
        <div style={{ 
          position: 'relative',
          overflow: 'visible',
          zIndex: 1000
        }}>
          <button
            ref={buttonRef}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isDropdownOpen) {
                calculateDropdownPosition();
              }
              setIsDropdownOpen(!isDropdownOpen);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: isMobile ? '12px 14px' : '10px 12px',
              backgroundColor: isDropdownOpen ? '#3b82f6' : '#f9fafb',
              borderRight: '1px solid #d1d5db',
              minWidth: isMobile ? '95px' : '85px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: 'none',
              outline: 'none',
              borderRadius: isMobile ? '6px 0 0 6px' : '0',
              boxShadow: isDropdownOpen && isMobile ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
              position: 'relative',
              zIndex: 1001
            }}
            onMouseEnter={(e) => {
              if (!isDropdownOpen) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDropdownOpen) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
          >
            <span style={{ 
              fontSize: isMobile ? '18px' : '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>{selectedCountry.flag}</span>
            <span style={{ 
              fontSize: isMobile ? '15px' : '14px', 
              color: isDropdownOpen ? 'white' : '#6b7280',
              fontWeight: isMobile ? '600' : '400',
              transition: 'color 0.3s ease'
            }}>{selectedCountry.dialCode}</span>
            <span style={{
              fontSize: isMobile ? '14px' : '12px',
              color: isDropdownOpen ? 'white' : '#9ca3af',
              transition: 'all 0.3s ease',
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              fontWeight: '700'
            }}>
              ▼
            </span>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div style={{
              position: isMobile ? 'fixed' : 'absolute',
              top: isMobile ? `${dropdownPosition.top}px` : '100%',
              left: isMobile ? `${dropdownPosition.left}px` : 0,
              right: isMobile ? 'auto' : 0,
              width: isMobile ? `${dropdownPosition.width}px` : 'auto',
              backgroundColor: 'white',
              border: isMobile ? '3px solid #3b82f6' : '2px solid #3b82f6',
              borderRadius: isMobile ? '12px' : '8px',
              boxShadow: isMobile 
                ? '0 25px 80px -5px rgba(0, 0, 0, 0.4), 0 15px 35px -5px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.9)'
                : '0 20px 60px -5px rgba(0, 0, 0, 0.3), 0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              zIndex: 99999,
              maxHeight: isMobile ? '280px' : '240px',
              overflowY: 'auto',
              marginTop: isMobile ? '0' : '4px',
              minWidth: isMobile ? '220px' : '200px',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              animation: isMobile ? 'slideDown 0.3s ease-out' : 'none',
              borderTop: isMobile ? '1px solid #e5e7eb' : undefined
            }}>
              {countries.map((country, index) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '14px' : '12px',
                    padding: isMobile ? '16px 20px' : '12px 16px',
                    textAlign: 'left',
                    backgroundColor: selectedCountry.code === country.code ? '#3b82f6' : 'white',
                    color: selectedCountry.code === country.code ? 'white' : '#374151',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: isMobile ? '15px' : '14px',
                    fontWeight: isMobile ? '600' : '500',
                    minHeight: isMobile ? '52px' : '44px',
                    borderBottom: index === countries.length - 1 ? 'none' : '1px solid #e5e7eb',
                    borderRadius: index === 0 && isMobile 
                      ? '10px 10px 0 0' 
                      : index === countries.length - 1 && isMobile 
                        ? '0 0 10px 10px' 
                        : '0',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCountry.code !== country.code) {
                      e.currentTarget.style.backgroundColor = isMobile ? '#f0f9ff' : '#dbeafe';
                      e.currentTarget.style.color = '#1e40af';
                      if (isMobile) {
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCountry.code !== country.code) {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#374151';
                      if (isMobile) {
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }
                  }}
                >
                  <span style={{ 
                    fontSize: isMobile ? '20px' : '18px',
                    minWidth: isMobile ? '32px' : '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: selectedCountry.code === country.code 
                      ? 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))' 
                      : 'none'
                  }}>{country.flag}</span>
                  <span style={{ 
                    fontSize: isMobile ? '15px' : '14px', 
                    color: selectedCountry.code === country.code ? 'white' : '#6b7280',
                    fontWeight: isMobile ? '700' : '600',
                    minWidth: isMobile ? '55px' : '50px',
                    letterSpacing: '0.5px'
                  }}>{country.dialCode}</span>
                  <span style={{ 
                    fontSize: isMobile ? '15px' : '14px', 
                    color: selectedCountry.code === country.code ? 'white' : '#111827',
                    fontWeight: isMobile ? '600' : '500',
                    flex: 1,
                    letterSpacing: '0.3px'
                  }}>{country.name}</span>
                  {selectedCountry.code === country.code && (
                    <span style={{
                      fontSize: isMobile ? '16px' : '14px',
                      color: 'white',
                      fontWeight: '700',
                      marginLeft: '8px'
                    }}>✓</span>
                  )}
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