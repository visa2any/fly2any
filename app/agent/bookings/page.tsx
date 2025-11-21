// app/agent/bookings/page.tsx
// Agent Bookings List - View all accepted quotes converted to bookings
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import BookingsClient from "@/components/agent/BookingsClient";

export const metadata = {
  title: "Bookings - Agent Portal",
  description: "View and manage all your travel bookings",
};

export default async function AgentBookingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/bookings");
  }

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
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

  // Fetch initial bookings data
  const bookings = await prisma!.agentBooking.findMany({
    where: { agentId: agent.id },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      quote: {
        select: {
          id: true,
          quoteNumber: true,
          tripName: true,
        },
      },
      commissions: {
        select: {
          id: true,
          status: true,
          agentEarnings: true,
          platformFee: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50, // Initial load
  });

  // Calculate stats
  const stats = await prisma!.agentBooking.aggregate({
    where: { agentId: agent.id },
    _sum: {
      total: true,
      depositAmount: true,
      balanceDue: true,
    },
    _count: true,
  });

  const statusCounts = await prisma!.agentBooking.groupBy({
    by: ["status"],
    where: { agentId: agent.id },
    _count: true,
  });

  const initialData = {
    bookings,
    stats: {
      totalBookings: stats._count,
      totalRevenue: stats._sum.total || 0,
      totalDeposits: stats._sum.depositAmount || 0,
      totalBalance: stats._sum.balanceDue || 0,
    },
    statusCounts: statusCounts.reduce(
      (acc, item) => ({
        ...acc,
        [item.status]: item._count,
      }),
      {}
    ),
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

      {/* Client Component with all the interactive features */}
      <BookingsClient initialData={initialData} />
    </div>
  );
}
