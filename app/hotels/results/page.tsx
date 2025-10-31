'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, Star, Users, Wifi, Coffee, Dumbbell, UtensilsCrossed, Car, TrendingUp, Shield, Loader2, Filter, ChevronDown, X, ArrowLeft } from 'lucide-react';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface Hotel {
  id: string;
  name: string;
  address?: {
    line1?: string;
    city?: string;
    country?: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  starRating?: number;
  images?: any[];
  amenities?: string[];
  distanceKm?: number;
  rates?: any[];
  // ML Features
  valueScore?: number;
  demandLevel?: number;
  availableRooms?: number;
  trending?: boolean;
  viewersLast24h?: number;
  bookingsLast24h?: number;
}

function HotelResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search parameters
  const destination = searchParams.get('destination') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');
  const rooms = parseInt(searchParams.get('rooms') || '1');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  // State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance' | 'value'>('value');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minStars, setMinStars] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  // Fetch hotels from Duffel API
  useEffect(() => {
    const fetchHotels = async () => {
      if (!destination || !checkIn || !checkOut) {
        setError('Missing required search parameters');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Build API query
        const query = new URLSearchParams({
          checkIn,
          checkOut,
          adults: adults.toString(),
          ...(children > 0 && { children: children.toString() }),
          ...(lat && lng && {
            lat,
            lng,
          }),
          ...(destination && { query: destination }),
          currency: 'USD',
          limit: '50',
        });

        console.log('Fetching hotels with query:', query.toString());

        const response = await fetch(`/api/hotels/search?${query.toString()}`);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch hotels');
        }

        // Extract hotels from response
        const hotelsData = data.data || [];
        console.log(`Found ${hotelsData.length} hotels`);

        // Add ML features (simulated for now)
        const enhancedHotels = hotelsData.map((hotel: any) => {
          const lowestRate = hotel.rates && hotel.rates.length > 0 ? hotel.rates[0] : null;
          const price = lowestRate ? parseFloat(lowestRate.totalPrice.amount) : 0;

          return {
            ...hotel,
            valueScore: Math.random() * 30 + 70, // 70-100
            demandLevel: Math.floor(Math.random() * 100),
            availableRooms: Math.floor(Math.random() * 20) + 5,
            trending: Math.random() > 0.7,
            viewersLast24h: Math.floor(Math.random() * 200) + 50,
            bookingsLast24h: Math.floor(Math.random() * 30) + 5,
          };
        });

        setHotels(enhancedHotels);
      } catch (err: any) {
        console.error('Error fetching hotels:', err);
        setError(err.message || 'Failed to fetch hotels. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchParams]);

  // Sort hotels
  const sortedHotels = [...hotels].sort((a, b) => {
    const aRate = a.rates?.[0];
    const bRate = b.rates?.[0];
    const aPrice = aRate ? parseFloat(aRate.totalPrice.amount) : 0;
    const bPrice = bRate ? parseFloat(bRate.totalPrice.amount) : 0;

    switch (sortBy) {
      case 'price':
        return aPrice - bPrice;
      case 'rating':
        return (b.starRating || 0) - (a.starRating || 0);
      case 'distance':
        return (a.distanceKm || 999) - (b.distanceKm || 999);
      case 'value':
        return (b.valueScore || 0) - (a.valueScore || 0);
      default:
        return 0;
    }
  });

  // Filter hotels
  const filteredHotels = sortedHotels.filter((hotel) => {
    const rate = hotel.rates?.[0];
    const price = rate ? parseFloat(rate.totalPrice.amount) : 0;

    // Price filter
    if (price < minPrice || price > maxPrice) return false;

    // Stars filter
    if (hotel.starRating && hotel.starRating < minStars) return false;

    // Amenities filter
    if (selectedAmenities.length > 0) {
      const hasAllAmenities = selectedAmenities.every((amenity) =>
        hotel.amenities?.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (!hasAllAmenities) return false;
    }

    return true;
  });

  const handleHotelClick = (hotelId: string) => {
    router.push(`/hotels/${hotelId}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`);
  };

  const amenityIcons: { [key: string]: React.ReactNode } = {
    wifi: <Wifi className="w-4 h-4" />,
    gym: <Dumbbell className="w-4 h-4" />,
    restaurant: <UtensilsCrossed className="w-4 h-4" />,
    parking: <Car className="w-4 h-4" />,
    coffee: <Coffee className="w-4 h-4" />,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-4 bg-orange-50 rounded-full flex items-center justify-center">
              <span className="text-4xl">🏨</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Searching for hotels...</h2>
          <p className="text-gray-600 font-medium">Finding the best accommodations for you</p>
          <p className="text-sm text-gray-500 mt-2">{destination} • {nights} {nights === 1 ? 'night' : 'nights'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-red-100 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error loading hotels</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/home-new')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/home-new')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back to Search</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Hotels in {destination}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {checkIn} - {checkOut} · {adults} adults · {rooms} room{rooms > 1 ? 's' : ''} · {nights} night{nights > 1 ? 's' : ''}
              </p>
              <p className="text-sm font-semibold text-orange-600 mt-1">
                {filteredHotels.length} hotels found
              </p>
            </div>

            {/* Sort & Filter */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none font-semibold text-gray-700"
              >
                <option value="value">Best Value</option>
                <option value="price">Lowest Price</option>
                <option value="rating">Highest Rating</option>
                <option value="distance">Closest</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredHotels.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
            <button
              onClick={() => {
                setMinPrice(0);
                setMaxPrice(1000);
                setMinStars(0);
                setSelectedAmenities([]);
              }}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredHotels.map((hotel) => {
              const mainImage = hotel.images && hotel.images.length > 0 ? hotel.images[0].url : null;
              const lowestRate = hotel.rates?.[0];
              const price = lowestRate ? parseFloat(lowestRate.totalPrice.amount) : 0;
              const totalPrice = price * nights;

              return (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden cursor-pointer group"
                  onClick={() => handleHotelClick(hotel.id)}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-80 h-64 md:h-auto relative overflow-hidden">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={hotel.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                          <span className="text-6xl">🏨</span>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {hotel.trending && (
                          <div className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            TRENDING
                          </div>
                        )}
                        {hotel.valueScore && hotel.valueScore >= 85 && (
                          <ValueScoreBadge score={hotel.valueScore} size="sm" />
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {hotel.name}
                          </h3>
                          {hotel.address && (
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                              <MapPin className="w-4 h-4" />
                              <span>{hotel.address.city}, {hotel.address.country}</span>
                            </div>
                          )}
                          {hotel.distanceKm && (
                            <p className="text-sm text-gray-500 mt-1">
                              {hotel.distanceKm.toFixed(1)} km from city center
                            </p>
                          )}
                        </div>

                        {/* Star Rating */}
                        {hotel.starRating && (
                          <div className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="text-xl font-bold">{hotel.starRating}</span>
                          </div>
                        )}
                      </div>

                      {/* Amenities */}
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.slice(0, 5).map((amenity, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1"
                            >
                              {amenityIcons[amenity.toLowerCase()] || <Shield className="w-4 h-4" />}
                              <span className="capitalize">{amenity.replace('_', ' ')}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Social Proof */}
                      {hotel.viewersLast24h && hotel.bookingsLast24h && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-orange-600" />
                            <span>{hotel.viewersLast24h} viewing</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span>{hotel.bookingsLast24h} booked today</span>
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-200">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Starting from</div>
                          <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-orange-600">${price.toFixed(0)}</span>
                            <span className="text-gray-600 mb-1">per night</span>
                          </div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            ${totalPrice.toFixed(0)} total for {nights} {nights === 1 ? 'night' : 'nights'}
                          </div>
                          {lowestRate?.refundable && (
                            <div className="text-sm text-green-600 font-semibold mt-1">
                              ✓ Free Cancellation
                            </div>
                          )}
                        </div>

                        <button className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HotelResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Loading hotels...</h2>
          </div>
        </div>
      }
    >
      <HotelResultsContent />
    </Suspense>
  );
}
