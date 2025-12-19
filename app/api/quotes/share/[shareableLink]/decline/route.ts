// app/api/quotes/share/[shareableLink]/decline/route.ts
// Client Declines Quote - Public Endpoint
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { mailgunClient } from '@/lib/email/mailgun-client';



const DeclineSchema = z.object({
  reason: z.string().optional(),
});

// POST /api/quotes/share/[shareableLink]/decline - Decline quote
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

    // Check if quote can be declined
    if (quote.status === "ACCEPTED" || quote.status === "CONVERTED") {
      return NextResponse.json(
        { error: "Cannot decline an accepted quote. Please contact your agent." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reason } = DeclineSchema.parse(body);

    // Calculate time to decline
    let timeToDecline = null;
    if (quote.sentAt) {
      timeToDecline = Math.floor(
        (new Date().getTime() - quote.sentAt.getTime()) / (1000 * 60)
      ); // minutes
    }

    // Update quote status to DECLINED
    const updatedQuote = await prisma!.agentQuote.update({
      where: { id: quote.id },
      data: {
        status: "DECLINED",
        declinedAt: new Date(),
        declineReason: reason || null,
        timeToDecline,
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: quote.agentId,
        activityType: "quote_declined",
        description: `Quote declined by ${quote.client.firstName} ${quote.client.lastName}`,
        entityType: "quote",
        entityId: quote.id,
        metadata: {
          quoteNumber: quote.quoteNumber,
          reason: reason || "No reason provided",
          timeToDecline,
        },
      },
    });

    // Send notification email to agent
    try {
      await mailgunClient.send({
        to: quote.agent.user.email,
        subject: `Quote Declined: ${quote.quoteNumber}`,
        html: `
          <h2>Quote Declined</h2>
          <p><strong>${quote.client.firstName} ${quote.client.lastName}</strong> has declined your quote for <strong>${quote.destination}</strong>.</p>
          <p><strong>Quote Details:</strong></p>
          <ul>
            <li>Quote Number: ${quote.quoteNumber}</li>
            <li>Trip: ${quote.tripName}</li>
            <li>Total: $${quote.total.toLocaleString()}</li>
          </ul>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p><strong>Suggested Next Steps:</strong></p>
          <ul>
            <li>Reach out to understand their concerns</li>
            <li>Consider creating an alternative quote with different options</li>
            <li>Offer to adjust the itinerary or pricing</li>
          </ul>
          <p><a href="${process.env.NEXTAUTH_URL}/agent/quotes/${quote.id}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">View Quote</a></p>
        `,
      });
    } catch (emailError) {
      console.error("[EMAIL_SEND_ERROR]", emailError);
      // Continue anyway
    }

    return NextResponse.json({
      success: true,
      message: "Quote declined. Thank you for letting us know.",
    });
  } catch (error) {
    console.error("[QUOTE_DECLINE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to decline quote" },
      { status: 500 }
    );
  }
}
