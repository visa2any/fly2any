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
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
          {label === 'From' && <PlaneTakeoff size={14} className="text-gray-600" />}
          {label === 'To' && <PlaneLanding size={14} className="text-gray-600" />}
          <span>{label}</span>
        </label>
      )}

      {/* Main Input Button - ULTRA-COMPACT Mobile-First */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mobile-select"
      >
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 flex-shrink-0" size={16} />

        <div className="pl-7 pr-5 py-2 w-full overflow-hidden min-h-[40px] flex items-center">
          {selectedAirports.length === 0 ? (
            <span className="text-gray-400 text-sm block truncate">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1 overflow-hidden w-full">
              {selectedAirports.slice(0, maxDisplay).map((airport, idx) => (
                <span
                  key={airport.code}
                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-gray-800 truncate"
                >
                  {idx > 0 && <span className="text-gray-300 mx-0.5">•</span>}
                  <span className="text-[10px]">{airport.emoji}</span>
                  <span className="truncate">{airport.city}</span>
                  <span className="text-[10px] text-gray-400 font-medium">({airport.code})</span>
                </span>
              ))}
              {selectedAirports.length > maxDisplay && (
                <span className="inline-flex items-center px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded text-[10px] font-bold flex-shrink-0 ml-1">
                  +{selectedAirports.length - maxDisplay}
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronDown
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          size={14}
        />
      </button>

      {/* Dropdown - Mobile-First Bottom Sheet */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-dropdown w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[60vh]">
          
          {/* Search Input - Mobile-First */}
          <div className="mobile-px py-2 md:p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search airports..."
              className="mobile-input text-sm"
              autoFocus
            />
          </div>

          {/* Selected Airports (Chips) - COMPACT */}
          {selectedAirports.length > 0 && (
            <div className="px-1.5 py-1 bg-primary-50/50 border-b border-primary-100">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] font-semibold text-gray-600">
                  {selectedAirports.length} selected
                </span>
                <button onClick={handleClearAll} className="text-[9px] font-medium text-red-500 hover:text-red-600">
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-0.5">
                {selectedAirports.map((airport) => (
                  <span
                    key={airport.code}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-primary-200 rounded text-[9px] font-medium text-gray-800"
                  >
                    <span>{airport.emoji}</span>
                    <span>{airport.city}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveAirport(airport.code); }}
                      className="text-gray-400 hover:text-red-500 ml-0.5"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metro Area Quick Select - Only show when 2+ chars match metro area names */}
          {searchQuery.length >= 2 && Object.entries(METRO_AREAS).some(([_, metro]) => {
            const normalizedQuery = normalizeText(searchQuery);
            return normalizeText(metro.name).includes(normalizedQuery) ||
              metro.codes.some(code => normalizeText(code).includes(normalizedQuery));
          }) && (
            <div className="p-1.5 md:p-2 bg-gray-50 border-b border-gray-200">
              <div className="text-[10px] font-semibold text-gray-700 mb-1">Quick Select</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
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
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-medium text-gray-700 hover:border-[#0087FF] hover:bg-info-50 hover:text-[#0087FF] transition-all"
                  >
                    <span className="text-sm">{metro.icon}</span>
                    <span className="truncate">{metro.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Airport List - Mobile Single Column - Only show after 2+ chars typed */}
          <div className="max-h-[45vh] overflow-y-auto p-1">
            {searchQuery.length < 2 ? (
              <div className="px-2 py-4 text-center">
                <div className="text-[11px] text-gray-500 mb-0.5">Type 2+ characters</div>
                <div className="text-[9px] text-gray-400">City, airport name, or code</div>
              </div>
            ) : filteredAirports.length === 0 ? (
              <div className="px-2 py-2 text-center text-[11px] text-gray-500">
                No airports found
              </div>
            ) : (
              filteredAirports.slice(0, 20).map((airport) => {
                const isSelected = value.includes(airport.code);
                return (
                  <button
                    key={airport.code}
                    onClick={() => handleToggleAirport(airport)}
                    className={`w-full flex items-center gap-1 px-1.5 py-1.5 rounded-lg transition-all text-left mb-0.5 touch-manipulation min-h-[36px] ${
                      isSelected
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50 border border-transparent active:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-3 h-3 rounded border-gray-300 text-primary-600 pointer-events-none flex-shrink-0"
                    />
                    <span className="text-sm flex-shrink-0">{airport.emoji}</span>
                    <div className="flex flex-col min-w-0 flex-1 leading-tight">
                      <span className="font-semibold text-gray-900 text-[11px] truncate">{airport.city}</span>
                      <span className="text-gray-500 text-[9px] truncate">{airport.code} • {airport.name}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-primary-600 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Done Button - Mobile-First Sticky Bottom */}
          <div className="sticky bottom-0 mobile-px py-3 bg-white border-t border-gray-200 mobile-shadow-lg">
            <button
              type="button"
              onClick={handleDone}
              className="mobile-btn-primary"
            >
              <Check size={18} strokeWidth={2.5} />
              <span>Done{selectedAirports.length > 0 ? ` (${selectedAirports.length})` : ''}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
