'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Check, ChevronDown, Globe } from 'lucide-react';
import { COUNTRIES, type Country } from '@/lib/data/countries';

interface NationalityComboboxProps {
  value?: string;
  onChange: (countryCode: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function NationalityCombobox({
  value,
  onChange,
  error,
  required,
  placeholder = 'Search country...',
  className = '',
}: NationalityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedCountry = COUNTRIES.find(c => c.code === value);

  // Filter countries - prioritize common ones at top
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex] as HTMLElement;
      highlightedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = useCallback((country: Country) => {
    onChange(country.code);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCountries[highlightedIndex]) {
          handleSelect(filteredCountries[highlightedIndex]);
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Trigger */}
      <div className="relative">
        <Globe
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={20}
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="nationality-listbox"
          aria-activedescendant={isOpen ? `country-${highlightedIndex}` : undefined}
          placeholder={selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={`w-full h-11 pl-11 pr-10 rounded-xl border-2 transition-all bg-white
            ${error
              ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
              : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
            }
            ${selectedCountry && !searchTerm ? 'text-gray-900' : ''}
          `}
          autoComplete="off"
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          size={20}
        />
      </div>

      {/* Dropdown - High z-index to appear above all containers */}
      {isOpen && (
        <ul
          id="nationality-listbox"
          ref={listRef}
          role="listbox"
          className="absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
          style={{ position: 'absolute', top: '100%' }}
        >
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country, idx) => (
              <li
                key={country.code}
                id={`country-${idx}`}
                role="option"
                aria-selected={value === country.code}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(country)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                    ${idx === highlightedIndex ? 'bg-gray-100' : ''}
                    ${value === country.code ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}
                    hover:bg-gray-100
                  `}
                >
                  <span className="text-xl flex-shrink-0">{country.flag}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  {value === country.code && (
                    <Check size={18} className="text-primary-500 flex-shrink-0" />
                  )}
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-gray-500 text-center text-sm">
              No countries found
            </li>
          )}
        </ul>
      )}

      {error && (
        <p className="mt-1 text-sm text-error" role="alert">{error}</p>
      )}
    </div>
  );
}

export default NationalityCombobox;
