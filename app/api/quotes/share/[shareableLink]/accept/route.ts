// app/api/quotes/share/[shareableLink]/accept/route.ts
// Client Accepts Quote - Public Endpoint
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/quotes/share/[shareableLink]/accept - Accept quote
export async function POST(
  request: NextRequest,
  { params }: { params: { shareableLink: string } }
) {
  try {
    const quote = await prisma!.agentQuote.findUnique({
      where: { shareableLink: params.shareableLink },
      include: {
        client: true,
        agent: {
          include: {
            user: true,
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
        { error: "Quote has expired" },
        { status: 410 }
      );
    }

    // Check if quote can be accepted
    if (quote.status === "ACCEPTED" || quote.status === "CONVERTED") {
      return NextResponse.json(
        { error: "Quote has already been accepted" },
        { status: 400 }
      );
    }

    if (quote.status === "EXPIRED" || quote.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Quote is no longer valid" },
        { status: 400 }
      );
    }

    // Calculate time to accept
    let timeToAccept = null;
    if (quote.sentAt) {
      timeToAccept = Math.floor(
        (new Date().getTime() - quote.sentAt.getTime()) / (1000 * 60)
      ); // minutes
    }

    // Update quote status to ACCEPTED
    const updatedQuote = await prisma!.agentQuote.update({
      where: { id: quote.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        timeToAccept,
      },
    });

    // Update agent stats
    await prisma!.travelAgent.update({
      where: { id: quote.agentId },
      data: {
        quotesAccepted: { increment: 1 },
      },
    });

    // Update client's last booking date prediction
    await prisma!.agentClient.update({
      where: { id: quote.clientId },
      data: {
        nextBookingDate: quote.startDate,
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: quote.agentId,
        activityType: "quote_accepted",
        description: `Quote accepted by ${quote.client.firstName} ${quote.client.lastName}`,
        entityType: "quote",
        entityId: quote.id,
        metadata: {
          quoteNumber: quote.quoteNumber,
          total: quote.total,
          timeToAccept,
        },
      },
    });

    // Send notification email to agent
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "noreply@fly2any.com",
        to: quote.agent.user.email,
        subject: `🎉 Quote Accepted: ${quote.quoteNumber}`,
        html: `
          <h2>Great News! Your quote has been accepted!</h2>
          <p><strong>${quote.client.firstName} ${quote.client.lastName}</strong> has accepted your quote for <strong>${quote.destination}</strong>.</p>
          <p><strong>Quote Details:</strong></p>
          <ul>
            <li>Quote Number: ${quote.quoteNumber}</li>
            <li>Trip: ${quote.tripName}</li>
            <li>Total: $${quote.total.toLocaleString()}</li>
            <li>Travel Dates: ${new Date(quote.startDate).toLocaleDateString()} - ${new Date(quote.endDate).toLocaleDateString()}</li>
          </ul>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Convert the quote to a booking</li>
            <li>Process the deposit payment</li>
            <li>Confirm all reservations with suppliers</li>
            <li>Send confirmation documents to the client</li>
          </ol>
          <p><a href="${process.env.NEXTAUTH_URL}/agent/quotes/${quote.id}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">View Quote</a></p>
        `,
      });
    } catch (emailError) {
      console.error("[EMAIL_SEND_ERROR]", emailError);
      // Continue anyway
    }

    return NextResponse.json({
      success: true,
      message: "Quote accepted successfully!",
      quote: {
        id: updatedQuote.id,
        quoteNumber: updatedQuote.quoteNumber,
        status: updatedQuote.status,
      },
    });
  } catch (error) {
    console.error("[QUOTE_ACCEPT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to accept quote" },
      { status: 500 }
    );
  }
}
