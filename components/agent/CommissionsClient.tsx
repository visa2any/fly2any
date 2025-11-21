"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";

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
  payout: {
    id: string;
    payoutNumber: string | null;
    status: string;
    completedAt: Date | null;
  } | null;
}

interface CommissionsClientProps {
  commissions: Commission[];
  stats: {
    pending: number;
    confirmed: number;
    tripInProgress: number;
    inHoldPeriod: number;
    available: number;
    paid: number;
    cancelled: number;
    totalEarnings: number;
    pendingAmount: number;
    availableAmount: number;
    paidAmount: number;
    totalPlatformFees: number;
    flightCommissions: number;
    hotelCommissions: number;
    activityCommissions: number;
    transferCommissions: number;
    otherCommissions: number;
    averageCommission: number;
    averageCommissionRate: number;
    upcomingReleases: number;
    upcomingReleaseAmount: number;
  };
}

export default function CommissionsClient({ commissions, stats }: CommissionsClientProps) {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter commissions
  const filteredCommissions = commissions.filter((commission) => {
    const matchesFilter = filter === "ALL" || commission.status === filter;
    const matchesSearch =
      searchTerm === "" ||
      commission.booking.confirmationNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      commission.booking.tripName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.booking.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<
      string,
      { bg: string; text: string; label: string; icon: string }
    > = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
        icon: "⏳",
      },
      CONFIRMED: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Confirmed",
        icon: "✓",
      },
      TRIP_IN_PROGRESS: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Trip Active",
        icon: "✈️",
      },
      IN_HOLD_PERIOD: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        label: "On Hold",
        icon: "⏸️",
      },
      AVAILABLE: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Available",
        icon: "💰",
      },
      PAID: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Paid",
        icon: "✅",
      },
      CANCELLED: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Cancelled",
        icon: "❌",
      },
    };

    const config = configs[status] || configs.PENDING;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // Calculate days remaining for hold period
  const getDaysRemaining = (holdUntil: Date | null) => {
    if (!holdUntil) return null;
    const days = Math.ceil(
      (new Date(holdUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6">
      {/* Key Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-700">Total Earnings</p>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
          <p className="text-xs text-green-600 mt-1">
            Avg: {formatCurrency(stats.averageCommission)} per booking
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700">Available to Withdraw</p>
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-xl">💰</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.availableAmount)}
          </p>
          <p className="text-xs text-blue-600 mt-1">{stats.available} commissions ready</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-yellow-700">Pending Release</p>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-xl">⏳</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.pendingAmount)}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            {stats.pending + stats.confirmed + stats.tripInProgress + stats.inHoldPeriod} in
            pipeline
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-700">Already Paid</p>
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-xl">✅</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.paidAmount)}</p>
          <p className="text-xs text-purple-600 mt-1">{stats.paid} payouts completed</p>
        </div>
      </div>

      {/* Commission Lifecycle Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Lifecycle Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { status: "PENDING", count: stats.pending, label: "Pending" },
            { status: "CONFIRMED", count: stats.confirmed, label: "Confirmed" },
            { status: "TRIP_IN_PROGRESS", count: stats.tripInProgress, label: "Trip Active" },
            { status: "IN_HOLD_PERIOD", count: stats.inHoldPeriod, label: "On Hold" },
            { status: "AVAILABLE", count: stats.available, label: "Available" },
            { status: "PAID", count: stats.paid, label: "Paid" },
            { status: "CANCELLED", count: stats.cancelled, label: "Cancelled" },
          ].map((item) => (
            <div key={item.status} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              <p className="text-xs text-gray-600 mt-1">{item.label}</p>
              <div className="mt-2">
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Releases Alert */}
      {stats.upcomingReleases > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">
                Commissions Releasing Soon!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {stats.upcomingReleases} commissions worth{" "}
                <span className="font-bold">{formatCurrency(stats.upcomingReleaseAmount)}</span>{" "}
                will be available within the next 7 days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Commission Breakdown by Product Type */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Commission Breakdown by Product Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              label: "Flights",
              amount: stats.flightCommissions,
              icon: "✈️",
              color: "blue",
            },
            {
              label: "Hotels",
              amount: stats.hotelCommissions,
              icon: "🏨",
              color: "green",
            },
            {
              label: "Activities",
              amount: stats.activityCommissions,
              icon: "🎫",
              color: "purple",
            },
            {
              label: "Transfers",
              amount: stats.transferCommissions,
              icon: "🚐",
              color: "yellow",
            },
            { label: "Other", amount: stats.otherCommissions, icon: "📦", color: "gray" },
          ].map((item) => (
            <div
              key={item.label}
              className={`bg-${item.color}-50 border border-${item.color}-200 rounded-lg p-4 text-center`}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-sm font-medium text-gray-700">{item.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatCurrency(item.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by booking, trip, destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { value: "ALL", label: "All" },
              { value: "AVAILABLE", label: "Available" },
              { value: "IN_HOLD_PERIOD", label: "On Hold" },
              { value: "TRIP_IN_PROGRESS", label: "Trip Active" },
              { value: "PAID", label: "Paid" },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setFilter(status.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredCommissions.length}</span> of{" "}
          <span className="font-medium">{commissions.length}</span> commissions
        </p>
      </div>

      {/* Empty State */}
      {filteredCommissions.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No commissions found</h3>
          <p className="text-gray-600">
            {searchTerm || filter !== "ALL"
              ? "Try adjusting your search or filters"
              : "Start creating bookings to earn commissions"}
          </p>
        </div>
      )}

      {/* Commissions List */}
      {filteredCommissions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Travel Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Release Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCommissions.map((commission) => {
                  const daysRemaining = getDaysRemaining(commission.holdUntil);
                  return (
                    <tr key={commission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/agent/bookings/${commission.bookingId}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900"
                        >
                          {commission.booking.confirmationNumber || "N/A"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {commission.booking.tripName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {commission.booking.destination}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(commission.tripStartDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {formatDate(commission.tripEndDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(commission.booking.total)}
                        </div>
                        {commission.commissionRate && (
                          <div className="text-xs text-gray-500">
                            Rate: {commission.commissionRate.toFixed(1)}%
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {formatCurrency(commission.agentEarnings)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Fee: {formatCurrency(commission.platformFee)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={commission.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {commission.status === "IN_HOLD_PERIOD" && daysRemaining !== null ? (
                          <div>
                            <div className="font-medium">{daysRemaining} days</div>
                            <div className="text-xs text-gray-500">
                              {formatDate(commission.holdUntil!)}
                            </div>
                          </div>
                        ) : commission.status === "AVAILABLE" ? (
                          <span className="text-green-600 font-medium">Ready Now</span>
                        ) : commission.status === "PAID" && commission.payout ? (
                          <div>
                            <div className="font-medium">Paid</div>
                            <div className="text-xs text-gray-500">
                              {commission.payout.payoutNumber}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Button */}
      {stats.availableAmount > 0 && (
        <div className="flex justify-center">
          <Link
            href="/agent/payouts"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Request Payout ({formatCurrency(stats.availableAmount)})
          </Link>
        </div>
      )}
    </div>
  );
}
