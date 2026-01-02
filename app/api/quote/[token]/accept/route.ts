// POST /api/quote/[token]/accept - Client accepts quote
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const quote = await prisma?.agentQuote.findFirst({
      where: { viewToken: token },
      include: {
        agent: { include: { user: { select: { email: true, name: true } } } },
        client: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Check expiration
    if (quote.expiresAt && new Date(quote.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Quote expired" }, { status: 410 });
    }

    // Check if already accepted/declined
    if (quote.status === "ACCEPTED") {
      return NextResponse.json({ message: "Already accepted" });
    }
    if (quote.status === "DECLINED") {
      return NextResponse.json({ error: "Quote was declined" }, { status: 400 });
    }

    // Update quote status
    await prisma?.agentQuote.update({
      where: { id: quote.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        metadata: {
          ...(quote.metadata as object || {}),
          acceptedVia: "client_portal",
        },
      },
    });

    // TODO: Send notification to agent (email/webhook)
    // await sendAgentNotification(quote.agent, quote);

    return NextResponse.json({
      success: true,
      message: "Quote accepted successfully",
    });
  } catch (error) {
    console.error("Accept quote error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
