import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { resendClient } from "@/lib/email/resend-client";

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
    const quoteUrl = `${baseUrl}/client/quotes/${viewToken}`;

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

async function sendEmail(params: {
  to: string;
  subject: string;
  message: string;
  quoteUrl: string;
  quote: any;
}) {
  const agentName = params.quote.agent?.user?.name || params.quote.agent?.businessName || "Your Travel Agent";
  const destination = params.quote.destination || "your destination";
  const clientFirst = params.quote.client?.firstName || "";
  const total = params.quote.total ? `$${Number(params.quote.total).toLocaleString()}` : "";
  const expiresAt = params.quote.expiresAt
    ? new Date(params.quote.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const messageHtml = params.message
    .split("\n")
    .map((line: string) => `<p style="margin:0 0 12px">${line || "&nbsp;"}</p>`)
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#E74035,#c0392b);padding:36px 40px 32px">
      <p style="margin:0 0 8px;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:1px;text-transform:uppercase">Travel Quote</p>
      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;line-height:1.2">${params.quote.tripName || `Trip to ${destination}`}</h1>
      ${total ? `<p style="margin:12px 0 0;color:rgba(255,255,255,0.9);font-size:18px;font-weight:600">${total} total</p>` : ""}
    </div>
    <!-- Body -->
    <div style="padding:36px 40px">
      ${clientFirst ? `<p style="margin:0 0 20px;color:#374151;font-size:16px">Hi ${clientFirst},</p>` : ""}
      <div style="color:#4b5563;font-size:15px;line-height:1.7">${messageHtml}</div>
      <!-- CTA -->
      <div style="margin:32px 0;text-align:center">
        <a href="${params.quoteUrl}" style="display:inline-block;background:linear-gradient(135deg,#E74035,#c0392b);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;letter-spacing:0.3px">
          View Your Quote →
        </a>
      </div>
      ${expiresAt ? `<p style="text-align:center;color:#9ca3af;font-size:13px">This quote expires on ${expiresAt}</p>` : ""}
    </div>
    <!-- Footer -->
    <div style="border-top:1px solid #f3f4f6;padding:24px 40px;background:#fafafa">
      <p style="margin:0;color:#6b7280;font-size:13px">Sent by <strong>${agentName}</strong> via <a href="https://www.fly2any.com" style="color:#E74035;text-decoration:none">Fly2Any</a></p>
      <p style="margin:8px 0 0;color:#9ca3af;font-size:12px">Questions? Reply to this email or contact your agent directly.</p>
    </div>
  </div>
</body>
</html>`;

  const result = await resendClient.send({
    to: params.to,
    subject: params.subject,
    html,
    text: `${params.message}\n\nView your quote: ${params.quoteUrl}`,
    replyTo: params.quote.agent?.user?.email,
    tags: ["quote-send"],
  });

  if (!result.success) {
    throw new Error(result.error || "Email delivery failed");
  }
  return result;
}

async function sendWhatsApp(params: { phone: string; message: string; quoteUrl: string }) {
  // US market: WhatsApp not used. SMS is the channel. Return URL for client-side handling.
  return { success: true, whatsappUrl: `https://wa.me/${params.phone}?text=${encodeURIComponent(`${params.message}\n\n${params.quoteUrl}`)}` };
}
