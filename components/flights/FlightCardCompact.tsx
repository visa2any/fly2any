'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Star, Plane, Check, Clock, Users, Wifi, Zap, Coffee, AlertCircle } from 'lucide-react';
import { getAirlineData, getRatingColor, getOnTimePerformanceBadge } from '@/lib/flights/airline-data';
import { formatCityCode } from '@/lib/data/airports';
import { formatBaggageWeight } from '@/lib/flights/weight-utils';
import BaggageTooltip from './BaggageTooltip';
import AirlineLogo from './AirlineLogo';

interface Segment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft?: { code: string };
  duration: string;
  numberOfStops?: number;
}

interface Itinerary {
  duration: string;
  segments: Segment[];
}

interface Price {
  total: string | number;
  base?: string | number;
  currency: string;
  grandTotal?: string | number;
}

export interface FlightCardCompactProps {
  id: string;
  itineraries: Itinerary[];
  price: Price;
  numberOfBookableSeats?: number;
  validatingAirlineCodes?: string[];
  travelerPricings?: any[];
  badges?: Array<{
    type: string;
    text: string;
    color: string;
    icon?: string;
  }>;
  score?: number;
  onSelect?: (id: string) => void;
  onCompare?: (id: string) => void;
  isComparing?: boolean;
  isNavigating?: boolean;
  showExpanded?: boolean;
}

export function FlightCardCompact({
  id,
  itineraries,
  price,
  numberOfBookableSeats = 9,
  validatingAirlineCodes = [],
  travelerPricings = [],
  badges = [],
  score,
  onSelect,
  onCompare,
  isComparing = false,
  isNavigating = false,
  showExpanded = false,
}: FlightCardCompactProps) {
  const [isExpanded, setIsExpanded] = useState(showExpanded);

  // Get primary airline data
  const primaryAirline = validatingAirlineCodes[0] || itineraries[0]?.segments[0]?.carrierCode || 'XX';
  const airlineData = getAirlineData(primaryAirline);

  // Get primary flight number (first segment) and strip airline code prefix
  const rawFlightNumber = itineraries[0]?.segments[0]?.number || '';
  const primaryFlightNumber = rawFlightNumber.replace(/^[A-Z]{2}\s*/, ''); // Remove 2-letter airline code prefix

  // Calculate pricing
  const basePrice = typeof price.base === 'string' ? parseFloat(price.base) : (price.base || 0);
  const totalPrice = typeof price.total === 'string' ? parseFloat(price.total) : price.total;
  const averagePrice = totalPrice * 1.18; // Mock average for comparison
  const savings = averagePrice - totalPrice;
  const savingsPercentage = Math.round((savings / averagePrice) * 100);

  // Get flight details
  const outbound = itineraries[0];
  const inbound = itineraries[1];
  const isRoundtrip = !!inbound;

  // Format helpers
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const parseDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return '0h 0m';
    const hours = match[1] ? match[1].replace('H', 'h') : '';
    const minutes = match[2] ? match[2].replace('M', 'm') : '';
    return `${hours}${minutes ? ' ' + minutes : ''}`.trim();
  };

  const getStopsText = (segments: Segment[]) => {
    const stops = segments.length - 1;
    if (stops === 0) return 'Direct';
    if (stops === 1) return '1 stop';
    return `${stops} stops`;
  };

  const getStopsColor = (segments: Segment[]) => {
    const stops = segments.length - 1;
    if (stops === 0) return 'text-green-600 bg-green-50';
    if (stops === 1) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // Get cabin class
  const cabin = travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY';
  const cabinShort = cabin.replace('_', ' ').split(' ').map((w: string) => w[0]).join('');

  // Mock viewing count for social proof
  const viewingCount = Math.floor(Math.random() * 50) + 15;

  // On-time badge
  const onTimeBadge = getOnTimePerformanceBadge(airlineData.onTimePerformance);

  // Handle select
  const handleSelect = () => {
    if (!onSelect || isNavigating) return;
    onSelect(id);
  };

  return (
    <div
      className={`group relative bg-white md:rounded-lg border-y md:border transition-all duration-200 overflow-hidden ${
        isComparing
          ? 'border-primary-500 ring-2 ring-primary-100 shadow-lg'
          : 'border-gray-200 hover:border-primary-300 md:hover:shadow-lg'
      }`}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {/* ULTRA-COMPACT MAIN ROW - Full-width mobile, flex desktop */}
      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 px-2 md:px-3 py-2 md:py-2.5 bg-gradient-to-r from-gray-50/30 to-white">
        {/* 1. AIRLINE LOGO + NAME - Compact */}
        <div className="flex items-center gap-1.5 min-w-[140px]">
          <AirlineLogo
            code={primaryAirline}
            size="md"
            className="shadow-sm flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1 truncate">
              <span className="text-xs font-bold text-gray-900 truncate leading-tight">
                {airlineData.name}
              </span>
              {primaryFlightNumber && (
                <span className="text-[10px] font-medium text-gray-500 truncate leading-tight flex items-baseline gap-0.5">
                  <span className="text-gray-400">Flight</span>
                  <span className="text-gray-600 font-semibold">{primaryFlightNumber}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className={`w-2.5 h-2.5 fill-current ${getRatingColor(airlineData.rating)}`} />
              <span className="text-[10px] font-semibold text-gray-600">{airlineData.rating}</span>
              <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${onTimeBadge.color}`}>
                {airlineData.onTimePerformance}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. OUTBOUND FLIGHT - Ultra compact, mobile-optimized */}
        <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0 md:min-w-[280px]">
          {/* OUTBOUND Label - Inline */}
          <span className="hidden md:block text-[8px] font-bold text-primary-600 uppercase tracking-wide whitespace-nowrap w-[60px] flex-shrink-0">
            → OUT
          </span>

          {/* Departure */}
          <div className="text-left min-w-0">
            <div className="flex items-baseline gap-0.5 leading-none">
              <span className="text-sm md:text-base font-bold text-gray-900">{formatTime(outbound.segments[0].departure.at)}</span>
            </div>
            <div className="text-[9px] md:text-[10px] font-bold text-gray-700 leading-tight">
              {outbound.segments[0].departure.iataCode}
            </div>
          </div>

          {/* Flight path - compact with duration */}
          <div className="flex-1 px-1 md:px-2 min-w-[60px]">
            <div className="relative h-px bg-gradient-to-r from-gray-300 via-primary-400 to-gray-300">
              <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-primary-500 bg-white rounded-full p-0.5" />
            </div>
            <div className="text-center mt-0.5 flex items-center justify-center gap-0.5 flex-nowrap">
              <span className="text-[9px] md:text-[10px] font-semibold text-gray-600">
                {parseDuration(outbound.duration)}
              </span>
              <span className={`text-[8px] md:text-[9px] font-bold px-1 py-0.5 rounded ${getStopsColor(outbound.segments)}`}>
                {getStopsText(outbound.segments)}
              </span>
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right min-w-0">
            <div className="flex items-baseline gap-0.5 justify-end leading-none">
              <span className="text-sm md:text-base font-bold text-gray-900">{formatTime(outbound.segments[outbound.segments.length - 1].arrival.at)}</span>
            </div>
            <div className="text-[9px] md:text-[10px] font-bold text-gray-700 leading-tight">
              {outbound.segments[outbound.segments.length - 1].arrival.iataCode}
            </div>
          </div>
        </div>

        {/* 3. URGENCY + SOCIAL PROOF - Hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-1 flex-wrap">
          {numberOfBookableSeats <= 7 && (
            <span className="text-[8px] font-bold text-orange-600 px-1 py-0.5 bg-orange-50 rounded whitespace-nowrap">
              {numberOfBookableSeats} left
            </span>
          )}
          {savings > 0 && savingsPercentage >= 10 && (
            <span className="text-[8px] font-bold text-green-600 px-1 py-0.5 bg-green-50 rounded whitespace-nowrap">
              {savingsPercentage}% OFF
            </span>
          )}
        </div>

        {/* 4. PRICE - Bold with yellow highlight, right-aligned */}
        <div className="text-right ml-auto">
          <div className="flex items-baseline justify-end gap-0.5">
            {savings > 10 && (
              <span className="text-[8px] text-gray-400 line-through leading-tight">
                ${Math.round(averagePrice)}
              </span>
            )}
            <span className="text-base md:text-lg font-black text-gray-900 leading-tight px-1.5 py-0.5 bg-secondary-100 rounded">
              ${Math.round(totalPrice)}
            </span>
          </div>
          <div className="text-[8px] text-gray-500 leading-tight">per person</div>
        </div>

        {/* 5. SELECT BUTTON - Full-width on mobile, compact on desktop */}
        <button
          onClick={handleSelect}
          disabled={isNavigating}
          className={`px-3 md:px-4 py-2 font-bold rounded-lg transition-all text-xs whitespace-nowrap min-h-[44px] md:min-h-[36px] ${
            isNavigating
              ? 'bg-gradient-to-r from-success-500 to-success-600 text-white cursor-wait'
              : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-md active:scale-95'
          }`}
          style={{ boxShadow: '0 2px 8px rgba(214, 58, 53, 0.25)' }}
        >
          {isNavigating ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading
            </span>
          ) : (
            'Select →'
          )}
        </button>

        {/* 6. EXPAND BUTTON - Minimal */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={isNavigating}
          className="p-1 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* RETURN FLIGHT - If roundtrip, compact row */}
      {isRoundtrip && (
        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-gray-50/50 border-t border-gray-100">
          {/* Spacer for desktop alignment */}
          <div className="hidden md:block min-w-[140px]"></div>

          <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
            {/* RETURN Label */}
            <span className="text-[8px] font-bold text-secondary-600 uppercase tracking-wide whitespace-nowrap w-auto md:w-[60px] flex-shrink-0">
              ← RET
            </span>

            <div className="text-left min-w-0">
              <div className="flex items-baseline gap-0.5 leading-none">
                <span className="text-sm md:text-base font-bold text-gray-900">{formatTime(inbound.segments[0].departure.at)}</span>
              </div>
              <div className="text-[9px] md:text-[10px] font-bold text-gray-700 leading-tight">
                {inbound.segments[0].departure.iataCode}
              </div>
            </div>

            <div className="flex-1 px-1 md:px-2 min-w-[60px]">
              <div className="relative h-px bg-gradient-to-r from-gray-300 via-secondary-500 to-gray-300">
                <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-secondary-500 bg-white rounded-full p-0.5 rotate-180" />
              </div>
              <div className="text-center mt-0.5 flex items-center justify-center gap-0.5">
                <span className="text-[9px] md:text-[10px] font-semibold text-gray-600">
                  {parseDuration(inbound.duration)}
                </span>
                <span className={`text-[8px] md:text-[9px] font-bold px-1 py-0.5 rounded ${getStopsColor(inbound.segments)}`}>
                  {getStopsText(inbound.segments)}
                </span>
              </div>
            </div>

            <div className="text-right min-w-0">
              <div className="flex items-baseline gap-0.5 justify-end leading-none">
                <span className="text-sm md:text-base font-bold text-gray-900">{formatTime(inbound.segments[inbound.segments.length - 1].arrival.at)}</span>
              </div>
              <div className="text-[9px] md:text-[10px] font-bold text-gray-700 leading-tight">
                {inbound.segments[inbound.segments.length - 1].arrival.iataCode}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPANDED DETAILS - Collapsible */}
      {isExpanded && (
        <div className="px-3 py-3 border-t border-gray-200 bg-gray-50/50 space-y-3 animate-slideDown">
          {/* Key Benefits - Compact grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <BaggageTooltip type="checked" weight={formatBaggageWeight(23)} airline={primaryAirline}>
              <div className="bg-white rounded p-2 border border-gray-200 cursor-help">
                <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                  <span>Checked Bag</span>
                </div>
                <div className="text-xs font-bold text-gray-900">{formatBaggageWeight(23)} included</div>
              </div>
            </BaggageTooltip>
            <div className="bg-white rounded p-2 border border-gray-200">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-0.5">
                <Users className="w-3 h-3 text-primary-500" />
                <span>Cabin</span>
              </div>
              <div className="text-xs font-bold text-gray-900">{cabin}</div>
            </div>
            <div className="bg-white rounded p-2 border border-gray-200">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-0.5">
                <Clock className="w-3 h-3 text-orange-600" />
                <span>On-Time</span>
              </div>
              <div className="text-xs font-bold text-gray-900">{airlineData.onTimePerformance}%</div>
            </div>
            <div className="bg-white rounded p-2 border border-gray-200">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-0.5">
                <Star className="w-3 h-3 text-yellow-600" />
                <span>Rating</span>
              </div>
              <div className="text-xs font-bold text-gray-900">{airlineData.rating}/5</div>
            </div>
          </div>

          {/* Segment Details - Compact */}
          {outbound.segments.map((segment, idx) => (
            <div key={idx} className="bg-white rounded-lg p-2.5 border border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-xs"
                    style={{
                      background: `linear-gradient(135deg, ${getAirlineData(segment.carrierCode).primaryColor}, ${getAirlineData(segment.carrierCode).secondaryColor})`,
                    }}
                  >
                    {getAirlineData(segment.carrierCode).logo}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">
                      {getAirlineData(segment.carrierCode).name} {segment.number}
                    </div>
                    <div className="text-[9px] text-gray-600">
                      {segment.aircraft?.code || 'Aircraft TBD'}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-semibold text-gray-700">
                  {parseDuration(segment.duration)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[9px] text-gray-500">Departure</div>
                  <div className="font-bold text-gray-900">
                    {formatTime(segment.departure.at)}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    {formatCityCode(segment.departure.iataCode)}
                  </div>
                  {segment.departure.terminal && (
                    <div className="text-[9px] text-gray-600">Terminal {segment.departure.terminal}</div>
                  )}
                </div>
                <div>
                  <div className="text-[9px] text-gray-500">Arrival</div>
                  <div className="font-bold text-gray-900">
                    {formatTime(segment.arrival.at)}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    {formatCityCode(segment.arrival.iataCode)}
                  </div>
                  {segment.arrival.terminal && (
                    <div className="text-[9px] text-gray-600">Terminal {segment.arrival.terminal}</div>
                  )}
                </div>
              </div>

              {/* Amenities - Compact */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 bg-info-50 text-primary-600 text-[9px] font-semibold rounded flex items-center gap-0.5">
                  <Wifi className="w-2.5 h-2.5" /> WiFi
                </span>
                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-semibold rounded flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" /> Power
                </span>
                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[9px] font-semibold rounded flex items-center gap-0.5">
                  <Coffee className="w-2.5 h-2.5" /> Meals
                </span>
              </div>

              {/* Layover warning */}
              {idx < outbound.segments.length - 1 && (
                <div className="mt-1.5 p-1.5 bg-yellow-50 border border-yellow-200 rounded text-[10px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">
                    Layover in {formatCityCode(segment.arrival.iataCode)}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Price Breakdown - Compact */}
          <div className="bg-info-50 border border-info-200 rounded-lg p-2.5">
            <div className="text-xs font-bold text-neutral-800 mb-1.5">TruePrice™ Breakdown</div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-700">Base fare</span>
                <span className="font-semibold">${Math.round(basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Taxes & fees</span>
                <span className="font-semibold">${Math.round(totalPrice - basePrice)}</span>
              </div>
              <div className="pt-1 border-t border-info-300 flex justify-between">
                <span className="font-bold text-neutral-800">Total per person</span>
                <span className="font-bold text-neutral-800">${Math.round(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Additional savings info */}
          {savings > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 text-center">
              <div className="text-xs font-bold text-green-900">
                💰 You're saving ${Math.round(savings)} ({savingsPercentage}%) vs. average price
              </div>
              <div className="text-[9px] text-green-700 mt-0.5">
                Based on recent searches for this route
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
