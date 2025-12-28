export const dynamic = 'force-dynamic';

// app/api/agents/bookings/route.ts
// List all bookings for the authenticated agent
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

const BookingFilterSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "DEPOSIT_PAID", "PARTIALLY_PAID", "PAID", "REFUNDED"]).optional(),
  clientId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "startDate", "total", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// GET /api/agents/bookings - List all bookings with filters
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
    const filters = BookingFilterSchema.parse(searchParams);

    // Build where clause
    const where: any = {
      agentId: agent.id,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) {
        where.startDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startDate.lte = new Date(filters.endDate);
      }
    }

    // Get total count
    const total = await prisma!.agentBooking.count({ where });

    // Get paginated bookings
    const bookings = await prisma!.agentBooking.findMany({
      where,
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
      orderBy: {
        [filters.sortBy]: filters.sortOrder,
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Calculate summary stats for current filters
    const stats = await prisma!.agentBooking.aggregate({
      where,
      _sum: {
        total: true,
        depositAmount: true,
        balanceDue: true,
      },
      _count: true,
    });

    return NextResponse.json({
      bookings,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
      stats: {
        totalBookings: stats._count,
        totalRevenue: stats._sum.total || 0,
        totalDeposits: stats._sum.depositAmount || 0,
        totalBalance: stats._sum.balanceDue || 0,
      },
    });
  } catch (error) {
    console.error("[BOOKINGS_LIST_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
