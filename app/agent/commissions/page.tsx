// app/agent/commissions/page.tsx
// Agent Commissions Dashboard - Track earnings and commission lifecycle
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "Commissions - Agent Portal",
  description: "Track your commission earnings and lifecycle status",
};

export default async function AgentCommissionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/commissions");
  }

  const agent = await prisma?.travelAgent.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      status: true,
    },
  });

  if (!agent) {
    redirect("/agent/register");
  }

  if (agent.status !== "ACTIVE") {
    return (
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Account Pending Approval
          </h2>
          <p className="text-yellow-700">
            Your agent account is pending approval. Commission tracking will be available once activated.
          </p>
        </div>
      </div>
    );
  }

  // Fetch commissions with explicit field selection (no DateTime fields)
  const commissionsRaw = await prisma?.agentCommission.findMany({
    where: { agentId: agent.id },
    select: {
      id: true,
      status: true,
      agentEarnings: true,
      platformFee: true,
      commissionRate: true,
      flightCommission: true,
      hotelCommission: true,
      activityCommission: true,
      transferCommission: true,
      otherCommission: true,
      booking: {
        select: {
          id: true,
          confirmationNumber: true,
          tripName: true,
          destination: true,
          total: true,
          paymentStatus: true,
          status: true,
        },
      },
      payout: {
        select: {
          id: true,
          payoutNumber: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Explicit primitive serialization
  const commissions = (commissionsRaw || []).map((c: any) => ({
    id: String(c.id || ""),
    status: String(c.status || "PENDING"),
    agentEarnings: Number(c.agentEarnings) || 0,
    platformFee: Number(c.platformFee) || 0,
    commissionRate: Number(c.commissionRate) || 0,
    flightCommission: Number(c.flightCommission) || 0,
    hotelCommission: Number(c.hotelCommission) || 0,
    activityCommission: Number(c.activityCommission) || 0,
    transferCommission: Number(c.transferCommission) || 0,
    otherCommission: Number(c.otherCommission) || 0,
    bookingId: c.booking?.id ? String(c.booking.id) : null,
    confirmationNumber: c.booking?.confirmationNumber ? String(c.booking.confirmationNumber) : null,
    tripName: c.booking?.tripName ? String(c.booking.tripName) : "Unknown Trip",
    destination: c.booking?.destination ? String(c.booking.destination) : null,
    bookingTotal: Number(c.booking?.total) || 0,
    paymentStatus: c.booking?.paymentStatus ? String(c.booking.paymentStatus) : null,
    bookingStatus: c.booking?.status ? String(c.booking.status) : null,
    payoutId: c.payout?.id ? String(c.payout.id) : null,
    payoutNumber: c.payout?.payoutNumber ? String(c.payout.payoutNumber) : null,
    payoutStatus: c.payout?.status ? String(c.payout.status) : null,
  }));

  // Calculate comprehensive stats
  const stats = {
    // Lifecycle breakdown
    total: commissions.length,
    pending: commissions.filter((c) => c.status === "PENDING").length,
    confirmed: commissions.filter((c) => c.status === "CONFIRMED").length,
    tripInProgress: commissions.filter((c) => c.status === "TRIP_IN_PROGRESS").length,
    inHoldPeriod: commissions.filter((c) => c.status === "IN_HOLD_PERIOD").length,
    available: commissions.filter((c) => c.status === "AVAILABLE").length,
    paid: commissions.filter((c) => c.status === "PAID").length,
    cancelled: commissions.filter((c) => c.status === "CANCELLED").length,

    // Financial breakdown
    totalEarnings: commissions
      .filter((c) => c.status !== "CANCELLED")
      .reduce((sum, c) => sum + c.agentEarnings, 0),

    pendingAmount: commissions
      .filter((c) =>
        ["PENDING", "CONFIRMED", "TRIP_IN_PROGRESS", "IN_HOLD_PERIOD"].includes(c.status)
      )
      .reduce((sum, c) => sum + c.agentEarnings, 0),

    availableAmount: commissions
      .filter((c) => c.status === "AVAILABLE")
      .reduce((sum, c) => sum + c.agentEarnings, 0),

    paidAmount: commissions
      .filter((c) => c.status === "PAID")
      .reduce((sum, c) => sum + c.agentEarnings, 0),
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    TRIP_IN_PROGRESS: "bg-purple-100 text-purple-700",
    IN_HOLD_PERIOD: "bg-orange-100 text-orange-700",
    AVAILABLE: "bg-green-100 text-green-700",
    PAID: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commission Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your earnings and commission lifecycle
          </p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">${stats.pendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Available</p>
          <p className="text-2xl font-bold text-green-900">${stats.availableAmount.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-600">Paid Out</p>
          <p className="text-2xl font-bold text-emerald-900">${stats.paidAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3 rounded-lg border text-center">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
          <p className="text-xs text-yellow-600">Pending</p>
          <p className="text-xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
          <p className="text-xs text-blue-600">Confirmed</p>
          <p className="text-xl font-bold text-blue-900">{stats.confirmed}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
          <p className="text-xs text-purple-600">In Progress</p>
          <p className="text-xl font-bold text-purple-900">{stats.tripInProgress}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
          <p className="text-xs text-orange-600">Hold Period</p>
          <p className="text-xl font-bold text-orange-900">{stats.inHoldPeriod}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
          <p className="text-xs text-green-600">Available</p>
          <p className="text-xl font-bold text-green-900">{stats.available}</p>
        </div>
        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-center">
          <p className="text-xs text-emerald-600">Paid</p>
          <p className="text-xl font-bold text-emerald-900">{stats.paid}</p>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Trip</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Booking Total</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Rate</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Earnings</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {commissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No commissions yet. Complete bookings to earn commissions.
                </td>
              </tr>
            ) : (
              commissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{commission.tripName}</div>
                    {commission.confirmationNumber && (
                      <div className="text-xs text-gray-500">#{commission.confirmationNumber}</div>
                    )}
                    {commission.destination && (
                      <div className="text-xs text-gray-400">{commission.destination}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[commission.status] || "bg-gray-100 text-gray-700"}`}>
                      {commission.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    ${commission.bookingTotal.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {(commission.commissionRate * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">
                    ${commission.agentEarnings.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {commission.bookingId && (
                      <Link
                        href={`/agent/bookings/${commission.bookingId}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        View Booking
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Available for Payout */}
      {stats.availableAmount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-green-800">Ready for Payout</p>
            <p className="text-sm text-green-600">
              You have ${stats.availableAmount.toLocaleString()} available for withdrawal
            </p>
          </div>
          <Link
            href="/agent/payouts"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Request Payout
          </Link>
        </div>
      )}
    </div>
  );
}
