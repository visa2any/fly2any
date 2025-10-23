'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingDown } from 'lucide-react';
import { typography, spacing, dimensions } from '@/lib/design-system';

interface DatePrice {
  type: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: {
    total: string;
  };
}

interface CheapestDatesProps {
  origin: string;
  destination: string;
  onSelectDate?: (departureDate: string, returnDate?: string) => void;
}

export default function CheapestDates({ origin, destination, onSelectDate }: CheapestDatesProps) {
  const [dates, setDates] = useState<DatePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceMessage, setServiceMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!origin || !destination) return;

    const fetchCheapestDates = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          origin,
          destination,
          viewBy: 'DATE',
        });

        const response = await fetch(`/api/cheapest-dates?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch cheapest dates');
        }

        const data = await response.json();
        setDates(data.data || []);

        // Capture service messages (e.g., when service is unavailable)
        if (data.meta?.message && data.data?.length === 0) {
          setServiceMessage(data.meta.message);
        } else {
          setServiceMessage(null);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching cheapest dates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCheapestDates();
  }, [origin, destination]);

  if (!origin || !destination) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md" style={{ padding: dimensions.card.padding }}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold" style={{ fontSize: typography.card.title.size }}>Price Calendar</h3>
        </div>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-700">
        <p style={{ fontSize: typography.card.body.size }}>Price calendar temporarily unavailable</p>
      </div>
    );
  }

  // Show service message if available (e.g., service unavailable in test environment)
  if (serviceMessage) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="h-4 w-4 text-blue-600" />
          <h4 className="font-semibold text-blue-900" style={{ fontSize: typography.card.title.size }}>Price Calendar</h4>
        </div>
        <p className="text-blue-700" style={{ fontSize: typography.card.body.size }}>{serviceMessage}</p>
      </div>
    );
  }

  if (dates.length === 0) {
    return null;
  }

  // Find the cheapest price for comparison
  const prices = dates.map((d) => parseFloat(d.price.total));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div className="bg-white rounded-lg shadow-md" style={{ padding: dimensions.card.padding }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-green-600" />
          <h3 className="font-semibold" style={{ fontSize: typography.card.title.size }}>Find the Cheapest Dates</h3>
        </div>
        <div className="text-gray-500" style={{ fontSize: typography.card.body.size }}>
          Best: <span className="font-bold text-green-600">${minPrice.toFixed(0)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7" style={{ gap: spacing.sm }}>
        {dates.slice(0, 21).map((datePrice, index) => {
          const price = parseFloat(datePrice.price.total);
          const isLowest = price === minPrice;
          const priceRange = maxPrice - minPrice;
          const pricePercentage = priceRange > 0 ? ((price - minPrice) / priceRange) * 100 : 0;

          // Color based on price
          let bgColor = 'bg-green-50 border-green-300';
          let textColor = 'text-green-700';

          if (pricePercentage > 70) {
            bgColor = 'bg-red-50 border-red-300';
            textColor = 'text-red-700';
          } else if (pricePercentage > 40) {
            bgColor = 'bg-yellow-50 border-yellow-300';
            textColor = 'text-yellow-700';
          }

          const date = new Date(datePrice.departureDate);

          return (
            <button
              key={index}
              onClick={() => onSelectDate?.(datePrice.departureDate, datePrice.returnDate)}
              className={`relative p-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md hover:scale-105 ${bgColor} ${
                isLowest ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {isLowest && (
                <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white font-bold px-1.5 py-0.5 rounded-full" style={{ fontSize: typography.card.meta.size }}>
                  BEST
                </div>
              )}

              <div className="text-center">
                <div className="text-gray-600 mb-0.5" style={{ fontSize: typography.card.meta.size }}>
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="font-bold mb-0.5" style={{ fontSize: typography.card.title.size }}>
                  {date.toLocaleDateString('en-US', { day: 'numeric' })}
                </div>
                <div className="text-gray-600 mb-1" style={{ fontSize: typography.card.meta.size }}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`font-bold ${textColor} flex items-center justify-center gap-0.5`} style={{ fontSize: typography.card.body.size }}>
                  <DollarSign className="h-3 w-3" />
                  {price.toFixed(0)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-center text-gray-500" style={{ fontSize: typography.card.meta.size }}>
        <p>💡 Prices are approximate and may change. Click a date to search flights.</p>
      </div>
    </div>
  );
}
