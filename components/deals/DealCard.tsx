'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddToWishlistButton from '@/components/search/AddToWishlistButton';

interface Deal {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: number;
  originalPrice: number;
  currency: string;
  airline: string;
  airlineLogo?: string;
  duration: string;
  stops: number;
  dealType: 'flash' | 'lastMinute' | 'seasonal' | 'featured';
  expiresAt: string;
  savingsPercent: number;
  dealScore: number;
  imageUrl?: string;
  seatsLeft?: number;
}

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(deal.expiresAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deal.expiresAt]);

  const dealTypeConfig = {
    flash: { label: 'Flash Sale', color: 'bg-red-500', icon: '⚡' },
    lastMinute: { label: 'Last Minute', color: 'bg-orange-500', icon: '🔥' },
    seasonal: { label: 'Seasonal', color: 'bg-green-500', icon: '🌸' },
    featured: { label: 'Featured', color: 'bg-purple-500', icon: '⭐' },
  };

  const config = dealTypeConfig[deal.dealType];

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1">
      {/* Image Header */}
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
        {deal.imageUrl ? (
          <img
            src={deal.imageUrl}
            alt={deal.destination}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl">
            ✈️
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* Deal Type Badge */}
        <div className={`absolute top-4 left-4 ${config.color} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg`}>
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </div>

        {/* Savings Badge */}
        <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-black text-lg shadow-lg animate-pulse">
          {deal.savingsPercent}% OFF
        </div>

        {/* Destination */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
            {deal.destination}
          </h3>
          <p className="text-white/90 text-sm">from {deal.origin}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Timer and Urgency */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            <div>
              <div className="text-xs text-gray-500">Expires in</div>
              <div className="font-bold text-red-600">{timeLeft}</div>
            </div>
          </div>
          {deal.seatsLeft && deal.seatsLeft <= 10 && (
            <div className="flex items-center gap-2 text-orange-600">
              <span className="text-xl">🔥</span>
              <div>
                <div className="text-xs">Only</div>
                <div className="font-bold">{deal.seatsLeft} seats left</div>
              </div>
            </div>
          )}
        </div>

        {/* Flight Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {deal.airlineLogo ? (
                <img src={deal.airlineLogo} alt={deal.airline} className="h-6 w-6" />
              ) : (
                <span className="text-lg">✈️</span>
              )}
              <span className="text-sm text-gray-700 font-medium">{deal.airline}</span>
            </div>
            <span className="text-sm text-gray-600">{deal.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>🛬</span>
            <span>{deal.stops === 0 ? 'Nonstop' : `${deal.stops} stop${deal.stops > 1 ? 's' : ''}`}</span>
          </div>
        </div>

        {/* Deal Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Deal Score</span>
            <span className="text-sm font-bold text-blue-600">{deal.dealScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${deal.dealScore}%` }}
            ></div>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500 line-through">
              ${deal.originalPrice}
            </div>
            <div className="text-3xl font-black text-blue-600">
              ${deal.price}
            </div>
            <div className="text-xs text-green-600 font-semibold">
              Save ${deal.originalPrice - deal.price}
            </div>
          </div>
          <AddToWishlistButton
            flightData={{
              id: deal.id,
              origin: deal.origin,
              destination: deal.destination,
              departureDate: deal.departureDate,
              returnDate: deal.returnDate,
              price: deal.price,
              currency: deal.currency,
              airline: deal.airline,
              duration: deal.duration,
              stops: deal.stops,
            }}
            size="lg"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/flights/book?dealId=${deal.id}`}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-bold text-center transition-all transform hover:scale-105 shadow-md"
          >
            Book Now
          </Link>
          <Link
            href={`/flights/details?id=${deal.id}`}
            className="px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
