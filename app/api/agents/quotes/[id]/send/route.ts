// app/api/agents/quotes/[id]/send/route.ts
// Send Quote to Client via Email
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Generate shareable link token
function generateShareableToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// POST /api/agents/quotes/[id]/send - Send quote to client
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
      include: { user: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const quote = await prisma!.agentQuote.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
      include: { client: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Can only send DRAFT quotes
    if (quote.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Quote has already been sent" },
        { status: 400 }
      );
    }

    // Generate shareable link if doesn't exist
    let shareableLink = quote.shareableLink;
    if (!shareableLink) {
      shareableLink = generateShareableToken();
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const quoteUrl = `${baseUrl}/client/quotes/${shareableLink}`;

    // Update quote status and shareable link
    const updatedQuote = await prisma!.agentQuote.update({
      where: { id: params.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        shareableLink,
        emailSentCount: { increment: 1 },
      },
    });

    // Prepare email content
    const emailSubject = `Your ${quote.destination} Trip Quote from ${agent.agencyName || agent.user.name}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #E5E7EB;
      border-top: none;
    }
    .trip-summary {
      background: #F3F4F6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .price {
      font-size: 32px;
      font-weight: bold;
      color: #3B82F6;
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      background: #3B82F6;
      color: white;
      padding: 14px 28px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin: 10px 5px;
    }
    .button-secondary {
      background: white;
      color: #3B82F6;
      border: 2px solid #3B82F6;
    }
    .expiry {
      background: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6B7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✈️ Your Custom ${quote.destination} Itinerary</h1>
    <p>${quote.tripName}</p>
  </div>

  <div class="content">
    <p>Hi ${quote.client.firstName},</p>

    <p>I've created a personalized travel itinerary for your upcoming trip to <strong>${quote.destination}</strong>. This is a custom package designed specifically for you based on our conversation.</p>

    <div class="trip-summary">
      <h3>✨ Trip Highlights</h3>
      <ul>
        <li><strong>Destination:</strong> ${quote.destination}</li>
        <li><strong>Dates:</strong> ${new Date(quote.startDate).toLocaleDateString()} - ${new Date(quote.endDate).toLocaleDateString()} (${quote.duration} ${quote.duration === 1 ? 'day' : 'days'})</li>
        <li><strong>Travelers:</strong> ${quote.travelers} ${quote.travelers === 1 ? 'person' : 'people'} (${quote.adults} ${quote.adults === 1 ? 'adult' : 'adults'}${quote.children > 0 ? `, ${quote.children} ${quote.children === 1 ? 'child' : 'children'}` : ''})</li>
        ${(quote.flights as any[]).length > 0 ? `<li><strong>Flights:</strong> Included (${(quote.flights as any[]).length} ${(quote.flights as any[]).length === 1 ? 'flight' : 'flights'})</li>` : ''}
        ${(quote.hotels as any[]).length > 0 ? `<li><strong>Accommodation:</strong> ${(quote.hotels as any[]).length} ${(quote.hotels as any[]).length === 1 ? 'night' : 'nights'}</li>` : ''}
        ${(quote.activities as any[]).length > 0 ? `<li><strong>Activities:</strong> ${(quote.activities as any[]).length} experiences included</li>` : ''}
      </ul>

      <div class="price">
        $${quote.total.toLocaleString()}
      </div>
      <p style="margin: 0; color: #6B7280;">Total for all travelers</p>
    </div>

    <div class="expiry">
      ⏰ <strong>This quote is valid until ${new Date(quote.expiresAt).toLocaleDateString()}</strong><br/>
      <small>Price and availability are guaranteed until this date</small>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${quoteUrl}" class="button">View Full Itinerary</a>
      <a href="${quoteUrl}?action=accept" class="button button-secondary">Accept & Book</a>
    </div>

    <p><strong>What's included:</strong></p>
    <ul>
      ${quote.inclusions.map(inc => `<li>${inc}</li>`).join('')}
    </ul>

    <p>If you have any questions or would like to make changes to this itinerary, just reply to this email or give me a call.</p>

    <p>Looking forward to helping you plan an amazing trip!</p>

    <p>
      Best regards,<br/>
      <strong>${agent.user.name}</strong><br/>
      ${agent.agencyName || ''}<br/>
      ${agent.phoneNumber || ''}<br/>
      ${agent.user.email}
    </p>
  </div>

  <div class="footer">
    <p>This quote was sent to you by ${agent.agencyName || agent.user.name}</p>
    <p>Quote Number: ${quote.quoteNumber}</p>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    try {
      if (resend) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "noreply@fly2any.com",
          to: quote.client.email,
          subject: emailSubject,
          html: emailHtml,
        });
      } else {
        console.warn('[EMAIL_SKIPPED] RESEND_API_KEY not configured');
      }
    } catch (emailError) {
      console.error("[EMAIL_SEND_ERROR]", emailError);
      // Continue anyway - quote is still marked as sent
    }

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "quote_sent",
        description: `Quote sent to ${quote.client.firstName} ${quote.client.lastName}`,
        entityType: "quote",
        entityId: quote.id,
        metadata: {
          quoteNumber: quote.quoteNumber,
          client: quote.client.email,
          total: quote.total,
        },
      },
    });

    return NextResponse.json({
      success: true,
      quote: updatedQuote,
      quoteUrl,
    });
  } catch (error) {
    console.error("[QUOTE_SEND_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to send quote" },
      { status: 500 }
    );
  }
}
