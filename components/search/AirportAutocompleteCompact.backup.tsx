'use client';

import { useState, useEffect, useRef } from 'react';
import { Plane, MapPin } from 'lucide-react';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  emoji: string;
}

interface Props {
  placeholder: string;
  value: string;
  onChange: (code: string, airport?: Airport) => void;
  className?: string;
}

// Popular airports data
const popularAirports: Airport[] = [
  { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA', emoji: '🗽' },
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', emoji: '🌴' },
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', emoji: '🇬🇧' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', emoji: '🗼' },
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'UAE', emoji: '🏙️' },
  { code: 'NRT', name: 'Narita Intl', city: 'Tokyo', country: 'Japan', emoji: '🗾' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', emoji: '🇸🇬' },
  { code: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'USA', emoji: '🏖️' },
  { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'USA', emoji: '🌉' },
  { code: 'ORD', name: 'O\'Hare Intl', city: 'Chicago', country: 'USA', emoji: '🏙️' },
  { code: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
  { code: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'Italy', emoji: '🏛️' },
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia', emoji: '🦘' },
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada', emoji: '🇨🇦' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', emoji: '🇩🇪' },
];

export function AirportAutocompleteCompact({ placeholder, value, onChange, className = '' }: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    // Filter airports based on input
    if (inputValue.length >= 1) {
      const filtered = popularAirports.filter(airport =>
        airport.code.toLowerCase().includes(inputValue.toLowerCase()) ||
        airport.city.toLowerCase().includes(inputValue.toLowerCase()) ||
        airport.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        airport.country.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions(popularAirports.slice(0, 6));
    }
  }, [inputValue]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val); // Update parent immediately as user types
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectAirport = (airport: Airport) => {
    const value = `${airport.code} - ${airport.city}`;
    setInputValue(value);
    onChange(value, airport);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectAirport(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Plane className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-[42px] pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-[70] w-full mt-1 bg-white rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Airport suggestions */}
          {suggestions.map((airport, index) => (
            <button
              key={airport.code}
              onClick={() => handleSelectAirport(airport)}
              className={`w-full px-3 py-2.5 flex items-center gap-3 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                index === highlightedIndex
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-gray-50 text-gray-900'
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                {airport.emoji}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-semibold truncate">
                  <span className={index === highlightedIndex ? 'text-primary-600' : 'text-primary-600'}>
                    {airport.code}
                  </span> - {airport.city}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {airport.name}, {airport.country}
                </div>
              </div>
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </button>
          ))}

          {suggestions.length === 0 && inputValue.length > 0 && (
            <div className="px-4 py-6 text-center text-gray-400">
              <Plane className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <div className="text-sm">No airports found</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
