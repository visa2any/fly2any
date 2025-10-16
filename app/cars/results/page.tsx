'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface SearchParams {
  pickup: string;
  dropoff: string;
  pickupDate: string;
  dropoffDate: string;
  rentalType: string;
}

interface CarRental {
  id: string;
  name: string;
  category: string;
  company: string;
  passengers: number;
  transmission: string;
  fuelType: string;
  pricePerDay: number;
  image: string;
  features: string[];
}

function CarResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cars, setCars] = useState<CarRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchData: SearchParams = {
    pickup: searchParams.get('pickup') || '',
    dropoff: searchParams.get('dropoff') || '',
    pickupDate: searchParams.get('pickupDate') || '',
    dropoffDate: searchParams.get('dropoffDate') || '',
    rentalType: searchParams.get('rentalType') || 'pickupdropoff',
  };

  useEffect(() => {
    const fetchCars = async () => {
      if (!searchData.pickup || !searchData.pickupDate || !searchData.dropoffDate) {
        setError('Missing required search parameters');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const mockCars: CarRental[] = [
          {
            id: '1',
            name: 'Toyota Camry',
            category: 'Sedan',
            company: 'Enterprise',
            passengers: 5,
            transmission: 'Automatic',
            fuelType: 'Gasoline',
            pricePerDay: 45,
            image: '🚗',
            features: ['AC', 'Bluetooth', 'GPS', 'USB'],
          },
          {
            id: '2',
            name: 'Honda CR-V',
            category: 'SUV',
            company: 'Hertz',
            passengers: 7,
            transmission: 'Automatic',
            fuelType: 'Hybrid',
            pricePerDay: 65,
            image: '🚙',
            features: ['AC', 'Bluetooth', 'GPS', 'USB', 'Apple CarPlay'],
          },
          {
            id: '3',
            name: 'Ford Mustang',
            category: 'Sports',
            company: 'Avis',
            passengers: 4,
            transmission: 'Manual',
            fuelType: 'Gasoline',
            pricePerDay: 89,
            image: '🏎️',
            features: ['AC', 'Bluetooth', 'Premium Audio', 'Sport Mode'],
          },
        ];

        await new Promise(resolve => setTimeout(resolve, 1000));
        setCars(mockCars);
      } catch (err: any) {
        console.error('Error fetching cars:', err);
        setError(err.message || 'Failed to fetch cars');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [searchParams]);

  const days = searchData.pickupDate && searchData.dropoffDate
    ? Math.ceil((new Date(searchData.dropoffDate).getTime() - new Date(searchData.pickupDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block animate-bounce">🚗</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Searching for rental cars...</h2>
          <p className="text-gray-600">Finding the best vehicles for your trip</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center p-4">
        <Card padding="lg" className="max-w-md text-center bg-white">
          <span className="text-6xl block mb-4">⚠️</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => router.push('/home-new')}>Modify Search</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Car Rentals</h1>
              <p className="text-sm text-gray-600 mt-1">
                {searchData.pickup} → {searchData.dropoff} · {days} day{days > 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/home-new')}>Modify Search</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <Card key={car.id} padding="lg" className="hover:shadow-xl transition-shadow bg-white">
              <div className="text-center">
                <div className="text-6xl mb-4">{car.image}</div>
                <h3 className="text-xl font-bold text-gray-900">{car.name}</h3>
                <p className="text-sm text-gray-600">{car.category} · {car.company}</p>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Passengers:</span>
                    <span className="font-semibold">{car.passengers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transmission:</span>
                    <span className="font-semibold">{car.transmission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel:</span>
                    <span className="font-semibold">{car.fuelType}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {car.features.map((feature) => (
                    <span key={feature} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-3xl font-bold text-primary-600">${car.pricePerDay}</div>
                  <div className="text-sm text-gray-600">per day</div>
                  <div className="text-lg font-semibold text-gray-900 mt-2">${car.pricePerDay * days} total</div>
                </div>

                <Button variant="primary" fullWidth className="mt-4">
                  Book Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CarResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-6xl">🚗</span></div>}>
      <CarResultsContent />
    </Suspense>
  );
}
