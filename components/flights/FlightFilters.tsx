'use client';

import { useState, useEffect } from 'react';
import { FlightOffer, normalizePrice } from '@/lib/flights/types';
import { spacing, typography, colors, dimensions } from '@/lib/design-system';
import { useCurrency } from '@/lib/context/CurrencyContext';

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
  // NDC Filters
  ndcOnly: boolean; // Show only NDC flights
  showExclusiveFares: boolean; // Show NDC exclusive fares
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
    // NDC Filters
    ndcFlights: 'NDC Direct Booking',
    ndcOnly: 'NDC Flights Only',
    ndcOnlyDesc: 'Show only flights with direct airline connections',
    exclusiveFares: 'Show Exclusive Fares',
    exclusiveFaresDesc: 'Display special offers only available through NDC',
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
    ndcFlights: 'Reserva Direta NDC',
    ndcOnly: 'Apenas Voos NDC',
    ndcOnlyDesc: 'Mostrar apenas voos com conexões diretas com companhias aéreas',
    exclusiveFares: 'Mostrar Tarifas Exclusivas',
    exclusiveFaresDesc: 'Exibir ofertas especiais disponíveis apenas através de NDC',
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
    ndcFlights: 'Reserva Directa NDC',
    ndcOnly: 'Solo Vuelos NDC',
    ndcOnlyDesc: 'Mostrar solo vuelos con conexiones directas con aerolíneas',
    exclusiveFares: 'Mostrar Tarifas Exclusivas',
    exclusiveFaresDesc: 'Mostrar ofertas especiales disponibles solo a través de NDC',
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
  const { getSymbol } = useCurrency();
  const currencySymbol = getSymbol();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Lock body scroll when mobile filter sheet is open (Chrome + iOS safe)
  useEffect(() => {
    if (isMobileOpen) {
      // Chrome requires BOTH html and body to be locked
      const html = document.documentElement;
      const body = document.body;

      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.touchAction = 'none'; // Prevent iOS bounce
      body.style.height = '100%'; // Chrome fix
    } else {
      // Restore scroll
      const html = document.documentElement;
      const body = document.body;

      html.style.overflow = '';
      body.style.overflow = '';
      body.style.touchAction = '';
      body.style.height = '';
    }

    return () => {
      // Ensure cleanup
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.height = '';
    };
  }, [isMobileOpen]);

  // Local state for price inputs (raw values while typing)
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');
  const [isMinFocused, setIsMinFocused] = useState(false);
  const [isMaxFocused, setIsMaxFocused] = useState(false);

  // ✨ NEW: Airline search state
  const [airlineSearch, setAirlineSearch] = useState<string>('');

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

  // ✨ PHASE 2: Filter airlines by search term
  const filteredAirlines = availableAirlines.filter((airline) => {
    if (!airlineSearch.trim()) return true;
    const searchLower = airlineSearch.toLowerCase();
    const name = airlineNames[airline] || airline;
    return (
      name.toLowerCase().includes(searchLower) ||
      airline.toLowerCase().includes(searchLower)
    );
  });

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

  // ✨ PHASE 2: Format duration with half-hour increments
  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  /**
   * Get dynamic step size based on price range
   * Smoother steps for better user experience - OPTIMIZED FOR PRECISE CONTROL
   */
  function getDynamicStep(range: number): number {
    // Much smaller steps for smooth, precise dragging
    if (range > 5000) return 25; // Was 50, now 25 (50% smoother)
    if (range > 2000) return 10; // Was 20, now 10 (50% smoother)
    if (range > 500) return 5;   // New tier for mid-range prices
    return 1;                     // Was 10, now 1 for ultra-precise control
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
    // Update input values when not focused
    if (!isMinFocused) {
      setMinPriceInput(filters.priceRange[0].toString());
    }
    if (!isMaxFocused) {
      setMaxPriceInput(filters.priceRange[1].toString());
    }
  }, [filters, isMinFocused, isMaxFocused]);

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
      ndcOnly: false,
      showExclusiveFares: false,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  // ✨ PHASE 2: Individual clear handlers
  const handleClearCabinClass = () => {
    const updated = { ...localFilters, cabinClass: [] };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleClearStops = () => {
    const updated = { ...localFilters, stops: [] };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleClearAirlines = () => {
    const updated = { ...localFilters, airlines: [] };
    setLocalFilters(updated);
    onFiltersChange(updated);
    setAirlineSearch(''); // Also clear search
  };

  const handleClearAlliances = () => {
    const updated = { ...localFilters, alliances: [] };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleClearDepartureTime = () => {
    const updated = { ...localFilters, departureTime: [] };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleClearConnectionQuality = () => {
    const updated = { ...localFilters, connectionQuality: [] };
    setLocalFilters(updated);
    onFiltersChange(updated);
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
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {/* Header - COMPACT */}
      <div className="flex items-center justify-between pb-1 border-b border-gray-200">
        <h3 className="font-bold text-gray-900" style={{ fontSize: '14px' }}>{t.filters}</h3>
        {hasActiveFilters && (
          <button
            onClick={handleResetAll}
            className="text-primary-600 hover:text-primary-700 font-semibold transition-colors flex items-center gap-0.5"
            style={{ fontSize: '11px' }}
            aria-label="Reset all filters"
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

            {/* Active Range Track - INSTANT FEEDBACK (no transition lag) */}
            <div
              className="absolute h-2 bg-gradient-to-r from-primary-500 via-primary-600 to-blue-600 rounded-full shadow-md"
              style={{
                top: '1rem',
                left: `${((localFilters.priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                right: `${100 - ((localFilters.priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                pointerEvents: 'none',
                // NO TRANSITION - instant visual feedback for buttery smooth drag
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
              aria-valuemin={minPrice}
              aria-valuemax={maxPrice}
              aria-valuenow={localFilters.priceRange[0]}
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
              aria-valuemin={minPrice}
              aria-valuemax={maxPrice}
              aria-valuenow={localFilters.priceRange[1]}
            />
          </div>

          {/* Price Inputs - EDITABLE with currency symbol - FIXED AUTO-RESET BUG */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex-1 relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-primary-700 font-bold text-xs pointer-events-none">{currencySymbol}</span>
              <input
                type="text"
                value={isMinFocused ? minPriceInput : formatPrice(localFilters.priceRange[0])}
                onChange={(e) => {
                  // While typing, update raw input state without formatting
                  const raw = e.target.value.replace(/[^\d]/g, '');
                  setMinPriceInput(raw);
                }}
                onFocus={() => {
                  setIsMinFocused(true);
                  setMinPriceInput(localFilters.priceRange[0].toString());
                }}
                onBlur={() => {
                  setIsMinFocused(false);
                  // Validate and update filter on blur
                  if (minPriceInput.trim() !== '') {
                    const value = parseInt(minPriceInput, 10);
                    if (!isNaN(value)) {
                      handlePriceChange(0, Math.max(minPrice, Math.min(maxPrice, value)));
                    }
                  }
                }}
                className="w-full bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-300 rounded-md shadow-sm text-primary-700 font-bold text-xs pl-6 pr-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:shadow-md"
                placeholder={String(minPrice)}
                aria-label="Minimum price"
              />
            </div>
            <span className="text-gray-400 font-semibold text-xs flex-shrink-0">—</span>
            <div className="flex-1 relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-primary-700 font-bold text-xs pointer-events-none">{currencySymbol}</span>
              <input
                type="text"
                value={isMaxFocused ? maxPriceInput : formatPrice(localFilters.priceRange[1])}
                onChange={(e) => {
                  // While typing, update raw input state without formatting
                  const raw = e.target.value.replace(/[^\d]/g, '');
                  setMaxPriceInput(raw);
                }}
                onFocus={() => {
                  setIsMaxFocused(true);
                  setMaxPriceInput(localFilters.priceRange[1].toString());
                }}
                onBlur={() => {
                  setIsMaxFocused(false);
                  // Validate and update filter on blur
                  if (maxPriceInput.trim() !== '') {
                    const value = parseInt(maxPriceInput, 10);
                    if (!isNaN(value)) {
                      handlePriceChange(1, Math.max(minPrice, Math.min(maxPrice, value)));
                    }
                  }
                }}
                className="w-full bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-300 rounded-md shadow-sm text-primary-700 font-bold text-xs pl-6 pr-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:shadow-md"
                placeholder={String(maxPrice)}
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cabin Class Filter - COMPACT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-gray-900" style={{ fontSize: '13px' }}>{t.cabinClass}</label>
          {localFilters.cabinClass.length > 0 && (
            <button
              onClick={handleClearCabinClass}
              className="text-gray-500 hover:text-gray-700 font-medium"
              style={{ fontSize: '11px' }}
            >
              Clear
            </button>
          )}
        </div>
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
                aria-label={`Filter by ${label}`}
              />
              <span style={{ fontSize: '14px', marginBottom: '1px' }} aria-hidden="true">{icon}</span>
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
              aria-label={t.excludeBasicEconomy}
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
              aria-label={t.baggageIncluded}
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
              aria-label={t.refundableOnly}
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

      {/* NDC Filters Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: '13px' }}>{t.ndcFlights}</label>

        {/* NDC Only Filter */}
        <label
          className={`flex items-center justify-between rounded-md cursor-pointer transition-all duration-150 ${
            localFilters.ndcOnly
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500'
              : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
          style={{ padding: '6px 8px' }}
        >
          <div className="flex items-center flex-1" style={{ gap: '6px' }}>
            <input
              type="checkbox"
              checked={localFilters.ndcOnly}
              onChange={(e) => {
                const updated = { ...localFilters, ndcOnly: e.target.checked };
                setLocalFilters(updated);
                onFiltersChange(updated);
              }}
              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-1 cursor-pointer"
              aria-label={t.ndcOnly}
            />
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '14px' }}>✨</span>
                <span className="font-medium text-gray-900" style={{ fontSize: '12px' }}>{t.ndcOnly}</span>
              </div>
              <span className="text-gray-500" style={{ fontSize: '10px', marginTop: '1px' }}>{t.ndcOnlyDesc}</span>
            </div>
          </div>
        </label>

        {/* Exclusive Fares Filter */}
        <label
          className={`flex items-center justify-between rounded-md cursor-pointer transition-all duration-150 ${
            localFilters.showExclusiveFares
              ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-500'
              : 'bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
          }`}
          style={{ padding: '6px 8px' }}
        >
          <div className="flex items-center flex-1" style={{ gap: '6px' }}>
            <input
              type="checkbox"
              checked={localFilters.showExclusiveFares}
              onChange={(e) => {
                const updated = { ...localFilters, showExclusiveFares: e.target.checked };
                setLocalFilters(updated);
                onFiltersChange(updated);
              }}
              className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-1 cursor-pointer"
            />
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-1">
                <span style={{ fontSize: '14px' }}>🎁</span>
                <span className="font-medium text-gray-900" style={{ fontSize: '12px' }}>{t.exclusiveFares}</span>
              </div>
              <span className="text-gray-500" style={{ fontSize: '10px', marginTop: '1px' }}>{t.exclusiveFaresDesc}</span>
            </div>
          </div>
        </label>
      </div>

      {/* Stops Filter - COMPACT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-gray-900" style={{ fontSize: '13px' }}>{t.stops}</label>
          {localFilters.stops.length > 0 && (
            <button
              onClick={handleClearStops}
              className="text-gray-500 hover:text-gray-700 font-medium"
              style={{ fontSize: '11px' }}
            >
              Clear
            </button>
          )}
        </div>
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
              style={{ padding: '6px' }}
            >
              <div className="flex items-center" style={{ gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={localFilters.stops.includes(value)}
                  onChange={() => handleStopsToggle(value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-1 cursor-pointer"
                />
                <span style={{ fontSize: '14px' }}>{icon}</span>
                <span className="font-medium text-gray-900" style={{ fontSize: '12px' }}>{label}</span>
              </div>
              {resultCounts?.stops[value] !== undefined && (
                <span className="font-semibold text-gray-500 bg-gray-100 rounded-full" style={{ fontSize: '11px', padding: '2px 6px' }}>
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
          <div className="flex items-center gap-2">
            {localFilters.airlines.length > 0 && (
              <button
                onClick={handleClearAirlines}
                className="text-gray-500 hover:text-gray-700 font-medium"
                style={{ fontSize: '11px' }}
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSelectAllAirlines}
              className="text-primary-600 hover:text-primary-700 font-semibold"
              style={{ fontSize: '11px' }}
            >
              {t.selectAll}
            </button>
          </div>
        </div>

        {/* ✨ PHASE 2: Airline Search Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search airlines..."
            value={airlineSearch}
            onChange={(e) => setAirlineSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {airlineSearch && (
            <button
              onClick={() => setAirlineSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="max-h-48 overflow-y-auto scrollbar-hide pr-1" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filteredAirlines.length === 0 ? (
            <div className="text-center py-4 text-gray-500" style={{ fontSize: '12px' }}>
              No airlines found
            </div>
          ) : (
            filteredAirlines.map((airline) => (
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
                  {resultCounts?.airlines[airline]}
                </span>
              )}
            </label>
          ))
          )}
        </div>
      </div>

      {/* Airline Alliances Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-gray-900" style={{ fontSize: '12px' }}>{t.alliances}</label>
          {localFilters.alliances.length > 0 && (
            <button
              onClick={handleClearAlliances}
              className="text-gray-500 hover:text-gray-700 font-medium"
              style={{ fontSize: '11px' }}
            >
              Clear
            </button>
          )}
        </div>
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
              style={{ padding: '6px' }}
            >
              <input
                type="checkbox"
                checked={localFilters.alliances.includes(value)}
                onChange={() => handleAllianceToggle(value)}
                className="sr-only"
              />
              <span style={{ fontSize: '14px', marginBottom: '2px' }}>{icon}</span>
              <span className="font-medium text-gray-900 text-center" style={{ fontSize: '11px' }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Time Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-gray-900" style={{ fontSize: '12px' }}>{t.departureTime}</label>
          {localFilters.departureTime.length > 0 && (
            <button
              onClick={handleClearDepartureTime}
              className="text-gray-500 hover:text-gray-700 font-medium"
              style={{ fontSize: '11px' }}
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2" style={{ gap: '4px' }}>
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
              style={{ padding: '6px' }}
            >
              <input
                type="checkbox"
                checked={localFilters.departureTime.includes(value)}
                onChange={() => handleDepartureTimeToggle(value)}
                className="sr-only"
              />
              <span style={{ fontSize: '14px', marginBottom: '2px' }}>{icon}</span>
              <span className="font-medium text-gray-900" style={{ fontSize: '12px' }}>{label}</span>
              <span className="text-gray-500" style={{ fontSize: '11px' }}>{time}</span>
              {resultCounts?.departureTime[value] !== undefined && (
                <span className="font-semibold text-gray-500 bg-gray-100 rounded-full" style={{ fontSize: '11px', padding: '2px 6px', marginTop: '2px' }}>
                  {resultCounts.departureTime[value]}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Flight Duration Filter - ✨ PHASE 2: With half-hour increments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: '12px' }}>{t.flightDuration}</label>
        <div style={{ paddingLeft: '6px', paddingRight: '6px' }}>
          <input
            type="range"
            min={60}
            max={maxDurationValue * 60}
            step={30}
            value={localFilters.maxDuration * 60}
            onChange={(e) => handleDurationChange(Math.floor(Number(e.target.value) / 60))}
            className="w-full h-2 bg-gradient-to-r from-primary-200 to-primary-500 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex items-center justify-between" style={{ marginTop: '4px' }}>
            <span className="text-gray-500" style={{ fontSize: '11px' }}>1h</span>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200" style={{ padding: '4px 8px' }}>
              <span className="font-bold text-primary-600" style={{ fontSize: '12px' }}>
                {formatDuration(localFilters.maxDuration * 60)}
              </span>
            </div>
            <span className="text-gray-500" style={{ fontSize: '11px' }}>{maxDurationValue}h</span>
          </div>
        </div>
      </div>

      {/* Max Layover Duration Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: '12px' }}>{t.maxLayover}</label>
        <div style={{ paddingLeft: '6px', paddingRight: '6px' }}>
          <input
            type="range"
            min={30}
            max={720}
            step={30}
            value={localFilters.maxLayoverDuration}
            onChange={(e) => handleLayoverChange(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-secondary-200 to-secondary-500 rounded-lg appearance-none cursor-pointer slider-thumb-secondary"
          />
          <div className="flex items-center justify-between" style={{ marginTop: '4px' }}>
            <span className="text-gray-500" style={{ fontSize: '11px' }}>30m</span>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200" style={{ padding: '4px' }}>
              <span className="font-bold text-secondary-600" style={{ fontSize: '12px' }}>
                {Math.floor(localFilters.maxLayoverDuration / 60)}h {localFilters.maxLayoverDuration % 60}m
              </span>
            </div>
            <span className="text-gray-500" style={{ fontSize: '11px' }}>12h</span>
          </div>
        </div>
      </div>

      {/* CO2 Emissions Slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label className="block font-semibold text-gray-900" style={{ fontSize: '12px' }}>{t.co2Emissions}</label>
        <div style={{ paddingLeft: '6px', paddingRight: '6px' }}>
          <input
            type="range"
            min={0}
            max={500}
            step={10}
            value={localFilters.maxCO2Emissions}
            onChange={(e) => handleCO2Change(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-green-200 to-green-500 rounded-lg appearance-none cursor-pointer slider-thumb-green"
          />
          <div className="flex items-center justify-between" style={{ marginTop: '4px' }}>
            <span className="text-gray-500" style={{ fontSize: '11px' }}>0kg</span>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-green-200" style={{ padding: '4px' }}>
              <span className="font-bold text-green-600 flex items-center gap-1" style={{ fontSize: '12px' }}>
                <span style={{ fontSize: '14px' }}>🍃</span>
                {localFilters.maxCO2Emissions}kg
              </span>
            </div>
            <span className="text-gray-500" style={{ fontSize: '11px' }}>500kg</span>
          </div>
        </div>
      </div>

      {/* Connection Quality Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="flex items-center justify-between">
          <label className="block font-semibold text-gray-900" style={{ fontSize: '12px' }}>{t.connectionQuality}</label>
          {localFilters.connectionQuality.length > 0 && (
            <button
              onClick={handleClearConnectionQuality}
              className="text-gray-500 hover:text-gray-700 font-medium"
              style={{ fontSize: '11px' }}
            >
              Clear
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
              style={{ padding: '6px' }}
            >
              <div className="flex items-center" style={{ gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={localFilters.connectionQuality.includes(value)}
                  onChange={() => handleConnectionQualityToggle(value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-1 cursor-pointer"
                />
                <span style={{ fontSize: '14px' }}>{icon}</span>
                <span className="font-medium text-gray-900" style={{ fontSize: '12px' }}>{label}</span>
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
        <div className="sticky top-20 bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/50" style={{ padding: '12px' }}>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Toggle Button - positioned above bottom navigation */}
      <div
        className="lg:hidden fixed right-4 z-[60]"
        style={{ bottom: 'calc(var(--bottom-nav-total, 56px) + 16px)' }}
      >
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-2xl hover:shadow-primary transition-all duration-300 active:scale-95 flex items-center min-h-[56px] min-w-[56px] justify-center"
          style={{ padding: spacing.md, gap: '4px' }}
          aria-label={isMobileOpen ? 'Close filters' : 'Open filters'}
          aria-expanded={isMobileOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 bg-secondary-500 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse shadow-md" style={{ fontSize: '12px' }}>
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
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] animate-fadeIn"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <div
            className="lg:hidden fixed inset-x-0 bottom-0 z-[80] bg-white/98 backdrop-blur-xl rounded-t-3xl shadow-2xl overflow-hidden animate-slideUp"
            style={{ maxHeight: '85vh' }}
            role="dialog"
            aria-modal="true"
            aria-label="Flight Filters"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2 border-b border-gray-200">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" aria-hidden="true" />
            </div>

            {/* Content - Scrollable */}
            <div
              className="overflow-y-auto scrollbar-hide overscroll-contain"
              style={{
                maxHeight: 'calc(85vh - 140px)',
                padding: dimensions.card.padding,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <FilterContent />
            </div>

            {/* Apply Button - Fixed at bottom with safe area padding */}
            <div
              className="sticky bottom-0 bg-white border-t border-gray-200"
              style={{
                padding: dimensions.card.padding,
                paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 16px)',
              }}
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300 min-h-[48px]"
                style={{ padding: spacing.md, fontSize: '14px' }}
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
