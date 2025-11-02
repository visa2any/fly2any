'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, MapPin, Users, Loader2, Plane } from 'lucide-react';

interface PopularRoute {
  route: string;
  origin: string;
  destination: string;
  searches_30d: number;
  searches_7d: number;
  searches_24h: number;
  avg_price: number | null;
  min_price: number | null;
  max_price: number | null;
  displayPrice: number | null;
  priceRange: string | null;
  isHot: boolean;
  trendingScore: number;
  last_searched_at: string;
}

interface PopularRoutesResponse {
  data: PopularRoute[];
  meta: {
    count: number;
    region: string;
    source: string;
    note: string;
  };
}

// City names for display
const CITY_NAMES: { [key: string]: string } = {
  'JFK': 'New York',
  'LAX': 'Los Angeles',
  'LHR': 'London',
  'CDG': 'Paris',
  'DXB': 'Dubai',
  'SIN': 'Singapore',
  'HKG': 'Hong Kong',
  'NRT': 'Tokyo',
  'SFO': 'San Francisco',
  'MIA': 'Miami',
  'ORD': 'Chicago',
  'DFW': 'Dallas',
  'ATL': 'Atlanta',
  'SEA': 'Seattle',
  'BOS': 'Boston',
  'AMS': 'Amsterdam',
  'FRA': 'Frankfurt',
  'MAD': 'Madrid',
  'BCN': 'Barcelona',
  'FCO': 'Rome',
  'EWR': 'Newark',
  'PHL': 'Philadelphia',
  'BWI': 'Baltimore',
  'DCA': 'Washington',
  'LAS': 'Las Vegas',
  'SAN': 'San Diego',
  'PDX': 'Portland',
  'SJC': 'San Jose',
  'DEN': 'Denver',
  'IAH': 'Houston',
  'MSP': 'Minneapolis',
  'DTW': 'Detroit',
  'STL': 'St. Louis',
  'MCO': 'Orlando',
  'FLL': 'Fort Lauderdale',
  'TPA': 'Tampa',
  'ICN': 'Seoul',
  'BKK': 'Bangkok',
  'PVG': 'Shanghai',
};

const getCityName = (code: string): string => CITY_NAMES[code] || code;

export default function PopularRoutesSection() {
  const [routes, setRoutes] = useState<PopularRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchPopularRoutes();
  }, []);

  const fetchPopularRoutes = async () => {
    try {
      const response = await fetch('/api/popular-routes?limit=8');
      const data: PopularRoutesResponse = await response.json();

      setRoutes(data.data);
      setRegion(data.meta.region);
    } catch (error) {
      console.error('Failed to fetch popular routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteClick = (route: PopularRoute) => {
    const searchParams = new URLSearchParams({
      origin: route.origin,
      destination: route.destination,
      departureDate: getDefaultDepartureDate(),
      oneWay: 'false',
    });

    router.push(`/flights/results?${searchParams.toString()}`);
  };

  const getDefaultDepartureDate = (): string => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  if (routes.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="py-4" style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px' }}>
      {/* Section Header - Matching existing sections */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary-600" />
          Popular Routes
          {region && region !== 'Global' && (
            <span className="text-base font-normal text-gray-500">
              in {region.replace('US-', '')}
            </span>
          )}
        </h2>
      </div>

      {/* Divider - Matching existing sections */}
      <div className="h-0.5 bg-gray-200 mb-4"></div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading popular routes...</p>
        </div>
      )}

      {/* Routes Grid - Horizontal scroll on mobile, grid on desktop */}
      {!loading && routes.length > 0 && (
        <>
          {/* Desktop Grid (hidden on mobile) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {routes.map((route, index) => (
              <button
                key={route.route}
                onClick={() => handleRouteClick(route)}
                className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-lg transition-all duration-200 text-left"
              >
                {/* Hot Badge */}
                {route.isHot && (
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" />
                      Hot!
                    </span>
                  </div>
                )}

                {/* Route Cities */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">{route.origin}</span>
                    <Plane className="w-3 h-3 text-gray-400 transform rotate-90" />
                    <span className="text-xs font-medium text-gray-500">{route.destination}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {getCityName(route.origin)} → {getCityName(route.destination)}
                  </h3>
                </div>

                {/* Price */}
                {route.displayPrice && (
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-primary-600">
                      ${Math.round(route.displayPrice)}
                    </div>
                    {route.priceRange && (
                      <div className="text-xs text-gray-400">{route.priceRange}</div>
                    )}
                  </div>
                )}

                {/* Search Activity */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{route.searches_7d} searches this week</span>
                </div>
              </button>
            ))}
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-4 pb-2">
              {routes.map((route, index) => (
                <button
                  key={route.route}
                  onClick={() => handleRouteClick(route)}
                  className="group flex-shrink-0 bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-lg transition-all duration-200 w-64"
                >
                  {/* Hot Badge */}
                  {route.isHot && (
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        Hot!
                      </span>
                    </div>
                  )}

                  {/* Route Cities */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">{route.origin}</span>
                      <Plane className="w-3 h-3 text-gray-400 transform rotate-90" />
                      <span className="text-xs font-medium text-gray-500">{route.destination}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {getCityName(route.origin)} → {getCityName(route.destination)}
                    </h3>
                  </div>

                  {/* Price */}
                  {route.displayPrice && (
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-primary-600">
                        ${Math.round(route.displayPrice)}
                      </div>
                      {route.priceRange && (
                        <div className="text-xs text-gray-400">{route.priceRange}</div>
                      )}
                    </div>
                  )}

                  {/* Search Activity */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>{route.searches_7d} searches this week</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Based on real traveler searches. Click any route for live prices.
            </p>
          </div>
        </>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
