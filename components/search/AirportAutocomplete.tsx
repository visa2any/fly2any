'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Plane, MapPin } from 'lucide-react';
import { zIndex } from '@/lib/design-system';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  emoji: string;
}

type Variant = 'default' | 'compact' | 'inline';
type Size = 'small' | 'medium' | 'large';

interface Props {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string, airport?: Airport) => void;
  icon?: React.ReactNode;
  showExplore?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
  useApi?: boolean; // Enable/disable API calls
}

// Popular airports data (fallback) - Now includes South America, Central America & Caribbean
const popularAirports: Airport[] = [
  // North America
  { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA', emoji: '🗽' },
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', emoji: '🌴' },
  { code: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'USA', emoji: '🏖️' },
  { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'USA', emoji: '🌉' },
  { code: 'ORD', name: 'O\'Hare Intl', city: 'Chicago', country: 'USA', emoji: '🏙️' },
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada', emoji: '🇨🇦' },

  // Europe
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', emoji: '🇬🇧' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', emoji: '🗼' },
  { code: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
  { code: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'Italy', emoji: '🏛️' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', emoji: '🇩🇪' },

  // Asia & Middle East
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'UAE', emoji: '🏙️' },
  { code: 'NRT', name: 'Narita Intl', city: 'Tokyo', country: 'Japan', emoji: '🗾' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', emoji: '🇸🇬' },

  // Oceania
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia', emoji: '🦘' },

  // South America
  { code: 'GRU', name: 'São Paulo/Guarulhos Intl', city: 'São Paulo', country: 'Brazil', emoji: '🇧🇷' },
  { code: 'GIG', name: 'Rio de Janeiro/Galeão Intl', city: 'Rio de Janeiro', country: 'Brazil', emoji: '🏖️' },
  { code: 'EZE', name: 'Ministro Pistarini Intl', city: 'Buenos Aires', country: 'Argentina', emoji: '🥩' },
  { code: 'BOG', name: 'El Dorado Intl', city: 'Bogotá', country: 'Colombia', emoji: '☕' },
  { code: 'LIM', name: 'Jorge Chávez Intl', city: 'Lima', country: 'Peru', emoji: '🦙' },
  { code: 'SCL', name: 'Arturo Merino Benítez Intl', city: 'Santiago', country: 'Chile', emoji: '🏔️' },

  // Central America
  { code: 'MEX', name: 'Mexico City Intl', city: 'Mexico City', country: 'Mexico', emoji: '🌮' },
  { code: 'CUN', name: 'Cancún Intl', city: 'Cancún', country: 'Mexico', emoji: '🏝️' },
  { code: 'PTY', name: 'Tocumen Intl', city: 'Panama City', country: 'Panama', emoji: '🚢' },
  { code: 'SJO', name: 'Juan Santamaría Intl', city: 'San José', country: 'Costa Rica', emoji: '🌋' },
  { code: 'GDL', name: 'Guadalajara Intl', city: 'Guadalajara', country: 'Mexico', emoji: '🎺' },

  // Caribbean
  { code: 'PUJ', name: 'Punta Cana Intl', city: 'Punta Cana', country: 'Dominican Republic', emoji: '🏖️' },
  { code: 'SJU', name: 'Luis Muñoz Marín Intl', city: 'San Juan', country: 'Puerto Rico', emoji: '🏝️' },
  { code: 'NAS', name: 'Lynden Pindling Intl', city: 'Nassau', country: 'Bahamas', emoji: '🐠' },
  { code: 'MBJ', name: 'Sangster Intl', city: 'Montego Bay', country: 'Jamaica', emoji: '🎵' },
  { code: 'CUR', name: 'Curaçao Intl', city: 'Willemstad', country: 'Curaçao', emoji: '🎨' },
];

// In-memory cache for API results
const apiCache = new Map<string, { data: Airport[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Map Amadeus location type to emoji
function getLocationEmoji(type: string, city: string): string {
  if (type === 'AIRPORT') return '✈️';
  if (type === 'CITY') return '🏙️';

  // City-specific emojis
  const cityEmojis: Record<string, string> = {
    'New York': '🗽', 'Paris': '🗼', 'London': '🇬🇧', 'Tokyo': '🗾',
    'Dubai': '🏙️', 'Singapore': '🇸🇬', 'Sydney': '🦘', 'Miami': '🏖️',
    'Barcelona': '🇪🇸', 'Rome': '🏛️', 'San Francisco': '🌉',
  };

  return cityEmojis[city] || '📍';
}

export function AirportAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  icon,
  showExplore = false,
  variant = 'default',
  size = 'medium',
  className = '',
  useApi = true,
}: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiEnabled, setApiEnabled] = useState(useApi);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // API search function
  const searchAirportsAPI = useCallback(async (keyword: string) => {
    if (keyword.length < 2) {
      setSuggestions(popularAirports.slice(0, 6));
      return;
    }

    // Check cache first
    const cacheKey = keyword.toLowerCase();
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSuggestions(cached.data);
      return;
    }

    // Abort previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setIsLoading(true);

    try {
      const response = await fetch(`/api/flights/airports?keyword=${encodeURIComponent(keyword)}`, {
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        const airports: Airport[] = result.data.map((location: any) => ({
          code: location.iataCode,
          name: location.name,
          city: location.address?.cityName || location.name,
          country: location.address?.countryName || location.address?.countryCode || '',
          emoji: getLocationEmoji(location.subType, location.address?.cityName || location.name),
        }));

        // Cache the results
        apiCache.set(cacheKey, { data: airports, timestamp: Date.now() });
        setSuggestions(airports);
      } else {
        // Fallback to static data if API returns empty
        const filtered = popularAirports.filter(airport =>
          airport.code.toLowerCase().includes(keyword.toLowerCase()) ||
          airport.city.toLowerCase().includes(keyword.toLowerCase()) ||
          airport.name.toLowerCase().includes(keyword.toLowerCase())
        ).slice(0, 6);
        setSuggestions(filtered);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }

      console.error('API search failed, using static data:', error);
      setApiEnabled(false); // Disable API for this session

      // Fallback to static filtering
      const filtered = popularAirports.filter(airport =>
        airport.code.toLowerCase().includes(keyword.toLowerCase()) ||
        airport.city.toLowerCase().includes(keyword.toLowerCase()) ||
        airport.name.toLowerCase().includes(keyword.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Static search function (fallback)
  const searchAirportsStatic = useCallback((keyword: string) => {
    if (keyword.length >= 1) {
      const filtered = popularAirports.filter(airport =>
        airport.code.toLowerCase().includes(keyword.toLowerCase()) ||
        airport.city.toLowerCase().includes(keyword.toLowerCase()) ||
        airport.name.toLowerCase().includes(keyword.toLowerCase()) ||
        airport.country.toLowerCase().includes(keyword.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions(popularAirports.slice(0, 6));
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer (300ms debounce)
    debounceTimer.current = setTimeout(() => {
      if (apiEnabled) {
        searchAirportsAPI(inputValue);
      } else {
        searchAirportsStatic(inputValue);
      }
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, apiEnabled, searchAirportsAPI, searchAirportsStatic]);

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

  const handleSelectAirport = (airport: Airport | 'explore') => {
    if (airport === 'explore') {
      const value = 'Anywhere ✈️';
      setInputValue(value);
      onChange(value);
    } else {
      const value = `${airport.code} - ${airport.city}`;
      setInputValue(value);
      onChange(value, airport);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();

      // If an item is highlighted, use it
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelectAirport(suggestions[highlightedIndex]);
      }
      // If no item highlighted but input looks like IATA code (2-4 letters), use it directly
      else if (inputValue.length >= 2 && inputValue.length <= 4 && /^[a-zA-Z]+$/.test(inputValue)) {
        const code = inputValue.toUpperCase().slice(0, 3);
        handleSelectAirport({
          code,
          name: `${code} Airport`,
          city: 'Unknown',
          country: '',
          emoji: '✈️',
        });
      }
      // Otherwise just close dropdown (user can submit form with current value)
      else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Size-based styles
  const sizeStyles = {
    small: {
      input: 'h-[36px] text-sm',
      padding: icon ? 'pl-9 pr-3 py-1.5' : 'pl-3 pr-3 py-1.5',
      iconSize: 'w-3.5 h-3.5',
      iconLeft: 'left-2.5',
      emojiBox: 'w-7 h-7 text-base',
      textSize: 'text-xs',
    },
    medium: {
      input: 'h-[42px] text-sm',
      padding: icon ? 'pl-10 pr-3 py-2' : 'pl-3 pr-3 py-2',
      iconSize: 'w-4 h-4',
      iconLeft: 'left-3',
      emojiBox: 'w-8 h-8 text-lg',
      textSize: 'text-sm',
    },
    large: {
      input: 'h-[56px] text-lg',
      padding: icon ? 'pl-12 pr-4 py-4' : 'pl-4 pr-4 py-4',
      iconSize: 'w-5 h-5',
      iconLeft: 'left-4',
      emojiBox: 'w-10 h-10 text-2xl',
      textSize: 'text-base',
    },
  };

  // Variant-based styles
  const variantStyles = {
    default: {
      input: 'border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      dropdown: 'border-2 border-gray-200 rounded-2xl shadow-2xl',
      label: 'block text-sm font-semibold text-gray-700 mb-2',
    },
    compact: {
      input: 'bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500',
      dropdown: 'rounded-xl shadow-xl',
      label: 'block text-xs font-medium text-gray-600 mb-1',
    },
    inline: {
      input: 'border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-400 focus:border-primary-400',
      dropdown: 'rounded-lg shadow-lg',
      label: 'block text-xs font-semibold text-gray-600 mb-1',
    },
  };

  const styles = {
    size: sizeStyles[size],
    variant: variantStyles[variant],
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={styles.variant.label}>
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className={`absolute ${styles.size.iconLeft} top-1/2 -translate-y-1/2 text-gray-400`}>
            {typeof icon === 'string' ? (
              <span className={styles.size.iconSize}>{icon}</span>
            ) : (
              icon
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full ${styles.size.input} ${styles.size.padding} ${styles.variant.input} outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-400`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-dropdown w-full mt-${variant === 'default' ? '2' : '1'} bg-white ${styles.variant.dropdown} max-h-${variant === 'compact' ? '80' : '96'} overflow-y-auto ${variant === 'compact' ? 'animate-in fade-in slide-in-from-top-2 duration-200' : ''}`}
        >
          {/* Loading state */}
          {isLoading && (
            <div className="px-4 py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <div className="mt-2 text-sm text-gray-500">Searching airports...</div>
            </div>
          )}

          {/* Results */}
          {!isLoading && (
            <>
              {/* Explore option */}
              {showExplore && variant === 'default' && (
                <button
                  onClick={() => handleSelectAirport('explore')}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-colors border-b border-gray-100"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-xl">
                    🌍
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-gray-900">Explore Anywhere</div>
                    <div className="text-xs text-gray-500">Find the cheapest destinations</div>
                  </div>
                  <div className="text-primary-600 font-semibold text-sm">✨</div>
                </button>
              )}

              {/* Airport suggestions */}
              {suggestions.map((airport, index) => (
                <button
                  key={airport.code}
                  onClick={() => handleSelectAirport(airport)}
                  className={`w-full px-${variant === 'compact' ? '3' : '4'} py-${variant === 'compact' ? '2.5' : '3'} flex items-center gap-3 transition-colors ${
                    variant === 'compact' ? 'first:rounded-t-xl last:rounded-b-xl' : ''
                  } ${
                    index === highlightedIndex
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <div className={`${styles.size.emojiBox} bg-gradient-to-br from-gray-100 to-gray-200 rounded-${variant === 'compact' ? 'lg' : 'xl'} flex items-center justify-center flex-shrink-0`}>
                    {airport.emoji}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className={`${styles.size.textSize} font-semibold truncate`}>
                      <span className={index === highlightedIndex ? 'text-primary-600' : 'text-primary-600'}>
                        {airport.code}
                      </span> - {airport.city}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {airport.name}, {airport.country}
                    </div>
                  </div>
                  {variant === 'compact' && (
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
              ))}

              {/* Manual IATA Code Input - Allow any 3-letter code */}
              {suggestions.length === 0 && inputValue.length >= 2 && inputValue.length <= 4 && (
                <button
                  onClick={() => {
                    const code = inputValue.toUpperCase().slice(0, 3);
                    handleSelectAirport({
                      code,
                      name: `${code} Airport`,
                      city: 'Unknown',
                      country: '',
                      emoji: '✈️',
                    });
                  }}
                  className={`w-full px-${variant === 'compact' ? '3' : '4'} py-${variant === 'compact' ? '3' : '4'} flex items-center gap-3 hover:bg-blue-50 transition-colors border-2 border-dashed border-blue-300 ${
                    variant === 'compact' ? 'rounded-xl' : 'rounded-xl'
                  } m-2`}
                >
                  <div className={`${sizeStyles[size].emojiBox} bg-gradient-to-br from-blue-100 to-blue-200 rounded-${variant === 'compact' ? 'lg' : 'xl'} flex items-center justify-center flex-shrink-0`}>
                    ✈️
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`${sizeStyles[size].textSize} font-bold text-blue-600`}>
                      Use "{inputValue.toUpperCase()}"
                    </div>
                    <div className="text-xs text-gray-500">
                      Use this airport code directly
                    </div>
                  </div>
                  <div className="text-blue-600 font-semibold">→</div>
                </button>
              )}

              {suggestions.length === 0 && (inputValue.length === 0 || inputValue.length > 4) && (
                <div className={`px-4 py-${variant === 'compact' ? '6' : '8'} text-center text-gray-400`}>
                  {variant === 'compact' ? (
                    <>
                      <Plane className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <div className="text-sm">Type an airport code</div>
                      <div className="text-xs mt-1">Example: GRU, JFK, LAX</div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">✈️</div>
                      <div>Type an airport code</div>
                      <div className="text-xs mt-2">Example: GRU, JFK, LAX, CGH</div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
