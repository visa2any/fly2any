'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { X, ChevronDown, MapPin, PlaneTakeoff, PlaneLanding, Check } from 'lucide-react';
import { AIRPORTS as AIRPORTS_DATA } from '@/lib/data/airports-complete';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  emoji: string;
  state?: string;
}

// Normalize text for accent-insensitive search (São Paulo -> sao paulo)
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim();
};

interface MultiAirportSelectorProps {
  value: string[]; // Array of airport codes: ['JFK', 'EWR', 'LGA']
  onChange: (codes: string[], airports: Airport[]) => void;
  label?: string;
  placeholder?: string;
  maxDisplay?: number; // Max airports to show in collapsed state (default: 1)
  lang?: 'en' | 'pt' | 'es';
  testId?: string; // For E2E testing
}

// Convert comprehensive airport data to component format
const AIRPORTS: Airport[] = AIRPORTS_DATA.map(airport => ({
  code: airport.code,
  name: airport.name,
  city: airport.city,
  country: airport.country,
  emoji: airport.emoji,
  state: airport.state,
}));

// Metro area groupings - Auto-generated from airports with metro field
const METRO_AREAS: Record<string, { name: string; codes: string[]; icon: string }> = {};

// Build metro areas from airport data
const metroMap = new Map<string, { codes: string[]; icon: string; cityName: string }>();
AIRPORTS_DATA.forEach(airport => {
  if (airport.metro) {
    if (!metroMap.has(airport.metro)) {
      metroMap.set(airport.metro, { codes: [], icon: airport.emoji, cityName: airport.city });
    }
    metroMap.get(airport.metro)!.codes.push(airport.code);
  }
});

// Convert map to METRO_AREAS format
metroMap.forEach((data, metroCode) => {
  METRO_AREAS[metroCode] = {
    name: `All ${data.cityName} Airports`,
    codes: data.codes,
    icon: data.icon,
  };
});

export default function MultiAirportSelector({
  value = [],
  onChange,
  label,
  placeholder = 'Select airports',
  maxDisplay = 1,
  lang = 'en',
  testId,
}: MultiAirportSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get selected airports from codes
  const selectedAirports = value
    .map(code => AIRPORTS.find(a => a.code === code))
    .filter((a): a is Airport => a !== undefined);

  
  // Memoized normalized search with Unicode support - includes state search for Brazil
  const filteredAirports = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const normalizedQuery = normalizeText(searchQuery);
    return AIRPORTS.filter(airport => {
      const normalizedCode = normalizeText(airport.code);
      const normalizedName = normalizeText(airport.name);
      const normalizedCity = normalizeText(airport.city);
      const normalizedCountry = normalizeText(airport.country);
      const normalizedState = airport.state ? normalizeText(airport.state) : '';
      return (
        normalizedCode.includes(normalizedQuery) ||
        normalizedName.includes(normalizedQuery) ||
        normalizedCity.includes(normalizedQuery) ||
        normalizedCountry.includes(normalizedQuery) ||
        normalizedState.includes(normalizedQuery)
      );
    });
  }, [searchQuery]);

  // Handle Done button - closes dropdown
  const handleDone = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggleAirport = (airport: Airport) => {
    const isSelected = value.includes(airport.code);
    let newCodes: string[];

    if (isSelected) {
      newCodes = value.filter(code => code !== airport.code);
    } else {
      newCodes = [...value, airport.code];
    }

    const newAirports = newCodes
      .map(code => AIRPORTS.find(a => a.code === code))
      .filter((a): a is Airport => a !== undefined);

    onChange(newCodes, newAirports);
  };

  const handleSelectMetroArea = (metroKey: string) => {
    const metro = METRO_AREAS[metroKey];
    const newCodes = [...new Set([...value, ...metro.codes])]; // Merge and dedupe

    const newAirports = newCodes
      .map(code => AIRPORTS.find(a => a.code === code))
      .filter((a): a is Airport => a !== undefined);

    onChange(newCodes, newAirports);
  };

  const handleRemoveAirport = (code: string) => {
    const newCodes = value.filter(c => c !== code);
    const newAirports = newCodes
      .map(c => AIRPORTS.find(a => a.code === c))
      .filter((a): a is Airport => a !== undefined);

    onChange(newCodes, newAirports);
  };

  const handleClearAll = () => {
    onChange([], []);
  };

  // Generate display text for collapsed state
  const getDisplayText = () => {
    if (value.length === 0) return '';
    if (value.length === 1) return value[0];
    return `${value[0]} +${value.length - 1}`;
  };

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 mb-1.5">
          {label === 'From' && <PlaneTakeoff size={14} className="text-neutral-500" />}
          {label === 'To' && <PlaneLanding size={14} className="text-neutral-500" />}
          <span>{label}</span>
        </label>
      )}

      {/* Main Typeable Input - Single Field */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 flex-shrink-0 z-10" size={16} />
        <input
          type="text"
          value={isOpen ? searchQuery : (selectedAirports.length > 0 ? `${selectedAirports[0].emoji} ${selectedAirports[0].city} (${selectedAirports[0].code})${selectedAirports.length > 1 ? ` +${selectedAirports.length - 1}` : ''}` : '')}
          onChange={(e) => { setSearchQuery(e.target.value); if (!isOpen) setIsOpen(true); }}
          onFocus={() => { setIsOpen(true); setSearchQuery(''); }}
          placeholder={placeholder}
          data-testid={testId}
          className="w-full min-h-[48px] py-3 pl-9 pr-8 bg-white border-2 border-neutral-200 hover:border-primary-400 focus:border-primary-500 rounded-xl text-sm font-semibold text-neutral-800 transition-all duration-200 focus:outline-none"
        />
        <ChevronDown
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 transition-transform duration-200 flex-shrink-0 pointer-events-none ${isOpen ? 'rotate-180' : ''}`}
          size={14}
        />
      </div>

      {/* Dropdown - No duplicate search */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-dropdown w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[50vh]">

          {/* Selected Chips - Compact */}
          {selectedAirports.length > 0 && (
            <div className="px-2 py-1 bg-primary-50/50 border-b border-primary-100">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold text-neutral-500">{selectedAirports.length} selected</span>
                <button onClick={handleClearAll} className="text-[9px] font-semibold text-primary-500">Clear</button>
              </div>
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {selectedAirports.map((airport) => (
                  <span key={airport.code} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-primary-200 rounded text-[9px] font-medium text-neutral-700">
                    <span className="text-[10px]">{airport.emoji}</span>
                    <span>{airport.city}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveAirport(airport.code); }} className="text-neutral-400 hover:text-red-500 ml-0.5">
                      <X size={8} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metro Quick Select - Compact */}
          {searchQuery.length >= 2 && Object.entries(METRO_AREAS).some(([_, metro]) => {
            const normalizedQuery = normalizeText(searchQuery);
            return normalizeText(metro.name).includes(normalizedQuery) ||
              metro.codes.some(code => normalizeText(code).includes(normalizedQuery));
          }) && (
            <div className="px-1.5 py-1 bg-neutral-50 border-b border-neutral-100">
              <div className="text-[9px] font-semibold text-neutral-500 mb-1">Quick Select</div>
              {Object.entries(METRO_AREAS)
                .filter(([_, metro]) => {
                  const normalizedQuery = normalizeText(searchQuery);
                  return normalizeText(metro.name).includes(normalizedQuery) ||
                    metro.codes.some(code => normalizeText(code).includes(normalizedQuery));
                })
                .map(([key, metro]) => (
                <button
                  key={key}
                  onClick={() => handleSelectMetroArea(key)}
                  className="flex items-center gap-1 w-full px-2 py-1.5 bg-white border border-neutral-200 rounded-lg text-[10px] font-semibold text-neutral-700 hover:border-primary-400 hover:bg-primary-50 transition-all touch-manipulation active:scale-[0.98] mb-1"
                >
                  <span className="text-xs">{metro.icon}</span>
                  <span className="truncate">{metro.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Airport List - Compact */}
          <div className="max-h-[35vh] overflow-y-auto p-1">
            {searchQuery.length < 2 ? (
              <div className="px-2 py-3 text-center">
                <div className="text-[10px] font-semibold text-neutral-500">Type 2+ characters</div>
                <div className="text-[8px] text-neutral-400">City, airport name, or code</div>
              </div>
            ) : filteredAirports.length === 0 ? (
              <div className="px-2 py-2 text-center text-[10px] font-semibold text-neutral-500">No airports found</div>
            ) : (
              filteredAirports.slice(0, 15).map((airport) => {
                const isSelected = value.includes(airport.code);
                return (
                  <button
                    key={airport.code}
                    onClick={() => handleToggleAirport(airport)}
                    className={`w-full flex items-center gap-1 px-1.5 py-1.5 rounded-lg transition-all text-left mb-0.5 touch-manipulation min-h-[34px] active:scale-[0.98] ${
                      isSelected
                        ? 'bg-primary-50 border border-primary-300'
                        : 'hover:bg-neutral-50 border border-transparent'
                    }`}
                  >
                    <input type="checkbox" checked={isSelected} readOnly className="w-3.5 h-3.5 rounded border-neutral-300 text-primary-500 pointer-events-none flex-shrink-0" />
                    <span className="text-xs flex-shrink-0">{airport.emoji}</span>
                    <div className="flex flex-col min-w-0 flex-1 leading-none">
                      <span className="font-semibold text-neutral-800 text-[10px] truncate">{airport.city}</span>
                      <span className="text-neutral-500 text-[8px] truncate">{airport.code} • {airport.name}</span>
                    </div>
                    {isSelected && <Check size={12} className="text-primary-500 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Done Button - Compact */}
          <div className="sticky bottom-0 p-1.5 bg-white/95 backdrop-blur-sm border-t border-neutral-100">
            <button
              type="button"
              onClick={handleDone}
              className="w-full flex items-center justify-center gap-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-sm rounded-lg shadow-md shadow-primary-500/25 active:scale-[0.98] touch-manipulation"
            >
              <Check size={16} strokeWidth={2.5} />
              <span>Done{selectedAirports.length > 0 ? ` (${selectedAirports.length})` : ''}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
