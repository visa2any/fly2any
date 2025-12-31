// app/agent/bookings/page.tsx
// Agent Bookings List - View all accepted quotes converted to bookings
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "Bookings - Agent Portal",
  description: "View and manage all your travel bookings",
};

export default async function AgentBookingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/bookings");
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

  // Check agent status
  if (agent.status !== "ACTIVE") {
    return (
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            Account Pending Approval
          </h2>
          <p className="text-yellow-700">
            Your agent account is pending approval. You'll be able to view bookings once your account is activated.
          </p>
        </div>
      </div>
    );
  }

  // Fetch bookings with explicit field selection (no DateTime fields)
  const bookingsRaw = await prisma?.agentBooking.findMany({
    where: { agentId: agent.id },
    select: {
      id: true,
      confirmationNumber: true,
      tripName: true,
      destination: true,
      status: true,
      paymentStatus: true,
      total: true,
      depositAmount: true,
      balanceDue: true,
      currency: true,
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      quote: {
        select: {
          id: true,
          quoteNumber: true,
        },
      },
      _count: {
        select: {
          commissions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Explicit primitive serialization
  const bookings = (bookingsRaw || []).map((b: any) => ({
    id: String(b.id || ""),
    confirmationNumber: b.confirmationNumber ? String(b.confirmationNumber) : null,
    tripName: b.tripName ? String(b.tripName) : "Untitled Trip",
    destination: b.destination ? String(b.destination) : null,
    status: String(b.status || "PENDING"),
    paymentStatus: String(b.paymentStatus || "PENDING"),
    total: Number(b.total) || 0,
    depositAmount: Number(b.depositAmount) || 0,
    balanceDue: Number(b.balanceDue) || 0,
    currency: String(b.currency || "USD"),
    clientName: b.client
      ? `${b.client.firstName || ""} ${b.client.lastName || ""}`.trim() || "No Client"
      : "No Client",
    clientEmail: b.client?.email ? String(b.client.email) : null,
    quoteNumber: b.quote?.quoteNumber ? String(b.quote.quoteNumber) : null,
    commissionCount: Number(b._count?.commissions) || 0,
  }));

  // Calculate stats
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.total, 0),
  };

  const statusColors: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    IN_PROGRESS: "bg-purple-100 text-purple-700",
  };

  const paymentColors: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PARTIAL: "bg-orange-100 text-orange-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    REFUNDED: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all your confirmed travel bookings
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Confirmed</p>
          <p className="text-2xl font-bold text-green-900">{stats.confirmed}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Completed</p>
          <p className="text-2xl font-bold text-blue-900">{stats.completed}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600">Revenue</p>
          <p className="text-2xl font-bold text-purple-900">${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Trip</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Destination</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Payment</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No bookings yet. Confirmed quotes will appear here.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{booking.tripName}</div>
                    {booking.confirmationNumber && (
                      <div className="text-xs text-gray-500">#{booking.confirmationNumber}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{booking.clientName}</td>
                  <td className="px-4 py-3 text-gray-600">{booking.destination || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[booking.status] || "bg-gray-100 text-gray-700"}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${paymentColors[booking.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    ${booking.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/agent/bookings/${booking.id}`}
                      className="text-primary-600 hover:underline text-sm"
                    >
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
  );
}
