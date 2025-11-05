'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';

function InsuranceResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchData = {
    destination: searchParams.get('destination') || '',
    tripCost: searchParams.get('tripCost') || '5000',
    departure: searchParams.get('departure') || '',
    return: searchParams.get('return') || '',
    travelers: searchParams.get('travelers') || '2',
    insuranceType: searchParams.get('insuranceType') || 'trip',
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const tripCost = parseInt(searchData.tripCost);
      setPlans([
        {
          id: '1',
          name: 'Basic Protection',
          provider: 'TravelSafe',
          price: Math.round(tripCost * 0.05),
          coverage: {
            'Trip Cancellation': `Up to $${tripCost}`,
            'Medical Emergency': '$50,000',
            'Baggage Loss': '$1,000',
            'Travel Delay': '$500',
          },
          features: ['24/7 assistance', 'Cancel for any reason', 'COVID-19 coverage'],
          rating: 4.5,
        },
        {
          id: '2',
          name: 'Standard Coverage',
          provider: 'SecureTrip',
          price: Math.round(tripCost * 0.08),
          coverage: {
            'Trip Cancellation': `Up to $${tripCost}`,
            'Medical Emergency': '$100,000',
            'Emergency Evacuation': '$250,000',
            'Baggage Loss': '$2,500',
            'Travel Delay': '$1,000',
          },
          features: ['24/7 assistance', 'Cancel for any reason', 'COVID-19 coverage', 'Adventure sports', 'Rental car damage'],
          rating: 4.7,
          popular: true,
        },
        {
          id: '3',
          name: 'Comprehensive Plus',
          provider: 'GlobalProtect',
          price: Math.round(tripCost * 0.12),
          coverage: {
            'Trip Cancellation': `Up to $${tripCost * 1.5}`,
            'Medical Emergency': '$250,000',
            'Emergency Evacuation': '$500,000',
            'Baggage Loss': '$5,000',
            'Travel Delay': '$2,000',
            'Missed Connection': '$1,500',
          },
          features: ['24/7 concierge', 'Cancel for any reason', 'COVID-19 coverage', 'Adventure sports', 'Rental car damage', 'Pet coverage', 'Identity theft'],
          rating: 4.9,
        },
      ]);
      setLoading(false);
    };

    fetchPlans();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block animate-bounce">🛡️</span>
          <h2 className="text-2xl font-bold text-gray-900">Finding insurance plans...</h2>
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
              <h1 className="text-2xl font-bold text-gray-900">Travel Insurance Plans</h1>
              <p className="text-sm text-gray-600 mt-1">{searchData.destination} · Trip cost: ${searchData.tripCost}</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/home-new')}>Modify Search</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant="elevated"
              padding="lg"
              className={`hover:shadow-xl transition-all ${plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🛡️</div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.provider}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-yellow-400">{'★'.repeat(Math.floor(plan.rating))}</span>
                  <span className="text-sm font-semibold text-gray-700">{plan.rating}</span>
                </div>
              </div>

              <div className="text-center mb-6 py-6 border-y border-gray-200">
                <div className="text-4xl font-bold text-primary-600">${plan.price}</div>
                <div className="text-sm text-gray-600 mt-1">Total premium</div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Coverage:</h4>
                  <div className="space-y-2">
                    {Object.entries(plan.coverage).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-700">{key}:</span>
                        <span className="font-semibold text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Features:</h4>
                  <div className="space-y-1">
                    {plan.features.map((feature: string) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button variant={plan.popular ? 'primary' : 'outline'} fullWidth>
                Get Quote
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InsuranceResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-6xl">🛡️</span></div>}>
      <InsuranceResultsContent />
    </Suspense>
  );
}
