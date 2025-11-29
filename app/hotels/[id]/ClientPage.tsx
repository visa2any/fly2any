'use client';


import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { HotelReviews } from '@/components/hotels/HotelReviews';
import { HotelUrgencySignals } from '@/components/hotels/HotelUrgencySignals';
import { HotelTrustBadges } from '@/components/hotels/HotelTrustBadges';
import { HotelQABot } from '@/components/hotels/HotelQABot';
import { CompactRoomCard } from '@/components/hotels/CompactRoomCard';
import { MapPin, Star, Wifi, Coffee, Dumbbell, UtensilsCrossed, Car, ArrowLeft, Calendar, Users, User, Shield, Info, AlertCircle, RefreshCw, BedDouble, CheckCircle2, X, Filter, ArrowUpDown, Clock, Wind, Tv, Bath, Snowflake, Waves, Sparkles, Utensils, Wine, ConciergeBell, DoorOpen, ParkingCircle, Phone, Wifi as WifiIcon, Globe, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hotelId = params.id as string;

  // Get search params for rates (passed from search results)
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = searchParams.get('adults') || '2';
  const children = searchParams.get('children') || '0';

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
  const [showPriceBreakdown, setShowPriceBreakdown] = useState<{[key: number]: boolean}>({});

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  // Mobile CTA bar visibility
  const [showMobileCTA, setShowMobileCTA] = useState(false);

  // Image lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Scroll listener for mobile CTA bar
  useEffect(() => {
    const handleScroll = () => {
      // Show mobile CTA after scrolling past hero section (400px)
      setShowMobileCTA(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' && hotel?.images) {
        setLightboxIndex((prev) => Math.min(hotel.images.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, hotel?.images]);

  // Lightbox touch gesture support
  useEffect(() => {
    if (!lightboxOpen) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      if (touchStartX - touchEndX > swipeThreshold) {
        // Swipe left - next image
        if (hotel?.images) {
          setLightboxIndex((prev) => Math.min(hotel.images.length - 1, prev + 1));
        }
      } else if (touchEndX - touchStartX > swipeThreshold) {
        // Swipe right - previous image
        setLightboxIndex((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [lightboxOpen, hotel?.images]);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setError(null); // Clear previous errors

        // Build URL with optional date params for rates
        let apiUrl = `/api/hotels/${hotelId}`;
        if (checkIn && checkOut) {
          apiUrl += `?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`;
        }

        const response = await fetch(apiUrl);

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
  }, [hotelId, retrying, checkIn, checkOut, adults]);

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

  // Enhanced amenity icons with color coding by category
  const getAmenityIcon = (amenity: string): { icon: React.ReactNode; color: string } => {
    const amenityLower = amenity.toLowerCase().replace(/[_\s-]/g, '');

    // Connectivity & Tech (Blue)
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
      return { icon: <Wifi className="w-5 h-5" />, color: 'text-blue-600' };
    }
    if (amenityLower.includes('tv') || amenityLower.includes('television')) {
      return { icon: <Tv className="w-5 h-5" />, color: 'text-blue-600' };
    }
    if (amenityLower.includes('phone')) {
      return { icon: <Phone className="w-5 h-5" />, color: 'text-blue-600' };
    }

    // Wellness & Fitness (Green)
    if (amenityLower.includes('gym') || amenityLower.includes('fitness') || amenityLower.includes('exercise')) {
      return { icon: <Dumbbell className="w-5 h-5" />, color: 'text-green-600' };
    }
    if (amenityLower.includes('pool') || amenityLower.includes('swimming')) {
      return { icon: <Waves className="w-5 h-5" />, color: 'text-green-600' };
    }
    if (amenityLower.includes('spa') || amenityLower.includes('massage')) {
      return { icon: <Sparkles className="w-5 h-5" />, color: 'text-green-600' };
    }

    // Food & Beverage (Orange)
    if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) {
      return { icon: <UtensilsCrossed className="w-5 h-5" />, color: 'text-orange-600' };
    }
    if (amenityLower.includes('bar') || amenityLower.includes('lounge')) {
      return { icon: <Wine className="w-5 h-5" />, color: 'text-orange-600' };
    }
    if (amenityLower.includes('coffee') || amenityLower.includes('breakfast') || amenityLower.includes('cafe')) {
      return { icon: <Coffee className="w-5 h-5" />, color: 'text-orange-600' };
    }
    if (amenityLower.includes('kitchen') || amenityLower.includes('kitchenette')) {
      return { icon: <Utensils className="w-5 h-5" />, color: 'text-orange-600' };
    }

    // Comfort & Convenience (Purple)
    if (amenityLower.includes('aircon') || amenityLower.includes('conditioning') || amenityLower.includes('climate')) {
      return { icon: <Wind className="w-5 h-5" />, color: 'text-purple-600' };
    }
    if (amenityLower.includes('bath') || amenityLower.includes('shower') || amenityLower.includes('tub')) {
      return { icon: <Bath className="w-5 h-5" />, color: 'text-purple-600' };
    }
    if (amenityLower.includes('concierge') || amenityLower.includes('reception')) {
      return { icon: <ConciergeBell className="w-5 h-5" />, color: 'text-purple-600' };
    }
    if (amenityLower.includes('roomservice')) {
      return { icon: <DoorOpen className="w-5 h-5" />, color: 'text-purple-600' };
    }

    // Temperature Control (Cyan)
    if (amenityLower.includes('heating') || amenityLower.includes('heater')) {
      return { icon: <Snowflake className="w-5 h-5" />, color: 'text-cyan-600' };
    }

    // Parking & Transport (Gray)
    if (amenityLower.includes('parking') || amenityLower.includes('valet')) {
      return { icon: <Car className="w-5 h-5" />, color: 'text-gray-600' };
    }

    // Default fallback (Primary color)
    return { icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-primary-600' };
  };

  // Memoized room filtering and sorting - prevents unnecessary recalculations
  const filteredRooms = useMemo(() => {
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
  }, [hotel, priceFilter, bedTypeFilter, sortBy]);

  // Retry handler
  const handleRetry = () => {
    setLoading(true);
    setRetrying(true);
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

  // Handle both Duffel API structure (images with .url) and mock data (photos as strings)
  const mainImage = hotel.images && hotel.images.length > 0
    ? (hotel.images[0].url || hotel.images[0])
    : hotel.photos && hotel.photos.length > 0
    ? hotel.photos[0]
    : null;
  const lowestRate = hotel.rates && hotel.rates.length > 0 ? hotel.rates[0] : null;
  // Handle both Duffel API structure (totalPrice.amount) and mock data structure (total_amount)
  const totalPrice = lowestRate
    ? parseFloat(lowestRate.totalPrice?.amount || lowestRate.total_amount || '0')
    : 0;

  // Calculate number of nights from check-in/check-out dates
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1; // Default to 1 night if dates not provided
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1; // Minimum 1 night
  }, [checkIn, checkOut]);

  // Calculate per-night price
  const perNightPrice = totalPrice > 0 ? totalPrice / nights : 0;

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
            {/* Photo Gallery - Manual Navigation WITHOUT Fullscreen Required */}
            {hotel?.images && hotel.images.length > 0 && (
              <div className="relative h-96 rounded-lg overflow-hidden mb-6 group bg-gray-100">
                {/* Current Image */}
                <img
                  src={hotel.images[selectedImageIndex]?.url || hotel.images[0]?.url || hotel.images[0] || mainImage}
                  alt={`${hotel.name} - Photo ${selectedImageIndex + 1}`}
                  loading="eager"
                  className="w-full h-full object-cover"
                />

                {/* Navigation Controls - ALWAYS VISIBLE on hover */}
                {hotel.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => prev === 0 ? hotel.images.length - 1 : prev - 1);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => prev === hotel.images.length - 1 ? 0 : prev + 1);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-900 rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Photo Counter */}
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                      {selectedImageIndex + 1} / {hotel.images.length}
                    </div>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {hotel.images.slice(0, Math.min(hotel.images.length, 10)).map((_img: any, index: number) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(index);
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            selectedImageIndex === index
                              ? 'bg-white w-8'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                          aria-label={`Go to photo ${index + 1}`}
                        />
                      ))}
                      {hotel.images.length > 10 && (
                        <span className="text-white text-xs">+{hotel.images.length - 10}</span>
                      )}
                    </div>
                  </>
                )}

                {/* Fullscreen Button - Optional */}
                <button
                  onClick={() => {
                    setLightboxIndex(selectedImageIndex);
                    setLightboxOpen(true);
                  }}
                  className="absolute top-4 left-4 bg-white/95 hover:bg-white text-gray-900 rounded-lg p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  aria-label="View fullscreen"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
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

                {/* Rating Badges with Clarity Tooltips */}
                <div className="flex flex-col gap-2 items-end">
                  {/* Star Rating (Amenities) */}
                  {(hotel.starRating || hotel.star_rating) && (
                    <div className="group relative">
                      <div className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg cursor-help">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="text-xl font-bold">{hotel.starRating || hotel.star_rating}</span>
                      </div>
                      {/* Tooltip */}
                      <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-1">Star Rating</p>
                            <p>Official hotel classification based on amenities, facilities, and services offered.</p>
                          </div>
                        </div>
                        <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  )}

                  {/* Guest Rating (Reviews) */}
                  {hotel.reviewRating && parseFloat(hotel.reviewRating) > 0 && (
                    <div className="group relative">
                      <div className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm cursor-help">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-bold">{parseFloat(hotel.reviewRating).toFixed(1)}/5</span>
                        <span className="text-xs opacity-90">Guest Rating</span>
                      </div>
                      {/* Tooltip */}
                      <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-1">Guest Rating</p>
                            <p>Average score from verified guest reviews. Shows real traveler satisfaction.</p>
                            {hotel.reviewCount && (
                              <p className="mt-1 opacity-80">Based on {hotel.reviewCount} reviews</p>
                            )}
                          </div>
                        </div>
                        <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {hotel.description && (
                <p className="text-gray-700 mb-6">{hotel.description}</p>
              )}

              {/* Important Information Banner */}
              {hotel.hotelImportantInformation && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Info className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                        Important Information
                      </h3>
                      <div className="text-sm text-blue-800 space-y-2">
                        {hotel.hotelImportantInformation.split('\n').map((line: string, idx: number) => {
                          const trimmedLine = line.trim();
                          if (!trimmedLine) return null;
                          return (
                            <p key={idx} className="flex items-start gap-2">
                              <span className="text-blue-600 font-bold mt-0.5">•</span>
                              <span>{trimmedLine}</span>
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities - Enhanced with color-coded icons */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {hotel.amenities.slice(0, 12).map((amenity: string, idx: number) => {
                      const { icon, color } = getAmenityIcon(amenity);
                      return (
                        <div key={idx} className="flex items-center gap-3 text-gray-700 group">
                          <div className={`${color} group-hover:scale-110 transition-transform`}>
                            {icon}
                          </div>
                          <span className="capitalize text-sm">{amenity.replace(/_/g, ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                  {hotel.amenities.length > 12 && (
                    <p className="text-sm text-gray-500 mt-4">
                      +{hotel.amenities.length - 12} more amenities available
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Image Gallery - Enhanced with ordering, captions, and lightbox */}
            {hotel.images && hotel.images.length > 1 && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Photo Gallery ({hotel.images.length - 1} Photos)</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(() => {
                    // Sort images by order field and show all images except the first one (hero)
                    return hotel.images
                      .sort((a: any, b: any) => (a.order || 999) - (b.order || 999))
                      .slice(1) // Only skip the first image (hero), show all others
                      .map((image: any, idx: number) => (
                        <div
                          key={idx}
                          className="relative h-48 rounded-lg overflow-hidden group cursor-pointer"
                          onClick={() => {
                            setLightboxIndex(idx + 1); // +1 because hero is index 0
                            setLightboxOpen(true);
                          }}
                        >
                          <img
                            src={image.url}
                            alt={image.caption || `${hotel.name} photo ${idx + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {/* Hover overlay with expand icon */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white/90 rounded-full p-2">
                                <Maximize2 className="w-5 h-5 text-gray-900" />
                              </div>
                            </div>
                          </div>
                          {/* Caption Overlay */}
                          {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-white text-xs font-medium line-clamp-2">{image.caption}</p>
                            </div>
                          )}
                          {/* Image Number Badge */}
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {idx + 2} / {hotel.images.length}
                          </div>
                        </div>
                      ));
                  })()}
                </div>
                <button
                  onClick={() => {
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                  }}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-2"
                >
                  <Maximize2 className="w-4 h-4" />
                  View photos in fullscreen
                </button>
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

                {/* Room Cards - VERTICAL COMPACT 4 PER ROW */}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredRooms.map((room: any, index: number) => {
                      // Extract room data
                      const roomPrice = parseFloat(room.totalPrice?.amount || 0);
                      const currency = room.totalPrice?.currency || 'USD';
                      const roomName = room.roomName || room.name || `Room Option ${index + 1}`;
                      const bedType = room.bedType || 'Standard Bed';
                      const maxGuests = room.maxGuests || 2;
                      const isRefundable = room.refundable || false;
                      const breakfastIncluded = room.breakfastIncluded || false;

                      // Calculate nights
                      const nights = hotel.checkOut && hotel.checkIn
                        ? Math.max(1, Math.ceil((new Date(hotel.checkOut).getTime() - new Date(hotel.checkIn).getTime()) / 86400000))
                        : 1;

                      // Transform room data to match CompactRoomCard expected props
                      const transformedRoom = {
                        ...room,
                        roomType: roomName,
                        maxOccupancy: maxGuests,
                        boardType: breakfastIncluded ? 'breakfast' : 'room_only',
                        refundable: isRefundable,
                      };

                      return (
                        <CompactRoomCard
                          key={room.id || index}
                          room={transformedRoom}
                          nights={nights}
                          currency={currency}
                          onSelect={() => {
                            setSelectedRoom(room);
                            // Navigate to booking with this specific room
                            const bookingData = {
                              hotelId: hotelId,
                              name: hotel.name,
                              location: `${hotel.address?.city}, ${hotel.address?.country}`,
                              checkIn: checkIn || hotel.checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                              checkOut: checkOut || hotel.checkOut || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                              guests: { adults: maxGuests, children: 0 },
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

                            sessionStorage.setItem(`hotel_booking_${hotelId}`, JSON.stringify(bookingData));

                            router.push(`/hotels/booking?hotelId=${hotelId}&name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(bookingData.location)}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&adults=${maxGuests}&children=0&roomId=${encodeURIComponent(bookingData.roomId)}&roomName=${encodeURIComponent(roomName)}&bedType=${encodeURIComponent(bedType)}&price=${roomPrice}&currency=${currency}&image=${encodeURIComponent(mainImage || '')}&stars=${hotel.starRating || 0}&refundable=${isRefundable}&breakfastIncluded=${breakfastIncluded}`);
                          }}
                          lang="en"
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Reviews Section */}
            <div className="bg-white rounded-lg p-6 mt-6">
              <HotelReviews
                hotelId={hotelId}
                hotelName={hotel?.name}
                showSummary={true}
                maxReviews={10}
              />
            </div>

            {/* Trust Badges Section */}
            <div className="mt-6">
              <HotelTrustBadges variant="full" />
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Starting from</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold text-primary-600">
                    ${perNightPrice.toFixed(2)}
                  </span>
                  <span className="text-gray-600 mb-2">per night</span>
                </div>

                {checkIn && checkOut && (
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-semibold">${totalPrice.toFixed(2)}</span> total for {nights} {nights === 1 ? 'night' : 'nights'}
                  </div>
                )}

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

              {/* Urgency Signals */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <HotelUrgencySignals
                  hotelId={hotelId}
                  hotelName={hotel?.name}
                  basePrice={perNightPrice}
                  variant="detail"
                />
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {/* Check-in/Check-out Times */}
                {(hotel.checkInTime || hotel.checkOutTime) && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <Clock className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">Check-in / Check-out</p>
                      <p className="text-sm text-gray-600">
                        {hotel.checkInTime || '15:00'} / {hotel.checkOutTime || '11:00'}
                      </p>
                    </div>
                  </div>
                )}
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
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                    <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '200px' }}>
                      {hotel.address.lat && hotel.address.lng ? (
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${hotel.address.lat},${hotel.address.lng}&zoom=15`}
                        />
                      ) : (
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${hotel.name}, ${hotel.address.city}, ${hotel.address.country}`)}&zoom=15`}
                        />
                      )}
                    </div>
                  ) : (
                    <a
                      href={
                        hotel.address.lat && hotel.address.lng
                          ? `https://www.google.com/maps/search/?api=1&query=${hotel.address.lat},${hotel.address.lng}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name}, ${hotel.address.city}, ${hotel.address.country}`)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden hover:from-blue-100 hover:to-blue-200 transition-all group"
                      style={{ height: '200px' }}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                          <MapPin className="w-8 h-8 text-primary-600" />
                        </div>
                        <p className="font-semibold text-gray-900 mb-2">View on Google Maps</p>
                        <p className="text-sm text-gray-600">
                          {hotel.address.city}, {hotel.address.country}
                        </p>
                        <div className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold group-hover:bg-primary-700 transition-colors">
                          Open Map
                        </div>
                      </div>
                    </a>
                  )}
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
                    hotelId: hotelId, // Use hotelId from URL params (always defined)
                    name: hotel.name,
                    location: `${hotel.address?.city}, ${hotel.address?.country}`,
                    checkIn: checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    checkOut: checkOut || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                    guests: { adults: parseInt(adults, 10) || 2, children: 0 },
                    price: price,
                    currency: lowestRate?.totalPrice?.currency || lowestRate?.currency || 'USD',
                    image: mainImage,
                    stars: hotel.starRating,
                  };

                  sessionStorage.setItem(`hotel_booking_${hotelId}`, JSON.stringify(bookingData));

                  // Navigate to booking page
                  router.push(`/hotels/booking?hotelId=${hotelId}&name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(bookingData.location)}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&adults=${bookingData.guests.adults}&children=${children}&price=${price}&currency=${bookingData.currency}&image=${encodeURIComponent(mainImage || '')}&stars=${hotel.starRating || 0}`);
                }}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg rounded-lg transition-colors mb-3"
              >
                Book Now
              </button>

              <button
                onClick={() => router.push('/hotels')}
                className="w-full py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-lg transition-colors"
              >
                View Similar Hotels
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom CTA Bar - Fixed position when scrolled */}
      {showMobileCTA && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary-200 shadow-2xl z-50 safe-area-inset-bottom animate-slide-up">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-600">Starting from</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary-600">
                    ${Math.round(price)}
                  </span>
                  <span className="text-sm text-gray-600">/night</span>
                </div>
              </div>
              <button
                onClick={() => {
                  // Use the same booking logic as desktop button
                  const bookingData = {
                    hotelId: hotelId,
                    name: hotel.name,
                    location: `${hotel.address?.city}, ${hotel.address?.country}`,
                    checkIn: checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    checkOut: checkOut || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                    guests: { adults: parseInt(adults, 10) || 2, children: 0 },
                    price: price,
                    currency: lowestRate?.totalPrice?.currency || 'USD',
                    image: mainImage,
                    stars: hotel.starRating,
                  };
                  sessionStorage.setItem(`hotel_booking_${hotelId}`, JSON.stringify(bookingData));
                  router.push(`/hotels/booking?hotelId=${hotelId}&name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(bookingData.location)}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&adults=${bookingData.guests.adults}&children=${children}&price=${price}&currency=${bookingData.currency}&image=${encodeURIComponent(mainImage || '')}&stars=${hotel.starRating || 0}`);
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-lg shadow-lg active:scale-95 transition-all"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxOpen && hotel?.images && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in">
          {/* Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-semibold">
            {lightboxIndex + 1} / {hotel.images.length}
          </div>

          {/* Previous Button */}
          {lightboxIndex > 0 && (
            <button
              onClick={() => setLightboxIndex((prev) => Math.max(0, prev - 1))}
              className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next Button */}
          {lightboxIndex < hotel.images.length - 1 && (
            <button
              onClick={() => setLightboxIndex((prev) => Math.min(hotel.images.length - 1, prev + 1))}
              className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
            <img
              src={hotel.images[lightboxIndex]?.url || hotel.images[lightboxIndex]}
              alt={hotel.images[lightboxIndex]?.caption || `${hotel.name} photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain animate-scale-in"
            />
          </div>

          {/* Caption */}
          {hotel.images[lightboxIndex]?.caption && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 max-w-2xl w-full px-4">
              <div className="bg-black/60 text-white px-6 py-3 rounded-lg text-center">
                <p className="text-sm md:text-base">{hotel.images[lightboxIndex].caption}</p>
              </div>
            </div>
          )}

          {/* Keyboard hints (desktop only) */}
          <div className="hidden md:block absolute bottom-4 right-4 z-10 text-white/60 text-xs">
            <p>← → Navigate | ESC Close</p>
          </div>
        </div>
      )}

      {/* Hotel Q&A Bot */}
      {hotel && (
        <HotelQABot
          hotelId={hotel.id}
          hotelName={hotel.name}
          hotelData={hotel}
        />
      )}
    </div>
  );
}
