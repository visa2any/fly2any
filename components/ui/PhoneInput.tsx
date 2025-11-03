'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Phone } from 'lucide-react';
import { COUNTRIES, type Country } from '@/lib/data/countries';

interface PhoneInputProps {
  value: string;
  onChange: (value: string, countryCode?: string) => void;
  defaultCountry?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  label?: string;
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry = 'US',
  placeholder = 'Enter phone number',
  required = false,
  error,
  label = 'Phone',
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    onChange(value, country.code);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue, selectedCountry.code);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {label} {required && <span className="text-error-500">*</span>}
        </label>
      )}

      <div className="relative z-10">
        {/* Phone Input Field */}
        <div className={`
          flex items-center border rounded-lg overflow-hidden transition-all
          ${error ? 'border-error-500' : 'border-gray-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500'}
        `}>
          {/* Country Selector */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border-r border-gray-300 transition-colors flex-shrink-0"
          >
            <span className="text-lg leading-none">{selectedCountry.flag}</span>
            <span className="text-xs font-medium text-gray-700">{selectedCountry.dialCode}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Phone Number Input */}
          <div className="flex-1 relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={value}
              onChange={handlePhoneChange}
              placeholder={placeholder}
              required={required}
              className="w-full pl-10 pr-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Country Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-primary-300 rounded-lg shadow-2xl z-dropdown max-h-64 overflow-hidden"
            style={{ minWidth: '280px' }}
          >
            {/* Search */}
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSearchQuery(e.target.value);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Search country..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Country List */}
            <div className="overflow-y-auto max-h-52">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCountrySelect(country);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-primary-50 transition-colors cursor-pointer
                      ${selectedCountry.code === country.code ? 'bg-primary-100' : ''}
                    `}
                  >
                    <span className="text-lg leading-none flex-shrink-0">{country.flag}</span>
                    <span className="flex-1 text-xs text-gray-900">{country.name}</span>
                    <span className="text-xs text-gray-500 font-medium">{country.dialCode}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-xs text-gray-500">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-error-500 mt-1">{error}</p>
      )}
    </div>
  );
}
