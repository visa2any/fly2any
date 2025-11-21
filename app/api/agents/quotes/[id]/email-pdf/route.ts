// app/api/agents/quotes/[id]/email-pdf/route.ts
// Email Quote PDF to Client
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendQuotePDFEmail } from "@/lib/pdf/pdf-service";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// POST /api/agents/quotes/[id]/email-pdf - Email PDF to client
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

    // Verify quote exists and belongs to agent
    const quote = await prisma!.agentQuote.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
      include: {
        client: true,
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "Quote not found or access denied" },
        { status: 404 }
      );
    }

    // Create email service wrapper
    const emailService = {
      send: async (emailData: any) => {
        if (!resend) {
          throw new Error('Email service not configured');
        }

        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          attachments: emailData.attachments,
        });

        if (error) {
          throw new Error(error.message);
        }

        return data;
      },
    };

    // Send PDF via email
    await sendQuotePDFEmail({
      quoteId: params.id,
      agentId: agent.id,
      emailService,
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "quote_pdf_emailed",
        description: `PDF itinerary emailed to ${quote.client.firstName} ${quote.client.lastName}`,
        entityType: "quote",
        entityId: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Itinerary sent to ${quote.client.email}`,
    });
  } catch (error: any) {
    console.error("[EMAIL_PDF_ERROR]", error);

    if (error.message === "Quote not found or access denied") {
      return NextResponse.json(
        { error: "Quote not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to send PDF email" },
      { status: 500 }
    );
  }
}
