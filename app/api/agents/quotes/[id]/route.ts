// app/api/agents/quotes/[id]/route.ts
// Quote Detail, Update, Delete
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

// GET /api/agents/quotes/[id] - Get quote details
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
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error("[QUOTE_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/quotes/[id] - Update quote (only if DRAFT)
const UpdateQuoteSchema = z.object({
  tripName: z.string().optional(),
  destination: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  adults: z.number().min(1).optional(),
  children: z.number().optional(),
  infants: z.number().optional(),
  flights: z.array(z.any()).optional(),
  hotels: z.array(z.any()).optional(),
  activities: z.array(z.any()).optional(),
  transfers: z.array(z.any()).optional(),
  carRentals: z.array(z.any()).optional(),
  insurance: z.any().optional(),
  customItems: z.array(z.any()).optional(),
  agentMarkupPercent: z.number().min(0).max(100).optional(),
  discount: z.number().optional(),
  taxes: z.number().optional(),
  fees: z.number().optional(),
  showCommissionToClient: z.boolean().optional(),
  commissionLabel: z.string().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  importantInfo: z.string().optional(),
  customNotes: z.string().optional(),
  agentNotes: z.string().optional(),
});

export async function PATCH(
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

    const quote = await prisma!.agentQuote.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Only allow editing DRAFT quotes
    if (quote.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Can only edit draft quotes" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateQuoteSchema.parse(body);

    // Recalculate costs if components changed
    let updateData: any = { ...validatedData };

    if (validatedData.flights || validatedData.hotels || validatedData.activities ||
        validatedData.transfers || validatedData.carRentals || validatedData.insurance ||
        validatedData.customItems || validatedData.agentMarkupPercent || validatedData.discount) {

      const flights = validatedData.flights || quote.flights as any[];
      const hotels = validatedData.hotels || quote.hotels as any[];
      const activities = validatedData.activities || quote.activities as any[];
      const transfers = validatedData.transfers || quote.transfers as any[];
      const carRentals = validatedData.carRentals || quote.carRentals as any[];
      const insurance = validatedData.insurance || quote.insurance;
      const customItems = validatedData.customItems || quote.customItems as any[];

      const flightsCost = flights.reduce((sum: number, f: any) => sum + f.price, 0);
      const hotelsCost = hotels.reduce((sum: number, h: any) => sum + h.price, 0);
      const activitiesCost = activities.reduce((sum: number, a: any) => sum + a.price, 0);
      const transfersCost = transfers.reduce((sum: number, t: any) => sum + t.price, 0);
      const carRentalsCost = carRentals.reduce((sum: number, c: any) => sum + c.price, 0);
      const insuranceCost = insurance?.price || 0;
      const customItemsCost = customItems.reduce((sum: number, i: any) => sum + i.price, 0);

      const subtotal = flightsCost + hotelsCost + activitiesCost + transfersCost + carRentalsCost + insuranceCost + customItemsCost;
      const markupPercent = validatedData.agentMarkupPercent || quote.agentMarkupPercent || 15;
      const agentMarkup = subtotal * (markupPercent / 100);
      const taxes = validatedData.taxes || quote.taxes;
      const fees = validatedData.fees || quote.fees;
      const discount = validatedData.discount || quote.discount;
      const total = subtotal + agentMarkup + taxes + fees - discount;

      updateData = {
        ...updateData,
        flightsCost,
        hotelsCost,
        activitiesCost,
        transfersCost,
        carRentalsCost,
        insuranceCost,
        customItemsCost,
        subtotal,
        agentMarkup,
        total,
      };
    }

    // Parse dates
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate);
    }

    // Recalculate duration and travelers
    if (validatedData.startDate || validatedData.endDate) {
      const start = updateData.startDate || quote.startDate;
      const end = updateData.endDate || quote.endDate;
      updateData.duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    if (validatedData.adults !== undefined || validatedData.children !== undefined || validatedData.infants !== undefined) {
      const adults = validatedData.adults || quote.adults;
      const children = validatedData.children !== undefined ? validatedData.children : quote.children;
      const infants = validatedData.infants !== undefined ? validatedData.infants : quote.infants;
      updateData.travelers = adults + children + infants;
    }

    const updatedQuote = await prisma!.agentQuote.update({
      where: { id: params.id },
      data: updateData,
      include: { client: true },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "quote_updated",
        description: `Quote updated: ${updatedQuote.quoteNumber}`,
        entityType: "quote",
        entityId: updatedQuote.id,
      },
    });

    return NextResponse.json({ quote: updatedQuote });
  } catch (error) {
    console.error("[QUOTE_UPDATE_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/quotes/[id] - Delete quote
export async function DELETE(
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

    const quote = await prisma!.agentQuote.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Can't delete accepted quotes
    if (quote.status === "ACCEPTED" || quote.status === "CONVERTED") {
      return NextResponse.json(
        { error: "Cannot delete accepted or converted quotes" },
        { status: 400 }
      );
    }

    await prisma!.agentQuote.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        deletedAt: new Date(),
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "quote_deleted",
        description: `Quote deleted: ${quote.quoteNumber}`,
        entityType: "quote",
        entityId: quote.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[QUOTE_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
