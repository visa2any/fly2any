// app/api/agents/me/dashboard/route.ts
// Agent Dashboard Statistics
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      );
    }

    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Fetch all stats in parallel
    const [
      // Quote stats
      quotesThisMonth,
      quotesAcceptedThisMonth,
      quotesExpiringSoon,
      quotesPending,

      // Booking stats
      bookingsThisMonth,
      bookingsLastMonth,
      upcomingTrips,
      activeBookings,

      // Client stats
      totalClients,
      vipClients,
      recentClients,

      // Commission stats
      commissionsThisMonth,
      commissionsAvailable,
      commissionsPending,
      totalEarnings,

      // Top performing data
      topDestinations,
    ] = await Promise.all([
      // Quotes
      prisma!.agentQuote.count({
        where: {
          agentId: agent.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma!.agentQuote.count({
        where: {
          agentId: agent.id,
          status: "ACCEPTED",
          acceptedAt: { gte: startOfMonth },
        },
      }),
      prisma!.agentQuote.findMany({
        where: {
          agentId: agent.id,
          status: "SENT",
          expiresAt: {
            gte: now,
            lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Next 3 days
          },
        },
        take: 5,
        orderBy: { expiresAt: "asc" },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma!.agentQuote.count({
        where: {
          agentId: agent.id,
          status: { in: ["SENT", "VIEWED", "MODIFIED"] },
        },
      }),

      // Bookings
      prisma!.agentBooking.count({
        where: {
          agentId: agent.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma!.agentBooking.count({
        where: {
          agentId: agent.id,
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      prisma!.agentBooking.findMany({
        where: {
          agentId: agent.id,
          status: { in: ["CONFIRMED", "FULLY_PAID"] },
          startDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
          },
        },
        take: 5,
        orderBy: { startDate: "asc" },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma!.agentBooking.count({
        where: {
          agentId: agent.id,
          status: { in: ["CONFIRMED", "FULLY_PAID", "PARTIALLY_PAID", "IN_PROGRESS"] },
        },
      }),

      // Clients
      prisma!.agentClient.count({
        where: { agentId: agent.id, status: "ACTIVE" },
      }),
      prisma!.agentClient.count({
        where: {
          agentId: agent.id,
          status: "ACTIVE",
          isVip: true,
        },
      }),
      prisma!.agentClient.findMany({
        where: {
          agentId: agent.id,
          createdAt: { gte: startOfMonth },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      }),

      // Commissions
      prisma!.agentCommission.aggregate({
        where: {
          agentId: agent.id,
          createdAt: { gte: startOfMonth },
        },
        _sum: {
          agentEarnings: true,
        },
        _count: true,
      }),
      prisma!.agentCommission.aggregate({
        where: {
          agentId: agent.id,
          status: "AVAILABLE",
        },
        _sum: {
          agentEarnings: true,
        },
      }),
      prisma!.agentCommission.aggregate({
        where: {
          agentId: agent.id,
          status: { in: ["PENDING", "TRIP_IN_PROGRESS", "IN_HOLD_PERIOD"] },
        },
        _sum: {
          agentEarnings: true,
        },
      }),
      prisma!.agentCommission.aggregate({
        where: {
          agentId: agent.id,
          status: "PAID",
        },
        _sum: {
          agentEarnings: true,
        },
      }),

      // Top destinations (group by destination field in bookings)
      prisma!.agentBooking.groupBy({
        by: ["destination"],
        where: {
          agentId: agent.id,
          createdAt: { gte: startOfYear },
        },
        _count: { destination: true },
        _sum: { total: true },
        orderBy: {
          _count: { destination: "desc" },
        },
        take: 5,
      }),
    ]);

    // Calculate metrics
    const conversionRate = quotesThisMonth > 0
      ? (quotesAcceptedThisMonth / quotesThisMonth) * 100
      : 0;

    const bookingsGrowth = bookingsLastMonth > 0
      ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
      : bookingsThisMonth > 0 ? 100 : 0;

    const dashboardData = {
      // Overview metrics
      overview: {
        tier: agent.tier,
        status: agent.status,
        totalSales: agent.totalSales,
        totalCommissions: agent.totalCommissions,
        currentBalance: agent.currentBalance,
        pendingBalance: agent.pendingBalance,
        lifetimeEarnings: agent.lifetimeEarnings,
        lifetimePaid: agent.lifetimePaid,
      },

      // This month stats
      thisMonth: {
        quotes: {
          sent: quotesThisMonth,
          accepted: quotesAcceptedThisMonth,
          pending: quotesPending,
          conversionRate: conversionRate.toFixed(1),
        },
        bookings: {
          total: bookingsThisMonth,
          active: activeBookings,
          growth: bookingsGrowth.toFixed(1),
        },
        revenue: agent.revenueThisMonth,
        commissions: {
          earned: commissionsThisMonth._sum.agentEarnings || 0,
          count: commissionsThisMonth._count,
        },
      },

      // Financial summary
      financial: {
        available: commissionsAvailable._sum.agentEarnings || 0,
        pending: commissionsPending._sum.agentEarnings || 0,
        lifetimeEarnings: totalEarnings._sum.agentEarnings || 0,
        minPayoutThreshold: agent.minPayoutThreshold,
        payoutMethod: agent.payoutMethod,
        canRequestPayout: (commissionsAvailable._sum.agentEarnings || 0) >= agent.minPayoutThreshold,
      },

      // Clients
      clients: {
        total: totalClients,
        vip: vipClients,
        recent: recentClients,
      },

      // Upcoming & Action Items
      actionItems: {
        quotesExpiringSoon: quotesExpiringSoon.map(q => ({
          id: q.id,
          quoteNumber: q.quoteNumber,
          client: `${q.client.firstName} ${q.client.lastName}`,
          destination: q.destination,
          total: q.total,
          expiresAt: q.expiresAt,
        })),
        upcomingTrips: upcomingTrips.map(b => ({
          id: b.id,
          confirmationNumber: b.confirmationNumber,
          client: `${b.client.firstName} ${b.client.lastName}`,
          tripName: b.tripName,
          destination: b.destination,
          startDate: b.startDate,
          travelers: b.travelers,
        })),
      },

      // Performance insights
      insights: {
        topDestinations: topDestinations.map(d => ({
          destination: d.destination,
          bookings: d._count.destination,
          revenue: d._sum.total || 0,
        })),
        avgDealSize: agent.avgDealSize,
        clientSatisfaction: agent.clientSatisfaction,
        responseTime: agent.responseTime,
      },

      // Tier benefits
      tierBenefits: {
        current: agent.tier,
        platformFeePercent: agent.defaultCommission * 100,
        features: {
          hasClientPortal: agent.hasClientPortal,
          hasTeamManagement: agent.hasTeamManagement,
          hasAdvancedAnalytics: agent.hasAdvancedAnalytics,
          hasWhiteLabel: agent.hasWhiteLabel,
          hasApiAccess: agent.hasApiAccess,
          hasPrioritySupport: agent.hasPrioritySupport,
        },
        limits: {
          maxClients: agent.maxClients,
          maxActiveQuotes: agent.maxActiveQuotes,
          maxTeamMembers: agent.maxTeamMembers,
        },
      },
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error("[AGENT_DASHBOARD_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
