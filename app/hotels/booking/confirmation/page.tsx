'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Download, Printer, Mail, MapPin, Calendar, Users, Hotel, Home, Loader2, Star, BedDouble, Clock, Phone, Shield } from 'lucide-react';
import Image from 'next/image';

interface BookingConfirmation {
  id: string;
  confirmationNumber: string;
  status: string;
  hotelId: string;
  hotelName: string;
  hotelImage?: string;
  location?: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: any[];
  totalPrice: number;
  currency: string;
  createdAt: string;
  guestName?: string;
  guestEmail?: string;
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

        // Try pending_booking_data first (set by booking page before redirect)
        const pendingData = sessionStorage.getItem('pending_booking_data');
        if (pendingData) {
          const parsed = JSON.parse(pendingData);
          setBooking({
            id: bookingId,
            confirmationNumber: ref || bookingId,
            status: 'confirmed',
            hotelId: parsed.hotelId || 'unknown',
            hotelName: parsed.hotelName || 'Your Hotel',
            hotelImage: parsed.hotelImage,
            location: parsed.location,
            roomName: parsed.roomName || 'Selected Room',
            checkIn: parsed.checkIn || new Date().toISOString(),
            checkOut: parsed.checkOut || new Date(Date.now() + 86400000).toISOString(),
            nights: parsed.nights || 1,
            guests: [],
            totalPrice: parsed.totalPrice || 0,
            currency: parsed.currency || 'USD',
            createdAt: new Date().toISOString(),
            guestName: parsed.guestName,
            guestEmail: parsed.guestEmail,
          });
          setLoading(false);
          return;
        }

        // Fallback: Try hotel_booking_ cache
        const cachedBooking = sessionStorage.getItem(`hotel_booking_${bookingId}`);
        if (cachedBooking) {
          setBooking(JSON.parse(cachedBooking));
          setLoading(false);
          return;
        }

        // Final fallback: minimal from URL
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

  const handlePrint = () => window.print();

  const handleDownload = () => {
    if (!booking) return;
    const text = `HOTEL BOOKING CONFIRMATION\n${'='.repeat(30)}\n\nConfirmation: ${booking.confirmationNumber}\nHotel: ${booking.hotelName}\n${booking.location ? `Location: ${booking.location}\n` : ''}Room: ${booking.roomName}\nCheck-in: ${new Date(booking.checkIn).toLocaleDateString()}\nCheck-out: ${new Date(booking.checkOut).toLocaleDateString()}\nNights: ${booking.nights}\nTotal: ${booking.currency} ${booking.totalPrice.toFixed(2)}\n\nThank you for booking with FLY2ANY!`;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `confirmation-${booking.confirmationNumber}.txt`;
    a.click();
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#E74035] mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-medium">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Success Header - Compact */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="w-full px-3 lg:px-6 py-4 lg:py-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-white/20 rounded-full mb-2">
            <CheckCircle className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-1">Booking Confirmed!</h1>
          <p className="text-sm text-white/80">Your reservation is complete</p>
        </div>
      </div>

      {/* Main Content - Full width mobile */}
      <div className="w-full px-0 lg:px-4 py-3 lg:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-4">

          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-0 lg:space-y-3">

            {/* Confirmation Number Card */}
            <div className="bg-white p-3 lg:p-4 border-b lg:border lg:rounded-xl border-gray-100">
              <div className="bg-[#F7C928] rounded-lg p-3 text-center mb-3">
                <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Confirmation Number</p>
                <p className="text-2xl lg:text-3xl font-black text-gray-900 tracking-wider">{booking.confirmationNumber}</p>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  Confirmation sent to <span className="font-medium">{booking.guestEmail || 'your email'}</span>
                </p>
              </div>
            </div>

            {/* Hotel Details Card */}
            <div className="bg-white border-b lg:border lg:rounded-xl border-gray-100 overflow-hidden">
              {/* Hotel Image */}
              {booking.hotelImage && (
                <div className="relative h-32 lg:h-40 w-full">
                  <Image src={booking.hotelImage} alt={booking.hotelName} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <h2 className="text-white font-bold text-base lg:text-lg line-clamp-1">{booking.hotelName}</h2>
                    {booking.location && (
                      <p className="text-white/80 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{booking.location}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Hotel Info */}
              <div className="p-3 lg:p-4">
                {!booking.hotelImage && (
                  <div className="mb-3">
                    <h2 className="font-bold text-gray-900 text-base">{booking.hotelName}</h2>
                    {booking.location && (
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{booking.location}
                      </p>
                    )}
                  </div>
                )}

                {/* Stay Details Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#E74035]/10 rounded-lg p-2">
                    <p className="text-[9px] text-gray-500 uppercase font-medium">Check-in</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-[#E74035] font-medium">After 3:00 PM</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2">
                    <p className="text-[9px] text-gray-500 uppercase font-medium">Check-out</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">Before 11:00 AM</p>
                  </div>
                </div>

                {/* Room & Guests */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
                    <BedDouble className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">{booking.roomName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">{booking.nights} Night{booking.nights > 1 ? 's' : ''}</span>
                  </div>
                  {booking.guestName && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">{booking.guestName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Important Info - Compact */}
            <div className="bg-white p-3 lg:p-4 border-b lg:border lg:rounded-xl border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-2">Important Information</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex gap-2">
                  <span>🆔</span>
                  <p>Bring valid photo ID and the credit card used for booking at check-in</p>
                </div>
                <div className="flex gap-2">
                  <span>📋</span>
                  <p>Check-in from 3:00 PM, Check-out by 11:00 AM</p>
                </div>
                <div className="flex gap-2">
                  <span>❌</span>
                  <p>Free cancellation up to 24 hours before check-in (policy may vary)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white p-3 lg:p-4 border-b lg:border lg:rounded-xl border-gray-100 lg:sticky lg:top-4">
              {/* Payment Summary */}
              <h3 className="font-bold text-gray-800 text-sm mb-3">Payment Summary</h3>

              <div className="border-t-2 border-gray-200 pt-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Paid</span>
                  <span className="font-black text-xl text-green-600">
                    {booking.currency} {booking.totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Payment secured & processed
                </p>
              </div>

              {/* Actions - Compact */}
              <div className="space-y-2">
                <button onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg">
                  <Printer className="w-4 h-4" />Print
                </button>
                <button onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg">
                  <Download className="w-4 h-4" />Download
                </button>
                <button onClick={() => router.push('/')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#E74035] hover:bg-[#D63930] text-white font-bold text-sm rounded-lg">
                  <Home className="w-4 h-4" />Back to Home
                </button>
              </div>

              {/* Support */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-500">Need help?</p>
                <p className="text-xs font-medium text-[#E74035]">support@fly2any.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next - Compact */}
        <div className="bg-white p-3 lg:p-4 border-y lg:border lg:rounded-xl border-gray-100 mt-0 lg:mt-3">
          <h3 className="font-bold text-gray-800 text-sm mb-3 text-center">What's Next?</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-[10px] font-medium text-gray-700">Check Email</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-[10px] font-medium text-gray-700">Prepare ID</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <Hotel className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-[10px] font-medium text-gray-700">Enjoy Stay</p>
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 text-sm">Loading confirmation...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
