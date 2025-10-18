'use client';

import { useState, useEffect } from 'react';
import { FlightOffer, normalizePrice } from '@/lib/flights/types';
import { spacing, typography, colors, dimensions } from '@/lib/design-system';

// Filter state interface
export interface FlightFilters {
  priceRange: [number, number];
  stops: ('direct' | '1-stop' | '2+-stops')[];
  airlines: string[];
  departureTime: ('morning' | 'afternoon' | 'evening' | 'night')[];
  maxDuration: number;
  excludeBasicEconomy: boolean;
  cabinClass: ('ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST')[];
  baggageIncluded: boolean;
  refundableOnly: boolean;
  maxLayoverDuration: number; // in minutes
  alliances: ('star-alliance' | 'oneworld' | 'skyteam')[];
  aircraftTypes: string[];
  maxCO2Emissions: number; // kg per passenger
  connectionQuality: ('short' | 'medium' | 'long')[];
}

// Re-export FlightOffer for components that import from this file
export type { FlightOffer };

interface FlightFiltersProps {
  filters: FlightFilters;
  onFiltersChange: (filters: FlightFilters) => void;
  flightData: FlightOffer[];
  resultCounts?: {
    stops: { direct: number; '1-stop': number; '2+-stops': number };
    airlines: Record<string, number>;
    departureTime: { morning: number; afternoon: number; evening: number; night: number };
  };
  lang?: 'en' | 'pt' | 'es';
}

const content = {
  en: {
    filters: 'Filters',
    resetAll: 'Reset All Filters',
    priceRange: 'Price Range',
    stops: 'Number of Stops',
    direct: 'Direct',
    oneStop: '1 Stop',
    twoPlusStops: '2+ Stops',
    airlines: 'Airlines',
    selectAll: 'Select All',
    departureTime: 'Departure Time',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    flightDuration: 'Max Flight Duration',
    hours: 'hours',
    results: 'results',
    showFilters: 'Show Filters',
    hideFilters: 'Hide Filters',
    applyFilters: 'Apply Filters',
    fareClass: 'Fare Class',
    excludeBasicEconomy: 'Exclude Basic Economy',
    basicEconomyDesc: 'Hide fares with restrictions (no bags, no refunds)',
    cabinClass: 'Cabin Class',
    economy: 'Economy',
    premiumEconomy: 'Premium Economy',
    business: 'Business',
    first: 'First Class',
    baggageIncluded: 'Baggage Included',
    baggageIncludedDesc: 'Only show flights with checked bags included',
    refundableOnly: 'Refundable Only',
    refundableOnlyDesc: 'Only show fully refundable fares',
    maxLayover: 'Max Layover Duration',
    minutes: 'minutes',
    alliances: 'Airline Alliances',
    starAlliance: 'Star Alliance',
    oneworld: 'oneworld',
    skyteam: 'SkyTeam',
    aircraftType: 'Aircraft Type',
    co2Emissions: 'CO₂ Emissions',
    maxEmissions: 'Max Emissions per Passenger',
    connectionQuality: 'Connection Preference',
    shortConnection: 'Short (< 2h)',
    mediumConnection: 'Medium (2-4h)',
    longConnection: 'Long (> 4h)',
  },
  pt: {
    filters: 'Filtros',
    resetAll: 'Limpar Filtros',
    priceRange: 'Faixa de Preço',
    stops: 'Número de Paradas',
    direct: 'Direto',
    oneStop: '1 Parada',
    twoPlusStops: '2+ Paradas',
    airlines: 'Companhias Aéreas',
    selectAll: 'Selecionar Todas',
    departureTime: 'Horário de Partida',
    morning: 'Manhã',
    afternoon: 'Tarde',
    evening: 'Noite',
    night: 'Madrugada',
    flightDuration: 'Duração Máxima do Voo',
    hours: 'horas',
    results: 'resultados',
    showFilters: 'Mostrar Filtros',
    hideFilters: 'Ocultar Filtros',
    applyFilters: 'Aplicar Filtros',
    fareClass: 'Classe Tarifária',
    excludeBasicEconomy: 'Excluir Tarifa Básica',
    basicEconomyDesc: 'Ocultar tarifas com restrições (sem bagagem, sem reembolso)',
    cabinClass: 'Classe da Cabine',
    economy: 'Econômica',
    premiumEconomy: 'Econômica Premium',
    business: 'Executiva',
    first: 'Primeira Classe',
    baggageIncluded: 'Bagagem Incluída',
    baggageIncludedDesc: 'Mostrar apenas voos com bagagem despachada incluída',
    refundableOnly: 'Apenas Reembolsável',
    refundableOnlyDesc: 'Mostrar apenas tarifas totalmente reembolsáveis',
    maxLayover: 'Duração Máxima da Conexão',
    minutes: 'minutos',
    alliances: 'Alianças de Companhias',
    starAlliance: 'Star Alliance',
    oneworld: 'oneworld',
    skyteam: 'SkyTeam',
    aircraftType: 'Tipo de Aeronave',
    co2Emissions: 'Emissões de CO₂',
    maxEmissions: 'Emissões Máximas por Passageiro',
    connectionQuality: 'Preferência de Conexão',
    shortConnection: 'Curta (< 2h)',
    mediumConnection: 'Média (2-4h)',
    longConnection: 'Longa (> 4h)',
  },
  es: {
    filters: 'Filtros',
    resetAll: 'Limpiar Filtros',
    priceRange: 'Rango de Precio',
    stops: 'Número de Paradas',
    direct: 'Directo',
    oneStop: '1 Parada',
    twoPlusStops: '2+ Paradas',
    airlines: 'Aerolíneas',
    selectAll: 'Seleccionar Todas',
    departureTime: 'Hora de Salida',
    morning: 'Mañana',
    afternoon: 'Tarde',
    evening: 'Noche',
    night: 'Madrugada',
    flightDuration: 'Duración Máxima del Vuelo',
    hours: 'horas',
    results: 'resultados',
    showFilters: 'Mostrar Filtros',
    hideFilters: 'Ocultar Filtros',
    applyFilters: 'Aplicar Filtros',
    fareClass: 'Clase de Tarifa',
    excludeBasicEconomy: 'Excluir Tarifa Básica',
    basicEconomyDesc: 'Ocultar tarifas con restricciones (sin equipaje, sin reembolsos)',
    cabinClass: 'Clase de Cabina',
    economy: 'Económica',
    premiumEconomy: 'Económica Premium',
    business: 'Ejecutiva',
    first: 'Primera Clase',
    baggageIncluded: 'Equipaje Incluido',
    baggageIncludedDesc: 'Mostrar solo vuelos con equipaje facturado incluido',
    refundableOnly: 'Solo Reembolsable',
    refundableOnlyDesc: 'Mostrar solo tarifas totalmente reembolsables',
    maxLayover: 'Duración Máxima de Escala',
    minutes: 'minutos',
    alliances: 'Alianzas de Aerolíneas',
    starAlliance: 'Star Alliance',
    oneworld: 'oneworld',
    skyteam: 'SkyTeam',
    aircraftType: 'Tipo de Aeronave',
    co2Emissions: 'Emisiones de CO₂',
    maxEmissions: 'Emisiones Máximas por Pasajero',
    connectionQuality: 'Preferencia de Conexión',
    shortConnection: 'Corta (< 2h)',
    mediumConnection: 'Media (2-4h)',
    longConnection: 'Larga (> 4h)',
  },
};

const timeRanges = {
  morning: { start: 6, end: 12, icon: '🌅' },
  afternoon: { start: 12, end: 18, icon: '☀️' },
  evening: { start: 18, end: 22, icon: '🌆' },
  night: { start: 22, end: 6, icon: '🌙' },
};

// Comprehensive Airline codes mapping - All major airlines worldwide
const airlineNames: Record<string, string> = {
  // North America
  AA: 'American Airlines',
  DL: 'Delta Air Lines',
  UA: 'United Airlines',
  WN: 'Southwest Airlines',
  B6: 'JetBlue Airways',
  AS: 'Alaska Airlines',
  NK: 'Spirit Airlines',
  F9: 'Frontier Airlines',
  G4: 'Allegiant Air',
  HA: 'Hawaiian Airlines',
  AC: 'Air Canada',
  WS: 'WestJet',
  AM: 'Aeromexico',
  Y4: 'Volaris',
  VB: 'VivaAerobus',

  // Europe
  BA: 'British Airways',
  AF: 'Air France',
  LH: 'Lufthansa',
  KL: 'KLM',
  IB: 'Iberia',
  AZ: 'ITA Airways',
  TP: 'TAP Air Portugal',
  LX: 'Swiss International',
  OS: 'Austrian Airlines',
  SN: 'Brussels Airlines',
  SK: 'Scandinavian Airlines',
  AY: 'Finnair',
  FR: 'Ryanair',
  U2: 'easyJet',
  W6: 'Wizz Air',
  VY: 'Vueling',
  EI: 'Aer Lingus',
  LO: 'LOT Polish Airlines',
  OK: 'Czech Airlines',
  RO: 'Tarom',
  JU: 'Air Serbia',

  // Middle East
  EK: 'Emirates',
  QR: 'Qatar Airways',
  EY: 'Etihad Airways',
  MS: 'EgyptAir',
  TK: 'Turkish Airlines',
  SV: 'Saudia',
  GF: 'Gulf Air',
  WY: 'Oman Air',
  RJ: 'Royal Jordanian',

  // Asia-Pacific
  SQ: 'Singapore Airlines',
  CX: 'Cathay Pacific',
  NH: 'ANA',
  JL: 'Japan Airlines',
  KE: 'Korean Air',
  OZ: 'Asiana Airlines',
  TG: 'Thai Airways',
  MH: 'Malaysia Airlines',
  GA: 'Garuda Indonesia',
  PR: 'Philippine Airlines',
  VN: 'Vietnam Airlines',
  CI: 'China Airlines',
  BR: 'EVA Air',
  CZ: 'China Southern',
  CA: 'Air China',
  MU: 'China Eastern',
  HU: 'Hainan Airlines',
  AI: 'Air India',
  '6E': 'IndiGo',
  SG: 'SpiceJet',
  QF: 'Qantas',
  VA: 'Virgin Australia',
  NZ: 'Air New Zealand',
  FJ: 'Fiji Airways',

  // South America
  LA: 'LATAM Airlines',
  G3: 'Gol',
  AD: 'Azul',
  AR: 'Aerolineas Argentinas',
  CM: 'Copa Airlines',
  AV: 'Avianca',
  JJ: 'LATAM Brasil',

  // Africa
  ET: 'Ethiopian Airlines',
  SA: 'South African Airways',
  KQ: 'Kenya Airways',
  AT: 'Royal Air Maroc',

  // Low-cost carriers
  Z0: 'easyJet Switzerland',
  DS: 'easyJet Switzerland',
  PC: 'Pegasus Airlines',
  XY: 'flynas',
  SL: 'Lion Air',
  AK: 'AirAsia',
  D7: 'AirAsia X',
  FD: 'Thai AirAsia',
  XT: 'Indonesia AirAsia X',
  I5: 'AirAsia India',
  TR: 'Scoot',
  VJ: 'VietJet Air',
  JQ: 'Jetstar Airways',
  '3K': 'Jetstar Asia',
};

// Alliance member airlines mapping
const allianceMembers = {
  'star-alliance': ['UA', 'AC', 'LH', 'NH', 'SQ', 'TK', 'OS', 'LX', 'SK', 'TP'],
  'oneworld': ['AA', 'BA', 'QF', 'CX', 'JL', 'IB', 'AY', 'QR', 'MH'],
  'skyteam': ['DL', 'AF', 'KL', 'AZ', 'AM', 'AR', 'CZ', 'OK', 'SU', 'VN'],
};

export default function FlightFilters({
  filters,
  onFiltersChange,
  flightData,
  resultCounts,
  lang = 'en',
}: FlightFiltersProps) {
  const t = content[lang];
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Calculate min/max price from flight data
  const priceRange = flightData.reduce(
    (acc, flight) => {
      const price = normalizePrice(flight.price.total);
      return {
        min: Math.min(acc.min, price),
        max: Math.max(acc.max, price),
      };
    },
    { min: Infinity, max: 0 }
  );

  const minPrice = Math.floor(priceRange.min || 0);
  const maxPrice = Math.ceil(priceRange.max || 10000);

  // Extract unique airlines from flight data
  const availableAirlines = Array.from(
    new Set(
      flightData.flatMap((flight) =>
        flight.itineraries.flatMap((itinerary) =>
          itinerary.segments.map((segment) => segment.carrierCode)
        )
      )
    )
  ).sort();

  // Calculate max duration from flight data
  const maxDurationValue = Math.ceil(
    Math.max(
      ...flightData.map((flight) => {
        const duration = flight.itineraries[0].duration;
        return parseDuration(duration);
      })
    ) / 60
  );

  // Parse ISO 8601 duration to minutes
  function parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return 0;
    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    return hours * 60 + minutes;
  }

  /**
   * Get dynamic step size based on price range
   * Larger ranges use bigger steps for faster sliding
   */
  function getDynamicStep(range: number): number {
    if (range > 5000) return 50;
    if (range > 2000) return 20;
    return 10;
  }

  /**
   * Format price with commas for readability
   */
  function formatPrice(price: number): string {
    return price.toLocaleString('en-US');
  }

  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...localFilters.priceRange] as [number, number];
    newRange[index] = value;

    // Ensure min doesn't exceed max
    if (index === 0 && value > newRange[1]) {
      newRange[1] = value;
    }
    // Ensure max doesn't go below min
    if (index === 1 && value < newRange[0]) {
      newRange[0] = value;
    }

    const updated = { ...localFilters, priceRange: newRange };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  /**
   * Handle price change with haptic feedback on mobile
   * Provides subtle vibration when slider value changes
   */
  const handlePriceChangeWithHaptic = (index: 0 | 1, value: number) => {
    // Haptic feedback on mobile (only if value changed)
    if ('vibrate' in navigator && value !== localFilters.priceRange[index]) {
      navigator.vibrate(5); // Very subtle 5ms vibration
    }

    handlePriceChange(index, value);
  };

  /**
   * Handle manual price input from text fields
   * Auto-corrects invalid ranges (min > max) for best UX
   */
  const handlePriceInputChange = (index: 0 | 1, inputValue: string) => {
    // Remove non-numeric characters except digits
    const numericValue = inputValue.replace(/[^\d]/g, '');

    if (numericValue === '') {
      return; // Don't update if empty
    }

    let value = parseInt(numericValue, 10);

    // Clamp to valid range
    value = Math.max(minPrice, Math.min(maxPrice, value));

    const newRange: [number, number] = [...localFilters.priceRange] as [number, number];
    newRange[index] = value;

    // Auto-correct: If min > max, adjust the other value
    if (index === 0 && value > newRange[1]) {
      newRange[1] = value; // Move max up to match min
    } else if (index === 1 && value < newRange[0]) {
      newRange[0] = value; // Move min down to match max
    }

    const updated = { ...localFilters, priceRange: newRange };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleStopsToggle = (stop: 'direct' | '1-stop' | '2+-stops') => {
    const newStops = localFilters.stops.includes(stop)
      ? localFilters.stops.filter((s) => s !== stop)
      : [...localFilters.stops, stop];
    const updated = { ...localFilters, stops: newStops };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleAirlineToggle = (airline: string) => {
    const newAirlines = localFilters.airlines.includes(airline)
      ? localFilters.airlines.filter((a) => a !== airline)
      : [...localFilters.airlines, airline];
    const updated = { ...localFilters, airlines: newAirlines };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleSelectAllAirlines = () => {
    const updated = {
      ...localFilters,
      airlines: localFilters.airlines.length === availableAirlines.length ? [] : [...availableAirlines],
    };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleDepartureTimeToggle = (time: 'morning' | 'afternoon' | 'evening' | 'night') => {
    const newTimes = localFilters.departureTime.includes(time)
      ? localFilters.departureTime.filter((t) => t !== time)
      : [...localFilters.departureTime, time];
    const updated = { ...localFilters, departureTime: newTimes };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleDurationChange = (value: number) => {
    const updated = { ...localFilters, maxDuration: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleBasicEconomyToggle = () => {
    const updated = { ...localFilters, excludeBasicEconomy: !localFilters.excludeBasicEconomy };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleCabinClassToggle = (cabin: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST') => {
    const newCabins = localFilters.cabinClass.includes(cabin)
      ? localFilters.cabinClass.filter((c) => c !== cabin)
      : [...localFilters.cabinClass, cabin];
    const updated = { ...localFilters, cabinClass: newCabins };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleBaggageToggle = () => {
    const updated = { ...localFilters, baggageIncluded: !localFilters.baggageIncluded };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleRefundableToggle = () => {
    const updated = { ...localFilters, refundableOnly: !localFilters.refundableOnly };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleLayoverChange = (value: number) => {
    const updated = { ...localFilters, maxLayoverDuration: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleAllianceToggle = (alliance: 'star-alliance' | 'oneworld' | 'skyteam') => {
    const newAlliances = localFilters.alliances.includes(alliance)
      ? localFilters.alliances.filter((a) => a !== alliance)
      : [...localFilters.alliances, alliance];
    const updated = { ...localFilters, alliances: newAlliances };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleCO2Change = (value: number) => {
    const updated = { ...localFilters, maxCO2Emissions: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleConnectionQualityToggle = (quality: 'short' | 'medium' | 'long') => {
    const newQualities = localFilters.connectionQuality.includes(quality)
      ? localFilters.connectionQuality.filter((q) => q !== quality)
      : [...localFilters.connectionQuality, quality];
    const updated = { ...localFilters, connectionQuality: newQualities };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleResetAll = () => {
    const resetFilters: FlightFilters = {
      priceRange: [minPrice, maxPrice],
      stops: [],
      airlines: [],
      departureTime: [],
      maxDuration: maxDurationValue,
      excludeBasicEconomy: false,
      cabinClass: [],
      baggageIncluded: false,
      refundableOnly: false,
      maxLayoverDuration: 360, // 6 hours default
      alliances: [],
      aircraftTypes: [],
      maxCO2Emissions: 500,
      connectionQuality: [],
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters =
    localFilters.stops.length > 0 ||
    localFilters.airlines.length > 0 ||
    localFilters.departureTime.length > 0 ||
    localFilters.priceRange[0] !== minPrice ||
    localFilters.priceRange[1] !== maxPrice ||
    localFilters.maxDuration !== maxDurationValue ||
    localFilters.excludeBasicEconomy ||
    localFilters.cabinClass.length > 0 ||
    localFilters.baggageIncluded ||
    localFilters.refundableOnly ||
    localFilters.maxLayoverDuration !== 360 ||
    localFilters.alliances.length > 0 ||
    localFilters.aircraftTypes.length > 0 ||
    localFilters.maxCO2Emissions !== 500 ||
    localFilters.connectionQuality.length > 0;

  const FilterContent = () => (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header - COMPACT */}
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
        <h3 className="font-bold text-gray-900" style={{ fontSize: '14px' }}>{t.filters}</h3>
        {hasActiveFilters && (
          <button
            onClick={handleResetAll}
            className="text-primary-600 hover:text-primary-700 font-semibold transition-colors flex items-center gap-0.5"
            style={{ fontSize: '11px' }}
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t.resetAll}
          </button>
        )}
      </div>

      {/* Price Range - ULTRA-COMPACT EDITABLE SLIDER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: '13px' }}>{t.priceRange}</label>
        <div style={{ paddingLeft: '4px', paddingRight: '4px' }}>
          {/* ULTRA-SMOOTH Dual Range Slider Container */}
          <div className="relative pt-4 pb-6">
            {/* Track Background - Clickable for easy interaction */}
            <div
              className="absolute w-full h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full shadow-inner cursor-pointer"
              style={{ top: '1rem', pointerEvents: 'none' }}
            ></div>

            {/* Active Range Track - Smooth animated gradient */}
            <div
              className="absolute h-2 bg-gradient-to-r from-primary-500 via-primary-600 to-blue-600 rounded-full shadow-md"
              style={{
                top: '1rem',
                left: `${((localFilters.priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                right: `${100 - ((localFilters.priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                pointerEvents: 'none',
                transition: 'all 0.05s ease-out', // Ultra fast
              }}
            ></div>

            {/* Min Range Slider - BUTTER-SMOOTH DRAGGING */}
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step={getDynamicStep(maxPrice - minPrice)}
              value={localFilters.priceRange[0]}
              onChange={(e) => handlePriceChangeWithHaptic(0, Number(e.target.value))}
              className="price-range-slider-min absolute w-full appearance-none bg-transparent outline-none"
              style={{
                top: '0.25rem',
                zIndex: localFilters.priceRange[0] > (maxPrice - minPrice) * 0.5 ? 5 : 3,
                height: '40px', // Compact but still grabbable
                pointerEvents: 'auto',
                cursor: 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                touchAction: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Minimum price"
            />

            {/* Max Range Slider - BUTTER-SMOOTH DRAGGING */}
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step={getDynamicStep(maxPrice - minPrice)}
              value={localFilters.priceRange[1]}
              onChange={(e) => handlePriceChangeWithHaptic(1, Number(e.target.value))}
              className="price-range-slider-max absolute w-full appearance-none bg-transparent outline-none"
              style={{
                top: '0.25rem',
                zIndex: localFilters.priceRange[1] <= (maxPrice - minPrice) * 0.5 ? 5 : 4,
                height: '40px', // Compact but still grabbable
                pointerEvents: 'auto',
                cursor: 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                touchAction: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label="Maximum price"
            />
          </div>

          {/* Price Inputs - EDITABLE with $ symbol */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex-1 relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-primary-700 font-bold text-xs pointer-events-none">$</span>
              <input
                type="text"
                value={formatPrice(localFilters.priceRange[0])}
                onChange={(e) => handlePriceInputChange(0, e.target.value)}
                className="w-full bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-300 rounded-md shadow-sm text-primary-700 font-bold text-xs pl-5 pr-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:shadow-md"
                placeholder={String(minPrice)}
                aria-label="Minimum price"
              />
            </div>
            <span className="text-gray-400 font-semibold text-xs flex-shrink-0">—</span>
            <div className="flex-1 relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-primary-700 font-bold text-xs pointer-events-none">$</span>
              <input
                type="text"
                value={formatPrice(localFilters.priceRange[1])}
                onChange={(e) => handlePriceInputChange(1, e.target.value)}
                className="w-full bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-300 rounded-md shadow-sm text-primary-700 font-bold text-xs pl-5 pr-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:shadow-md"
                placeholder={String(maxPrice)}
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cabin Class Filter - COMPACT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: '13px' }}>{t.cabinClass}</label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { value: 'ECONOMY' as const, label: t.economy, icon: '💺' },
            { value: 'PREMIUM_ECONOMY' as const, label: t.premiumEconomy, icon: '✨' },
            { value: 'BUSINESS' as const, label: t.business, icon: '💼' },
            { value: 'FIRST' as const, label: t.first, icon: '👑' },
          ].map(({ value, label, icon }) => (
            <label
              key={value}
              className={`flex flex-col items-center rounded-md cursor-pointer transition-all duration-150 ${
                localFilters.cabinClass.includes(value)
                  ? 'bg-primary-50 border border-primary-500'
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
              }`}
              style={{ padding: '6px 4px' }}
            >
              <input
                type="checkbox"
                checked={localFilters.cabinClass.includes(value)}
                onChange={() => handleCabinClassToggle(value)}
                className="sr-only"
              />
              <span style={{ fontSize: '16px', marginBottom: '1px' }}>{icon}</span>
              <span className="font-medium text-gray-900 text-center" style={{ fontSize: '10px' }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fare Class Filter - COMPACT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: '13px' }}>{t.fareClass}</label>
        <label
          className={`flex items-center justify-between rounded-md cursor-pointer transition-all duration-150 ${
            localFilters.excludeBasicEconomy
              ? 'bg-orange-50 border border-orange-500'
              : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
          }`}
          style={{ padding: '6px 8px' }}
        >
          <div className="flex items-center flex-1" style={{ gap: '6px' }}>
            <input
              type="checkbox"
              checked={localFilters.excludeBasicEconomy}
              onChange={handleBasicEconomyToggle}
              className="w-3 h-3 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-1 cursor-pointer"
            />
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '14px' }}>⚠️</span>
                <span className="font-medium text-gray-900" style={{ fontSize: '12px' }}>{t.excludeBasicEconomy}</span>
              </div>
              <span className="text-gray-500" style={{ fontSize: '10px', marginTop: '1px' }}>{t.basicEconomyDesc}</span>
            </div>
          </div>
        </label>
      </div>

      {/* Baggage Included Filter - COMPACT */}
      <div>
        <label
          className={`flex items-center justify-between rounded-md cursor-pointer transition-all duration-150 ${
            localFilters.baggageIncluded
              ? 'bg-blue-50 border border-blue-500'
              : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
          style={{ padding: '6px 8px' }}
        >
          <div className="flex items-center flex-1" style={{ gap: '6px' }}>
            <input
              type="checkbox"
              checked={localFilters.baggageIncluded}
              onChange={handleBaggageToggle}
              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-1 cursor-pointer"
            />
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '14px' }}>🧳</span>
                <span className="font-medium text-gray-900" style={{ fontSize: '12px' }}>{t.baggageIncluded}</span>
              </div>
              <span className="text-gray-500" style={{ fontSize: '10px', marginTop: '1px' }}>{t.baggageIncludedDesc}</span>
            </div>
          </div>
        </label>
      </div>

      {/* Refundable Only Filter - COMPACT */}
      <div>
        <label
          className={`flex items-center justify-between rounded-md cursor-pointer transition-all duration-150 ${
            localFilters.refundableOnly
              ? 'bg-green-50 border border-green-500'
              : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-green-300 hover:bg-green-50/50'
          }`}
          style={{ padding: '6px 8px' }}
        >
          <div className="flex items-center flex-1" style={{ gap: '6px' }}>
            <input
              type="checkbox"
              checked={localFilters.refundableOnly}
              onChange={handleRefundableToggle}
              className="w-3 h-3 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-1 cursor-pointer"
            />
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '14px' }}>💰</span>
                <span className="font-medium text-gray-900" style={{ fontSize: '12px' }}>{t.refundableOnly}</span>
              </div>
              <span className="text-gray-500" style={{ fontSize: '10px', marginTop: '1px' }}>{t.refundableOnlyDesc}</span>
            </div>
          </div>
        </label>
      </div>

      {/* Stops Filter - COMPACT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: '13px' }}>{t.stops}</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { value: 'direct' as const, label: t.direct, icon: '✈️' },
            { value: '1-stop' as const, label: t.oneStop, icon: '🔄' },
            { value: '2+-stops' as const, label: t.twoPlusStops, icon: '🔁' },
          ].map(({ value, label, icon }) => (
            <label
              key={value}
              className={`flex items-center justify-between rounded-lg cursor-pointer transition-all duration-200 ${
                localFilters.stops.includes(value)
                  ? 'bg-primary-50 border border-primary-500'
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
              }`}
              style={{ padding: spacing.sm }}
            >
              <div className="flex items-center" style={{ gap: spacing.sm }}>
                <input
                  type="checkbox"
                  checked={localFilters.stops.includes(value)}
                  onChange={() => handleStopsToggle(value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-1 cursor-pointer"
                />
                <span style={{ fontSize: '16px' }}>{icon}</span>
                <span className="font-medium text-gray-900" style={{ fontSize: typography.card.body.size }}>{label}</span>
              </div>
              {resultCounts?.stops[value] !== undefined && (
                <span className="font-semibold text-gray-500 bg-gray-100 rounded-full" style={{ fontSize: typography.card.meta.size, padding: `2px ${spacing.xs}` }}>
                  {resultCounts.stops[value]} {t.results}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Airlines Filter - COMPACT SINGLE LINE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-gray-900" style={{ fontSize: '13px' }}>{t.airlines}</label>
          <button
            onClick={handleSelectAllAirlines}
            className="text-primary-600 hover:text-primary-700 font-semibold"
            style={{ fontSize: '11px' }}
          >
            {t.selectAll}
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto scrollbar-hide pr-1" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {availableAirlines.map((airline) => (
            <label
              key={airline}
              className={`flex items-center justify-between rounded-md cursor-pointer transition-all duration-150 ${
                localFilters.airlines.includes(airline)
                  ? 'bg-primary-50 border border-primary-500'
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
              }`}
              style={{ padding: '6px 8px' }}
            >
              <div className="flex items-center" style={{ gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={localFilters.airlines.includes(airline)}
                  onChange={() => handleAirlineToggle(airline)}
                  className="w-3 h-3 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-1 cursor-pointer"
                />
                {/* Single line: "Airline Name, CODE" */}
                <span className="font-medium text-gray-900" style={{ fontSize: '12px' }}>
                  {airlineNames[airline] || airline}
                  <span className="text-gray-500 font-normal" style={{ fontSize: '11px' }}>, {airline}</span>
                </span>
              </div>
              {resultCounts?.airlines[airline] !== undefined && (
                <span className="font-semibold text-gray-500 bg-gray-100 rounded-full" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {resultCounts.airlines[airline]}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Airline Alliances Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: typography.card.body.size }}>{t.alliances}</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'star-alliance' as const, label: t.starAlliance, icon: '⭐' },
            { value: 'oneworld' as const, label: t.oneworld, icon: '🌐' },
            { value: 'skyteam' as const, label: t.skyteam, icon: '✈️' },
          ].map(({ value, label, icon }) => (
            <label
              key={value}
              className={`flex flex-col items-center rounded-lg cursor-pointer transition-all duration-200 ${
                localFilters.alliances.includes(value)
                  ? 'bg-primary-50 border border-primary-500'
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
              }`}
              style={{ padding: spacing.sm }}
            >
              <input
                type="checkbox"
                checked={localFilters.alliances.includes(value)}
                onChange={() => handleAllianceToggle(value)}
                className="sr-only"
              />
              <span style={{ fontSize: '18px', marginBottom: '2px' }}>{icon}</span>
              <span className="font-medium text-gray-900 text-center" style={{ fontSize: '11px' }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Time Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: typography.card.body.size }}>{t.departureTime}</label>
        <div className="grid grid-cols-2" style={{ gap: spacing.xs }}>
          {[
            { value: 'morning' as const, label: t.morning, time: '6AM-12PM', icon: timeRanges.morning.icon },
            { value: 'afternoon' as const, label: t.afternoon, time: '12PM-6PM', icon: timeRanges.afternoon.icon },
            { value: 'evening' as const, label: t.evening, time: '6PM-10PM', icon: timeRanges.evening.icon },
            { value: 'night' as const, label: t.night, time: '10PM-6AM', icon: timeRanges.night.icon },
          ].map(({ value, label, time, icon }) => (
            <label
              key={value}
              className={`flex flex-col items-center rounded-lg cursor-pointer transition-all duration-200 ${
                localFilters.departureTime.includes(value)
                  ? 'bg-primary-50 border border-primary-500'
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
              }`}
              style={{ padding: spacing.sm }}
            >
              <input
                type="checkbox"
                checked={localFilters.departureTime.includes(value)}
                onChange={() => handleDepartureTimeToggle(value)}
                className="sr-only"
              />
              <span style={{ fontSize: '18px', marginBottom: spacing.xs }}>{icon}</span>
              <span className="font-medium text-gray-900" style={{ fontSize: typography.card.body.size }}>{label}</span>
              <span className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>{time}</span>
              {resultCounts?.departureTime[value] !== undefined && (
                <span className="font-semibold text-gray-500 bg-gray-100 rounded-full" style={{ fontSize: typography.card.meta.size, padding: `2px ${spacing.xs}`, marginTop: spacing.xs }}>
                  {resultCounts.departureTime[value]}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Flight Duration Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: typography.card.body.size }}>{t.flightDuration}</label>
        <div style={{ paddingLeft: spacing.sm, paddingRight: spacing.sm }}>
          <input
            type="range"
            min={1}
            max={maxDurationValue}
            value={localFilters.maxDuration}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-primary-200 to-primary-500 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex items-center justify-between" style={{ marginTop: spacing.sm }}>
            <span className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>1h</span>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200" style={{ padding: spacing.xs }}>
              <span className="font-bold text-primary-600" style={{ fontSize: typography.card.body.size }}>
                {localFilters.maxDuration} {t.hours}
              </span>
            </div>
            <span className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>{maxDurationValue}h</span>
          </div>
        </div>
      </div>

      {/* Max Layover Duration Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: typography.card.body.size }}>{t.maxLayover}</label>
        <div style={{ paddingLeft: spacing.sm, paddingRight: spacing.sm }}>
          <input
            type="range"
            min={30}
            max={720}
            step={30}
            value={localFilters.maxLayoverDuration}
            onChange={(e) => handleLayoverChange(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-secondary-200 to-secondary-500 rounded-lg appearance-none cursor-pointer slider-thumb-secondary"
          />
          <div className="flex items-center justify-between" style={{ marginTop: spacing.sm }}>
            <span className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>30m</span>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200" style={{ padding: spacing.xs }}>
              <span className="font-bold text-secondary-600" style={{ fontSize: typography.card.body.size }}>
                {Math.floor(localFilters.maxLayoverDuration / 60)}h {localFilters.maxLayoverDuration % 60}m
              </span>
            </div>
            <span className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>12h</span>
          </div>
        </div>
      </div>

      {/* CO2 Emissions Slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: typography.card.body.size }}>{t.co2Emissions}</label>
        <div style={{ paddingLeft: spacing.sm, paddingRight: spacing.sm }}>
          <input
            type="range"
            min={0}
            max={500}
            step={10}
            value={localFilters.maxCO2Emissions}
            onChange={(e) => handleCO2Change(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-green-200 to-green-500 rounded-lg appearance-none cursor-pointer slider-thumb-green"
          />
          <div className="flex items-center justify-between" style={{ marginTop: spacing.sm }}>
            <span className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>0kg</span>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-green-200" style={{ padding: spacing.xs }}>
              <span className="font-bold text-green-600 flex items-center gap-1" style={{ fontSize: typography.card.body.size }}>
                <span style={{ fontSize: '14px' }}>🍃</span>
                {localFilters.maxCO2Emissions}kg
              </span>
            </div>
            <span className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>500kg</span>
          </div>
        </div>
      </div>

      {/* Connection Quality Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: typography.card.body.size }}>{t.connectionQuality}</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
          {[
            { value: 'short' as const, label: t.shortConnection, icon: '⚡' },
            { value: 'medium' as const, label: t.mediumConnection, icon: '⏱️' },
            { value: 'long' as const, label: t.longConnection, icon: '🕐' },
          ].map(({ value, label, icon }) => (
            <label
              key={value}
              className={`flex items-center justify-between rounded-lg cursor-pointer transition-all duration-200 ${
                localFilters.connectionQuality.includes(value)
                  ? 'bg-primary-50 border border-primary-500'
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
              }`}
              style={{ padding: spacing.sm }}
            >
              <div className="flex items-center" style={{ gap: spacing.sm }}>
                <input
                  type="checkbox"
                  checked={localFilters.connectionQuality.includes(value)}
                  onChange={() => handleConnectionQualityToggle(value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-1 cursor-pointer"
                />
                <span style={{ fontSize: '16px' }}>{icon}</span>
                <span className="font-medium text-gray-900" style={{ fontSize: typography.card.body.size }}>{label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Updated with design system dimensions (280px width from sidebar.filters) */}
      <div className="hidden lg:block flex-shrink-0" style={{ width: dimensions.sidebar.filters }}>
        <div className="sticky top-24 bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide" style={{ padding: dimensions.card.padding }}>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-2xl hover:shadow-primary transition-all duration-300 active:scale-95 flex items-center"
          style={{ padding: spacing.md, gap: spacing.xs }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 bg-secondary-500 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse" style={{ fontSize: typography.card.meta.size }}>
              !
            </span>
          )}
        </button>
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Bottom Sheet */}
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-xl rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden animate-slideUp">
            {/* Handle Bar */}
            <div className="flex justify-center border-b border-gray-200" style={{ paddingTop: spacing.sm, paddingBottom: spacing.sm }}>
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-8rem)] scrollbar-hide" style={{ padding: dimensions.card.padding }}>
              <FilterContent />
            </div>

            {/* Apply Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200" style={{ padding: dimensions.card.padding }}>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl active:scale-98 transition-all duration-300"
                style={{ padding: spacing.md, fontSize: typography.card.body.size }}
              >
                {t.applyFilters}
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        /* ULTRA-SMOOTH Price Range Slider - Perfect drag performance */
        .price-range-slider-min,
        .price-range-slider-max {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          outline: none;
          background: transparent;
        }

        /* Min Slider Thumb - WEBKIT (Chrome/Safari/Edge) - COMPACT BUT GRABBABLE */
        .price-range-slider-min::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px; /* Compact size for dense UI */
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0087FF 0%, #0070DB 100%);
          cursor: pointer;
          box-shadow:
            0 3px 12px rgba(0, 135, 255, 0.6),
            0 0 0 5px rgba(255, 255, 255, 1),
            0 0 0 7px rgba(0, 135, 255, 0.15);
          border: none;
          margin-top: -13px; /* Center on 2px track: (28 - 2) / 2 = 13 */
          pointer-events: auto;
        }

        .price-range-slider-min::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow:
            0 4px 16px rgba(0, 135, 255, 0.7),
            0 0 0 5px rgba(255, 255, 255, 1),
            0 0 0 8px rgba(0, 135, 255, 0.2);
        }

        .price-range-slider-min::-webkit-slider-thumb:active {
          cursor: pointer;
          transform: scale(1.15);
          box-shadow:
            0 6px 20px rgba(0, 135, 255, 0.85),
            0 0 0 5px rgba(255, 255, 255, 1),
            0 0 0 10px rgba(0, 135, 255, 0.3);
        }

        /* Max Slider Thumb - WEBKIT */
        .price-range-slider-max::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0087FF 0%, #0070DB 100%);
          cursor: pointer;
          box-shadow:
            0 3px 12px rgba(0, 135, 255, 0.6),
            0 0 0 5px rgba(255, 255, 255, 1),
            0 0 0 7px rgba(0, 135, 255, 0.15);
          border: none;
          margin-top: -13px;
          pointer-events: auto;
        }

        .price-range-slider-max::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow:
            0 4px 16px rgba(0, 135, 255, 0.7),
            0 0 0 5px rgba(255, 255, 255, 1),
            0 0 0 8px rgba(0, 135, 255, 0.2);
        }

        .price-range-slider-max::-webkit-slider-thumb:active {
          cursor: pointer;
          transform: scale(1.15);
          box-shadow:
            0 6px 20px rgba(0, 135, 255, 0.85),
            0 0 0 5px rgba(255, 255, 255, 1),
            0 0 0 10px rgba(0, 135, 255, 0.3);
        }

        /* Min Slider Thumb - FIREFOX */
        .price-range-slider-min::-moz-range-thumb {
          -moz-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0087FF 0%, #0070DB 100%);
          cursor: pointer;
          border: 5px solid white;
          box-shadow:
            0 3px 12px rgba(0, 135, 255, 0.6),
            0 0 0 2px rgba(0, 135, 255, 0.15);
        }

        .price-range-slider-min::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow:
            0 4px 16px rgba(0, 135, 255, 0.7),
            0 0 0 3px rgba(0, 135, 255, 0.2);
        }

        .price-range-slider-min::-moz-range-thumb:active {
          cursor: pointer;
          transform: scale(1.15);
          box-shadow:
            0 6px 20px rgba(0, 135, 255, 0.85),
            0 0 0 4px rgba(0, 135, 255, 0.3);
        }

        /* Max Slider Thumb - FIREFOX */
        .price-range-slider-max::-moz-range-thumb {
          -moz-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0087FF 0%, #0070DB 100%);
          cursor: pointer;
          border: 5px solid white;
          box-shadow:
            0 3px 12px rgba(0, 135, 255, 0.6),
            0 0 0 2px rgba(0, 135, 255, 0.15);
        }

        .price-range-slider-max::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow:
            0 4px 16px rgba(0, 135, 255, 0.7),
            0 0 0 3px rgba(0, 135, 255, 0.2);
        }

        .price-range-slider-max::-moz-range-thumb:active {
          cursor: pointer;
          transform: scale(1.15);
          box-shadow:
            0 6px 20px rgba(0, 135, 255, 0.85),
            0 0 0 4px rgba(0, 135, 255, 0.3);
        }

        /* Track styling - MUST be transparent and non-interfering */
        .price-range-slider-min::-webkit-slider-runnable-track,
        .price-range-slider-max::-webkit-slider-runnable-track {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          border: none;
          height: 2px;
          width: 100%;
        }

        .price-range-slider-min::-moz-range-track,
        .price-range-slider-max::-moz-range-track {
          -moz-appearance: none;
          appearance: none;
          background: transparent;
          border: none;
          height: 2px;
          width: 100%;
        }

        /* Remove focus ring that might interfere */
        .price-range-slider-min:focus,
        .price-range-slider-max:focus {
          outline: none;
        }

        .price-range-slider-min::-moz-focus-outer,
        .price-range-slider-max::-moz-focus-outer {
          border: 0;
        }

        /* Regular slider thumbs - other sliders */
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0087FF 0%, #006FDB 100%);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 135, 255, 0.4);
          transition: all 0.2s ease;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(0, 135, 255, 0.6);
        }

        .slider-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0087FF 0%, #006FDB 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 135, 255, 0.4);
          transition: all 0.2s ease;
        }

        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(0, 135, 255, 0.6);
        }

        /* Green slider thumb for CO2 emissions */
        .slider-thumb-green::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
          transition: all 0.2s ease;
        }

        .slider-thumb-green::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
        }

        .slider-thumb-green::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
          transition: all 0.2s ease;
        }

        .slider-thumb-green::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
        }

        .active\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </>
  );
}
