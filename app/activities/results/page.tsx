'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Star, Clock, Users, MapPin, Heart, Loader2, ArrowLeft,
  SlidersHorizontal, Globe, Sparkles
} from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  description?: string;
  price?: { amount: string; currencyCode: string };
  pictures?: string[];
  rating?: number;
  minimumDuration?: string;
  geoCode?: { latitude: number; longitude: number };
}

const CITY_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  paris: { lat: 48.8566, lng: 2.3522, name: 'Paris' },
  rome: { lat: 41.9028, lng: 12.4964, name: 'Rome' },
  barcelona: { lat: 41.3851, lng: 2.1734, name: 'Barcelona' },
  london: { lat: 51.5074, lng: -0.1278, name: 'London' },
  newyork: { lat: 40.7128, lng: -74.0060, name: 'New York' },
  nyc: { lat: 40.7128, lng: -74.0060, name: 'New York' },
  tokyo: { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
  dubai: { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
  bali: { lat: -8.3405, lng: 115.0920, name: 'Bali' },
  lisbon: { lat: 38.7223, lng: -9.1393, name: 'Lisbon' },
  queenstown: { lat: -45.0312, lng: 168.6626, name: 'Queenstown' },
  costarica: { lat: 9.7489, lng: -83.7534, name: 'Costa Rica' },
};

function ActivityResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const destination = searchParams.get('destination') || 'paris';
  const lat = parseFloat(searchParams.get('lat') || '') || CITY_COORDS[destination.toLowerCase()]?.lat || 48.8566;
  const lng = parseFloat(searchParams.get('lng') || '') || CITY_COORDS[destination.toLowerCase()]?.lng || 2.3522;
  const cityName = CITY_COORDS[destination.toLowerCase()]?.name || destination;

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/activities/search?latitude=${lat}&longitude=${lng}&radius=15&type=activities`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setActivities(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load activities');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
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
                <h1 className="text-lg font-bold text-gray-900">Activities in {cityName}</h1>
                <p className="text-xs text-gray-500">{loading ? 'Searching...' : `${activities.length} activities found`}</p>
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
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
            <p className="text-gray-600 font-medium">Finding activities in {cityName}...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && activities.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No activities found in {cityName}</p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && activities.length > 0 && (
          <div className="py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {activities.map((activity) => {
              const price = activity.price?.amount ? parseFloat(activity.price.amount) : null;
              const img = activity.pictures?.[0] || 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80';
              return (
                <div key={activity.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={img} alt={activity.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1.5 group-hover:text-purple-600 transition-colors leading-tight">
                      {activity.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />4.7</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{activity.minimumDuration || '2h'}</span>
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{cityName}</span>
                    </div>
                    <button className="w-full mt-2 py-1.5 rounded-lg bg-purple-50 text-purple-600 font-semibold text-xs hover:bg-purple-100 transition-colors">
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

export default function ActivityResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    }>
      <ActivityResultsContent />
    </Suspense>
  );
}
