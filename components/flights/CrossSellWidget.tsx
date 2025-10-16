'use client';

import { useState, useEffect } from 'react';
import { Hotel, Car, Bus, Package, TrendingDown } from 'lucide-react';
import { typography, spacing, dimensions } from '@/lib/design-system';

interface CrossSellWidgetProps {
  destination: string;
  arrivalDate: string;
  departureDate: string;
  adults: number;
}

export default function CrossSellWidget({
  destination,
  arrivalDate,
  departureDate,
  adults,
}: CrossSellWidgetProps) {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHotels = async () => {
      if (!destination || !arrivalDate || !departureDate) return;

      try {
        setLoading(true);

        const params = new URLSearchParams({
          cityCode: destination,
          checkInDate: arrivalDate,
          checkOutDate: departureDate,
          adults: adults.toString(),
        });

        const response = await fetch(`/api/hotels?${params.toString()}`);

        if (response.ok) {
          const data = await response.json();
          setHotels(data.data?.slice(0, 3) || []);
        }
      } catch (err) {
        console.error('Error fetching hotels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [destination, arrivalDate, departureDate, adults]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200" style={{ padding: dimensions.card.padding }}>
      <div className="flex items-center gap-2 mb-3">
        <Package className="h-5 w-5 text-blue-600" />
        <h3 className="font-bold text-gray-800" style={{ fontSize: typography.card.title.size }}>Complete Your Trip</h3>
        <span className="ml-auto bg-green-500 text-white font-bold px-2 py-0.5 rounded-full" style={{ fontSize: typography.card.meta.size }}>
          SAVE UP TO 40%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: dimensions.card.gap }}>
        {/* Hotels Bundle */}
        <div className="bg-white rounded-lg border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer group" style={{ padding: spacing.md }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Hotel className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800" style={{ fontSize: typography.card.body.size }}>+ Hotel</h4>
              <p className="text-green-600 font-semibold" style={{ fontSize: typography.card.meta.size }}>Save $120</p>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="bg-gray-200 h-3 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-3/4"></div>
            </div>
          ) : hotels.length > 0 ? (
            <div className="space-y-1">
              <p className="text-gray-600" style={{ fontSize: typography.card.body.size }}>From ${hotels[0]?.offers?.[0]?.price?.total || '99'}/night</p>
              <p className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>{hotels.length} hotels available</p>
            </div>
          ) : (
            <p className="text-gray-600" style={{ fontSize: typography.card.body.size }}>Hotels from $99/night</p>
          )}

          <button className="mt-2 w-full py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors" style={{ fontSize: typography.card.body.size }}>
            Add Hotel
          </button>
        </div>

        {/* Car Rental */}
        <div className="bg-white rounded-lg border-2 border-transparent hover:border-purple-500 transition-all cursor-pointer group" style={{ padding: spacing.md }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Car className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800" style={{ fontSize: typography.card.body.size }}>+ Car Rental</h4>
              <p className="text-green-600 font-semibold" style={{ fontSize: typography.card.meta.size }}>Save $45</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-gray-600" style={{ fontSize: typography.card.body.size }}>From $35/day</p>
            <p className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>Free cancellation</p>
          </div>

          <button className="mt-2 w-full py-1.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors" style={{ fontSize: typography.card.body.size }}>
            Add Car
          </button>
        </div>

        {/* Airport Transfer */}
        <div className="bg-white rounded-lg border-2 border-transparent hover:border-green-500 transition-all cursor-pointer group" style={{ padding: spacing.md }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <Bus className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800" style={{ fontSize: typography.card.body.size }}>+ Transfer</h4>
              <p className="text-green-600 font-semibold" style={{ fontSize: typography.card.meta.size }}>Save $15</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-gray-600" style={{ fontSize: typography.card.body.size }}>From $25</p>
            <p className="text-gray-500" style={{ fontSize: typography.card.meta.size }}>Private or shared</p>
          </div>

          <button className="mt-2 w-full py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors" style={{ fontSize: typography.card.body.size }}>
            Add Transfer
          </button>
        </div>
      </div>

      <div className="mt-3 p-2.5 bg-white rounded-lg border border-blue-200">
        <div className="flex items-center gap-2" style={{ fontSize: typography.card.body.size }}>
          <TrendingDown className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-gray-800">Bundle & Save:</span>
          <span className="text-green-600 font-bold">Up to $180 total savings</span>
          <span className="ml-auto text-gray-500" style={{ fontSize: typography.card.meta.size }}>Limited time offer</span>
        </div>
      </div>
    </div>
  );
}
