// app/agency/page.tsx
// Agency Dashboard - Level 6 Ultra-Premium
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AgencyDashboardContent from "@/components/agency/AgencyDashboardContent";

export const metadata = {
  title: "Agency Dashboard - Fly2Any",
  description: "Manage your travel agency team and performance",
};

export default async function AgencyDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const agent = await prisma!.travelAgent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent || (agent.tier !== "AGENCY" && !agent.hasTeamManagement)) {
    redirect("/agent");
  }

  // Get agency stats
  const [teamCount, totalQuotes, totalBookings, totalRevenue, recentTeamActivity] = await Promise.all([
    // Team members
    prisma!.agentTeamMember.count({ where: { agencyId: agent.id, active: true } }),
    // All quotes from agency
    prisma!.agentQuote.count({
      where: {
        OR: [
          { agentId: agent.id },
          { agent: { memberOf: { some: { agencyId: agent.id, active: true } } } },
        ],
      },
    }),
    // All bookings from agency
    prisma!.agentBooking.count({
      where: {
        OR: [
          { agentId: agent.id },
          { agent: { memberOf: { some: { agencyId: agent.id, active: true } } } },
        ],
      },
    }),
    // Total revenue
    prisma!.agentBooking.aggregate({
      where: {
        OR: [
          { agentId: agent.id },
          { agent: { memberOf: { some: { agencyId: agent.id, active: true } } } },
        ],
      },
      _sum: { total: true },
    }),
    // Recent team bookings
    prisma!.agentBooking.findMany({
      where: {
        OR: [
          { agentId: agent.id },
          { agent: { memberOf: { some: { agencyId: agent.id, active: true } } } },
        ],
      },
      include: {
        agent: { select: { firstName: true, lastName: true } },
        client: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const dashboardData = {
    teamCount,
    totalQuotes,
    totalBookings,
    totalRevenue: totalRevenue._sum.total || 0,
    recentActivity: recentTeamActivity,
  };

  return <AgencyDashboardContent data={dashboardData} />;
}
