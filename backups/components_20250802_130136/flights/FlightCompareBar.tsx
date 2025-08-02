'use client';

/**
 * Flight Compare Bar Component
 * Floating comparison bar for selected flights
 */

import React from 'react';
import { XIcon, CheckIcon, ArrowRightIcon } from '@/components/Icons';
import { ProcessedFlightOffer } from '@/types/flights';

interface FlightCompareBarProps {
  compareFlights: ProcessedFlightOffer[];
  onRemoveFlight: (flightId: string) => void;
  onCompare: () => void;
  onClearAll: () => void;
  className?: string;
}

export default function FlightCompareBar({
  compareFlights,
  onRemoveFlight,
  onCompare,
  onClearAll,
  className = ''
}: FlightCompareBarProps) {
  if (!compareFlights || compareFlights.length === 0) return null;

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 max-w-4xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            ⚖️ <span>Compare Flights ({compareFlights?.length || 0}/3)</span>
          </h3>
          <button
            onClick={onClearAll}
            className="text-sm text-gray-600 hover:text-red-600 font-medium"
          >
            Clear All
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          {(compareFlights || []).map((flight, index) => (
            <div key={flight.id} className="flex-1 min-w-0">
              <div className="bg-gray-50 rounded-lg p-3 relative">
                <button
                  onClick={() => onRemoveFlight(flight.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <XIcon className="w-3 h-3" />
                </button>
                
                <div className="text-xs text-gray-600 mb-1">
                  {flight.outbound.departure.iataCode} → {flight.outbound.arrival.iataCode}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">{flight.outbound.departure.time}</div>
                    <div className="text-gray-600 text-xs">
                      {flight.outbound.stops === 0 ? 'Direct' : `${flight.outbound.stops} stop(s)`}
                    </div>
                  </div>
                  
                  <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  
                  <div className="text-sm text-right">
                    <div className="font-medium">{flight.outbound.arrival.time}</div>
                    <div className="text-gray-600 text-xs">{flight.outbound.duration}</div>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Price</span>
                    <span className="font-bold text-blue-600">{flight.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add more slots */}
          {Array.from({ length: 3 - (compareFlights?.length || 0) }).map((_, index) => (
            <div key={`empty-${index}`} className="flex-1 min-w-0">
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-3 h-24 flex items-center justify-center">
                <span className="text-sm text-gray-500">Add flight to compare</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCompare}
            disabled={(compareFlights?.length || 0) < 2}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckIcon className="w-5 h-5" />
            Compare Selected ({compareFlights?.length || 0})
          </button>
          
          {(compareFlights?.length || 0) > 0 && (
            <button
              onClick={() => {
                // TODO: Implement save comparison functionality
                alert('Save comparison feature coming soon!');
              }}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              title="Save this comparison"
            >
              💾
              <span className="hidden sm:inline">Save</span>
            </button>
          )}
          
          <button
            onClick={onClearAll}
            className="px-6 py-3 border border-gray-300 hover:border-red-400 text-gray-700 hover:text-red-600 font-medium rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}