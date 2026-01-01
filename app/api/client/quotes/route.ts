export const dynamic = 'force-dynamic';

// Client Quotes API - List quotes for authenticated client
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Find client record linked to this user
    const client = await prisma!.agentClient.findFirst({
      where: { userId: session.user.id },
    });

    if (!client) {
      // Try to find by email
      const clientByEmail = await prisma!.agentClient.findFirst({
        where: { email: session.user.email! },
      });

      if (!clientByEmail) {
        return NextResponse.json({ quotes: [] });
      }
    }

    const clientId = client?.id;
    const clientEmail = session.user.email!;

    // Fetch quotes for this client
    const quotes = await prisma!.agentQuote.findMany({
      where: {
        OR: [
          { clientId },
          { client: { email: clientEmail } },
        ],
        status: { not: "DRAFT" }, // Only show sent quotes
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        agent: {
          select: {
            firstName: true,
            lastName: true,
            agencyName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      quotes: quotes.map((q) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        tripName: q.tripName,
        destination: q.destination,
        startDate: q.startDate,
        endDate: q.endDate,
        duration: q.duration,
        travelers: q.travelers,
        total: q.total,
        currency: q.currency,
        status: q.status,
        expiresAt: q.expiresAt,
        shareableLink: q.shareableLink,
        viewCount: q.viewCount,
        createdAt: q.createdAt,
        agent: q.agent,
      })),
    });

  } catch (error) {
    console.error("[CLIENT_QUOTES_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
