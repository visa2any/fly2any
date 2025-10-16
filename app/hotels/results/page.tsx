'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  bookingType: string;
}

interface Hotel {
  id: string;
  name: string;
  address: string;
  rating: number;
  price: number;
  amenities: string[];
  image: string;
  description: string;
}

function HotelResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchData: SearchParams = {
    destination: searchParams.get('destination') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    adults: parseInt(searchParams.get('adults') || '2'),
    rooms: parseInt(searchParams.get('rooms') || '1'),
    bookingType: searchParams.get('bookingType') || 'roomonly',
  };

  useEffect(() => {
    const fetchHotels = async () => {
      if (!searchData.destination || !searchData.checkIn || !searchData.checkOut) {
        setError('Missing required search parameters');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Generate mock hotel data (replace with actual API call)
        const mockHotels: Hotel[] = [
          {
            id: '1',
            name: 'Grand Plaza Hotel',
            address: `${searchData.destination}`,
            rating: 4.5,
            price: 189,
            amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Parking'],
            image: '🏨',
            description: 'Luxury hotel in the heart of the city',
          },
          {
            id: '2',
            name: 'City Center Inn',
            address: `Downtown ${searchData.destination}`,
            rating: 4.0,
            price: 129,
            amenities: ['WiFi', 'Breakfast', 'Parking'],
            image: '🏨',
            description: 'Comfortable stay near major attractions',
          },
          {
            id: '3',
            name: 'Seaside Resort',
            address: `Beachfront ${searchData.destination}`,
            rating: 4.8,
            price: 299,
            amenities: ['WiFi', 'Pool', 'Beach Access', 'Spa', 'Restaurant', 'Bar'],
            image: '🏨',
            description: 'Premium resort with ocean views',
          },
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHotels(mockHotels);
      } catch (err: any) {
        console.error('Error fetching hotels:', err);
        setError(err.message || 'Failed to fetch hotels');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);

  const handleModifySearch = () => {
    router.push('/home-new');
  };

  const handleBookHotel = (hotelId: string) => {
    console.log('Book hotel:', hotelId);
    alert('Hotel booking - Coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-4 bg-primary-50 rounded-full flex items-center justify-center">
              <span className="text-4xl">🏨</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Searching for hotels...</h2>
          <p className="text-gray-600 font-medium">Finding the best accommodations for you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-error/20 p-8 text-center">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error loading hotels</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={handleModifySearch}>Modify Search</Button>
        </div>
      </div>
    );
  }

  const nights = searchData.checkIn && searchData.checkOut
    ? Math.ceil((new Date(searchData.checkOut).getTime() - new Date(searchData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hotels in {searchData.destination}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {searchData.checkIn} - {searchData.checkOut} · {searchData.adults} adults · {searchData.rooms} room{searchData.rooms > 1 ? 's' : ''} · {nights} night{nights > 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="outline" onClick={handleModifySearch}>Modify Search</Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6">
          {hotels.map((hotel) => (
            <Card key={hotel.id} variant="elevated" padding="lg" className="hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Hotel Image */}
                <div className="flex-shrink-0">
                  <div className="w-full md:w-64 h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-6xl">
                    {hotel.image}
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{hotel.name}</h3>
                      <p className="text-gray-600 mt-1">{hotel.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className="text-yellow-400">
                              {i < Math.floor(hotel.rating) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{hotel.rating}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary-600">${hotel.price}</div>
                      <div className="text-sm text-gray-600">per night</div>
                      <div className="text-lg font-semibold text-gray-900 mt-2">
                        ${hotel.price * nights} total
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mt-4">{hotel.description}</p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {hotel.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 mt-6">
                    <Button variant="primary" onClick={() => handleBookHotel(hotel.id)}>
                      Book Now
                    </Button>
                    <Button variant="outline">View Details</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {hotels.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
            <Button variant="primary" onClick={handleModifySearch}>Modify Search</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HotelResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🏨</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Loading hotels...</h2>
        </div>
      </div>
    }>
      <HotelResultsContent />
    </Suspense>
  );
}
