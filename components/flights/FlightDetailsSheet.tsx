'use client';

import { useEffect } from 'react';
import { X, Plane, Wifi, Zap, Coffee, Monitor, Luggage, Briefcase, Star, Award } from 'lucide-react';
import { getAirlineData } from '@/lib/flights/airline-data';
import { formatCityCode } from '@/lib/data/airports';
import { getAircraftName } from '@/lib/flights/aircraft-names';
import AirlineLogo from './AirlineLogo';
import CO2Badge from './CO2Badge';
import { LoyaltyBadge, calculateLoyaltyMiles, estimateDistance } from './LoyaltyBadge';
import type { EnhancedFlightCardProps } from './FlightCardEnhanced';

interface FlightDetailsSheetProps extends EnhancedFlightCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
}

/**
 * MOBILE BOTTOM SHEET - Full Flight Details
 *
 * Progressive disclosure pattern:
 * - Slides up from bottom (80vh)
 * - Drag handle for intuitive close
 * - All detailed information (segments, baggage, amenities)
 * - Sticky CTA button at bottom
 */

export function FlightDetailsSheet(props: FlightDetailsSheetProps) {
  const {
    isOpen,
    onClose,
    onSelect,
    itineraries,
    price,
    validatingAirlineCodes = [],
    travelerPricings = [],
    co2Emissions,
    averageCO2,
  } = props;

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const primaryItinerary = itineraries[0];
  const primaryAirline = validatingAirlineCodes?.[0] || primaryItinerary.segments[0].carrierCode;
  const airlineData = getAirlineData(primaryAirline);

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Parse duration
  const parseDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;
    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    return `${hours}h ${minutes}m`;
  };

  // Get baggage info (simplified for mobile)
  const getBaggageInfo = () => {
    if (!travelerPricings || travelerPricings.length === 0) {
      return {
        carryOn: true,
        carryOnQuantity: 1,
        checked: 0,
      };
    }

    const fareDetails = travelerPricings[0]?.fareDetailsBySegment?.[0];
    const cabinBags = fareDetails?.includedCabinBags?.quantity || 1;
    const checkedBags = fareDetails?.includedCheckedBags?.quantity || 0;

    return {
      carryOn: cabinBags >= 1,
      carryOnQuantity: cabinBags,
      checked: checkedBags,
    };
  };

  const baggageInfo = getBaggageInfo();

  // Calculate loyalty miles
  const durationToMinutes = (duration: string): number => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return 0;
    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    return hours * 60 + minutes;
  };

  const flightDurationMins = durationToMinutes(primaryItinerary.duration);
  const estimatedDistance = estimateDistance(flightDurationMins);
  const loyaltyMiles = calculateLoyaltyMiles(estimatedDistance, 'ECONOMY');

  // Format price
  const formatPrice = () => {
    const total = typeof price.total === 'string' ? parseFloat(price.total) : price.total;
    return `$${Math.round(total)}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out"
        style={{
          height: '85vh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Flight Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 py-4 space-y-6" style={{ height: 'calc(85vh - 140px)' }}>

          {/* Flight Segments */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Itinerary</h3>

            {itineraries.map((itinerary, legIndex) => (
              <div key={`leg-${legIndex}`} className="bg-gray-50 rounded-lg p-4 space-y-3">
                {itineraries.length > 1 && (
                  <div className="text-xs font-semibold text-gray-500">
                    Leg {legIndex + 1} of {itineraries.length}
                  </div>
                )}

                {itinerary.segments.map((segment, segIndex) => (
                  <div key={`seg-${segIndex}`} className="space-y-3">
                    {/* Segment Header */}
                    <div className="flex items-start gap-3">
                      <AirlineLogo code={segment.carrierCode} size="md" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {getAirlineData(segment.carrierCode).name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Flight {segment.number} • {getAircraftName(segment.aircraft?.code)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-semibold text-gray-700">
                            {airlineData.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatTime(segment.departure.at)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatDate(segment.departure.at)}
                        </div>
                        <div className="text-sm font-medium text-gray-700 mt-1">
                          {formatCityCode(segment.departure.iataCode)}
                        </div>
                        {segment.departure.terminal && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Terminal {segment.departure.terminal}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 pt-6">
                        <Plane className="w-4 h-4 text-primary-600" />
                      </div>

                      <div className="flex-1 text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatTime(segment.arrival.at)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatDate(segment.arrival.at)}
                        </div>
                        <div className="text-sm font-medium text-gray-700 mt-1">
                          {formatCityCode(segment.arrival.iataCode)}
                        </div>
                        {segment.arrival.terminal && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Terminal {segment.arrival.terminal}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Layover (if not last segment) */}
                    {segIndex < itinerary.segments.length - 1 && (
                      <div className="text-xs text-center py-2 text-gray-500 border-t border-gray-200">
                        Layover in {formatCityCode(segment.arrival.iataCode)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Baggage Allowance */}
          <div className="bg-info-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Luggage className="w-4 h-4 text-primary-500" />
              Baggage Allowance
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 text-sm">
                  <span className="font-semibold text-gray-900">Carry-on:</span>{' '}
                  <span className="text-gray-700">
                    {baggageInfo.carryOnQuantity} {baggageInfo.carryOnQuantity === 1 ? 'bag' : 'bags'} + personal item
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Luggage className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 text-sm">
                  <span className="font-semibold text-gray-900">Checked:</span>{' '}
                  <span className="text-gray-700">
                    {baggageInfo.checked === 0 ? 'Not included (fees apply)' : `${baggageInfo.checked} ${baggageInfo.checked === 1 ? 'bag' : 'bags'} (23kg each)`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities (if available) */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Estimated Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Wifi className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700">WiFi (varies)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700">Power outlets</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Coffee className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700">Refreshments</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Monitor className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700">Entertainment</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-purple-700">
              ℹ️ Amenities vary by aircraft and route
            </div>
          </div>

          {/* CO2 Emissions */}
          {co2Emissions && (
            <div className="bg-green-50 rounded-lg p-4">
              <CO2Badge
                emissions={co2Emissions}
                averageEmissions={averageCO2}
              />
            </div>
          )}

          {/* Loyalty Miles */}
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-gray-900">Loyalty Rewards</h3>
            </div>
            <div className="text-sm text-gray-700">
              Earn approximately{' '}
              <span className="font-bold text-amber-700">{loyaltyMiles.toLocaleString()} miles</span>
              {airlineData.frequentFlyerProgram && (
                <span> with {airlineData.frequentFlyerProgram}</span>
              )}
            </div>
          </div>

        </div>

        {/* Sticky CTA Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={onSelect}
            className="w-full py-3 bg-primary-600 text-white text-base font-bold rounded-lg active:scale-95 transition-transform shadow-lg"
          >
            Select Flight - {formatPrice()}
          </button>
        </div>
      </div>
    </>
  );
}
