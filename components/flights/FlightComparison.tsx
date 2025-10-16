'use client';

import React, { useState } from 'react';
import {
  Star,
  Clock,
  Plane,
  CheckCircle2,
  XCircle,
  Share2,
  TrendingUp,
  Zap,
  Wifi,
  Coffee,
  Briefcase,
  Shield,
  Award,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Trophy,
  ThumbsUp
} from 'lucide-react';
import { getAirlineData, getAllianceBadgeColor, getRatingColor } from '@/lib/flights/airline-data';

// ===========================
// TYPE DEFINITIONS
// ===========================

export interface FlightSegment {
  departure: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  arrival: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  carrierCode: string;
  number: string;
  aircraft?: {
    code: string;
  };
  duration: string;
  operatingCarrierCode?: string;
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
  stops?: number;
}

export interface FlightPrice {
  total: string;
  currency: string;
  base?: string;
  fees?: string;
  originalPrice?: string;
}

export interface ValidatingAirline {
  name: string;
  code: string;
  logo?: string;
}

export interface FlightForComparison {
  id: string;
  price: FlightPrice;
  outbound: FlightItinerary;
  inbound?: FlightItinerary;
  validatingAirline: ValidatingAirline;
  numberOfBookableSeats?: number;
  cabin?: string;
  fareClass?: string;
  // Enhanced properties
  score?: number; // FlightIQ score
  badges?: Array<{
    type: string;
    text: string;
    color: string;
  }>;
  amenities?: {
    wifi?: boolean;
    power?: boolean;
    meals?: boolean;
    entertainment?: boolean;
    extraLegroom?: boolean;
  };
  baggage?: {
    carry: number;
    checked: number;
  };
  flexibility?: {
    changeable?: boolean;
    refundable?: boolean;
    changeFee?: number;
  };
}

export interface FlightComparisonProps {
  flights: FlightForComparison[];
  onSelect?: (flightId: string) => void;
  lang?: 'en' | 'pt' | 'es';
  className?: string;
}

// ===========================
// TRANSLATIONS
// ===========================

const translations = {
  en: {
    title: 'Compare Flights',
    selectFlight: 'Select This Flight',
    share: 'Share Comparison',
    copied: 'Link copied!',
    bestForYou: 'Best for You',
    winner: 'Top Choice',
    price: 'Price',
    duration: 'Duration',
    stops: 'Stops',
    airline: 'Airline',
    departure: 'Departure',
    arrival: 'Arrival',
    amenities: 'Amenities',
    baggage: 'Baggage',
    flexibility: 'Flexibility',
    flightIQ: 'FlightIQ Score',
    pros: 'Pros',
    cons: 'Cons',
    rating: 'Rating',
    onTime: 'On-Time',
    direct: 'Direct',
    stop: 'stop',
    stops_plural: 'stops',
    included: 'Included',
    notIncluded: 'Not Included',
    carryOn: 'Carry-on',
    checkedBag: 'Checked bag',
    changeable: 'Changeable',
    refundable: 'Refundable',
    changeFee: 'Change fee',
    cheapest: 'Cheapest',
    fastest: 'Fastest',
    bestValue: 'Best Value',
    showDetails: 'Show Details',
    hideDetails: 'Hide Details',
  },
  pt: {
    title: 'Comparar Voos',
    selectFlight: 'Selecionar Este Voo',
    share: 'Compartilhar Comparação',
    copied: 'Link copiado!',
    bestForYou: 'Melhor para Você',
    winner: 'Melhor Escolha',
    price: 'Preço',
    duration: 'Duração',
    stops: 'Paradas',
    airline: 'Companhia Aérea',
    departure: 'Partida',
    arrival: 'Chegada',
    amenities: 'Comodidades',
    baggage: 'Bagagem',
    flexibility: 'Flexibilidade',
    flightIQ: 'Pontuação FlightIQ',
    pros: 'Vantagens',
    cons: 'Desvantagens',
    rating: 'Avaliação',
    onTime: 'Pontualidade',
    direct: 'Direto',
    stop: 'parada',
    stops_plural: 'paradas',
    included: 'Incluído',
    notIncluded: 'Não Incluído',
    carryOn: 'Bagagem de mão',
    checkedBag: 'Bagagem despachada',
    changeable: 'Alterável',
    refundable: 'Reembolsável',
    changeFee: 'Taxa de alteração',
    cheapest: 'Mais Barato',
    fastest: 'Mais Rápido',
    bestValue: 'Melhor Custo-Benefício',
    showDetails: 'Mostrar Detalhes',
    hideDetails: 'Ocultar Detalhes',
  },
  es: {
    title: 'Comparar Vuelos',
    selectFlight: 'Seleccionar Este Vuelo',
    share: 'Compartir Comparación',
    copied: '¡Enlace copiado!',
    bestForYou: 'Mejor para Ti',
    winner: 'Mejor Opción',
    price: 'Precio',
    duration: 'Duración',
    stops: 'Paradas',
    airline: 'Aerolínea',
    departure: 'Salida',
    arrival: 'Llegada',
    amenities: 'Comodidades',
    baggage: 'Equipaje',
    flexibility: 'Flexibilidad',
    flightIQ: 'Puntuación FlightIQ',
    pros: 'Ventajas',
    cons: 'Desventajas',
    rating: 'Calificación',
    onTime: 'Puntualidad',
    direct: 'Directo',
    stop: 'parada',
    stops_plural: 'paradas',
    included: 'Incluido',
    notIncluded: 'No Incluido',
    carryOn: 'Equipaje de mano',
    checkedBag: 'Equipaje facturado',
    changeable: 'Modificable',
    refundable: 'Reembolsable',
    changeFee: 'Tarifa de cambio',
    cheapest: 'Más Barato',
    fastest: 'Más Rápido',
    bestValue: 'Mejor Valor',
    showDetails: 'Mostrar Detalles',
    hideDetails: 'Ocultar Detalles',
  },
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;
  const hours = match[1] ? match[1].replace('H', 'h ') : '';
  const minutes = match[2] ? match[2].replace('M', 'm') : '';
  return `${hours}${minutes}`.trim();
};

const parseDurationToMinutes = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return 0;
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  return hours * 60 + minutes;
};

// ===========================
// COMPARISON LOGIC
// ===========================

interface ComparisonMetrics {
  cheapestIndex: number;
  fastestIndex: number;
  highestScoreIndex: number;
  bestValueIndex: number;
  prices: number[];
  durations: number[];
  scores: number[];
}

const calculateMetrics = (flights: FlightForComparison[]): ComparisonMetrics => {
  const prices = flights.map(f => parseFloat(f.price.total));
  const durations = flights.map(f => parseDurationToMinutes(f.outbound.duration));
  const scores = flights.map(f => f.score || 0);

  const cheapestIndex = prices.indexOf(Math.min(...prices));
  const fastestIndex = durations.indexOf(Math.min(...durations));
  const highestScoreIndex = scores.indexOf(Math.max(...scores));

  // Best value = combination of price and score
  const valueScores = flights.map((f, i) => {
    const priceNorm = 1 - (prices[i] - Math.min(...prices)) / (Math.max(...prices) - Math.min(...prices) || 1);
    const scoreNorm = (scores[i] || 50) / 100;
    return priceNorm * 0.6 + scoreNorm * 0.4;
  });
  const bestValueIndex = valueScores.indexOf(Math.max(...valueScores));

  return {
    cheapestIndex,
    fastestIndex,
    highestScoreIndex,
    bestValueIndex,
    prices,
    durations,
    scores,
  };
};

// ===========================
// PROS & CONS GENERATOR
// ===========================

const generateProsAndCons = (
  flight: FlightForComparison,
  metrics: ComparisonMetrics,
  index: number,
  lang: 'en' | 'pt' | 'es'
) => {
  const t = translations[lang];
  const pros: string[] = [];
  const cons: string[] = [];

  const airlineData = getAirlineData(flight.validatingAirline.code);
  const stops = flight.outbound.segments.length - 1;
  const price = parseFloat(flight.price.total);

  // Pros
  if (index === metrics.cheapestIndex) {
    pros.push(`💰 ${t.cheapest} - $${price.toFixed(0)}`);
  }
  if (index === metrics.fastestIndex) {
    pros.push(`⚡ ${t.fastest} - ${formatDuration(flight.outbound.duration)}`);
  }
  if (stops === 0) {
    pros.push(`✈️ ${t.direct} flight`);
  }
  if (airlineData.rating >= 4.5) {
    pros.push(`⭐ Excellent airline (${airlineData.rating}/5)`);
  }
  if (airlineData.onTimePerformance >= 85) {
    pros.push(`🎯 ${airlineData.onTimePerformance}% on-time performance`);
  }
  if (flight.amenities?.wifi) {
    pros.push('📶 WiFi available');
  }
  if (flight.baggage?.checked && flight.baggage.checked > 0) {
    pros.push(`🧳 ${flight.baggage.checked} checked bag${flight.baggage.checked > 1 ? 's' : ''} included`);
  }
  if (flight.flexibility?.refundable) {
    pros.push('💳 Fully refundable');
  }
  if (flight.score && flight.score >= 85) {
    pros.push(`🏆 High FlightIQ score (${flight.score})`);
  }

  // Cons
  if (price > Math.min(...metrics.prices) * 1.2) {
    const diff = price - Math.min(...metrics.prices);
    cons.push(`💸 $${diff.toFixed(0)} more expensive`);
  }
  if (parseDurationToMinutes(flight.outbound.duration) > Math.min(...metrics.durations) * 1.15) {
    const diff = parseDurationToMinutes(flight.outbound.duration) - Math.min(...metrics.durations);
    cons.push(`⏱️ ${Math.round(diff / 60)}h ${diff % 60}m longer`);
  }
  if (stops > 0) {
    cons.push(`🔄 ${stops} ${stops === 1 ? t.stop : t.stops_plural}`);
  }
  if (airlineData.rating < 4.0) {
    cons.push(`📉 Lower airline rating (${airlineData.rating}/5)`);
  }
  if (!flight.amenities?.wifi) {
    cons.push('📵 No WiFi');
  }
  if (!flight.baggage?.checked || flight.baggage.checked === 0) {
    cons.push('❌ No checked bags included');
  }
  if (!flight.flexibility?.refundable && !flight.flexibility?.changeable) {
    cons.push('🚫 Non-refundable/changeable');
  }
  if (flight.numberOfBookableSeats && flight.numberOfBookableSeats <= 3) {
    cons.push(`⚠️ Only ${flight.numberOfBookableSeats} seats left`);
  }

  return { pros: pros.slice(0, 5), cons: cons.slice(0, 4) };
};

// ===========================
// MAIN COMPONENT
// ===========================

export const FlightComparison: React.FC<FlightComparisonProps> = ({
  flights,
  onSelect,
  lang = 'en',
  className = '',
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const t = translations[lang];

  if (flights.length < 2 || flights.length > 4) {
    return (
      <div className="p-8 text-center bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
        <p className="text-lg font-semibold text-yellow-900">
          Please select 2-4 flights to compare
        </p>
      </div>
    );
  }

  const metrics = calculateMetrics(flights);
  const recommendedIndex = metrics.bestValueIndex;

  const handleShare = async () => {
    const flightIds = flights.map(f => f.id).join(',');
    const shareUrl = `${window.location.origin}${window.location.pathname}?compare=${flightIds}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const getDifferenceClass = (value: number, allValues: number[], lowerIsBetter: boolean = true) => {
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);

    if (min === max) return '';

    const isBest = lowerIsBetter ? value === min : value === max;
    const isWorst = lowerIsBetter ? value === max : value === min;

    if (isBest) return 'bg-green-100 border-green-300';
    if (isWorst) return 'bg-red-50 border-red-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h2>
          <p className="text-gray-600">Side-by-side comparison to help you decide</p>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Share2 className="w-5 h-5" />
          {copiedLink ? t.copied : t.share}
        </button>
      </div>

      {/* Desktop: Side-by-side Table */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-full bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden">

          {/* Table Header Row */}
          <div className={`grid grid-cols-${flights.length + 1} border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100`}>
            <div className="p-4 font-bold text-gray-700 border-r-2 border-gray-200">
              Compare
            </div>
            {flights.map((flight, idx) => {
              const airlineData = getAirlineData(flight.validatingAirline.code);
              const isRecommended = idx === recommendedIndex;

              return (
                <div
                  key={flight.id}
                  className={`p-4 text-center relative ${
                    idx < flights.length - 1 ? 'border-r-2 border-gray-200' : ''
                  } ${isRecommended ? 'bg-gradient-to-b from-primary-50 to-transparent' : ''}`}
                >
                  {isRecommended && (
                    <div className="absolute top-0 left-0 right-0">
                      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-1 text-sm font-bold flex items-center justify-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {t.bestForYou}
                      </div>
                    </div>
                  )}
                  <div className={`${isRecommended ? 'mt-8' : ''}`}>
                    <div
                      className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-3xl shadow-lg mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${airlineData.primaryColor}, ${airlineData.secondaryColor})`,
                      }}
                    >
                      {airlineData.logo}
                    </div>
                    <div className="font-bold text-gray-900">{airlineData.name}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FlightIQ Score Row */}
          <div className={`grid grid-cols-${flights.length + 1} border-b border-gray-200 hover:bg-gray-50 transition-colors`}>
            <div className="p-4 font-semibold text-gray-700 border-r-2 border-gray-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-600" />
              {t.flightIQ}
            </div>
            {flights.map((flight, idx) => (
              <div
                key={flight.id}
                className={`p-4 text-center border-r border-gray-200 ${
                  getDifferenceClass(flight.score || 0, metrics.scores, false)
                }`}
              >
                <div className={`text-3xl font-bold ${
                  (flight.score || 0) >= 90 ? 'text-green-600' :
                  (flight.score || 0) >= 80 ? 'text-blue-600' :
                  (flight.score || 0) >= 70 ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {flight.score || 'N/A'}
                </div>
                {flight.score && flight.score >= 85 && (
                  <div className="text-xs text-green-700 font-semibold mt-1">Excellent</div>
                )}
              </div>
            ))}
          </div>

          {/* Price Row */}
          <div className={`grid grid-cols-${flights.length + 1} border-b border-gray-200 hover:bg-gray-50 transition-colors`}>
            <div className="p-4 font-semibold text-gray-700 border-r-2 border-gray-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              {t.price}
            </div>
            {flights.map((flight, idx) => {
              const price = parseFloat(flight.price.total);
              const isCheapest = idx === metrics.cheapestIndex;

              return (
                <div
                  key={flight.id}
                  className={`p-4 text-center border-r border-gray-200 ${
                    getDifferenceClass(price, metrics.prices, true)
                  }`}
                >
                  <div className="text-3xl font-bold text-gray-900">
                    ${price.toFixed(0)}
                  </div>
                  {isCheapest && (
                    <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      {t.cheapest}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Duration Row */}
          <div className={`grid grid-cols-${flights.length + 1} border-b border-gray-200 hover:bg-gray-50 transition-colors`}>
            <div className="p-4 font-semibold text-gray-700 border-r-2 border-gray-200 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {t.duration}
            </div>
            {flights.map((flight, idx) => {
              const duration = parseDurationToMinutes(flight.outbound.duration);
              const isFastest = idx === metrics.fastestIndex;

              return (
                <div
                  key={flight.id}
                  className={`p-4 text-center border-r border-gray-200 ${
                    getDifferenceClass(duration, metrics.durations, true)
                  }`}
                >
                  <div className="text-xl font-bold text-gray-900">
                    {formatDuration(flight.outbound.duration)}
                  </div>
                  {isFastest && (
                    <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                      <Zap className="w-3 h-3" />
                      {t.fastest}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stops Row */}
          <div className={`grid grid-cols-${flights.length + 1} border-b border-gray-200 hover:bg-gray-50 transition-colors`}>
            <div className="p-4 font-semibold text-gray-700 border-r-2 border-gray-200 flex items-center gap-2">
              <Plane className="w-5 h-5 text-purple-600" />
              {t.stops}
            </div>
            {flights.map((flight) => {
              const stops = flight.outbound.segments.length - 1;

              return (
                <div
                  key={flight.id}
                  className="p-4 text-center border-r border-gray-200"
                >
                  <div className={`text-lg font-bold ${stops === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {stops === 0 ? t.direct : `${stops} ${stops === 1 ? t.stop : t.stops_plural}`}
                  </div>
                  {stops === 0 && (
                    <div className="text-xs text-green-700 font-semibold mt-1">Fastest routing</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Departure Time Row */}
          <div className={`grid grid-cols-${flights.length + 1} border-b border-gray-200 hover:bg-gray-50 transition-colors`}>
            <div className="p-4 font-semibold text-gray-700 border-r-2 border-gray-200">
              {t.departure}
            </div>
            {flights.map((flight) => (
              <div key={flight.id} className="p-4 text-center border-r border-gray-200">
                <div className="text-xl font-bold text-gray-900">
                  {formatTime(flight.outbound.segments[0].departure.at)}
                </div>
                <div className="text-sm text-gray-600">
                  {flight.outbound.segments[0].departure.iataCode}
                </div>
              </div>
            ))}
          </div>

          {/* Arrival Time Row */}
          <div className={`grid grid-cols-${flights.length + 1} border-b border-gray-200 hover:bg-gray-50 transition-colors`}>
            <div className="p-4 font-semibold text-gray-700 border-r-2 border-gray-200">
              {t.arrival}
            </div>
            {flights.map((flight) => {
              const lastSegment = flight.outbound.segments[flight.outbound.segments.length - 1];
              return (
                <div key={flight.id} className="p-4 text-center border-r border-gray-200">
                  <div className="text-xl font-bold text-gray-900">
                    {formatTime(lastSegment.arrival.at)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {lastSegment.arrival.iataCode}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Airline Rating Row */}
          <div className={`grid grid-cols-${flights.length + 1} border-b border-gray-200 hover:bg-gray-50 transition-colors`}>
            <div className="p-4 font-semibold text-gray-700 border-r-2 border-gray-200 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {t.rating}
            </div>
            {flights.map((flight) => {
              const airlineData = getAirlineData(flight.validatingAirline.code);

              return (
                <div key={flight.id} className="p-4 text-center border-r border-gray-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className={`w-5 h-5 fill-current ${getRatingColor(airlineData.rating)}`} />
                    <span className="text-lg font-bold text-gray-900">{airlineData.rating}</span>
                  </div>
                  <div className="text-xs text-gray-600">{t.onTime}: {airlineData.onTimePerformance}%</div>
                </div>
              );
            })}
          </div>

          {/* Amenities Row */}
          <div className={`grid grid-cols-${flights.length + 1} border-b border-gray-200 hover:bg-gray-50 transition-colors`}>
            <div className="p-4 font-semibold text-gray-700 border-r-2 border-gray-200 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-orange-600" />
              {t.amenities}
            </div>
            {flights.map((flight) => (
              <div key={flight.id} className="p-4 border-r border-gray-200">
                <div className="flex flex-wrap gap-2 justify-center">
                  {flight.amenities?.wifi && (
                    <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <Wifi className="w-3 h-3" />
                      WiFi
                    </div>
                  )}
                  {flight.amenities?.power && (
                    <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <Zap className="w-3 h-3" />
                      Power
                    </div>
                  )}
                  {flight.amenities?.meals && (
                    <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      <Coffee className="w-3 h-3" />
                      Meals
                    </div>
                  )}
                  {(!flight.amenities || Object.values(flight.amenities).every(v => !v)) && (
                    <div className="text-xs text-gray-400">Basic service</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Baggage Row */}
          <div className={`grid grid-cols-${flights.length + 1} border-b border-gray-200 hover:bg-gray-50 transition-colors`}>
            <div className="p-4 font-semibold text-gray-700 border-r-2 border-gray-200 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              {t.baggage}
            </div>
            {flights.map((flight) => (
              <div key={flight.id} className="p-4 text-center border-r border-gray-200">
                <div className="space-y-1">
                  <div className="text-sm">
                    {flight.baggage?.carry ? (
                      <span className="text-green-600 font-semibold">✓ {flight.baggage.carry} {t.carryOn}</span>
                    ) : (
                      <span className="text-red-500">✗ No carry-on</span>
                    )}
                  </div>
                  <div className="text-sm">
                    {flight.baggage?.checked ? (
                      <span className="text-green-600 font-semibold">✓ {flight.baggage.checked} {t.checkedBag}</span>
                    ) : (
                      <span className="text-red-500">✗ No checked bag</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flexibility Row */}
          <div className={`grid grid-cols-${flights.length + 1} border-b-2 border-gray-200 hover:bg-gray-50 transition-colors`}>
            <div className="p-4 font-semibold text-gray-700 border-r-2 border-gray-200 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              {t.flexibility}
            </div>
            {flights.map((flight) => (
              <div key={flight.id} className="p-4 text-center border-r border-gray-200">
                <div className="space-y-1">
                  {flight.flexibility?.refundable ? (
                    <div className="text-sm text-green-600 font-semibold">✓ {t.refundable}</div>
                  ) : flight.flexibility?.changeable ? (
                    <div className="text-sm text-yellow-600 font-semibold">~ {t.changeable}</div>
                  ) : (
                    <div className="text-sm text-red-500">✗ Non-refundable</div>
                  )}
                  {flight.flexibility?.changeFee && (
                    <div className="text-xs text-gray-600">{t.changeFee}: ${flight.flexibility.changeFee}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pros & Cons Row (Collapsible) */}
          <div className="bg-gray-50">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-4 flex items-center justify-center gap-2 font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-5 h-5" />
                  {t.hideDetails}
                </>
              ) : (
                <>
                  <ChevronDown className="w-5 h-5" />
                  {t.showDetails}
                </>
              )}
            </button>

            {showDetails && (
              <>
                {/* Pros Row */}
                <div className={`grid grid-cols-${flights.length + 1} border-t border-gray-200`}>
                  <div className="p-4 font-semibold text-green-700 border-r-2 border-gray-200 flex items-center gap-2 bg-green-50">
                    <ThumbsUp className="w-5 h-5" />
                    {t.pros}
                  </div>
                  {flights.map((flight, idx) => {
                    const { pros } = generateProsAndCons(flight, metrics, idx, lang);

                    return (
                      <div key={flight.id} className="p-4 border-r border-gray-200 bg-green-50/50">
                        <ul className="space-y-1.5 text-left">
                          {pros.map((pro, i) => (
                            <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                {/* Cons Row */}
                <div className={`grid grid-cols-${flights.length + 1} border-t border-gray-200`}>
                  <div className="p-4 font-semibold text-red-700 border-r-2 border-gray-200 flex items-center gap-2 bg-red-50">
                    <XCircle className="w-5 h-5" />
                    {t.cons}
                  </div>
                  {flights.map((flight, idx) => {
                    const { cons } = generateProsAndCons(flight, metrics, idx, lang);

                    return (
                      <div key={flight.id} className="p-4 border-r border-gray-200 bg-red-50/50">
                        <ul className="space-y-1.5 text-left">
                          {cons.length > 0 ? (
                            cons.map((con, i) => (
                              <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{con}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-gray-500 italic">No major drawbacks</li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className={`grid grid-cols-${flights.length + 1} bg-gray-100`}>
            <div className="p-4 border-r-2 border-gray-200"></div>
            {flights.map((flight, idx) => (
              <div key={flight.id} className="p-4 border-r border-gray-200">
                <button
                  onClick={() => onSelect?.(flight.id)}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 ${
                    idx === recommendedIndex
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                      : 'bg-white text-primary-600 border-2 border-primary-200 hover:border-primary-400'
                  }`}
                >
                  {t.selectFlight}
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Mobile: Stacked Cards */}
      <div className="lg:hidden space-y-6">
        {flights.map((flight, idx) => {
          const airlineData = getAirlineData(flight.validatingAirline.code);
          const isRecommended = idx === recommendedIndex;
          const isCheapest = idx === metrics.cheapestIndex;
          const isFastest = idx === metrics.fastestIndex;
          const { pros, cons } = generateProsAndCons(flight, metrics, idx, lang);
          const stops = flight.outbound.segments.length - 1;
          const price = parseFloat(flight.price.total);

          return (
            <div
              key={flight.id}
              className={`bg-white rounded-2xl shadow-xl border-2 overflow-hidden ${
                isRecommended ? 'border-primary-500 ring-4 ring-primary-100' : 'border-gray-200'
              }`}
            >
              {/* Header */}
              {isRecommended && (
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 text-center font-bold flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {t.winner}
                </div>
              )}

              <div className="p-6">
                {/* Airline */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${airlineData.primaryColor}, ${airlineData.secondaryColor})`,
                    }}
                  >
                    {airlineData.logo}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{airlineData.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className={`w-4 h-4 fill-current ${getRatingColor(airlineData.rating)}`} />
                      <span className="text-sm font-semibold text-gray-700">{airlineData.rating}/5</span>
                    </div>
                  </div>
                  {flight.score && (
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        flight.score >= 90 ? 'text-green-600' :
                        flight.score >= 80 ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>
                        {flight.score}
                      </div>
                      <div className="text-xs text-gray-500">FlightIQ</div>
                    </div>
                  )}
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">${price.toFixed(0)}</div>
                    <div className="text-xs text-gray-600 mt-1">{t.price}</div>
                    {isCheapest && (
                      <div className="text-xs text-green-600 font-bold mt-1">✓ {t.cheapest}</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{formatDuration(flight.outbound.duration)}</div>
                    <div className="text-xs text-gray-600 mt-1">{t.duration}</div>
                    {isFastest && (
                      <div className="text-xs text-blue-600 font-bold mt-1">⚡ {t.fastest}</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${stops === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {stops === 0 ? t.direct : `${stops} ${stops === 1 ? t.stop : t.stops_plural}`}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{t.stops}</div>
                  </div>
                </div>

                {/* Times */}
                <div className="flex justify-between items-center mb-4 p-3 bg-blue-50 rounded-xl">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatTime(flight.outbound.segments[0].departure.at)}
                    </div>
                    <div className="text-sm text-gray-600">{flight.outbound.segments[0].departure.iataCode}</div>
                  </div>
                  <Plane className="w-6 h-6 text-primary-600" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatTime(flight.outbound.segments[flight.outbound.segments.length - 1].arrival.at)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {flight.outbound.segments[flight.outbound.segments.length - 1].arrival.iataCode}
                    </div>
                  </div>
                </div>

                {/* Amenities & Baggage */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {flight.amenities?.wifi && (
                    <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <Wifi className="w-3 h-3" /> WiFi
                    </span>
                  )}
                  {flight.baggage?.checked && (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <Briefcase className="w-3 h-3" /> {flight.baggage.checked} bag
                    </span>
                  )}
                  {flight.flexibility?.refundable && (
                    <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      <Shield className="w-3 h-3" /> Refundable
                    </span>
                  )}
                </div>

                {/* Pros & Cons */}
                {showDetails && (
                  <div className="mb-4 space-y-3">
                    <div className="bg-green-50 p-3 rounded-xl">
                      <div className="font-bold text-green-800 mb-2 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4" />
                        {t.pros}
                      </div>
                      <ul className="space-y-1">
                        {pros.map((pro, i) => (
                          <li key={i} className="text-sm text-green-700">• {pro}</li>
                        ))}
                      </ul>
                    </div>
                    {cons.length > 0 && (
                      <div className="bg-red-50 p-3 rounded-xl">
                        <div className="font-bold text-red-800 mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          {t.cons}
                        </div>
                        <ul className="space-y-1">
                          {cons.map((con, i) => (
                            <li key={i} className="text-sm text-red-700">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Select Button */}
                <button
                  onClick={() => onSelect?.(flight.id)}
                  className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl ${
                    isRecommended
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {t.selectFlight}
                </button>
              </div>
            </div>
          );
        })}

        {/* Toggle Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-5 h-5" />
              {t.hideDetails}
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              {t.showDetails}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FlightComparison;
