'use client';

import { useState } from 'react';
import {
  Hotel,
  MapPin,
  Calendar,
  Users,
  BedDouble,
  Download,
  XCircle,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

export interface HotelBooking {
  id: string;
  confirmationNumber: string;
  hotelId: string;
  hotelName: string;
  hotelAddress?: string | null;
  hotelCity: string;
  hotelCountry: string;
  hotelPhone?: string | null;
  hotelEmail?: string | null;
  hotelImage?: string | null;
  roomId: string;
  roomName: string;
  bedType?: string | null;
  maxGuests?: number | null;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  nights: number;
  pricePerNight: number | string;
  subtotal: number | string;
  taxesAndFees: number | string;
  totalPrice: number | string;
  currency: string;
  guestTitle?: string | null;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string | null;
  status: string;
  paymentStatus: string;
  cancellable: boolean;
  refundable: boolean;
  breakfastIncluded: boolean;
  confirmationEmailSent: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface HotelBookingCardProps {
  booking: HotelBooking;
  onCancel?: (bookingId: string) => void;
}

export default function HotelBookingCard({ booking, onCancel }: HotelBookingCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Format dates
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const isUpcoming = checkIn > new Date();
  const isPast = checkOut < new Date();

  // Format price
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: booking.currency,
    }).format(numPrice);
  };

  // Status badge styling
  const getStatusBadge = () => {
    switch (booking.status) {
      case 'confirmed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: 'Confirmed',
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: <Clock className="w-4 h-4" />,
          label: 'Pending',
        };
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: <XCircle className="w-4 h-4" />,
          label: 'Cancelled',
        };
      case 'completed':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: 'Completed',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: <AlertCircle className="w-4 h-4" />,
          label: booking.status,
        };
    }
  };

  const statusBadge = getStatusBadge();

  // Download itinerary
  const handleDownloadItinerary = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(`/api/hotels/booking/${booking.id}/itinerary`);

      if (!response.ok) {
        throw new Error('Failed to download itinerary');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Hotel-Itinerary-${booking.confirmationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download itinerary. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle cancellation
  const handleCancelBooking = async () => {
    if (!onCancel) return;

    try {
      setIsCancelling(true);
      await onCancel(booking.id);
      setShowCancelModal(false);
    } catch (error) {
      console.error('Cancellation error:', error);
      alert('Failed to cancel booking. Please try again or contact support.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Hotel className="w-5 h-5" />
                <span className="text-sm font-semibold opacity-90">Hotel Booking</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{booking.hotelName}</h3>
              <div className="flex items-center gap-2 text-orange-100 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{booking.hotelCity}, {booking.hotelCountry}</span>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} flex items-center gap-1.5 font-semibold text-xs`}>
              {statusBadge.icon}
              {statusBadge.label}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-6">
          {/* Confirmation Number */}
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-semibold mb-1">CONFIRMATION NUMBER</p>
                <p className="text-2xl font-bold text-orange-700 tracking-wider">{booking.confirmationNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total Price</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(booking.totalPrice)}</p>
              </div>
            </div>
          </div>

          {/* Check-in / Check-out */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <Calendar className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-green-600 font-semibold mb-1">CHECK-IN</p>
                <p className="text-lg font-bold text-gray-900">{format(checkIn, 'MMM d, yyyy')}</p>
                <p className="text-xs text-gray-500 mt-1">After 3:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <Calendar className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-amber-600 font-semibold mb-1">CHECK-OUT</p>
                <p className="text-lg font-bold text-gray-900">{format(checkOut, 'MMM d, yyyy')}</p>
                <p className="text-xs text-gray-500 mt-1">Before 11:00 AM</p>
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500">Room Type</p>
                  <p className="font-semibold text-gray-900">{booking.roomName}</p>
                </div>
              </div>
              {booking.bedType && (
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Bed Type</p>
                    <p className="font-semibold text-gray-900">{booking.bedType}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-semibold text-gray-900">{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</p>
                </div>
              </div>
            </div>

            {booking.breakfastIncluded && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-semibold">Breakfast Included</span>
                </div>
              </div>
            )}
          </div>

          {/* Guest Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              Guest Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Name</p>
                <p className="font-semibold text-gray-900">
                  {booking.guestTitle ? `${booking.guestTitle} ` : ''}{booking.guestFirstName} {booking.guestLastName}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-orange-600" />
                  {booking.guestEmail}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-orange-600" />
                  {booking.guestPhone}
                </p>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-500 text-xs mb-1">Special Requests</p>
                <p className="text-sm text-gray-700">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Hotel Contact */}
          {(booking.hotelPhone || booking.hotelEmail || booking.hotelAddress) && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 text-sm">Hotel Contact Information</h4>
              <div className="space-y-2 text-sm">
                {booking.hotelAddress && (
                  <div className="flex items-start gap-2 text-blue-700">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{booking.hotelAddress}</span>
                  </div>
                )}
                {booking.hotelPhone && (
                  <div className="flex items-center gap-2 text-blue-700">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{booking.hotelPhone}</span>
                  </div>
                )}
                {booking.hotelEmail && (
                  <div className="flex items-center gap-2 text-blue-700">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>{booking.hotelEmail}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadItinerary}
              disabled={isDownloading}
              className="flex-1 min-w-[200px] px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Itinerary
                </>
              )}
            </button>

            {booking.status === 'confirmed' && booking.cancellable && isUpcoming && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-3 bg-white border-2 border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Cancel Booking
              </button>
            )}

            <a
              href={`/hotels/${booking.hotelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-white border-2 border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              View Hotel
            </a>
          </div>

          {/* Cancellation Info */}
          {booking.cancellable && booking.status === 'confirmed' && isUpcoming && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-green-700">
                  <p className="font-semibold mb-1">Free Cancellation</p>
                  <p>
                    {booking.refundable
                      ? 'You can cancel this booking and receive a full refund.'
                      : 'You can cancel this booking for free.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Metadata */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>Booked on {format(new Date(booking.createdAt), 'MMM d, yyyy \'at\' h:mm a')}</p>
            {booking.confirmationEmailSent && (
              <p className="flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Confirmation email sent to {booking.guestEmail}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to cancel your booking at {booking.hotelName}?
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Confirmation:</strong> {booking.confirmationNumber}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Check-in:</strong> {format(checkIn, 'MMM d, yyyy')}
              </p>
            </div>

            {booking.refundable && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Full refund:</strong> You will receive a full refund to your original payment method within 5-10 business days.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Yes, Cancel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
