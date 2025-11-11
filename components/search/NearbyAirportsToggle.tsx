'use client';

/**
 * NearbyAirportsToggle Component
 * Team 1 - Enhanced Search & Filters
 *
 * Checkbox to include nearby airports (within 100km)
 * Features:
 * - Show distance from original airport
 * - Price comparison for nearby options
 * - Visual indicators for savings
 */

import { useState, useEffect } from 'react';
import { NearbyAirport } from '@/lib/types/search';
import {
  getNearbyAirports,
  calculateNearbyAirportSavings,
  formatPrice,
} from '@/lib/utils/search-helpers';

interface NearbyAirportsToggleProps {
  airportCode: string;
  currentPrice: number;
  onAirportSelect?: (airportCode: string) => void;
  className?: string;
}

export default function NearbyAirportsToggle({
  airportCode,
  currentPrice,
  onAirportSelect,
  className = '',
}: NearbyAirportsToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [nearbyAirports, setNearbyAirports] = useState<NearbyAirport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<string>(airportCode);

  useEffect(() => {
    if (enabled) {
      loadNearbyAirports();
    }
  }, [enabled, airportCode]);

  const loadNearbyAirports = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/airports/nearby?code=${airportCode}&radius=100`);
      // const data = await response.json();

      // Mock data for development
      const airports = getNearbyAirports(airportCode);
      setNearbyAirports(airports);
    } catch (error) {
      console.error('Failed to load nearby airports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setEnabled(!enabled);
    if (enabled) {
      // Reset to original airport when disabled
      setSelectedAirport(airportCode);
      onAirportSelect?.(airportCode);
    }
  };

  const handleAirportSelect = (code: string) => {
    setSelectedAirport(code);
    onAirportSelect?.(code);
  };

  const { bestDeal, savings } = calculateNearbyAirportSavings(
    currentPrice,
    nearbyAirports
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Toggle Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${enabled ? 'bg-blue-600' : 'bg-gray-300'}
              `}
              role="switch"
              aria-checked={enabled}
              aria-label="Toggle nearby airports search"
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Include Nearby Airports
              </h3>
              <p className="text-xs text-gray-600">
                Search within 100km radius
              </p>
            </div>
          </div>

          {/* Savings Badge */}
          {enabled && bestDeal && savings > 0 && (
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-xs font-semibold">
                Save {formatPrice(savings)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nearby Airports List */}
      {enabled && (
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : nearbyAirports.length === 0 ? (
            <div className="text-center py-6">
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-gray-600">
                No nearby airports found
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Original Airport */}
              <button
                onClick={() => handleAirportSelect(airportCode)}
                className={`
                  w-full p-3 rounded-lg border-2 transition-all text-left
                  ${selectedAirport === airportCode
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400'
                  }
                `}
                aria-label={`Original airport ${airportCode}, price ${formatPrice(currentPrice)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {airportCode}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Original
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Selected airport
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(currentPrice)}
                    </div>
                  </div>
                </div>
              </button>

              {/* Nearby Airports */}
              {nearbyAirports.map((airport) => {
                const savingsAmount = currentPrice - airport.price;
                const savingsPercent = ((savingsAmount / currentPrice) * 100).toFixed(0);

                return (
                  <button
                    key={airport.code}
                    onClick={() => handleAirportSelect(airport.code)}
                    disabled={!airport.available}
                    className={`
                      w-full p-3 rounded-lg border-2 transition-all text-left
                      ${selectedAirport === airport.code
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400'
                      }
                      ${!airport.available
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                      }
                    `}
                    aria-label={`${airport.name} (${airport.code}), ${airport.distanceKm}km away, ${airport.available ? formatPrice(airport.price) : 'Unavailable'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {airport.code}
                          </span>
                          {savingsAmount > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Save {savingsPercent}%
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-900 mt-1">
                          {airport.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{airport.distanceKm}km from {airportCode}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        {airport.available ? (
                          <>
                            <div className="text-lg font-bold text-gray-900">
                              {formatPrice(airport.price)}
                            </div>
                            {savingsAmount > 0 && (
                              <div className="text-xs text-green-600 font-semibold">
                                -{formatPrice(savingsAmount)}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-gray-400">
                            N/A
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Best Deal Highlight */}
          {bestDeal && savings > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">
                    Best nearby option
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {bestDeal.name} ({bestDeal.code}) - Save {formatPrice(savings)} by flying from {bestDeal.distanceKm}km away
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
