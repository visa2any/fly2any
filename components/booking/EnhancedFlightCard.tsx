'use client';

/**
 * Enhanced Flight Card — Fly2Any
 * Level 6 Apple-Class flight details display
 * Shows all segments, times, aircraft, terminals, duration
 */

import {
  Plane, Clock, MapPin, Calendar, Users,
  Luggage, Armchair, ChevronDown, ChevronUp,
  ArrowRight, Building2, Info
} from 'lucide-react';
import { useState } from 'react';
import type { FlightSegment, FlightData } from '@/lib/bookings/types';

interface EnhancedFlightCardProps {
  flight: FlightData;
  showFareRules?: boolean;
  className?: string;
}

// Airline logos mapping
const AIRLINE_NAMES: Record<string, string> = {
  'UA': 'United Airlines', 'AA': 'American Airlines', 'DL': 'Delta Air Lines',
  'WN': 'Southwest Airlines', 'B6': 'JetBlue Airways', 'AS': 'Alaska Airlines',
  'NK': 'Spirit Airlines', 'F9': 'Frontier Airlines', 'G4': 'Allegiant Air',
  'HA': 'Hawaiian Airlines', 'SY': 'Sun Country', 'BA': 'British Airways',
  'LH': 'Lufthansa', 'AF': 'Air France', 'KL': 'KLM', 'EK': 'Emirates',
  'QR': 'Qatar Airways', 'SQ': 'Singapore Airlines', 'CX': 'Cathay Pacific',
};

// Format duration from ISO 8601
function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;
  const hours = match[1] ? parseInt(match[1]) : 0;
  const mins = match[2] ? parseInt(match[2]) : 0;
  return `${hours}h ${mins}m`;
}

// Format datetime
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
}

// Single segment display
function SegmentCard({ segment, index }: { segment: FlightSegment; index: number }) {
  const airlineName = AIRLINE_NAMES[segment.carrierCode] || segment.carrierCode;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      {/* Segment Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
            <span className="text-sm font-bold text-primary-600">{segment.carrierCode}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{airlineName}</p>
            <p className="text-xs text-gray-500">{segment.carrierCode} {segment.flightNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            segment.class === 'business' ? 'bg-amber-100 text-amber-700' :
            segment.class === 'first' ? 'bg-purple-100 text-purple-700' :
            segment.class === 'premium_economy' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {segment.class?.replace('_', ' ').toUpperCase() || 'ECONOMY'}
          </span>
        </div>
      </div>

      {/* Flight Route Visual */}
      <div className="flex items-center gap-4">
        {/* Departure */}
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900">{formatTime(segment.departure.at)}</p>
          <p className="text-lg font-semibold text-primary-600">{segment.departure.iataCode}</p>
          {segment.departure.terminal && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Terminal {segment.departure.terminal}
            </p>
          )}
        </div>

        {/* Duration Line */}
        <div className="flex-1 flex flex-col items-center">
          <p className="text-xs text-gray-500 mb-1">{formatDuration(segment.duration)}</p>
          <div className="w-full flex items-center">
            <div className="h-px flex-1 bg-gray-300" />
            <Plane className="w-4 h-4 text-primary-500 mx-2 rotate-90" />
            <div className="h-px flex-1 bg-gray-300" />
          </div>
          {segment.aircraft && (
            <p className="text-xs text-gray-400 mt-1">{segment.aircraft}</p>
          )}
        </div>

        {/* Arrival */}
        <div className="flex-1 text-right">
          <p className="text-2xl font-bold text-gray-900">{formatTime(segment.arrival.at)}</p>
          <p className="text-lg font-semibold text-primary-600">{segment.arrival.iataCode}</p>
          {segment.arrival.terminal && (
            <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
              <Building2 className="w-3 h-3" /> Terminal {segment.arrival.terminal}
            </p>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        {formatDate(segment.departure.at)}
      </div>
    </div>
  );
}

export function EnhancedFlightCard({ flight, showFareRules = true, className = '' }: EnhancedFlightCardProps) {
  const [expanded, setExpanded] = useState(true);

  // Group segments by itinerary (outbound/return)
  const outboundSegments = flight.segments.filter((_, i) => i < flight.segments.length / 2 || flight.type === 'one-way');
  const returnSegments = flight.type === 'round-trip' ? flight.segments.slice(Math.ceil(flight.segments.length / 2)) : [];

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-bold">Flight Details</h3>
              <p className="text-sm text-white/80">
                {flight.segments[0]?.departure.iataCode} → {flight.segments[flight.segments.length - 1]?.arrival.iataCode}
                {flight.type === 'round-trip' && ' (Round Trip)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white/80">Total</p>
              <p className="text-xl font-bold">{flight.price.currency} {flight.price.total.toFixed(2)}</p>
            </div>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-6 space-y-6">
          {/* Outbound Flight */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-4 h-4 text-primary-500" />
              <h4 className="font-semibold text-gray-900">
                {flight.type === 'round-trip' ? 'Outbound Flight' : 'Flight'}
              </h4>
              <span className="text-xs text-gray-500">
                ({outboundSegments.length} segment{outboundSegments.length > 1 ? 's' : ''})
              </span>
            </div>
            <div className="space-y-3">
              {outboundSegments.map((seg, i) => (
                <SegmentCard key={seg.id || i} segment={seg} index={i} />
              ))}
            </div>
          </div>

          {/* Return Flight */}
          {returnSegments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight className="w-4 h-4 text-primary-500 rotate-180" />
                <h4 className="font-semibold text-gray-900">Return Flight</h4>
                <span className="text-xs text-gray-500">
                  ({returnSegments.length} segment{returnSegments.length > 1 ? 's' : ''})
                </span>
              </div>
              <div className="space-y-3">
                {returnSegments.map((seg, i) => (
                  <SegmentCard key={seg.id || i} segment={seg} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> Price Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare</span>
                <span className="font-medium">{flight.price.currency} {flight.price.base.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes</span>
                <span className="font-medium">{flight.price.currency} {flight.price.taxes.toFixed(2)}</span>
              </div>
              {flight.price.fees > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fees</span>
                  <span className="font-medium">{flight.price.currency} {flight.price.fees.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-bold">
                <span>Total</span>
                <span className="text-primary-600">{flight.price.currency} {flight.price.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Validating Airline */}
          {flight.validatingAirlineCodes && flight.validatingAirlineCodes.length > 0 && (
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>Operated by:</span>
              {flight.validatingAirlineCodes.map(code => (
                <span key={code} className="px-2 py-1 bg-gray-100 rounded font-medium">
                  {AIRLINE_NAMES[code] || code}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EnhancedFlightCard;
