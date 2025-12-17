'use client';

/**
 * Journey Builder Page
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 *
 * Multi-city trip builder with visual timeline
 */

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plane,
  Building2,
  Sparkles,
  ChevronRight,
  Clock,
  Calendar,
  Users,
  MapPin,
  Star,
  ArrowRight,
  Plus,
  Check,
  Loader2,
} from 'lucide-react';

// Layout
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';

// ============================================================================
// TYPES
// ============================================================================

interface FlightLeg {
  origin: string;
  destination: string;
  date: string;
}

interface SearchParams {
  origin: string;
  destination: string;
  departure: string;
  return?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  isMultiCity: boolean;
  additionalFlights: FlightLeg[];
}

interface FlightOption {
  id: string;
  airline: { code: string; name: string; logo?: string };
  departure: { time: string; airport: string };
  arrival: { time: string; airport: string };
  duration: number;
  stops: number;
  price: number;
  currency: string;
}

// ============================================================================
// JOURNEY BUILDER CONTENT
// ============================================================================

function JourneyBuilderContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [selectedFlights, setSelectedFlights] = useState<Record<number, FlightOption | null>>({});
  const [flightOptions, setFlightOptions] = useState<Record<number, FlightOption[]>>({});

  // Parse search params
  const params = useMemo((): SearchParams => {
    const additionalFlightsStr = searchParams.get('additionalFlights');
    let additionalFlights: FlightLeg[] = [];

    if (additionalFlightsStr) {
      try {
        additionalFlights = JSON.parse(additionalFlightsStr);
      } catch (e) {
        console.error('Failed to parse additional flights');
      }
    }

    return {
      origin: searchParams.get('origin') || '',
      destination: searchParams.get('destination') || '',
      departure: searchParams.get('departure') || '',
      return: searchParams.get('return') || undefined,
      adults: parseInt(searchParams.get('adults') || '1'),
      children: parseInt(searchParams.get('children') || '0'),
      infants: parseInt(searchParams.get('infants') || '0'),
      cabinClass: searchParams.get('cabinClass') || 'economy',
      isMultiCity: searchParams.get('multiCity') === 'true',
      additionalFlights,
    };
  }, [searchParams]);

  // Build all flight legs
  const allLegs = useMemo((): FlightLeg[] => {
    const legs: FlightLeg[] = [];

    // First leg
    if (params.origin && params.destination && params.departure) {
      legs.push({
        origin: params.origin,
        destination: params.destination,
        date: params.departure,
      });
    }

    // Additional legs (multi-city)
    if (params.additionalFlights?.length > 0) {
      legs.push(...params.additionalFlights);
    }

    return legs;
  }, [params]);

  // Load flight options for each leg
  useEffect(() => {
    const loadFlights = async () => {
      setLoading(true);

      // Simulate API call - in production this would call real API
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockOptions: Record<number, FlightOption[]> = {};

      allLegs.forEach((leg, index) => {
        mockOptions[index] = generateMockFlights(leg, index);
      });

      setFlightOptions(mockOptions);
      setLoading(false);
    };

    if (allLegs.length > 0) {
      loadFlights();
    }
  }, [allLegs]);

  // Generate mock flights for a leg
  const generateMockFlights = (leg: FlightLeg, legIndex: number): FlightOption[] => {
    const airlines = [
      { code: 'AA', name: 'American Airlines' },
      { code: 'UA', name: 'United Airlines' },
      { code: 'DL', name: 'Delta Air Lines' },
      { code: 'BA', name: 'British Airways' },
      { code: 'LH', name: 'Lufthansa' },
    ];

    return Array.from({ length: 5 }, (_, i) => {
      const airline = airlines[i % airlines.length];
      const basePrice = 250 + Math.floor(Math.random() * 400);
      const duration = 120 + Math.floor(Math.random() * 480);
      const hour = 6 + Math.floor(Math.random() * 14);

      return {
        id: `${legIndex}-${i}`,
        airline,
        departure: {
          time: `${hour.toString().padStart(2, '0')}:${(Math.floor(Math.random() * 60)).toString().padStart(2, '0')}`,
          airport: leg.origin,
        },
        arrival: {
          time: `${((hour + Math.floor(duration / 60)) % 24).toString().padStart(2, '0')}:${(Math.floor(Math.random() * 60)).toString().padStart(2, '0')}`,
          airport: leg.destination,
        },
        duration,
        stops: i === 0 ? 0 : i < 3 ? 1 : 2,
        price: basePrice,
        currency: 'USD',
      };
    }).sort((a, b) => a.price - b.price);
  };

  // Format duration
  const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    return Object.values(selectedFlights).reduce((sum, flight) => {
      return sum + (flight?.price || 0);
    }, 0);
  }, [selectedFlights]);

  // Format date
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (allLegs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">No Journey Found</h2>
          <p className="text-gray-500 mt-2">Please start a new search from the Journey page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <MaxWidthContainer>
          <div className="py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Journey Builder
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {allLegs.length} flight{allLegs.length !== 1 ? 's' : ''} • {params.adults + params.children} traveler{params.adults + params.children !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Total Price */}
            {totalPrice > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">${totalPrice.toLocaleString()}</p>
              </div>
            )}
          </div>
        </MaxWidthContainer>
      </div>

      {/* Timeline */}
      <MaxWidthContainer>
        <div className="py-6 md:py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Building your journey...</p>
              <p className="text-sm text-gray-400 mt-1">Finding the best options</p>
            </div>
          ) : (
            <div className="space-y-6">
              {allLegs.map((leg, index) => (
                <div key={index} className="relative">
                  {/* Connector Line */}
                  {index < allLegs.length - 1 && (
                    <div className="absolute left-6 top-full h-6 w-0.5 bg-gradient-to-b from-primary-200 to-transparent z-0" />
                  )}

                  {/* Leg Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Leg Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-amber-50 px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-sm">
                          <Plane className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{leg.origin}</span>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <span className="font-bold text-gray-900">{leg.destination}</span>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(leg.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                            Flight {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Flight Options */}
                    <div className="p-3 space-y-2">
                      {flightOptions[index]?.slice(0, 4).map((flight) => {
                        const isSelected = selectedFlights[index]?.id === flight.id;
                        return (
                          <button
                            key={flight.id}
                            onClick={() => setSelectedFlights(prev => ({
                              ...prev,
                              [index]: isSelected ? null : flight
                            }))}
                            className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50/50 shadow-md'
                                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Airline */}
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-gray-600">{flight.airline.code}</span>
                              </div>

                              {/* Times */}
                              <div className="flex-1 flex items-center gap-3 min-w-0">
                                <div className="text-center">
                                  <p className="font-semibold text-gray-900">{flight.departure.time}</p>
                                  <p className="text-xs text-gray-500">{flight.departure.airport}</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center px-2">
                                  <p className="text-xs text-gray-400">{formatDuration(flight.duration)}</p>
                                  <div className="w-full h-px bg-gray-200 relative my-1">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300" />
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300" />
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop`}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="font-semibold text-gray-900">{flight.arrival.time}</p>
                                  <p className="text-xs text-gray-500">{flight.arrival.airport}</p>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="text-right flex-shrink-0 flex items-center gap-2">
                                <div>
                                  <p className="font-bold text-gray-900">${flight.price}</p>
                                  <p className="text-xs text-gray-500">/person</p>
                                </div>
                                {isSelected && (
                                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary Card */}
              {Object.keys(selectedFlights).length > 0 && (
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">Selected Flights</p>
                      <p className="text-2xl font-bold mt-1">
                        ${totalPrice.toLocaleString()} <span className="text-sm font-normal text-white/70">total</span>
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-white text-primary-600 font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </MaxWidthContainer>
    </div>
  );
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function JourneyBuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    }>
      <JourneyBuilderContent />
    </Suspense>
  );
}
