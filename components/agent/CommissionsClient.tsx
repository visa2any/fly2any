'use client';

// components/agent/CommissionsClient.tsx
// Level 6 Ultra-Premium Commissions Client
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, DollarSign, TrendingUp, Clock, CheckCircle, Wallet,
  AlertCircle, Plane, Building2, Ticket, Car, Package, ChevronRight,
  XCircle, Eye
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Commission {
  id: string;
  bookingId: string;
  status: string;
  agentEarnings: number;
  platformFee: number;
  commissionRate: number | null;
  bookingDate: Date;
  tripStartDate: Date;
  tripEndDate: Date;
  holdUntil: Date | null;
  releasedAt: Date | null;
  booking: {
    id: string;
    confirmationNumber: string | null;
    tripName: string | null;
    destination: string | null;
    total: number;
    paymentStatus: string;
    status: string;
    startDate: Date;
  };
  payout: { id: string; payoutNumber: string | null; status: string; completedAt: Date | null } | null;
}

interface CommissionsClientProps {
  commissions: Commission[];
  stats: {
    pending: number; confirmed: number; tripInProgress: number; inHoldPeriod: number;
    available: number; paid: number; cancelled: number; totalEarnings: number;
    pendingAmount: number; availableAmount: number; paidAmount: number;
    totalPlatformFees: number; flightCommissions: number; hotelCommissions: number;
    activityCommissions: number; transferCommissions: number; otherCommissions: number;
    averageCommission: number; averageCommissionRate: number;
    upcomingReleases: number; upcomingReleaseAmount: number;
  };
}

const statusConfig: Record<string, { bg: string; text: string; icon: any; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, dot: 'bg-amber-500' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', icon: CheckCircle, dot: 'bg-blue-500' },
  TRIP_IN_PROGRESS: { bg: 'bg-purple-50', text: 'text-purple-700', icon: Plane, dot: 'bg-purple-500' },
  IN_HOLD_PERIOD: { bg: 'bg-orange-50', text: 'text-orange-700', icon: Clock, dot: 'bg-orange-500' },
  AVAILABLE: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Wallet, dot: 'bg-emerald-500' },
  PAID: { bg: 'bg-gray-50', text: 'text-gray-700', icon: CheckCircle, dot: 'bg-gray-500' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, dot: 'bg-red-500' },
};

export default function CommissionsClient({ commissions, stats }: CommissionsClientProps) {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCommissions = commissions.filter(c => {
    if (filter !== 'ALL' && c.status !== filter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return c.booking.confirmationNumber?.toLowerCase().includes(s) ||
        c.booking.tripName?.toLowerCase().includes(s) ||
        c.booking.destination?.toLowerCase().includes(s);
    }
    return true;
  });

  const getDaysRemaining = (holdUntil: Date | null) => {
    if (!holdUntil) return null;
    const days = Math.ceil((new Date(holdUntil).getTime() - Date.now()) / 86400000);
    return days > 0 ? days : 0;
  };

  const statCards = [
    { label: 'Total Earnings', value: formatCurrency(stats.totalEarnings), sub: `Avg: ${formatCurrency(stats.averageCommission)}`, icon: DollarSign, gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Available', value: formatCurrency(stats.availableAmount), sub: `${stats.available} ready`, icon: Wallet, gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Pending', value: formatCurrency(stats.pendingAmount), sub: `${stats.pending + stats.confirmed + stats.tripInProgress + stats.inHoldPeriod} in pipeline`, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
    { label: 'Paid Out', value: formatCurrency(stats.paidAmount), sub: `${stats.paid} completed`, icon: CheckCircle, gradient: 'from-purple-500 to-pink-600' },
  ];

  const productBreakdown = [
    { label: 'Flights', amount: stats.flightCommissions, icon: Plane, color: 'blue' },
    { label: 'Hotels', amount: stats.hotelCommissions, icon: Building2, color: 'emerald' },
    { label: 'Activities', amount: stats.activityCommissions, icon: Ticket, color: 'purple' },
    { label: 'Transfers', amount: stats.transferCommissions, icon: Car, color: 'amber' },
    { label: 'Other', amount: stats.otherCommissions, icon: Package, color: 'gray' },
  ];

  const filters = [
    { value: 'ALL', label: 'All' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'IN_HOLD_PERIOD', label: 'On Hold' },
    { value: 'TRIP_IN_PROGRESS', label: 'Active' },
    { value: 'PAID', label: 'Paid' },
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
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Lifecycle Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Commission Lifecycle</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { status: 'PENDING', count: stats.pending },
            { status: 'CONFIRMED', count: stats.confirmed },
            { status: 'TRIP_IN_PROGRESS', count: stats.tripInProgress },
            { status: 'IN_HOLD_PERIOD', count: stats.inHoldPeriod },
            { status: 'AVAILABLE', count: stats.available },
            { status: 'PAID', count: stats.paid },
            { status: 'CANCELLED', count: stats.cancelled },
          ].map(item => {
            const sc = statusConfig[item.status];
            const Icon = sc.icon;
            return (
              <div key={item.status} className={`${sc.bg} rounded-xl p-3 text-center`}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className={`w-4 h-4 ${sc.text}`} />
                  <span className={`text-xs font-medium ${sc.text}`}>{item.status.replace('_', ' ')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Upcoming Releases Alert */}
      <AnimatePresence>
        {stats.upcomingReleases > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900">Commissions Releasing Soon!</p>
                <p className="text-sm text-emerald-700">
                  {stats.upcomingReleases} commissions worth <span className="font-bold">{formatCurrency(stats.upcomingReleaseAmount)}</span> available within 7 days.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      >
        <h3 className="font-semibold text-gray-900 mb-4">By Product Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {productBreakdown.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`bg-${item.color}-50 border border-${item.color}-100 rounded-xl p-4 text-center`}>
                <Icon className={`w-6 h-6 text-${item.color}-600 mx-auto mb-2`} />
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(item.amount)}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search commissions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-900">{filteredCommissions.length}</span> of {commissions.length} commissions
      </p>

      {/* Empty State */}
      {filteredCommissions.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No commissions found</h3>
          <p className="text-gray-500 mt-1">{searchTerm || filter !== 'ALL' ? 'Try adjusting filters' : 'Start creating bookings to earn'}</p>
        </motion.div>
      )}

      {/* Table */}
      {filteredCommissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Booking', 'Trip', 'Dates', 'Value', 'Commission', 'Status', 'Release'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCommissions.map((c, idx) => {
                  const sc = statusConfig[c.status] || statusConfig.PENDING;
                  const Icon = sc.icon;
                  const days = getDaysRemaining(c.holdUntil);
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <Link href={`/agent/bookings/${c.bookingId}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                          {c.booking.confirmationNumber || 'N/A'}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900">{c.booking.tripName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{c.booking.destination}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-900">{formatDate(c.tripStartDate)}</p>
                        <p className="text-xs text-gray-500">to {formatDate(c.tripEndDate)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-900">{formatCurrency(c.booking.total)}</p>
                        {c.commissionRate && <p className="text-xs text-gray-500">{c.commissionRate.toFixed(1)}%</p>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(c.agentEarnings)}</p>
                        <p className="text-xs text-gray-500">Fee: {formatCurrency(c.platformFee)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {c.status === 'IN_HOLD_PERIOD' && days !== null ? (
                          <div>
                            <p className="font-medium text-gray-900">{days} days</p>
                            <p className="text-xs text-gray-500">{formatDate(c.holdUntil!)}</p>
                          </div>
                        ) : c.status === 'AVAILABLE' ? (
                          <span className="text-emerald-600 font-medium">Ready Now</span>
                        ) : c.status === 'PAID' && c.payout ? (
                          <div>
                            <p className="font-medium text-gray-900">Paid</p>
                            <p className="text-xs text-gray-500">{c.payout.payoutNumber}</p>
                          </div>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Payout CTA */}
      {stats.availableAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Link href="/agent/payouts">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition-all"
            >
              <Wallet className="w-5 h-5" />
              Request Payout ({formatCurrency(stats.availableAmount)})
            </motion.button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
