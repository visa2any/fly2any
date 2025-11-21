// app/api/quotes/share/[shareableLink]/route.ts
// Public Quote View (Client-Facing) - No Authentication Required
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/quotes/share/[shareableLink] - View quote publicly
export async function GET(
  request: NextRequest,
  { params }: { params: { shareableLink: string } }
) {
  try {
    const quote = await prisma!.agentQuote.findUnique({
      where: { shareableLink: params.shareableLink },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        agent: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Check if quote has expired
    if (new Date() > quote.expiresAt) {
      return NextResponse.json(
        {
          error: "Quote has expired",
          expiredAt: quote.expiresAt,
        },
        { status: 410 } // Gone
      );
    }

    // Update view count and last viewed timestamp
    await prisma!.agentQuote.update({
      where: { id: quote.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
        // Update status to VIEWED if it was SENT
        status: quote.status === "SENT" ? "VIEWED" : quote.status,
        // Track first view time
        viewedAt: quote.viewedAt || new Date(),
      },
    });

    // Calculate time to view (if first view)
    if (!quote.viewedAt && quote.sentAt) {
      const timeToView = Math.floor(
        (new Date().getTime() - quote.sentAt.getTime()) / (1000 * 60)
      ); // minutes

      await prisma!.agentQuote.update({
        where: { id: quote.id },
        data: { timeToView },
      });
    }

    // Don't send internal notes to client
    const {
      agentNotes,
      internalNotes,
      agentMarkup,
      agentMarkupPercent,
      ...publicQuote
    } = quote as any;

    return NextResponse.json({ quote: publicQuote });
  } catch (error) {
    console.error("[QUOTE_VIEW_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load quote" },
      { status: 500 }
    );
  }
}
