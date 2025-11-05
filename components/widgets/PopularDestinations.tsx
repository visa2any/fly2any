'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Destination {
  city: string;
  country: string;
  iataCode: string;
  flights: number;
  travelers: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface PopularDestinationsProps {
  origin?: string;
  period?: 'week' | 'month' | 'year';
}

export function PopularDestinations({ origin = 'NYC', period = 'month' }: PopularDestinationsProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, [origin, period]);

  const fetchDestinations = async () => {
    setLoading(true);

    try {
      // Mock data (replace with actual Amadeus Travel Analytics API call)
      const mockDestinations: Destination[] = [
        { city: 'Paris', country: 'France', iataCode: 'CDG', flights: 1245, travelers: 45231, trend: 'up', trendPercentage: 15 },
        { city: 'London', country: 'UK', iataCode: 'LHR', flights: 1189, travelers: 42890, trend: 'up', trendPercentage: 8 },
        { city: 'Tokyo', country: 'Japan', iataCode: 'NRT', flights: 892, travelers: 38567, trend: 'up', trendPercentage: 23 },
        { city: 'Dubai', country: 'UAE', iataCode: 'DXB', flights: 756, travelers: 34221, trend: 'stable', trendPercentage: 2 },
        { city: 'Barcelona', country: 'Spain', iataCode: 'BCN', flights: 698, travelers: 29445, trend: 'up', trendPercentage: 12 },
        { city: 'Rome', country: 'Italy', iataCode: 'FCO', flights: 654, travelers: 27890, trend: 'down', trendPercentage: -5 },
      ];

      await new Promise(resolve => setTimeout(resolve, 500));
      setDestinations(mockDestinations);
    } catch (err) {
      console.error('Failed to fetch destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">↗</span>;
      case 'down':
        return <span className="text-red-500">↘</span>;
      default:
        return <span className="text-gray-500">→</span>;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card variant="white" padding="lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="white" padding="lg" className="sticky top-24">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">🔥 Trending Destinations</h3>
        <p className="text-sm text-gray-600">From {origin} · This {period}</p>
      </div>

      <div className="space-y-3">
        {destinations.map((dest, index) => (
          <div
            key={dest.iataCode}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all cursor-pointer group"
          >
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index < 3 ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {index + 1}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {dest.city}
                </h4>
                <span className="text-xs text-gray-500">{dest.iataCode}</span>
              </div>
              <p className="text-xs text-gray-600">{dest.country}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{dest.travelers.toLocaleString()} travelers</span>
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className={`flex items-center gap-1 font-semibold text-sm ${getTrendColor(dest.trend)}`}>
                {getTrendIcon(dest.trend)}
                <span>{Math.abs(dest.trendPercentage)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Updated hourly</span>
          <button className="text-primary-600 hover:text-primary-700 font-semibold">
            View More →
          </button>
        </div>
      </div>
    </Card>
  );
}
