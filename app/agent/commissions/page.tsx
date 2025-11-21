// app/agent/commissions/page.tsx
// Agent Commissions Dashboard - Track earnings and commission lifecycle
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CommissionsClient from "@/components/agent/CommissionsClient";

export const metadata = {
  title: "Commissions - Agent Portal",
  description: "Track your commission earnings and lifecycle status",
};

export default async function AgentCommissionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent/commissions");
  }

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
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

  // Fetch all commissions for comprehensive stats
  const allCommissions = await prisma!.agentCommission.findMany({
    where: { agentId: agent.id },
    include: {
      booking: {
        select: {
          id: true,
          confirmationNumber: true,
          tripName: true,
          destination: true,
          total: true,
          paymentStatus: true,
          status: true,
          startDate: true,
        },
      },
      payout: {
        select: {
          id: true,
          payoutNumber: true,
          status: true,
          completedAt: true,
        },
      },
    },
    orderBy: { bookingDate: "desc" },
  });

  // Calculate comprehensive stats
  const stats = {
    // Lifecycle breakdown
    pending: allCommissions.filter((c) => c.status === "PENDING").length,
    confirmed: allCommissions.filter((c) => c.status === "TRIP_IN_PROGRESS").length,
    tripInProgress: allCommissions.filter((c) => c.status === "TRIP_IN_PROGRESS").length,
    inHoldPeriod: allCommissions.filter((c) => c.status === "IN_HOLD_PERIOD").length,
    available: allCommissions.filter((c) => c.status === "AVAILABLE").length,
    paid: allCommissions.filter((c) => c.status === "PAID").length,
    cancelled: allCommissions.filter((c) => c.status === "CANCELLED").length,

    // Financial breakdown
    totalEarnings: allCommissions
      .filter((c) => c.status !== "CANCELLED")
      .reduce((sum, c) => sum + c.agentEarnings, 0),

    pendingAmount: allCommissions
      .filter((c) =>
        ["PENDING", "CONFIRMED", "TRIP_IN_PROGRESS", "IN_HOLD_PERIOD"].includes(c.status)
      )
      .reduce((sum, c) => sum + c.agentEarnings, 0),

    availableAmount: allCommissions
      .filter((c) => c.status === "AVAILABLE")
      .reduce((sum, c) => sum + c.agentEarnings, 0),

    paidAmount: allCommissions
      .filter((c) => c.status === "PAID")
      .reduce((sum, c) => sum + c.agentEarnings, 0),

    totalPlatformFees: allCommissions
      .filter((c) => c.status !== "CANCELLED")
      .reduce((sum, c) => sum + c.platformFee, 0),

    // Commission by product type
    flightCommissions: allCommissions
      .filter((c) => c.status !== "CANCELLED")
      .reduce((sum, c) => sum + (c.flightCommission || 0), 0),

    hotelCommissions: allCommissions
      .filter((c) => c.status !== "CANCELLED")
      .reduce((sum, c) => sum + (c.hotelCommission || 0), 0),

    activityCommissions: allCommissions
      .filter((c) => c.status !== "CANCELLED")
      .reduce((sum, c) => sum + (c.activityCommission || 0), 0),

    transferCommissions: allCommissions
      .filter((c) => c.status !== "CANCELLED")
      .reduce((sum, c) => sum + (c.transferCommission || 0), 0),

    otherCommissions: allCommissions
      .filter((c) => c.status !== "CANCELLED")
      .reduce((sum, c) => sum + (c.otherCommission || 0), 0),

    // Average metrics
    averageCommission:
      allCommissions.filter((c) => c.status !== "CANCELLED").length > 0
        ? allCommissions
            .filter((c) => c.status !== "CANCELLED")
            .reduce((sum, c) => sum + c.agentEarnings, 0) /
          allCommissions.filter((c) => c.status !== "CANCELLED").length
        : 0,

    averageCommissionRate:
      allCommissions.filter((c) => c.status !== "CANCELLED").length > 0
        ? allCommissions
            .filter((c) => c.status !== "CANCELLED")
            .reduce((sum, c) => sum + (c.commissionRate || 0), 0) /
          allCommissions.filter((c) => c.status !== "CANCELLED").length
        : 0,

    // Upcoming releases
    upcomingReleases: allCommissions.filter((c) => {
      if (c.status !== "IN_HOLD_PERIOD" || !c.holdUntil) return false;
      const daysUntilRelease = Math.ceil(
        (c.holdUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilRelease <= 7 && daysUntilRelease >= 0;
    }).length,

    upcomingReleaseAmount: allCommissions
      .filter((c) => {
        if (c.status !== "IN_HOLD_PERIOD" || !c.holdUntil) return false;
        const daysUntilRelease = Math.ceil(
          (c.holdUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilRelease <= 7 && daysUntilRelease >= 0;
      })
      .reduce((sum, c) => sum + c.agentEarnings, 0),
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

      {/* Client Component with interactive features */}
      <CommissionsClient commissions={allCommissions} stats={stats} />
    </div>
  );
}
