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
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  Download,
  ArrowUpDown,
} from 'lucide-react';
import type { BookingSummary } from '@/lib/bookings/types';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, sortBy, sortOrder]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

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

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue: bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalAmount, 0),
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
    };

    const icons = {
      pending: <Clock className="w-3 h-3" />,
      confirmed: <CheckCircle2 className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      completed: <CheckCircle2 className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              Booking Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View and manage all flight bookings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-semibold text-gray-600">Total Bookings</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-lg border border-yellow-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <p className="text-xs font-semibold text-gray-600">Pending Payment</p>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-lg border border-green-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-gray-600">Confirmed</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
          </div>

          <div className="bg-white rounded-lg border border-red-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-xs font-semibold text-gray-600">Cancelled</p>
            </div>
            <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
          </div>

          <div className="bg-white rounded-lg border border-blue-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-semibold text-gray-600">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">${stats.revenue.toFixed(0)}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by booking reference, origin, or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-600" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by as 'date' | 'amount');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Price</option>
                <option value="amount-asc">Lowest Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Booking Ref
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Passengers
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
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Loading bookings...</p>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
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
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
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
      </div>
    </div>
  );
}
