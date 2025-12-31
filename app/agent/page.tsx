// app/agent/page.tsx
// Agent Dashboard - Main Landing Page
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAgentWithAdminFallback } from "@/lib/auth-helpers";
import DashboardStats from "@/components/agent/DashboardStats";
import RecentActivity from "@/components/agent/RecentActivity";
import QuickActions from "@/components/agent/QuickActions";
import UpcomingTrips from "@/components/agent/UpcomingTrips";
import CommissionOverview from "@/components/agent/CommissionOverview";

export const metadata = {
  title: "Dashboard - Agent Portal",
  description: "Travel agent dashboard with real-time statistics and insights",
};

export default async function AgentDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/agent");
  }

  // Get agent with admin fallback (auto-creates for super admins)
  const agent = await getAgentWithAdminFallback(session.user.id);

  if (!agent) {
    redirect("/agent/register");
  }

  // Fetch dashboard data - OPTIMIZED with proper limits
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    quotesCount,
    bookingsCount,
    clientsCount,
    recentQuotes,
    recentBookings,
    commissionStats,
    upcomingTrips,
    thisMonthQuotes,
    thisMonthBookings,
    thisMonthRevenue,
  ] = await Promise.all([
    // Total quotes
    prisma!.agentQuote.count({
      where: { agentId: agent.id },
    }),
    // Total bookings
    prisma!.agentBooking.count({
      where: { agentId: agent.id },
    }),
    // Total clients
    prisma!.agentClient.count({
      where: { agentId: agent.id },
    }),
    // Recent quotes
    prisma!.agentQuote.findMany({
      where: { agentId: agent.id },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Recent bookings
    prisma!.agentBooking.findMany({
      where: { agentId: agent.id },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Commission stats - OPTIMIZED: Use aggregates instead of fetching all records
    prisma!.agentCommission.groupBy({
      by: ['status'],
      where: { agentId: agent.id },
      _sum: {
        agentEarnings: true,
      },
    }),
    // Upcoming trips
    prisma!.agentBooking.findMany({
      where: {
        agentId: agent.id,
        startDate: {
          gte: new Date(),
        },
        status: {
          in: ["CONFIRMED", "PENDING"],
        },
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
      take: 5,
    }),
    // This month quotes - MOVED INTO Promise.all
    prisma!.agentQuote.count({
      where: {
        agentId: agent.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    }),
    // This month bookings - MOVED INTO Promise.all
    prisma!.agentBooking.count({
      where: {
        agentId: agent.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    }),
    // This month revenue - MOVED INTO Promise.all
    prisma!.agentBooking.aggregate({
      where: {
        agentId: agent.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  // Calculate commission breakdown from grouped data
  const availableAmount = commissionStats.find((c) => c.status === "AVAILABLE")?._sum.agentEarnings || 0;
  const paidAmount = commissionStats.find((c) => c.status === "PAID")?._sum.agentEarnings || 0;

  // Pending = sum of PENDING, CONFIRMED, TRIP_IN_PROGRESS, IN_HOLD_PERIOD statuses
  const pendingStatuses = ["PENDING", "CONFIRMED", "TRIP_IN_PROGRESS", "IN_HOLD_PERIOD"];
  const pendingAmount = commissionStats
    .filter((c) => pendingStatuses.includes(c.status))
    .reduce((sum, c) => sum + (c._sum.agentEarnings || 0), 0);

  // BULLETPROOF: JSON stringify/parse ensures all values are serializable
  const dashboardData = JSON.parse(JSON.stringify({
    overview: {
      totalQuotes: quotesCount,
      totalBookings: bookingsCount,
      totalClients: clientsCount,
      totalRevenue: agent.totalSales,
      thisMonth: {
        quotes: thisMonthQuotes,
        bookings: thisMonthBookings,
        revenue: thisMonthRevenue._sum.total || 0,
      },
    },
    commissions: {
      available: availableAmount,
      pending: pendingAmount,
      paid: paidAmount,
      total: agent.totalCommissions,
    },
    recentQuotes: recentQuotes,
    recentBookings: recentBookings,
    upcomingTrips: upcomingTrips,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {agent.agencyName || session.user.name || "Agent"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your travel business today.
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Overview */}
      <DashboardStats data={dashboardData.overview} />

      {/* Commission Overview */}
      <CommissionOverview data={dashboardData.commissions} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Trips */}
        <UpcomingTrips trips={dashboardData.upcomingTrips as any} />

        {/* Recent Activity */}
        <RecentActivity quotes={dashboardData.recentQuotes as any} bookings={dashboardData.recentBookings as any} />
      </div>
    </div>
  );
}
