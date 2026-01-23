import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for send request
const SendRequestSchema = z.object({
  channel: z.enum(["email", "whatsapp", "link"]),
  to: z.string().email().optional(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validated = SendRequestSchema.parse(body);

    // Fetch quote with client and agent info
    const quote = await prisma?.agentQuote.findUnique({
      where: { id },
      include: {
        agent: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        client: true,
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      );
    }

    // Validate channel-specific requirements
    if (validated.channel === "email" && !validated.to) {
      return NextResponse.json(
        { error: "Email address required for email channel" },
        { status: 400 }
      );
    }

    if (validated.channel === "email" && !validated.subject) {
      return NextResponse.json(
        { error: "Subject line required for email" },
        { status: 400 }
      );
    }

    // Generate public quote URL (use shareableLink or generate token)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com";
    const viewToken = quote.shareableLink || `qt-${quote.id}`;
    const quoteUrl = `${baseUrl}/quote/${viewToken}`;

    // Idempotency check: Was this quote sent recently? (within 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const wasRecentlySent = quote.sentAt && new Date(quote.sentAt) > fiveMinutesAgo;

    // Track quote send (update sent tracking fields)
    // If recently sent, preserve sentAt and don't increment counters to avoid corruption
    await prisma?.agentQuote.update({
      where: { id },
      data: {
        sentAt: wasRecentlySent ? quote.sentAt : new Date(), // Preserve original send time
        status: "SENT" as any,
        emailSentCount: validated.channel === "email" && !wasRecentlySent ? { increment: 1 } : undefined,
        smsSentCount: validated.channel === "whatsapp" && !wasRecentlySent ? { increment: 1 } : undefined,
        sharedWithClient: true,
        updatedAt: new Date(),
      },
    });

    // Send based on channel
    switch (validated.channel) {
      case "email":
        await sendEmail({
          to: validated.to!,
          subject: validated.subject!,
          message: validated.message,
          quoteUrl,
          quote,
        });
        break;

      case "whatsapp":
        await sendWhatsApp({
          phone: quote.client?.phone || "",
          message: validated.message,
          quoteUrl,
        });
        break;

      case "link":
        // Link is copied client-side, just track the action
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Quote sent via ${validated.channel}`,
      sentTo: validated.to || quote.client?.email || "client",
      sentAt: new Date(),
    });

  } catch (error) {
    console.error("[QUOTE_SEND_ERROR]", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        {
          error: "Validation failed",
          details: fieldErrors,
        },
        { status: 400 }
      );
    }

    // Handle database errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string };

      if (prismaError.code === "P2025") {
        return NextResponse.json(
          { error: "Quote not found" },
          { status: 404 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Failed to send quote",
        hint: "Please try again. If the problem persists, contact support.",
        supportEmail: "support@fly2any.com",
      },
      { status: 500 }
    );
  }
}

// Email sending function (placeholder - integrate with AWS SES or similar)
async function sendEmail(params: {
  to: string;
  subject: string;
  message: string;
  quoteUrl: string;
  quote: any;
}) {
  // TODO: Integrate with AWS SES or email service
  console.log("[SEND_EMAIL]", {
    to: params.to,
    subject: params.subject,
    message: params.message,
    quoteUrl: params.quoteUrl,
  });

  // Example AWS SES integration:
  // const ses = new AWS.SES({ region: 'us-east-1' });
  // await ses.sendEmail({
  //   Source: 'quotes@fly2any.com',
  //   Destination: { ToAddresses: [params.to] },
  //   Message: {
  //     Subject: { Data: params.subject },
  //     Body: { Text: { Data: params.message } },
  //   },
  // });

  // For now, simulate success
  return { success: true };
}

// WhatsApp sending function (placeholder - integrate with WhatsApp Business API)
async function sendWhatsApp(params: {
  phone: string;
  message: string;
  quoteUrl: string;
}) {
  // TODO: Integrate with WhatsApp Business API
  console.log("[SEND_WHATSAPP]", {
    phone: params.phone,
    message: params.message,
    quoteUrl: params.quoteUrl,
  });

  // Example WhatsApp API integration:
  // const response = await fetch('https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     messaging_product: 'whatsapp',
  //     to: params.phone,
  //     type: 'text',
  //     text: { body: params.message },
  //   }),
  // });

  // For now, return success (client handles opening WhatsApp)
  return { success: true, whatsappUrl: `https://wa.me/${params.phone}?text=${encodeURIComponent(params.message)}` };
}
