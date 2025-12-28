export const dynamic = 'force-dynamic';

// app/api/agents/quotes/[id]/pdf/route.ts
// Generate and Download Quote PDF
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuotePDF, streamPDF } from "@/lib/pdf/pdf-service";

// GET /api/agents/quotes/[id]/pdf - Download quote as PDF
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

    // Generate PDF
    const pdfResult = await generateQuotePDF({
      quoteId: params.id,
      agentId: agent.id,
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "quote_pdf_generated",
        description: `PDF generated for quote ${params.id}`,
        entityType: "quote",
        entityId: params.id,
      },
    });

    // Stream PDF as download
    return streamPDF(pdfResult.buffer, pdfResult.filename);
  } catch (error: any) {
    console.error("[QUOTE_PDF_ERROR]", error);

    if (error.message === "Quote not found or access denied") {
      return NextResponse.json(
        { error: "Quote not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
