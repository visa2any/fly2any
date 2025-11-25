'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { CreditCardAuthorizationForm, CardAuthorizationData } from '@/components/booking/CreditCardAuthorizationForm';

/**
 * Payment Authorization Page
 *
 * Customer fills out credit card authorization form after booking.
 * This page is shown after the initial booking is created but before payment processing.
 *
 * URL: /booking-flow/payment-authorization?ref=FLY-XXXXXX
 */

interface BookingDetails {
  bookingReference: string;
  status: string;
  amount: number;
  currency: string;
  route: string;
  travelDate: string;
  passengerNames: string[];
  contactEmail: string;
  contactPhone: string;
}

export default function PaymentAuthorizationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingRef = searchParams.get('ref');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [existingAuth, setExistingAuth] = useState(false);

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingRef) {
        setError('No booking reference provided');
        setLoading(false);
        return;
      }

      try {
        // Check if authorization already exists
        const authCheckRes = await fetch(`/api/booking-flow/card-authorization?bookingReference=${bookingRef}`);
        if (authCheckRes.ok) {
          const authData = await authCheckRes.json();
          if (authData.authorization) {
            setExistingAuth(true);
            setLoading(false);
            return;
          }
        }

        // Fetch booking details
        const response = await fetch(`/api/bookings/${bookingRef}`);
        if (!response.ok) {
          throw new Error('Booking not found');
        }

        const data = await response.json();
        const bookingData = data.booking;

        if (!bookingData) {
          throw new Error('Booking not found');
        }

        // Transform booking data
        const firstSegment = bookingData.flight?.segments?.[0];
        const lastSegment = bookingData.flight?.segments?.[bookingData.flight.segments.length - 1];
        const passengers = bookingData.passengers || [];

        setBooking({
          bookingReference: bookingData.bookingReference,
          status: bookingData.status,
          amount: bookingData.payment?.amount || bookingData.flight?.price?.total || 0,
          currency: bookingData.payment?.currency || bookingData.flight?.price?.currency || 'USD',
          route: firstSegment && lastSegment
            ? `${firstSegment.departure.iataCode} → ${lastSegment.arrival.iataCode}`
            : 'Flight',
          travelDate: firstSegment?.departure?.at
            ? new Date(firstSegment.departure.at).toLocaleDateString()
            : 'TBD',
          passengerNames: passengers.map((p: any) => `${p.firstName} ${p.lastName}`),
          contactEmail: bookingData.contactInfo?.email || passengers[0]?.email || '',
          contactPhone: bookingData.contactInfo?.phone || passengers[0]?.phone || '',
        });
      } catch (err: any) {
        console.error('Error fetching booking:', err);
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingRef]);

  // Handle form submission
  const handleSubmit = async (data: CardAuthorizationData) => {
    if (!booking) return;

    const response = await fetch('/api/booking-flow/card-authorization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingReference: booking.bookingReference,
        ...data,
        amount: booking.amount,
        currency: booking.currency,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit authorization');
    }

    setSubmitted(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Booking</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Already submitted
  if (existingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Authorization Already Submitted</h1>
          <p className="text-gray-600 mb-2">
            Your payment authorization for this booking has already been submitted.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Reference: <span className="font-mono font-semibold">{bookingRef}</span>
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href={`/my-trips/${bookingRef}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              View Booking Status
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Authorization Submitted!</h1>
          <p className="text-gray-600 mb-2">
            Your payment authorization has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            We will process your booking and send you a confirmation email with your e-ticket once complete.
          </p>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="text-xs text-gray-500">Booking Reference</div>
            <div className="text-lg font-mono font-bold text-primary-600">{booking?.bookingReference}</div>
          </div>

          <div className="text-left text-sm bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <h3 className="font-semibold text-blue-900 mb-1">What happens next?</h3>
            <ul className="text-blue-800 space-y-1">
              <li>1. Our team will verify your authorization</li>
              <li>2. Your ticket will be issued within 24 hours</li>
              <li>3. You'll receive your e-ticket via email</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href={`/my-trips/${booking?.bookingReference}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Track Your Booking
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Book Another Flight
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authorization form
  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-xl mx-auto px-4">
        {/* Back link */}
        <Link
          href={`/my-trips/${booking.bookingReference}`}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Booking
        </Link>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">
            Complete Your Payment Authorization
          </h3>
          <p className="text-xs text-blue-800">
            To process your booking, we need you to complete this secure authorization form.
            Your card will be charged by our travel team once verified.
          </p>
        </div>

        {/* Authorization Form */}
        <CreditCardAuthorizationForm
          booking={{
            bookingReference: booking.bookingReference,
            amount: booking.amount,
            currency: booking.currency,
            route: booking.route,
            travelDate: booking.travelDate,
            passengerNames: booking.passengerNames,
          }}
          onSubmit={handleSubmit}
          prefillEmail={booking.contactEmail}
          prefillPhone={booking.contactPhone}
        />
      </div>
    </div>
  );
}
