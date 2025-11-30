'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Star,
  MapPin,
  Check,
  Minus,
  Plus,
  ArrowRight,
  Award,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Utensils,
  Coffee,
  Sparkles,
  Trophy,
  Scale,
} from 'lucide-react';

interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  stars: number;
  rating: number;
  reviewScore: number;
  reviewCount: number;
  image: string;
  thumbnail: string;
  lowestPrice?: number;
  lowestPricePerNight?: number;
  currency: string;
  amenities?: string[];
  latitude: number;
  longitude: number;
  description?: string;
}

interface HotelCompareProps {
  hotels: Hotel[];
  onRemove: (hotelId: string) => void;
  onClose: () => void;
  onBook: (hotel: Hotel) => void;
  maxCompare?: number;
  className?: string;
}

// Amenity icon mapping
const amenityIcons: Record<string, React.ElementType> = {
  'wifi': Wifi,
  'free wifi': Wifi,
  'parking': Car,
  'free parking': Car,
  'pool': Waves,
  'swimming pool': Waves,
  'gym': Dumbbell,
  'fitness': Dumbbell,
  'restaurant': Utensils,
  'breakfast': Coffee,
  'spa': Sparkles,
};

function getAmenityIcon(amenity: string): React.ElementType | null {
  const lowerAmenity = amenity.toLowerCase();
  for (const [key, icon] of Object.entries(amenityIcons)) {
    if (lowerAmenity.includes(key)) {
      return icon;
    }
  }
  return null;
}

export function HotelCompare({
  hotels,
  onRemove,
  onClose,
  onBook,
  maxCompare = 3,
  className = '',
}: HotelCompareProps) {
  const [compareHotels, setCompareHotels] = useState<Hotel[]>(hotels.slice(0, maxCompare));
  const [highlightBest, setHighlightBest] = useState(true);

  // Find the best hotel in each category
  const getBestValues = useCallback(() => {
    if (compareHotels.length < 2) return {};

    const best: Record<string, string> = {};

    // Best price
    const priceHotel = compareHotels.reduce((min, h) =>
      (h.lowestPricePerNight || Infinity) < (min.lowestPricePerNight || Infinity) ? h : min
    );
    if (priceHotel.lowestPricePerNight) best.price = priceHotel.id;

    // Best rating
    const ratingHotel = compareHotels.reduce((max, h) =>
      (h.reviewScore || 0) > (max.reviewScore || 0) ? h : max
    );
    if (ratingHotel.reviewScore) best.rating = ratingHotel.id;

    // Most reviews
    const reviewHotel = compareHotels.reduce((max, h) =>
      (h.reviewCount || 0) > (max.reviewCount || 0) ? h : max
    );
    if (reviewHotel.reviewCount) best.reviews = reviewHotel.id;

    // Most amenities
    const amenityHotel = compareHotels.reduce((max, h) =>
      (h.amenities?.length || 0) > (max.amenities?.length || 0) ? h : max
    );
    if (amenityHotel.amenities?.length) best.amenities = amenityHotel.id;

    return best;
  }, [compareHotels]);

  const bestValues = getBestValues();

  // Get all unique amenities across hotels
  const allAmenities = Array.from(
    new Set(compareHotels.flatMap(h => h.amenities || []))
  ).slice(0, 15);

  // Calculate overall winner
  const getOverallWinner = useCallback(() => {
    if (compareHotels.length < 2) return null;

    const scores: Record<string, number> = {};
    compareHotels.forEach(h => {
      scores[h.id] = 0;
      if (bestValues.price === h.id) scores[h.id] += 2;
      if (bestValues.rating === h.id) scores[h.id] += 2;
      if (bestValues.reviews === h.id) scores[h.id] += 1;
      if (bestValues.amenities === h.id) scores[h.id] += 1;
    });

    const winner = Object.entries(scores).reduce((max, [id, score]) =>
      score > max[1] ? [id, score] : max
    , ['', 0]);

    return winner[1] > 0 ? winner[0] : null;
  }, [compareHotels, bestValues]);

  const overallWinner = getOverallWinner();

  const handleRemove = (hotelId: string) => {
    setCompareHotels(prev => prev.filter(h => h.id !== hotelId));
    onRemove(hotelId);
  };

  if (compareHotels.length === 0) {
    return (
      <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ${className}`}>
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <Scale className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Hotels to Compare</h3>
          <p className="text-gray-500 mb-4">Add hotels to compare by clicking the compare button on hotel cards.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 overflow-hidden ${className}`}>
      <div className="bg-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Compare Hotels</h2>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-sm rounded-full">
              {compareHotels.length} hotels
            </span>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={highlightBest}
                onChange={(e) => setHighlightBest(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Highlight best values
            </label>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Compare Content */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Hotel Cards Row */}
            <div className="grid gap-4 p-6" style={{ gridTemplateColumns: `repeat(${compareHotels.length}, minmax(300px, 1fr))` }}>
              {compareHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                    highlightBest && overallWinner === hotel.id
                      ? 'border-yellow-400 ring-2 ring-yellow-200'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Winner Badge */}
                  {highlightBest && overallWinner === hotel.id && (
                    <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold rounded-full flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      Best Overall
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(hotel.id)}
                    className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 hover:bg-red-100 rounded-full shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                  </button>

                  {/* Hotel Image */}
                  <div className="relative h-48">
                    <Image
                      src={hotel.image || hotel.thumbnail || '/placeholder-hotel.jpg'}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                    />
                    {/* Stars */}
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 rounded-full flex items-center gap-1">
                      {Array.from({ length: hotel.stars || 0 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>

                  {/* Hotel Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{hotel.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {hotel.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Rows */}
            <div className="px-6 pb-6 space-y-2">
              {/* Price Row */}
              <div className="grid gap-4 items-center" style={{ gridTemplateColumns: `repeat(${compareHotels.length}, minmax(300px, 1fr))` }}>
                {compareHotels.map((hotel) => (
                  <div
                    key={`price-${hotel.id}`}
                    className={`p-4 rounded-lg ${
                      highlightBest && bestValues.price === hotel.id
                        ? 'bg-green-50 border-2 border-green-300'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Price per night</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ${Math.round(hotel.lowestPricePerNight || 0)}
                      </span>
                      {highlightBest && bestValues.price === hotel.id && (
                        <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                          <Award className="w-3 h-3" />
                          Best Price
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rating Row */}
              <div className="grid gap-4 items-center" style={{ gridTemplateColumns: `repeat(${compareHotels.length}, minmax(300px, 1fr))` }}>
                {compareHotels.map((hotel) => (
                  <div
                    key={`rating-${hotel.id}`}
                    className={`p-4 rounded-lg ${
                      highlightBest && bestValues.rating === hotel.id
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Guest Rating</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {(hotel.reviewScore || 0).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">/ 10</span>
                      {highlightBest && bestValues.rating === hotel.id && (
                        <span className="text-xs font-medium text-blue-600 flex items-center gap-0.5">
                          <Award className="w-3 h-3" />
                          Top Rated
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {hotel.reviewCount?.toLocaleString() || 0} reviews
                    </div>
                  </div>
                ))}
              </div>

              {/* Amenities Row */}
              <div className="bg-white rounded-lg border p-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">Amenities</div>
                {allAmenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="grid gap-4 py-2 border-t first:border-t-0"
                    style={{ gridTemplateColumns: `repeat(${compareHotels.length}, minmax(300px, 1fr))` }}
                  >
                    {compareHotels.map((hotel) => {
                      const hasAmenity = hotel.amenities?.some(a =>
                        a.toLowerCase().includes(amenity.toLowerCase())
                      );
                      const Icon = getAmenityIcon(amenity);

                      return (
                        <div
                          key={`${amenity}-${hotel.id}`}
                          className="flex items-center gap-2"
                        >
                          {hasAmenity ? (
                            <>
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-700 flex items-center gap-1.5">
                                {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                                {amenity}
                              </span>
                            </>
                          ) : (
                            <>
                              <Minus className="w-4 h-4 text-gray-300" />
                              <span className="text-sm text-gray-400">{amenity}</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid gap-4 pt-4" style={{ gridTemplateColumns: `repeat(${compareHotels.length}, minmax(300px, 1fr))` }}>
                {compareHotels.map((hotel) => (
                  <button
                    key={`book-${hotel.id}`}
                    onClick={() => onBook(hotel)}
                    className={`py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                      highlightBest && overallWinner === hotel.id
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Book Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating compare bar for hotel listings
interface CompareBarProps {
  selectedHotels: Hotel[];
  onCompare: () => void;
  onClear: () => void;
  maxCompare?: number;
}

export function CompareBar({
  selectedHotels,
  onCompare,
  onClear,
  maxCompare = 3,
}: CompareBarProps) {
  if (selectedHotels.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-white rounded-full shadow-2xl border border-gray-200 px-4 py-3 flex items-center gap-4">
        {/* Hotel Thumbnails */}
        <div className="flex -space-x-2">
          {selectedHotels.slice(0, 3).map((hotel, index) => (
            <div
              key={hotel.id}
              className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
              style={{ zIndex: 3 - index }}
            >
              <Image
                src={hotel.thumbnail || hotel.image || '/placeholder-hotel.jpg'}
                alt={hotel.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="text-sm">
          <span className="font-semibold">{selectedHotels.length}</span>
          <span className="text-gray-500"> of {maxCompare} selected</span>
        </div>

        <button
          onClick={onCompare}
          disabled={selectedHotels.length < 2}
          className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Scale className="w-4 h-4" />
          Compare
        </button>

        <button
          onClick={onClear}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export default HotelCompare;
