'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Destination {
  id: string;
  city: string;
  country: string;
  region: string;
  imageUrl: string;
  priceFrom: number;
  currency: string;
  description: string;
  tags: string[];
  trending?: boolean;
  seasonal?: boolean;
  bestMonths?: string[];
  popularActivities?: string[];
}

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({ destination }: DestinationCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams({
      destination: destination.city,
      adults: '1',
    });
    window.location.href = `/flights?${params.toString()}`;
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gray-200">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl animate-pulse">🌍</div>
          </div>
        )}
        <img
          src={destination.imageUrl}
          alt={destination.city}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {destination.trending && (
            <span className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <span>🔥</span>
              Trending
            </span>
          )}
          {destination.seasonal && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <span>🌸</span>
              Seasonal
            </span>
          )}
        </div>

        {/* Location */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-3xl font-black text-white mb-1 drop-shadow-2xl">
            {destination.city}
          </h3>
          <p className="text-white/90 text-sm font-medium drop-shadow-lg flex items-center gap-1">
            <span>📍</span>
            {destination.country}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {destination.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {destination.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Best Time to Visit */}
        {destination.bestMonths && destination.bestMonths.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">🌤️</span>
              <div>
                <div className="text-xs text-gray-600">Best Time to Visit</div>
                <div className="font-semibold text-gray-900">
                  {destination.bestMonths.join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Popular Activities */}
        {destination.popularActivities && destination.popularActivities.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-600 mb-2">Popular Activities:</div>
            <div className="flex flex-wrap gap-2">
              {destination.popularActivities.slice(0, 4).map((activity, index) => (
                <span key={index} className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500 mb-1">Flights from</div>
            <div className="text-3xl font-black text-blue-600">
              ${destination.priceFrom}
            </div>
            <div className="text-xs text-gray-500">per person</div>
          </div>
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-md"
          >
            Explore
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Link
            href={`/explore/${destination.id}`}
            className="flex-1 text-center border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
          >
            View Guide
          </Link>
          <button
            onClick={handleSearch}
            className="flex-1 text-center border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Check Prices
          </button>
        </div>
      </div>
    </div>
  );
}
