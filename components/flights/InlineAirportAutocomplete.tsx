'use client';

import { useState, useEffect, useRef } from 'react';
import { Plane } from 'lucide-react';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  emoji: string;
}

interface Props {
  value: string;
  onChange: (value: string, airport?: Airport) => void;
  placeholder: string;
  onClose?: () => void;
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
];

export function InlineAirportAutocomplete({ value, onChange, placeholder, onClose }: Props) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectAirport = (airport: Airport) => {
    const value = `${airport.city} (${airport.code})`;
    setInputValue(value);
    onChange(value, airport);
    setIsOpen(false);
    onClose?.();
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

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
      onClose?.();
    }
  };

  return (
    <>
      <div className="relative">
        <Plane className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-4 bg-white border border-gray-300 rounded-lg focus:border-[#0087FF] hover:border-[#0087FF] outline-none transition-all duration-200 ease-in-out text-base font-medium text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Dropdown - Always positioned below */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full z-[100] w-full min-w-[280px] max-w-[350px] mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {suggestions.map((airport, index) => (
            <button
              key={airport.code}
              onClick={() => handleSelectAirport(airport)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-3 py-2.5 flex items-center gap-2.5 transition-all duration-200 ease-in-out ${
                index === highlightedIndex
                  ? 'bg-gradient-to-r from-[#E6F3FF] to-[#CCE7FF]'
                  : 'hover:bg-gray-50'
              } ${index === 0 ? 'rounded-t-xl' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-xl' : ''
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                {airport.emoji}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold text-gray-900 text-xs">
                  <span className="text-[#0087FF] font-bold">{airport.code}</span> - {airport.city}
                </div>
                <div className="text-[10px] text-gray-500 truncate">{airport.name}, {airport.country}</div>
              </div>
            </button>
          ))}

          {suggestions.length === 0 && inputValue.length > 0 && (
            <div className="px-3 py-6 text-center text-gray-400">
              <div className="text-2xl mb-2">✈️</div>
              <div className="text-xs">No airports found</div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
