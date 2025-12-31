'use client';

// components/agency/AnalyticsDashboardContent.tsx
// Level 6 Ultra-Premium Analytics Dashboard
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, FileText, Users, BarChart3,
  ArrowUpRight, ArrowDownRight, Calendar, Target, Award,
  CheckCircle, Clock, XCircle, Percent, ChevronRight
} from 'lucide-react';

interface TeamMember {
  id: string;
  commissionSplit: number;
  agent: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    totalSales: number;
    totalCommissions: number;
    quotesSent: number;
    quotesAccepted: number;
    conversionRate: number;
    avgDealSize: number;
    bookingsThisMonth: number;
    revenueThisMonth: number;
    user: { image: string | null };
  };
}

interface Booking {
  id: string;
  confirmationNumber: string;
  tripName: string;
  total: number;
  status: string;
  createdAt: Date;
  agent: { firstName: string | null; lastName: string | null };
  client: { firstName: string; lastName: string };
}

interface Props {
  teamMembers: TeamMember[];
  agencyTotals: {
    totalSales: number;
    totalCommissions: number;
    quotesSent: number;
    quotesAccepted: number;
    monthlyBookings: number;
    monthlyRevenue: number;
  };
  recentBookings: Booking[];
  quotesByStatus: Record<string, number>;
}

const timeRanges = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
];

export default function AnalyticsDashboardContent({
  teamMembers,
  agencyTotals,
  recentBookings,
  quotesByStatus,
}: Props) {
  const [timeRange, setTimeRange] = useState('month');

  const conversionRate = agencyTotals.quotesSent > 0
    ? ((agencyTotals.quotesAccepted / agencyTotals.quotesSent) * 100).toFixed(1)
    : '0';

  const avgDealSize = agencyTotals.quotesAccepted > 0
    ? (agencyTotals.totalSales / agencyTotals.quotesAccepted)
    : 0;

  const totalQuotes = Object.values(quotesByStatus).reduce((a, b) => a + b, 0);

  // Sort team by performance
  const topPerformers = [...teamMembers]
    .sort((a, b) => b.agent.totalSales - a.agent.totalSales)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your agency performance</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            name: 'Total Revenue',
            value: `$${agencyTotals.totalSales.toLocaleString()}`,
            change: '+12.5%',
            positive: true,
            icon: DollarSign,
            gradient: 'from-emerald-500 to-teal-600',
          },
          {
            name: 'Monthly Revenue',
            value: `$${agencyTotals.monthlyRevenue.toLocaleString()}`,
            change: '+8.2%',
            positive: true,
            icon: TrendingUp,
            gradient: 'from-blue-500 to-indigo-600',
          },
          {
            name: 'Conversion Rate',
            value: `${conversionRate}%`,
            change: '+2.1%',
            positive: true,
            icon: Target,
            gradient: 'from-violet-500 to-purple-600',
          },
          {
            name: 'Avg Deal Size',
            value: `$${avgDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            change: '-3.2%',
            positive: false,
            icon: BarChart3,
            gradient: 'from-amber-500 to-orange-600',
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold ${
                  stat.positive ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.name}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quotes & Top Performers Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quote Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quote Pipeline</h2>
          <div className="space-y-4">
            {[
              { status: 'DRAFT', label: 'Draft', icon: FileText, color: 'bg-gray-100 text-gray-600' },
              { status: 'SENT', label: 'Sent', icon: Clock, color: 'bg-blue-50 text-blue-600' },
              { status: 'VIEWED', label: 'Viewed', icon: CheckCircle, color: 'bg-amber-50 text-amber-600' },
              { status: 'ACCEPTED', label: 'Accepted', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
              { status: 'REJECTED', label: 'Rejected', icon: XCircle, color: 'bg-red-50 text-red-600' },
            ].map((item) => {
              const count = quotesByStatus[item.status] || 0;
              const percentage = totalQuotes > 0 ? (count / totalQuotes) * 100 : 0;
              const Icon = item.icon;

              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${item.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        item.status === 'ACCEPTED' ? 'bg-emerald-500' :
                        item.status === 'REJECTED' ? 'bg-red-400' :
                        item.status === 'VIEWED' ? 'bg-amber-400' :
                        item.status === 'SENT' ? 'bg-blue-400' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          {topPerformers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No team members yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((member, idx) => {
                const convRate = member.agent.quotesSent > 0
                  ? ((member.agent.quotesAccepted / member.agent.quotesSent) * 100).toFixed(0)
                  : '0';

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {idx + 1}
                    </span>
                    {member.agent.user.image ? (
                      <img
                        src={member.agent.user.image}
                        alt=""
                        className="w-9 h-9 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {(member.agent.firstName?.[0] || 'A').toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {member.agent.firstName} {member.agent.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {convRate}% conversion
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ${(member.agent.totalSales / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-gray-400">sales</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Team Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Team Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Quotes</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Conv.</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">This Month</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sales</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    No team members yet
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => {
                  const convRate = member.agent.quotesSent > 0
                    ? ((member.agent.quotesAccepted / member.agent.quotesSent) * 100).toFixed(0)
                    : '0';

                  return (
                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {member.agent.user.image ? (
                            <img
                              src={member.agent.user.image}
                              alt=""
                              className="w-9 h-9 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {(member.agent.firstName?.[0] || 'A').toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.agent.firstName} {member.agent.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{member.agent.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="font-medium text-gray-900">{member.agent.quotesSent}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-emerald-600">{member.agent.quotesAccepted}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          parseFloat(convRate) >= 30 ? 'bg-emerald-50 text-emerald-600' :
                          parseFloat(convRate) >= 15 ? 'bg-amber-50 text-amber-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          <Percent className="w-3 h-3" />
                          {convRate}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <p className="font-medium text-gray-900">{member.agent.bookingsThisMonth} bookings</p>
                        <p className="text-xs text-gray-500">${member.agent.revenueThisMonth.toLocaleString()}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="font-bold text-gray-900">${member.agent.totalSales.toLocaleString()}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="font-medium text-emerald-600">${member.agent.totalCommissions.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{(member.commissionSplit * 100).toFixed(0)}% split</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <span className="text-sm text-gray-500">{recentBookings.length} bookings</span>
        </div>
        <div className="divide-y divide-gray-50">
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No bookings yet</p>
            </div>
          ) : (
            recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    booking.status === 'CONFIRMED' ? 'bg-emerald-50' :
                    booking.status === 'PENDING' ? 'bg-amber-50' :
                    'bg-gray-50'
                  }`}>
                    {booking.status === 'CONFIRMED' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : booking.status === 'PENDING' ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{booking.tripName}</p>
                    <p className="text-xs text-gray-500">
                      {booking.agent.firstName} {booking.agent.lastName} • {booking.client.firstName} {booking.client.lastName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${booking.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
