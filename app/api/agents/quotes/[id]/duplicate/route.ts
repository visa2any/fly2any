export const dynamic = 'force-dynamic';

// Duplicate Quote API
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `QT-${year}-${random}`;
}

const DuplicateSchema = z.object({
  clientId: z.string().optional(), // Optionally assign to different client
  tripName: z.string().optional(), // Optionally rename
  adjustDates: z.boolean().default(false), // Shift dates to today
  createAsAlternative: z.boolean().default(false), // Link as alternative version
});

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

    // Get original quote
    const original = await prisma!.agentQuote.findFirst({
      where: { id, agentId: agent.id },
      include: { client: true },
    });

    if (!original) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const body = await request.json();
    const options = DuplicateSchema.parse(body);

    // Validate new client if provided
    let targetClientId = original.clientId;
    if (options.clientId) {
      const client = await prisma!.agentClient.findFirst({
        where: { id: options.clientId, agentId: agent.id },
      });
      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }
      targetClientId = options.clientId;
    }

    // Calculate date shift if needed
    let startDate = original.startDate;
    let endDate = original.endDate;
    let expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    if (options.adjustDates) {
      const originalDuration = original.duration;
      startDate = new Date();
      startDate.setDate(startDate.getDate() + 30); // Default 30 days from now
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + originalDuration);
    }

    // Create duplicate
    const newQuote = await prisma!.agentQuote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        agentId: agent.id,
        clientId: targetClientId,
        tripName: options.tripName || `${original.tripName} (Copy)`,
        destination: original.destination,
        startDate,
        endDate,
        duration: original.duration,
        travelers: original.travelers,
        adults: original.adults,
        children: original.children,
        infants: original.infants,
        // Copy all products
        flights: original.flights as any,
        hotels: original.hotels as any,
        activities: original.activities as any,
        transfers: original.transfers as any,
        carRentals: original.carRentals as any,
        insurance: original.insurance as any,
        customItems: original.customItems as any,
        // Copy costs
        flightsCost: original.flightsCost,
        hotelsCost: original.hotelsCost,
        activitiesCost: original.activitiesCost,
        transfersCost: original.transfersCost,
        carRentalsCost: original.carRentalsCost,
        insuranceCost: original.insuranceCost,
        customItemsCost: original.customItemsCost,
        subtotal: original.subtotal,
        agentMarkup: original.agentMarkup,
        agentMarkupPercent: original.agentMarkupPercent,
        taxes: original.taxes,
        fees: original.fees,
        discount: original.discount,
        total: original.total,
        currency: original.currency,
        // Settings
        showCommissionToClient: original.showCommissionToClient,
        commissionLabel: original.commissionLabel,
        hideMarkupBreakdown: original.hideMarkupBreakdown,
        // Content
        itineraryTemplate: original.itineraryTemplate,
        itineraryContent: original.itineraryContent as any,
        customNotes: original.customNotes,
        inclusions: original.inclusions,
        exclusions: original.exclusions,
        importantInfo: original.importantInfo,
        termsAndConditions: original.termsAndConditions,
        // Version linking
        version: options.createAsAlternative ? 1 : 1,
        parentQuoteId: options.createAsAlternative ? original.id : null,
        isAlternative: options.createAsAlternative,
        // New status
        status: "DRAFT",
        expiresAt,
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "quote_duplicated",
        description: `Quote duplicated: ${original.quoteNumber} → ${newQuote.quoteNumber}`,
        entityType: "quote",
        entityId: newQuote.id,
        metadata: {
          originalQuoteId: original.id,
          originalQuoteNumber: original.quoteNumber,
          isAlternative: options.createAsAlternative,
        },
      },
    });

    return NextResponse.json({
      quote: newQuote,
      message: options.createAsAlternative
        ? "Alternative quote created"
        : "Quote duplicated successfully",
    }, { status: 201 });

  } catch (error) {
    console.error("[QUOTE_DUPLICATE_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
