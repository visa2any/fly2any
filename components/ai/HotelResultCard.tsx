'use client';

import { useRouter } from 'next/navigation';
import { Star, MapPin, Wifi, Check, Users, Bed } from 'lucide-react';

interface HotelSearchResult {
  id: string;
  name: string;
  rating: number;
  address: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  amenities: string[];
  distance: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  availability: string;
  image?: string;
}

interface Props {
  hotel: HotelSearchResult;
  onSelect?: (hotelId: string) => void;
}

export function HotelResultCard({ hotel, onSelect }: Props) {
  const router = useRouter();

  const handleSelect = () => {
    if (onSelect) {
      onSelect(hotel.id);
    } else {
      // Navigate to hotel search results with pre-filled params
      const params = new URLSearchParams({
        destination: hotel.address.split(',')[0] || hotel.name.split(' ')[1] || 'City',
        checkIn: hotel.checkIn,
        checkOut: hotel.checkOut,
        adults: hotel.guests.toString(),
        rooms: hotel.rooms.toString(),
      });
      router.push(`/hotels/results?${params.toString()}`);
    }
  };

  // Calculate number of nights
  const nights = Math.ceil(
    (new Date(hotel.checkOut).getTime() - new Date(hotel.checkIn).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  // Format dates for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-primary-400 hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <div className="flex gap-4">
        {/* Hotel Image */}
        {hotel.image ? (
          <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <Bed className="w-10 h-10 text-white" />
          </div>
        )}

        {/* Hotel Info */}
        <div className="flex-1 min-w-0">
          {/* Header: Name + Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-primary-600 transition-colors">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0 bg-primary-600 text-white px-2 py-1 rounded-md">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-sm font-semibold">{hotel.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{hotel.address}</span>
            {hotel.distance && (
              <span className="text-xs text-gray-500 ml-1">• {hotel.distance}</span>
            )}
          </div>

          {/* Dates + Guests */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-green-600" />
              <span>{formatDate(hotel.checkIn)}</span>
            </div>
            <span>→</span>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-red-600" />
              <span>{formatDate(hotel.checkOut)}</span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Users className="w-3 h-3" />
              <span>{hotel.guests} guest{hotel.guests > 1 ? 's' : ''}</span>
            </div>
            <span>• {nights} night{nights > 1 ? 's' : ''}</span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-3">
            {hotel.amenities.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {amenity.toLowerCase().includes('wifi') && <Wifi className="w-3 h-3" />}
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 4 && (
              <span className="text-xs text-gray-500">
                +{hotel.amenities.length - 4} more
              </span>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-gray-600">
                <span className="text-2xl font-bold text-gray-900">
                  ${hotel.totalPrice}
                </span>
                <span className="text-gray-600"> total</span>
              </div>
              <div className="text-xs text-gray-500">
                ${hotel.pricePerNight}/night
              </div>
            </div>

            <button
              onClick={handleSelect}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              Select Hotel →
            </button>
          </div>

          {/* Availability badge */}
          {hotel.availability && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                {hotel.availability}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
