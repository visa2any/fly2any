// app/agency/analytics/page.tsx
// Analytics Dashboard Page - Level 6 Ultra-Premium
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AnalyticsDashboardContent from "@/components/agency/AnalyticsDashboardContent";

export const metadata = {
  title: "Analytics - Agency Portal",
  description: "Track your agency performance and metrics",
};

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent || (agent.tier !== "AGENCY" && !agent.hasTeamManagement)) {
    redirect("/agent");
  }

  // Get team members with their stats
  const teamMembers = await prisma!.agentTeamMember.findMany({
    where: { agencyId: agent.id, active: true },
    include: {
      agent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          totalSales: true,
          totalCommissions: true,
          quotesSent: true,
          quotesAccepted: true,
          conversionRate: true,
          avgDealSize: true,
          bookingsThisMonth: true,
          revenueThisMonth: true,
          user: { select: { image: true } },
        },
      },
    },
  });

  // Get agency-level metrics
  const agencyTotals = teamMembers.reduce(
    (acc, m) => ({
      totalSales: acc.totalSales + m.agent.totalSales,
      totalCommissions: acc.totalCommissions + m.agent.totalCommissions,
      quotesSent: acc.quotesSent + m.agent.quotesSent,
      quotesAccepted: acc.quotesAccepted + m.agent.quotesAccepted,
      monthlyBookings: acc.monthlyBookings + m.agent.bookingsThisMonth,
      monthlyRevenue: acc.monthlyRevenue + m.agent.revenueThisMonth,
    }),
    {
      totalSales: 0,
      totalCommissions: 0,
      quotesSent: 0,
      quotesAccepted: 0,
      monthlyBookings: 0,
      monthlyRevenue: 0,
    }
  );

  // Get recent bookings for the agency
  const recentBookings = await prisma!.agentBooking.findMany({
    where: {
      agent: {
        OR: [
          { id: agent.id },
          { id: { in: teamMembers.map((m) => m.agent.id) } },
        ],
      },
    },
    include: {
      agent: {
        select: { firstName: true, lastName: true },
      },
      client: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Get quotes summary
  const quotesStats = await prisma!.agentQuote.groupBy({
    by: ['status'],
    where: {
      agent: {
        OR: [
          { id: agent.id },
          { id: { in: teamMembers.map((m) => m.agent.id) } },
        ],
      },
    },
    _count: true,
  });

  const quotesByStatus = quotesStats.reduce(
    (acc, s) => ({ ...acc, [s.status]: s._count }),
    {} as Record<string, number>
  );

  return (
    <AnalyticsDashboardContent
      teamMembers={teamMembers}
      agencyTotals={agencyTotals}
      recentBookings={recentBookings}
      quotesByStatus={quotesByStatus}
    />
  );
}
