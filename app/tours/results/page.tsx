'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function TourResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchData = {
    destination: searchParams.get('destination') || '',
    startDate: searchParams.get('startDate') || '',
    duration: searchParams.get('duration') || '7',
    travelers: searchParams.get('travelers') || '2',
    tourType: searchParams.get('tourType') || 'guided',
  };

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTours([
        {
          id: '1',
          name: 'City Highlights Walking Tour',
          destination: searchData.destination,
          price: 89,
          duration: '4 hours',
          groupSize: '12 max',
          includes: ['Professional guide', 'Entry fees', 'Refreshments'],
          rating: 4.9,
          reviews: 342,
          language: ['English', 'Spanish'],
        },
        {
          id: '2',
          name: 'Full Day Adventure Tour',
          destination: searchData.destination,
          price: 179,
          duration: '8 hours',
          groupSize: '8 max',
          includes: ['Expert guide', 'Lunch', 'Transportation', 'Equipment'],
          rating: 4.8,
          reviews: 218,
          language: ['English'],
        },
        {
          id: '3',
          name: 'Cultural Experience Package',
          destination: searchData.destination,
          price: 299,
          duration: '3 days',
          groupSize: '15 max',
          includes: ['Local guide', 'All meals', 'Accommodation', 'Activities', 'Transfers'],
          rating: 5.0,
          reviews: 156,
          language: ['English', 'Spanish', 'French'],
        },
      ]);
      setLoading(false);
    };

    fetchTours();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block animate-bounce">🗺️</span>
          <h2 className="text-2xl font-bold text-gray-900">Finding amazing tours...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tours & Activities in {searchData.destination}</h1>
              <p className="text-sm text-gray-600 mt-1">{searchData.travelers} travelers · {searchData.tourType} tours</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/home-new')}>Modify Search</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tours.map((tour) => (
            <Card key={tour.id} variant="elevated" padding="lg" className="hover:shadow-xl transition-shadow">
              <div className="flex flex-col h-full">
                <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-6xl mb-4">
                  🗺️
                </div>

                <h3 className="text-xl font-bold text-gray-900">{tour.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{tour.destination}</p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-400">{'★'.repeat(Math.floor(tour.rating))}</span>
                  <span className="text-sm font-semibold text-gray-700">{tour.rating}</span>
                  <span className="text-xs text-gray-500">({tour.reviews} reviews)</span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold">{tour.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Group size:</span>
                    <span className="font-semibold">{tour.groupSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Languages:</span>
                    <span className="font-semibold">{tour.language.join(', ')}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Includes:</h4>
                  <div className="space-y-1">
                    {tour.includes.map((item: string) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs text-gray-500">From</div>
                      <div className="text-2xl font-bold text-primary-600">${tour.price}</div>
                      <div className="text-xs text-gray-600">per person</div>
                    </div>
                  </div>
                  <Button variant="primary" fullWidth>Book Tour</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
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
