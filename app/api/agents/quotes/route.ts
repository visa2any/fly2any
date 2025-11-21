// app/api/agents/quotes/route.ts
// Quote Management - List and Create
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { z } from "zod";

// Generate quote number
function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `QT-${year}-${random}`;
}

// GET /api/agents/quotes - List quotes
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");

    const where: any = { agentId: agent.id };
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const [quotes, totalCount] = await Promise.all([
      prisma!.agentQuote.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma!.agentQuote.count({ where }),
    ]);

    return NextResponse.json({
      quotes,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error("[QUOTES_LIST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/agents/quotes - Create new quote
const FlightItemSchema = z.object({
  from: z.string(),
  to: z.string(),
  airline: z.string(),
  flight: z.string(),
  date: z.string(),
  time: z.string(),
  cabinClass: z.string(),
  price: z.number(),
  duration: z.string().optional(),
  stops: z.number().optional(),
});

const HotelItemSchema = z.object({
  name: z.string(),
  location: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  nights: z.number(),
  roomType: z.string(),
  price: z.number(),
  mealPlan: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

const CustomItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  price: z.number(),
  date: z.string().optional(),
});

const CreateQuoteSchema = z.object({
  clientId: z.string(),
  tripName: z.string(),
  destination: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  adults: z.number().min(1),
  children: z.number().default(0),
  infants: z.number().default(0),
  // Components
  flights: z.array(FlightItemSchema).default([]),
  hotels: z.array(HotelItemSchema).default([]),
  activities: z.array(CustomItemSchema).default([]),
  transfers: z.array(CustomItemSchema).default([]),
  carRentals: z.array(CustomItemSchema).default([]),
  insurance: z.object({
    provider: z.string(),
    plan: z.string(),
    coverage: z.string(),
    price: z.number(),
  }).optional(),
  customItems: z.array(CustomItemSchema).default([]),
  // Pricing
  agentMarkupPercent: z.number().min(0).max(100).default(15),
  discount: z.number().default(0),
  taxes: z.number().default(0),
  fees: z.number().default(0),
  // Settings
  showCommissionToClient: z.boolean().default(false),
  commissionLabel: z.string().optional(),
  expiresInDays: z.number().default(7),
  // Itinerary
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  importantInfo: z.string().optional(),
  customNotes: z.string().optional(),
  agentNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = CreateQuoteSchema.parse(body);

    // Verify client belongs to this agent
    const client = await prisma!.agentClient.findFirst({
      where: {
        id: data.clientId,
        agentId: agent.id,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Calculate costs
    const flightsCost = data.flights.reduce((sum, f) => sum + f.price, 0);
    const hotelsCost = data.hotels.reduce((sum, h) => sum + h.price, 0);
    const activitiesCost = data.activities.reduce((sum, a) => sum + a.price, 0);
    const transfersCost = data.transfers.reduce((sum, t) => sum + t.price, 0);
    const carRentalsCost = data.carRentals.reduce((sum, c) => sum + c.price, 0);
    const insuranceCost = data.insurance?.price || 0;
    const customItemsCost = data.customItems.reduce((sum, i) => sum + i.price, 0);

    const subtotal = flightsCost + hotelsCost + activitiesCost + transfersCost + carRentalsCost + insuranceCost + customItemsCost;
    const agentMarkup = subtotal * (data.agentMarkupPercent / 100);
    const total = subtotal + agentMarkup + data.taxes + data.fees - data.discount;

    // Calculate duration
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate travelers
    const travelers = data.adults + data.children + data.infants;

    // Set expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);

    // Create quote
    const quote = await prisma!.agentQuote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        agentId: agent.id,
        clientId: data.clientId,
        tripName: data.tripName,
        destination: data.destination,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        duration,
        travelers,
        adults: data.adults,
        children: data.children,
        infants: data.infants,
        // Components
        flights: data.flights as any,
        hotels: data.hotels as any,
        activities: data.activities as any,
        transfers: data.transfers as any,
        carRentals: data.carRentals as any,
        insurance: data.insurance as any,
        customItems: data.customItems as any,
        // Costs
        flightsCost,
        hotelsCost,
        activitiesCost,
        transfersCost,
        carRentalsCost,
        insuranceCost,
        customItemsCost,
        subtotal,
        agentMarkup,
        agentMarkupPercent: data.agentMarkupPercent,
        taxes: data.taxes,
        fees: data.fees,
        discount: data.discount,
        total,
        currency: "USD",
        // Settings
        showCommissionToClient: data.showCommissionToClient,
        commissionLabel: data.commissionLabel,
        expiresAt,
        // Itinerary
        inclusions: data.inclusions,
        exclusions: data.exclusions,
        importantInfo: data.importantInfo,
        customNotes: data.customNotes,
        agentNotes: data.agentNotes,
        // Status
        status: "DRAFT",
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update agent stats
    await prisma!.travelAgent.update({
      where: { id: agent.id },
      data: {
        quotesSent: { increment: 1 },
      },
    });

    // Log activity
    await prisma!.agentActivityLog.create({
      data: {
        agentId: agent.id,
        activityType: "quote_created",
        description: `Quote created: ${quote.quoteNumber}`,
        entityType: "quote",
        entityId: quote.id,
        metadata: {
          client: `${client.firstName} ${client.lastName}`,
          destination: quote.destination,
          total: quote.total,
        },
      },
    });

    return NextResponse.json({ quote }, { status: 201 });

  } catch (error) {
    console.error("[QUOTE_CREATE_ERROR]", error);

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
