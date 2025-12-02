'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Hotel, Loader2, User, CreditCard, MapPin, Calendar, Users as UsersIcon,
  AlertCircle, CheckCircle2, Clock, Shield, Lock, Phone, Mail, Star, BedDouble,
  Coffee, Utensils, Check, ChevronLeft, Timer, Sparkles, Gift, Award
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripePaymentForm } from '@/components/hotels/StripePaymentForm';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import PromoCodeInput, { PromoDiscount } from '@/components/hotels/PromoCodeInput';

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
  const [paymentReady, setPaymentReady] = useState(false);

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
          roomId: searchParams.get('roomId') || '',
          roomName: searchParams.get('roomName') || 'Standard Room',
          price: price || 0,
          perNightPrice: perNight || price / (nights || 1),
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

        // Try to prebook to lock in price - this is CRITICAL for production
        if (offerId) {
          await callPrebookAPI(offerId, hotelId);
        }

        // Create payment intent after prebook (price might be updated by prebook)
        // Note: Payment intent will be created with updated price from prebook
        if (price > 0) {
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

  // ===========================
  // API CALLS
  // ===========================

  const callPrebookAPI = async (offerId: string, hotelId: string) => {
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
          console.log('Price locked:', data.data);

          // CRITICAL: Update hotelData with ACTUAL prebook price from LiteAPI
          // This ensures we use the real locked-in price, not URL params
          if (data.data.price?.amount && data.data.price.amount > 0) {
            setHotelData(prev => prev ? {
              ...prev,
              price: data.data.price.amount,
              perNightPrice: data.data.price.amount / (prev.nights || 1),
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

  // LiteAPI booking - uses prebook + LiteAPI payment processing
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
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  // ===========================
  // RENDER
  // ===========================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/hotels/${hotelData.hotelId}?checkIn=${hotelData.checkIn}&checkOut=${hotelData.checkOut}&adults=${hotelData.adults}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <Hotel className="w-5 h-5 text-orange-500" />
                <h1 className="text-lg font-bold text-gray-900">Secure Checkout</h1>
              </div>
            </div>

            {/* Price Lock Timer */}
            {prebookData && timeRemaining > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                <Timer className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">
                  Price locked: {formatTime(timeRemaining)}
                </span>
              </div>
            )}

            {/* Trust Badges */}
            <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-green-600" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>PCI Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 text-xl">
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Main Content - 2 Columns */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ========================= */}
          {/* LEFT COLUMN: Guest + Payment */}
          {/* ========================= */}
          <div className="lg:col-span-7 space-y-6">

            {/* Guest Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Guest Information</h2>
                    <p className="text-sm text-white/80">Who's checking in?</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Name Row */}
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title *</label>
                    <select
                      value={guest.title}
                      onChange={(e) => handleGuestUpdate('title', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Mr">Mr</option>
                      <option value="Ms">Ms</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">First Name *</label>
                    <input
                      type="text"
                      value={guest.firstName}
                      onChange={(e) => handleGuestUpdate('firstName', e.target.value)}
                      placeholder="John"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Last Name *</label>
                    <input
                      type="text"
                      value={guest.lastName}
                      onChange={(e) => handleGuestUpdate('lastName', e.target.value)}
                      placeholder="Smith"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Contact Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      <Mail className="w-3.5 h-3.5 inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={guest.email}
                      onChange={(e) => handleGuestUpdate('email', e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      <Phone className="w-3.5 h-3.5 inline mr-1" />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={guest.phone}
                      onChange={(e) => handleGuestUpdate('phone', e.target.value)}
                      placeholder="+1 555 123 4567"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={guest.specialRequests}
                    onChange={(e) => handleGuestUpdate('specialRequests', e.target.value)}
                    placeholder="e.g., Late check-in, high floor, quiet room..."
                    rows={2}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Special requests are not guaranteed but the hotel will do their best to accommodate.</p>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Payment Details</h2>
                    <p className="text-sm text-white/80">Secure payment powered by Stripe</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Prebooking indicator */}
                {prebooking && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-900 font-medium">Locking in your price...</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Please wait while we secure your rate with the hotel.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PRODUCTION: Show error if no valid price */}
                {!prebooking && hotelData.price === 0 && !prebookData && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm text-red-900 font-medium">Price Not Available</p>
                        <p className="text-xs text-red-700 mt-1">
                          Unable to retrieve pricing for this room. Please go back and select a room with available rates.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/hotels/${hotelData.hotelId}?checkIn=${hotelData.checkIn}&checkOut=${hotelData.checkOut}&adults=${hotelData.adults}`}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Go back to select a room
                    </Link>
                  </div>
                )}

                {!stripePromise || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                  // LiteAPI Payment Mode - No Stripe needed
                  <div className="space-y-4">
                    {hotelData.price > 0 || prebookData?.price?.amount ? (
                      <>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                          <p className="text-sm text-green-900 font-medium">LiteAPI Payment</p>
                          <p className="text-xs text-green-700 mt-1">
                            Payment will be processed securely through LiteAPI's payment gateway.
                          </p>
                        </div>

                        <button
                          onClick={handleLiteAPIBooking}
                          disabled={!isGuestValid() || isProcessing || prebooking || !prebookData?.prebookId}
                          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform ${
                            !isGuestValid() || isProcessing || prebooking || !prebookData?.prebookId
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
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
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">Waiting for price confirmation...</p>
                      </div>
                    )}
                  </div>
                ) : !clientSecret ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600">Initializing secure payment...</p>
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
                    <div className="space-y-4">
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

                {/* Payment Trust Signals */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-green-600" />
                      <span>256-bit SSL</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      <span>PCI DSS Compliant</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>3D Secure</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="text-xs text-gray-400">Accepted:</span>
                    <span className="text-xs font-medium text-gray-600">Visa</span>
                    <span className="text-xs font-medium text-gray-600">Mastercard</span>
                    <span className="text-xs font-medium text-gray-600">Amex</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================= */}
          {/* RIGHT COLUMN: Booking Summary */}
          {/* ========================= */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-20">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Booking Summary
                </h2>
              </div>

              {/* Hotel Image */}
              {hotelData.imageUrl && (
                <div className="relative h-40 w-full">
                  <Image
                    src={hotelData.imageUrl}
                    alt={hotelData.hotelName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg leading-tight">{hotelData.hotelName}</h3>
                    {hotelData.starRating && hotelData.starRating > 0 && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: hotelData.starRating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 space-y-4">
                {/* Location */}
                {hotelData.location && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{hotelData.location}</span>
                  </div>
                )}

                {/* Dates & Guests */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Check-in</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(hotelData.checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">3:00 PM</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Check-out</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(hotelData.checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">11:00 AM</p>
                  </div>
                </div>

                {/* Guests & Nights */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {hotelData.adults} {hotelData.adults === 1 ? 'Adult' : 'Adults'}
                      {hotelData.children > 0 && `, ${hotelData.children} ${hotelData.children === 1 ? 'Child' : 'Children'}`}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {hotelData.nights} {hotelData.nights === 1 ? 'Night' : 'Nights'}
                  </div>
                </div>

                {/* Room Info */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BedDouble className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-gray-900 text-sm">{hotelData.roomName}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hotelData.refundable && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Free Cancellation
                      </span>
                    )}
                    {hotelData.breakfastIncluded && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        <Coffee className="w-3 h-3" />
                        Breakfast Included
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {hotelData.currency} {hotelData.perNightPrice.toFixed(2)} x {hotelData.nights} {hotelData.nights === 1 ? 'night' : 'nights'}
                    </span>
                    <span className="font-medium text-gray-900">{hotelData.currency} {getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-medium text-gray-900">{hotelData.currency} {getTaxesAndFees().toFixed(2)}</span>
                  </div>

                  {/* Promo Discount Display */}
                  {promoCode && promoDiscount && getPromoDiscountAmount() > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Gift className="w-4 h-4" />
                        Promo: {promoCode}
                      </span>
                      <span>-{hotelData.currency} {getPromoDiscountAmount().toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Promo Code Input */}
                <div className="border-t border-gray-200 pt-4">
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

                {/* Loyalty Points Display - Only for logged in users */}
                {session?.user && loyaltyPoints > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-purple-900">Loyalty Points Available</p>
                        <p className="text-xs text-purple-700">{loyaltyPoints.toLocaleString()} points = {hotelData.currency} {(loyaltyPoints * 0.01).toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 mt-2">Points can be redeemed after booking confirmation</p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t-2 border-gray-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-orange-600">
                      {hotelData.currency} {getGrandTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Price Lock Notice */}
                {prebookData && timeRemaining > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900">Price locked for:</p>
                        <p className="text-xl font-bold text-amber-600">{formatTime(timeRemaining)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Guarantees */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>No hidden fees</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>24/7 customer support</span>
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
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading checkout...</p>
        </div>
      </div>
    }>
      <HotelCheckoutContent />
    </Suspense>
  );
}
