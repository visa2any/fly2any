'use client';


import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { HotelReviews } from '@/components/hotels/HotelReviews';
import { HotelUrgencySignals } from '@/components/hotels/HotelUrgencySignals';
import { HotelTrustBadges } from '@/components/hotels/HotelTrustBadges';
import { HotelQABot } from '@/components/hotels/HotelQABot';
import { CompactRoomCard } from '@/components/hotels/CompactRoomCard';
import { MapPin, Star, Wifi, Coffee, Dumbbell, UtensilsCrossed, Car, ArrowLeft, Calendar, Users, User, Shield, Info, AlertCircle, RefreshCw, BedDouble, CheckCircle2, CheckCircle, Hotel, X, Filter, ArrowUpDown, Clock, Wind, Tv, Bath, Snowflake, Waves, Sparkles, Utensils, Wine, ConciergeBell, DoorOpen, ParkingCircle, Phone, Wifi as WifiIcon, Globe, ChevronLeft, ChevronRight, Building2, ArrowRight, LogIn, LogOut } from 'lucide-react';

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
  const rooms = searchParams.get('rooms') || '1';

  // Calculate total guests for display
  const totalGuests = parseInt(adults, 10) + parseInt(children, 10);

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
        // CRITICAL: Include children and rooms for accurate pricing!
        let apiUrl = `/api/hotels/${hotelId}`;
        if (checkIn && checkOut) {
          apiUrl += `?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`;
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
    }
  }, [hotelId, retrying, checkIn, checkOut, adults, children, rooms]);

  // Initialize selectedRoom with lowest rate when hotel loads
  useEffect(() => {
    if (hotel?.rates?.length > 0 && !selectedRoom) {
      setSelectedRoom(hotel.rates[0]);
    }
  }, [hotel, selectedRoom]);

  // Fetch reviews AFTER hotel data is loaded (for contextual review generation)
  useEffect(() => {
    if (hotel && hotelId) {
      fetchReviews(hotel);
    }
  }, [hotel, hotelId]);

  // Fetch reviews with hotel context for contextually-appropriate reviews
  const fetchReviews = async (hotelData?: any) => {
    try {
      setReviewsLoading(true);

      // Build URL with hotel context for contextual review generation
      let reviewUrl = `/api/hotels/${hotelId}/reviews?limit=10`;

      // Add hotel context if available (for contextually-appropriate reviews)
      if (hotelData) {
        const hotelName = encodeURIComponent(hotelData.name || 'Hotel');
        const hotelCity = encodeURIComponent(hotelData.address?.city || '');
        const hotelStars = hotelData.starRating || hotelData.stars || 3;

        // Extract amenity names for context
        const amenities = (hotelData.amenities || [])
          .slice(0, 20)
          .map((a: any) => typeof a === 'string' ? a : a.name || '')
          .filter(Boolean)
          .join(',');

        reviewUrl += `&hotelName=${hotelName}&hotelCity=${hotelCity}&hotelStars=${hotelStars}&amenities=${encodeURIComponent(amenities)}`;
      }

      const response = await fetch(reviewUrl);

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || data.data || []);
        setAverageRating(data.averageRating || data.summary?.averageRating || 0);
        setReviewCount(data.total || data.summary?.totalReviews || 0);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 24px' }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Search Context Banner - Shows what user is searching for */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '12px 24px' }}>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/80" />
                <span className="font-medium">
                  {checkIn && checkOut
                    ? `${new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : 'Loading dates...'}
                </span>
              </div>
              <span className="text-white/50">|</span>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white/80" />
                <span className="font-medium">
                  {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}
                  {parseInt(children) > 0 && ` (${children} child${parseInt(children) > 1 ? 'ren' : ''})`}
                </span>
              </div>
              <span className="text-white/50">|</span>
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-white/80" />
                <span className="font-medium">{rooms} {parseInt(rooms) === 1 ? 'Room' : 'Rooms'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px' }}>
          {/* Progress Indicator */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center animate-pulse">
                  <Hotel className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Finding the perfect room for you...</h2>
              <p className="text-gray-600 text-sm mb-4">We're loading hotel details and checking availability</p>

              {/* Progress Steps */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-700 font-medium">Hotel found</span>
                </div>
                <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-orange-400" />
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-orange-600 font-medium">Loading details</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-200" />
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  <span className="text-gray-400">Checking rates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery Skeleton */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="aspect-[16/9] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
                <div className="flex gap-2 p-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-20 h-16 bg-gray-200 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>

              {/* Hotel Info Skeleton */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-5 bg-gray-100 rounded-full w-20 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="h-4 bg-gray-100 rounded w-4/6 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>

              {/* Room Options Skeleton */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                      <div className="flex gap-4">
                        <div className="w-32 h-24 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-gray-200 rounded w-2/3" />
                          <div className="h-4 bg-gray-100 rounded w-1/2" />
                          <div className="flex gap-2">
                            <div className="h-6 bg-gray-100 rounded-full w-16" />
                            <div className="h-6 bg-gray-100 rounded-full w-20" />
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="h-6 bg-orange-100 rounded w-20" />
                          <div className="h-4 bg-gray-100 rounded w-16" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="h-4 bg-gray-100 rounded w-24" />
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="h-12 bg-gradient-to-r from-orange-200 to-amber-200 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
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

  // Calculate per-room per-night price for consistent display across the journey
  // LiteAPI totalPrice.amount = TOTAL for all rooms × all nights
  // We need PER-ROOM PER-NIGHT for user-friendly display
  const roomsNum = parseInt(rooms, 10) || 1;
  const perNightPrice = totalPrice > 0 ? totalPrice / nights / roomsNum : 0;

  // Selected room details for sidebar display
  const activeRoom = selectedRoom || lowestRate;
  const activeRoomPrice = activeRoom
    ? parseFloat(activeRoom.totalPrice?.amount || activeRoom.total_amount || '0')
    : totalPrice;
  // PER-ROOM per-night for the selected room
  const activeRoomPerNight = activeRoomPrice > 0 ? activeRoomPrice / nights / roomsNum : perNightPrice;
  const activeRoomName = activeRoom?.name || activeRoom?.room_type || activeRoom?.roomType || 'Standard Room';

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

                        // Check if this room is currently selected
                        const isThisRoomSelected = selectedRoom?.id === room.id ||
                          (selectedRoom && !selectedRoom.id && !room.id && selectedRoom.name === room.name);

                        return (
                          <CompactRoomCard
                            key={room.id || index}
                            room={transformedRoom}
                            nights={nights}
                            currency={currency}
                            isSelected={isThisRoomSelected}
                            onSelect={() => {
                              // Just select the room - sidebar updates automatically
                              setSelectedRoom(room);
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

            {/* Rates Unavailable Section - Show when API fails but we have fallback price */}
            {(!hotel.rates || hotel.rates.length === 0 || (hotel as any).ratesUnavailable) && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-200">
                {/* Info Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 flex-shrink-0">
                    <Info className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Room Rates Temporarily Unavailable</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      {(hotel as any).ratesFallbackReason || 'We\'re having trouble fetching room rates right now. Please try again in a moment.'}
                    </p>
                  </div>
                </div>

                {/* Estimated Price from Search (if available) */}
                {hotel.rates && hotel.rates.length > 0 && hotel.rates[0]?.isFallback && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Estimated Price</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">
                          ${parseFloat(hotel.rates[0].totalPrice?.amount || '0').toFixed(0)}
                          <span className="text-sm font-normal text-slate-500 ml-1">total for {nights} nights</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">
                          ~${(parseFloat(hotel.rates[0].totalPrice?.amount || '0') / nights).toFixed(0)}
                        </p>
                        <p className="text-xs text-slate-500">per night</p>
                      </div>
                    </div>
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      This is an estimated price from your search. Final price may vary.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Search
                  </button>
                </div>

                {/* Contact Info */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center">
                    If the problem persists, you can contact the hotel directly or try searching for alternative dates.
                  </p>
                </div>
              </div>
            )}

            {/* Enhanced Reviews Section - Premium Styling */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mt-6">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
                    <Star className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Guest Reviews</h2>
                    <p className="text-sm text-gray-500">Real experiences from verified guests</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <HotelReviews
                  hotelId={hotelId}
                  hotelName={hotel?.name}
                  showSummary={true}
                  maxReviews={10}
                />
              </div>
            </div>

            {/* Trust Badges Section */}
            <div className="mt-6">
              <HotelTrustBadges variant="full" />
            </div>
          </div>

          {/* Premium Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 sticky top-24 overflow-hidden">
              {/* Premium Price Header - Shows Selected Room */}
              <div className={`p-5 ${activeRoom?.isFallback || (hotel as any).ratesUnavailable ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}>
                {/* Estimated Price Warning Badge */}
                {(activeRoom?.isFallback || (hotel as any).ratesUnavailable) && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/25 backdrop-blur-sm text-white rounded-lg text-xs font-semibold">
                      <Info className="w-3 h-3" />
                      Estimated Price
                    </span>
                  </div>
                )}
                {/* Room Name Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <BedDouble className="w-4 h-4 text-white/80" />
                  <p className="text-white text-sm font-medium truncate" title={activeRoomName}>
                    {activeRoomName.length > 30 ? `${activeRoomName.substring(0, 30)}...` : activeRoomName}
                  </p>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">
                    {activeRoom?.isFallback ? '~' : ''}${activeRoomPerNight.toFixed(0)}
                  </span>
                  <span className="text-orange-100 text-lg mb-1">{roomsNum > 1 ? '/room/night' : '/night'}</span>
                </div>
                {checkIn && checkOut && (
                  <div className="mt-2 flex flex-col">
                    <span className="text-white/90 text-sm">
                      {activeRoom?.isFallback ? '~' : ''}<span className="font-bold">${activeRoomPrice.toFixed(0)}</span> total {roomsNum > 1 ? `(${roomsNum} rooms × ${nights} nights)` : `for ${nights} ${nights === 1 ? 'night' : 'nights'}`}
                    </span>
                    {/* Transparent pricing indicator */}
                    <span className="text-white/60 text-xs mt-0.5">+ taxes &amp; fees at checkout</span>
                  </div>
                )}
                {activeRoom?.refundable && !activeRoom?.isFallback && (
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Free Cancellation
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                {/* Booking Details - COMPACT 2-Column Grid (BEFORE CTA) */}
                <div className="mb-4 pb-4 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Your Booking</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Check-in with Date */}
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-orange-100 flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 leading-tight">Check-in</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {checkIn ? (() => { const [y, m, d] = checkIn.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); })() : 'Select'}
                        </p>
                        <p className="text-[9px] text-slate-400">{hotel.checkInTime || '3:00 PM'}</p>
                      </div>
                    </div>

                    {/* Check-out with Date */}
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 leading-tight">Check-out</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {checkOut ? (() => { const [y, m, d] = checkOut.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); })() : 'Select'}
                        </p>
                        <p className="text-[9px] text-slate-400">{hotel.checkOutTime || '11:00 AM'}</p>
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-green-100 flex-shrink-0">
                        <Users className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 leading-tight">Guests</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}
                          {parseInt(children) > 0 && <span className="text-[9px] text-slate-500 ml-0.5">({children} child{parseInt(children) > 1 ? 'ren' : ''})</span>}
                        </p>
                      </div>
                    </div>

                    {/* Instant Confirmation */}
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-purple-100 flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500 leading-tight">Booking</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">Instant Confirm</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary CTA - Book Now (uses selected room) */}
                <button
                  onClick={() => {
                    const roomCurrency = activeRoom?.totalPrice?.currency || activeRoom?.currency || 'USD';
                    const roomOfferId = activeRoom?.offerId || activeRoom?.id || '';
                    const adultsNum = parseInt(adults, 10) || 2;
                    const childrenNum = parseInt(children, 10) || 0;
                    const roomsNum = parseInt(rooms, 10) || 1;
                    const bookingData = {
                      hotelId: hotelId,
                      name: hotel.name,
                      location: `${hotel.address?.city}, ${hotel.address?.country}`,
                      checkIn: checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                      checkOut: checkOut || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                      guests: { adults: adultsNum, children: childrenNum },
                      rooms: roomsNum,
                      roomId: activeRoom?.id || 'default_room',
                      offerId: roomOfferId,
                      roomName: activeRoomName,
                      price: activeRoomPrice,
                      perNightPrice: activeRoomPerNight,
                      currency: roomCurrency,
                      image: mainImage,
                      stars: hotel.starRating,
                      refundable: activeRoom?.refundable || false,
                      breakfastIncluded: activeRoom?.breakfastIncluded || false,
                      boardType: activeRoom?.boardType || 'RO',
                      nights: nights,
                    };
                    sessionStorage.setItem(`hotel_booking_${hotelId}`, JSON.stringify(bookingData));
                    router.push(`/hotels/booking?hotelId=${hotelId}&offerId=${encodeURIComponent(roomOfferId)}&name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(bookingData.location)}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&nights=${nights}&adults=${adultsNum}&children=${childrenNum}&rooms=${roomsNum}&roomId=${encodeURIComponent(bookingData.roomId)}&roomName=${encodeURIComponent(activeRoomName)}&price=${activeRoomPrice}&perNight=${activeRoomPerNight}&currency=${roomCurrency}&image=${encodeURIComponent(mainImage || '')}&stars=${hotel.starRating || 0}&refundable=${bookingData.refundable}&breakfastIncluded=${bookingData.breakfastIncluded}`);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all mb-4 flex items-center justify-center gap-2"
                >
                  <BedDouble className="w-5 h-5" />
                  Book Now
                </button>

                {/* Urgency Signals */}
                <div className="mb-4 pb-4 border-b border-slate-100">
                  <HotelUrgencySignals
                    hotelId={hotelId}
                    hotelName={hotel?.name}
                    basePrice={perNightPrice}
                    variant="detail"
                    availableRoomTypes={hotel?.rates?.length || 0}
                    isRealData={hotel?.rates?.length > 0}
                  />
                </div>

                {/* Location Map - FREE OpenStreetMap Preview */}
                {hotel.address && (hotel.address.lat || hotel.address.city) && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      Location
                    </h3>
                    {/* OpenStreetMap Embed - FREE, No API Key Required */}
                    {hotel.address.lat && hotel.address.lng ? (
                      <div className="bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200" style={{ height: '160px' }}>
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${hotel.address.lng - 0.015}%2C${hotel.address.lat - 0.01}%2C${hotel.address.lng + 0.015}%2C${hotel.address.lat + 0.01}&layer=mapnik&marker=${hotel.address.lat}%2C${hotel.address.lng}`}
                          title="Hotel Location Map"
                        />
                      </div>
                    ) : (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name}, ${hotel.address.city}, ${hotel.address.country}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden hover:from-orange-50 hover:to-amber-50 transition-all group border border-slate-200"
                        style={{ height: '160px' }}
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform border border-slate-200">
                            <MapPin className="w-6 h-6 text-orange-500" />
                          </div>
                          <p className="font-semibold text-slate-800 mb-1 text-sm">View on Map</p>
                          <p className="text-xs text-slate-500">
                            {hotel.address.city}, {hotel.address.country}
                          </p>
                        </div>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${hotel.name}, ${hotel.address.city}, ${hotel.address.country}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1.5 justify-center py-2 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Get Directions
                    </a>
                  </div>
                )}

                {/* View Similar Hotels - MOVED TO BOTTOM (for undecided users only) */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 text-center mb-2">Not quite right?</p>
                  <button
                    onClick={() => router.push('/hotels')}
                    className="w-full py-2.5 border border-slate-200 text-slate-500 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    View Similar Hotels
                  </button>
                </div>
              </div>
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
                <p className="text-[10px] text-gray-400">+ taxes &amp; fees</p>
              </div>
              <button
                onClick={() => {
                  // Use the same booking logic as desktop button - MUST include offerId, roomId, perNight for prebook
                  const roomCurrency = activeRoom?.totalPrice?.currency || activeRoom?.currency || 'USD';
                  const roomOfferId = activeRoom?.offerId || activeRoom?.id || '';
                  const adultsNum = parseInt(adults, 10) || 2;
                  const childrenNum = parseInt(children, 10) || 0;
                  const roomsNum = parseInt(rooms, 10) || 1;
                  const bookingData = {
                    hotelId: hotelId,
                    name: hotel.name,
                    location: `${hotel.address?.city}, ${hotel.address?.country}`,
                    checkIn: checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    checkOut: checkOut || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                    guests: { adults: adultsNum, children: childrenNum },
                    rooms: roomsNum,
                    roomId: activeRoom?.id || 'default_room',
                    offerId: roomOfferId,
                    roomName: activeRoomName,
                    price: activeRoomPrice,
                    perNightPrice: activeRoomPerNight,
                    currency: roomCurrency,
                    image: mainImage,
                    stars: hotel.starRating,
                    refundable: activeRoom?.refundable || false,
                    breakfastIncluded: activeRoom?.breakfastIncluded || false,
                    nights: nights,
                  };
                  sessionStorage.setItem(`hotel_booking_${hotelId}`, JSON.stringify(bookingData));
                  router.push(`/hotels/booking?hotelId=${hotelId}&offerId=${encodeURIComponent(roomOfferId)}&name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(bookingData.location)}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&nights=${nights}&adults=${adultsNum}&children=${childrenNum}&rooms=${roomsNum}&roomId=${encodeURIComponent(bookingData.roomId)}&roomName=${encodeURIComponent(activeRoomName)}&price=${activeRoomPrice}&perNight=${activeRoomPerNight}&currency=${roomCurrency}&image=${encodeURIComponent(mainImage || '')}&stars=${hotel.starRating || 0}&refundable=${bookingData.refundable}&breakfastIncluded=${bookingData.breakfastIncluded}`);
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
