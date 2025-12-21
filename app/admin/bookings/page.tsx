'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  Plane,
  Hotel,
  Car,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  Download,
  ArrowUpDown,
  MapPin,
  Ticket,
  FileCheck,
  Compass,
  Activity,
  Bus,
} from 'lucide-react';
import type { BookingSummary } from '@/lib/bookings/types';

type StatusFilter = 'all' | 'pending' | 'pending_ticketing' | 'confirmed' | 'ticketed' | 'cancelled' | 'completed';

interface HotelBooking {
  id: string;
  confirmationNumber: string;
  hotelName: string;
  hotelCity: string;
  hotelCountry: string;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  nights: number;
  totalPrice: number | string;
  currency: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  status: string;
  paymentStatus: string;
  createdAt: string | Date;
}

interface CarBooking {
  id: string;
  bookingReference: string;
  carName: string;
  carCategory: string;
  company: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string | Date;
  dropoffDate: string | Date;
  rentalDays: number;
  totalPrice: number;
  currency: string;
  driverFirstName: string;
  driverLastName: string;
  driverEmail: string;
  status: string;
  paymentStatus: string;
  createdAt: string | Date;
}

type TabType = 'flights' | 'hotels' | 'cars' | 'tours' | 'activities' | 'transfers';

export default function AdminBookingsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('flights');

  // Flight bookings state
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Hotel bookings state
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
  const [hotelLoading, setHotelLoading] = useState(true);
  const [hotelStats, setHotelStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    revenue: 0,
  });

  // Car bookings state
  const [carBookings, setCarBookings] = useState<CarBooking[]>([]);
  const [carLoading, setCarLoading] = useState(true);
  const [carStats, setCarStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchBookings();
    fetchHotelBookings();
    fetchCarBookings();
  }, [statusFilter, sortBy, sortOrder]);

  // Fetch car bookings from API
  const fetchCarBookings = async () => {
    try {
      setCarLoading(true);
      const params = new URLSearchParams();
      params.append('type', 'car'); // Filter only car bookings server-side
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch car bookings');

      const data = await response.json();
      // Car bookings already filtered by API - map to CarBooking format
      const cars = (data.bookings || [])
        .map((b: any) => ({
          id: b.id,
          bookingReference: b.bookingReference,
          // Use fields from getSummaries() - it already extracts these from flight JSON
          carName: b.carName || 'Unknown Car',
          carCategory: b.carCategory || 'Standard',
          company: b.company || 'Unknown',
          pickupLocation: b.pickupLocation || b.origin || '',
          dropoffLocation: b.dropoffLocation || b.destination || '',
          pickupDate: b.departureDate,
          dropoffDate: b.dropoffDate || '',
          rentalDays: b.rentalDays || 1,
          totalPrice: b.totalAmount || 0,
          currency: b.currency || 'USD',
          // Customer info from summary
          driverFirstName: b.customerName?.split(' ')[0] || '',
          driverLastName: b.customerName?.split(' ').slice(1).join(' ') || '',
          driverEmail: b.customerEmail || '',
          status: b.status,
          paymentStatus: 'pending',
          createdAt: b.createdAt,
        }));

      setCarBookings(cars);
      setCarStats({
        total: cars.length,
        pending: cars.filter((c: CarBooking) => c.status === 'pending').length,
        confirmed: cars.filter((c: CarBooking) => c.status === 'confirmed').length,
        cancelled: cars.filter((c: CarBooking) => c.status === 'cancelled').length,
        revenue: cars
          .filter((c: CarBooking) => c.status === 'confirmed')
          .reduce((sum: number, c: CarBooking) => sum + c.totalPrice, 0),
      });
    } catch (error) {
      console.error('Error fetching car bookings:', error);
    } finally {
      setCarLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', 'flight'); // Filter only flight bookings (exclude car rentals)

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelBookings = async () => {
    try {
      setHotelLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      params.append('sortBy', sortBy === 'date' ? 'newest' : 'amount');

      const response = await fetch(`/api/admin/hotel-bookings?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch hotel bookings');
      }

      const data = await response.json();
      setHotelBookings(data.bookings || []);
      if (data.stats) {
        // Map API response to component state (totalRevenue -> revenue)
        setHotelStats({
          total: data.stats.total || 0,
          pending: data.stats.pending || 0,
          confirmed: data.stats.confirmed || 0,
          cancelled: data.stats.cancelled || 0,
          revenue: data.stats.totalRevenue || data.stats.revenue || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching hotel bookings:', error);
    } finally {
      setHotelLoading(false);
    }
  };

  // Filter flight bookings
  const filteredBookings = bookings
    .filter(booking => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        booking.bookingReference.toLowerCase().includes(term) ||
        booking.origin.toLowerCase().includes(term) ||
        booking.destination.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') {
        return order * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      return order * (a.totalAmount - b.totalAmount);
    });

  // Filter hotel bookings
  const filteredHotelBookings = hotelBookings
    .filter(booking => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        booking.confirmationNumber.toLowerCase().includes(term) ||
        booking.hotelName.toLowerCase().includes(term) ||
        booking.hotelCity.toLowerCase().includes(term) ||
        booking.guestEmail.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') {
        return order * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      const priceA = typeof a.totalPrice === 'string' ? parseFloat(a.totalPrice) : a.totalPrice;
      const priceB = typeof b.totalPrice === 'string' ? parseFloat(b.totalPrice) : b.totalPrice;
      return order * (priceA - priceB);
    });

  // Flight stats
  const flightStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    pendingTicketing: bookings.filter(b => b.status === 'pending_ticketing').length,
    ticketed: bookings.filter(b => b.status === 'ticketed').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings
      .filter(b => b.status === 'confirmed' || b.status === 'ticketed')
      .reduce((sum, b) => sum + b.totalAmount, 0),
  };

  // Filter car bookings
  const filteredCarBookings = carBookings
    .filter(booking => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        booking.bookingReference.toLowerCase().includes(term) ||
        booking.carName.toLowerCase().includes(term) ||
        booking.pickupLocation.toLowerCase().includes(term) ||
        booking.driverEmail.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'date') {
        return order * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      return order * (a.totalPrice - b.totalPrice);
    });

  // Use appropriate stats based on active tab
  const stats = activeTab === 'flights' ? flightStats : activeTab === 'hotels' ? hotelStats : carStats;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      pending_ticketing: 'bg-orange-100 text-orange-800 border-orange-300',
      ticketed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
    };

    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="w-3 h-3" />,
      pending_ticketing: <Ticket className="w-3 h-3" />,
      ticketed: <FileCheck className="w-3 h-3" />,
      confirmed: <CheckCircle2 className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      completed: <CheckCircle2 className="w-3 h-3" />,
    };

    const labels: Record<string, string> = {
      pending: 'Pending',
      pending_ticketing: 'Needs Ticketing',
      ticketed: 'Ticketed',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
        {icons[status] || icons.pending}
        {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="w-full px-4 md:px-6 py-6 space-y-5">
        {/* Header - Level 6 Premium */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-transform duration-200">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              Booking Management
            </h1>
            <p className="text-sm text-gray-500 ml-[52px]">
              View and manage all flight and hotel bookings
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh - Level 6 Action */}
            <button
              onClick={() => {
                fetchBookings();
                fetchHotelBookings();
              }}
              disabled={loading || hotelLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md disabled:opacity-50 text-gray-700 font-medium rounded-xl transition-all duration-200 shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${(loading || hotelLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Primary Action - Level 6 */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Cards - Level 3-4 with subtle hover */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-gray-500">Total</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          {/* Urgent Action Card - Level 6 */}
          {activeTab === 'flights' && flightStats.pendingTicketing > 0 && (
            <div
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-400 shadow-md p-4 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
              onClick={() => setStatusFilter('pending_ticketing')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-orange-600 animate-pulse" />
                <p className="text-xs font-bold text-orange-800">NEEDS TICKETING</p>
              </div>
              <p className="text-2xl font-bold text-orange-700">{flightStats.pendingTicketing}</p>
              <p className="text-xs text-orange-600 mt-1">Click to view →</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <p className="text-xs font-medium text-gray-500">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          {activeTab === 'flights' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <p className="text-xs font-medium text-gray-500">Ticketed</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{flightStats.ticketed}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-xs font-medium text-gray-500">Confirmed</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs font-medium text-gray-500">Cancelled</p>
            </div>
            <p className="text-2xl font-bold text-red-500">{stats.cancelled}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-gray-500">Revenue</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">${stats.revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs - Level 6 Premium */}
        <div className="flex gap-3 p-1 bg-gray-100/80 rounded-2xl">
          <button
            onClick={() => setActiveTab('flights')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'flights'
                ? 'bg-white text-blue-700 shadow-lg shadow-gray-200/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plane className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'flights' ? 'scale-110' : ''}`} />
            Flights
            {flightStats.total > 0 && (
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors duration-300 ${
                activeTab === 'flights' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {flightStats.total}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'hotels'
                ? 'bg-white text-orange-600 shadow-lg shadow-gray-200/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Hotel className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'hotels' ? 'scale-110' : ''}`} />
            Hotels
            {hotelStats.total > 0 && (
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors duration-300 ${
                activeTab === 'hotels' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {hotelStats.total}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('cars')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'cars'
                ? 'bg-white text-emerald-600 shadow-lg shadow-gray-200/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Car className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'cars' ? 'scale-110' : ''}`} />
            Cars
            {carStats.total > 0 && (
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors duration-300 ${
                activeTab === 'cars' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {carStats.total}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('tours')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'tours'
                ? 'bg-white text-purple-600 shadow-lg shadow-gray-200/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Compass className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'tours' ? 'scale-110' : ''}`} />
            Tours
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'activities'
                ? 'bg-white text-pink-600 shadow-lg shadow-gray-200/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'activities' ? 'scale-110' : ''}`} />
            Activities
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'transfers'
                ? 'bg-white text-cyan-600 shadow-lg shadow-gray-200/50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bus className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'transfers' ? 'scale-110' : ''}`} />
            Transfers
          </button>
        </div>

        {/* Filters and Search - Level 3-4 Functional */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reference, origin, or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className={`px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                  statusFilter === 'pending_ticketing'
                    ? 'border-orange-400 bg-orange-50 text-orange-800 font-semibold'
                    : 'border-gray-200 bg-gray-50 focus:bg-white'
                }`}
              >
                <option value="all">All Status</option>
                <option value="pending_ticketing">⚡ Needs Ticketing</option>
                <option value="pending">Pending Payment</option>
                <option value="ticketed">Ticketed</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by as 'date' | 'amount');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Price</option>
                <option value="amount-asc">Lowest Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* FLIGHTS TAB - Bookings Table */}
        {activeTab === 'flights' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Booking Ref
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pax
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Loading bookings...</p>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No bookings found</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {searchTerm
                          ? 'Try adjusting your search criteria'
                          : 'Bookings will appear here once customers complete their orders'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm font-semibold text-blue-600">
                          {booking.bookingReference}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {booking.customerName || 'N/A'}
                          </div>
                          {booking.customerEmail && (
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {booking.customerEmail}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-900">{booking.origin}</span>
                          <Plane className="w-3 h-3 text-gray-400" />
                          <span className="font-semibold text-gray-900">{booking.destination}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">
                          {new Date(booking.departureDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <User className="w-3 h-3 text-gray-400" />
                          {booking.passengerCount}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {booking.currency} {booking.totalAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">
                          {new Date(booking.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === 'pending_ticketing' && (
                            <Link
                              href={`/admin/bookings/${booking.id}?action=ticket`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              <Ticket className="w-3 h-3" />
                              Ticket
                            </Link>
                          )}
                          <Link
                            href={`/admin/bookings/${booking.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* HOTELS TAB - Bookings Table */}
        {activeTab === 'hotels' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Confirmation
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Hotel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Nights
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hotelLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Loading hotel bookings...</p>
                      </td>
                    </tr>
                  ) : filteredHotelBookings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">No hotel bookings found</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {searchTerm
                            ? 'Try adjusting your search criteria'
                            : 'Hotel bookings will appear here once customers complete their orders'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredHotelBookings.map((booking) => {
                      const totalPrice = typeof booking.totalPrice === 'string'
                        ? parseFloat(booking.totalPrice)
                        : booking.totalPrice;

                      return (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-mono text-sm font-semibold text-orange-600">
                              {booking.confirmationNumber}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">
                                  {booking.hotelName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {booking.hotelCity}, {booking.hotelCountry}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-semibold text-gray-900">
                                {booking.guestFirstName} {booking.guestLastName}
                              </div>
                              <div className="text-xs text-gray-500">{booking.guestEmail}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-700">
                              {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-700">{booking.nights}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {booking.currency} {totalPrice.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-gray-600">
                              {new Date(booking.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/admin/hotel-bookings/${booking.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Car Rentals Table */}
        {activeTab === 'cars' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pickup</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {carLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Loading car rentals...</p>
                      </td>
                    </tr>
                  ) : filteredCarBookings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center">
                        <Car className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No car rental bookings found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCarBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm font-bold text-emerald-600">{booking.bookingReference}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-emerald-500" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.carName}</div>
                              <div className="text-xs text-gray-500">{booking.company} - {booking.carCategory}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <MapPin className="w-3 h-3" />
                            {booking.pickupLocation}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(booking.pickupDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.driverFirstName} {booking.driverLastName}
                          </div>
                          <div className="text-xs text-gray-500">{booking.driverEmail}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{booking.rentalDays} days</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">
                            ${booking.totalPrice.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600">
                            {new Date(booking.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/bookings/${booking.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tours Tab - Coming Soon */}
        {activeTab === 'tours' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <Compass className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tours Bookings</h3>
            <p className="text-gray-500 mb-4">Tour booking management coming soon.</p>
            <p className="text-sm text-gray-400">When customers book tours, reservations will appear here.</p>
          </div>
        )}

        {/* Activities Tab - Coming Soon */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <Activity className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Activities Bookings</h3>
            <p className="text-gray-500 mb-4">Activity booking management coming soon.</p>
            <p className="text-sm text-gray-400">When customers book activities, reservations will appear here.</p>
          </div>
        )}

        {/* Transfers Tab - Coming Soon */}
        {activeTab === 'transfers' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <Bus className="w-16 h-16 text-cyan-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Transfers Bookings</h3>
            <p className="text-gray-500 mb-4">Transfer booking management coming soon.</p>
            <p className="text-sm text-gray-400">When customers book transfers, reservations will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
