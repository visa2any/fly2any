'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Hotel,
  Calendar,
  Users,
  Filter,
  Search,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import BookingCard from '@/components/account/BookingCard';
import HotelBookingCard from '@/components/bookings/HotelBookingCard';
import type { HotelBooking } from '@/components/bookings/HotelBookingCard';
import BookingFilters from '@/components/account/BookingFilters';
import BookingStats from '@/components/account/BookingStats';
import type { Booking, BookingStatus } from '@/lib/bookings/types';
import Link from 'next/link';

interface BookingsResponse {
  success: boolean;
  data?: {
    bookings: Booking[];
    total: number;
  };
  error?: {
    message: string;
    code: string;
  };
}

interface FilterState {
  status: BookingStatus | 'all';
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
  sortBy: 'newest' | 'oldest';
}

const ITEMS_PER_PAGE = 10;

export default function BookingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');

  // Flight bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Hotel bookings state
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
  const [filteredHotelBookings, setFilteredHotelBookings] = useState<HotelBooking[]>([]);
  const [hotelLoading, setHotelLoading] = useState(true);
  const [hotelError, setHotelError] = useState<string | null>(null);
  const [hotelCurrentPage, setHotelCurrentPage] = useState(1);
  const [totalHotelBookings, setTotalHotelBookings] = useState(0);

  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    searchQuery: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [sessionStatus, router]);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (session?.user?.email) {
        params.append('email', session.user.email);
      }
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.searchQuery) {
        params.append('search', filters.searchQuery);
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo);
      }
      params.append('limit', ITEMS_PER_PAGE.toString());
      params.append('offset', ((currentPage - 1) * ITEMS_PER_PAGE).toString());

      const response = await fetch(`/api/bookings?${params.toString()}`);
      const data: BookingsResponse = await response.json();

      if (data.success && data.data) {
        let fetchedBookings = data.data.bookings;

        // Apply client-side sorting
        if (filters.sortBy === 'newest') {
          fetchedBookings.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else {
          fetchedBookings.sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }

        setBookings(fetchedBookings);
        setFilteredBookings(fetchedBookings);
        setTotalBookings(data.data.total);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch bookings');
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch hotel bookings
  const fetchHotelBookings = async () => {
    try {
      setHotelLoading(true);
      setHotelError(null);

      const params = new URLSearchParams();
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      params.append('limit', ITEMS_PER_PAGE.toString());
      params.append('offset', ((hotelCurrentPage - 1) * ITEMS_PER_PAGE).toString());

      const response = await fetch(`/api/hotels/bookings?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch hotel bookings');
      }

      const data = await response.json();

      let fetchedBookings = data.bookings || [];

      // Apply client-side sorting
      if (filters.sortBy === 'newest') {
        fetchedBookings.sort((a: HotelBooking, b: HotelBooking) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        fetchedBookings.sort((a: HotelBooking, b: HotelBooking) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      setHotelBookings(fetchedBookings);
      setFilteredHotelBookings(fetchedBookings);
      setTotalHotelBookings(data.total || fetchedBookings.length);
    } catch (err: any) {
      console.error('Error fetching hotel bookings:', err);
      setHotelError(err.message || 'Failed to load hotel bookings. Please try again.');
    } finally {
      setHotelLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchBookings();
      fetchHotelBookings();
    }
  }, [sessionStatus, currentPage, filters.status, filters.dateFrom, filters.dateTo]);

  // Apply search filter locally for flights
  useEffect(() => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const filtered = bookings.filter(
        (booking) =>
          booking.bookingReference.toLowerCase().includes(query) ||
          booking.contactInfo.email.toLowerCase().includes(query) ||
          booking.flight.segments.some(
            (seg) =>
              seg.departure.iataCode.toLowerCase().includes(query) ||
              seg.arrival.iataCode.toLowerCase().includes(query)
          )
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
  }, [filters.searchQuery, bookings]);

  // Apply search filter locally for hotels
  useEffect(() => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const filtered = hotelBookings.filter(
        (booking) =>
          booking.confirmationNumber.toLowerCase().includes(query) ||
          booking.guestEmail.toLowerCase().includes(query) ||
          booking.hotelName.toLowerCase().includes(query) ||
          booking.hotelCity.toLowerCase().includes(query) ||
          booking.hotelCountry.toLowerCase().includes(query)
      );
      setFilteredHotelBookings(filtered);
    } else {
      setFilteredHotelBookings(hotelBookings);
    }
  }, [filters.searchQuery, hotelBookings]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleRetry = () => {
    fetchBookings();
  };

  const totalPages = Math.ceil(totalBookings / ITEMS_PER_PAGE);
  const totalHotelPages = Math.ceil(totalHotelBookings / ITEMS_PER_PAGE);

  // Calculate stats for both flights and hotels
  const flightStats = {
    total: totalBookings,
    upcoming: bookings.filter(
      (b) =>
        b.status === 'confirmed' &&
        new Date(b.flight.segments[0].departure.at) > new Date()
    ).length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const hotelStats = {
    total: totalHotelBookings,
    upcoming: hotelBookings.filter(
      (b) =>
        b.status === 'confirmed' &&
        new Date(b.checkInDate) > new Date()
    ).length,
    completed: hotelBookings.filter((b) => b.status === 'completed').length,
    cancelled: hotelBookings.filter((b) => b.status === 'cancelled').length,
  };

  // Combined stats
  const stats = {
    total: flightStats.total + hotelStats.total,
    upcoming: flightStats.upcoming + hotelStats.upcoming,
    completed: flightStats.completed + hotelStats.completed,
    cancelled: flightStats.cancelled + hotelStats.cancelled,
  };

  if (sessionStatus === 'loading' || (loading && hotelLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Bookings
              </h1>
              <p className="text-gray-600">
                View and manage all your flight and hotel bookings
              </p>
            </div>
            <Link
              href="/account"
              className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Back to Account
            </Link>
          </div>

          {/* Stats Dashboard */}
          <BookingStats stats={stats} />

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'flights'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Plane className="w-5 h-5" />
              Flights
              {flightStats.total > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'flights' ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                }`}>
                  {flightStats.total}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'hotels'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Hotel className="w-5 h-5" />
              Hotels
              {hotelStats.total > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'hotels' ? 'bg-white/20' : 'bg-orange-100 text-orange-700'
                }`}>
                  {hotelStats.total}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by booking reference, email, or airport..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    handleFilterChange({ searchQuery: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) =>
                handleFilterChange({
                  status: e.target.value as BookingStatus | 'all',
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleFilterChange({
                  sortBy: e.target.value as 'newest' | 'oldest',
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            {/* More Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                showFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <BookingFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-6 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Error Loading Bookings
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FLIGHTS TAB CONTENT */}
        {activeTab === 'flights' && (
          <>
            {/* Empty State */}
            {!loading && !error && filteredBookings.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {filters.searchQuery || filters.status !== 'all'
                    ? 'No flight bookings found'
                    : 'No flight bookings yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filters.searchQuery || filters.status !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Start by searching for flights and make your first booking'}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <Plane className="w-5 h-5" />
                  Search Flights
                </Link>
              </div>
            )}

            {/* Bookings List */}
            {!loading && !error && filteredBookings.length > 0 && (
          <>
            <div className="space-y-4 mb-8">
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalBookings)} of{' '}
                    {totalBookings} bookings
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading Skeletons */}
        {activeTab === 'flights' && loading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md p-6 animate-pulse"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* HOTELS TAB CONTENT */}
        {activeTab === 'hotels' && (
          <>
            {/* Error State */}
            {hotelError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-6 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Error Loading Hotel Bookings
                    </h3>
                    <p className="text-red-700 mb-4">{hotelError}</p>
                    <button
                      onClick={fetchHotelBookings}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!hotelLoading && !hotelError && filteredHotelBookings.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Hotel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {filters.searchQuery || filters.status !== 'all'
                    ? 'No hotel bookings found'
                    : 'No hotel bookings yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filters.searchQuery || filters.status !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Start by searching for hotels and make your first booking'}
                </p>
                <Link
                  href="/hotels"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  <Hotel className="w-5 h-5" />
                  Search Hotels
                </Link>
              </div>
            )}

            {/* Hotel Bookings List */}
            {!hotelLoading && !hotelError && filteredHotelBookings.length > 0 && (
              <>
                <div className="space-y-4 mb-8">
                  {filteredHotelBookings.map((booking) => (
                    <HotelBookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={async (bookingId) => {
                        try {
                          const response = await fetch(`/api/hotels/booking/${bookingId}/cancel`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          });

                          const data = await response.json();

                          if (!response.ok) {
                            throw new Error(data.error || 'Failed to cancel booking');
                          }

                          // Show success message with refund info
                          let message = 'Booking cancelled successfully!';
                          if (data.refund?.status === 'succeeded') {
                            message += ` A refund of ${new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: data.refund.currency,
                            }).format(data.refund.amount)} has been processed.`;
                          }
                          alert(message);

                          // Refresh bookings list
                          await fetchHotelBookings();
                        } catch (error: any) {
                          console.error('Cancellation error:', error);
                          throw error; // Re-throw so HotelBookingCard can handle it
                        }
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalHotelPages > 1 && (
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {(hotelCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                        {Math.min(hotelCurrentPage * ITEMS_PER_PAGE, totalHotelBookings)} of{' '}
                        {totalHotelBookings} hotel bookings
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setHotelCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={hotelCurrentPage === 1}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: totalHotelPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === totalHotelPages ||
                              (page >= hotelCurrentPage - 1 && page <= hotelCurrentPage + 1)
                          )
                          .map((page, index, array) => (
                            <div key={page} className="flex items-center">
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => setHotelCurrentPage(page)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                  hotelCurrentPage === page
                                    ? 'bg-orange-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          ))}
                        <button
                          onClick={() =>
                            setHotelCurrentPage((p) => Math.min(totalHotelPages, p + 1))
                          }
                          disabled={hotelCurrentPage === totalHotelPages}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Loading Skeletons */}
            {hotelLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md p-6 animate-pulse"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
