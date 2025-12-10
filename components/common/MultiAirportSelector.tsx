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
        <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 mb-1.5">
          {label === 'From' && <PlaneTakeoff size={14} className="text-neutral-500" />}
          {label === 'To' && <PlaneLanding size={14} className="text-neutral-500" />}
          <span>{label}</span>
        </label>
      )}

      {/* Main Input Button - Apple-Class */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mobile-select"
      >
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 flex-shrink-0" size={16} />

        <div className="pl-7 pr-5 py-2 w-full overflow-hidden min-h-[40px] flex items-center">
          {selectedAirports.length === 0 ? (
            <span className="text-neutral-400 text-sm block truncate">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1 overflow-hidden w-full">
              {selectedAirports.slice(0, maxDisplay).map((airport, idx) => (
                <span
                  key={airport.code}
                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-neutral-800 truncate"
                >
                  {idx > 0 && <span className="text-neutral-300 mx-0.5">•</span>}
                  <span className="text-[10px]">{airport.emoji}</span>
                  <span className="truncate">{airport.city}</span>
                  <span className="text-[10px] text-neutral-500 font-medium">({airport.code})</span>
                </span>
              ))}
              {selectedAirports.length > maxDisplay && (
                <span className="inline-flex items-center px-1.5 py-0.5 bg-primary-100 text-primary-600 rounded-lg text-[10px] font-bold flex-shrink-0 ml-1">
                  +{selectedAirports.length - maxDisplay}
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronDown
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          size={14}
        />
      </button>

      {/* Dropdown - Apple-Class Mobile Bottom Sheet */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-dropdown w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[60vh]">

          {/* Search Input - Apple-Class */}
          <div className="p-2 border-b border-neutral-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search airports..."
              className="mobile-input text-sm"
              autoFocus
            />
          </div>

          {/* Selected Airports (Chips) - Apple-Class */}
          {selectedAirports.length > 0 && (
            <div className="px-2 py-1.5 bg-primary-50/50 border-b border-primary-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-neutral-600">
                  {selectedAirports.length} selected
                </span>
                <button onClick={handleClearAll} className="text-[10px] font-semibold text-red-500 hover:text-red-600">
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedAirports.map((airport) => (
                  <span
                    key={airport.code}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-white border border-primary-200 rounded-lg text-[10px] font-semibold text-neutral-800"
                  >
                    <span>{airport.emoji}</span>
                    <span>{airport.city}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveAirport(airport.code); }}
                      className="text-neutral-400 hover:text-red-500 ml-0.5"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metro Area Quick Select - Apple-Class */}
          {searchQuery.length >= 2 && Object.entries(METRO_AREAS).some(([_, metro]) => {
            const normalizedQuery = normalizeText(searchQuery);
            return normalizeText(metro.name).includes(normalizedQuery) ||
              metro.codes.some(code => normalizeText(code).includes(normalizedQuery));
          }) && (
            <div className="p-2 bg-neutral-50 border-b border-neutral-200">
              <div className="text-[10px] font-semibold text-neutral-700 mb-1.5">Quick Select</div>
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
                    className="flex items-center gap-1.5 px-2.5 py-2 bg-white border-2 border-neutral-200 rounded-xl text-[10px] font-semibold text-neutral-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 transition-all touch-manipulation active:scale-[0.98]"
                  >
                    <span className="text-sm">{metro.icon}</span>
                    <span className="truncate">{metro.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Airport List - Apple-Class */}
          <div className="max-h-[45vh] overflow-y-auto p-1.5">
            {searchQuery.length < 2 ? (
              <div className="px-2 py-4 text-center">
                <div className="text-[11px] font-semibold text-neutral-500 mb-0.5">Type 2+ characters</div>
                <div className="text-[9px] text-neutral-400">City, airport name, or code</div>
              </div>
            ) : filteredAirports.length === 0 ? (
              <div className="px-2 py-3 text-center text-[11px] font-semibold text-neutral-500">
                No airports found
              </div>
            ) : (
              filteredAirports.slice(0, 20).map((airport) => {
                const isSelected = value.includes(airport.code);
                return (
                  <button
                    key={airport.code}
                    onClick={() => handleToggleAirport(airport)}
                    className={`w-full flex items-center gap-1.5 px-2 py-2 rounded-xl transition-all text-left mb-1 touch-manipulation min-h-[40px] active:scale-[0.98] ${
                      isSelected
                        ? 'bg-primary-50 border-2 border-primary-300'
                        : 'hover:bg-neutral-50 border-2 border-transparent active:bg-neutral-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded-md border-neutral-300 text-primary-500 pointer-events-none flex-shrink-0"
                    />
                    <span className="text-sm flex-shrink-0">{airport.emoji}</span>
                    <div className="flex flex-col min-w-0 flex-1 leading-tight">
                      <span className="font-semibold text-neutral-800 text-[11px] truncate">{airport.city}</span>
                      <span className="text-neutral-500 text-[9px] truncate">{airport.code} • {airport.name}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-primary-500 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Done Button - Apple-Class Sticky Bottom */}
          <div className="sticky bottom-0 p-3 bg-white/95 backdrop-blur-sm border-t border-neutral-200">
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
