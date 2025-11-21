// app/api/agents/payouts/[id]/route.ts
// Get specific payout details
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";

// GET /api/agents/payouts/[id] - Get payout details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const payout = await prisma!.agentPayout.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
      include: {
        commissionsIncluded: {
          include: {
            booking: {
              select: {
                id: true,
                confirmationNumber: true,
                tripName: true,
                destination: true,
                startDate: true,
                endDate: true,
                total: true,
                client: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    // Calculate breakdown by product type
    const breakdown = {
      flightCommissions: payout.commissionsIncluded.reduce((sum: number, c: any) => sum + (c.flightCommission || 0), 0),
      hotelCommissions: payout.commissionsIncluded.reduce((sum: number, c: any) => sum + (c.hotelCommission || 0), 0),
      activityCommissions: payout.commissionsIncluded.reduce((sum: number, c: any) => sum + (c.activityCommission || 0), 0),
      transferCommissions: payout.commissionsIncluded.reduce((sum: number, c: any) => sum + (c.transferCommission || 0), 0),
      otherCommissions: payout.commissionsIncluded.reduce((sum: number, c: any) => sum + (c.otherCommission || 0), 0),
      totalCommissions: payout.commissionsIncluded.length,
      totalBookingValue: payout.commissionsIncluded.reduce((sum: number, c: any) => sum + c.bookingTotal, 0),
    };

    return NextResponse.json({
      payout,
      breakdown,
    });
  } catch (error) {
    console.error("[PAYOUT_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch payout" },
      { status: 500 }
    );
  }
}
