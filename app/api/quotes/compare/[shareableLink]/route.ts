export const dynamic = 'force-dynamic';

// Public Quote Comparison View API
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareableLink: string }> }
) {
  try {
    const { shareableLink } = await params;

    const comparison = await prisma!.quoteComparison.findFirst({
      where: { shareableLink, isActive: true },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            agencyName: true,
            email: true,
            phone: true,
            logo: true,
            brandColor: true,
          },
        },
      },
    });

    if (!comparison) {
      return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
    }

    // Check expiration
    if (comparison.expiresAt && new Date() > comparison.expiresAt) {
      return NextResponse.json({ error: "This comparison has expired" }, { status: 410 });
    }

    // Fetch all quotes
    const quotes = await prisma!.agentQuote.findMany({
      where: { id: { in: comparison.quoteIds } },
      select: {
        id: true,
        quoteNumber: true,
        tripName: true,
        destination: true,
        startDate: true,
        endDate: true,
        duration: true,
        travelers: true,
        adults: true,
        children: true,
        infants: true,
        flights: true,
        hotels: true,
        activities: true,
        transfers: true,
        carRentals: true,
        insurance: true,
        customItems: true,
        subtotal: true,
        taxes: true,
        fees: true,
        discount: true,
        total: true,
        currency: true,
        inclusions: true,
        exclusions: true,
        importantInfo: true,
        expiresAt: true,
        status: true,
        shareableLink: true,
      },
    });

    // Update view count
    await prisma!.quoteComparison.update({
      where: { id: comparison.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    return NextResponse.json({
      comparison: {
        id: comparison.id,
        name: comparison.name,
        description: comparison.description,
        expiresAt: comparison.expiresAt,
      },
      client: comparison.client,
      agent: comparison.agent,
      quotes,
    });

  } catch (error) {
    console.error("[COMPARISON_VIEW_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
