'use client';

import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, DollarSign, Plane } from 'lucide-react';

interface Destination {
  type: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: {
    total: string;
  };
}

interface FlightInspirationProps {
  origin: string;
  maxPrice?: number;
  onSelectDestination?: (destination: string) => void;
}

export default function FlightInspiration({ origin, maxPrice, onSelectDestination }: FlightInspirationProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin) return;

    const fetchInspiration = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ origin });
        if (maxPrice) params.append('maxPrice', maxPrice.toString());
        params.append('viewBy', 'DESTINATION');

        const response = await fetch(`/api/inspiration?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch inspiration');
        }

        const data = await response.json();
        setDestinations(data.data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching inspiration:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInspiration();
  }, [origin, maxPrice]);

  if (!origin) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Explore Destinations</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Unable to load destination inspiration: {error}</p>
      </div>
    );
  }

  if (destinations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Trending Destinations from {origin}</h3>
        <span className="ml-auto text-sm text-gray-500">{destinations.length} destinations</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {destinations.slice(0, 8).map((dest, index) => (
          <button
            key={index}
            onClick={() => onSelectDestination?.(dest.destination)}
            className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 hover:shadow-lg"
          >
            <div className="p-4 bg-gradient-to-br from-blue-50 to-white group-hover:from-blue-100 group-hover:to-white transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-lg">{dest.destination}</span>
                </div>
              </div>

              <div className="text-left space-y-1">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <DollarSign className="h-3 w-3" />
                  <span className="font-semibold text-green-600">${dest.price.total}</span>
                </div>

                {dest.departureDate && (
                  <p className="text-xs text-gray-500">
                    {new Date(dest.departureDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-blue-600 font-medium group-hover:underline">
                  View Flights →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {destinations.length > 8 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Show more destinations →
          </button>
        </div>
      )}
    </div>
  );
}
