'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Download, Printer, Mail, MapPin, Calendar, Users, Hotel, Home, Loader2 } from 'lucide-react';

interface BookingConfirmation {
  id: string;
  confirmationNumber: string;
  status: string;
  hotelId: string;
  hotelName: string;
  location?: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: any[];
  totalPrice: number;
  currency: string;
  createdAt: string;
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = () => {
      try {
        const bookingId = searchParams.get('bookingId');
        const ref = searchParams.get('ref');

        if (!bookingId) {
          router.push('/hotels');
          return;
        }

        // Try to load from sessionStorage
        const cachedBooking = sessionStorage.getItem(`hotel_booking_${bookingId}`);
        if (cachedBooking) {
          setBooking(JSON.parse(cachedBooking));
          setLoading(false);
          return;
        }

        // If not in cache, create a minimal booking object from URL params
        if (ref) {
          setBooking({
            id: bookingId,
            confirmationNumber: ref,
            status: 'confirmed',
            hotelId: 'unknown',
            hotelName: 'Your Hotel',
            roomName: 'Selected Room',
            checkIn: new Date().toISOString(),
            checkOut: new Date(Date.now() + 86400000).toISOString(),
            nights: 1,
            guests: [],
            totalPrice: 0,
            currency: 'USD',
            createdAt: new Date().toISOString(),
          });
          setLoading(false);
        } else {
          router.push('/hotels');
        }
      } catch (error) {
        console.error('Error loading booking:', error);
        router.push('/hotels');
      }
    };

    loadBooking();
  }, [searchParams, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!booking) return;

    const confirmationText = `
HOTEL BOOKING CONFIRMATION
===========================

Confirmation Number: ${booking.confirmationNumber}
Booking ID: ${booking.id}

Hotel Details:
--------------
Hotel: ${booking.hotelName}
${booking.location ? `Location: ${booking.location}` : ''}
Room: ${booking.roomName}

Stay Details:
-------------
Check-in: ${new Date(booking.checkIn).toLocaleDateString()}
Check-out: ${new Date(booking.checkOut).toLocaleDateString()}
Nights: ${booking.nights}
Guests: ${booking.guests.length}

Payment:
--------
Total Amount: ${booking.currency} ${booking.totalPrice.toFixed(2)}
Status: ${booking.status.toUpperCase()}

Booked on: ${new Date(booking.createdAt).toLocaleString()}

Thank you for booking with FLY2ANY!
    `.trim();

    const blob = new Blob([confirmationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel-confirmation-${booking.confirmationNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-700">Loading your confirmation...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Success Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">
            Your hotel reservation has been successfully processed
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Confirmation Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Confirmation Number */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center py-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg mb-6">
                <p className="text-sm font-semibold text-green-100 uppercase tracking-wide mb-2">
                  Confirmation Number
                </p>
                <p className="text-4xl font-bold text-white tracking-wider">
                  {booking.confirmationNumber}
                </p>
                <p className="text-sm text-green-100 mt-2">
                  Please save this number for your records
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">Confirmation Email Sent</h3>
                    <p className="text-sm text-blue-800">
                      A confirmation email has been sent to{' '}
                      {booking.guests?.[0]?.email || 'your email address'}.
                      Please check your inbox and spam folder.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hotel Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Hotel className="w-6 h-6 text-primary-600" />
                Hotel Details
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{booking.hotelName}</h3>
                  {booking.location && (
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {booking.location}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Room Type</p>
                    <p className="font-semibold text-gray-900">{booking.roomName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Nights</p>
                    <p className="font-semibold text-gray-900">{booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Check-in
                    </p>
                    <p className="font-semibold text-gray-900">
                      {new Date(booking.checkIn).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Check-out
                    </p>
                    <p className="font-semibold text-gray-900">
                      {new Date(booking.checkOut).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Guests
                    </p>
                    <p className="font-semibold text-gray-900">
                      {booking.guests.length} {booking.guests.length === 1 ? 'Guest' : 'Guests'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            {booking.guests && booking.guests.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary-600" />
                  Guest Information
                </h2>

                <div className="space-y-3">
                  {booking.guests.map((guest, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {guest.title} {guest.firstName} {guest.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {guest.type === 'adult' ? 'Adult' : 'Child'}
                          {index === 0 && ' (Primary Contact)'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Important Information</h2>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex gap-3">
                  <span className="text-lg">📋</span>
                  <div>
                    <p className="font-semibold">Check-in Policy</p>
                    <p>Check-in time is typically after 3:00 PM. Early check-in subject to availability.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-lg">📋</span>
                  <div>
                    <p className="font-semibold">Check-out Policy</p>
                    <p>Check-out time is typically before 11:00 AM. Late check-out may incur additional charges.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-lg">🆔</span>
                  <div>
                    <p className="font-semibold">Required at Check-in</p>
                    <p>Please bring a valid photo ID and the credit card used for booking.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-lg">❌</span>
                  <div>
                    <p className="font-semibold">Cancellation Policy</p>
                    <p>Free cancellation up to 24 hours before check-in. Cancellations after that may incur charges.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Payment Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Room Total</span>
                  <span className="font-semibold text-gray-900">
                    {booking.currency} {booking.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-gray-300 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-900">Total Paid</span>
                  <span className="font-bold text-2xl text-green-600">
                    {booking.currency} {booking.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  Print Confirmation
                </button>

                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Details
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </button>
              </div>

              {/* Contact Support */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Need help?</p>
                <p className="text-sm font-semibold text-primary-600">
                  Contact Support: support@fly2any.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-sm text-gray-600">
                We've sent a detailed confirmation to your email address
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Prepare for Check-in</h3>
              <p className="text-sm text-gray-600">
                Bring your ID and the credit card used for booking
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Hotel className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enjoy Your Stay</h3>
              <p className="text-sm text-gray-600">
                We hope you have a wonderful experience!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HotelConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 animate-pulse">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-700">Loading your confirmation...</h1>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
