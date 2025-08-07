/**
 * 🇺🇸 US AIRPORT AUTOCOMPLETE COMPONENT
 * Enhanced airport search with comprehensive US database
 * Features instant results, popular suggestions, and smart fallback
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  FlightIcon, 
  MagnifyingGlassIcon, 
  MapPinIcon,
  StarIcon,
  GlobeAltIcon,
  ClockIcon
} from '@/components/Icons';
import { useUSAirportSearch, AirportSearchResult } from '@/hooks/useUSAirportSearch';

export interface USAirportAutocompleteProps {
  value?: AirportSearchResult | null;
  onChange: (airport: AirportSearchResult | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  includeInternational?: boolean;
  includeRegional?: boolean;
  preferredRegions?: string[];
  showPopularOnFocus?: boolean;
  maxResults?: number;
  label?: string;
  error?: string;
  required?: boolean;
}

const USAirportAutocomplete: React.FC<USAirportAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search airports...",
  className = "",
  disabled = false,
  includeInternational = true,
  includeRegional = true,
  preferredRegions = [],
  showPopularOnFocus = true,
  maxResults = 8,
  label,
  error,
  required = false
}) => {
  // Local state
  const [inputValue, setInputValue] = useState(value?.displayName || '');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showAll, setShowAll] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Airport search hook
  const {
    results,
    isLoading,
    isSearching,
    error: searchError,
    searchAirports,
    clearResults,
    getPopularAirports,
    getAirportByCode,
    isDomesticRoute
  } = useUSAirportSearch({
    includeInternational,
    includeRegional,
    preferredRegions,
    maxResults,
    debounceMs: 200,
    minQueryLength: 1,
    prioritizePopular: true
  });

  // Popular airports for empty state
  const popularAirports = getPopularAirports();

  // Current results to display
  const displayResults = showAll 
    ? [...results, ...popularAirports.filter(pop => !results.find(r => r.iataCode === pop.iataCode))]
    : (results.length > 0 ? results : (showPopularOnFocus ? popularAirports : []));

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    setFocusedIndex(-1);
    setShowAll(false);

    if (newValue.trim()) {
      searchAirports(newValue);
    } else {
      clearResults();
    }

    if (!isOpen) {
      setIsOpen(true);
    }
  }, [searchAirports, clearResults, isOpen]);

  /**
   * Handle input focus
   */
  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
    if (!inputValue.trim() && showPopularOnFocus) {
      // Show popular airports when focusing empty input
      setShowAll(false);
    }
  }, [inputValue, showPopularOnFocus]);

  /**
   * Handle input blur
   */
  const handleInputBlur = useCallback((event: React.FocusEvent) => {
    // Don't close if clicking on dropdown
    if (dropdownRef.current?.contains(event.relatedTarget as Node)) {
      return;
    }
    
    setTimeout(() => {
      setIsOpen(false);
      setFocusedIndex(-1);
      
      // Reset input if no valid selection
      if (!value) {
        setInputValue('');
      } else if (inputValue !== value.displayName) {
        setInputValue(value.displayName);
      }
    }, 150);
  }, [value, inputValue]);

  /**
   * Handle airport selection
   */
  const handleAirportSelect = useCallback((airport: AirportSearchResult) => {
    setInputValue(airport.displayName);
    setIsOpen(false);
    setFocusedIndex(-1);
    onChange(airport);
    inputRef.current?.blur();
  }, [onChange]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev < displayResults.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        event.preventDefault();
        if (focusedIndex >= 0 && displayResults[focusedIndex]) {
          handleAirportSelect(displayResults[focusedIndex]);
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
        
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  }, [isOpen, displayResults, focusedIndex, handleAirportSelect]);

  /**
   * Handle clear selection
   */
  const handleClear = useCallback(() => {
    setInputValue('');
    onChange(null);
    clearResults();
    inputRef.current?.focus();
  }, [onChange, clearResults]);

  /**
   * Show all results
   */
  const handleShowAll = useCallback(() => {
    setShowAll(true);
  }, []);

  // Update input value when value prop changes
  useEffect(() => {
    if (value?.displayName !== inputValue) {
      setInputValue(value?.displayName || '');
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Render airport item
   */
  const renderAirportItem = (airport: AirportSearchResult, index: number) => {
    const isUS = airport.isUSAirport;
    const isFocused = index === focusedIndex;
    const isPopular = popularAirports.some(p => p.iataCode === airport.iataCode);
    
    return (
      <div
        key={airport.iataCode}
        className={`
          px-4 py-3 cursor-pointer border-b border-gray-50 last:border-b-0
          hover:bg-blue-50 hover:border-blue-100 transition-all duration-150
          ${isFocused ? 'bg-blue-50 border-blue-100' : 'bg-white'}
        `}
        onClick={() => handleAirportSelect(airport)}
        onMouseEnter={() => setFocusedIndex(index)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Airport icon */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${isUS ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
            `}>
              {isUS ? '🇺🇸' : <GlobeAltIcon className="w-4 h-4" />}
            </div>
            
            {/* Airport info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 truncate">
                  {airport.city}, {airport.stateCode || airport.country}
                </span>
                <span className="font-mono text-sm bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                  {airport.iataCode}
                </span>
                {isPopular && (
                  <StarIcon className="w-3 h-3 text-yellow-500 fill-current" />
                )}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {airport.name}
              </div>
              {airport.description && (
                <div className="text-xs text-gray-500 truncate">
                  {airport.description}
                </div>
              )}
            </div>
          </div>
          
          {/* Match indicator */}
          {airport.relevanceScore && (
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <div className={`
                w-2 h-2 rounded-full
                ${airport.relevanceScore > 0.8 ? 'bg-green-400' : 
                  airport.relevanceScore > 0.6 ? 'bg-yellow-400' : 'bg-gray-300'}
              `} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const dropdown = isOpen && (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
    >
      {/* Loading state */}
      {(isLoading || isSearching) && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Searching airports...</span>
        </div>
      )}
      
      {/* Error state */}
      {(error || searchError) && (
        <div className="px-4 py-3 text-sm text-red-600 bg-red-50">
          {error || searchError}
        </div>
      )}
      
      {/* Results */}
      {!isLoading && !isSearching && displayResults.length > 0 && (
        <>
          {/* Section header */}
          {!inputValue.trim() && showPopularOnFocus && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wide">
              Popular US Airports
            </div>
          )}
          
          {displayResults.map((airport, index) => renderAirportItem(airport, index))}
          
          {/* Show more button */}
          {!showAll && results.length > 0 && popularAirports.length > 0 && (
            <button
              onClick={handleShowAll}
              className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100 transition-colors"
            >
              Show all airports
            </button>
          )}
        </>
      )}
      
      {/* No results */}
      {!isLoading && !isSearching && displayResults.length === 0 && inputValue.trim() && (
        <div className="px-4 py-8 text-center text-gray-500">
          <MagnifyingGlassIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm">No airports found for "{inputValue}"</p>
          <p className="text-xs text-gray-400 mt-1">Try searching by city, airport name, or IATA code</p>
        </div>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FlightIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:cursor-not-allowed
            placeholder-gray-400 text-gray-900
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            transition-colors duration-200
          `}
          autoComplete="off"
          spellCheck={false}
        />
        
        {/* Clear button */}
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 text-gray-400"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {/* Dropdown */}
      {dropdown}
    </div>
  );
};

export default USAirportAutocomplete;