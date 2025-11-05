'use client';

import { Plane, Clock, Users } from 'lucide-react';

interface FlightLeg {
  departure: {
    airport: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    time: string;
    terminal?: string;
  };
  duration: string;
  stops: number;
  stopover?: string;
}

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  // Legacy single-leg support (for backward compatibility)
  departure?: {
    airport: string;
    time: string;
    terminal?: string;
  };
  arrival?: {
    airport: string;
    time: string;
    terminal?: string;
  };
  duration?: string;
  stops?: number;
  stopover?: string;
  // New round-trip support
  outbound?: FlightLeg;
  return?: FlightLeg;
  price: {
    amount: string;
    currency: string;
  };
  cabinClass: string;
  seatsAvailable: number;
  baggage: {
    checked: string;
    cabin: string;
  };
}

interface FlightResultCardProps {
  flight: FlightResult;
  onSelect: (flightId: string) => void;
  compact?: boolean;
  onFlightSelected?: (flightId: string, flightPrice: number) => void;
}

export function FlightResultCard({ flight, onSelect, compact = true, onFlightSelected }: FlightResultCardProps) {
  const formatTime = (isoTime: string) => {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (isoTime: string) => {
    const date = new Date(isoTime);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getCabinClassColor = (cabinClass: string) => {
    if (cabinClass === 'business') return 'text-blue-600 bg-blue-50';
    if (cabinClass === 'first') return 'text-purple-600 bg-purple-50';
    if (cabinClass === 'premium_economy') return 'text-indigo-600 bg-indigo-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Determine if round-trip or one-way
  const isRoundTrip = !!(flight.outbound && flight.return);

  // For backward compatibility, use legacy fields or new structure
  const outbound = flight.outbound || {
    departure: flight.departure!,
    arrival: flight.arrival!,
    duration: flight.duration || 'N/A',
    stops: flight.stops || 0,
    stopover: flight.stopover,
  };

  // Render flight leg
  const renderFlightLeg = (leg: FlightLeg, label: string, isReturn: boolean = false) => (
    <div className="flex items-center gap-1.5">
      {/* Inline Label */}
      <span className={`text-[9px] font-bold uppercase tracking-wide whitespace-nowrap flex-shrink-0 w-[60px] ${
        isReturn ? 'text-gray-600' : 'text-blue-600'
      }`}>
        {label}
      </span>

      {/* Departure */}
      <div className="text-left flex-shrink-0">
        <div className="flex items-baseline gap-0.5 leading-none">
          <span className="text-xs font-bold text-gray-900">{formatDate(leg.departure.time)}</span>
          <span className="text-[11px] font-semibold text-gray-600">{formatTime(leg.departure.time)}</span>
        </div>
        <div className="text-[9px] font-semibold text-gray-600 leading-tight mt-0.5">
          {leg.departure.airport}
        </div>
      </div>

      {/* Flight Path */}
      <div className="flex-1 px-1.5 min-w-[80px]">
        <div className="relative h-px bg-gradient-to-r from-gray-300 via-primary-400 to-gray-300">
          <Plane className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 ${
            isReturn ? 'text-gray-500 rotate-180' : 'text-primary-600'
          } bg-white rounded-full p-0.5`} />
        </div>
        <div className="text-center mt-0.5 flex items-center justify-center gap-0.5 flex-wrap">
          <span className="text-[9px] font-medium text-gray-600">
            {leg.duration}
          </span>
          <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
            leg.stops === 0 ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'
          }`}>
            {leg.stops === 0 ? 'Direct' : `${leg.stops} stop${leg.stops > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Arrival */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-baseline gap-0.5 justify-end leading-none">
          <span className="text-xs font-bold text-gray-900">{formatDate(leg.arrival.time)}</span>
          <span className="text-[11px] font-semibold text-gray-600">{formatTime(leg.arrival.time)}</span>
        </div>
        <div className="text-[9px] font-semibold text-gray-600 leading-tight mt-0.5">
          {leg.arrival.airport}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all duration-200">
      {/* Header: Airline + Price - Compact */}
      <div className="flex items-center justify-between px-2.5 py-2 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Plane className="w-3.5 h-3.5 text-primary-600" />
          </div>
          <div>
            <div className="font-bold text-xs text-gray-900">{flight.airline}</div>
            <div className="text-[9px] text-gray-500">Flight {flight.flightNumber}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-primary-600">
            {flight.price.currency} {flight.price.amount}
          </div>
          <div className="text-[9px] text-gray-500">per person</div>
        </div>
      </div>

      {/* Outbound Flight */}
      <div className="px-2.5 py-2 bg-blue-50/30">
        {renderFlightLeg(outbound, '→ OUTBOUND', false)}
      </div>

      {/* Return Flight (if round-trip) */}
      {isRoundTrip && flight.return && (
        <div className="px-2.5 py-2 bg-gray-50/30 border-t border-gray-100">
          {renderFlightLeg(flight.return, '← RETURN', true)}
        </div>
      )}

      {/* Details Row - Compact */}
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${getCabinClassColor(flight.cabinClass)}`}>
            {flight.cabinClass === 'business' ? 'Business' :
             flight.cabinClass === 'first' ? 'First' :
             flight.cabinClass === 'premium_economy' ? 'Premium' : 'Economy'}
          </span>
          <span className="text-[9px] text-gray-600" title="Baggage">
            🎒 {flight.baggage.cabin} 💼 {flight.baggage.checked}
          </span>
          {flight.seatsAvailable <= 5 && (
            <span className="text-[9px] text-orange-600 font-bold">
              ⚠️ {flight.seatsAvailable} left!
            </span>
          )}
        </div>

        {/* Action Button - Inline */}
        <button
          onClick={() => {
            if (onFlightSelected) {
              const price = parseFloat(flight.price.amount.replace(/[^0-9.]/g, ''));
              onFlightSelected(flight.id, price);
            }
            onSelect(flight.id);
          }}
          className="px-3 py-1 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-bold rounded-md transition-all active:scale-95 text-[11px] whitespace-nowrap"
        >
          Select →
        </button>
      </div>
    </div>
  );
}
