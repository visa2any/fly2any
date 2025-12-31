// app/agent/page.tsx
// Agent Dashboard - Level 6 Ultra-Premium / Apple-Class
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

  const agent = await getAgentWithAdminFallback(session.user.id);

  if (!agent) {
    redirect("/agent/register");
  }

  // Fetch dashboard data
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
    prisma!.agentQuote.count({ where: { agentId: agent.id } }),
    prisma!.agentBooking.count({ where: { agentId: agent.id } }),
    prisma!.agentClient.count({ where: { agentId: agent.id } }),
    prisma!.agentQuote.findMany({
      where: { agentId: agent.id },
      include: { client: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma!.agentBooking.findMany({
      where: { agentId: agent.id },
      include: { client: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma!.agentCommission.groupBy({
      by: ['status'],
      where: { agentId: agent.id },
      _sum: { agentEarnings: true },
    }),
    prisma!.agentBooking.findMany({
      where: {
        agentId: agent.id,
        startDate: { gte: new Date() },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      include: { client: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { startDate: "asc" },
      take: 5,
    }),
    prisma!.agentQuote.count({
      where: { agentId: agent.id, createdAt: { gte: startOfMonth } },
    }),
    prisma!.agentBooking.count({
      where: { agentId: agent.id, createdAt: { gte: startOfMonth } },
    }),
    prisma!.agentBooking.aggregate({
      where: { agentId: agent.id, createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
  ]);

  const availableAmount = commissionStats.find((c) => c.status === "AVAILABLE")?._sum.agentEarnings || 0;
  const paidAmount = commissionStats.find((c) => c.status === "PAID")?._sum.agentEarnings || 0;
  const pendingStatuses = ["PENDING", "CONFIRMED", "TRIP_IN_PROGRESS", "IN_HOLD_PERIOD"];
  const pendingAmount = commissionStats
    .filter((c) => pendingStatuses.includes(c.status))
    .reduce((sum, c) => sum + (c._sum.agentEarnings || 0), 0);

  // BULLETPROOF SERIALIZATION - ALL data must go through JSON.parse/stringify
  const agentName = String(agent.agencyName || session.user.name || "Agent");

  const dashboardData = JSON.parse(JSON.stringify({
    overview: {
      totalQuotes: quotesCount,
      totalBookings: bookingsCount,
      totalClients: clientsCount,
      totalRevenue: Number(agent.totalSales) || 0,
      thisMonth: {
        quotes: thisMonthQuotes,
        bookings: thisMonthBookings,
        revenue: Number(thisMonthRevenue._sum.total) || 0,
      },
    },
    commissions: {
      available: Number(availableAmount) || 0,
      pending: Number(pendingAmount) || 0,
      paid: Number(paidAmount) || 0,
      total: Number(agent.totalCommissions) || 0,
    },
    recentQuotes,
    recentBookings,
    upcomingTrips,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {agentName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your travel business today.
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
        <UpcomingTrips trips={dashboardData.upcomingTrips} />
        <RecentActivity quotes={dashboardData.recentQuotes} bookings={dashboardData.recentBookings} />
      </div>
    </div>
  );
}
