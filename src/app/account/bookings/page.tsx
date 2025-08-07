'use client';

/**
 * 📋 BOOKING MANAGEMENT PAGE
 * Manage and view flight bookings
 * Route: /account/bookings
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import { CalendarIcon, ClockIcon, XIcon, CheckCircleIcon } from '@/components/Icons';

interface Booking {
  bookingReference: string;
  flightId: string;
  passengerInfo: any;
  flightDetails: any;
  pricing: {
    totalPrice: number;
    currency: string;
  };
  status: 'confirmed' | 'cancelled' | 'modified';
  bookingDate: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Load user bookings
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real implementation, get user email from authentication
        const userEmail = 'user@example.com'; // Replace with actual user email

        const response = await fetch(`/api/flights/booking/manage?email=${encodeURIComponent(userEmail)}`);
        const result = await response.json();

        if (result.success) {
          setBookings(result.data.bookings || []);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
        setError(error instanceof Error ? error.message : 'Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchQuery === '' || 
      booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.flightDetails.outbound.departure.iataCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.flightDetails.outbound.arrival.iataCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCancelBooking = async (bookingReference: string) => {
    if (!confirm('Are you sure you want to cancel this booking? Cancellation fees may apply.')) {
      return;
    }

    try {
      const response = await fetch('/api/flights/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingReference,
          cancellationReason: 'Customer requested'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(result.data.message);
        // Refresh bookings
        window.location.reload();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      alert('Failed to cancel booking. Please try again or contact support.');
    }
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">✅ Confirmed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">❌ Cancelled</span>;
      case 'modified':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">🔄 Modified</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">❓ Unknown</span>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">💳 Paid</span>;
      case 'refunded':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">💰 Refunded</span>;
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">⏳ Pending</span>;
      case 'failed':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">❌ Failed</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">❓ Unknown</span>;
    }
  };

  if (isLoading) {
    return (
      <>
        <GlobalMobileStyles />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <ResponsiveHeader />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your bookings...</p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalMobileStyles />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ResponsiveHeader />
        
        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="text-4xl">📋</span>
                  My Bookings
                </h1>
                <p className="text-gray-600 mt-2">Manage your flight bookings and travel plans</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by booking reference or airport codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Bookings</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="modified">Modified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {/* Empty State */}
          {!error && filteredBookings.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchQuery || filterStatus !== 'all' ? 'No Matching Bookings' : 'No Bookings Found'}
              </h3>
              <p className="text-gray-600 mb-8">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Start planning your next adventure by searching for flights!'}
              </p>
              <button
                onClick={() => router.push('/flights')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Search Flights
              </button>
            </div>
          )}

          {/* Bookings List */}
          {filteredBookings.length > 0 && (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <div key={booking.bookingReference} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* Booking Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold">
                          {booking.flightDetails.outbound.departure.iataCode} → {booking.flightDetails.outbound.arrival.iataCode}
                        </div>
                        <div className="text-blue-100 text-sm">
                          Booking Reference: {booking.bookingReference}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          ${booking.pricing.totalPrice.toFixed(2)}
                        </div>
                        <div className="text-blue-100 text-sm">
                          {booking.pricing.currency}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Flight Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Flight Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span>{booking.flightDetails.outbound.departure.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span>{booking.flightDetails.outbound.departure.time} - {booking.flightDetails.outbound.arrival.time}</span>
                          </div>
                          <div>Duration: {booking.flightDetails.outbound.duration}</div>
                        </div>
                      </div>

                      {/* Passenger Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Passenger</h4>
                        <div className="space-y-2 text-sm">
                          <div>{booking.passengerInfo.firstName} {booking.passengerInfo.lastName}</div>
                          <div className="text-gray-600">{booking.passengerInfo.email}</div>
                          <div className="text-gray-600">{booking.passengerInfo.phone}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(booking.status, booking.paymentStatus)}
                        {getPaymentStatusBadge(booking.paymentStatus)}
                        <span className="text-xs text-gray-500">
                          Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/flights/${booking.flightId}`)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                        
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.bookingReference)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}