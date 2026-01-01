export const dynamic = 'force-dynamic';

// Send Quote via SMS/WhatsApp API
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const SendSmsSchema = z.object({
  channel: z.enum(["sms", "whatsapp"]),
  phoneNumber: z.string().min(10),
  message: z.string().optional(),
  includeLink: z.boolean().default(true),
});

// Twilio integration helper
async function sendTwilioMessage(
  to: string,
  body: string,
  channel: "sms" | "whatsapp"
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = channel === "whatsapp"
    ? `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`
    : process.env.TWILIO_SMS_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[TWILIO] Missing credentials - simulating send");
    return {
      success: true,
      messageId: `sim_${Date.now()}`,
    };
  }

  const toNumber = channel === "whatsapp" ? `whatsapp:${to}` : to;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: toNumber,
          From: fromNumber,
          Body: body,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Failed to send" };
    }

    return { success: true, messageId: data.sid };
  } catch (error) {
    console.error("[TWILIO_ERROR]", error);
    return { success: false, error: "Network error" };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check feature access
    const body = await request.json();
    const data = SendSmsSchema.parse(body);

    if (data.channel === "whatsapp" && !agent.hasWhatsappIntegration) {
      return NextResponse.json(
        { error: "WhatsApp integration not enabled for your account" },
        { status: 403 }
      );
    }

    if (data.channel === "sms" && !agent.hasSmsNotifications) {
      return NextResponse.json(
        { error: "SMS notifications not enabled for your account" },
        { status: 403 }
      );
    }

    // Get quote
    const quote = await prisma!.agentQuote.findFirst({
      where: { id, agentId: agent.id },
      include: { client: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Generate shareable link if not exists
    let shareableLink = quote.shareableLink;
    if (!shareableLink) {
      shareableLink = crypto.randomBytes(32).toString("hex");
      await prisma!.agentQuote.update({
        where: { id },
        data: { shareableLink },
      });
    }

    const quoteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/quotes/${shareableLink}`;
    const agentName = agent.firstName && agent.lastName
      ? `${agent.firstName} ${agent.lastName}`
      : agent.agencyName || "Your Travel Agent";

    // Build message
    const defaultMessage = data.channel === "whatsapp"
      ? `Hi ${quote.client.firstName}! Your travel quote for *${quote.tripName}* is ready. Total: *$${quote.total.toLocaleString()}*\n\nView details: ${quoteUrl}\n\n— ${agentName}`
      : `Hi ${quote.client.firstName}! Your quote for ${quote.tripName} ($${quote.total.toLocaleString()}) is ready. View: ${quoteUrl}`;

    const message = data.message
      ? (data.includeLink ? `${data.message}\n\n${quoteUrl}` : data.message)
      : defaultMessage;

    // Send message
    const result = await sendTwilioMessage(data.phoneNumber, message, data.channel);

    if (!result.success) {
      // Log failed attempt
      await prisma!.quoteMessage.create({
        data: {
          quoteId: id,
          channel: data.channel,
          recipient: data.phoneNumber,
          content: message,
          status: "failed",
          failedAt: new Date(),
          failReason: result.error,
        },
      });

      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Update quote counts
    const updateData = data.channel === "sms"
      ? { smsSentCount: { increment: 1 } }
      : { smsSentCount: { increment: 1 } }; // Track in same field for now

    if (quote.status === "DRAFT") {
      await prisma!.agentQuote.update({
        where: { id },
        data: {
          ...updateData,
          status: "SENT",
          sentAt: new Date(),
        },
      });
    } else {
      await prisma!.agentQuote.update({
        where: { id },
        data: updateData,
      });
    }

    // Log message
    await prisma!.quoteMessage.create({
      data: {
        quoteId: id,
        channel: data.channel,
        recipient: data.phoneNumber,
        content: message,
        status: "sent",
        sentAt: new Date(),
        externalId: result.messageId,
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: `quote_sent_${data.channel}`,
        description: `Quote sent via ${data.channel.toUpperCase()}: ${quote.quoteNumber}`,
        entityType: "quote",
        entityId: id,
        metadata: {
          recipient: data.phoneNumber,
          messageId: result.messageId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      channel: data.channel,
      shareableLink: quoteUrl,
    });

  } catch (error) {
    console.error("[QUOTE_SEND_SMS_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET - Get message history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const quote = await prisma!.agentQuote.findFirst({
      where: { id, agentId: agent.id },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const messages = await prisma!.quoteMessage.findMany({
      where: { quoteId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[QUOTE_MESSAGES_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
