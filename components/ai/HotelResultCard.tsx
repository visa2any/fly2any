'use client';

import { MapPin, Star, Wifi, Coffee, Dumbbell, Car } from 'lucide-react';

interface HotelResult {
  id: string;
  name: string;
  rating: number;
  address: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  amenities: string[];
  distance?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  availability: string;
}

interface HotelResultCardProps {
  hotel: HotelResult;
  onSelect: (hotelId: string) => void;
  compact?: boolean;
  onHotelSelected?: (hotelId: string, totalPrice: number) => void;
}

export function HotelResultCard({ hotel, onSelect, compact = true, onHotelSelected }: HotelResultCardProps) {
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const nights = Math.ceil(
    (new Date(hotel.checkOut).getTime() - new Date(hotel.checkIn).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-50';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-50';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-3 h-3" />;
    if (lower.includes('coffee') || lower.includes('breakfast')) return <Coffee className="w-3 h-3" />;
    if (lower.includes('gym') || lower.includes('fitness')) return <Dumbbell className="w-3 h-3" />;
    if (lower.includes('parking') || lower.includes('car')) return <Car className="w-3 h-3" />;
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all duration-200">
      {/* Header: Hotel Name + Rating */}
      <div className="flex items-start justify-between px-2.5 py-2 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-xs text-gray-900 truncate">{hotel.name}</div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <div className="text-[9px] text-gray-500 truncate">{hotel.address}</div>
          </div>
          {hotel.distance && (
            <div className="text-[8px] text-gray-400 mt-0.5">{hotel.distance}</div>
          )}
        </div>
        <div className="ml-2 flex-shrink-0">
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold ${getRatingColor(hotel.rating)}`}>
            <Star className="w-2.5 h-2.5 fill-current" />
            <span className="text-[10px]">{hotel.rating}</span>
          </div>
        </div>
      </div>

      {/* Stay Details */}
      <div className="px-2.5 py-2 bg-blue-50/30">
        <div className="flex items-center justify-between text-[9px]">
          <div className="text-gray-600">
            <span className="font-semibold text-gray-900">{formatDate(hotel.checkIn)}</span>
            <span className="mx-1">→</span>
            <span className="font-semibold text-gray-900">{formatDate(hotel.checkOut)}</span>
          </div>
          <div className="text-gray-600">
            <span className="font-semibold text-gray-900">{nights}</span> night{nights > 1 ? 's' : ''}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-600">
          <span>{hotel.guests} guest{hotel.guests > 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{hotel.rooms} room{hotel.rooms > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Amenities */}
      {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="px-2.5 py-1.5 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 4).map((amenity, i) => (
              <div
                key={i}
                className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-50 rounded text-[8px] text-gray-600"
              >
                {getAmenityIcon(amenity)}
                <span className="truncate max-w-[80px]">{amenity}</span>
              </div>
            ))}
            {hotel.amenities.length > 4 && (
              <div className="flex items-center px-1.5 py-0.5 text-[8px] text-gray-500">
                +{hotel.amenities.length - 4} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price + Action */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-gray-100 bg-white">
        <div className="text-left">
          <div className="text-base font-bold text-primary-600">
            {hotel.currency} {hotel.totalPrice.toLocaleString()}
          </div>
          <div className="text-[9px] text-gray-500">
            ${hotel.pricePerNight}/night • {nights} nights
          </div>
        </div>
        <button
          onClick={() => {
            if (onHotelSelected) {
              onHotelSelected(hotel.id, hotel.totalPrice);
            }
            onSelect(hotel.id);
          }}
          className="px-3 py-1 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-bold rounded-md transition-all active:scale-95 text-[11px] whitespace-nowrap"
        >
          Select →
        </button>
      </div>
    </div>
  );
}
