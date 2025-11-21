'use client';

/**
 * Enhanced Airport Autocomplete with Natural Language Search
 *
 * Enhancements over standard autocomplete:
 * - Natural language search ("beaches in Asia" → Beach destinations)
 * - Intelligent fuzzy matching with scoring
 * - Metro area expansion (NYC → JFK, EWR, LGA)
 * - Sustainability indicators (eco-friendly airports)
 * - Popular routes quick suggestions
 * - Recent searches memory
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Mobile-optimized touch interactions
 *
 * Powered by:
 * - lib/data/airport-helpers.ts (search, natural language, metro areas)
 * - lib/data/airports-complete.ts (950+ airports)
 *
 * @module AirportAutocompleteEnhanced
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Plane,
  MapPin,
  Search,
  TrendingUp,
  Sparkles,
  Leaf,
  ChevronRight,
  Clock,
  Globe
} from 'lucide-react';
import { searchAirports, parseNaturalLanguageQuery, getMetroAirports } from '@/lib/data/airport-helpers';
import type { Airport } from '@/lib/data/airports-all';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AirportSuggestion extends Airport {
  matchType?: 'exact' | 'city' | 'name' | 'metro' | 'natural-language' | 'recent' | 'popular';
  metroAirports?: string[]; // For metro area suggestions
  isEcoFriendly?: boolean;
}

interface AirportAutocompleteEnhancedProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (code: string, airport?: Airport) => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact' | 'inline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showMetroExpansion?: boolean; // Show "Search all NYC airports" option
  showNaturalLanguage?: boolean; // Enable natural language parsing
  showRecentSearches?: boolean; // Show recent searches
  showPopularRoutes?: boolean; // Show popular routes if origin is set
  originCode?: string; // For popular routes suggestion
  lang?: 'en' | 'pt' | 'es';
}

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  en: {
    searchAirports: 'Search airports',
    recentSearches: 'Recent Searches',
    popularRoutes: 'Popular Routes from',
    allAirportsIn: 'All airports in',
    trySearching: 'Try searching',
    beaches: '"beaches in Asia"',
    ski: '"ski resorts in Europe"',
    metro: 'Metro area',
    ecoFriendly: 'Eco-friendly',
    noResults: 'No airports found',
  },
  pt: {
    searchAirports: 'Buscar aeroportos',
    recentSearches: 'Buscas Recentes',
    popularRoutes: 'Rotas Populares de',
    allAirportsIn: 'Todos os aeroportos em',
    trySearching: 'Tente buscar',
    beaches: '"praias na Ásia"',
    ski: '"estações de esqui na Europa"',
    metro: 'Área metropolitana',
    ecoFriendly: 'Eco-amigável',
    noResults: 'Nenhum aeroporto encontrado',
  },
  es: {
    searchAirports: 'Buscar aeropuertos',
    recentSearches: 'Búsquedas Recientes',
    popularRoutes: 'Rutas Populares desde',
    allAirportsIn: 'Todos los aeropuertos en',
    trySearching: 'Intenta buscar',
    beaches: '"playas en Asia"',
    ski: '"estaciones de esquí en Europa"',
    metro: 'Área metropolitana',
    ecoFriendly: 'Eco-amigable',
    noResults: 'No se encontraron aeropuertos',
  }
};

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

const RECENT_SEARCHES_KEY = 'fly2any_recent_airport_searches';
const MAX_RECENT_SEARCHES = 5;

const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const recent = localStorage.getItem(RECENT_SEARCHES_KEY);
    return recent ? JSON.parse(recent) : [];
  } catch {
    return [];
  }
};

const addRecentSearch = (code: string) => {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches();
    const updated = [code, ...recent.filter(c => c !== code)].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
};

// ============================================================================
// POPULAR ROUTES (Mock data - replace with DB query)
// ============================================================================

const POPULAR_ROUTES: Record<string, string[]> = {
  'JFK': ['LAX', 'LHR', 'CDG', 'DXB', 'NRT'],
  'LAX': ['JFK', 'LHR', 'NRT', 'SYD', 'HNL'],
  'LHR': ['JFK', 'LAX', 'DXB', 'SIN', 'HKG'],
  'DXB': ['LHR', 'JFK', 'BOM', 'DEL', 'SIN'],
  // Add more as needed
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AirportAutocompleteEnhanced: React.FC<AirportAutocompleteEnhancedProps> = ({
  label,
  placeholder,
  value,
  onChange,
  icon,
  variant = 'default',
  size = 'medium',
  className = '',
  showMetroExpansion = true,
  showNaturalLanguage = true,
  showRecentSearches = true,
  showPopularRoutes = false,
  originCode,
  lang = 'en',
}) => {
  const t = translations[lang];

  // State
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Recent searches
  const recentSearchCodes = useMemo(() => getRecentSearches(), [isOpen]);

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Search function with natural language support
  const performSearch = useCallback((query: string) => {
    if (!query || query.length < 2) {
      // Show recent searches or popular routes if no query
      if (showRecentSearches && recentSearchCodes.length > 0) {
        const { AIRPORTS } = require('@/lib/data/airports-complete');
        const recentAirports = recentSearchCodes
          .map(code => AIRPORTS.find((a: Airport) => a.code === code))
          .filter(Boolean)
          .map((airport: Airport) => ({
            ...airport,
            matchType: 'recent' as const,
          }));
        setSuggestions(recentAirports);
        return;
      }

      // Show popular routes if origin is set
      if (showPopularRoutes && originCode && POPULAR_ROUTES[originCode]) {
        const { AIRPORTS } = require('@/lib/data/airports-complete');
        const popularDests = POPULAR_ROUTES[originCode]
          .map(code => AIRPORTS.find((a: Airport) => a.code === code))
          .filter(Boolean)
          .map((airport: Airport) => ({
            ...airport,
            matchType: 'popular' as const,
          }));
        setSuggestions(popularDests);
        return;
      }

      setSuggestions([]);
      return;
    }

    // Check if natural language query
    const isNaturalLanguage = query.includes(' in ') ||
                               query.includes('beaches') ||
                               query.includes('ski') ||
                               query.includes('city') ||
                               query.includes('culture');

    let results: AirportSuggestion[];

    if (showNaturalLanguage && isNaturalLanguage) {
      // Natural language search
      const naturalResults = parseNaturalLanguageQuery(query);
      results = naturalResults.map(airport => ({
        ...airport,
        matchType: 'natural-language' as const,
      }));
    } else {
      // Standard intelligent search
      const searchResults = searchAirports({
        query,
        maxResults: 8,
        includeKeywords: true,
      });

      results = searchResults.map(airport => {
        const matchType: 'exact' | 'city' | 'name' =
          airport.code.toLowerCase() === query.toLowerCase() ? 'exact' :
          airport.city.toLowerCase().includes(query.toLowerCase()) ? 'city' :
          'name';
        return {
          ...airport,
          matchType,
        };
      });
    }

    // Add metro expansion if applicable
    if (showMetroExpansion && results.length > 0 && results[0].metro) {
      const metroAirports = getMetroAirports(results[0].metro);
      if (metroAirports.length > 1) {
        results[0] = {
          ...results[0],
          metroAirports: metroAirports.map(a => a.code),
        };
      }
    }

    setSuggestions(results.slice(0, 8));
  }, [showNaturalLanguage, showMetroExpansion, showRecentSearches, showPopularRoutes, originCode, recentSearchCodes]);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(newValue);
    }, 200);
  };

  // Handle airport selection
  const handleSelect = (airport: Airport, isMetroExpansion = false) => {
    if (isMetroExpansion && airport.metro) {
      // If metro expansion, pass comma-separated codes
      const metroAirports = getMetroAirports(airport.metro);
      const codes = metroAirports.map(a => a.code).join(',');
      onChange(codes);
      setInputValue(`${airport.city} (All airports)`);
    } else {
      onChange(airport.code, airport);
      setInputValue(`${airport.city} (${airport.code})`);
      addRecentSearch(airport.code);
    }

    setIsOpen(false);
    setSuggestions([]);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        performSearch(inputValue);
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
          handleSelect(suggestions[highlightedIndex]);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSuggestions([]);
        inputRef.current?.blur();
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-5 py-4 text-lg',
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Input */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            performSearch(inputValue);
          }}
          placeholder={placeholder || t.searchAirports}
          className={`
            w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
            rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0087FF] focus:border-transparent
            ${icon ? 'pl-10' : 'pl-4'} ${sizeClasses[size]}
            ${variant === 'compact' ? 'text-sm' : ''}
          `}
        />

        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-[9999] mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-96 overflow-y-auto animate-in slide-in-from-top-2 duration-200"
        >
          {/* Natural Language Hint */}
          {showNaturalLanguage && inputValue.length < 2 && (
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                <Sparkles className="w-4 h-4" />
                <span>{t.trySearching} {t.beaches} {lang === 'en' ? 'or' : 'ou'} {t.ski}</span>
              </div>
            </div>
          )}

          {/* Recent Searches Header */}
          {suggestions.length > 0 && suggestions[0].matchType === 'recent' && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {t.recentSearches}
              </div>
            </div>
          )}

          {/* Popular Routes Header */}
          {suggestions.length > 0 && suggestions[0].matchType === 'popular' && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-3.5 h-3.5" />
                {t.popularRoutes} {originCode}
              </div>
            </div>
          )}

          {/* Suggestions List */}
          {suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((suggestion, index) => (
                <div key={suggestion.code}>
                  {/* Main Airport Suggestion */}
                  <button
                    onClick={() => handleSelect(suggestion)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                      ${highlightedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                    `}
                  >
                    <span className="text-2xl flex-shrink-0">{suggestion.emoji}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {suggestion.code}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {suggestion.city}
                        </span>

                        {/* Match Type Badge */}
                        {suggestion.matchType === 'natural-language' && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            NLP
                          </span>
                        )}

                        {suggestion.matchType === 'recent' && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Recent
                          </span>
                        )}

                        {suggestion.matchType === 'popular' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            Popular
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {suggestion.name}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>

                  {/* Metro Expansion Option */}
                  {suggestion.metroAirports && suggestion.metroAirports.length > 1 && (
                    <button
                      onClick={() => handleSelect(suggestion, true)}
                      className="w-full px-4 py-2 flex items-center gap-3 text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-t border-blue-100 dark:border-blue-800 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {t.allAirportsIn} {suggestion.city}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {suggestion.metroAirports.join(', ')} ({suggestion.metroAirports.length} airports)
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : inputValue.length >= 2 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {t.noResults}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AirportAutocompleteEnhanced;
