'use client';


import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { MapPin, Star, Wifi, Coffee, Dumbbell, UtensilsCrossed, Car, ArrowLeft, Calendar, Users, User, Shield, Info, AlertCircle, RefreshCw, BedDouble, CheckCircle2, X, Filter, ArrowUpDown } from 'lucide-react';

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Room selection and filtering state
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [priceFilter, setPriceFilter] = useState<string>('all'); // all, under150, 150-300, over300
  const [bedTypeFilter, setBedTypeFilter] = useState<string>('all'); // all, king, queen, twin
  const [sortBy, setSortBy] = useState<string>('price'); // price, rating, size
  const [showFilters, setShowFilters] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

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
      fetchReviews();
    }
  }, [hotelId, retrying]);

  // Fetch reviews from database
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await fetch(`/api/hotels/${hotelId}/reviews`);

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setReviewCount(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const amenityIcons: { [key: string]: React.ReactNode } = {
    wifi: <Wifi className="w-5 h-5" />,
    gym: <Dumbbell className="w-5 h-5" />,
    restaurant: <UtensilsCrossed className="w-5 h-5" />,
    parking: <Car className="w-5 h-5" />,
    coffee: <Coffee className="w-5 h-5" />,
  };

  // Room filtering and sorting logic
  const getFilteredAndSortedRooms = () => {
    if (!hotel || !hotel.rates || hotel.rates.length === 0) return [];

    let rooms = [...hotel.rates];

    // Apply price filter
    if (priceFilter !== 'all') {
      rooms = rooms.filter((room: any) => {
        const price = parseFloat(room.totalPrice?.amount || 0);
        if (priceFilter === 'under150') return price < 150;
        if (priceFilter === '150-300') return price >= 150 && price <= 300;
        if (priceFilter === 'over300') return price > 300;
        return true;
      });
    }

    // Apply bed type filter
    if (bedTypeFilter !== 'all') {
      rooms = rooms.filter((room: any) => {
        const roomName = (room.roomName || room.name || '').toLowerCase();
        return roomName.includes(bedTypeFilter);
      });
    }

    // Apply sorting
    rooms.sort((a: any, b: any) => {
      const priceA = parseFloat(a.totalPrice?.amount || 0);
      const priceB = parseFloat(b.totalPrice?.amount || 0);

      if (sortBy === 'price') {
        return priceA - priceB;
      } else if (sortBy === 'price-desc') {
        return priceB - priceA;
      }
      return 0;
    });

    return rooms;
  };

  const filteredRooms = getFilteredAndSortedRooms();

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

            {/* Room Listings Section */}
            {hotel.rates && hotel.rates.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Available Rooms</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} available
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                </div>

                {/* Filter Controls */}
                {showFilters && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Price Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price Range
                        </label>
                        <select
                          value={priceFilter}
                          onChange={(e) => setPriceFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="all">All Prices</option>
                          <option value="under150">Under $150</option>
                          <option value="150-300">$150 - $300</option>
                          <option value="over300">Over $300</option>
                        </select>
                      </div>

                      {/* Bed Type Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bed Type
                        </label>
                        <select
                          value={bedTypeFilter}
                          onChange={(e) => setBedTypeFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="all">All Bed Types</option>
                          <option value="king">King</option>
                          <option value="queen">Queen</option>
                          <option value="twin">Twin</option>
                        </select>
                      </div>

                      {/* Sort */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="price">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Room Cards */}
                <div className="space-y-4">
                  {filteredRooms.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-semibold">No rooms match your filters</p>
                      <button
                        onClick={() => {
                          setPriceFilter('all');
                          setBedTypeFilter('all');
                        }}
                        className="mt-4 px-4 py-2 text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    filteredRooms.map((room: any, index: number) => {
                      const roomPrice = parseFloat(room.totalPrice?.amount || 0);
                      const currency = room.totalPrice?.currency || 'USD';
                      const roomName = room.roomName || room.name || `Room Option ${index + 1}`;
                      const bedType = room.bedType || 'Standard Bed';
                      const maxGuests = room.maxGuests || 2;
                      const isRefundable = room.refundable || false;
                      const breakfastIncluded = room.breakfastIncluded || false;

                      return (
                        <div
                          key={index}
                          className={`border-2 rounded-lg p-6 transition-all ${
                            selectedRoom === room
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300 bg-white'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Room Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {roomName}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <BedDouble className="w-4 h-4 text-primary-600" />
                                      <span>{bedType}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="w-4 h-4 text-primary-600" />
                                      <span>Up to {maxGuests} guests</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Amenities */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {isRefundable && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Free Cancellation
                                  </span>
                                )}
                                {breakfastIncluded && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                    <Coffee className="w-3 h-3" />
                                    Breakfast Included
                                  </span>
                                )}
                                {room.amenities && room.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full"
                                  >
                                    {amenity.replace('_', ' ')}
                                  </span>
                                ))}
                              </div>

                              {/* Description */}
                              {room.description && (
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {room.description}
                                </p>
                              )}
                            </div>

                            {/* Price and CTA */}
                            <div className="md:w-64 flex flex-col justify-between md:text-right">
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">Total Price</p>
                                <div className="flex md:flex-col items-baseline md:items-end gap-2 mb-2">
                                  <span className="text-3xl font-bold text-primary-600">
                                    ${roomPrice.toFixed(0)}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {currency}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  ${(roomPrice / (hotel.checkOut && hotel.checkIn ? Math.max(1, Math.ceil((new Date(hotel.checkOut).getTime() - new Date(hotel.checkIn).getTime()) / 86400000)) : 1)).toFixed(0)} per night
                                </p>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedRoom(room);
                                  // Navigate to booking with this specific room
                                  const bookingData = {
                                    hotelId: hotel.id,
                                    name: hotel.name,
                                    location: `${hotel.address?.city}, ${hotel.address?.country}`,
                                    checkIn: hotel.checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                                    checkOut: hotel.checkOut || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                                    adults: maxGuests,
                                    children: 0,
                                    roomId: room.id || `room_${index}`,
                                    roomName: roomName,
                                    bedType: bedType,
                                    price: roomPrice,
                                    currency: currency,
                                    image: mainImage,
                                    stars: hotel.starRating,
                                    refundable: isRefundable,
                                    breakfastIncluded: breakfastIncluded,
                                  };

                                  sessionStorage.setItem(`hotel_booking_${hotel.id}`, JSON.stringify(bookingData));

                                  router.push(`/hotels/booking?hotelId=${hotel.id}&name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(bookingData.location)}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&adults=${maxGuests}&children=0&roomId=${encodeURIComponent(bookingData.roomId)}&roomName=${encodeURIComponent(roomName)}&bedType=${encodeURIComponent(bedType)}&price=${roomPrice}&currency=${currency}&image=${encodeURIComponent(mainImage || '')}&stars=${hotel.starRating || 0}&refundable=${isRefundable}&breakfastIncluded=${breakfastIncluded}`);
                                }}
                                className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
                              >
                                Select Room
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-lg p-6 mt-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Guest Reviews</h2>
                {reviewCount > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(averageRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-gray-600">
                    Be the first to review this hotel after your stay
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.slice(0, 5).map((review: any, index: number) => (
                    <div
                      key={review.id || index}
                      className="pb-6 border-b border-gray-200 last:border-0"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.userName || 'Guest'}
                              </p>
                              {review.verifiedStay && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Verified Stay
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {review.title && (
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {review.title}
                        </h4>
                      )}

                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.content}
                      </p>

                      {review.hotelResponse && (
                        <div className="mt-4 ml-4 pl-4 border-l-2 border-primary-200 bg-primary-50 p-4 rounded-r-lg">
                          <p className="text-xs font-semibold text-primary-800 mb-2">
                            Response from Hotel
                          </p>
                          <p className="text-sm text-gray-700">{review.hotelResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {reviews.length > 5 && (
                    <button className="w-full py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-lg transition-colors">
                      View All {reviewCount} Reviews
                    </button>
                  )}
                </div>
              )}
            </div>
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

              {/* Location Map */}
              {hotel.address && (hotel.address.lat || hotel.address.city) && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    Location
                  </h3>
                  <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '200px' }}>
                    {hotel.address.lat && hotel.address.lng ? (
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${hotel.address.lat},${hotel.address.lng}&zoom=15`}
                      />
                    ) : (
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${encodeURIComponent(`${hotel.name}, ${hotel.address.city}, ${hotel.address.country}`)}&zoom=15`}
                      />
                    )}
                  </div>
                  <div className="mt-3">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${hotel.name}, ${hotel.address.city}, ${hotel.address.country}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
                    >
                      <MapPin className="w-4 h-4" />
                      Get Directions
                    </a>
                  </div>
                </div>
              )}

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
