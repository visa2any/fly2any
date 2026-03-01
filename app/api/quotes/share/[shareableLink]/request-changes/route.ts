// app/api/quotes/share/[shareableLink]/request-changes/route.ts
// Client requests modifications — public endpoint, no auth required
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resendClient } from "@/lib/email/resend-client";

export async function POST(
  request: NextRequest,
  { params }: { params: { shareableLink: string } }
) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json(
        { error: "Please describe what you'd like changed (at least 5 characters)" },
        { status: 400 }
      );
    }

    const quote = await prisma!.agentQuote.findUnique({
      where: { shareableLink: params.shareableLink },
      include: {
        client: true,
        agent: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (!["SENT", "VIEWED"].includes(quote.status)) {
      return NextResponse.json(
        { error: "This quote cannot be modified at this time" },
        { status: 409 }
      );
    }

    // Append the new request to any existing ones (with timestamp)
    const timestamp = new Date().toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
    const existing = (quote.modificationRequests || "").trim();
    const updated = existing
      ? `${existing}\n\n[${timestamp}] ${message.trim()}`
      : `[${timestamp}] ${message.trim()}`;

    await prisma!.agentQuote.update({
      where: { id: quote.id },
      data: { modificationRequests: updated },
    });

    // Notify agent via email
    const agentEmail = (quote.agent as any)?.user?.email;
    const agentName = (quote.agent as any)?.user?.name || "Agent";
    const clientName =
      quote.client
        ? `${quote.client.firstName} ${quote.client.lastName}`.trim()
        : "Your client";
    const quoteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.fly2any.com"}/agent/quotes/workspace?id=${quote.id}`;

    if (agentEmail) {
      await resendClient
        .send({
          to: agentEmail,
          subject: `${clientName} requested changes to "${quote.tripName}"`,
          html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#3A7BFF,#2563eb);padding:32px 40px">
      <p style="margin:0 0 6px;color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:1px;text-transform:uppercase">Change Request</p>
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">${quote.tripName}</h1>
    </div>
    <div style="padding:32px 40px">
      <p style="margin:0 0 16px;color:#374151;font-size:15px">Hi ${agentName},</p>
      <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6">
        <strong>${clientName}</strong> has requested changes to their travel quote:
      </p>
      <div style="background:#f0f6ff;border-left:4px solid #3A7BFF;border-radius:0 12px 12px 0;padding:16px 20px;margin:0 0 28px">
        <p style="margin:0;color:#1e3a8a;font-size:15px;line-height:1.6;white-space:pre-wrap">${message.trim()}</p>
      </div>
      <div style="text-align:center">
        <a href="${quoteUrl}" style="display:inline-block;background:linear-gradient(135deg,#3A7BFF,#2563eb);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700">
          Open Quote Workspace →
        </a>
      </div>
    </div>
    <div style="border-top:1px solid #f3f4f6;padding:20px 40px;background:#fafafa">
      <p style="margin:0;color:#6b7280;font-size:12px">Fly2Any Quote System · <a href="https://www.fly2any.com" style="color:#3A7BFF;text-decoration:none">fly2any.com</a></p>
    </div>
  </div>
</body>
</html>`,
          text: `${clientName} requested changes to "${quote.tripName}":\n\n${message.trim()}\n\nOpen the workspace: ${quoteUrl}`,
          tags: ["quote-change-request"],
        })
        .catch(() => {}); // Non-critical — don't fail the response if email errors
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[QUOTE_REQUEST_CHANGES_ERROR]", err);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
