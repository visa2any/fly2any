// app/api/agents/commissions/route.ts
// List and manage agent commissions
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

const CommissionFilterSchema = z.object({
  status: z.enum([
    "PENDING",
    "TRIP_IN_PROGRESS",
    "IN_HOLD_PERIOD",
    "AVAILABLE",
    "PAID",
    "CANCELLED",
    "REFUNDED"
  ]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["bookingDate", "tripStartDate", "agentEarnings", "status"]).default("bookingDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// GET /api/agents/commissions - List commissions with stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filters = CommissionFilterSchema.parse(searchParams);

    // Build where clause
    const where: any = {
      agentId: agent.id,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.bookingDate = {};
      if (filters.startDate) {
        where.bookingDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.bookingDate.lte = new Date(filters.endDate);
      }
    }

    // Get total count
    const total = await prisma!.agentCommission.count({ where });

    // Get paginated commissions
    const commissions = await prisma!.agentCommission.findMany({
      where,
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
          },
        },
        payout: {
          select: {
            id: true,
            status: true,
            completedAt: true,
          },
        },
      },
      orderBy: {
        [filters.sortBy]: filters.sortOrder,
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Calculate comprehensive stats
    const allCommissions = await prisma!.agentCommission.findMany({
      where: { agentId: agent.id },
    });

    const stats = {
      // Lifecycle breakdown
      pending: allCommissions.filter(c => c.status === "PENDING").length,
      tripInProgress: allCommissions.filter(c => c.status === "TRIP_IN_PROGRESS").length,
      inHoldPeriod: allCommissions.filter(c => c.status === "IN_HOLD_PERIOD").length,
      available: allCommissions.filter(c => c.status === "AVAILABLE").length,
      paid: allCommissions.filter(c => c.status === "PAID").length,
      cancelled: allCommissions.filter(c => c.status === "CANCELLED").length,
      refunded: allCommissions.filter(c => c.status === "REFUNDED").length,

      // Financial breakdown
      totalEarnings: allCommissions
        .filter(c => !["CANCELLED", "REFUNDED"].includes(c.status))
        .reduce((sum, c) => sum + c.agentEarnings, 0),

      pendingAmount: allCommissions
        .filter(c => ["PENDING", "TRIP_IN_PROGRESS", "IN_HOLD_PERIOD"].includes(c.status))
        .reduce((sum, c) => sum + c.agentEarnings, 0),

      availableAmount: allCommissions
        .filter(c => c.status === "AVAILABLE")
        .reduce((sum, c) => sum + c.agentEarnings, 0),

      paidAmount: allCommissions
        .filter(c => c.status === "PAID")
        .reduce((sum, c) => sum + c.agentEarnings, 0),

      // Platform fees paid
      totalPlatformFees: allCommissions
        .filter(c => c.status !== "CANCELLED")
        .reduce((sum, c) => sum + c.platformFee, 0),

      // Commission by product type
      flightCommissions: allCommissions
        .filter(c => c.status !== "CANCELLED")
        .reduce((sum, c) => sum + (c.flightCommission || 0), 0),

      hotelCommissions: allCommissions
        .filter(c => c.status !== "CANCELLED")
        .reduce((sum, c) => sum + (c.hotelCommission || 0), 0),

      activityCommissions: allCommissions
        .filter(c => c.status !== "CANCELLED")
        .reduce((sum, c) => sum + (c.activityCommission || 0), 0),

      transferCommissions: allCommissions
        .filter(c => c.status !== "CANCELLED")
        .reduce((sum, c) => sum + (c.transferCommission || 0), 0),

      otherCommissions: allCommissions
        .filter(c => c.status !== "CANCELLED")
        .reduce((sum, c) => sum + (c.otherCommission || 0), 0),

      // Average metrics
      averageCommission: allCommissions.filter(c => c.status !== "CANCELLED").length > 0
        ? allCommissions
            .filter(c => c.status !== "CANCELLED")
            .reduce((sum, c) => sum + c.agentEarnings, 0) /
          allCommissions.filter(c => c.status !== "CANCELLED").length
        : 0,

      averageCommissionRate: allCommissions.filter(c => c.status !== "CANCELLED").length > 0
        ? allCommissions
            .filter(c => c.status !== "CANCELLED")
            .reduce((sum, c) => sum + (c.commissionRate || 0), 0) /
          allCommissions.filter(c => c.status !== "CANCELLED").length
        : 0,

      // Upcoming releases (commissions exiting hold period soon)
      upcomingReleases: allCommissions.filter(c => {
        if (c.status !== "IN_HOLD_PERIOD" || !c.holdUntil) return false;
        const daysUntilRelease = Math.ceil(
          (c.holdUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilRelease <= 7 && daysUntilRelease >= 0;
      }).length,

      upcomingReleaseAmount: allCommissions
        .filter(c => {
          if (c.status !== "IN_HOLD_PERIOD" || !c.holdUntil) return false;
          const daysUntilRelease = Math.ceil(
            (c.holdUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysUntilRelease <= 7 && daysUntilRelease >= 0;
        })
        .reduce((sum, c) => sum + c.agentEarnings, 0),
    };

    return NextResponse.json({
      commissions,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
      stats,
    });
  } catch (error) {
    console.error("[COMMISSIONS_LIST_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch commissions" },
      { status: 500 }
    );
  }
}
