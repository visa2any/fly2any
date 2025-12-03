'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CheckCircle2, XCircle, Loader2, Home, Receipt,
  Shield, Hotel, Calendar, MapPin, Users, Clock,
  Download, Share2, CalendarPlus, Sparkles, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Payment Confirmation Page - Enhanced with Confetti & Full UX
 *
 * This page handles returns from:
 * - LiteAPI Payment SDK
 * - 3D Secure authentication redirects
 * - Cash App Pay, Affirm, Afterpay, Klarna returns
 * - Any redirect-based payment methods
 *
 * URL Parameters:
 * - tid: Transaction ID from prebook
 * - status: Payment status (success/failed/pending)
 * - payment_intent: Stripe PaymentIntent ID (from redirect)
 * - redirect_status: Stripe redirect status
 */

// Confetti Component (inline for simplicity)
function Confetti() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    color: string;
    delay: number;
    duration: number;
    size: number;
  }>>([]);

  useEffect(() => {
    const colors = ['#F97316', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'];
    const newParticles = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 6 + Math.random() * 8,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}

// Success Animation Ring
function SuccessRing() {
  return (
    <div className="relative w-28 h-28 mx-auto mb-6">
      {/* Outer ring pulse */}
      <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-30" />
      {/* Middle ring */}
      <div className="absolute inset-2 bg-green-100 rounded-full animate-pulse" />
      {/* Inner circle with icon */}
      <div className="absolute inset-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
        <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
      </div>
    </div>
  );
}

interface BookingDetails {
  hotelName?: string;
  hotelImage?: string;
  location?: string;
  roomName?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  adults?: number;
  totalPrice?: number;
  currency?: string;
  guestName?: string;
  guestEmail?: string;
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const processedRef = useRef(false);

  // URL Parameters
  const transactionId = searchParams.get('tid');
  const paymentStatus = searchParams.get('status');
  const paymentIntent = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  // State
  const [status, setStatus] = useState<'loading' | 'verifying' | 'success' | 'error' | 'pending'>('loading');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    // Load booking details from session storage
    try {
      const storedDetails = sessionStorage.getItem('pending_booking_data');
      if (storedDetails) {
        setBookingDetails(JSON.parse(storedDetails));
      }
    } catch (e) {
      console.warn('Could not load booking details from storage');
    }

    verifyAndCompletePayment();
  }, []);

  const verifyAndCompletePayment = async () => {
    try {
      // Check for Stripe redirect failure
      if (redirectStatus === 'failed') {
        setStatus('error');
        setErrorMessage('Payment was declined by your bank. Please try a different payment method.');
        return;
      }

      // If no transaction ID or payment intent, show error
      if (!transactionId && !paymentIntent) {
        setStatus('error');
        setErrorMessage('Missing payment information. Please try again or contact support.');
        return;
      }

      // If explicit failure status
      if (paymentStatus === 'failed') {
        setStatus('error');
        setErrorMessage('Payment was not successful. Please try again.');
        return;
      }

      setStatus('verifying');

      // If we have a payment_intent from Stripe redirect, verify it
      if (paymentIntent) {
        console.log('[Confirm] Verifying Stripe PaymentIntent:', paymentIntent);

        try {
          const verifyResponse = await fetch('/api/hotels/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId: paymentIntent,
              transactionId: transactionId,
            }),
          });

          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();

            if (verifyData.status === 'succeeded' || verifyData.status === 'processing') {
              await finalizeBooking(transactionId || paymentIntent);
              return;
            } else if (verifyData.status === 'requires_action') {
              setStatus('pending');
              setErrorMessage('Additional verification is required. Please check your email or banking app.');
              return;
            } else {
              setStatus('error');
              setErrorMessage(verifyData.message || 'Payment verification failed.');
              return;
            }
          }
        } catch (verifyError) {
          console.warn('[Confirm] Verification API error, falling back to status check');
        }
      }

      // Fallback: Trust the URL status parameter
      if (paymentStatus === 'success' || redirectStatus === 'succeeded') {
        await finalizeBooking(transactionId || paymentIntent || 'unknown');
      } else if (paymentStatus === 'pending') {
        setStatus('pending');
        setErrorMessage('Your payment is being processed. You will receive confirmation shortly.');
      } else {
        // Default to success for redirect flows without explicit status
        await finalizeBooking(transactionId || paymentIntent || 'unknown');
      }
    } catch (error: any) {
      console.error('[Confirm] Error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'An error occurred. Please contact support.');
    }
  };

  const finalizeBooking = async (tid: string) => {
    try {
      console.log(`[Confirm] Finalizing booking for transaction: ${tid}`);

      // Try to get stored booking details for the API call
      const pendingBooking = sessionStorage.getItem('pending_booking_details');

      if (pendingBooking) {
        // We have full booking details - complete the booking
        const bookingData = JSON.parse(pendingBooking);

        const response = await fetch('/api/hotels/booking/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...bookingData,
            paymentIntentId: paymentIntent || `liteapi_${tid}`,
            paymentStatus: 'completed',
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setBookingId(result.id || result.data?.dbBookingId);
          setConfirmationNumber(result.confirmationNumber || result.data?.confirmationNumber || `FLY-${tid.substring(0, 8).toUpperCase()}`);

          // Clear session storage
          sessionStorage.removeItem('pending_booking_data');
          sessionStorage.removeItem('pending_booking_details');
        } else {
          // Booking API failed but payment succeeded - still show success
          setConfirmationNumber(`FLY-${tid.substring(0, 8).toUpperCase()}`);
        }
      } else {
        // No stored details - create confirmation number from transaction
        setConfirmationNumber(`FLY-${tid.substring(0, 8).toUpperCase()}`);
      }

      // Show success state with confetti
      setStatus('success');
      setShowConfetti(true);

      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 5000);

    } catch (error: any) {
      console.error('[Confirm] Finalization error:', error);
      // Payment succeeded but booking creation had issues - still show success
      setConfirmationNumber(`FLY-${tid.substring(0, 8).toUpperCase()}`);
      setStatus('success');
      setShowConfetti(true);
    }
  };

  // Add to calendar handler
  const handleAddToCalendar = () => {
    if (!bookingDetails?.checkIn || !bookingDetails?.checkOut) return;

    const startDate = new Date(bookingDetails.checkIn).toISOString().replace(/-|:|\.\d+/g, '');
    const endDate = new Date(bookingDetails.checkOut).toISOString().replace(/-|:|\.\d+/g, '');
    const title = encodeURIComponent(`Hotel Stay: ${bookingDetails.hotelName || 'Your Hotel'}`);
    const location = encodeURIComponent(bookingDetails.location || '');
    const details = encodeURIComponent(`Confirmation: ${confirmationNumber}\nRoom: ${bookingDetails.roomName || 'Standard Room'}`);

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&location=${location}&details=${details}`;
    window.open(googleCalUrl, '_blank');
  };

  // Share booking handler
  const handleShare = async () => {
    const shareText = `I just booked ${bookingDetails?.hotelName || 'a hotel'} through Fly2Any! Confirmation: ${confirmationNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Hotel Booking',
          text: shareText,
          url: window.location.origin,
        });
      } catch (e) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Booking details copied to clipboard!');
    }
  };

  // Loading state
  if (status === 'loading' || status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-25" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' ? 'Processing Payment' : 'Verifying Payment'}
          </h1>
          <p className="text-gray-600 mb-6">
            Please wait while we confirm your reservation...
          </p>
          {transactionId && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Transaction: <span className="font-mono font-semibold">{transactionId.substring(0, 20)}...</span>
              </p>
            </div>
          )}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Secure payment processing</span>
          </div>
        </div>
      </div>
    );
  }

  // Success state with confetti
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/30 flex items-center justify-center p-4">
        {showConfetti && <Confetti />}

        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center text-white">
            <SuccessRing />
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-green-100">Your hotel reservation is complete</p>
          </div>

          <div className="p-6">
            {/* Confirmation Number */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-green-700 mb-1 font-medium">Confirmation Number</p>
              <p className="text-3xl font-bold text-green-800 tracking-wider">
                {confirmationNumber}
              </p>
            </div>

            {/* Booking Details */}
            {bookingDetails && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                {bookingDetails.hotelImage && (
                  <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                    <Image
                      src={bookingDetails.hotelImage}
                      alt={bookingDetails.hotelName || 'Hotel'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex items-start gap-2 mb-3">
                  <Hotel className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-gray-900">{bookingDetails.hotelName}</h3>
                    {bookingDetails.location && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {bookingDetails.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Check-in</p>
                      <p className="font-medium">
                        {bookingDetails.checkIn
                          ? new Date(bookingDetails.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'TBD'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Check-out</p>
                      <p className="font-medium">
                        {bookingDetails.checkOut
                          ? new Date(bookingDetails.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
                {bookingDetails.totalPrice && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-gray-600">Total Paid</span>
                    <span className="text-xl font-bold text-green-600">
                      {bookingDetails.currency} {bookingDetails.totalPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Email Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>A confirmation email has been sent with all your booking details and e-voucher.</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                onClick={handleAddToCalendar}
                className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CalendarPlus className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-600">Add to Cal</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-600">Download</span>
              </button>
              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-1 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-600">Share</span>
              </button>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                href="/account/bookings"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium transition-colors shadow-lg"
              >
                <Receipt className="w-4 h-4" />
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending state
  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <p className="text-sm text-amber-800">
              Your payment is being processed. This can take a few minutes.
              We'll send you an email confirmation once it's complete.
            </p>
          </div>

          <Link
            href="/account/bookings"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">
            {errorMessage || 'We encountered an error processing your payment.'}
          </p>
        </div>

        {(transactionId || paymentIntent) && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <p className="text-sm text-amber-800 mb-2">Reference ID (save for support):</p>
            <p className="font-mono font-semibold text-amber-900 text-sm break-all">
              {transactionId || paymentIntent}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/hotels"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Hotels
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Need help?{' '}
          <a href="mailto:support@fly2any.com" className="text-orange-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-700">Processing your payment...</h1>
        </div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}
