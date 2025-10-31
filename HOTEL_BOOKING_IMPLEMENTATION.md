# Hotel Booking System - Complete Implementation Guide

## Overview
This document provides all the code and components needed to complete the hotel booking system for Fly2Any, matching the existing flight search design patterns.

## Files Created

### 1. Components Created
✅ `components/hotels/HotelCard.tsx` - Hotel card with image carousel, ratings, amenities
✅ `components/hotels/HotelFilters.tsx` - Comprehensive filter sidebar

### 2. Components to Create

#### RoomCard.tsx
Location: `components/hotels/RoomCard.tsx`

```typescript
'use client';

import { Users, Bed, Check, X } from 'lucide-react';

export interface RoomCardProps {
  id: string;
  name: string;
  description: string;
  maxGuests: number;
  bedConfiguration: string;
  size: number; // in sq meters
  price: number;
  currency: string;
  amenities: string[];
  cancellationPolicy: 'free' | 'partial' | 'non-refundable';
  onSelect: (id: string) => void;
}

export function RoomCard({
  id,
  name,
  description,
  maxGuests,
  bedConfiguration,
  size,
  price,
  currency,
  amenities,
  cancellationPolicy,
  onSelect,
}: RoomCardProps) {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-lg font-bold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">{currency} {price}</div>
          <div className="text-sm text-gray-600">per night</div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{maxGuests} guests</span>
        </div>
        <div className="flex items-center gap-1">
          <Bed className="w-4 h-4" />
          <span>{bedConfiguration}</span>
        </div>
        <span>{size}m²</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {amenities.map((amenity) => (
          <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            {amenity}
          </span>
        ))}
      </div>

      {cancellationPolicy === 'free' && (
        <div className="flex items-center gap-1 text-sm text-green-600 font-semibold mb-3">
          <Check className="w-4 h-4" />
          Free Cancellation
        </div>
      )}

      <button
        onClick={() => onSelect(id)}
        className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
      >
        Select Room
      </button>
    </div>
  );
}
```

#### HotelGallery.tsx
Location: `components/hotels/HotelGallery.tsx`

```typescript
'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface HotelGalleryProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function HotelGallery({ images, isOpen, onClose, initialIndex = 0 }: HotelGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        onClick={prev}
        className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <img
        src={images[currentIndex]}
        alt="Hotel"
        className="max-w-[90vw] max-h-[90vh] object-contain"
      />

      <button
        onClick={next}
        className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

### 3. Pages to Update/Create

#### Enhanced Hotel Search Page
Location: `app/hotels/search/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users } from 'lucide-react';
import { DateInput } from '@/components/ui/DateInput';

export default function HotelSearchPage() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const handleSearch = () => {
    const params = new URLSearchParams({
      destination,
      checkIn,
      checkOut,
      adults: adults.toString(),
      children: children.toString(),
      rooms: rooms.toString(),
    });
    router.push(\`/hotels/results?\${params.toString()}\`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Hotel
          </h1>
          <p className="text-xl text-gray-600">
            Search and compare hotels worldwide
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Location */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where are you going?"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <DateInput
              label="Check-in"
              value={checkIn}
              onChange={setCheckIn}
              minDate={new Date().toISOString().split('T')[0]}
            />
            <DateInput
              label="Check-out"
              value={checkOut}
              onChange={setCheckOut}
              minDate={checkIn || new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Guests */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Adults</label>
              <input
                type="number"
                min="1"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Children</label>
              <input
                type="number"
                min="0"
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rooms</label>
              <input
                type="number"
                min="1"
                value={rooms}
                onChange={(e) => setRooms(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-center"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            🏨 Search Hotels
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### Enhanced Hotel Results Page
Location: `app/hotels/results/page.tsx` (Replace existing)

```typescript
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HotelCard } from '@/components/hotels/HotelCard';
import HotelFilters, { HotelFiltersType } from '@/components/hotels/HotelFilters';

function HotelResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance'>('price');

  const [filters, setFilters] = useState<HotelFiltersType>({
    priceRange: [0, 1000],
    starRating: [],
    guestRating: 0,
    amenities: [],
    mealPlans: [],
    propertyTypes: [],
    cancellationPolicy: [],
  });

  const searchData = {
    destination: searchParams.get('destination') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    adults: parseInt(searchParams.get('adults') || '2'),
    children: parseInt(searchParams.get('children') || '0'),
    rooms: parseInt(searchParams.get('rooms') || '1'),
  };

  useEffect(() => {
    // Fetch hotels (mock data for now)
    const fetchHotels = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockHotels = [
        {
          id: '1',
          name: 'Grand Plaza Hotel',
          address: '123 Main Street',
          city: searchData.destination,
          rating: 5,
          reviewCount: 1250,
          reviewScore: 9.2,
          pricePerNight: 189,
          currency: 'USD',
          images: ['/hotel1.jpg', '/hotel2.jpg', '/hotel3.jpg'],
          amenities: {
            wifi: true,
            parking: true,
            breakfast: true,
            gym: true,
            pool: true,
            restaurant: true,
          },
          distanceFromCenter: 0.5,
          cancellationPolicy: 'free' as const,
          dealBadge: 'best-value' as const,
        },
        // Add more hotels...
      ];

      setHotels(mockHotels);
      setLoading(false);
    };

    fetchHotels();
  }, [searchParams]);

  const handleSelectHotel = (id: string) => {
    router.push(\`/hotels/\${id}?checkIn=\${searchData.checkIn}&checkOut=\${searchData.checkOut}&adults=\${searchData.adults}&children=\${searchData.children}\`);
  };

  const handleViewDetails = (id: string) => {
    router.push(\`/hotels/\${id}\`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Searching for hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hotels in {searchData.destination}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {searchData.checkIn} - {searchData.checkOut} • {searchData.adults} adults • {searchData.rooms} room(s)
              </p>
            </div>
            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500"
            >
              <option value="price">Lowest Price</option>
              <option value="rating">Highest Rating</option>
              <option value="distance">Closest to Center</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <HotelFilters
              filters={filters}
              onFiltersChange={setFilters}
              hotels={hotels}
            />
          </aside>

          {/* Hotel Cards */}
          <main className="flex-1">
            <div className="space-y-4">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  {...hotel}
                  onSelect={handleSelectHotel}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function HotelResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelResultsContent />
    </Suspense>
  );
}
```

## Remaining Files to Create

### Hotel Details Page
`app/hotels/[id]/page.tsx` - Full hotel page with room selection, gallery, map

### Hotel Booking Flow
`app/hotels/booking/page.tsx` - 3-step booking process reusing flight booking patterns

### Hotel Booking Confirmation
`app/hotels/booking/confirmation/page.tsx` - Similar to flight confirmation

## Integration with Flights

### Flight + Hotel Package Widget
Add to flight results page:

```typescript
<div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200">
  <h3 className="text-xl font-bold text-gray-900 mb-2">Save 20% with Hotel + Flight</h3>
  <p className="text-gray-700 mb-4">Bundle your flight with a hotel and save!</p>
  <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-bold">
    Add Hotel to Booking
  </button>
</div>
```

## Summary of Completed Work

### Components Created:
1. ✅ **HotelCard.tsx** - Full-featured hotel card with:
   - Image carousel with navigation
   - Star ratings and review scores
   - Amenity icons
   - Pricing display
   - Cancellation policy badges
   - Deal badges (Best Value, Popular, Limited Deal)
   - Favorite and share buttons

2. ✅ **HotelFilters.tsx** - Comprehensive filter sidebar with:
   - Price range slider
   - Star rating checkboxes
   - Guest rating selection
   - Amenities filters (WiFi, Parking, Breakfast, Pool, Gym, Spa, Restaurant, Shuttle)
   - Meal plan filters (Room Only, Breakfast, Half Board, Full Board, All Inclusive)
   - Property type filters (Hotel, Resort, Apartment, Villa, Guesthouse)
   - Cancellation policy filters
   - Multi-language support (EN/PT/ES)

### Next Steps:
1. Create remaining components (RoomCard, HotelGallery)
2. Update hotel search and results pages
3. Build hotel details page
4. Create booking flow
5. Add flight+hotel package integration

All code follows your existing design patterns from the flight booking system!
