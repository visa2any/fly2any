'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Plane,
  Calendar,
  Users,
  CreditCard,
  MapPin,
  Clock,
  Download,
  Mail,
  Printer,
  Share2,
  Edit,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  FileText,
  Shield,
} from 'lucide-react';
import BookingActions from '@/components/account/BookingActions';
import CancelBookingModal from '@/components/account/CancelBookingModal';
import type { Booking, FlightSegment } from '@/lib/bookings/types';
import Link from 'next/link';

interface BookingResponse {
  success: boolean;
  data?: {
    booking: Booking;
  };
  error?: {
    message: string;
    code: string;
  };
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  // Fetch booking details
  const fetchBooking = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data: BookingResponse = await response.json();

      if (data.success && data.data) {
        setBooking(data.data.booking);
      } else {
        throw new Error(data.error?.message || 'Booking not found');
      }
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      fetchBooking();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, bookingId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'The booking you are looking for does not exist.'}
          </p>
          <Link
            href="/account/bookings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const firstSegment = booking.flight.segments[0];
  const lastSegment = booking.flight.segments[booking.flight.segments.length - 1];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/account/bookings"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Bookings
          </Link>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
                <p className="text-blue-100">
                  Reference: {booking.bookingReference}
                </p>
              </div>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(
                  booking.status
                )}`}
              >
                {getStatusIcon(booking.status)}
                <span className="capitalize">{booking.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Booked on {formatDateTime(booking.createdAt)}
              </div>
              {booking.status === 'confirmed' && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  E-ticket issued
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <BookingActions
          booking={booking}
          onCancelClick={() => setShowCancelModal(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Information */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plane className="w-6 h-6" />
                  Flight Information
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Route Overview */}
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {firstSegment.departure.iataCode}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(firstSegment.departure.at)}
                    </div>
                    {firstSegment.departure.terminal && (
                      <div className="text-xs text-gray-500">
                        Terminal {firstSegment.departure.terminal}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center px-4">
                    <Plane className="w-6 h-6 text-blue-600 mb-1" />
                    <div className="w-full h-0.5 bg-gray-300 mb-1"></div>
                    <div className="text-sm text-gray-600">
                      {calculateDuration(
                        firstSegment.departure.at,
                        lastSegment.arrival.at
                      )}
                    </div>
                    {booking.flight.segments.length > 1 && (
                      <div className="text-xs text-orange-600 font-semibold mt-1">
                        {booking.flight.segments.length - 1}{' '}
                        {booking.flight.segments.length === 2 ? 'stop' : 'stops'}
                      </div>
                    )}
                  </div>

                  <div className="text-center flex-1">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {lastSegment.arrival.iataCode}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(lastSegment.arrival.at)}
                    </div>
                    {lastSegment.arrival.terminal && (
                      <div className="text-xs text-gray-500">
                        Terminal {lastSegment.arrival.terminal}
                      </div>
                    )}
                  </div>
                </div>

                {/* Flight Segments */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  {booking.flight.segments.map((segment, index) => (
                    <div key={segment.id}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Plane className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900">
                              {segment.carrierCode} {segment.flightNumber}
                            </span>
                            <span className="text-sm text-gray-600">
                              {segment.aircraft}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full capitalize">
                              {segment.class.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Departure</div>
                              <div className="font-semibold text-gray-900">
                                {segment.departure.iataCode} -{' '}
                                {formatDateTime(segment.departure.at)}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Arrival</div>
                              <div className="font-semibold text-gray-900">
                                {segment.arrival.iataCode} -{' '}
                                {formatDateTime(segment.arrival.at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < booking.flight.segments.length - 1 && (
                        <div className="ml-6 pl-6 my-3 border-l-2 border-dashed border-gray-300 py-2">
                          <div className="text-sm text-gray-600">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Layover in {segment.arrival.iataCode}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Passenger Information
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {booking.passengers.map((passenger, index) => (
                    <div
                      key={passenger.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-gray-900 text-lg">
                            {passenger.title} {passenger.firstName}{' '}
                            {passenger.lastName}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {passenger.type}
                          </div>
                        </div>
                        {booking.seats.find((s) => s.passengerId === passenger.id) && (
                          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">
                            Seat:{' '}
                            {
                              booking.seats.find(
                                (s) => s.passengerId === passenger.id
                              )?.seatNumber
                            }
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Date of Birth:</span>{' '}
                          <span className="font-semibold">
                            {passenger.dateOfBirth}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Nationality:</span>{' '}
                          <span className="font-semibold">
                            {passenger.nationality}
                          </span>
                        </div>
                        {passenger.passportNumber && (
                          <>
                            <div>
                              <span className="text-gray-600">Passport:</span>{' '}
                              <span className="font-semibold">
                                {passenger.passportNumber}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Expires:</span>{' '}
                              <span className="font-semibold">
                                {passenger.passportExpiry}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && booking.specialRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Special Requests
                  </h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    {booking.specialRequests.map((request, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {request}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Payment
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {booking.payment.currency}
                    {booking.payment.amount.toFixed(2)}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Fare</span>
                    <span className="font-semibold">
                      {booking.payment.currency}
                      {booking.flight.price.base.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-semibold">
                      {booking.payment.currency}
                      {(
                        booking.flight.price.taxes + booking.flight.price.fees
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Payment Method</span>
                    <span className="text-sm font-semibold capitalize">
                      {booking.payment.method.replace('_', ' ')}
                    </span>
                  </div>
                  {booking.payment.cardLast4 && (
                    <div className="text-sm text-gray-600">
                      {booking.payment.cardBrand} ending in{' '}
                      {booking.payment.cardLast4}
                    </div>
                  )}
                  <div
                    className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg ${
                      booking.payment.status === 'paid'
                        ? 'bg-green-50 text-green-800'
                        : 'bg-yellow-50 text-yellow-800'
                    }`}
                  >
                    {booking.payment.status === 'paid' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold capitalize">
                      {booking.payment.status}
                    </span>
                  </div>
                </div>

                {booking.payment.transactionId && (
                  <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Transaction ID: {booking.payment.transactionId}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  Contact Info
                </h2>
              </div>

              <div className="p-6 space-y-3 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Email</div>
                  <div className="font-semibold text-gray-900">
                    {booking.contactInfo.email}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Phone</div>
                  <div className="font-semibold text-gray-900">
                    {booking.contactInfo.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Policy */}
            {booking.refundPolicy && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Refund Policy
                  </h2>
                </div>

                <div className="p-6 space-y-3 text-sm">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      booking.refundPolicy.refundable
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {booking.refundPolicy.refundable ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="font-semibold">
                      {booking.refundPolicy.refundable
                        ? 'Refundable'
                        : 'Non-refundable'}
                    </span>
                  </div>

                  {booking.refundPolicy.refundable && (
                    <>
                      {booking.refundPolicy.refundDeadline && (
                        <div>
                          <div className="text-gray-600 mb-1">
                            Refund Deadline
                          </div>
                          <div className="font-semibold text-gray-900">
                            {formatDateTime(booking.refundPolicy.refundDeadline)}
                          </div>
                        </div>
                      )}
                      {booking.refundPolicy.cancellationFee !== undefined && (
                        <div>
                          <div className="text-gray-600 mb-1">
                            Cancellation Fee
                          </div>
                          <div className="font-semibold text-gray-900">
                            {booking.payment.currency}
                            {booking.refundPolicy.cancellationFee.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <CancelBookingModal
          booking={booking}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => {
            setShowCancelModal(false);
            fetchBooking();
          }}
        />
      )}
    </div>
  );
}
