'use client';

/**
 * Timeline Hotel Card
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 */

import React from 'react';
import { Building2, Star, Moon, CheckCircle2, Circle, MapPin } from 'lucide-react';
import { JourneyDaySegment, JourneyHotel } from '@/lib/journey/types';

interface TimelineHotelCardProps {
  segment: JourneyDaySegment;
  onClick?: () => void;
}

export function TimelineHotelCard({ segment, onClick }: TimelineHotelCardProps) {
  const hotel = segment.hotel;

  // Calculate nights from check-in/out
  const calculateNights = (): number => {
    if (!hotel?.checkIn || !hotel?.checkOut) return 1;
    const start = new Date(hotel.checkIn).getTime();
    const end = new Date(hotel.checkOut).getTime();
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
        hotel?.status === 'booked'
          ? 'border-green-200/60 bg-green-50/50'
          : hotel
          ? 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
          : 'border-dashed border-gray-200 bg-gray-50/50 hover:border-[#D63A35]/40 hover:bg-[#D63A35]/5'
      }`}
    >
      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        {hotel?.status === 'booked' ? (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Booked
          </span>
        ) : hotel?.status === 'selected' ? (
          <span className="flex items-center gap-1 text-xs text-[#D63A35] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selected
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-[#D63A35]">
            <Circle className="w-3.5 h-3.5" />
            {hotel ? 'Pending' : 'Select'}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3">
        {/* Thumbnail or Icon */}
        {hotel?.thumbnail || hotel?.images?.[0] ? (
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <img
              src={hotel.thumbnail || hotel.images?.[0]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
            hotel ? 'bg-purple-100' : 'bg-gray-100'
          }`}>
            <Building2 className={`w-6 h-6 ${hotel ? 'text-purple-600' : 'text-gray-400'}`} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {hotel ? (
            <>
              <h4 className="font-medium text-gray-900 truncate pr-16">{hotel.name}</h4>

              {/* Address */}
              {hotel.address && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {hotel.address}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mt-1.5">
                {hotel.stars > 0 && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: hotel.stars }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
                {hotel.rating > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                    {hotel.rating.toFixed(1)}
                  </span>
                )}
                {hotel.reviewCount > 0 && (
                  <span className="text-xs text-gray-400">
                    ({hotel.reviewCount} reviews)
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                {hotel.breakfastIncluded && (
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Breakfast
                  </span>
                )}
                {hotel.refundable && (
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Free cancellation
                  </span>
                )}
              </div>

              {/* Nights & Price */}
              <div className="mt-2 flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Moon className="w-3.5 h-3.5" />
                  <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                  {hotel.roomType && <span>• {hotel.roomType}</span>}
                </div>
                {hotel.price && (
                  <span className="font-semibold text-gray-900">
                    {hotel.price.currency} {hotel.price.amount.toLocaleString()}
                  </span>
                )}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="py-3">
              <p className="font-medium text-gray-700 group-hover:text-[#D63A35]">
                Select Hotel
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Click to browse available hotels
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimelineHotelCard;
