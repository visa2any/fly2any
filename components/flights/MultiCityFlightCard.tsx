/**
 * Enhanced Multi-City Flight Card
 *
 * Displays multi-leg journeys with:
 * - Clear visual separation between legs
 * - Per-leg pricing breakdown
 * - Connection indicators
 * - Expandable details
 * - Mobile-optimized layout
 */

'use client';

import { useState } from 'react';
import { FlightOffer } from '@/lib/flights/types';
import { ArrowRight, MapPin, ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react';

interface MultiCityFlightCardProps {
  flight: FlightOffer;
  onSelect: (id: string) => void;
  isNavigating?: boolean;
  lang?: 'en' | 'pt' | 'es';
}

const content = {
  en: {
    multiCity: 'Multi-City Journey',
    leg: 'Leg',
    direct: 'Direct',
    stop: 'stop',
    stops: 'stops',
    total: 'Total Price',
    perLeg: 'Per leg',
    showDetails: 'Show details',
    hideDetails: 'Hide details',
    selectFlight: 'Select Flight',
    selecting: 'Selecting...',
  },
  pt: {
    multiCity: 'Viagem Multi-Cidades',
    leg: 'Trecho',
    direct: 'Direto',
    stop: 'parada',
    stops: 'paradas',
    total: 'Preço Total',
    perLeg: 'Por trecho',
    showDetails: 'Mostrar detalhes',
    hideDetails: 'Ocultar detalhes',
    selectFlight: 'Selecionar Voo',
    selecting: 'Selecionando...',
  },
  es: {
    multiCity: 'Viaje Multi-Ciudad',
    leg: 'Tramo',
    direct: 'Directo',
    stop: 'escala',
    stops: 'escalas',
    total: 'Precio Total',
    perLeg: 'Por tramo',
    showDetails: 'Mostrar detalles',
    hideDetails: 'Ocultar detalles',
    selectFlight: 'Seleccionar Vuelo',
    selecting: 'Seleccionando...',
  }
};

export default function MultiCityFlightCard({
  flight,
  onSelect,
  isNavigating = false,
  lang = 'en'
}: MultiCityFlightCardProps) {
  const t = content[lang];
  const [showDetails, setShowDetails] = useState(false);

  const legs = flight.itineraries;
  const totalPrice = typeof flight.price.total === 'string'
    ? parseFloat(flight.price.total)
    : flight.price.total;

  // Calculate per-leg prices (weighted by segment count)
  const totalSegments = legs.reduce((sum, leg) => sum + leg.segments.length, 0);
  const legPrices = legs.map((leg) => {
    const segmentRatio = leg.segments.length / totalSegments;
    return Math.round(totalPrice * segmentRatio);
  });

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200">
      {/* Multi-City Badge */}
      <div className="px-4 pt-3 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <MapPin className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
          <span className="text-sm font-bold text-blue-700">{t.multiCity}</span>
          <span className="text-xs text-blue-600">{legs.length} {t.perLeg}</span>
        </div>
      </div>

      {/* Flight Legs - Compact View */}
      <div className="px-4 py-3 space-y-3">
        {legs.map((leg, i) => (
          <div key={i} className="relative">
            {/* Leg Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                {t.leg} {i + 1}
              </span>
              <span className="text-sm text-gray-600">
                {leg.segments[0].departure.iataCode} → {leg.segments[leg.segments.length - 1].arrival.iataCode}
              </span>
              <span className="ml-auto text-base font-bold text-gray-900">
                ${legPrices[i].toLocaleString()}
              </span>
            </div>

            {/* Compact Flight Info */}
            <div className="flex items-center justify-between">
              {/* Departure */}
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(leg.segments[0].departure.at)}
                </div>
                <div className="text-sm text-gray-600">
                  {leg.segments[0].departure.iataCode}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(leg.segments[0].departure.at)}
                </div>
              </div>

              {/* Flight Path */}
              <div className="flex-1 flex flex-col items-center px-4">
                <div className="text-xs text-gray-500 mb-1">
                  {getDuration(leg.duration)}
                </div>
                <div className="w-full relative">
                  <div className="border-t-2 border-gray-300" />
                  <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 bg-white" />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {leg.segments.length - 1 === 0
                    ? t.direct
                    : `${leg.segments.length - 1} ${leg.segments.length - 1 === 1 ? t.stop : t.stops}`}
                </div>
              </div>

              {/* Arrival */}
              <div className="flex-1 text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(leg.segments[leg.segments.length - 1].arrival.at)}
                </div>
                <div className="text-sm text-gray-600">
                  {leg.segments[leg.segments.length - 1].arrival.iataCode}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(leg.segments[leg.segments.length - 1].arrival.at)}
                </div>
              </div>
            </div>

            {/* Connection Arrow (between legs) */}
            {i < legs.length - 1 && (
              <div className="flex items-center justify-center my-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">Next leg</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="px-4 pb-3 space-y-3 animate-slideDown">
          {legs.map((leg, legIndex) => (
            <div key={legIndex} className="border-t border-gray-200 pt-3">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                {t.leg} {legIndex + 1} - Segments
              </div>
              {leg.segments.map((segment, segIndex) => (
                <div key={segIndex} className="flex items-center gap-3 py-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-700">
                      {segment.carrierCode}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {segment.carrierCode} {segment.number}
                    </div>
                    <div className="text-xs text-gray-500">
                      {segment.aircraft?.code || 'Aircraft info unavailable'}
                    </div>
                  </div>
                  <div className="text-right text-gray-600">
                    <div className="font-medium">
                      {formatTime(segment.departure.at)} → {formatTime(segment.arrival.at)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {segment.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Show/Hide Details Button */}
      <div className="px-4 pb-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>{t.hideDetails}</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>{t.showDetails}</span>
            </>
          )}
        </button>
      </div>

      {/* Price Breakdown & Select Button */}
      <div className="px-4 pb-4">
        {/* Total Price */}
        <div className="flex items-center justify-between mb-3 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
          <span className="text-sm font-semibold text-gray-700">{t.total}</span>
          <span className="text-3xl font-bold text-primary-600">
            ${totalPrice.toLocaleString()}
          </span>
        </div>

        {/* Select Button */}
        <button
          onClick={() => onSelect(flight.id)}
          disabled={isNavigating}
          className={`
            w-full py-4 rounded-xl font-bold text-base shadow-lg
            transition-all duration-200 transform active:scale-98
            min-h-[56px] touch-manipulation
            ${isNavigating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white hover:shadow-xl'
            }
          `}
        >
          {isNavigating ? t.selecting : t.selectFlight}
        </button>
      </div>
    </div>
  );
}

// Helper functions
function formatTime(dateTime: string): string {
  return new Date(dateTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatDate(dateTime: string): string {
  return new Date(dateTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function getDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;
  const hours = match[1] ? match[1].replace('H', 'h ') : '';
  const minutes = match[2] ? match[2].replace('M', 'm') : '';
  return `${hours}${minutes}`.trim();
}
