export const dynamic = 'force-dynamic';

/**
 * Admin API — Agent Quote Bookings
 * GET /api/admin/agent-bookings
 *
 * Lists all AgentBooking records for admin manual processing.
 * These are bookings created from agent quotes that need Fly2Any
 * to confirm reservations and issue tickets/vouchers.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/middleware";

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma!.agentBooking.findMany({
        where,
        include: {
          client: {
            select: { firstName: true, lastName: true, email: true, phone: true },
          },
          agent: {
            select: {
              id: true, firstName: true, lastName: true, email: true,
              agencyName: true, businessName: true, phone: true,
            },
          },
          quote: {
            select: { id: true, quoteNumber: true, shareableLink: true },
          },
          commissions: {
            select: { id: true, agentEarnings: true, platformFee: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma!.agentBooking.count({ where }),
    ]);

    // Stats
    const [pending, confirmed, completed, cancelled, totalRevenue] = await Promise.all([
      prisma!.agentBooking.count({ where: { status: "PENDING" } }),
      prisma!.agentBooking.count({ where: { status: "CONFIRMED" } }),
      prisma!.agentBooking.count({ where: { status: "COMPLETED" } }),
      prisma!.agentBooking.count({ where: { status: "CANCELLED" } }),
      prisma!.agentBooking.aggregate({ _sum: { total: true } }),
    ]);

    return NextResponse.json({
      success: true,
      bookings: bookings.map(b => ({
        ...b,
        // Parse passenger data from notes if available
        passengerData: (() => {
          try {
            if (b.notes) {
              const parsed = JSON.parse(b.notes);
              if (parsed.passengers) return parsed;
            }
          } catch { /* plain text notes */ }
          return null;
        })(),
      })),
      stats: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        revenue: totalRevenue._sum.total || 0,
      },
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error("[ADMIN_AGENT_BOOKINGS_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch agent bookings" }, { status: 500 });
  }
}
