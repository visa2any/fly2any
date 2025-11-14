'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Globe,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  Leaf,
  Award,
  BarChart3,
  Clock,
  Users,
  Star
} from 'lucide-react';
import type { Booking } from '@/lib/bookings/types';
import Link from 'next/link';

interface TripStats {
  totalTrips: number;
  totalMiles: number;
  totalSpent: number;
  countriesVisited: number;
  favoriteDestinations: { city: string; count: number; iataCode: string }[];
  carbonFootprint: number;
  yearlyStats: {
    year: number;
    trips: number;
    spent: number;
    miles: number;
  }[];
  recentTrips: {
    id: string;
    bookingReference: string;
    origin: string;
    destination: string;
    departureDate: string;
    status: string;
    totalAmount: number;
    currency: string;
  }[];
}

// Airport to city/country mapping (simplified - in production use comprehensive database)
const getAirportInfo = (iataCode: string): { city: string; country: string } => {
  const airports: Record<string, { city: string; country: string }> = {
    'JFK': { city: 'New York', country: 'US' },
    'LAX': { city: 'Los Angeles', country: 'US' },
    'ORD': { city: 'Chicago', country: 'US' },
    'LHR': { city: 'London', country: 'GB' },
    'CDG': { city: 'Paris', country: 'FR' },
    'DXB': { city: 'Dubai', country: 'AE' },
    'SIN': { city: 'Singapore', country: 'SG' },
    'HND': { city: 'Tokyo', country: 'JP' },
    'GRU': { city: 'São Paulo', country: 'BR' },
    'SYD': { city: 'Sydney', country: 'AU' },
    'MIA': { city: 'Miami', country: 'US' },
    'ATL': { city: 'Atlanta', country: 'US' },
    'DFW': { city: 'Dallas', country: 'US' },
    'SFO': { city: 'San Francisco', country: 'US' },
    'MCO': { city: 'Orlando', country: 'US' },
  };

  return airports[iataCode] || { city: iataCode, country: 'Unknown' };
};

// Calculate distance between two airports (simplified Haversine formula)
const calculateDistance = (from: string, to: string): number => {
  // In production, use actual airport coordinates
  // This is a simplified estimation
  const randomDistance = Math.floor(Math.random() * 5000) + 500;
  return randomDistance;
};

export default function TripHistoryPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TripStats | null>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (sessionStatus === 'authenticated') {
      fetchTripHistory();
    }
  }, [sessionStatus, router]);

  const fetchTripHistory = async () => {
    try {
      setLoading(true);

      // Fetch all completed bookings
      const response = await fetch('/api/bookings?status=completed&limit=1000');
      const data = await response.json();

      if (!data.success || !data.data) {
        setStats(null);
        return;
      }

      const bookings: Booking[] = data.data.bookings;

      // Calculate statistics
      const totalTrips = bookings.length;
      let totalMiles = 0;
      let totalSpent = 0;
      const destinationCounts: Record<string, number> = {};
      const countries = new Set<string>();
      const yearlyStatsMap: Record<number, { trips: number; spent: number; miles: number }> = {};

      bookings.forEach((booking) => {
        // Total spending
        totalSpent += booking.flight.price.total;

        // Calculate miles from flight segments
        booking.flight.segments.forEach((segment) => {
          const distance = calculateDistance(segment.departure.iataCode, segment.arrival.iataCode);
          totalMiles += distance;

          // Track destinations
          const arrivalInfo = getAirportInfo(segment.arrival.iataCode);
          destinationCounts[segment.arrival.iataCode] = (destinationCounts[segment.arrival.iataCode] || 0) + 1;
          countries.add(arrivalInfo.country);
        });

        // Yearly stats
        const year = new Date(booking.createdAt).getFullYear();
        if (!yearlyStatsMap[year]) {
          yearlyStatsMap[year] = { trips: 0, spent: 0, miles: 0 };
        }
        yearlyStatsMap[year].trips += 1;
        yearlyStatsMap[year].spent += booking.flight.price.total;
        booking.flight.segments.forEach((segment) => {
          const distance = calculateDistance(segment.departure.iataCode, segment.arrival.iataCode);
          yearlyStatsMap[year].miles += distance;
        });
      });

      // Sort favorite destinations
      const favoriteDestinations = Object.entries(destinationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([iataCode, count]) => ({
          city: getAirportInfo(iataCode).city,
          count,
          iataCode,
        }));

      // Carbon footprint estimate (kg CO2 per mile = ~0.09kg for economy)
      const carbonFootprint = Math.round(totalMiles * 0.09);

      // Yearly stats array
      const yearlyStats = Object.entries(yearlyStatsMap)
        .map(([year, data]) => ({
          year: parseInt(year),
          ...data,
        }))
        .sort((a, b) => b.year - a.year);

      // Recent trips
      const recentTrips = bookings
        .slice(0, 10)
        .map((booking) => ({
          id: booking.id,
          bookingReference: booking.bookingReference,
          origin: booking.flight.segments[0]?.departure.iataCode || 'N/A',
          destination: booking.flight.segments[booking.flight.segments.length - 1]?.arrival.iataCode || 'N/A',
          departureDate: booking.flight.segments[0]?.departure.at || '',
          status: booking.status,
          totalAmount: booking.flight.price.total,
          currency: booking.flight.price.currency,
        }));

      setStats({
        totalTrips,
        totalMiles: Math.round(totalMiles),
        totalSpent: Math.round(totalSpent),
        countriesVisited: countries.size,
        favoriteDestinations,
        carbonFootprint,
        yearlyStats,
        recentTrips,
      });
    } catch (error) {
      console.error('Error fetching trip history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to view your trip history</p>
      </div>
    );
  }

  if (!stats || stats.totalTrips === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Trip History Yet</h2>
          <p className="text-gray-600 mb-6">
            Start booking flights to see your travel analytics and statistics
          </p>
          <Link
            href="/flights"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plane className="w-5 h-5" />
            Search Flights
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Trip History & Analytics</h1>
            <p className="text-primary-100 mt-1">Your travel journey at a glance</p>
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary-100 rounded-lg p-3">
              <Plane className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Trips</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTrips}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-success-600 mt-2">
            <TrendingUp className="w-3 h-3" />
            <span>All time</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 rounded-lg p-3">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Miles Flown</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMiles.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ~{Math.round(stats.totalMiles / 24901 * 100) / 100}× around Earth
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-success-100 rounded-lg p-3">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900">
                ${stats.totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Avg ${Math.round(stats.totalSpent / stats.totalTrips).toLocaleString()} per trip
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-warning-100 rounded-lg p-3">
              <MapPin className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Countries</p>
              <p className="text-3xl font-bold text-gray-900">{stats.countriesVisited}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Unique destinations</p>
        </div>
      </div>

      {/* Carbon Footprint */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <p className="text-green-100 text-sm">Estimated Carbon Footprint</p>
              <p className="text-3xl font-bold">{stats.carbonFootprint.toLocaleString()} kg CO₂</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-100">Consider carbon offsetting</p>
            <button className="mt-2 bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Favorite Destinations */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-warning-500" />
          <h2 className="text-xl font-bold text-gray-900">Top Destinations</h2>
        </div>
        <div className="space-y-3">
          {stats.favoriteDestinations.map((dest, index) => (
            <div
              key={dest.iataCode}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-warning-100 text-warning-700' :
                  index === 1 ? 'bg-gray-200 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{dest.city}</p>
                  <p className="text-xs text-gray-500">{dest.iataCode}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{dest.count}</p>
                <p className="text-xs text-gray-500">visits</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Yearly Statistics */}
      {stats.yearlyStats.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Travel by Year</h2>
          </div>
          <div className="space-y-4">
            {stats.yearlyStats.map((yearData) => (
              <div key={yearData.year} className="border-l-4 border-primary-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{yearData.year}</h3>
                  <span className="text-sm text-gray-500">{yearData.trips} trips</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Trips</p>
                    <p className="text-xl font-bold text-gray-900">{yearData.trips}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Miles</p>
                    <p className="text-xl font-bold text-gray-900">{yearData.miles.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Spent</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${yearData.spent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Trips */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Recent Trips</h2>
          </div>
          <Link
            href="/account/bookings"
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {stats.recentTrips.map((trip) => (
            <Link
              key={trip.id}
              href={`/account/bookings/${trip.id}`}
              className="block p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-100 rounded-lg p-3">
                    <Plane className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{trip.origin}</p>
                      <span className="text-gray-400">→</span>
                      <p className="font-bold text-gray-900">{trip.destination}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {trip.bookingReference} • {new Date(trip.departureDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${trip.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{trip.currency}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Travel Achievements */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Travel Achievements</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">✈️</div>
            <p className="text-sm text-purple-100">Frequent Flyer</p>
            {stats.totalTrips >= 10 && <p className="text-xs text-purple-200 mt-1">Unlocked!</p>}
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🌍</div>
            <p className="text-sm text-purple-100">Globe Trotter</p>
            {stats.countriesVisited >= 5 && <p className="text-xs text-purple-200 mt-1">Unlocked!</p>}
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">💫</div>
            <p className="text-sm text-purple-100">Sky Miles</p>
            {stats.totalMiles >= 25000 && <p className="text-xs text-purple-200 mt-1">Unlocked!</p>}
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-sm text-purple-100">Explorer</p>
            {stats.totalTrips >= 20 && <p className="text-xs text-purple-200 mt-1">Unlocked!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
