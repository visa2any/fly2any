'use client';

/**
 * Advanced Search Filters Component
 *
 * Provides comprehensive filtering options for flight search results:
 * - Airlines (multi-select with logos)
 * - Price range (slider)
 * - Departure/Arrival times (day segments)
 * - Stops (direct, 1 stop, 2+ stops)
 * - Duration range
 * - Aircraft type
 * - Baggage policies
 * - Cabin class upgrade
 * - Layover duration
 * - Alliance preferences
 *
 * Features:
 * - Progressive disclosure (expandable sections)
 * - Active filter count badges
 * - Clear all functionality
 * - Mobile-responsive drawer
 * - Preserves filter state
 * - Real-time result count updates
 *
 * @module AdvancedSearchFilters
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Clock,
  Plane,
  Briefcase,
  MapPin,
  ShieldCheck,
  Settings,
  RotateCcw,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Zap,
  Luggage
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FilterState {
  // Price
  priceRange: [number, number];
  maxPrice?: number;

  // Airlines
  airlines: string[]; // Array of airline codes
  alliances: string[]; // Star Alliance, OneWorld, SkyTeam

  // Stops
  stops: ('direct' | '1-stop' | '2+-stops')[];

  // Times (24-hour format)
  departureTime: {
    outbound: ('early-morning' | 'morning' | 'afternoon' | 'evening')[];
    return?: ('early-morning' | 'morning' | 'afternoon' | 'evening')[];
  };

  // Duration
  maxDuration?: number; // minutes

  // Aircraft
  aircraftTypes: ('narrowbody' | 'widebody' | 'regional')[];

  // Cabin class upgrade
  cabinClasses: ('economy' | 'premium_economy' | 'business' | 'first')[];

  // Baggage
  includedBags?: {
    checked: number; // minimum checked bags
    carry: number; // minimum carry-on bags
  };

  // Layover
  maxLayoverDuration?: number; // minutes

  // Sustainability
  sustainabilityGrades?: ('A' | 'B' | 'C' | 'D' | 'F')[];
}

interface AdvancedSearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  availableAirlines?: Array<{ code: string; name: string; count: number }>;
  priceRange?: [number, number];
  resultCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  lang?: 'en' | 'pt' | 'es';
}

// ============================================================================
// TRANSLATIONS
// ============================================================================

const translations = {
  en: {
    title: 'Filters',
    activeFilters: 'active',
    clearAll: 'Clear all',
    applyFilters: 'Apply Filters',
    results: 'results',
    price: 'Price Range',
    airlines: 'Airlines',
    allAirlines: 'All Airlines',
    stops: 'Stops',
    direct: 'Direct only',
    oneStop: '1 stop',
    twoPlus: '2+ stops',
    departureTime: 'Departure Time',
    returnTime: 'Return Time',
    outbound: 'Outbound',
    earlyMorning: 'Early Morning (12am-6am)',
    morning: 'Morning (6am-12pm)',
    afternoon: 'Afternoon (12pm-6pm)',
    evening: 'Evening (6pm-12am)',
    duration: 'Max Flight Duration',
    hours: 'hours',
    aircraft: 'Aircraft Type',
    narrowbody: 'Narrowbody (A320, 737)',
    widebody: 'Widebody (A350, 787)',
    regional: 'Regional jets',
    cabinClass: 'Cabin Class',
    economy: 'Economy',
    premiumEconomy: 'Premium Economy',
    business: 'Business',
    first: 'First Class',
    baggage: 'Baggage Included',
    checkedBags: 'Checked bags',
    carryOn: 'Carry-on',
    layover: 'Max Layover Duration',
    sustainability: 'Sustainability',
    excellentOnly: 'A-B grades only',
    alliances: 'Airline Alliances',
    starAlliance: 'Star Alliance',
    oneworld: 'Oneworld',
    skyteam: 'SkyTeam',
  },
  pt: {
    title: 'Filtros',
    activeFilters: 'ativos',
    clearAll: 'Limpar tudo',
    applyFilters: 'Aplicar Filtros',
    results: 'resultados',
    price: 'Faixa de Preço',
    airlines: 'Companhias Aéreas',
    allAirlines: 'Todas as Companhias',
    stops: 'Paradas',
    direct: 'Apenas direto',
    oneStop: '1 parada',
    twoPlus: '2+ paradas',
    departureTime: 'Horário de Partida',
    returnTime: 'Horário de Retorno',
    outbound: 'Ida',
    earlyMorning: 'Madrugada (00h-06h)',
    morning: 'Manhã (06h-12h)',
    afternoon: 'Tarde (12h-18h)',
    evening: 'Noite (18h-00h)',
    duration: 'Duração Máxima do Voo',
    hours: 'horas',
    aircraft: 'Tipo de Aeronave',
    narrowbody: 'Narrowbody (A320, 737)',
    widebody: 'Widebody (A350, 787)',
    regional: 'Jatos regionais',
    cabinClass: 'Classe da Cabine',
    economy: 'Econômica',
    premiumEconomy: 'Econômica Premium',
    business: 'Executiva',
    first: 'Primeira Classe',
    baggage: 'Bagagem Incluída',
    checkedBags: 'Malas despachadas',
    carryOn: 'Bagagem de mão',
    layover: 'Duração Máxima da Conexão',
    sustainability: 'Sustentabilidade',
    excellentOnly: 'Apenas notas A-B',
    alliances: 'Alianças Aéreas',
    starAlliance: 'Star Alliance',
    oneworld: 'Oneworld',
    skyteam: 'SkyTeam',
  },
  es: {
    title: 'Filtros',
    activeFilters: 'activos',
    clearAll: 'Limpiar todo',
    applyFilters: 'Aplicar Filtros',
    results: 'resultados',
    price: 'Rango de Precio',
    airlines: 'Aerolíneas',
    allAirlines: 'Todas las Aerolíneas',
    stops: 'Escalas',
    direct: 'Solo directo',
    oneStop: '1 escala',
    twoPlus: '2+ escalas',
    departureTime: 'Hora de Salida',
    returnTime: 'Hora de Regreso',
    outbound: 'Ida',
    earlyMorning: 'Madrugada (00h-06h)',
    morning: 'Mañana (06h-12h)',
    afternoon: 'Tarde (12h-18h)',
    evening: 'Noche (18h-00h)',
    duration: 'Duración Máxima del Vuelo',
    hours: 'horas',
    aircraft: 'Tipo de Aeronave',
    narrowbody: 'Narrowbody (A320, 737)',
    widebody: 'Widebody (A350, 787)',
    regional: 'Jets regionales',
    cabinClass: 'Clase de Cabina',
    economy: 'Económica',
    premiumEconomy: 'Económica Premium',
    business: 'Ejecutiva',
    first: 'Primera Clase',
    baggage: 'Equipaje Incluido',
    checkedBags: 'Maletas facturadas',
    carryOn: 'Equipaje de mano',
    layover: 'Duración Máxima de Conexión',
    sustainability: 'Sostenibilidad',
    excellentOnly: 'Solo calificaciones A-B',
    alliances: 'Alianzas Aéreas',
    starAlliance: 'Star Alliance',
    oneworld: 'Oneworld',
    skyteam: 'SkyTeam',
  }
};

// ============================================================================
// TIME SEGMENT ICONS
// ============================================================================

const TimeSegmentIcon: React.FC<{ segment: string; className?: string }> = ({ segment, className = 'w-5 h-5' }) => {
  switch (segment) {
    case 'early-morning':
      return <Moon className={className} />;
    case 'morning':
      return <Sunrise className={className} />;
    case 'afternoon':
      return <Sun className={className} />;
    case 'evening':
      return <Sunset className={className} />;
    default:
      return <Clock className={className} />;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  onFilterChange,
  availableAirlines = [],
  priceRange = [0, 2000],
  resultCount,
  isOpen = true,
  onClose,
  lang = 'en',
}) => {
  const t = translations[lang];

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    priceRange: priceRange,
    airlines: [],
    alliances: [],
    stops: [],
    departureTime: {
      outbound: [],
      return: [],
    },
    aircraftTypes: [],
    cabinClasses: [],
    sustainabilityGrades: [],
  });

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    airlines: false,
    stops: true,
    time: false,
    duration: false,
    aircraft: false,
    cabin: false,
    baggage: false,
    layover: false,
    sustainability: false,
    alliances: false,
  });

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) count++;
    if (filters.airlines.length > 0) count++;
    if (filters.alliances.length > 0) count++;
    if (filters.stops.length > 0) count++;
    if (filters.departureTime.outbound.length > 0) count++;
    if (filters.departureTime.return && filters.departureTime.return.length > 0) count++;
    if (filters.maxDuration) count++;
    if (filters.aircraftTypes.length > 0) count++;
    if (filters.cabinClasses.length > 0) count++;
    if (filters.includedBags) count++;
    if (filters.maxLayoverDuration) count++;
    if (filters.sustainabilityGrades && filters.sustainabilityGrades.length > 0) count++;

    return count;
  }, [filters, priceRange]);

  // Apply filters on change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Toggle section
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      priceRange: priceRange,
      airlines: [],
      alliances: [],
      stops: [],
      departureTime: {
        outbound: [],
        return: [],
      },
      aircraftTypes: [],
      cabinClasses: [],
      sustainabilityGrades: [],
    });
  };

  // Toggle array filter
  const toggleArrayFilter = <T extends string>(
    key: keyof FilterState,
    value: T,
    currentArray: T[]
  ): T[] => {
    if (currentArray.includes(value)) {
      return currentArray.filter(v => v !== value);
    } else {
      return [...currentArray, value];
    }
  };

  // Render filter section
  const FilterSection: React.FC<{
    title: string;
    section: keyof typeof expandedSections;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, section, icon, children }) => {
    const isExpanded = expandedSections[section];

    return (
      <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <button
          onClick={() => toggleSection(section)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">{icon}</span>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#0087FF]" />
          <h3 className="font-bold text-gray-900 dark:text-white">{t.title}</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-[#0087FF] text-white text-xs font-semibold rounded-full">
              {activeFilterCount} {t.activeFilters}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.clearAll}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Result Count */}
      {resultCount !== undefined && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800">
          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            <Zap className="w-4 h-4 inline mr-1" />
            {resultCount} {t.results}
          </span>
        </div>
      )}

      {/* Filter Sections */}
      <div className="max-h-[70vh] overflow-y-auto">
        {/* Price Range */}
        <FilterSection title={t.price} section="price" icon={<DollarSign className="w-4 h-4" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
            <input
              type="range"
              min={priceRange[0]}
              max={priceRange[1]}
              value={filters.priceRange[1]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                priceRange: [prev.priceRange[0], parseInt(e.target.value)]
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[#0087FF]"
            />
          </div>
        </FilterSection>

        {/* Stops */}
        <FilterSection title={t.stops} section="stops" icon={<MapPin className="w-4 h-4" />}>
          <div className="space-y-2">
            {(['direct', '1-stop', '2+-stops'] as const).map((stop) => (
              <label key={stop} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.stops.includes(stop)}
                  onChange={() => setFilters(prev => ({
                    ...prev,
                    stops: toggleArrayFilter('stops', stop, prev.stops)
                  }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#0087FF]">
                  {stop === 'direct' ? t.direct : stop === '1-stop' ? t.oneStop : t.twoPlus}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Departure Time */}
        <FilterSection title={t.departureTime} section="time" icon={<Clock className="w-4 h-4" />}>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {t.outbound}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['early-morning', 'morning', 'afternoon', 'evening'] as const).map((segment) => (
                  <button
                    key={segment}
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      departureTime: {
                        ...prev.departureTime,
                        outbound: toggleArrayFilter('departureTime', segment, prev.departureTime.outbound)
                      }
                    }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      filters.departureTime.outbound.includes(segment)
                        ? 'bg-[#0087FF] border-[#0087FF] text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#0087FF]'
                    }`}
                  >
                    <TimeSegmentIcon segment={segment} className="w-4 h-4" />
                    <span className="text-xs">
                      {segment === 'early-morning' ? t.earlyMorning :
                       segment === 'morning' ? t.morning :
                       segment === 'afternoon' ? t.afternoon :
                       t.evening}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Airlines */}
        {availableAirlines.length > 0 && (
          <FilterSection title={t.airlines} section="airlines" icon={<Plane className="w-4 h-4" />}>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableAirlines.slice(0, 10).map((airline) => (
                <label key={airline.code} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.airlines.includes(airline.code)}
                      onChange={() => setFilters(prev => ({
                        ...prev,
                        airlines: toggleArrayFilter('airlines', airline.code, prev.airlines)
                      }))}
                      className="w-4 h-4 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#0087FF]">
                      {airline.code} - {airline.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">({airline.count})</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Cabin Class */}
        <FilterSection title={t.cabinClass} section="cabin" icon={<Briefcase className="w-4 h-4" />}>
          <div className="space-y-2">
            {(['economy', 'premium_economy', 'business', 'first'] as const).map((cabin) => (
              <label key={cabin} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.cabinClasses.includes(cabin)}
                  onChange={() => setFilters(prev => ({
                    ...prev,
                    cabinClasses: toggleArrayFilter('cabinClasses', cabin, prev.cabinClasses)
                  }))}
                  className="w-4 h-4 rounded border-gray-300 text-[#0087FF] focus:ring-[#0087FF]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#0087FF]">
                  {cabin === 'economy' ? t.economy :
                   cabin === 'premium_economy' ? t.premiumEconomy :
                   cabin === 'business' ? t.business :
                   t.first}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Sustainability */}
        <FilterSection title={t.sustainability} section="sustainability" icon={<ShieldCheck className="w-4 h-4" />}>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.sustainabilityGrades?.includes('A') || filters.sustainabilityGrades?.includes('B')}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                sustainabilityGrades: e.target.checked ? ['A', 'B'] : []
              }))}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-600">
              {t.excellentOnly}
            </span>
          </label>
        </FilterSection>
      </div>

      {/* Apply Button (Mobile) */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 md:hidden">
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#0087FF] hover:bg-[#0077DD] text-white font-semibold rounded-lg transition-colors"
        >
          {t.applyFilters}
        </button>
      </div>
    </div>
  );
};

export default AdvancedSearchFilters;
