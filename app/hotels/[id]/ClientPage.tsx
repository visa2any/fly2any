'use client';


import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { MapPin, Star, Wifi, Coffee, Dumbbell, UtensilsCrossed, Car, ArrowLeft, Calendar, Users, Shield, Info, AlertCircle, RefreshCw } from 'lucide-react';

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setError(null); // Clear previous errors
        const response = await fetch(`/api/hotels/${hotelId}`);

        if (!response.ok) {
          // Handle different error statuses
          if (response.status === 404) {
            throw new Error('Hotel not found. Please try searching again.');
          } else if (response.status === 500) {
            throw new Error('Server error. Our team has been notified. Please try again later.');
          } else {
            throw new Error('Failed to load hotel details. Please try again.');
          }
        }

        const data = await response.json();
        setHotel(data.data);

        // Check if this is demo data
        if (data.meta?.isDemoData || data.meta?.source === 'Demo Data') {
          setIsDemoData(true);
        }
      } catch (err: any) {
        console.error('Hotel fetch error:', err);
        setError(err.message || 'Failed to load hotel details');
      } finally {
        setLoading(false);
        setRetrying(false);
      }
    };

    if (hotelId) {
      fetchHotelDetails();
    }
  }, [hotelId, retrying]);

  const amenityIcons: { [key: string]: React.ReactNode } = {
    wifi: <Wifi className="w-5 h-5" />,
    gym: <Dumbbell className="w-5 h-5" />,
    restaurant: <UtensilsCrossed className="w-5 h-5" />,
    parking: <Car className="w-5 h-5" />,
    coffee: <Coffee className="w-5 h-5" />,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  // Retry handler
  const handleRetry = () => {
    setLoading(true);
    setRetrying(true);
  };

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Hotel not found. The hotel you\'re looking for may no longer be available.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {retrying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Retrying...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </>
                )}
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              If the problem persists, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const mainImage = hotel.images && hotel.images.length > 0 ? hotel.images[0].url : null;
  const lowestRate = hotel.rates && hotel.rates.length > 0 ? hotel.rates[0] : null;
  const price = lowestRate ? parseFloat(lowestRate.totalPrice.amount) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 24px' }}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Results</span>
          </button>
        </div>
      </div>

      {/* Demo Data Banner */}
      {isDemoData && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '12px 24px' }}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Demo Data:</span> This is sample hotel information for demonstration purposes.
                  {' '}Real hotel data will be available when you configure your API credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Content */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            {mainImage && (
              <div className="relative h-96 rounded-lg overflow-hidden mb-6">
                <img
                  src={mainImage}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Hotel Info */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span>
                      {hotel.address?.city}, {hotel.address?.country}
                    </span>
                  </div>
                  {hotel.distanceKm && (
                    <p className="text-sm text-gray-600">
                      {hotel.distanceKm.toFixed(1)} km from city center
                    </p>
                  )}
                </div>

                {/* Rating Badge */}
                {hotel.starRating && (
                  <div className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-xl font-bold">{hotel.starRating}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {hotel.description && (
                <p className="text-gray-700 mb-6">{hotel.description}</p>
              )}

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities.slice(0, 9).map((amenity: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-700">
                        <div className="text-primary-600">
                          {amenityIcons[amenity] || <Shield className="w-5 h-5" />}
                        </div>
                        <span className="capitalize">{amenity.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Image Gallery */}
            {hotel.images && hotel.images.length > 1 && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Photo Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.images.slice(1, 7).map((image: any, idx: number) => (
                    <div key={idx} className="relative h-48 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.caption || `${hotel.name} photo ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Starting from</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold text-primary-600">
                    ${price}
                  </span>
                  <span className="text-gray-600 mb-2">per night</span>
                </div>

                {lowestRate && (
                  <div className="flex items-center gap-2 text-sm">
                    {lowestRate.refundable && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                        Free Cancellation
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span>Flexible check-in/out</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="w-5 h-5 text-primary-600" />
                  <span>Suitable for all guests</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <span>Secure booking</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <button
                onClick={() => {
                  // Store hotel data for booking flow
                  const bookingData = {
                    hotelId: hotel.id,
                    name: hotel.name,
                    location: `${hotel.address?.city}, ${hotel.address?.country}`,
                    checkIn: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                    checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Day after
                    adults: 2,
                    children: 0,
                    price: price,
                    currency: lowestRate?.totalPrice.currency || 'USD',
                    image: mainImage,
                    stars: hotel.starRating,
                  };

                  sessionStorage.setItem(`hotel_booking_${hotel.id}`, JSON.stringify(bookingData));

                  // Navigate to booking page
                  router.push(`/hotels/booking?hotelId=${hotel.id}&name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(bookingData.location)}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&adults=2&children=0&price=${price}&currency=${bookingData.currency}&image=${encodeURIComponent(mainImage || '')}&stars=${hotel.starRating || 0}`);
                }}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg rounded-lg transition-colors mb-3"
              >
                Book Now
              </button>

              <button
                onClick={() => router.push('/hotels/search')}
                className="w-full py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-lg transition-colors"
              >
                View Similar Hotels
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
