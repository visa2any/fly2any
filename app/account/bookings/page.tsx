'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Plane, Calendar, Users, MapPin, ChevronRight, AlertCircle, Car } from 'lucide-react';
import Link from 'next/link';

interface BookingSummary {
  id: string;
  bookingReference: string;
  status: string;
  passengerCount: number;
  departureDate: string;
  origin: string;
  destination: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  // Multi-product support
  productType?: 'flight' | 'car' | 'hotel' | 'tour' | 'transfer' | 'activity';
  // Car rental fields
  carName?: string;
  carCategory?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  dropoffDate?: string;
}

export default function BookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        // Fetch flight bookings from database
        const response = await fetch('/api/customer/bookings');

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const result = await response.json();

        if (result.success && result.bookings) {
          setBookings(result.bookings);
        }
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [session?.user?.email]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="w-full py-12 text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full">
        <div className="w-full py-12 px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-neutral-200">
            <AlertCircle className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
            <p className="text-neutral-600 mb-4">Please sign in to view your bookings.</p>
            <Link
              href="/auth/signin"
              className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full py-2 md:py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4 md:mb-6 px-4 md:px-0">My Bookings</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white md:rounded-xl border-y md:border border-neutral-200 p-8 text-center mx-0">
            <div className="flex justify-center gap-2 mb-4">
              <Plane className="w-10 h-10 text-neutral-300" />
              <Car className="w-10 h-10 text-neutral-300" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">No Bookings Yet</h2>
            <p className="text-neutral-600 mb-6">
              Your bookings will appear here once you complete a reservation.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors"
            >
              Start Booking
            </Link>
          </div>
        ) : (
          <div className="space-y-3 px-0 md:px-0">
            {bookings.map((booking) => {
              const isCarRental = booking.productType === 'car';

              return (
                <Link
                  key={booking.id}
                  href={`/account/bookings/${booking.id}`}
                  className="block bg-white md:rounded-xl border-y md:border-2 border-neutral-200 hover:border-primary-300 transition-all overflow-hidden"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isCarRental ? 'bg-amber-50' : 'bg-primary-50'
                        }`}>
                          {isCarRental ? (
                            <Car className="w-5 h-5 text-amber-600" />
                          ) : (
                            <Plane className="w-5 h-5 text-primary-500" />
                          )}
                        </div>
                        <div>
                          {isCarRental ? (
                            <>
                              <p className="font-semibold text-neutral-900">
                                {booking.carName || 'Car Rental'}
                              </p>
                              <p className="text-xs md:text-sm text-neutral-500">
                                {booking.pickupLocation} • Ref: {booking.bookingReference}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-neutral-900">
                                {booking.origin} → {booking.destination}
                              </p>
                              <p className="text-xs md:text-sm text-neutral-500">Ref: {booking.bookingReference}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                      <div className="flex items-center gap-1.5 md:gap-2 text-neutral-600">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="truncate">
                          {isCarRental && booking.dropoffDate
                            ? `${formatDate(booking.departureDate).split(',')[0]} - ${formatDate(booking.dropoffDate).split(',')[0]}`
                            : formatDate(booking.departureDate)
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 text-neutral-600">
                        {isCarRental ? (
                          <>
                            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="truncate">{booking.pickupLocation}</span>
                          </>
                        ) : (
                          <>
                            <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span>{booking.passengerCount} pax</span>
                          </>
                        )}
                      </div>
                      <div className="text-right font-bold text-neutral-900">
                        {booking.currency} {booking.totalAmount?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
