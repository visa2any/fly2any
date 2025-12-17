'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Star, Clock, Users, MapPin, Heart, Loader2, ArrowLeft,
  SlidersHorizontal, ChevronDown, Globe
} from 'lucide-react';

interface Tour {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price?: { amount: string; currencyCode: string };
  pictures?: string[];
  rating?: number;
  minimumDuration?: string;
  geoCode?: { latitude: number; longitude: number };
  bookingLink?: string; // Provider URL for booking
  self?: { href: string }; // API self-link
}

// City coordinates for search
const CITY_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  paris: { lat: 48.8566, lng: 2.3522, name: 'Paris' },
  rome: { lat: 41.9028, lng: 12.4964, name: 'Rome' },
  barcelona: { lat: 41.3851, lng: 2.1734, name: 'Barcelona' },
  london: { lat: 51.5074, lng: -0.1278, name: 'London' },
  newyork: { lat: 40.7128, lng: -74.0060, name: 'New York' },
  nyc: { lat: 40.7128, lng: -74.0060, name: 'New York' },
  tokyo: { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
  dubai: { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
  lisbon: { lat: 38.7223, lng: -9.1393, name: 'Lisbon' },
  bali: { lat: -8.3405, lng: 115.0920, name: 'Bali' },
};

function TourResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const destination = searchParams.get('destination') || 'paris';
  const lat = parseFloat(searchParams.get('lat') || '') || CITY_COORDS[destination.toLowerCase()]?.lat || 48.8566;
  const lng = parseFloat(searchParams.get('lng') || '') || CITY_COORDS[destination.toLowerCase()]?.lng || 2.3522;
  const cityName = CITY_COORDS[destination.toLowerCase()]?.name || destination;

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/activities/search?latitude=${lat}&longitude=${lng}&radius=15&type=tours`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTours(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load tours');
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, [lat, lng]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <MaxWidthContainer>
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Tours in {cityName}</h1>
                <p className="text-xs text-gray-500">{loading ? 'Searching...' : `${tours.length} tours found`}</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </MaxWidthContainer>
      </div>

      <MaxWidthContainer>
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
            <p className="text-gray-600 font-medium">Finding tours in {cityName}...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && tours.length === 0 && (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tours found in {cityName}</p>
          </div>
        )}

        {!loading && tours.length > 0 && (
          <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {tours.map((tour) => {
              const price = tour.price?.amount ? parseFloat(tour.price.amount) : null;
              const img = tour.pictures?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80';
              return (
                <div key={tour.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={img} alt={tour.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white">
                      <Heart className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    {price && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur shadow-sm">
                        <span className="font-bold text-gray-900 text-sm">${price.toFixed(0)}</span>
                        <span className="text-gray-500 text-[10px] ml-0.5">/person</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1.5 group-hover:text-orange-600 transition-colors leading-tight">
                      {tour.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />4.8</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{tour.minimumDuration || '3h'}</span>
                      <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />Small</span>
                    </div>
                    <button className="w-full mt-2 py-1.5 rounded-lg bg-orange-50 text-orange-600 font-semibold text-xs hover:bg-orange-100 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </MaxWidthContainer>
    </div>
  );
}

export default function TourResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-6xl">🗺️</span></div>}>
      <TourResultsContent />
    </Suspense>
  );
}
