'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PhoneIcon } from './Icons';
import '@/styles/premium-phone-selector.css';

// ULTRATHINK: Enhanced interface with priority and search capabilities
interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  searchTerms?: string;
  priority?: number;
}

// ULTRATHINK: Top 5 most popular countries for Brazilian travelers
const TOP_COUNTRIES = ['BR', 'US', 'PT', 'AR', 'MX'];

const countries: Country[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', dialCode: '+55', priority: 1, searchTerms: 'brasil brazil br' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', dialCode: '+1', priority: 2, searchTerms: 'estados unidos usa america us eua' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351', priority: 3, searchTerms: 'portugal pt lusitania' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54', priority: 4, searchTerms: 'argentina ar' },
  { code: 'MX', name: 'México', flag: '🇲🇽', dialCode: '+52', priority: 5, searchTerms: 'mexico mx mejico' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', dialCode: '+1', searchTerms: 'canada ca' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56', searchTerms: 'chile cl' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴', dialCode: '+57', searchTerms: 'colombia co' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51', searchTerms: 'peru pe' },
  { code: 'UY', name: 'Uruguai', flag: '🇺🇾', dialCode: '+598', searchTerms: 'uruguai uruguay uy' },
  { code: 'PY', name: 'Paraguai', flag: '🇵🇾', dialCode: '+595', searchTerms: 'paraguai paraguay py' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸', dialCode: '+34', searchTerms: 'espanha spain es' },
  { code: 'FR', name: 'França', flag: '🇫🇷', dialCode: '+33', searchTerms: 'franca france fr' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪', dialCode: '+49', searchTerms: 'alemanha germany de deutschland' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹', dialCode: '+39', searchTerms: 'italia italy it' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', dialCode: '+44', searchTerms: 'reino unido uk england gb grã-bretanha' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺', dialCode: '+61', searchTerms: 'australia au' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵', dialCode: '+81', searchTerms: 'japao japan jp' },
  { code: 'KR', name: 'Coreia do Sul', flag: '🇰🇷', dialCode: '+82', searchTerms: 'coreia sul korea kr' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86', searchTerms: 'china cn' },
];

// ULTRATHINK: Enhanced localStorage management for recent selections
const RECENT_COUNTRIES_KEY = 'fly2any_recent_countries';
const MAX_RECENT = 3;

const getRecentCountries = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const recent = localStorage.getItem(RECENT_COUNTRIES_KEY);
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
};

const addRecentCountry = (countryCode: string) => {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentCountries();
    const filtered = recent.filter(code => code !== countryCode);
    const updated = [countryCode, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_COUNTRIES_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is not available
  }
};

// ULTRATHINK: Fuzzy search implementation
const fuzzySearch = (searchTerm: string, country: Country): boolean => {
  if (!searchTerm) return true;
  const term = searchTerm.toLowerCase().trim();
  
  const searchableText = [
    country.name.toLowerCase(),
    country.code.toLowerCase(),
    country.dialCode.replace('+', ''),
    country.searchTerms?.toLowerCase() || ''
  ].join(' ');
  
  return searchableText.includes(term);
};

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
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentCountries, setRecentCountries] = useState<string[]>([]);
  const [animatingCountry, setAnimatingCountry] = useState<string | null>(null);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // ULTRATHINK: Load recent countries on component mount
  useEffect(() => {
    setRecentCountries(getRecentCountries());
  }, []);

  // ULTRATHINK: Detect mobile viewport and calculate position
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isDropdownOpen && buttonRef.current && isMobile) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: Math.max(16, rect.left - 50),
        width: Math.min(window.innerWidth - 32, 380)
      });
    }
  }, [isDropdownOpen, isMobile]);

  // Close dropdown when clicking outside and manage body scroll for mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && 
          dropdownRef.current && 
          buttonRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          !buttonRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Prevent body scrolling on mobile when dropdown is open
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        // Restore body scrolling
        if (isMobile) {
          document.body.style.overflow = '';
        }
      };
    }
  }, [isDropdownOpen, isMobile]);

  // ULTRATHINK: Enhanced country selection with premium animations
  const handleCountrySelect = (country: Country) => {
    setAnimatingCountry(country.code);
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchTerm('');
    
    // Restore body scrolling when dropdown closes
    if (isMobile) {
      document.body.style.overflow = '';
    }
    
    const phoneNumber = value.replace(/^\+\d+\s?/, '');
    const fullNumber = country.dialCode + ' ' + phoneNumber;
    onChange(fullNumber);
    
    addRecentCountry(country.code);
    setRecentCountries(getRecentCountries());
    
    setTimeout(() => setAnimatingCountry(null), 400);
    
    // Enhanced haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 20]);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const fullNumber = selectedCountry.dialCode + ' ' + inputValue;
    onChange(fullNumber);
  };

  // ULTRATHINK: Smart country organization with enhanced tiered display
  const organizedCountries = useMemo(() => {
    const filtered = countries.filter(country => fuzzySearch(searchTerm, country));
    
    if (!searchTerm) {
      const recent = recentCountries
        .map(code => countries.find(c => c.code === code))
        .filter(Boolean) as Country[];
      
      const topCountries = TOP_COUNTRIES
        .map(code => countries.find(c => c.code === code))
        .filter(Boolean) as Country[];
      
      const otherCountries = countries.filter(
        c => !TOP_COUNTRIES.includes(c.code) && !recentCountries.includes(c.code)
      );
      
      return { recent, top: topCountries, other: otherCountries };
    } else {
      return { recent: [], top: [], other: filtered };
    }
  }, [searchTerm, recentCountries]);
  
  const handleDropdownOpen = () => {
    setIsDropdownOpen(true);
    if (isMobile) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200);
    }
  };

  const phoneNumber = value.replace(/^\+\d+\s?/, '');

  // ULTRATHINK: Premium country section renderer with enhanced visuals
  const renderCountrySection = (countries: Country[], title?: string, icon?: string) => {
    if (countries.length === 0) return null;
    
    return (
      <div key={title}>
        {title && (
          <div className="phone-section-header">
            {icon && <span className="phone-section-icon">{icon}</span>}
            <span>{title}</span>
          </div>
        )}
        {countries.map((country) => (
          <button
            key={country.code}
            type="button"
            onClick={() => handleCountrySelect(country)}
            className={`phone-country-item phone-ripple phone-country-item-button ${isMobile ? 'mobile' : ''} ${selectedCountry.code === country.code ? 'selected' : ''}`}
          >
            <span 
              className={`phone-flag phone-flag-in-item ${isMobile ? 'mobile' : ''}`}
            >
              {country.flag}
            </span>
            <span 
              className={`phone-dial-code phone-dial-code-in-item ${isMobile ? 'mobile' : ''}`}
            >
              {country.dialCode}
            </span>
            <span className={`phone-country-name ${isMobile ? 'mobile' : ''} ${selectedCountry.code === country.code ? 'selected' : ''}`}>
              {country.name}
            </span>
            {selectedCountry.code === country.code && (
              <span className="phone-check-mark">✓</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`phone-component-wrapper ${className || ''}`}>
      {label && (
        <label className="phone-label">
          {label} {required && <span className="phone-required">*</span>}
        </label>
      )}
      
      <div className="phone-selector-container">
        {/* Premium Country Selector Button */}
        <div className="phone-selector-wrapper">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => {
              if (isDropdownOpen) {
                setIsDropdownOpen(false);
                if (isMobile) {
                  document.body.style.overflow = '';
                }
              } else {
                handleDropdownOpen();
              }
            }}
            className="phone-country-button phone-country-select"
          >
            <span className="phone-flag phone-flag-icon">
              {selectedCountry.flag}
            </span>
            <span className="phone-dial-code">
              {selectedCountry.dialCode}
            </span>
            <span className={`phone-dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
              ▼
            </span>
          </button>

          {/* Premium Desktop Dropdown */}
          {isDropdownOpen && !isMobile && (
            <div 
              ref={dropdownRef}
              className="phone-dropdown-premium phone-dropdown-desktop"
            >
              {/* Premium Search Bar */}
              <div className="phone-search-container">
                <div className="phone-search-header-desktop">
                  <span className="phone-search-header-globe-desktop">🌍</span>
                  Selecione o País
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Digite para buscar..."
                  className="phone-search-input phone-search-input-desktop"
                />
              </div>

              {/* Countries List */}
              <div className="phone-countries-list-container">
                {searchTerm ? (
                  renderCountrySection(organizedCountries.other, 'Resultados da Busca', '🔍')
                ) : (
                  <>
                    {renderCountrySection(organizedCountries.recent, 'Usados Recentemente', '⏰')}
                    {renderCountrySection(organizedCountries.top, 'Mais Populares', '⭐')}
                    {renderCountrySection(organizedCountries.other, 'Todos os Países', '🌍')}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Premium Mobile Dropdown with Fixed Positioning */}
        {isDropdownOpen && isMobile && dropdownPosition && (
          <>
            {/* Mobile-Optimized Backdrop */}
            <div 
              className="phone-backdrop"
              onClick={() => {
                setIsDropdownOpen(false);
                if (isMobile) {
                  document.body.style.overflow = '';
                }
              }}
            />
            
            {/* Mobile-Optimized Centered Dropdown */}
            <div 
              ref={dropdownRef}
              className="phone-dropdown-premium-mobile phone-dropdown-mobile-centered"
            >
              {/* Enhanced Premium Search Bar for Mobile */}
              <div className="phone-search-container">
                <div className="phone-search-header-mobile">
                  <span className="phone-search-header-globe-mobile">🌍</span>
                  Selecione o País
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Digite para buscar..."
                  className="phone-search-input phone-search-input-mobile"
                />
              </div>
              
              {/* Countries List */}
              {searchTerm ? (
                renderCountrySection(organizedCountries.other, 'Resultados da Busca', '🔍')
              ) : (
                <>
                  {renderCountrySection(organizedCountries.recent, 'Usados Recentemente', '⏰')}
                  {renderCountrySection(organizedCountries.top, 'Mais Populares', '⭐')}
                  {renderCountrySection(organizedCountries.other, 'Todos os Países', '🌍')}
                </>
              )}
            </div>
          </>
        )}

        {/* Premium Phone Number Input */}
        <div className="phone-main-input-wrapper">
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`phone-input-field phone-number-input ${isMobile ? 'mobile' : ''} ${inputClassName || ''}`}
          />
          <PhoneIcon className={`phone-icon-positioned ${isMobile ? 'mobile' : ''}`} />
        </div>
      </div>

      {/* Premium Error Message */}
      {touched && error && (
        <div className="phone-error">
          <span className="phone-error-icon-in-message">⚠️</span>
          <span className="phone-error-text-in-message">{error}</span>
        </div>
      )}
    </div>
  );
};

export default PhoneInputSimple;