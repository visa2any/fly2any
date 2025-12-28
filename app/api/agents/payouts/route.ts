export const dynamic = 'force-dynamic';

// app/api/agents/payouts/route.ts
// List all payouts for the authenticated agent
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

const PayoutFilterSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["requestedAt", "paidAt", "amount"]).default("requestedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// GET /api/agents/payouts - List all payouts
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
    const filters = PayoutFilterSchema.parse(searchParams);

    // Build where clause
    const where: any = {
      agentId: agent.id,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    // Get total count
    const total = await prisma!.agentPayout.count({ where });

    // Get paginated payouts
    const payouts = await prisma!.agentPayout.findMany({
      where,
      include: {
        commissionsIncluded: {
          select: {
            id: true,
            agentEarnings: true,
            booking: {
              select: {
                confirmationNumber: true,
                tripName: true,
              },
            },
          },
        },
      },
      orderBy: {
        [filters.sortBy]: filters.sortOrder,
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Calculate stats
    const allPayouts = await prisma!.agentPayout.findMany({
      where: { agentId: agent.id },
    });

    const stats = {
      totalPayouts: allPayouts.length,
      totalPaid: allPayouts
        .filter(p => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.amount, 0),
      pending: allPayouts.filter(p => p.status === "PENDING").length,
      processing: allPayouts.filter(p => p.status === "PROCESSING").length,
      completed: allPayouts.filter(p => p.status === "COMPLETED").length,
      failed: allPayouts.filter(p => p.status === "FAILED").length,
      pendingAmount: allPayouts
        .filter(p => p.status === "PENDING" || p.status === "PROCESSING")
        .reduce((sum, p) => sum + p.amount, 0),
      averagePayoutAmount: allPayouts.length > 0
        ? allPayouts.reduce((sum, p) => sum + p.amount, 0) / allPayouts.length
        : 0,
      lastPayoutDate: allPayouts
        .filter(p => p.completedAt)
        .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0]?.completedAt,
    };

    return NextResponse.json({
      payouts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
      stats,
    });
  } catch (error) {
    console.error("[PAYOUTS_LIST_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}
