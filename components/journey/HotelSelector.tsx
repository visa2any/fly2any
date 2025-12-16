'use client';

/**
 * Hotel Selector Modal
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Building2,
  Star,
  MapPin,
  Wifi,
  UtensilsCrossed,
  Car,
  Sparkles,
  Filter,
  SortAsc,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { JourneyHotel } from '@/lib/journey/types';
import { JourneyAPI, HotelSearchResult, JourneyHotelSearchParams } from '@/lib/journey/services/JourneyAPI';

// ============================================================================
// TYPES
// ============================================================================

interface HotelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (hotel: JourneyHotel) => void;
  searchParams: JourneyHotelSearchParams;
}

type SortOption = 'price' | 'rating' | 'stars';

// ============================================================================
// COMPONENT
// ============================================================================

export function HotelSelector({
  isOpen,
  onClose,
  onSelect,
  searchParams,
}: HotelSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<HotelSearchResult[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelSearchResult | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minStars: 0,
    maxPrice: 0,
    amenities: [] as string[],
  });

  // Search hotels on open
  useEffect(() => {
    if (isOpen && searchParams) {
      searchHotels();
    }
  }, [isOpen, searchParams]);

  const searchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const { results } = await JourneyAPI.searchHotels(searchParams);
      setHotels(results);
      // Set max price filter
      if (results.length > 0) {
        const maxPrice = Math.max(...results.map(h => h.price.amount));
        setFilters(prev => ({ ...prev, maxPrice }));
      }
    } catch (error) {
      console.error('Hotel search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Sort and filter hotels
  const sortedHotels = React.useMemo(() => {
    let filtered = [...hotels];

    // Apply filters
    if (filters.minStars > 0) {
      filtered = filtered.filter(h => h.stars >= filters.minStars);
    }
    if (filters.maxPrice > 0) {
      filtered = filtered.filter(h => h.price.amount <= filters.maxPrice);
    }

    // Sort
    switch (sortBy) {
      case 'price':
        return filtered.sort((a, b) => a.price.amount - b.price.amount);
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'stars':
        return filtered.sort((a, b) => b.stars - a.stars);
      default:
        return filtered;
    }
  }, [hotels, sortBy, filters]);

  // Calculate nights
  const nights = React.useMemo(() => {
    const start = new Date(searchParams.checkIn).getTime();
    const end = new Date(searchParams.checkOut).getTime();
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [searchParams]);

  // Handle selection
  const handleSelect = () => {
    if (!selectedHotel) return;
    const journeyHotel = JourneyAPI.toJourneyHotel(selectedHotel);
    onSelect(journeyHotel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D63A35]/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#D63A35]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Select Hotel</h2>
              <p className="text-xs text-gray-500">
                {searchParams.destination} • {nights} night{nights !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Sort & Filter Bar */}
        <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showFilters ? 'bg-[#D63A35] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm border-0 bg-transparent text-gray-600 focus:ring-0 cursor-pointer"
            >
              <option value="price">Lowest Price</option>
              <option value="rating">Highest Rating</option>
              <option value="stars">Most Stars</option>
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 space-y-3">
            {/* Star Rating Filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Minimum Stars</label>
              <div className="flex gap-2">
                {[0, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setFilters(f => ({ ...f, minStars: stars }))}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filters.minStars === stars
                        ? 'bg-[#D63A35] text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {stars === 0 ? 'Any' : (
                      <>
                        {stars}
                        <Star className="w-3 h-3 fill-current" />
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                Max Price: ${filters.maxPrice.toLocaleString()}
              </label>
              <input
                type="range"
                min={0}
                max={Math.max(...hotels.map(h => h.price.amount), 1000)}
                value={filters.maxPrice}
                onChange={(e) => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))}
                className="w-full accent-[#D63A35]"
              />
            </div>
          </div>
        )}

        {/* Hotel List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#D63A35] rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Searching hotels...</p>
            </div>
          ) : sortedHotels.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No hotels found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            sortedHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                nights={nights}
                isSelected={selectedHotel?.id === hotel.id}
                onSelect={() => setSelectedHotel(hotel)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {sortedHotels.length} hotel{sortedHotels.length !== 1 ? 's' : ''} found
          </p>
          <button
            onClick={handleSelect}
            disabled={!selectedHotel}
            className="h-10 px-6 bg-gradient-to-r from-[#D63A35] to-[#C7342F] hover:from-[#C7342F] hover:to-[#B12F2B] text-white font-semibold rounded-xl shadow-lg shadow-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Select Hotel
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOTEL CARD COMPONENT
// ============================================================================

interface HotelCardProps {
  hotel: HotelSearchResult;
  nights: number;
  isSelected: boolean;
  onSelect: () => void;
}

function HotelCard({ hotel, nights, isSelected, onSelect }: HotelCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const images = hotel.images.length > 0 ? hotel.images : [hotel.thumbnail].filter(Boolean);

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border-2 transition-all text-left overflow-hidden ${
        isSelected
          ? 'border-[#D63A35] bg-red-50/50 shadow-lg shadow-red-100'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-40 h-32 sm:h-auto bg-gray-100 flex-shrink-0">
          {images.length > 0 ? (
            <>
              <img
                src={images[imageIndex] || '/placeholder-hotel.jpg'}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-1 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageIndex((i) => (i - 1 + images.length) % images.length);
                    }}
                    className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageIndex((i) => (i + 1) % images.length);
                    }}
                    className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-10 h-10 text-gray-300" />
            </div>
          )}

          {/* Stars Badge */}
          <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-white/90 px-1.5 py-0.5 rounded-full">
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{hotel.name}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {hotel.city}
                {hotel.distance && ` • ${hotel.distance.toFixed(1)}km from center`}
              </p>
            </div>

            {/* Rating */}
            {hotel.rating > 0 && (
              <div className="flex-shrink-0 text-right">
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  <span className="font-bold text-sm">{hotel.rating.toFixed(1)}</span>
                </div>
                {hotel.reviewCount > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">{hotel.reviewCount} reviews</p>
                )}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-3 mt-2">
            {hotel.amenities.slice(0, 4).map((amenity, i) => (
              <span key={i} className="text-xs text-gray-500 flex items-center gap-1">
                {amenity.toLowerCase().includes('wifi') && <Wifi className="w-3 h-3" />}
                {amenity.toLowerCase().includes('breakfast') && <UtensilsCrossed className="w-3 h-3" />}
                {amenity.toLowerCase().includes('parking') && <Car className="w-3 h-3" />}
                {amenity}
              </span>
            ))}
          </div>

          {/* Price & Features */}
          <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs">
              {hotel.breakfastIncluded && (
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Breakfast</span>
              )}
              {hotel.refundable && (
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Free cancellation</span>
              )}
            </div>

            <div className="text-right">
              <p className="font-bold text-lg text-gray-900">
                ${hotel.price.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                ${Math.round(hotel.price.perNight).toLocaleString()}/night • {nights} night{nights !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default HotelSelector;
