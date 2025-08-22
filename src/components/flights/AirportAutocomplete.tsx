'use client';

/**
 * 🛫 AIRPORT AUTOCOMPLETE COMPONENT
 * Advanced airport search with global database integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AirportSelection } from '@/types/flights';
import { FlightIcon, ClockIcon } from '@/components/Icons';

// Import airport databases
import { US_AIRPORTS_DATABASE } from '@/lib/airports/us-airports-database';
import { BRAZIL_AIRPORTS_DATABASE } from '@/lib/airports/brazil-airports-database';
import { SOUTH_AMERICA_AIRPORTS_DATABASE } from '@/lib/airports/south-america-airports-database';
import { NORTH_CENTRAL_AMERICA_AIRPORTS_DATABASE } from '@/lib/airports/north-central-america-airports-database';
import { ASIA_AIRPORTS_DATABASE } from '@/lib/airports/asia-airports-database';
import { EUROPE_AIRPORTS_DATABASE } from '@/lib/airports/europe-airports-database';
import { AFRICA_AIRPORTS_DATABASE } from '@/lib/airports/africa-airports-database';
import { OCEANIA_AIRPORTS_DATABASE } from '@/lib/airports/oceania-airports-database';

interface AirportAutocompleteProps {
  value: AirportSelection;
  onChange: (airport: AirportSelection) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

interface EnhancedAirport extends AirportSelection {
  region: string;
  timezone?: string;
  popularity?: number;
  type?: 'major' | 'regional' | 'international';
}

// Combine all airport databases
const getAllAirports = (): EnhancedAirport[] => {
  const allAirports: EnhancedAirport[] = [];
  
  // Add US airports
  US_AIRPORTS_DATABASE.forEach(airport => {
    allAirports.push({
      ...airport,
      region: 'North America',
      popularity: 5, // US airports get high popularity
      type: 'major'
    });
  });

  // Add Brazil airports
  BRAZIL_AIRPORTS_DATABASE.forEach(airport => {
    allAirports.push({
      ...airport,
      region: 'South America',
      popularity: 4,
      type: 'international'
    });
  });

  // Add other regions with lower priority
  [
    { db: SOUTH_AMERICA_AIRPORTS_DATABASE, region: 'South America' },
    { db: NORTH_CENTRAL_AMERICA_AIRPORTS_DATABASE, region: 'Central America' },
    { db: ASIA_AIRPORTS_DATABASE, region: 'Asia' },
    { db: EUROPE_AIRPORTS_DATABASE, region: 'Europe' },
    { db: AFRICA_AIRPORTS_DATABASE, region: 'Africa' },
    { db: OCEANIA_AIRPORTS_DATABASE, region: 'Oceania' }
  ].forEach(({ db, region }) => {
    db.forEach(airport => {
      allAirports.push({
        ...airport,
        region,
        popularity: 3,
        type: 'international'
      });
    });
  });

  return allAirports;
};

const AIRPORTS_DATABASE = getAllAirports();

export default function AirportAutocomplete({
  value,
  onChange,
  placeholder = "Search airports...",
  disabled = false,
  error,
  className = ''
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EnhancedAirport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<AirportSelection[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentAirportSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Update query when value changes externally
  useEffect(() => {
    if (value.iataCode && value.city) {
      const expectedQuery = `${value.iataCode} - ${value.city}`;
      if (query !== expectedQuery) {
        setQuery(expectedQuery);
      }
    } else if (!value.iataCode && query && !query.includes(' - ')) {
      // Don't clear the query if user is actively typing
      // Only clear if it's not a user-typed search term
    }
  }, [value, query]);

  // Search airports
  useEffect(() => {
    if (!query.trim()) {
      setResults(recentSearches.length > 0 
        ? recentSearches.slice(0, 5).map(airport => ({
            ...airport,
            region: 'Recent',
            popularity: 5,
            type: 'major' as const
          }))
        : AIRPORTS_DATABASE
            .filter(airport => (airport.popularity ?? 0) >= 4)
            .slice(0, 10)
      );
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const matches = AIRPORTS_DATABASE.filter(airport => {
      const basicMatch = (
        airport.iataCode.toLowerCase().includes(searchTerm) ||
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.city.toLowerCase().includes(searchTerm) ||
        airport.country.toLowerCase().includes(searchTerm)
      );
      
      // Check searchKeywords if they exist (for enhanced search)
      const keywordMatch = (airport as any).searchKeywords && 
        (airport as any).searchKeywords.some((keyword: string) => 
          keyword.toLowerCase().includes(searchTerm)
        );
      
      return basicMatch || keywordMatch;
    });

    // Sort by relevance
    const sortedMatches = matches.sort((a, b) => {
      // Exact IATA code match gets highest priority
      if (a.iataCode.toLowerCase() === searchTerm) return -1;
      if (b.iataCode.toLowerCase() === searchTerm) return 1;

      // IATA code starts with search term
      if (a.iataCode.toLowerCase().startsWith(searchTerm) && !b.iataCode.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.iataCode.toLowerCase().startsWith(searchTerm) && !a.iataCode.toLowerCase().startsWith(searchTerm)) return 1;

      // City name starts with search term
      if (a.city.toLowerCase().startsWith(searchTerm) && !b.city.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.city.toLowerCase().startsWith(searchTerm) && !a.city.toLowerCase().startsWith(searchTerm)) return 1;

      // Sort by popularity
      return (b.popularity || 0) - (a.popularity || 0);
    });

    setResults(sortedMatches.slice(0, 8));
    setSelectedIndex(-1);
  }, [query, recentSearches]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    
    // Clear selection if user is typing
    if (newQuery !== `${value.iataCode} - ${value.city}`) {
      onChange({ iataCode: '', name: '', city: '', country: '' });
    }
  };

  const handleAirportSelect = (airport: EnhancedAirport) => {
    const selectedAirport: AirportSelection = {
      iataCode: airport.iataCode,
      name: airport.name,
      city: airport.city,
      country: airport.country
    };

    onChange(selectedAirport);
    setQuery(`${airport.iataCode} - ${airport.city}`);
    setIsOpen(false);
    setSelectedIndex(-1);

    // Save to recent searches
    const updatedRecent = [
      selectedAirport,
      ...recentSearches.filter(a => a.iataCode !== airport.iataCode)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentAirportSearches', JSON.stringify(updatedRecent));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleAirportSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const getAirportIcon = (airport: EnhancedAirport) => {
    if (airport.region === 'Recent') return '🕒';
    if (airport.type === 'major') return '🛫';
    if (airport.type === 'international') return '🌍';
    return '✈️';
  };

  const getRegionFlag = (region: string) => {
    switch (region) {
      case 'North America': return '🇺🇸';
      case 'South America': return '🇧🇷';
      case 'Europe': return '🇪🇺';
      case 'Asia': return '🌏';
      case 'Africa': return '🌍';
      case 'Oceania': return '🇦🇺';
      case 'Recent': return '🕒';
      default: return '🌎';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay closing to allow clicks on results
            setTimeout(() => setIsOpen(false), 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />
        <FlightIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        {query && !disabled && (
          <button
            onClick={() => {
              setQuery('');
              onChange({ iataCode: '', name: '', city: '', country: '' });
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {/* Header for recent searches */}
            {!query.trim() && recentSearches.length > 0 && (
              <div className="px-4 py-2 border-b bg-gray-50 text-sm font-medium text-gray-600 flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                Recent Searches
              </div>
            )}

            {results.map((airport, index) => (
              <motion.button
                key={`${airport.iataCode}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleAirportSelect(airport)}
                className={`
                  w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0
                  ${selectedIndex === index ? 'bg-blue-50' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getAirportIcon(airport)}</span>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {airport.iataCode} - {airport.city}
                      </div>
                      <div className="text-sm text-gray-600">
                        {airport.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span>{getRegionFlag(airport.region)}</span>
                        <span>{airport.country}</span>
                        {airport.region !== 'Recent' && (
                          <span className="ml-2 bg-gray-200 px-2 py-0.5 rounded text-xs">
                            {airport.region}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {(airport.popularity ?? 0) >= 4 && airport.region !== 'Recent' && (
                    <div className="text-yellow-500 text-sm">⭐</div>
                  )}
                </div>
              </motion.button>
            ))}

            {/* No results message */}
            {query.trim() && results.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-medium">No airports found</div>
                <div className="text-sm">Try searching by city name or IATA code</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}