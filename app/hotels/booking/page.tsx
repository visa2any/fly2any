'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Hotel, Loader2, User, CreditCard, MapPin, Calendar, Users as UsersIcon,
  AlertCircle, CheckCircle2, Clock, Shield, Lock, Phone, Mail, Star, BedDouble,
  Coffee, Utensils, Check, ChevronLeft, Timer, Sparkles, Gift, Award
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripePaymentForm } from '@/components/hotels/StripePaymentForm';
import { LiteAPIPaymentForm } from '@/components/hotels/LiteAPIPaymentForm';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import PromoCodeInput, { PromoDiscount } from '@/components/hotels/PromoCodeInput';
import { BNPLPromotion } from '@/components/hotels/BNPLPromotion';

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// ===========================
// TYPE DEFINITIONS
// ===========================

interface GuestData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

interface PrebookData {
  prebookId: string;
  status: 'confirmed' | 'pending' | 'failed';
  price: { amount: number; currency: string };
  expiresAt: string;
  // User Payment SDK fields (for LiteAPI payment flow)
  secretKey?: string;
  transactionId?: string;
}

interface HotelBookingData {
  hotelId: string;
  offerId: string;
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  rooms: number;
  roomId: string;
  roomName: string;
  price: number;
  perNightPrice: number;
  currency: string;
  imageUrl?: string;
  starRating?: number;
  refundable: boolean;
  breakfastIncluded: boolean;
}

// ===========================
// MAIN COMPONENT
// ===========================

function HotelCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // States
  const [loading, setLoading] = useState(true);
  const [prebooking, setPrebooking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Hotel & booking data
  const [hotelData, setHotelData] = useState<HotelBookingData | null>(null);
  const [prebookData, setPrebookData] = useState<PrebookData | null>(null);

  // Guest details
  const [guest, setGuest] = useState<GuestData>({
    title: '',
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    phone: '',
    specialRequests: '',
  });

  // Payment
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Ref to prevent duplicate prebook calls (important for React Strict Mode / Fast Refresh)
  const prebookCalledRef = useRef(false);
  const [paymentReady, setPaymentReady] = useState(false);

  // LiteAPI Payment SDK
  const [liteApiTransactionId, setLiteApiTransactionId] = useState<string | null>(null);

  // Price lock timer
  const [timeRemaining, setTimeRemaining] = useState<number>(900); // 15 minutes in seconds

  // Promo code state
  const [promoCode, setPromoCode] = useState<string | undefined>(undefined);
  const [promoDiscount, setPromoDiscount] = useState<PromoDiscount | undefined>(undefined);

  // Loyalty points (if user is logged in)
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);

  // ===========================
  // LOAD DATA ON MOUNT
  // ===========================

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        // Clear old prebook caches (cache version 1) on page load
        // This ensures Payment SDK fix takes effect immediately
        const CACHE_VERSION = 3; // Incremented: Fixed SDK publicKey matching
        try {
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key?.startsWith('prebook_')) {
              const data = sessionStorage.getItem(key);
              if (data) {
                const parsed = JSON.parse(data);
                if ((parsed._cacheVersion || 1) < CACHE_VERSION) {
                  console.log(`🧹 Clearing old cache: ${key}`);
                  sessionStorage.removeItem(key);
                }
              }
            }
          }
        } catch (e) {
          // Ignore cache cleanup errors
        }

        const hotelId = searchParams.get('hotelId');
        const offerId = searchParams.get('offerId');

        if (!hotelId) {
          router.push('/hotels');
          return;
        }

        // Load from URL params
        const checkIn = searchParams.get('checkIn') || '';
        const checkOut = searchParams.get('checkOut') || '';
        const nights = parseInt(searchParams.get('nights') || '1', 10);
        const adults = parseInt(searchParams.get('adults') || '2', 10);
        const children = parseInt(searchParams.get('children') || '0', 10);
        const rooms = parseInt(searchParams.get('rooms') || '1', 10);
        const price = parseFloat(searchParams.get('price') || '0');
        const perNight = parseFloat(searchParams.get('perNight') || '0');
        const currency = searchParams.get('currency') || 'USD';

        const bookingData: HotelBookingData = {
          hotelId,
          offerId: offerId || '',
          hotelName: searchParams.get('name') || 'Hotel',
          location: searchParams.get('location') || '',
          checkIn,
          checkOut,
          nights: nights || 1,
          adults,
          children,
          rooms: rooms || 1,
          roomId: searchParams.get('roomId') || '',
          roomName: searchParams.get('roomName') || 'Standard Room',
          price: price || 0,
          perNightPrice: perNight || price / (nights || 1) / (rooms || 1),
          currency,
          imageUrl: searchParams.get('image') || undefined,
          starRating: parseInt(searchParams.get('stars') || '0', 10) || undefined,
          refundable: searchParams.get('refundable') === 'true',
          breakfastIncluded: searchParams.get('breakfastIncluded') === 'true',
        };

        setHotelData(bookingData);
        setLoading(false);

        // PRODUCTION READY: Validate we have required data
        if (!offerId) {
          setError('Missing offer ID. Please go back and select a room with valid pricing.');
          return;
        }

        // Check if this is a fallback rate (estimated pricing, no real-time API data)
        const isFallbackRate = offerId.startsWith('fallback-');

        if (isFallbackRate) {
          // For fallback rates, skip prebook but show warning
          console.warn('⚠️ Using fallback pricing - real-time rates unavailable');
          // Set a mock prebook with the URL price
          setPrebookData({
            prebookId: `estimated-${hotelId}`,
            status: 'pending',
            price: { amount: price, currency: currency },
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min from now
          });
          setError('Price Not Available. Unable to retrieve real-time pricing. The displayed price is an estimate from your search. Please go back and refresh rates, or contact the hotel directly to confirm availability and pricing.');
          setPrebooking(false);
        } else {
          // Try to prebook to lock in price - this is CRITICAL for production
          // Use ref to prevent duplicate calls (React Strict Mode / Fast Refresh)
          if (offerId && !prebookCalledRef.current) {
            prebookCalledRef.current = true;
            await callPrebookAPI(offerId, hotelId);
          }
        }

        // Create Stripe payment intent ONLY if Stripe is configured
        // When using LiteAPI User Payment SDK, this is NOT needed
        if (price > 0 && stripePromise && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
          await createPaymentIntent(price, currency, hotelId, bookingData.roomName);
        }
      } catch (err) {
        console.error('Error loading booking data:', err);
        setError('Failed to load booking data. Please try again.');
        setLoading(false);
      }
    };

    loadBookingData();
  }, [searchParams, router]);

  // Price lock countdown timer
  useEffect(() => {
    if (!prebookData?.expiresAt) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(prebookData.expiresAt);
      const now = new Date();
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeRemaining(diff);

      if (diff === 0) {
        setError('Price lock has expired. Please go back and try again.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prebookData?.expiresAt]);

  // Store pending booking data for redirect-based payments (3D Secure, BNPL, etc.)
  // This data is retrieved by /hotels/booking/confirm after redirect
  useEffect(() => {
    if (!hotelData || !prebookData) return;

    // Store booking display data (for confirmation page UI)
    const pendingBookingData = {
      hotelName: hotelData.hotelName,
      hotelImage: hotelData.imageUrl,
      location: hotelData.location,
      roomName: hotelData.roomName,
      checkIn: hotelData.checkIn,
      checkOut: hotelData.checkOut,
      nights: hotelData.nights,
      adults: hotelData.adults,
      totalPrice: getGrandTotal(),
      currency: hotelData.currency,
      guestName: guest.firstName && guest.lastName ? `${guest.firstName} ${guest.lastName}` : undefined,
      guestEmail: guest.email,
    };

    try {
      sessionStorage.setItem('pending_booking_data', JSON.stringify(pendingBookingData));
    } catch (e) {
      console.warn('Could not store pending booking data');
    }

    // Store full booking details (for API call after redirect)
    if (isGuestValid()) {
      const pendingBookingDetails = {
        hotelId: hotelData.hotelId,
        hotelName: hotelData.hotelName,
        hotelCity: hotelData.location.split(',')[0]?.trim() || hotelData.location,
        hotelCountry: hotelData.location.split(',').pop()?.trim() || 'Unknown',
        roomId: hotelData.roomId,
        roomName: hotelData.roomName,
        checkInDate: hotelData.checkIn,
        checkOutDate: hotelData.checkOut,
        nights: hotelData.nights,
        pricePerNight: hotelData.perNightPrice.toString(),
        subtotal: hotelData.price.toString(),
        taxesAndFees: (hotelData.price * 0.12).toString(),
        totalPrice: getGrandTotal().toString(),
        currency: hotelData.currency,
        guestTitle: guest.title,
        guestFirstName: guest.firstName,
        guestLastName: guest.lastName,
        guestEmail: guest.email,
        guestPhone: guest.phone,
        specialRequests: guest.specialRequests || '',
        prebookId: prebookData?.prebookId,
        breakfastIncluded: hotelData.breakfastIncluded,
        cancellable: hotelData.refundable,
      };

      try {
        sessionStorage.setItem('pending_booking_details', JSON.stringify(pendingBookingDetails));
      } catch (e) {
        console.warn('Could not store pending booking details');
      }
    }
  }, [hotelData, prebookData, guest, promoDiscount]);

  // ===========================
  // API CALLS
  // ===========================

  const callPrebookAPI = async (offerId: string, hotelId: string) => {
    // Cache version - increment when prebook response structure changes
    const CACHE_VERSION = 3; // Incremented: Fixed SDK publicKey matching

    // Check if we have cached prebook data from a previous successful call (survives Fast Refresh)
    const cacheKey = `prebook_${offerId}`;
    try {
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);

        // Invalidate cache if version mismatch or expired
        const cacheVersion = parsed._cacheVersion || 1;
        if (cacheVersion !== CACHE_VERSION) {
          console.log(`🔄 Cache version mismatch (${cacheVersion} !== ${CACHE_VERSION}), clearing old cache`);
          sessionStorage.removeItem(cacheKey);
        } else {
          // Verify cache is still valid (not expired)
          const expiresAt = new Date(parsed.expiresAt);
          if (expiresAt > new Date()) {
            console.log('📦 Using cached prebook data:', parsed);
            setPrebookData(parsed);
            if (parsed.price?.amount && parsed.price.amount > 0) {
              setHotelData(prev => prev ? {
                ...prev,
                price: parsed.price.amount,
                perNightPrice: parsed.price.amount / (prev.nights || 1) / (prev.rooms || 1),
                currency: parsed.price.currency || prev.currency,
              } : prev);
            }
            setPrebooking(false);
            return;
          } else {
            // Cache expired, remove it
            sessionStorage.removeItem(cacheKey);
          }
        }
      }
    } catch (e) {
      // Ignore cache errors
    }

    try {
      setPrebooking(true);
      const response = await fetch('/api/hotels/prebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, hotelId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setPrebookData(data.data);
          console.log('🔒 Price locked:', data.data);

          // Cache the successful prebook data to survive Fast Refresh
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              ...data.data,
              _cacheVersion: CACHE_VERSION // Add version for cache invalidation
            }));
          } catch (e) {
            // Ignore storage errors
          }

          // CRITICAL: Update hotelData with ACTUAL prebook price from LiteAPI
          // This ensures we use the real locked-in price, not URL params
          if (data.data.price?.amount && data.data.price.amount > 0) {
            setHotelData(prev => prev ? {
              ...prev,
              price: data.data.price.amount,
              perNightPrice: data.data.price.amount / (prev.nights || 1) / (prev.rooms || 1),
              currency: data.data.price.currency || prev.currency,
            } : prev);
            console.log('✅ Price updated from prebook:', data.data.price.amount, data.data.price.currency);
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Prebook failed:', errorData);
        // Don't fail silently - show error if prebook fails
        if (errorData.code === 'ROOM_UNAVAILABLE') {
          setError('This room is no longer available. Please go back and select another room.');
        }
      }
    } catch (err) {
      console.error('Prebook API error:', err);
      // Don't fail silently in production
    } finally {
      setPrebooking(false);
    }
  };

  const createPaymentIntent = async (amount: number, currency: string, hotelId: string, roomName: string) => {
    try {
      // Calculate total with taxes (12%)
      const taxes = amount * 0.12;
      const total = amount + taxes;

      const response = await fetch('/api/hotels/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency,
          hotelId,
          roomName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setPaymentReady(true);
      }
    } catch (err) {
      console.warn('Payment intent creation skipped (demo mode):', err);
      setPaymentReady(true); // Allow demo bookings
    }
  };

  // ===========================
  // HANDLERS
  // ===========================

  const handleGuestUpdate = (field: keyof GuestData, value: string) => {
    setGuest(prev => ({ ...prev, [field]: value }));
  };

  const isGuestValid = () => {
    return guest.title && guest.firstName && guest.lastName && guest.email && guest.phone;
  };

  const handlePaymentSuccess = async (confirmedPaymentIntentId: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      if (!hotelData) {
        throw new Error('Hotel data is missing');
      }

      // Create booking in database
      const response = await fetch('/api/hotels/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: hotelData.hotelId,
          hotelName: hotelData.hotelName,
          hotelCity: hotelData.location.split(',')[0]?.trim() || hotelData.location,
          hotelCountry: hotelData.location.split(',').pop()?.trim() || 'Unknown',
          roomId: hotelData.roomId,
          roomName: hotelData.roomName,
          checkInDate: hotelData.checkIn,
          checkOutDate: hotelData.checkOut,
          nights: hotelData.nights,
          pricePerNight: hotelData.perNightPrice.toString(),
          subtotal: hotelData.price.toString(),
          taxesAndFees: (hotelData.price * 0.12).toString(),
          totalPrice: (hotelData.price * 1.12).toString(),
          currency: hotelData.currency,
          guestTitle: guest.title,
          guestFirstName: guest.firstName,
          guestLastName: guest.lastName,
          guestEmail: guest.email,
          guestPhone: guest.phone,
          specialRequests: guest.specialRequests || '',
          paymentIntentId: confirmedPaymentIntentId,
          prebookId: prebookData?.prebookId,
          breakfastIncluded: hotelData.breakfastIncluded,
          cancellable: hotelData.refundable,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const booking = await response.json();

      // Redirect to confirmation page
      router.push(`/hotels/booking/confirmation?bookingId=${booking.id || booking.data?.dbBookingId}&ref=${booking.confirmationNumber || booking.data?.confirmationNumber}`);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to complete booking. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
  };

  // LiteAPI Payment SDK - callback when payment is successful
  const handleLiteAPIPaymentSuccess = async (transactionId: string) => {
    console.log('LiteAPI Payment Success! Transaction ID:', transactionId);
    setLiteApiTransactionId(transactionId);

    if (!isGuestValid()) {
      setError('Please fill in all guest details');
      return;
    }

    // PRODUCTION: Require valid prebook for real bookings
    if (!prebookData?.prebookId) {
      setError('Price lock expired or not available. Please go back and try again.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Complete booking with LiteAPI transactionId
      await handlePaymentSuccess(`liteapi_transaction_${transactionId}`);
    } catch (err: any) {
      setError(err.message || 'Booking failed');
      setIsProcessing(false);
    }
  };

  // LiteAPI Payment SDK - callback when payment fails
  const handleLiteAPIPaymentError = (errorMessage: string) => {
    console.error('LiteAPI Payment Error:', errorMessage);
    setError(errorMessage);
    setIsProcessing(false);
  };

  // LiteAPI booking - uses prebook + LiteAPI payment processing (fallback for no SDK)
  const handleLiteAPIBooking = async () => {
    if (!isGuestValid()) {
      setError('Please fill in all guest details');
      return;
    }

    // PRODUCTION: Require valid prebook for real bookings
    if (!prebookData?.prebookId) {
      setError('Price lock expired or not available. Please go back and try again.');
      return;
    }

    // PRODUCTION: Require valid price
    if (hotelData?.price === 0 && !prebookData?.price?.amount) {
      setError('Invalid price. Please go back and select a room with valid pricing.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Use LiteAPI payment flow with prebookId
      await handlePaymentSuccess(`liteapi_${prebookData.prebookId}`);
    } catch (err: any) {
      setError(err.message || 'Booking failed');
      setIsProcessing(false);
    }
  };

  // Legacy alias for backward compatibility
  const handleDemoBooking = handleLiteAPIBooking;

  // ===========================
  // PRICE CALCULATION
  // ===========================

  const getSubtotal = () => hotelData?.price || 0;
  const getTaxesAndFees = () => (hotelData?.price || 0) * 0.12;

  // Calculate promo discount amount
  const getPromoDiscountAmount = () => {
    if (!promoDiscount || !hotelData) return 0;

    // If API calculated it, use that
    if (promoDiscount.discountAmount !== undefined) {
      return promoDiscount.discountAmount;
    }

    const subtotal = getSubtotal();
    if (promoDiscount.minPurchase && subtotal < promoDiscount.minPurchase) {
      return 0;
    }

    let discount = 0;
    if (promoDiscount.type === 'percentage') {
      discount = (subtotal * promoDiscount.value) / 100;
      if (promoDiscount.maxDiscount) {
        discount = Math.min(discount, promoDiscount.maxDiscount);
      }
    } else if (promoDiscount.type === 'fixed') {
      discount = promoDiscount.value;
    }

    return Math.min(discount, subtotal);
  };

  const getGrandTotal = () => getSubtotal() + getTaxesAndFees() - getPromoDiscountAmount();

  // Promo code handlers
  const handlePromoApply = (code: string, discount: PromoDiscount) => {
    setPromoCode(code);
    setPromoDiscount(discount);
  };

  const handlePromoRemove = () => {
    setPromoCode(undefined);
    setPromoDiscount(undefined);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ===========================
  // LOADING STATE
  // ===========================

  if (loading || !hotelData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  // ===========================
  // RENDER
  // ===========================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      {/* Header - Full width mobile */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="w-full lg:max-w-7xl lg:mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href={`/hotels/${hotelData.hotelId}?checkIn=${hotelData.checkIn}&checkOut=${hotelData.checkOut}&adults=${hotelData.adults}&children=${hotelData.children}&rooms=1`}
                className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium">Back</span>
              </Link>
              <div className="h-5 sm:h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Hotel className="w-4 sm:w-5 h-4 sm:h-5 text-primary-500" />
                <h1 className="text-sm sm:text-lg font-bold text-gray-900">Checkout</h1>
              </div>
            </div>

            {/* Price Lock Timer - Compact on mobile */}
            {prebookData && timeRemaining > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-primary-50 border border-primary-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                <Timer className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary-600" />
                <span className="text-xs sm:text-sm font-bold text-primary-700">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}

            {/* Trust Badges - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-green-600" />
                <span>SSL</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-primary-600" />
                <span>PCI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message - Full width mobile */}
      {error && (
        <div className="w-full lg:max-w-7xl lg:mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
          <div className="bg-red-50 border border-red-200 rounded-none sm:rounded-xl p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
            <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-red-900">Error</p>
              <p className="text-xs sm:text-sm text-red-700 mt-0.5 sm:mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 text-lg sm:text-xl">
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Full width mobile, 2 Columns desktop */}
      <main className="w-full lg:max-w-7xl lg:mx-auto px-0 sm:px-4 py-3 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">

          {/* ========================= */}
          {/* LEFT COLUMN: Guest + Payment - Edge-to-edge mobile */}
          {/* ========================= */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 px-3 sm:px-0">

            {/* Guest Information - Compact, edge-to-edge mobile */}
            <div className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-gray-200 shadow-none sm:shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-3 sm:px-4 py-2.5 sm:py-3 text-white">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <User className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold">Guest Information</h2>
                    <p className="text-[10px] sm:text-xs text-white/80">Who's checking in?</p>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                {/* Name Row - More compact on mobile (stacked) */}
                <div className="grid grid-cols-3 sm:grid-cols-12 gap-2 sm:gap-2.5">
                  <div className="col-span-1 sm:col-span-3">
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">Title *</label>
                    <select
                      value={guest.title}
                      onChange={(e) => handleGuestUpdate('title', e.target.value)}
                      className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm"
                      required
                    >
                      <option value="">-</option>
                      <option value="Mr">Mr</option>
                      <option value="Ms">Ms</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>
                  <div className="col-span-1 sm:col-span-4">
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">First *</label>
                    <input
                      type="text"
                      value={guest.firstName}
                      onChange={(e) => handleGuestUpdate('firstName', e.target.value)}
                      placeholder="John"
                      className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-5">
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">Last *</label>
                    <input
                      type="text"
                      value={guest.lastName}
                      onChange={(e) => handleGuestUpdate('lastName', e.target.value)}
                      placeholder="Smith"
                      className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Contact Row - Compact */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">
                      <Mail className="w-2.5 sm:w-3 h-2.5 sm:h-3 inline mr-0.5 sm:mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={guest.email}
                      onChange={(e) => handleGuestUpdate('email', e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">
                      <Phone className="w-2.5 sm:w-3 h-2.5 sm:h-3 inline mr-0.5 sm:mr-1" />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={guest.phone}
                      onChange={(e) => handleGuestUpdate('phone', e.target.value)}
                      placeholder="+1 555 123 4567"
                      className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Special Requests - Compact */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-0.5 sm:mb-1">
                    Special Requests
                  </label>
                  <textarea
                    value={guest.specialRequests}
                    onChange={(e) => handleGuestUpdate('specialRequests', e.target.value)}
                    placeholder="Late check-in, high floor..."
                    rows={2}
                    className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Section - Compact, edge-to-edge mobile */}
            <div className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-gray-200 shadow-none sm:shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-3 sm:px-4 py-2.5 sm:py-3 text-white">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold">Payment</h2>
                    <p className="text-[10px] sm:text-xs text-white/80">Secure checkout</p>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                {/* Prebooking indicator - Compact */}
                {prebooking && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-900 font-medium">Locking in your price...</p>
                        <p className="text-xs text-blue-700 mt-0.5">
                          Securing your rate with the hotel.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PRODUCTION: Show error if no valid price - Compact */}
                {!prebooking && hotelData.price === 0 && !prebookData && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-900 font-medium">Price Not Available</p>
                        <p className="text-xs text-red-700 mt-0.5">
                          Unable to retrieve pricing. Please go back and select a room.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/hotels/${hotelData.hotelId}?checkIn=${hotelData.checkIn}&checkOut=${hotelData.checkOut}&adults=${hotelData.adults}&children=${hotelData.children}&rooms=1`}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Go back to select a room
                    </Link>
                  </div>
                )}

                {!stripePromise || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                  // LiteAPI Payment Mode - Using User Payment SDK (Compact)
                  <div className="space-y-3">
                    {prebooking ? (
                      // Loading state while prebook is in progress - Compact
                      <div className="text-center py-6">
                        <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm">Securing your rate...</p>
                        <p className="text-xs text-gray-500 mt-0.5">Locking in your price</p>
                      </div>
                    ) : prebookData?.secretKey ? (
                      // LiteAPI Payment SDK available - render secure payment form
                      <>
                        {!isGuestValid() && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3">
                            <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Please fill in all guest details above to enable payment
                            </p>
                          </div>
                        )}
                        <LiteAPIPaymentForm
                          secretKey={prebookData.secretKey}
                          transactionId={prebookData.transactionId || ''}
                          displayAmount={getGrandTotal()}
                          currency={hotelData.currency}
                          onPaymentSuccess={handleLiteAPIPaymentSuccess}
                          onPaymentError={handleLiteAPIPaymentError}
                          isProcessing={isProcessing}
                        />
                      </>
                    ) : (hotelData.price > 0 || prebookData?.price?.amount) ? (
                      // Secure Payment - Ready to process (Compact)
                      <>
                        <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Shield className="w-4 h-4 text-primary-600" />
                            <p className="text-sm text-primary-900 font-medium">Secure Payment Ready</p>
                          </div>
                          <p className="text-xs text-primary-700">
                            Protected with bank-level encryption and fraud protection.
                          </p>
                        </div>

                        <button
                          onClick={handleLiteAPIBooking}
                          disabled={!isGuestValid() || isProcessing || prebooking || !prebookData?.prebookId}
                          className={`w-full py-3.5 rounded-xl font-bold text-base shadow-lg transition-all transform ${
                            !isGuestValid() || isProcessing || prebooking || !prebookData?.prebookId
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-amber-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                          }`}
                        >
                          {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing Booking...
                            </span>
                          ) : prebooking ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Securing Rate...
                            </span>
                          ) : !prebookData?.prebookId ? (
                            <span className="flex items-center justify-center gap-2">
                              <AlertCircle className="w-5 h-5" />
                              Waiting for Price Lock...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Lock className="w-5 h-5" />
                              Complete Booking &bull; {hotelData.currency} {getGrandTotal().toFixed(2)}
                            </span>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-gray-500 text-sm">Waiting for price confirmation...</p>
                      </div>
                    )}
                  </div>
                ) : !clientSecret ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-7 h-7 animate-spin text-primary-500 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Initializing secure payment...</p>
                  </div>
                ) : (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#F97316',
                          colorText: '#1F2937',
                          fontFamily: 'system-ui, sans-serif',
                          borderRadius: '12px',
                        },
                      },
                    }}
                  >
                    <div className="space-y-3">
                      <StripePaymentForm
                        amount={getGrandTotal()}
                        currency={hotelData.currency}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        disabled={!isGuestValid() || isProcessing}
                      />
                      {!isGuestValid() && (
                        <p className="text-sm text-amber-600 text-center">
                          Please fill in all guest details above to enable payment
                        </p>
                      )}
                    </div>
                  </Elements>
                )}

                {/* Payment Trust Signals - Compact */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-green-600" />
                      <span>256-bit SSL</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-600" />
                      <span>PCI DSS</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-600" />
                      <span>3D Secure</span>
                    </div>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <span className="text-xs text-gray-400">Visa, Mastercard, Amex</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================= */}
          {/* RIGHT COLUMN: Booking Summary - Edge-to-edge mobile */}
          {/* ========================= */}
          <div className="lg:col-span-5 px-3 sm:px-0">
            <div className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-gray-200 shadow-none sm:shadow-sm overflow-hidden sticky top-20">
              {/* Header - Fly2Any colors */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-3 sm:p-4 py-2.5 sm:py-4 text-white">
                <h2 className="text-sm sm:text-lg font-bold flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                  Booking Summary
                </h2>
              </div>

              {/* Booking Details at Top + Hotel Image - Very compact on mobile */}
              {hotelData.imageUrl && (
                <div className="relative">
                  {/* Booking Details Overlay at Top */}
                  <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent px-2 sm:px-3 py-1.5 sm:py-2">
                    <div className="flex items-center gap-x-1.5 sm:gap-x-2 text-[10px] sm:text-xs whitespace-nowrap overflow-x-auto">
                      {/* Check-in */}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-blue-300 flex-shrink-0" />
                        <span className="font-semibold text-white text-xs">
                          {(() => { const [y, m, d] = hotelData.checkIn.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); })()}
                        </span>
                        <span className="text-blue-200 text-xs font-medium">· 3PM</span>
                      </div>

                      <span className="text-blue-300 mx-1">→</span>

                      {/* Check-out */}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-indigo-300 flex-shrink-0" />
                        <span className="font-semibold text-white text-xs">
                          {(() => { const [y, m, d] = hotelData.checkOut.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); })()}
                        </span>
                        <span className="text-blue-200 text-xs font-medium">· 11AM</span>
                      </div>

                      <span className="text-blue-300">|</span>

                      {/* Guests & Rooms */}
                      <div className="flex items-center gap-1">
                        <UsersIcon className="w-3 h-3 text-blue-300 flex-shrink-0" />
                        <span className="text-white text-xs">
                          {hotelData.adults} {hotelData.adults === 1 ? 'Adult' : 'Adults'}
                          {hotelData.children > 0 && `, ${hotelData.children} ${hotelData.children === 1 ? 'Child' : 'Children'}`}
                          {hotelData.rooms > 1 && <span className="text-blue-200 ml-1">({hotelData.rooms} rooms)</span>}
                        </span>
                      </div>

                      <span className="text-blue-300">|</span>

                      {/* Nights */}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-300 flex-shrink-0" />
                        <span className="font-bold text-white text-xs">
                          {hotelData.nights} {hotelData.nights === 1 ? 'Night' : 'Nights'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Image - Shorter on mobile */}
                  <div className="relative h-24 sm:h-32 w-full">
                    <Image
                      src={hotelData.imageUrl}
                      alt={hotelData.hotelName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-1.5 sm:bottom-2 left-2 sm:left-3 right-2 sm:right-3">
                      <h3 className="text-white font-bold text-sm sm:text-base leading-tight line-clamp-1">{hotelData.hotelName}</h3>
                      {hotelData.starRating && hotelData.starRating > 0 && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {Array.from({ length: hotelData.starRating }).map((_, i) => (
                            <Star key={i} className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                {/* Location & Address - Single Row - More compact mobile */}
                {hotelData.location && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-600 font-medium line-clamp-1">{hotelData.location}</p>
                  </div>
                )}

                {/* Room Info - Compact, Fly2Any colors */}
                <div className="bg-primary-50 border border-primary-100 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2">
                  <div className="flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <BedDouble className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary-600" />
                      <span className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1">{hotelData.roomName}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hotelData.refundable && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                          Free
                        </span>
                      )}
                      {hotelData.breakfastIncluded && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs bg-primary-100 text-primary-700 px-1.5 sm:px-2 py-0.5 rounded-full">
                          <Coffee className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                          BF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown - Mobile-first compact */}
                <div className="border-t border-gray-200 pt-2.5 sm:pt-3 space-y-1 sm:space-y-1.5">
                  <div className="flex justify-between text-[10px] sm:text-sm">
                    <span className="text-gray-600">
                      {hotelData.currency} {hotelData.perNightPrice.toFixed(0)}/night × {hotelData.nights}n {hotelData.rooms > 1 ? `× ${hotelData.rooms}r` : ''}
                    </span>
                    <span className="font-medium text-gray-900">{hotelData.currency} {getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-sm">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-medium text-gray-900">{hotelData.currency} {getTaxesAndFees().toFixed(2)}</span>
                  </div>

                  {/* Promo Discount Display */}
                  {promoCode && promoDiscount && getPromoDiscountAmount() > 0 && (
                    <div className="flex justify-between text-[10px] sm:text-sm text-green-600 font-medium">
                      <span className="flex items-center gap-0.5 sm:gap-1">
                        <Gift className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        {promoCode}
                      </span>
                      <span>-{hotelData.currency} {getPromoDiscountAmount().toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Promo Code Input - Reduced spacing, compact mobile */}
                <div className="border-t border-gray-200 pt-2.5 sm:pt-3">
                  <PromoCodeInput
                    onApply={handlePromoApply}
                    onRemove={handlePromoRemove}
                    appliedCode={promoCode}
                    appliedDiscount={promoDiscount}
                    totalPrice={getSubtotal()}
                    currency={hotelData.currency}
                    hotelId={hotelData.hotelId}
                    guestId={session?.user?.id}
                  />
                </div>

                {/* Loyalty Points Display - Compact */}
                {session?.user && loyaltyPoints > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-xs font-semibold text-purple-900">Loyalty Points: {loyaltyPoints.toLocaleString()}</p>
                          <p className="text-xs text-purple-600">≈ {hotelData.currency} {(loyaltyPoints * 0.01).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total - Compact, mobile-first */}
                <div className="border-t-2 border-gray-300 pt-2 sm:pt-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm sm:text-lg text-gray-900">Total</span>
                    <span className="font-bold text-lg sm:text-2xl text-primary-600">
                      {hotelData.currency} {getGrandTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* BNPL Promotion for high-value bookings */}
                <BNPLPromotion
                  totalAmount={getGrandTotal()}
                  currency={hotelData.currency}
                  minAmount={200}
                  installments={4}
                />

                {/* Price Lock Notice - Compact, mobile-first */}
                {prebookData && timeRemaining > 0 && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Timer className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-primary-600 flex-shrink-0" />
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-[10px] sm:text-xs font-semibold text-primary-900">Locked:</span>
                        <span className="text-sm sm:text-lg font-bold text-primary-600">{formatTime(timeRemaining)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Guarantees - Compact, mobile-first */}
                <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 pt-1.5 sm:pt-2">
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-600">
                    <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-green-500" />
                    <span>Instant</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-600">
                    <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-green-500" />
                    <span>No fees</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-600">
                    <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-green-500" />
                    <span>24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ===========================
// EXPORT WITH SUSPENSE
// ===========================

export default function HotelBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading checkout...</p>
        </div>
      </div>
    }>
      <HotelCheckoutContent />
    </Suspense>
  );
}
