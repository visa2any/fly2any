'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { AIRPORTS, searchAirports, type Airport } from '@/lib/data/airports-all';

interface InlineAirportAutocompleteProps {
  value: string;
  onChange: (codes: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Get popular airports for initial display
const popularAirports = AIRPORTS.filter(a => a.popular).slice(0, 20);

/**
 * InlineAirportAutocomplete
 *
 * Simple inline airport code input with autocomplete dropdown.
 * Used primarily for car rental locations and simple airport inputs.
 */
export function InlineAirportAutocomplete({
  value,
  onChange,
  placeholder = 'Airport code',
  disabled = false
}: InlineAirportAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input when value prop changes
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions based on input
  const filterSuggestions = (query: string) => {
    if (!query || query.length < 1) {
      // Show popular airports when empty
      return popularAirports.slice(0, 10);
    }

    // Use the searchAirports helper which searches ALL 6,054 airports
    return searchAirports(query, 15);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const filtered = filterSuggestions(newValue);
    setSuggestions(filtered);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    const filtered = filterSuggestions(inputValue);
    setSuggestions(filtered);
    setShowDropdown(true);
  };

  const handleSelectAirport = (airport: Airport) => {
    setInputValue(airport.code);
    onChange([airport.code]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const filtered = filterSuggestions(inputValue);
        setSuggestions(filtered);
        setShowDropdown(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelectAirport(suggestions[highlightedIndex]);
        } else if (suggestions.length > 0) {
          // Auto-select first suggestion
          handleSelectAirport(suggestions[0]);
        } else if (inputValue.length === 3 && /^[A-Za-z]{3}$/.test(inputValue)) {
          // Allow direct 3-letter code entry
          const upperCode = inputValue.toUpperCase();
          onChange([upperCode]);
          setShowDropdown(false);
        }
        break;

      case 'Escape':
        setShowDropdown(false);
        inputRef.current?.blur();
        break;

      case 'Tab':
        // Allow tab to work normally, just close dropdown
        setShowDropdown(false);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // If user types a 3-letter code directly, accept it as an airport code
    if (inputValue.length === 3 && inputValue !== value && /^[A-Za-z]{3}$/.test(inputValue)) {
      const upperCode = inputValue.toUpperCase();
      onChange([upperCode]);
    }
    // Otherwise keep whatever value they typed (it might be a selected airport)
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          }`}
          size={20}
        />

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full min-h-[56px] max-h-[56px] h-[56px] pl-11 pr-10
            text-base font-medium
            border border-gray-200 rounded-lg
            transition-all duration-200
            ${disabled
              ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-900 hover:border-gray-300 focus:border-[#0087FF] focus:ring-2 focus:ring-[#0087FF]/20'
            }
            outline-none
            overflow-hidden
          `}
          style={{ lineHeight: '56px' }}
        />

        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto">
          {suggestions.map((airport, index) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => handleSelectAirport(airport)}
              className={`
                w-full px-4 py-3 text-left
                flex items-center gap-3
                transition-colors
                ${index === highlightedIndex
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
                }
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}
              `}
            >
              <span className="text-xl">{airport.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{airport.code}</span>
                  <span className="text-sm text-gray-600">{airport.city}, {airport.country}</span>
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {airport.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
