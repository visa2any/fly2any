'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import Link from 'next/link';
import AddToWishlistButton from '@/components/search/AddToWishlistButton';

interface RecommendedFlight {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: number;
  currency: string;
  airline: string;
  duration: string;
  stops: number;
  recommendationReason: string;
  savingsPercent?: number;
}

export default function RecommendedFlights() {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<RecommendedFlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [session]);

  const generateRecommendations = async () => {
    try {
      // In production, this would call an API that uses ML
      // For now, we'll use rule-based recommendations

      const recs: RecommendedFlight[] = [];

      // 1. Check search history from localStorage
      const searchHistory = localStorage.getItem('searchHistory');
      if (searchHistory) {
        const searches = JSON.parse(searchHistory);
        // Get most searched destinations
        const destinations = searches
          .map((s: any) => s.destination)
          .filter((v: any, i: any, a: any) => a.indexOf(v) === i)
          .slice(0, 3);

        destinations.forEach((dest: string, index: number) => {
          recs.push({
            id: `rec-search-${index}`,
            origin: 'LAX',
            destination: dest,
            departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            returnDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
            price: 450 + Math.random() * 400,
            currency: 'USD',
            airline: ['Delta', 'United', 'American'][Math.floor(Math.random() * 3)],
            duration: `${8 + Math.floor(Math.random() * 6)}h ${Math.floor(Math.random() * 60)}m`,
            stops: Math.floor(Math.random() * 2),
            recommendationReason: 'Based on your search history',
          });
        });
      }

      // 2. Check wishlist for similar destinations
      if (session?.user) {
        try {
          const wishlistRes = await fetch('/api/wishlist');
          if (wishlistRes.ok) {
            const wishlistData = await wishlistRes.json();
            if (wishlistData.items?.length > 0) {
              const wishlistDest = wishlistData.items[0].flightData.destination;
              recs.push({
                id: 'rec-wishlist-1',
                origin: 'LAX',
                destination: wishlistDest,
                departureDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
                returnDate: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000).toISOString(),
                price: 380 + Math.random() * 300,
                currency: 'USD',
                airline: 'Emirates',
                duration: `${10 + Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 60)}m`,
                stops: 1,
                recommendationReason: 'Similar to your wishlist',
                savingsPercent: 15 + Math.floor(Math.random() * 25),
              });
            }
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        }
      }

      // 3. Popular destinations (fallback)
      const popularDestinations = [
        { dest: 'Paris', airline: 'Air France', price: 550 },
        { dest: 'Tokyo', airline: 'Japan Airlines', price: 680 },
        { dest: 'Dubai', airline: 'Emirates', price: 620 },
        { dest: 'London', airline: 'British Airways', price: 520 },
      ];

      if (recs.length < 6) {
        const needed = 6 - recs.length;
        popularDestinations.slice(0, needed).forEach((dest, index) => {
          recs.push({
            id: `rec-popular-${index}`,
            origin: 'LAX',
            destination: dest.dest,
            departureDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            returnDate: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000).toISOString(),
            price: dest.price + Math.random() * 100,
            currency: 'USD',
            airline: dest.airline,
            duration: `${9 + Math.floor(Math.random() * 5)}h ${Math.floor(Math.random() * 60)}m`,
            stops: Math.floor(Math.random() * 2),
            recommendationReason: 'Popular destination',
            savingsPercent: Math.floor(Math.random() * 20),
          });
        });
      }

      setRecommendations(recs.slice(0, 6));
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin text-4xl">✈️</div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>⭐</span>
          Recommended For You
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Personalized flight suggestions based on your preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((flight) => (
          <div
            key={flight.id}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Recommendation Badge */}
            <div className="mb-3">
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-purple-600 text-white">
                {flight.recommendationReason}
              </span>
              {flight.savingsPercent && (
                <span className="inline-block ml-2 text-xs font-semibold px-3 py-1 rounded-full bg-green-600 text-white">
                  {flight.savingsPercent}% OFF
                </span>
              )}
            </div>

            {/* Flight Info */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✈️</span>
                <div className="text-lg font-bold text-gray-900">
                  {flight.origin} → {flight.destination}
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-2">{flight.airline}</div>

              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{format(new Date(flight.departureDate), 'MMM dd')}</span>
                  {flight.returnDate && (
                    <>
                      <span>-</span>
                      <span>{format(new Date(flight.returnDate), 'MMM dd')}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>⏱️ {flight.duration}</span>
                  <span>
                    🛬 {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex items-end justify-between pt-3 border-t border-purple-200">
              <div>
                <div className="text-2xl font-black text-purple-600">
                  ${Math.round(flight.price)}
                </div>
                <div className="text-xs text-gray-500">{flight.currency}</div>
              </div>
              <div className="flex gap-2">
                <AddToWishlistButton
                  flightData={flight}
                  size="sm"
                />
                <Link
                  href={`/flights?origin=${flight.origin}&destination=${flight.destination}&departDate=${flight.departureDate}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors transform group-hover:scale-105"
                >
                  Search
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/flights"
          className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
        >
          Explore more destinations →
        </Link>
      </div>
    </div>
  );
}
