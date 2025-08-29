'use client';

/**
 * 🛫 AIRPORT AUTOCOMPLETE COMPONENT
 * Advanced airport search with global database integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
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
  value: AirportSelection | null;
  onChange: (airport: AirportSelection | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  inputClassName?: string;
  isMobile?: boolean;
  maxResults?: number;
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
  className = '',
  inputClassName = '',
  isMobile = false,
  maxResults = 8
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EnhancedAirport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<AirportSelection[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [isMobileDetected, setIsMobileDetected] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile environment
  useEffect(() => {
    const checkMobile = () => {
      const isMobileViewport = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent = /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
      
      setIsMobileDetected(isMobileViewport || isTouchDevice || isMobileUserAgent || isMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

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

  // Calculate dropdown position to prevent viewport overflow
  const calculateDropdownPosition = useCallback(() => {
    if (!containerRef.current || !isMobileDetected) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(320, Math.max(results.length, 1) * 72 + 40); // Estimated height
    
    const spaceBelow = viewportHeight - containerRect.bottom;
    const spaceAbove = containerRect.top;

    // On mobile, prefer bottom unless there's significantly more space above
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow + 100) {
      setDropdownPosition('top');
    } else {
      setDropdownPosition('bottom');
    }
  }, [isMobileDetected]); // Remove results.length to prevent infinite loop

  // Recalculate position when dropdown opens or results change
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
    }
  }, [isOpen, results.length, calculateDropdownPosition]); // Add results.length here instead

  // Handle virtual keyboard on mobile
  useEffect(() => {
    if (!isMobileDetected) return;

    const handleResize = () => {
      if (isOpen) {
        // Recalculate position when virtual keyboard opens/closes
        setTimeout(calculateDropdownPosition, 100);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOpen) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, calculateDropdownPosition, isMobileDetected]);

  // Update query when value changes externally
  useEffect(() => {
    if (value?.iataCode && value?.city) {
      const expectedQuery = `${value.iataCode} - ${value.city}`;
      if (query !== expectedQuery) {
        setQuery(expectedQuery);
      }
    } else if (!value?.iataCode && query && !query.includes(' - ')) {
      // Don't clear the query if user is actively typing
      // Only clear if it's not a user-typed search term
    }
  }, [value, query]);

  // Search airports - optimized to prevent infinite loops
  useEffect(() => {
    if (!query.trim()) {
      // Use current recentSearches from state without making it a dependency
      const currentRecentSearches = recentSearches;
      setResults(currentRecentSearches.length > 0 
        ? currentRecentSearches.slice(0, 5).map((airport: any) => ({
            ...airport,
            region: 'Recent',
            popularity: 5,
            type: 'major' as const
          }))
        : AIRPORTS_DATABASE
            .filter(airport => (airport.popularity ?? 0) >= 4)
            .slice(0, 10)
      );
      setSelectedIndex(-1);
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

    const maxResultsToShow = isMobileDetected ? Math.min(maxResults, 6) : maxResults;
    setResults(sortedMatches.slice(0, maxResultsToShow));
    setSelectedIndex(-1);
  }, [query, maxResults, isMobileDetected]); // Remove recentSearches to prevent loops

  // Update results when recent searches change (only when query is empty)
  useEffect(() => {
    if (!query.trim()) {
      setResults(recentSearches.length > 0 
        ? recentSearches.slice(0, 5).map((airport: any) => ({
            ...airport,
            region: 'Recent',
            popularity: 5,
            type: 'major' as const
          }))
        : AIRPORTS_DATABASE
            .filter(airport => (airport.popularity ?? 0) >= 4)
            .slice(0, 10)
      );
    }
  }, [recentSearches]); // This effect only runs when recent searches change

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    
    // Clear selection if user is typing
    if (newQuery !== `${value?.iataCode || ''} - ${value?.city || ''}`) {
      onChange(null);
    }

    // On mobile, scroll input into view when focused
    if (isMobileDetected && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
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
      ...recentSearches.filter((a: any) => a.iataCode !== airport.iataCode)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentAirportSearches', JSON.stringify(updatedRecent));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // CRITICAL FIX: Always prevent Enter key form submission in multi-step forms
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      
      // Only handle selection if dropdown is open and has results
      if (isOpen && results.length > 0 && selectedIndex >= 0 && selectedIndex < results.length) {
        handleAirportSelect(results[selectedIndex]);
      }
      return;
    }

    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev: any) => (prev + 1) % results.length);
        // Scroll selected item into view on mobile
        if (isMobileDetected) {
          setTimeout(() => {
            const selectedItem = resultsRef.current?.children[selectedIndex + 1];
            selectedItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 10);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev: any) => (prev - 1 + results.length) % results.length);
        // Scroll selected item into view on mobile
        if (isMobileDetected) {
          setTimeout(() => {
            const selectedItem = resultsRef.current?.children[selectedIndex + 1];
            selectedItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 10);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        if (isMobileDetected) {
          // On mobile, blur the input to hide virtual keyboard
          inputRef.current?.blur();
        }
        break;
      case 'Tab':
        // Allow normal tab behavior but close dropdown
        setIsOpen(false);
        setSelectedIndex(-1);
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
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            // On mobile, add extra delay to ensure dropdown positioning
            if (isMobileDetected) {
              setTimeout(calculateDropdownPosition, 150);
            }
          }}
          onBlur={() => {
            // Delay closing to allow clicks on results
            // Longer delay on mobile for better touch interaction
            const delay = isMobileDetected ? 300 : 150;
            setTimeout(() => setIsOpen(false), delay);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${isMobileDetected ? 'min-h-[48px] text-base' : 'min-h-[44px]'}
            ${isMobileDetected ? 'focus:ring-4 focus:ring-blue-100' : ''}
            ${isMobileDetected ? 'touch-manipulation -webkit-appearance-none' : ''}
            ${inputClassName}
          `}
          // Prevent zoom on mobile when focusing input
          style={isMobileDetected ? { fontSize: '16px' } : undefined}
        />
        <FlightIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        {query && !disabled && (
          <button
            onClick={() => {
              setQuery('');
              onChange(null);
              inputRef.current?.focus();
            }}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600
              ${isMobileDetected ? 'min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2' : ''}
            `}
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
            initial={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10 }}
            className={`
              absolute left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-y-auto
              ${dropdownPosition === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'}
              ${isMobileDetected 
                ? 'max-h-[60vh] shadow-2xl border-2 rounded-xl' 
                : 'max-h-80'
              }
              ${isMobileDetected && dropdownPosition === 'bottom' ? 'max-h-[calc(100vh-120px)]' : ''}
            `}
          >
            {/* Header for recent searches */}
            {!query.trim() && recentSearches.length > 0 && (
              <div className="px-4 py-2 border-b bg-gray-50 text-sm font-medium text-gray-600 flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                Recent Searches
              </div>
            )}

            {results.map((airport: any, index: number) => (
              <motion.button
                key={`${airport.iataCode}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleAirportSelect(airport)}
                onTouchStart={(e: any) => {
                  // Prevent scrolling on touch start for better mobile experience
                  if (isMobileDetected) {
                    e.preventDefault();
                  }
                }}
                className={`
                  w-full text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0
                  ${selectedIndex === index ? 'bg-blue-50' : ''}
                  ${isMobileDetected 
                    ? 'px-4 py-4 min-h-[60px] active:bg-blue-100 touch-manipulation' 
                    : 'px-4 py-3'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`${isMobileDetected ? 'text-xl' : 'text-lg'} flex-shrink-0`}>
                      {getAirportIcon(airport)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={`font-semibold text-gray-900 truncate ${
                        isMobileDetected ? 'text-base' : 'text-sm'
                      }`}>
                        {airport.iataCode} - {airport.city}
                      </div>
                      <div className={`text-gray-600 truncate ${
                        isMobileDetected ? 'text-sm' : 'text-xs'
                      }`}>
                        {airport.name}
                      </div>
                      <div className={`text-gray-500 flex items-center gap-1 ${
                        isMobileDetected ? 'text-xs' : 'text-xs'
                      }`}>
                        <span className="flex-shrink-0">{getRegionFlag(airport.region)}</span>
                        <span className="truncate">{airport.country}</span>
                        {airport.region !== 'Recent' && !isMobileDetected && (
                          <span className="ml-2 bg-gray-200 px-2 py-0.5 rounded text-xs flex-shrink-0">
                            {airport.region}
                          </span>
                        )}
                      </div>
                      {/* Show region on mobile in separate line for better readability */}
                      {airport.region !== 'Recent' && isMobileDetected && (
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">
                            {airport.region}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(airport.popularity ?? 0) >= 4 && airport.region !== 'Recent' && (
                    <div className={`text-yellow-500 flex-shrink-0 ${
                      isMobileDetected ? 'text-base' : 'text-sm'
                    }`}>⭐</div>
                  )}
                </div>
              </motion.button>
            ))}

            {/* No results message */}
            {query.trim() && results.length === 0 && (
              <div className={`text-center text-gray-500 ${
                isMobileDetected ? 'px-6 py-12' : 'px-4 py-8'
              }`}>
                <div className={`mb-2 ${isMobileDetected ? 'text-3xl' : 'text-2xl'}`}>🔍</div>
                <div className={`font-medium ${isMobileDetected ? 'text-base' : 'text-sm'}`}>
                  No airports found
                </div>
                <div className={`${isMobileDetected ? 'text-sm' : 'text-xs'} mt-2`}>
                  Try searching by city name or IATA code
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}