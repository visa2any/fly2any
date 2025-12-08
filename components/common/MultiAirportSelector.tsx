'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, MapPin, PlaneTakeoff, PlaneLanding } from 'lucide-react';
import { AIRPORTS as AIRPORTS_DATA } from '@/lib/data/airports-complete';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  emoji: string;
}

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter airports based on search query
  const filteredAirports = AIRPORTS.filter(airport =>
    airport.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    airport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    airport.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Main Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full relative px-4 bg-white border border-gray-300 rounded-lg hover:border-[#0087FF] transition-all text-left group min-h-[56px] flex items-center"
      >
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#0087FF] transition-colors flex-shrink-0" size={20} />

        <div className="pl-8 pr-6 py-3 w-full overflow-hidden">
          {selectedAirports.length === 0 ? (
            <span className="text-gray-400 text-base block truncate">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1.5 overflow-hidden">
              {selectedAirports.slice(0, maxDisplay).map((airport) => (
                <span
                  key={airport.code}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-info-50 text-primary-600 rounded-md text-sm font-semibold flex-shrink-0 max-w-[200px]"
                >
                  <span className="text-xs">{airport.emoji}</span>
                  <span className="truncate">{airport.code}</span>
                </span>
              ))}
              {selectedAirports.length > maxDisplay && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-sm font-semibold flex-shrink-0">
                  +{selectedAirports.length - maxDisplay}
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          size={16}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-dropdown mt-2 w-full bg-white rounded-xl md:rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 left-0 right-0 md:left-auto md:right-auto">
          {/* Search Input */}
          <div className="p-2 md:p-2 px-1 md:px-2 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search airports..."
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0087FF] focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Selected Airports (Chips) */}
          {selectedAirports.length > 0 && (
            <div className="p-2 bg-info-50 border-b border-blue-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-gray-700">
                  Selected ({selectedAirports.length})
                </span>
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-medium text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedAirports.map((airport) => (
                  <span
                    key={airport.code}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-info-200 rounded text-[10px] font-medium text-gray-900 group hover:border-blue-400 transition-colors"
                  >
                    <span>{airport.emoji} {airport.code}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAirport(airport.code);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metro Area Quick Select */}
          {searchQuery === '' && (
            <div className="p-2 md:p-2 px-1 md:px-2 bg-gray-50 border-b border-gray-200">
              <div className="text-[10px] font-semibold text-gray-700 mb-1.5">Quick Select</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {Object.entries(METRO_AREAS).map(([key, metro]) => (
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

          {/* Airport List - Mobile Single Column */}
          <div className="max-h-[60vh] overflow-y-auto p-1 md:p-1.5">
            {filteredAirports.length === 0 ? (
              <div className="px-2 py-3 text-center text-xs text-gray-500">
                No airports found
              </div>
            ) : (
              filteredAirports.map((airport) => {
                const isSelected = value.includes(airport.code);
                return (
                  <button
                    key={airport.code}
                    onClick={() => handleToggleAirport(airport)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left mb-1 ${
                      isSelected
                        ? 'bg-info-50 border border-info-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF] pointer-events-none flex-shrink-0"
                    />
                    <span className="text-base flex-shrink-0">{airport.emoji}</span>
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="font-semibold text-gray-900 text-xs flex-shrink-0">{airport.code}</span>
                      <span className="text-gray-400 text-xs flex-shrink-0">•</span>
                      <span className="text-gray-600 text-[10px] truncate">{airport.city}, {airport.country}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
