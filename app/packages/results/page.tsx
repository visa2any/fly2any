'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useScrollDirection } from '@/lib/hooks/useScrollDirection';

function PackageResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Scroll direction detection for auto-hide header (Phase 8 Track 2C.1)
  const { scrollDirection, isAtTop } = useScrollDirection({
    threshold: 50,
    debounceDelay: 100,
    mobileOnly: true,
  });

  const searchData = {
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    departure: searchParams.get('departure') || '',
    travelers: searchParams.get('travelers') || '2',
    packageType: searchParams.get('packageType') || 'flighthotel',
  };

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPackages([
        {
          id: '1',
          name: 'Paradise Getaway',
          destination: searchData.to,
          price: 1299,
          duration: '7 days / 6 nights',
          includes: ['Round-trip flights', '5-star hotel', 'Daily breakfast', 'Airport transfers'],
          rating: 4.8,
          savings: 450,
        },
        {
          id: '2',
          name: 'Adventure Package',
          destination: searchData.to,
          price: 899,
          duration: '5 days / 4 nights',
          includes: ['Flights', '4-star hotel', 'Car rental', 'City tour'],
          rating: 4.5,
          savings: 320,
        },
        {
          id: '3',
          name: 'Luxury Experience',
          destination: searchData.to,
          price: 2499,
          duration: '10 days / 9 nights',
          includes: ['Business class flights', 'Luxury resort', 'All meals included', 'Spa treatments', 'Excursions'],
          rating: 5.0,
          savings: 850,
        },
      ]);
      setLoading(false);
    };

    fetchPackages();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block animate-bounce">📦</span>
          <h2 className="text-2xl font-bold text-gray-900">Finding perfect packages...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header - Auto-hides on scroll down (Phase 8 Track 2C.1) */}
      <div
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"
        style={{
          transform: scrollDirection === 'down' && !isAtTop ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Travel Packages</h1>
              <p className="text-sm text-gray-600 mt-1">{searchData.from} → {searchData.to} · {searchData.travelers} travelers</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/home-new')}>Modify Search</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} variant="elevated" padding="lg" className="hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-full md:w-64 h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-6xl">
                    🌴
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
                      <p className="text-gray-600 mt-1">{pkg.destination} · {pkg.duration}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-yellow-400">{'★'.repeat(Math.floor(pkg.rating))}</span>
                        <span className="text-sm font-semibold text-gray-700">{pkg.rating}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500 line-through">${pkg.price + pkg.savings}</div>
                      <div className="text-3xl font-bold text-primary-600">${pkg.price}</div>
                      <div className="text-sm text-green-600 font-semibold">Save ${pkg.savings}</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Package Includes:</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {pkg.includes.map((item: string) => (
                        <div key={item} className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button variant="primary">Book Package</Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PackageResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-6xl">📦</span></div>}>
      <PackageResultsContent />
    </Suspense>
  );
}
