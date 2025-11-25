'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CO2Badge from './CO2Badge';
import { ScarcityIndicator } from '../conversion/ScarcityIndicator';

// ===========================
// TYPE DEFINITIONS
// ===========================

export type BadgeType = 'BEST_VALUE' | 'CHEAPEST' | 'FASTEST' | 'LIMITED_SEATS' | 'DIRECT';

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
  originalPrice?: string; // For showing savings
}

export interface ValidatingAirline {
  name: string;
  code: string;
  logo?: string;
}

export interface FlightCardProps {
  id: string;
  price: FlightPrice;
  outbound: FlightItinerary;
  inbound?: FlightItinerary;
  validatingAirline: ValidatingAirline;
  numberOfBookableSeats?: number;
  badges?: BadgeType[];
  cabin?: string;
  fareClass?: string;
  onSelectFlight?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onTrackPrice?: (id: string) => void;
  lang?: 'en' | 'pt' | 'es';
  className?: string;
  co2Emissions?: number; // kg of CO2
  averageCO2?: number; // average for comparison
}

// ===========================
// TRANSLATIONS
// ===========================

const translations = {
  en: {
    badges: {
      BEST_VALUE: 'Best Value',
      CHEAPEST: 'Cheapest',
      FASTEST: 'Fastest',
      LIMITED_SEATS: 'Limited Seats',
      DIRECT: 'Direct Flight',
    },
    selectFlight: 'Select Flight',
    viewDetails: 'View Details',
    trackPrice: 'Track Price',
    save: 'Save',
    duration: 'Duration',
    stops: {
      0: 'Direct',
      1: '1 Stop',
      other: 'stops',
    },
    seatsLeft: 'Only {count} seats left!',
    fewSeatsWarning: 'Hurry! Limited availability',
    operated: 'Operated by',
    flightNumber: 'Flight',
  },
  pt: {
    badges: {
      BEST_VALUE: 'Melhor Valor',
      CHEAPEST: 'Mais Barato',
      FASTEST: 'Mais Rápido',
      LIMITED_SEATS: 'Assentos Limitados',
      DIRECT: 'Voo Direto',
    },
    selectFlight: 'Selecionar Voo',
    viewDetails: 'Ver Detalhes',
    trackPrice: 'Rastrear Preço',
    save: 'Economize',
    duration: 'Duração',
    stops: {
      0: 'Direto',
      1: '1 Parada',
      other: 'paradas',
    },
    seatsLeft: 'Apenas {count} assentos restantes!',
    fewSeatsWarning: 'Rápido! Disponibilidade limitada',
    operated: 'Operado por',
    flightNumber: 'Voo',
  },
  es: {
    badges: {
      BEST_VALUE: 'Mejor Valor',
      CHEAPEST: 'Más Barato',
      FASTEST: 'Más Rápido',
      LIMITED_SEATS: 'Asientos Limitados',
      DIRECT: 'Vuelo Directo',
    },
    selectFlight: 'Seleccionar Vuelo',
    viewDetails: 'Ver Detalles',
    trackPrice: 'Rastrear Precio',
    save: 'Ahorra',
    duration: 'Duración',
    stops: {
      0: 'Directo',
      1: '1 Parada',
      other: 'paradas',
    },
    seatsLeft: 'Solo {count} asientos disponibles!',
    fewSeatsWarning: 'Apresúrate! Disponibilidad limitada',
    operated: 'Operado por',
    flightNumber: 'Vuelo',
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;
  const hours = match[1] ? match[1].replace('H', 'h ') : '';
  const minutes = match[2] ? match[2].replace('M', 'm') : '';
  return `${hours}${minutes}`.trim();
};

const calculateSavings = (price: FlightPrice): number | null => {
  if (!price.originalPrice) return null;
  const original = parseFloat(price.originalPrice);
  const current = parseFloat(price.total);
  return original - current;
};

const calculateSavingsPercentage = (price: FlightPrice): number | null => {
  const savings = calculateSavings(price);
  if (!savings || !price.originalPrice) return null;
  const original = parseFloat(price.originalPrice);
  return Math.round((savings / original) * 100);
};

// ===========================
// BADGE COMPONENT
// ===========================

const Badge: React.FC<{
  type: BadgeType;
  lang: 'en' | 'pt' | 'es'
}> = ({ type, lang }) => {
  const t = translations[lang];

  const badgeStyles: Record<BadgeType, string> = {
    BEST_VALUE: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-primary',
    CHEAPEST: 'bg-gradient-to-r from-success to-success/90 text-white shadow-lg',
    FASTEST: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-secondary',
    LIMITED_SEATS: 'bg-gradient-to-r from-error to-error/90 text-white shadow-lg animate-pulse',
    DIRECT: 'bg-gradient-to-r from-info to-info/90 text-white shadow-lg',
  };

  const icons: Record<BadgeType, string> = {
    BEST_VALUE: '⭐',
    CHEAPEST: '💰',
    FASTEST: '⚡',
    LIMITED_SEATS: '🔥',
    DIRECT: '✈️',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${badgeStyles[type]} transform hover:scale-105 transition-transform duration-200`}>
      <span>{icons[type]}</span>
      <span>{t.badges[type]}</span>
    </div>
  );
};

// ===========================
// STOPS VISUALIZATION COMPONENT
// ===========================

const StopsVisualization: React.FC<{
  segments: FlightSegment[];
  duration: string;
  lang: 'en' | 'pt' | 'es';
}> = ({ segments, duration, lang }) => {
  const t = translations[lang];
  const stops = segments.length - 1;

  const getStopsText = () => {
    if (stops === 0) return t.stops[0];
    if (stops === 1) return t.stops[1];
    return `${stops} ${t.stops.other}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="text-xs text-gray-500 font-medium mb-2">
        {formatDuration(duration)}
      </div>

      {/* Visual Timeline */}
      <div className="w-full relative flex items-center">
        <div className="flex-1 h-0.5 bg-gradient-to-r from-primary-300 via-primary-500 to-primary-300 relative">
          {/* Plane Icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-md">
            <svg
              className="w-5 h-5 text-primary-600 transform rotate-90"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </div>

          {/* Stop Indicators */}
          {stops > 0 && (
            <div className="absolute top-0 left-0 w-full h-full flex justify-evenly items-center">
              {Array.from({ length: stops }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-2 h-2 bg-warning rounded-full border-2 border-white shadow-sm"
                  title={segments[idx].arrival.iataCode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`text-xs font-semibold mt-2 ${stops === 0 ? 'text-success' : 'text-gray-600'}`}>
        {getStopsText()}
      </div>
    </div>
  );
};

// ===========================
// SEAT AVAILABILITY WARNING
// ===========================

const SeatAvailabilityWarning: React.FC<{
  seats: number;
  lang: 'en' | 'pt' | 'es'
}> = ({ seats, lang }) => {
  const t = translations[lang];

  if (seats >= 4) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-error/10 border border-error/30 rounded-lg animate-pulse">
      <span className="text-lg">🔥</span>
      <span className="text-xs font-bold text-error">
        {t.seatsLeft.replace('{count}', seats.toString())}
      </span>
    </div>
  );
};

// ===========================
// MAIN FLIGHT CARD COMPONENT
// ===========================

export const FlightCard: React.FC<FlightCardProps> = ({
  id,
  price,
  outbound,
  inbound,
  validatingAirline,
  numberOfBookableSeats = 9,
  badges = [],
  cabin = 'ECONOMY',
  fareClass,
  onSelectFlight,
  onViewDetails,
  onTrackPrice,
  lang = 'en',
  className = '',
  co2Emissions,
  averageCO2,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [mockViewers, setMockViewers] = useState(15); // Default value for SSR
  const [mockBookings, setMockBookings] = useState(175); // Default value for SSR
  const router = useRouter();
  const t = translations[lang];

  const firstSegment = outbound.segments[0];
  const lastSegment = outbound.segments[outbound.segments.length - 1];
  const savings = calculateSavings(price);
  const savingsPercentage = calculateSavingsPercentage(price);

  // Generate mock social proof data on client-side only (prevents hydration mismatch)
  useEffect(() => {
    setMockViewers(Math.floor(Math.random() * 20) + 8); // 8-27 viewers
    setMockBookings(Math.floor(Math.random() * 150) + 100); // 100-250 bookings
  }, []);

  const handleSelectFlight = () => {
    if (onSelectFlight) {
      onSelectFlight(id);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(id);
    }
    setShowDetails(!showDetails);
  };

  const handleTrackPrice = () => {
    if (onTrackPrice) {
      onTrackPrice(id);
    }
  };

  // Prefetch booking page on hover for better performance
  const handleMouseEnter = () => {
    setIsHovered(true);
    // Prefetch the booking page
    router.prefetch(`/booking/${id}`);
  };

  return (
    <div
      className={`
        group relative
        bg-white/90 backdrop-blur-md
        rounded-2xl
        border-2 border-gray-200/50
        shadow-lg hover:shadow-2xl
        transition-all duration-300 ease-out
        overflow-hidden
        ${isHovered ? 'border-primary-400 scale-[1.02]' : ''}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glass Morphism Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-primary-50/20 pointer-events-none" />

      {/* Content Container - MOBILE-OPTIMIZED: Tight spacing */}
      <div className="relative p-2 md:p-6">

        {/* Header: Badges & Airline - COMPACT on mobile */}
        <div className="flex items-start justify-between mb-2 md:mb-4 flex-wrap gap-1.5 md:gap-2">
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <Badge key={idx} type={badge} lang={lang} />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {validatingAirline.logo && (
              <img
                src={validatingAirline.logo}
                alt={validatingAirline.name}
                className="h-8 w-8 object-contain"
              />
            )}
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">
                {validatingAirline.name}
              </div>
              <div className="text-xs text-gray-500">
                {t.flightNumber} {firstSegment.carrierCode}{firstSegment.number}
              </div>
            </div>
          </div>
        </div>

        {/* Main Flight Information - MOBILE-OPTIMIZED: Smaller fonts, tighter spacing */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 md:gap-6 mb-2 md:mb-4">

          {/* Departure Info - COMPACT mobile fonts */}
          <div className="text-center lg:text-left">
            <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-0.5 md:mb-1 font-display">
              {formatTime(firstSegment.departure.at)}
            </div>
            <div className="text-base md:text-lg font-semibold text-gray-700">
              {firstSegment.departure.iataCode}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500">
              {formatDate(firstSegment.departure.at)}
            </div>
            {firstSegment.departure.terminal && (
              <div className="text-xs text-gray-400 mt-1">
                Terminal {firstSegment.departure.terminal}
              </div>
            )}
          </div>

          {/* Flight Path Visualization */}
          <StopsVisualization
            segments={outbound.segments}
            duration={outbound.duration}
            lang={lang}
          />

          {/* Arrival Info - COMPACT mobile fonts */}
          <div className="text-center lg:text-right">
            <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-0.5 md:mb-1 font-display">
              {formatTime(lastSegment.arrival.at)}
            </div>
            <div className="text-base md:text-lg font-semibold text-gray-700">
              {lastSegment.arrival.iataCode}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500">
              {formatDate(lastSegment.arrival.at)}
            </div>
            {lastSegment.arrival.terminal && (
              <div className="text-xs text-gray-400 mt-1">
                Terminal {lastSegment.arrival.terminal}
              </div>
            )}
          </div>

        </div>

        {/* Additional Info Row - MOBILE: Horizontal scroll for space efficiency */}
        <div className="flex overflow-x-auto items-center gap-1.5 md:gap-2 mb-2 md:mb-4 pb-1 scrollbar-hide">
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {cabin}
          </span>

          {fareClass && (
            <span className="inline-flex items-center bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
              {fareClass}
            </span>
          )}

          {/* CO2 Badge - Compact Mode */}
          {co2Emissions && (
            <CO2Badge
              emissions={co2Emissions}
              averageEmissions={averageCO2}
              compact={true}
            />
          )}

          {/* Social Proof: Viewers */}
          <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold border border-orange-200">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            {mockViewers} viewing
          </span>

          {/* Social Proof: Bookings */}
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            {mockBookings} booked today
          </span>

          {outbound.segments.length > 1 && outbound.segments[0].operatingCarrierCode &&
           outbound.segments[0].operatingCarrierCode !== outbound.segments[0].carrierCode && (
            <span className="text-xs text-gray-500">
              {t.operated} {outbound.segments[0].operatingCarrierCode}
            </span>
          )}
        </div>

        {/* Scarcity Indicators - COMPACT */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2 md:mb-4">
          {/* Seat Scarcity - Show for seats < 5 */}
          {numberOfBookableSeats < 5 && (
            <ScarcityIndicator
              type="seats"
              count={numberOfBookableSeats}
              variant={numberOfBookableSeats <= 2 ? 'urgent' : 'default'}
            />
          )}
        </div>

        {/* Price & Actions Section - MOBILE-OPTIMIZED: Compact, clear hierarchy */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-4 pt-2 md:pt-4 border-t border-gray-200">

          {/* Price Information - MOBILE: Smaller, efficient */}
          <div className="text-center sm:text-left w-full sm:w-auto">
            {savings && savingsPercentage && (
              <div className="mb-1 md:mb-2">
                <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-0.5 md:px-3 md:py-1 rounded-md text-[10px] md:text-sm font-bold">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  <span>
                    {t.save} {price.currency} {savings.toFixed(2)} ({savingsPercentage}%)
                  </span>
                </div>
                <div className="text-[10px] md:text-sm text-gray-400 line-through mt-0.5">
                  {price.currency} {price.originalPrice}
                </div>
              </div>
            )}

            {/* MOBILE: Much smaller price (3xl = 30px vs 5xl = 48px) */}
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="text-3xl md:text-5xl font-bold text-primary-600 font-display">
                {price.currency === 'USD' ? '$' : price.currency}{parseFloat(price.total).toFixed(0)}
              </span>
              <span className="text-sm md:text-base text-gray-500">.{(parseFloat(price.total) % 1).toFixed(2).split('.')[1]}</span>
            </div>

            {/* DOT Consumer Protection: Always show total price includes taxes/fees */}
            <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">
              Total incl. all taxes & fees
            </div>
          </div>

          {/* Action Buttons - MOBILE: Compact, side-by-side for space */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-1.5 md:gap-2 w-full">
              <button
                onClick={handleSelectFlight}
                className="
                  flex-1
                  bg-gradient-to-r from-primary-600 to-primary-500
                  hover:from-primary-700 hover:to-primary-600
                  active:scale-95
                  text-white font-bold text-sm md:text-base
                  py-2.5 md:py-4 px-4 md:px-6
                  rounded-lg md:rounded-xl
                  shadow-md md:shadow-lg hover:shadow-primary
                  transition-all duration-200
                  flex items-center justify-center gap-1.5 md:gap-2
                  group
                "
              >
                <span className="hidden sm:inline">{t.selectFlight}</span>
                <span className="sm:hidden">Select</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <button
                onClick={handleViewDetails}
                className="
                  flex-none
                  bg-white hover:bg-gray-50
                  active:scale-95
                  text-primary-600 hover:text-primary-700
                  font-semibold text-sm md:text-base
                  py-2.5 md:py-3 px-3 md:px-6
                  rounded-lg md:rounded-xl
                  border border-primary-200 md:border-2 hover:border-primary-300
                  transition-all duration-200
                  flex items-center justify-center gap-1 md:gap-2
                "
              >
                <span className="hidden sm:inline">{t.viewDetails}</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Track Price Button - Full Width */}
            {onTrackPrice && (
              <button
                onClick={handleTrackPrice}
                className="
                  w-full
                  bg-gradient-to-r from-orange-500 to-orange-600
                  hover:from-orange-600 hover:to-orange-700
                  active:scale-95
                  text-white font-semibold text-sm md:text-base
                  py-2 md:py-3 px-4 md:px-6
                  rounded-lg md:rounded-xl
                  border-2 border-orange-400
                  transition-all duration-200
                  flex items-center justify-center gap-2
                  group
                  shadow-md hover:shadow-lg
                "
              >
                <svg
                  className="w-4 h-4 group-hover:animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>{t.trackPrice}</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Segments View (Expandable) */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t-2 border-gray-100 animate-slideDown">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Flight Details</h4>
            <div className="space-y-3">
              {outbound.segments.map((segment, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-lg p-3 md:p-4 text-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">
                      {segment.carrierCode} {segment.number}
                    </span>
                    <span className="text-gray-500">
                      {formatDuration(segment.duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div>
                      <div className="font-medium">{formatTime(segment.departure.at)}</div>
                      <div className="text-xs">{segment.departure.iataCode}</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="font-medium">{formatTime(segment.arrival.at)}</div>
                      <div className="text-xs">{segment.arrival.iataCode}</div>
                    </div>
                  </div>
                  {segment.aircraft && (
                    <div className="mt-2 text-xs text-gray-500">
                      Aircraft: {segment.aircraft.code}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Hover Effect Border Glow */}
      <div
        className={`
          absolute inset-0 rounded-2xl pointer-events-none
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0, 135, 255, 0.1), transparent)',
          boxShadow: '0 0 30px rgba(0, 135, 255, 0.3)',
        }}
      />
    </div>
  );
};

export default FlightCard;
