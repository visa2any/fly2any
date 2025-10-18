'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, MapPin } from 'lucide-react';

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

// Popular airports database
const AIRPORTS: Airport[] = [
  // NYC Metro
  { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA', emoji: '🗽' },
  { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark', country: 'USA', emoji: '🗽' },
  { code: 'LGA', name: 'LaGuardia', city: 'New York', country: 'USA', emoji: '🗽' },

  // LA Metro
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', emoji: '🌴' },
  { code: 'SNA', name: 'John Wayne Airport', city: 'Orange County', country: 'USA', emoji: '🌴' },
  { code: 'ONT', name: 'Ontario Intl', city: 'Ontario', country: 'USA', emoji: '🌴' },
  { code: 'BUR', name: 'Bob Hope Airport', city: 'Burbank', country: 'USA', emoji: '🌴' },
  { code: 'LGB', name: 'Long Beach Airport', city: 'Long Beach', country: 'USA', emoji: '🌴' },

  // London Metro
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', emoji: '🇬🇧' },
  { code: 'LGW', name: 'London Gatwick', city: 'London', country: 'UK', emoji: '🇬🇧' },
  { code: 'STN', name: 'London Stansted', city: 'London', country: 'UK', emoji: '🇬🇧' },
  { code: 'LTN', name: 'London Luton', city: 'London', country: 'UK', emoji: '🇬🇧' },
  { code: 'LCY', name: 'London City', city: 'London', country: 'UK', emoji: '🇬🇧' },

  // São Paulo Metro
  { code: 'GRU', name: 'São Paulo/Guarulhos Intl', city: 'São Paulo', country: 'Brazil', emoji: '🇧🇷' },
  { code: 'CGH', name: 'Congonhas Airport', city: 'São Paulo', country: 'Brazil', emoji: '🇧🇷' },
  { code: 'VCP', name: 'Viracopos Intl', city: 'Campinas', country: 'Brazil', emoji: '🇧🇷' },

  // Tokyo Metro
  { code: 'NRT', name: 'Narita Intl', city: 'Tokyo', country: 'Japan', emoji: '🗾' },
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', emoji: '🗾' },

  // Paris Metro
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', emoji: '🗼' },
  { code: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'France', emoji: '🗼' },

  // Other Major Hubs
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'UAE', emoji: '🏙️' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', emoji: '🇸🇬' },
  { code: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'USA', emoji: '🏖️' },
  { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'USA', emoji: '🌉' },
  { code: 'ORD', name: 'O\'Hare Intl', city: 'Chicago', country: 'USA', emoji: '🏙️' },
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada', emoji: '🇨🇦' },
  { code: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
  { code: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'Italy', emoji: '🏛️' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', emoji: '🇩🇪' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', emoji: '🇳🇱' },
  { code: 'MAD', name: 'Madrid-Barajas', city: 'Madrid', country: 'Spain', emoji: '🇪🇸' },
  { code: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia', emoji: '🦘' },
  { code: 'GIG', name: 'Rio de Janeiro/Galeão Intl', city: 'Rio de Janeiro', country: 'Brazil', emoji: '🏖️' },
  { code: 'EZE', name: 'Ministro Pistarini Intl', city: 'Buenos Aires', country: 'Argentina', emoji: '🥩' },
  { code: 'BOG', name: 'El Dorado Intl', city: 'Bogotá', country: 'Colombia', emoji: '☕' },
  { code: 'LIM', name: 'Jorge Chávez Intl', city: 'Lima', country: 'Peru', emoji: '🦙' },
  { code: 'SCL', name: 'Arturo Merino Benítez Intl', city: 'Santiago', country: 'Chile', emoji: '🏔️' },
  { code: 'MEX', name: 'Mexico City Intl', city: 'Mexico City', country: 'Mexico', emoji: '🌮' },
  { code: 'CUN', name: 'Cancún Intl', city: 'Cancún', country: 'Mexico', emoji: '🏝️' },
];

// Metro area groupings
const METRO_AREAS: Record<string, { name: string; codes: string[]; icon: string }> = {
  NYC: { name: 'All NYC Airports', codes: ['JFK', 'EWR', 'LGA'], icon: '🗽' },
  LA: { name: 'All LA Airports', codes: ['LAX', 'SNA', 'ONT', 'BUR', 'LGB'], icon: '🌴' },
  LON: { name: 'All London Airports', codes: ['LHR', 'LGW', 'STN', 'LTN', 'LCY'], icon: '🇬🇧' },
  SAO: { name: 'All São Paulo Airports', codes: ['GRU', 'CGH', 'VCP'], icon: '🇧🇷' },
  TYO: { name: 'All Tokyo Airports', codes: ['NRT', 'HND'], icon: '🗾' },
  PAR: { name: 'All Paris Airports', codes: ['CDG', 'ORY'], icon: '🗼' },
};

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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Main Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full relative px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-[#0087FF] transition-all text-left group"
      >
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#0087FF] transition-colors" size={18} />

        <div className="pl-7 pr-6">
          {selectedAirports.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedAirports.slice(0, maxDisplay).map((airport) => (
                <span
                  key={airport.code}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold"
                >
                  {airport.emoji} {airport.code}
                </span>
              ))}
              {selectedAirports.length > maxDisplay && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
                  +{selectedAirports.length - maxDisplay} more
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          size={16}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[90] mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search airports..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0087FF] focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Selected Airports (Chips) */}
          {selectedAirports.length > 0 && (
            <div className="p-3 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">
                  Selected ({selectedAirports.length})
                </span>
                <button
                  onClick={handleClearAll}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedAirports.map((airport) => (
                  <span
                    key={airport.code}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs font-medium text-gray-900 group hover:border-blue-400 transition-colors"
                  >
                    <span>{airport.emoji} {airport.code}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAirport(airport.code);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metro Area Quick Select */}
          {searchQuery === '' && (
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="text-xs font-semibold text-gray-700 mb-2">Quick Select</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(METRO_AREAS).map(([key, metro]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectMetroArea(key)}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-[#0087FF] hover:bg-blue-50 hover:text-[#0087FF] transition-all"
                  >
                    <span className="text-base">{metro.icon}</span>
                    <span className="truncate">{metro.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Airport List */}
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredAirports.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                No airports found
              </div>
            ) : (
              filteredAirports.map((airport) => {
                const isSelected = value.includes(airport.code);
                return (
                  <button
                    key={airport.code}
                    onClick={() => handleToggleAirport(airport)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF] pointer-events-none"
                    />
                    <span className="text-lg">{airport.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{airport.code}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 text-xs truncate">{airport.city}</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">{airport.name}</div>
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
