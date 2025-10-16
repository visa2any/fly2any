'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface POI {
  name: string;
  category: string;
  rank: number;
  distance?: string;
  rating?: number;
}

interface PointsOfInterestProps {
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export function PointsOfInterest({ location = 'Paris', latitude, longitude, radius = 5 }: PointsOfInterestProps) {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPOIs();
  }, [location, latitude, longitude]);

  const fetchPOIs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Mock data for now (replace with actual Amadeus POI API call)
      const mockPOIs: POI[] = [
        { name: 'Eiffel Tower', category: 'Sights', rank: 1, distance: '0.5 km', rating: 4.8 },
        { name: 'Louvre Museum', category: 'Museum', rank: 2, distance: '1.2 km', rating: 4.9 },
        { name: 'Notre-Dame Cathedral', category: 'Religious Site', rank: 3, distance: '1.8 km', rating: 4.7 },
        { name: 'Arc de Triomphe', category: 'Monument', rank: 4, distance: '2.1 km', rating: 4.6 },
        { name: 'Sacré-Cœur', category: 'Religious Site', rank: 5, distance: '3.2 km', rating: 4.7 },
        { name: 'Champs-Élysées', category: 'Shopping', rank: 6, distance: '2.5 km', rating: 4.5 },
      ];

      await new Promise(resolve => setTimeout(resolve, 500));
      setPois(mockPOIs);
    } catch (err: any) {
      setError(err.message || 'Failed to load points of interest');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card variant="white" padding="lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="white" padding="lg">
        <div className="text-center text-error">{error}</div>
      </Card>
    );
  }

  return (
    <Card variant="white" padding="lg" className="sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">📍 Top Attractions</h3>
        <span className="text-sm text-gray-600">{location}</span>
      </div>

      <div className="space-y-4">
        {pois.map((poi, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer group"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                {poi.rank}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                {poi.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  {poi.category}
                </span>
                {poi.distance && (
                  <span className="text-xs text-gray-600">{poi.distance}</span>
                )}
              </div>
              {poi.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm text-gray-700 font-medium">{poi.rating}</span>
                </div>
              )}
            </div>

            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <Button variant="outline" fullWidth className="mt-6">
        View All Attractions
      </Button>
    </Card>
  );
}
