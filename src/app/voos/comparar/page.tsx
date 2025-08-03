'use client';

/**
 * Flight Comparison Page
 * Allows users to compare multiple flights side by side
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProcessedFlightOffer } from '@/types/flights';
import { FlightIcon, StarIcon, ArrowLeftIcon } from '@/components/Icons';

export default function FlightComparisonPage() {
  const [flights, setFlights] = useState<ProcessedFlightOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadFlightData = async () => {
      try {
        // Get flight IDs from URL params for comparison
        const flightIds = searchParams.get('flights')?.split(',') || [];
        
        if (flightIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch real flight data for comparison
        const flightPromises = flightIds.map(async (flightId) => {
          const response = await fetch(`/api/flights/details/${flightId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch flight ${flightId}: ${response.status}`);
          }
          return response.json();
        });

        const flightData = await Promise.all(flightPromises);
        setFlights(flightData);
        
      } catch (error) {
        console.error('Error loading flight comparison data:', error);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    loadFlightData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flight comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/voos"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to results
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FlightIcon className="w-8 h-8 text-blue-600" />
            Flight Comparison
          </h1>
          <p className="text-gray-600 mt-2">
            Compare details, prices and schedules to choose the best option
          </p>
        </div>

        {flights.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <FlightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No flights to compare
            </h3>
            <p className="text-gray-600 mb-6">
              Add flights to comparison to see side-by-side differences
            </p>
            <Link
              href="/voos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <FlightIcon className="w-4 h-4" />
              Search Flights
            </Link>
          </div>
        ) : (
          // Comparison table
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Comparing {flights.length} flight{flights.length > 1 ? 's' : ''}
              </h2>
              <p className="text-gray-600">
                View details side by side to make the best decision
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {flights.map((flight, index) => (
                    <React.Fragment key={flight.id}>
                      {/* Flight Header */}
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-900" colSpan={2}>
                          Flight {index + 1} - {flight.outbound.departure.iataCode} → {flight.outbound.arrival.iataCode}
                        </td>
                      </tr>
                      
                      {/* Price */}
                      <tr>
                        <td className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                          Total Price
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-2xl font-bold text-blue-600">
                            {flight.totalPrice}
                          </span>
                        </td>
                      </tr>
                      
                      {/* Duration */}
                      <tr>
                        <td className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                          Total Duration
                        </td>
                        <td className="px-6 py-3 text-gray-900">
                          {flight.totalDuration}
                        </td>
                      </tr>
                      
                      {/* Departure */}
                      <tr>
                        <td className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                          Departure
                        </td>
                        <td className="px-6 py-3 text-gray-900">
                          {flight.outbound.departure.date} at {flight.outbound.departure.time}
                          <br />
                          <span className="text-sm text-gray-600">
                            {flight.outbound.departure.airportName}
                          </span>
                        </td>
                      </tr>
                      
                      {/* Arrival */}
                      <tr>
                        <td className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                          Arrival
                        </td>
                        <td className="px-6 py-3 text-gray-900">
                          {flight.outbound.arrival.date} at {flight.outbound.arrival.time}
                          <br />
                          <span className="text-sm text-gray-600">
                            {flight.outbound.arrival.airportName}
                          </span>
                        </td>
                      </tr>
                      
                      {/* Stops */}
                      <tr>
                        <td className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                          Stops
                        </td>
                        <td className="px-6 py-3 text-gray-900">
                          {flight.outbound.stops === 0 ? 'Direct flight' : `${flight.outbound.stops} stop${flight.outbound.stops > 1 ? 's' : ''}`}
                        </td>
                      </tr>
                      
                      {/* Airlines */}
                      <tr>
                        <td className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                          Airline
                        </td>
                        <td className="px-6 py-3 text-gray-900">
                          {flight.validatingAirlines.join(', ')}
                        </td>
                      </tr>
                      
                      {/* Seats Available */}
                      <tr>
                        <td className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                          Available Seats
                        </td>
                        <td className="px-6 py-3 text-gray-900">
                          {flight.numberOfBookableSeats} seats
                        </td>
                      </tr>
                      
                      {/* Action */}
                      <tr>
                        <td className="px-6 py-4" colSpan={2}>
                          <Link
                            href={`/voos/detalhes/${flight.id}?origem=${flight.outbound.departure.iataCode}&destino=${flight.outbound.arrival.iataCode}&preco=${encodeURIComponent(flight.totalPrice)}`}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                          >
                            <FlightIcon className="w-4 h-4" />
                            Select This Flight
                          </Link>
                        </td>
                      </tr>
                      
                      {index < flights.length - 1 && (
                        <tr>
                          <td colSpan={2} className="border-b-4 border-gray-200"></td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Didn't find what you were looking for?
          </p>
          <Link
            href="/voos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-blue-400 transition-all duration-200"
          >
            <FlightIcon className="w-4 h-4" />
            New Search
          </Link>
        </div>
      </div>
    </div>
  );
}