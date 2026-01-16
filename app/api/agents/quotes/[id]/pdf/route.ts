export const dynamic = 'force-dynamic';

// app/api/agents/quotes/[id]/pdf/route.ts
// Generate and Download Quote PDF
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuotePDF, streamPDF } from "@/lib/pdf/pdf-service";
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

// GET /api/agents/quotes/[id]/pdf - Download quote as PDF
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiError(request, async () => {
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
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH });
}
