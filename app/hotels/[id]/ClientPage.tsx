'use client';


import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { HotelReviews } from '@/components/hotels/HotelReviews';
import { HotelUrgencySignals } from '@/components/hotels/HotelUrgencySignals';
import { HotelTrustBadges } from '@/components/hotels/HotelTrustBadges';
import { HotelQABot } from '@/components/hotels/HotelQABot';
import { CompactRoomCard } from '@/components/hotels/CompactRoomCard';
import { MapPin, Star, Wifi, Coffee, Dumbbell, UtensilsCrossed, Car, ArrowLeft, Calendar, Users, User, Shield, Info, AlertCircle, RefreshCw, BedDouble, CheckCircle2, X, Filter, ArrowUpDown, Clock, Wind, Tv, Bath, Snowflake, Waves, Sparkles, Utensils, Wine, ConciergeBell, DoorOpen, ParkingCircle, Phone, Wifi as WifiIcon, Globe, ChevronLeft, ChevronRight, Building2, ArrowRight, LogIn, LogOut } from 'lucide-react';

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

  // Image slider state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Room display state - show first 4 rooms, then "Load More"
  const [showAllRooms, setShowAllRooms] = useState(false);
  const INITIAL_ROOMS_TO_SHOW = 4;

  // Scroll listener for mobile CTA bar
  useEffect(() => {
    const handleScroll = () => {
      // Show mobile CTA after scrolling past hero section (400px)
      setShowMobileCTA(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Calculate number of nights from check-in/check-out dates
  // IMPORTANT: This must be before early returns to maintain hook call order
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1; // Default to 1 night if dates not provided
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1; // Minimum 1 night
  }, [checkIn, checkOut]);

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

  // Calculate per-night price (nights is calculated earlier before early returns)
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
            {/* Premium Photo Slider with Hotel Info Overlay */}
            {hotel?.images && hotel.images.length > 0 && (
              <div className="relative h-96 rounded-2xl overflow-hidden mb-6 group bg-gray-100 shadow-2xl">
                {/* Current Image */}
                <img
                  src={hotel.images[selectedImageIndex]?.url || hotel.images[0]?.url || hotel.images[0] || mainImage}
                  alt={`${hotel.name} - Photo ${selectedImageIndex + 1}`}
                  loading={selectedImageIndex === 0 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover"
                />

                {/* Premium Top Gradient Overlay */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-black/40 to-transparent pointer-events-none" />

                {/* Hotel Name & Address - Top Left - Premium Enhanced with Icon */}
                <div className="absolute top-4 left-4 right-24 z-10">
                  {/* Hotel Name with Icon */}
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Building2 className="w-7 h-7 md:w-8 md:h-8 text-orange-400 flex-shrink-0" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white line-clamp-1"
                        style={{
                          textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 4px 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5)',
                          WebkitTextStroke: '0.5px rgba(0,0,0,0.3)'
                        }}>
                      {hotel.name}
                    </h1>
                  </div>
                  {/* Address */}
                  <div className="flex items-center gap-2 text-white ml-9 md:ml-10">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-orange-300" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
                    <span className="text-sm font-semibold line-clamp-1"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.7)' }}>
                      {hotel.address?.street && `${hotel.address.street}, `}
                      {hotel.address?.city}{hotel.address?.country && `, ${hotel.address.country}`}
                    </span>
                  </div>
                </div>

                {/* Guest Rating Badge - Top Right - Compact 15% smaller */}
                {hotel.reviewRating && parseFloat(hotel.reviewRating) > 0 && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1.5 shadow-lg border border-white/20">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-green-500 text-white rounded-md px-1.5 py-0.5">
                          <span className="text-sm font-bold">{parseFloat(hotel.reviewRating).toFixed(1)}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-semibold text-gray-800 leading-tight">
                            {parseFloat(hotel.reviewRating) >= 4.5 ? 'Excellent' :
                             parseFloat(hotel.reviewRating) >= 4.0 ? 'Very Good' :
                             parseFloat(hotel.reviewRating) >= 3.5 ? 'Good' : 'Average'}
                          </div>
                          {hotel.reviewCount && (
                            <div className="text-[9px] text-gray-500 leading-tight">{hotel.reviewCount} reviews</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Controls - Simple arrows */}
                {hotel.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => prev === 0 ? hotel.images.length - 1 : prev - 1);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => prev === hotel.images.length - 1 ? 0 : prev + 1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Photo Counter - Simple badge */}
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                      {selectedImageIndex + 1} / {hotel.images.length}
                    </div>

                    {/* Dot Indicators for quick navigation */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {hotel.images.slice(0, Math.min(hotel.images.length, 8)).map((_img: any, index: number) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(index);
                          }}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                            selectedImageIndex === index
                              ? 'bg-white w-4'
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Go to photo ${index + 1}`}
                        />
                      ))}
                      {hotel.images.length > 8 && (
                        <span className="text-white/80 text-xs ml-1">+{hotel.images.length - 8}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Premium Booking Info Bar - Check-in/Check-out with Times & Star Rating */}
            <div className="bg-white rounded-2xl p-4 mb-6 shadow-lg border border-slate-200 hover:border-orange-200 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Check-in Section */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md">
                    <LogIn className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Check-in</div>
                    <div className="text-sm font-bold text-slate-800">
                      {checkIn ? (() => {
                        const [year, month, day] = checkIn.split('-').map(Number);
                        return new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                      })() : 'Select date'}
                    </div>
                    <div className="text-xs text-orange-600 font-semibold">
                      {hotel.checkInTime || '3:00 PM'}
                    </div>
                  </div>
                </div>

                {/* Arrow Separator */}
                <div className="hidden sm:flex items-center">
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                </div>

                {/* Check-out Section */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-md">
                    <LogOut className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Check-out</div>
                    <div className="text-sm font-bold text-slate-800">
                      {checkOut ? (() => {
                        const [year, month, day] = checkOut.split('-').map(Number);
                        return new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                      })() : 'Select date'}
                    </div>
                    <div className="text-xs text-slate-600 font-semibold">
                      {hotel.checkOutTime || '11:00 AM'}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-12 bg-slate-200" />

                {/* Star Rating Badge */}
                {(hotel.starRating || hotel.star_rating) && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-md">
                    <div className="flex items-center gap-0.5">
                      {[...Array(Math.min(Math.floor(hotel.starRating || hotel.star_rating || 0), 5))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-white text-white" />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-white">
                      {hotel.starRating || hotel.star_rating}-Star
                    </span>
                  </div>
                )}

                {/* Nights Count */}
                {checkIn && checkOut && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      {nights} {nights === 1 ? 'Night' : 'Nights'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hotel Info - Description & Details */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-100">
              {/* Premium Description Section */}
              {hotel.description && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                      <Info className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">About This Property</h2>
                  </div>
                  <p className="text-slate-600 leading-relaxed pl-10 border-l-2 border-orange-200">
                    {hotel.description}
                  </p>
                </div>
              )}

              {/* Compact Important Information */}
              {hotel.hotelImportantInformation && (
                <div className="mb-6 p-3 bg-amber-50/50 rounded-xl border border-amber-200/50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Good to Know</span>
                      <p className="text-xs text-amber-800/80 mt-1 line-clamp-2">
                        {hotel.hotelImportantInformation.split('\n').filter((line: string) => line.trim()).slice(0, 2).join(' • ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities - Premium Style with Orange Accents */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Property Amenities</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-10">
                    {hotel.amenities.slice(0, 12).map((amenity: string, idx: number) => {
                      const { icon, color } = getAmenityIcon(amenity);
                      return (
                        <div key={idx} className="flex items-center gap-2.5 text-slate-700 group p-2 rounded-lg hover:bg-orange-50 transition-colors">
                          <div className={`${color} group-hover:scale-110 transition-transform`}>
                            {icon}
                          </div>
                          <span className="capitalize text-sm font-medium">{amenity.replace(/_/g, ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                  {hotel.amenities.length > 12 && (
                    <p className="text-xs text-slate-500 mt-3 pl-10 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      +{hotel.amenities.length - 12} more amenities included
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Room Listings Section - Premium Styled */}
            {hotel.rates && hotel.rates.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:border-orange-200 transition-colors">
                {/* Premium Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-md">
                      <BedDouble className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Available Rooms</h2>
                      <p className="text-sm text-slate-500">
                        {filteredRooms.length} {filteredRooms.length === 1 ? 'room type' : 'room types'} available
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-xl text-slate-700 hover:text-orange-600 font-medium transition-all"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                </div>

                {/* Filter Controls - Premium Styled */}
                {showFilters && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Price Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Price Range
                        </label>
                        <select
                          value={priceFilter}
                          onChange={(e) => setPriceFilter(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all bg-white"
                        >
                          <option value="all">All Prices</option>
                          <option value="under150">Under $150</option>
                          <option value="150-300">$150 - $300</option>
                          <option value="over300">Over $300</option>
                        </select>
                      </div>

                      {/* Bed Type Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Bed Type
                        </label>
                        <select
                          value={bedTypeFilter}
                          onChange={(e) => setBedTypeFilter(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all bg-white"
                        >
                          <option value="all">All Bed Types</option>
                          <option value="king">King</option>
                          <option value="queen">Queen</option>
                          <option value="twin">Twin</option>
                          <option value="double">Double</option>
                        </select>
                      </div>

                      {/* Sort */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all bg-white"
                        >
                          <option value="price">Price: Low to High</option>
                          <option value="price-desc">Price: High to Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Room Cards - PREMIUM VERTICAL COMPACT with Load More */}
                {filteredRooms.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-xl border border-slate-200">
                    <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-semibold">No rooms match your filters</p>
                    <button
                      onClick={() => {
                        setPriceFilter('all');
                        setBedTypeFilter('all');
                      }}
                      className="mt-4 px-4 py-2 text-orange-600 hover:text-orange-700 font-semibold hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {(showAllRooms ? filteredRooms : filteredRooms.slice(0, INITIAL_ROOMS_TO_SHOW)).map((room: any, index: number) => {
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

                    {/* Load More Button - Premium Styled */}
                    {!showAllRooms && filteredRooms.length > INITIAL_ROOMS_TO_SHOW && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setShowAllRooms(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                        >
                          <BedDouble className="w-5 h-5" />
                          Load More Rooms ({filteredRooms.length - INITIAL_ROOMS_TO_SHOW} more)
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Show Less Button */}
                    {showAllRooms && filteredRooms.length > INITIAL_ROOMS_TO_SHOW && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setShowAllRooms(false)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                        >
                          Show Less
                        </button>
                      </div>
                    )}
                  </>
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

              {/* Urgency Signals - Pass real room count from API */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <HotelUrgencySignals
                  hotelId={hotelId}
                  hotelName={hotel?.name}
                  basePrice={perNightPrice}
                  variant="detail"
                  roomsLeft={hotel?.rates?.length || undefined}
                  isRealData={hotel?.rates?.length > 0}
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
                    price: totalPrice,
                    currency: lowestRate?.totalPrice?.currency || lowestRate?.currency || 'USD',
                    image: mainImage,
                    stars: hotel.starRating,
                  };

                  sessionStorage.setItem(`hotel_booking_${hotelId}`, JSON.stringify(bookingData));

                  // Navigate to booking page
                  router.push(`/hotels/booking?hotelId=${hotelId}&name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(bookingData.location)}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&adults=${bookingData.guests.adults}&children=${children}&price=${totalPrice}&currency=${bookingData.currency}&image=${encodeURIComponent(mainImage || '')}&stars=${hotel.starRating || 0}`);
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
                    ${Math.round(perNightPrice)}
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
                    price: totalPrice,
                    currency: lowestRate?.totalPrice?.currency || 'USD',
                    image: mainImage,
                    stars: hotel.starRating,
                  };
                  sessionStorage.setItem(`hotel_booking_${hotelId}`, JSON.stringify(bookingData));
                  router.push(`/hotels/booking?hotelId=${hotelId}&name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(bookingData.location)}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&adults=${bookingData.guests.adults}&children=${children}&price=${totalPrice}&currency=${bookingData.currency}&image=${encodeURIComponent(mainImage || '')}&stars=${hotel.starRating || 0}`);
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-lg shadow-lg active:scale-95 transition-all"
              >
                Book Now
              </button>
            </div>
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
