'use client';

/**
 * FlightComparison Component
 * Team 1 - Enhanced Search & Filters
 *
 * Compare up to 3 flights side-by-side
 * Features:
 * - Select up to 3 flights to compare
 * - Side-by-side comparison table
 * - Highlight differences
 * - Quick book from comparison
 */

import { useState } from 'react';
import { FlightForComparison } from '@/lib/types/search';
import {
  formatDuration,
  formatPrice,
  formatTime,
  formatDate,
} from '@/lib/utils/search-helpers';

interface FlightComparisonProps {
  flights: FlightForComparison[];
  onRemove: (id: string) => void;
  onBook: (id: string) => void;
  onClose?: () => void;
  className?: string;
}

export default function FlightComparison({
  flights,
  onRemove,
  onBook,
  onClose,
  className = '',
}: FlightComparisonProps) {
  const maxFlights = 3;
  const canAddMore = flights.length < maxFlights;

  // Find best values for highlighting
  const bestPrice = Math.min(...flights.map((f) => f.price));
  const bestDuration = Math.min(...flights.map((f) => f.duration));
  const fewestStops = Math.min(...flights.map((f) => f.stops));

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Compare Flights
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {flights.length} of {maxFlights} flights selected
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close comparison"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Empty State */}
      {flights.length === 0 && (
        <div className="p-8 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No flights selected
          </h4>
          <p className="text-sm text-gray-600">
            Select up to {maxFlights} flights from the search results to compare
          </p>
        </div>
      )}

      {/* Comparison Table - Desktop */}
      {flights.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">
                  Feature
                </th>
                {flights.map((flight) => (
                  <th
                    key={flight.id}
                    className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-between">
                      <span>{flight.airline} {flight.flightNumber}</span>
                      <button
                        onClick={() => onRemove(flight.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        aria-label={`Remove ${flight.airline} ${flight.flightNumber} from comparison`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Price Row */}
              <ComparisonRow label="Price">
                {flights.map((flight) => (
                  <td
                    key={flight.id}
                    className={`px-4 py-3 text-center ${
                      flight.price === bestPrice ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(flight.price)}
                      </span>
                      {flight.price === bestPrice && (
                        <span className="text-xs text-green-600 font-semibold mt-1">
                          Best Price
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </ComparisonRow>

              {/* Departure Row */}
              <ComparisonRow label="Departure">
                {flights.map((flight) => (
                  <td key={flight.id} className="px-4 py-3 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {flight.departure.airport}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatTime(flight.departure.time)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(flight.departure.time)}
                    </div>
                  </td>
                ))}
              </ComparisonRow>

              {/* Arrival Row */}
              <ComparisonRow label="Arrival">
                {flights.map((flight) => (
                  <td key={flight.id} className="px-4 py-3 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {flight.arrival.airport}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatTime(flight.arrival.time)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(flight.arrival.time)}
                    </div>
                  </td>
                ))}
              </ComparisonRow>

              {/* Duration Row */}
              <ComparisonRow label="Duration">
                {flights.map((flight) => (
                  <td
                    key={flight.id}
                    className={`px-4 py-3 text-center ${
                      flight.duration === bestDuration ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {formatDuration(flight.duration)}
                    </div>
                    {flight.duration === bestDuration && (
                      <span className="text-xs text-green-600 font-semibold">
                        Fastest
                      </span>
                    )}
                  </td>
                ))}
              </ComparisonRow>

              {/* Stops Row */}
              <ComparisonRow label="Stops">
                {flights.map((flight) => (
                  <td
                    key={flight.id}
                    className={`px-4 py-3 text-center ${
                      flight.stops === fewestStops ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </div>
                    {flight.stops === fewestStops && (
                      <span className="text-xs text-green-600 font-semibold">
                        Fewest
                      </span>
                    )}
                  </td>
                ))}
              </ComparisonRow>

              {/* Aircraft Row */}
              <ComparisonRow label="Aircraft">
                {flights.map((flight) => (
                  <td key={flight.id} className="px-4 py-3 text-center">
                    <div className="text-sm text-gray-900">
                      {flight.aircraftType}
                    </div>
                  </td>
                ))}
              </ComparisonRow>

              {/* Baggage Row */}
              <ComparisonRow label="Baggage">
                {flights.map((flight) => (
                  <td key={flight.id} className="px-4 py-3 text-center">
                    <div className="text-sm text-gray-900">
                      {flight.baggage.checked > 0 ? (
                        <span className="text-green-600">
                          {flight.baggage.checked} checked
                        </span>
                      ) : (
                        <span className="text-gray-500">No checked</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      {flight.baggage.cabin} carry-on
                    </div>
                  </td>
                ))}
              </ComparisonRow>

              {/* Amenities Row */}
              <ComparisonRow label="Amenities">
                {flights.map((flight) => (
                  <td key={flight.id} className="px-4 py-3">
                    <div className="space-y-1">
                      {flight.amenities.length > 0 ? (
                        flight.amenities.map((amenity) => (
                          <div
                            key={amenity}
                            className="text-xs text-gray-700 flex items-center justify-center gap-1"
                          >
                            <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {amenity}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500">None listed</div>
                      )}
                    </div>
                  </td>
                ))}
              </ComparisonRow>

              {/* Fare Class Row */}
              <ComparisonRow label="Fare Class">
                {flights.map((flight) => (
                  <td key={flight.id} className="px-4 py-3 text-center">
                    <div className="text-sm text-gray-900">
                      {flight.fareClass}
                    </div>
                  </td>
                ))}
              </ComparisonRow>

              {/* Action Row */}
              <tr className="bg-gray-50">
                <td className="px-4 py-4"></td>
                {flights.map((flight) => (
                  <td key={flight.id} className="px-4 py-4 text-center">
                    <button
                      onClick={() => onBook(flight.id)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Book Now
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Comparison Cards - Mobile */}
      {flights.length > 0 && (
        <div className="md:hidden p-4 space-y-4">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">
                  {flight.airline} {flight.flightNumber}
                </h4>
                <button
                  onClick={() => onRemove(flight.id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Remove ${flight.airline} ${flight.flightNumber}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Price */}
              <div className={`flex justify-between items-center p-2 rounded ${flight.price === bestPrice ? 'bg-green-50' : ''}`}>
                <span className="text-sm text-gray-600">Price</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(flight.price)}
                  </div>
                  {flight.price === bestPrice && (
                    <span className="text-xs text-green-600 font-semibold">Best Price</span>
                  )}
                </div>
              </div>

              {/* Flight Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{formatDuration(flight.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stops</span>
                  <span className="font-medium">
                    {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Baggage</span>
                  <span className="font-medium">
                    {flight.baggage.checked > 0 ? `${flight.baggage.checked} checked` : 'No checked'}
                  </span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => onBook(flight.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper component for table rows
interface ComparisonRowProps {
  label: string;
  children: React.ReactNode;
}

function ComparisonRow({ label, children }: ComparisonRowProps) {
  return (
    <tr>
      <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
        {label}
      </td>
      {children}
    </tr>
  );
}
