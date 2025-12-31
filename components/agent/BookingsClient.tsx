'use client';

// components/agent/BookingsClient.tsx
// Level 6 Ultra-Premium Bookings Client
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, DollarSign, CreditCard, Clock, User,
  LayoutGrid, List, ChevronRight, Wallet, Receipt, AlertCircle
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Booking {
  id: string;
  bookingNumber: string | null;
  bookingReference: string | null;
  status: string;
  paymentStatus: string;
  startDate: Date;
  endDate: Date;
  total: number;
  depositAmount: number;
  balanceDue: number;
  currency: string;
  client: { id: string; firstName: string; lastName: string; email: string; phone: string | null };
  quote: { id: string; quoteNumber: string; tripName: string } | null;
  commissions: { id: string; status: string; agentEarnings: number; platformFee: number }[];
  createdAt: Date;
}

interface BookingsClientProps {
  initialData: {
    bookings: Booking[];
    stats: { totalBookings: number; totalRevenue: number; totalDeposits: number; totalBalance: number };
    statusCounts: Record<string, number>;
  };
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  COMPLETED: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const paymentConfig: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-red-50', text: 'text-red-700' },
  DEPOSIT_PAID: { bg: 'bg-amber-50', text: 'text-amber-700' },
  PARTIALLY_PAID: { bg: 'bg-blue-50', text: 'text-blue-700' },
  PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  REFUNDED: { bg: 'bg-gray-50', text: 'text-gray-700' },
};

export default function BookingsClient({ initialData }: BookingsClientProps) {
  const [bookings] = useState<Booking[]>(initialData.bookings);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'ALL' || b.status === filter;
    const matchesSearch = !searchTerm ||
      b.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.quote?.tripName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${b.client.firstName} ${b.client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statCards = [
    { label: 'Total Bookings', value: initialData.stats.totalBookings, icon: Receipt, color: 'indigo' },
    { label: 'Total Revenue', value: formatCurrency(initialData.stats.totalRevenue), icon: DollarSign, color: 'emerald' },
    { label: 'Deposits', value: formatCurrency(initialData.stats.totalDeposits), icon: Wallet, color: 'amber' },
    { label: 'Balance Due', value: formatCurrency(initialData.stats.totalBalance), icon: CreditCard, color: 'purple' },
  ];

  const filters = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-900">{filteredBookings.length}</span> of {bookings.length} bookings
      </p>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-12 text-center border border-gray-100"
        >
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No bookings found</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm || filter !== 'ALL' ? 'Try adjusting your filters' : 'Accepted quotes appear here'}
          </p>
        </motion.div>
      )}

      {/* Table View */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' && filteredBookings.length > 0 && (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Booking', 'Client', 'Trip', 'Dates', 'Total', 'Status', 'Payment', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map((b, idx) => {
                    const sc = statusConfig[b.status] || statusConfig.PENDING;
                    const pc = paymentConfig[b.paymentStatus] || paymentConfig.PENDING;
                    return (
                      <motion.tr
                        key={b.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">{b.bookingNumber}</p>
                          {b.bookingReference && <p className="text-xs text-gray-500">Ref: {b.bookingReference}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">{b.client.firstName} {b.client.lastName}</p>
                          <p className="text-sm text-gray-500">{b.client.email}</p>
                        </td>
                        <td className="px-5 py-4 text-gray-900">{b.quote?.tripName || 'N/A'}</td>
                        <td className="px-5 py-4">
                          <p className="text-gray-900">{formatDate(b.startDate)}</p>
                          <p className="text-xs text-gray-500">to {formatDate(b.endDate)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">{formatCurrency(b.total)}</p>
                          {b.commissions.length > 0 && (
                            <p className="text-xs text-emerald-600">
                              +{formatCurrency(b.commissions.reduce((s, c) => s + c.agentEarnings, 0))}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {b.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${pc.bg} ${pc.text}`}>
                            {b.paymentStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/agent/bookings/${b.id}`}
                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm inline-flex items-center gap-1"
                          >
                            View <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && filteredBookings.length > 0 && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredBookings.map((b, idx) => {
              const sc = statusConfig[b.status] || statusConfig.PENDING;
              const pc = paymentConfig[b.paymentStatus] || paymentConfig.PENDING;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Link
                    href={`/agent/bookings/${b.id}`}
                    className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">{b.bookingNumber}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3">{b.quote?.tripName || 'Booking'}</h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {b.client.firstName} {b.client.lastName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(b.startDate)} - {formatDate(b.endDate)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(b.total)}</p>
                        {b.commissions.length > 0 && (
                          <p className="text-xs text-emerald-600">+{formatCurrency(b.commissions.reduce((s, c) => s + c.agentEarnings, 0))} commission</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pc.bg} ${pc.text}`}>
                        {b.paymentStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
