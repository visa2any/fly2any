'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import AddToWishlistButton from './AddToWishlistButton';

interface RecentFlight {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: number;
  currency: string;
  airline?: string;
  viewedAt: number;
}

interface RecentlyViewedProps {
  maxItems?: number;
  showOnHomepage?: boolean;
}

export default function RecentlyViewed({ maxItems = 10, showOnHomepage = false }: RecentlyViewedProps) {
  const [recentFlights, setRecentFlights] = useState<RecentFlight[]>([]);

  useEffect(() => {
    loadRecentFlights();
  }, []);

  const loadRecentFlights = () => {
    try {
      const stored = localStorage.getItem('recentlyViewedFlights');
      if (stored) {
        const flights: RecentFlight[] = JSON.parse(stored);
        // Sort by viewedAt descending and limit
        const sorted = flights
          .sort((a, b) => b.viewedAt - a.viewedAt)
          .slice(0, maxItems);
        setRecentFlights(sorted);
      }
    } catch (error) {
      console.error('Error loading recent flights:', error);
    }
  };

  const clearRecentFlights = () => {
    if (confirm('Clear all recently viewed flights?')) {
      localStorage.removeItem('recentlyViewedFlights');
      setRecentFlights([]);
    }
  };

  const removeFromRecent = (id: string) => {
    try {
      const stored = localStorage.getItem('recentlyViewedFlights');
      if (stored) {
        const flights: RecentFlight[] = JSON.parse(stored);
        const updated = flights.filter(f => f.id !== id);
        localStorage.setItem('recentlyViewedFlights', JSON.stringify(updated));
        setRecentFlights(updated.sort((a, b) => b.viewedAt - a.viewedAt).slice(0, maxItems));
      }
    } catch (error) {
      console.error('Error removing flight:', error);
    }
  };

  if (recentFlights.length === 0) {
    return null;
  }

  return (
    <div className={`${showOnHomepage ? 'bg-white rounded-2xl shadow-lg p-6 border border-gray-100' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>🕒</span>
            Recently Viewed Flights
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Pick up where you left off
          </p>
        </div>
        <button
          onClick={clearRecentFlights}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentFlights.map((flight) => (
          <div
            key={flight.id}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300 relative group"
          >
            {/* Remove Button */}
            <button
              onClick={() => removeFromRecent(flight.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 hover:bg-red-50"
              title="Remove from recent"
            >
              <svg className="w-4 h-4 text-gray-400 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Flight Info */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✈️</span>
                  <div className="text-lg font-bold text-gray-900">
                    {flight.origin} → {flight.destination}
                  </div>
                </div>
              </div>

              {flight.airline && (
                <div className="text-xs text-gray-600 mb-2">{flight.airline}</div>
              )}

              <div className="text-sm text-gray-700 mb-2">
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{format(new Date(flight.departureDate), 'MMM dd, yyyy')}</span>
                  {flight.returnDate && (
                    <>
                      <span>→</span>
                      <span>{format(new Date(flight.returnDate), 'MMM dd, yyyy')}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Viewed {format(new Date(flight.viewedAt), 'MMM dd, h:mm a')}
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex items-end justify-between pt-3 border-t border-blue-200">
              <div>
                <div className="text-2xl font-black text-blue-600">
                  ${flight.price}
                </div>
                <div className="text-xs text-gray-500">{flight.currency}</div>
              </div>
              <div className="flex gap-2">
                <AddToWishlistButton
                  flightData={flight}
                  size="sm"
                />
                <Link
                  href={`/flights/details?id=${flight.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to add flight to recently viewed (call this from flight detail pages)
export function addToRecentlyViewed(flight: Omit<RecentFlight, 'viewedAt'>) {
  try {
    const stored = localStorage.getItem('recentlyViewedFlights');
    let flights: RecentFlight[] = stored ? JSON.parse(stored) : [];

    // Remove existing entry for this flight
    flights = flights.filter(f => f.id !== flight.id);

    // Add new entry at the beginning
    flights.unshift({
      ...flight,
      viewedAt: Date.now(),
    });

    // Keep only last 10 items
    flights = flights.slice(0, 10);

    localStorage.setItem('recentlyViewedFlights', JSON.stringify(flights));
  } catch (error) {
    console.error('Error saving to recently viewed:', error);
  }
}
