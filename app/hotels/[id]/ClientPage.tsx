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
import { GEOEnhancer } from '@/components/seo/GEOEnhancer';

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

  // FALLBACK: Get price from URL if API returns empty rates
  const urlPrice = parseFloat(searchParams.get('price') || '0');
  const urlPerNight = parseFloat(searchParams.get('perNight') || '0');
  const urlCurrency = searchParams.get('currency') || 'USD';

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

  // Touch/swipe state for mobile image slider
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Expandable sections state
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

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
      return { icon: <UtensilsCrossed className="w-5 h-5" />, color: 'text-primary-600' };
    }
    if (amenityLower.includes('bar') || amenityLower.includes('lounge')) {
      return { icon: <Wine className="w-5 h-5" />, color: 'text-primary-600' };
    }
    if (amenityLower.includes('coffee') || amenityLower.includes('breakfast') || amenityLower.includes('cafe')) {
      return { icon: <Coffee className="w-5 h-5" />, color: 'text-primary-600' };
    }
    if (amenityLower.includes('kitchen') || amenityLower.includes('kitchenette')) {
      return { icon: <Utensils className="w-5 h-5" />, color: 'text-primary-600' };
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

  // Swipe handlers for mobile image slider
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hotel?.images?.length > 1) {
      setSelectedImageIndex((prev) => prev === hotel.images.length - 1 ? 0 : prev + 1);
    }
    if (isRightSwipe && hotel?.images?.length > 1) {
      setSelectedImageIndex((prev) => prev === 0 ? hotel.images.length - 1 : prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-50">
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
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
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
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center animate-pulse">
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
                <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-primary-400" />
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-primary-600 font-medium">Loading details</span>
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
                          <div className="h-6 bg-primary-100 rounded w-20" />
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
  // CRITICAL: Use URL price as fallback if API returned no rates
  const apiTotalPrice = lowestRate
    ? parseFloat(lowestRate.totalPrice?.amount || lowestRate.total_amount || '0')
    : 0;

  // Use API price if available, otherwise fall back to URL params from search results
  const totalPrice = apiTotalPrice > 0 ? apiTotalPrice : urlPrice;
  const isUsingFallbackPrice = apiTotalPrice === 0 && urlPrice > 0;

  // Calculate per-room per-night price for consistent display across the journey
  // LiteAPI totalPrice.amount = TOTAL for all rooms × all nights
  // We need PER-ROOM PER-NIGHT for user-friendly display
  const roomsNum = parseInt(rooms, 10) || 1;
  const perNightPrice = totalPrice > 0 ? totalPrice / nights / roomsNum : (urlPerNight / roomsNum || 0);

  // Selected room details for sidebar display
  const activeRoom = selectedRoom || lowestRate;
  const activeRoomApiPrice = activeRoom
    ? parseFloat(activeRoom.totalPrice?.amount || activeRoom.total_amount || '0')
    : 0;
  // Use API price if available, otherwise fall back to calculated totalPrice (which includes URL fallback)
  const activeRoomPrice = activeRoomApiPrice > 0 ? activeRoomApiPrice : totalPrice;
  // PER-ROOM per-night for the selected room - use URL fallback if needed
  const activeRoomPerNight = activeRoomPrice > 0
    ? activeRoomPrice / nights / roomsNum
    : (perNightPrice || (urlPerNight / roomsNum) || 0);
  const activeRoomName = activeRoom?.name || activeRoom?.room_type || activeRoom?.roomType || 'Standard Room';

  // Flag for fallback pricing (either from API fallback or URL params)
  const usingEstimatedPricing = isUsingFallbackPrice || activeRoomApiPrice === 0 || lowestRate?.isFallback || (hotel as any).ratesUnavailable;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* GEO Schema for AI search engines */}
      <GEOEnhancer
        type="hotel"
        data={{
          name: hotel.name,
          description: hotel.description,
          price: perNightPrice,
          currency: 'USD',
          location: hotel.address?.city || '',
          starRating: hotel.starRating || hotel.star_rating,
          rating: parseFloat(hotel.reviewRating) || averageRating,
          reviewCount: reviewCount || hotel.reviewCount,
          amenities: hotel.amenities?.slice(0, 10),
          images: hotel.images?.map((img: any) => img?.url || img).filter(Boolean),
          checkIn: hotel.checkInTime || '3:00 PM',
          checkOut: hotel.checkOutTime || '11:00 AM',
        }}
      />

      {/* Back Button - Premium Apple Style */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 lg:relative lg:z-auto">
        <div className="w-full px-3 lg:px-6 py-2.5 lg:py-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.back();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              router.back();
            }}
            className="flex items-center gap-2 text-[#E74035] hover:text-[#D63930] transition-colors touch-manipulation active:opacity-70 cursor-pointer select-none py-1 -my-1"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold text-sm">Back</span>
          </button>
        </div>
      </div>

      {/* Demo Data Banner - Full width mobile */}
      {isDemoData && (
        <div className="bg-primary-50 border-b border-primary-200">
          <div className="w-full lg:max-w-[1440px] lg:mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <Info className="w-4 sm:w-5 h-4 sm:h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-primary-900">
                  <span className="font-semibold">Demo Data:</span> Sample hotel for demonstration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Content - Full width */}
      <div className="w-full px-0 lg:px-4 py-0 lg:py-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Photo Slider - Edge-to-edge mobile with swipe support */}
            {hotel?.images && hotel.images.length > 0 && (
              <div
                className="relative h-56 sm:h-[295px] lg:h-[368px] rounded-none lg:rounded-xl overflow-hidden mb-0 group bg-gray-100 shadow-none lg:shadow-lg touch-pan-y"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Current Image with smooth transition and mobile enhancement filters */}
                <img
                  src={hotel.images[selectedImageIndex]?.url || hotel.images[0]?.url || hotel.images[0] || mainImage}
                  alt={`${hotel.name} - Photo ${selectedImageIndex + 1}`}
                  loading={selectedImageIndex === 0 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover transition-opacity duration-300 contrast-[1.02] brightness-[1.02] saturate-[1.08] lg:contrast-100 lg:brightness-100 lg:saturate-100"
                  draggable={false}
                  style={{
                    imageRendering: 'auto',
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                  }}
                />

                {/* Premium Top Gradient Overlay */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-black/40 to-transparent pointer-events-none" />

                {/* Hotel Name & Address - Top Left - Compact mobile, enhanced desktop */}
                <div className="absolute top-3 md:top-4 left-3 md:left-4 right-20 md:right-24 z-10">
                  {/* Hotel Name with Icon - Compact on mobile */}
                  <div className="flex items-center gap-1.5 md:gap-2.5 mb-1">
                    <Building2 className="w-5 h-5 md:w-8 md:h-8 text-primary-400 flex-shrink-0" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
                    <h1 className="text-lg md:text-3xl font-bold md:font-extrabold text-white line-clamp-1 tracking-tight"
                        style={{
                          textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 4px 8px rgba(0,0,0,0.7)',
                        }}>
                      {hotel.name}
                    </h1>
                  </div>
                  {/* Address - Smaller on mobile */}
                  <div className="flex items-center gap-1 md:gap-1.5 text-white ml-6 md:ml-10">
                    <MapPin className="w-2.5 h-2.5 md:w-4 md:h-4 flex-shrink-0 text-primary-300" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }} />
                    <span className="text-[10px] md:text-sm font-medium line-clamp-1"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                      {hotel.address?.city}{hotel.address?.country && `, ${hotel.address.country}`}
                    </span>
                  </div>
                </div>

                {/* Guest Rating Badge - Top Right - 15% smaller & transparent on mobile */}
                {hotel.reviewRating && parseFloat(hotel.reviewRating) > 0 && (
                  <div className="absolute top-3 md:top-4 right-3 md:right-4 z-10">
                    <div className="bg-black/40 md:bg-white/95 backdrop-blur-sm rounded-md md:rounded-lg px-1.5 md:px-2 py-1 md:py-1.5 md:shadow-lg md:border md:border-white/20">
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <div className="bg-green-500 text-white rounded px-1 md:px-1.5 py-0.5">
                          <span className="text-xs md:text-sm font-bold">{parseFloat(hotel.reviewRating).toFixed(1)}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-[8px] md:text-[10px] font-semibold text-white md:text-gray-800 leading-tight">
                            {parseFloat(hotel.reviewRating) >= 4.5 ? 'Excellent' :
                             parseFloat(hotel.reviewRating) >= 4.0 ? 'Very Good' :
                             parseFloat(hotel.reviewRating) >= 3.5 ? 'Good' : 'Average'}
                          </div>
                          {hotel.reviewCount && (
                            <div className="text-[7px] md:text-[9px] text-white/70 md:text-gray-500 leading-tight">{hotel.reviewCount} reviews</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Controls - Touch-optimized */}
                {hotel.images.length > 1 && (
                  <>
                    {/* Previous Button - Apple-Class transparent */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => prev === 0 ? hotel.images.length - 1 : prev - 1);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full p-2 transition-all active:scale-95 touch-manipulation"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Next Button - Apple-Class transparent */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => prev === hotel.images.length - 1 ? 0 : prev + 1);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full p-2 transition-all active:scale-95 touch-manipulation"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Photo Counter - Simple badge */}
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                      {selectedImageIndex + 1} / {hotel.images.length}
                    </div>

                    {/* Dot Indicators - Compact with sliding window */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                      {(() => {
                        const totalImages = hotel.images.length;
                        const maxDots = 7;

                        if (totalImages <= maxDots) {
                          return hotel.images.map((_img: any, index: number) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(index);
                              }}
                              className={`slider-dot rounded-full transition-all touch-manipulation ${
                                selectedImageIndex === index
                                  ? 'w-4 h-1.5 bg-white'
                                  : 'w-1.5 h-1.5 bg-white/50'
                              }`}
                              aria-label={`Photo ${index + 1}`}
                            />
                          ));
                        }

                        const halfWindow = Math.floor(maxDots / 2);
                        let startIdx = Math.max(0, selectedImageIndex - halfWindow);
                        let endIdx = startIdx + maxDots;
                        if (endIdx > totalImages) {
                          endIdx = totalImages;
                          startIdx = Math.max(0, endIdx - maxDots);
                        }
                        const visibleIndices = [];
                        for (let i = startIdx; i < endIdx; i++) {
                          visibleIndices.push(i);
                        }

                        return (
                          <>
                            {startIdx > 0 && <span className="text-white/50 text-[8px]">•</span>}
                            {visibleIndices.map((index: number) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImageIndex(index);
                                }}
                                className={`slider-dot rounded-full transition-all touch-manipulation ${
                                  selectedImageIndex === index
                                    ? 'w-4 h-1.5 bg-white'
                                    : 'w-1.5 h-1.5 bg-white/50'
                                }`}
                                aria-label={`Photo ${index + 1}`}
                              />
                            ))}
                            {endIdx < totalImages && <span className="text-white/50 text-[8px]">•</span>}
                          </>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Price Hero Card - Only visible on mobile */}
            <div className="lg:hidden bg-gradient-to-r from-[#E74035] to-[#D63930] p-4">
              <div className="flex items-center justify-between">
                {/* Price Section */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">${Math.round(perNightPrice)}</span>
                    <span className="text-white/80 text-sm font-medium">/night</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/90 text-xs font-medium">
                      ${Math.round(activeRoomPrice)} total · {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                    {activeRoom?.refundable && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px] text-white font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Free cancel
                      </span>
                    )}
                  </div>
                </div>
                {/* Star Rating */}
                {(hotel.starRating || hotel.star_rating) && (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-0.5 mb-1">
                      {[...Array(Math.min(Math.floor(hotel.starRating || hotel.star_rating || 0), 5))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#F7C928] text-[#F7C928]" />
                      ))}
                    </div>
                    {hotel.reviewRating && parseFloat(hotel.reviewRating) > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-white font-bold text-sm">{parseFloat(hotel.reviewRating).toFixed(1)}</span>
                        <span className="text-white/70 text-xs">
                          {parseFloat(hotel.reviewRating) >= 4.5 ? 'Excellent' : parseFloat(hotel.reviewRating) >= 4.0 ? 'Very Good' : 'Good'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Booking Info Bar - Mobile optimized */}
            <div className="bg-white border-b border-gray-100 lg:border lg:rounded-xl lg:mt-3">
              {/* Mobile: Compact 2-row layout */}
              <div className="lg:hidden p-3">
                {/* Row 1: Dates */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#E74035]/10 to-[#E74035]/5 rounded-xl flex-1">
                      <div className="flex items-center justify-center w-8 h-8 bg-[#E74035] rounded-lg">
                        <LogIn className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Check-in</p>
                        <p className="text-sm font-bold text-gray-800">
                          {checkIn ? new Date(checkIn + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl flex-1">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-400 rounded-lg">
                        <LogOut className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Check-out</p>
                        <p className="text-sm font-bold text-gray-800">
                          {checkOut ? new Date(checkOut + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Row 2: Nights, Guests, Rooms */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F7C928]/15 rounded-xl">
                    <Clock className="w-4 h-4 text-[#F7C928]" />
                    <span className="text-sm font-bold text-gray-800">{nights}</span>
                    <span className="text-xs text-gray-500">{nights === 1 ? 'Night' : 'Nights'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 rounded-xl">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-bold text-gray-800">{totalGuests}</span>
                    <span className="text-xs text-gray-500">{totalGuests === 1 ? 'Guest' : 'Guests'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 rounded-xl">
                    <BedDouble className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-bold text-gray-800">{rooms}</span>
                    <span className="text-xs text-gray-500">{parseInt(rooms) === 1 ? 'Room' : 'Rooms'}</span>
                  </div>
                </div>
              </div>

              {/* Desktop: Original compact layout */}
              <div className="hidden lg:block p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E74035]/10 rounded-lg">
                      <LogIn className="w-3.5 h-3.5 text-[#E74035]" />
                      <span className="text-xs font-bold text-gray-800">
                        {checkIn ? new Date(checkIn + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Check-in'}
                      </span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-300" />
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg">
                      <LogOut className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-bold text-gray-800">
                        {checkOut ? new Date(checkOut + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Check-out'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(hotel.starRating || hotel.star_rating) && (
                      <div className="flex items-center gap-0.5 px-2 py-1 bg-[#F7C928]/20 rounded-lg">
                        {[...Array(Math.min(Math.floor(hotel.starRating || hotel.star_rating || 0), 5))].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#F7C928] text-[#F7C928]" />
                        ))}
                      </div>
                    )}
                    <span className="text-xs font-bold text-gray-700 px-2 py-1 bg-gray-100 rounded-lg">{nights}N</span>
                    <span className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-50 rounded-lg">{totalGuests} Guest · {rooms} Room</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hotel Info - Mobile Optimized */}
            <div className="bg-white border-b lg:border lg:rounded-xl border-gray-100 lg:mt-2">
              {/* Description - Expandable on mobile */}
              {hotel.description && (
                <div className="p-3 lg:p-4 border-b border-gray-50">
                  <div className="relative">
                    <p className={`text-sm text-gray-600 leading-relaxed ${!showFullDescription ? 'line-clamp-2 lg:line-clamp-none' : ''}`}>
                      {hotel.description}
                    </p>
                    {hotel.description.length > 120 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="lg:hidden text-[#E74035] text-xs font-semibold mt-1"
                      >
                        {showFullDescription ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Important Info */}
              {hotel.hotelImportantInformation && (
                <div className="mx-3 my-2 p-2 bg-[#F7C928]/10 rounded-lg border border-[#F7C928]/30">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#E74035] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 line-clamp-2">{hotel.hotelImportantInformation.split('\n')[0]}</p>
                  </div>
                </div>
              )}

              {/* Amenities - Horizontal scroll on mobile, wrap on desktop */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="p-3 lg:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Amenities</span>
                    <span className="text-[10px] text-gray-400">({hotel.amenities.length})</span>
                  </div>

                  {/* Mobile: Horizontal scrolling container */}
                  <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-3 px-3">
                    <div className="flex gap-1.5 pb-1" style={{ width: 'max-content' }}>
                      {hotel.amenities.map((amenity: string, idx: number) => {
                        const { icon, color } = getAmenityIcon(amenity);
                        return (
                          <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full text-[11px] text-gray-700 whitespace-nowrap">
                            <span className={`${color} [&>svg]:w-3.5 [&>svg]:h-3.5`}>{icon}</span>
                            <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop: Wrapped grid */}
                  <div className="hidden lg:flex flex-wrap gap-1.5">
                    {(showAllAmenities ? hotel.amenities : hotel.amenities.slice(0, 12)).map((amenity: string, idx: number) => {
                      const { icon, color } = getAmenityIcon(amenity);
                      return (
                        <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full text-xs text-gray-700">
                          <span className={color}>{icon}</span>
                          <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                        </div>
                      );
                    })}
                    {!showAllAmenities && hotel.amenities.length > 12 && (
                      <button
                        onClick={() => setShowAllAmenities(true)}
                        className="px-2 py-1 bg-[#E74035]/10 text-[#E74035] rounded-full text-xs font-medium hover:bg-[#E74035]/20 transition-colors"
                      >
                        +{hotel.amenities.length - 12} more
                      </button>
                    )}
                    {showAllAmenities && hotel.amenities.length > 12 && (
                      <button
                        onClick={() => setShowAllAmenities(false)}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                      >
                        Show less
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Room Listings - Apple Level 6 Mobile Design */}
            {hotel.rates && hotel.rates.length > 0 && (
              <div className="bg-white border-b lg:border lg:rounded-xl border-gray-100 lg:mt-2">
                {/* Premium Header with Filter Toggle */}
                <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-50">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 bg-[#E74035]/10 rounded-lg">
                      <BedDouble className="w-4 h-4 text-[#E74035]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Choose Your Room</h2>
                      <p className="text-[11px] text-gray-500">{filteredRooms.length} {filteredRooms.length === 1 ? 'option' : 'options'} available</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all touch-manipulation ${
                      showFilters
                        ? 'bg-[#E74035] text-white'
                        : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                </div>

                {/* Filter Controls - Premium Pill Style */}
                {showFilters && (
                  <div className="p-3 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 pb-1">
                      <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-white text-gray-700 min-w-fit appearance-none cursor-pointer"
                      >
                        <option value="all">Any Price</option>
                        <option value="under150">Under $150</option>
                        <option value="150-300">$150-$300</option>
                        <option value="over300">$300+</option>
                      </select>
                      <select
                        value={bedTypeFilter}
                        onChange={(e) => setBedTypeFilter(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-white text-gray-700 min-w-fit appearance-none cursor-pointer"
                      >
                        <option value="all">Any Bed</option>
                        <option value="king">King</option>
                        <option value="queen">Queen</option>
                        <option value="twin">Twin</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-white text-gray-700 min-w-fit appearance-none cursor-pointer"
                      >
                        <option value="price">Lowest Price</option>
                        <option value="price-desc">Highest Price</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Room Cards - Single column on mobile for better readability */}
                <div className="p-3 lg:p-4">
                  {filteredRooms.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-2xl">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <BedDouble className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-1">No rooms match your filters</p>
                      <button
                        onClick={() => { setPriceFilter('all'); setBedTypeFilter('all'); }}
                        className="text-xs text-[#E74035] font-semibold"
                      >
                        Clear all filters
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Mobile: 2 columns, Desktop: 4 columns */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {(showAllRooms ? filteredRooms : filteredRooms.slice(0, INITIAL_ROOMS_TO_SHOW)).map((room: any, index: number) => {
                          const roomPrice = parseFloat(room.totalPrice?.amount || 0);
                          const currency = room.totalPrice?.currency || 'USD';
                          const roomName = room.roomName || room.name || `Room Option ${index + 1}`;
                          const maxGuests = room.maxGuests || 2;
                          const isRefundable = room.refundable || false;
                          const breakfastIncluded = room.breakfastIncluded || false;

                          const roomNights = hotel.checkOut && hotel.checkIn
                            ? Math.max(1, Math.ceil((new Date(hotel.checkOut).getTime() - new Date(hotel.checkIn).getTime()) / 86400000))
                            : 1;

                          const transformedRoom = {
                            ...room,
                            roomType: roomName,
                            maxOccupancy: maxGuests,
                            boardType: breakfastIncluded ? 'breakfast' : 'room_only',
                            refundable: isRefundable,
                          };

                          const isThisRoomSelected = selectedRoom?.id === room.id ||
                            (selectedRoom && !selectedRoom.id && !room.id && selectedRoom.name === room.name);

                          return (
                            <CompactRoomCard
                              key={room.id || index}
                              room={transformedRoom}
                              nights={roomNights}
                              rooms={roomsNum}
                              currency={currency}
                              isSelected={isThisRoomSelected}
                              onSelect={() => setSelectedRoom(room)}
                              lang="en"
                            />
                          );
                        })}
                      </div>

                      {/* Load More - Premium Style */}
                      {!showAllRooms && filteredRooms.length > INITIAL_ROOMS_TO_SHOW && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => setShowAllRooms(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E74035] to-[#D63930] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#E74035]/20 active:scale-[0.98] transition-all touch-manipulation"
                          >
                            <span>View {filteredRooms.length - INITIAL_ROOMS_TO_SHOW} More Rooms</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {showAllRooms && filteredRooms.length > INITIAL_ROOMS_TO_SHOW && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => setShowAllRooms(false)}
                            className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl active:bg-gray-200 transition-all touch-manipulation"
                          >
                            Show Less
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
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
                  <div className="bg-gradient-to-br from-amber-50 to-primary-50 rounded-xl p-4 mb-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Estimated Price</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">
                          ${parseFloat(hotel.rates[0].totalPrice?.amount || '0').toFixed(0)}
                          <span className="text-sm font-normal text-slate-500 ml-1">total for {nights} nights</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600">
                          ~${(parseFloat(hotel.rates[0].totalPrice?.amount || '0') / nights / roomsNum).toFixed(0)}
                        </p>
                        <p className="text-xs text-slate-500">{roomsNum > 1 ? 'per room/night' : 'per night'}</p>
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
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

            {/* Reviews Section - Apple Level 6 */}
            <div className="bg-white border-b lg:border lg:rounded-xl border-gray-100 lg:mt-2">
              {/* Premium Header */}
              <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 bg-[#F7C928]/20 rounded-lg">
                    <Star className="w-4 h-4 text-[#F7C928] fill-[#F7C928]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Guest Reviews</h2>
                    {reviewCount > 0 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-sm font-bold text-gray-800">{averageRating.toFixed(1)}</span>
                        <span className="text-[11px] text-gray-500">
                          {averageRating >= 4.5 ? 'Excellent' : averageRating >= 4.0 ? 'Very Good' : 'Good'}
                        </span>
                        <span className="text-[11px] text-gray-400">· {reviewCount} reviews</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3 lg:p-4">
                <HotelReviews hotelId={hotelId} hotelName={hotel?.name} showSummary={true} maxReviews={6} />
              </div>
            </div>

            {/* Trust Badges - Mobile Optimized */}
            <div className="bg-white border-b lg:border-none lg:bg-transparent lg:mt-2">
              <div className="p-3 lg:p-0">
                <HotelTrustBadges variant="full" />
              </div>
            </div>

            {/* More Hotels Suggestions Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mt-4">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-gray-900">More Hotels in {hotel.address?.city || 'this area'}</h3>
                <p className="text-sm text-gray-500 mt-0.5">Similar properties you might like</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Placeholder cards - would be populated from API */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="group cursor-pointer" onClick={() => router.push(`/hotels/results?destination=${encodeURIComponent(hotel.address?.city || '')}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`)}>
                      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Hotel className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-xs font-semibold">Explore More</p>
                          <p className="text-white/70 text-[10px]">{hotel.address?.city}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push(`/hotels/results?destination=${encodeURIComponent(hotel.address?.city || '')}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`)}
                  className="w-full mt-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
                >
                  View All Hotels in {hotel.address?.city || 'Area'} →
                </button>
              </div>
            </div>

            {/* App Download Banner - Mobile (subtle, above bottom bar) */}
            <div className="lg:hidden bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg overflow-hidden mt-4 mx-1">
              <div className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">Get 5% Off in the App</p>
                  <p className="text-white/80 text-xs">Exclusive deals & instant booking</p>
                </div>
                <button className="px-3 py-2 bg-white text-primary-600 font-bold text-xs rounded-lg flex-shrink-0 active:scale-95 transition-transform">
                  Get App
                </button>
              </div>
            </div>

            {/* Mobile Bottom Spacer - Gives room for floating CTA */}
            <div className="lg:hidden h-40" />

            {/* Desktop Bottom Spacer */}
            <div className="hidden lg:block h-8" />
          </div>

          {/* Premium Booking Sidebar - Hidden on mobile (mobile CTA at bottom) */}
          <div className="hidden lg:block lg:col-span-1 px-3 sm:px-0">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 sticky top-24 overflow-hidden">
              {/* Premium Price Header - Shows Selected Room */}
              <div className={`p-5 ${usingEstimatedPricing ? 'bg-gradient-to-r from-amber-500 to-primary-500' : 'bg-gradient-to-r from-primary-500 to-primary-600'}`}>
                {/* Estimated Price Warning Badge */}
                {usingEstimatedPricing && (
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
                  <span className="text-primary-100 text-lg mb-1">{roomsNum > 1 ? '/room/night' : '/night'}</span>
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
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary-100 flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-primary-600" />
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
                    const roomCurrency = activeRoom?.totalPrice?.currency || activeRoom?.currency || urlCurrency || 'USD';
                    // Use fallback offerId when no valid offerId from API
                    const roomOfferId = activeRoom?.offerId || activeRoom?.id || (usingEstimatedPricing ? `fallback-${hotelId}` : '');
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
                  className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all mb-4 flex items-center justify-center gap-2"
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
                      <MapPin className="w-4 h-4 text-primary-500" />
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
                            <MapPin className="w-6 h-6 text-primary-500" />
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
                      className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1.5 justify-center py-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
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
                    className="w-full py-2.5 border border-slate-200 text-slate-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    View Similar Hotels
                  </button>
                </div>
              </div>
            </div>

            {/* App Download Banner - Desktop with QR Code */}
            <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl shadow-xl overflow-hidden mt-4">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-lg">📱</span>
                  </div>
                  <h3 className="text-white font-bold text-sm">Get the Fly2Any App</h3>
                </div>
                <div className="bg-white rounded-xl p-3 mb-3">
                  {/* QR Code placeholder - would be real QR in production */}
                  <div className="w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-2 border-2 border-dashed border-slate-300 rounded-lg" />
                    <div className="text-center z-10">
                      <div className="text-3xl mb-1">📲</div>
                      <p className="text-[10px] text-slate-500 font-medium">Scan to Download</p>
                    </div>
                    {/* QR pattern decoration */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-2 border-slate-800 border-r-0 border-b-0" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-2 border-slate-800 border-l-0 border-b-0" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-2 border-slate-800 border-r-0 border-t-0" />
                  </div>
                </div>
                <div className="space-y-2 text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                    <span className="text-xs font-medium">5% OFF all hotel bookings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                    <span className="text-xs font-medium">Exclusive app-only deals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                    <span className="text-xs font-medium">Instant booking confirmations</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 bg-black rounded-lg px-2 py-1.5 flex items-center justify-center gap-1">
                    <span className="text-white text-[10px]">App Store</span>
                  </div>
                  <div className="flex-1 bg-black rounded-lg px-2 py-1.5 flex items-center justify-center gap-1">
                    <span className="text-white text-[10px]">Google Play</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA Bar - Apple Level 6 Premium */}
      {showMobileCTA && (
        <div
          className="lg:hidden fixed left-0 right-0 z-40 animate-in slide-in-from-bottom-4 duration-300"
          style={{ bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Premium glass morphism background */}
          <div className="mx-2 mb-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
            {/* Selected room indicator */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 py-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] font-medium text-gray-600 truncate max-w-[180px]">
                    {activeRoomName}
                  </span>
                </div>
                {activeRoom?.refundable && (
                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Free cancel
                  </span>
                )}
              </div>
            </div>

            {/* Main CTA content */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* Price section */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-gray-900">${Math.round(perNightPrice)}</span>
                    <span className="text-sm text-gray-500 font-medium">/night</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">${Math.round(activeRoomPrice)}</span> total
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500">{nights}N · {totalGuests} guest{totalGuests > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Book button - Premium gradient with haptic feedback style */}
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
                      nights: nights,
                    };
                    sessionStorage.setItem(`hotel_booking_${hotelId}`, JSON.stringify(bookingData));
                    router.push(`/hotels/booking?hotelId=${hotelId}&offerId=${encodeURIComponent(roomOfferId)}&name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(bookingData.location)}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&nights=${nights}&adults=${adultsNum}&children=${childrenNum}&rooms=${roomsNum}&roomId=${encodeURIComponent(bookingData.roomId)}&roomName=${encodeURIComponent(activeRoomName)}&price=${activeRoomPrice}&perNight=${activeRoomPerNight}&currency=${roomCurrency}&image=${encodeURIComponent(mainImage || '')}&stars=${hotel.starRating || 0}&refundable=${bookingData.refundable}&breakfastIncluded=${bookingData.breakfastIncluded}`);
                  }}
                  className="relative px-6 py-3 bg-gradient-to-r from-[#E74035] to-[#D63930] text-white font-bold text-base rounded-xl shadow-lg shadow-[#E74035]/25 active:scale-[0.97] active:shadow-md transition-all duration-150 touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <span className="relative z-10">Reserve</span>
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
                </button>
              </div>
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
