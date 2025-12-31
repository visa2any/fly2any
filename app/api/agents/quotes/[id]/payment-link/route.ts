export const dynamic = 'force-dynamic';

// app/api/agents/quotes/[id]/payment-link/route.ts
// Generate payment link for a quote
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";

// POST /api/agents/quotes/[id]/payment-link - Generate payment link
export async function POST(
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

    const quote = await prisma!.agentQuote.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
        deletedAt: null,
      },
      include: {
        client: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Check quote status - must be SENT or VIEWED
    if (!["SENT", "VIEWED", "ACCEPTED"].includes(quote.status)) {
      return NextResponse.json(
        { error: "Quote must be sent to client before generating payment link" },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date(quote.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Quote has expired" },
        { status: 400 }
      );
    }

    // Generate unique payment link ID if not exists
    let paymentLinkId = quote.paymentLinkId;
    if (!paymentLinkId) {
      paymentLinkId = `pay_${nanoid(16)}`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
    const paymentLink = `${baseUrl}/pay/${paymentLinkId}`;

    // Update quote with payment link
    const updatedQuote = await prisma!.agentQuote.update({
      where: { id: quote.id },
      data: {
        paymentLinkId,
        paymentLink,
        paymentStatus: "UNPAID",
      },
      include: {
        client: true,
        agent: {
          select: {
            agencyName: true,
            businessName: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "payment_link_created",
        description: `Payment link created for quote ${quote.quoteNumber}`,
        entityType: "quote",
        entityId: quote.id,
        metadata: {
          quoteNumber: quote.quoteNumber,
          paymentLinkId,
          amount: quote.total,
          clientName: `${quote.client.firstName} ${quote.client.lastName}`,
        },
      },
    });

    return NextResponse.json({
      success: true,
      paymentLink,
      paymentLinkId,
      quote: updatedQuote,
    });
  } catch (error) {
    console.error("[PAYMENT_LINK_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to generate payment link" },
      { status: 500 }
    );
  }
}

// GET /api/agents/quotes/[id]/payment-link - Get payment link status
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

    const quote = await prisma!.agentQuote.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
        deletedAt: null,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({
      paymentLink: quote.paymentLink,
      paymentLinkId: quote.paymentLinkId,
      paymentStatus: quote.paymentStatus,
      paidAt: quote.paidAt,
      paidAmount: quote.paidAmount,
    });
  } catch (error) {
    console.error("[PAYMENT_LINK_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to get payment link" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/quotes/[id]/payment-link - Revoke payment link
export async function DELETE(
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

    const quote = await prisma!.agentQuote.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
        deletedAt: null,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Cannot revoke if already paid
    if (quote.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "Cannot revoke a paid payment link" },
        { status: 400 }
      );
    }

    await prisma!.agentQuote.update({
      where: { id: quote.id },
      data: {
        paymentLinkId: null,
        paymentLink: null,
        paymentStatus: "EXPIRED",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PAYMENT_LINK_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to revoke payment link" },
      { status: 500 }
    );
  }
}
