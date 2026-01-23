export const dynamic = 'force-dynamic';

// app/api/agents/quotes/route.ts
// Quote Management - List and Create
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { calculateQuotePricing, validatePricing, type PricingContext } from "@/lib/pricing/QuotePricingService";

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
  type: z.literal('flight'),
  price: z.number(),
  priceType: z.enum(['total', 'per_person', 'per_night', 'per_unit']),
  priceAppliesTo: z.number(),
  currency: z.string().default('USD'),
  // Flight-specific fields
  airline: z.string(),
  flightNumber: z.string(),
  origin: z.string(),
  originCity: z.string(),
  destination: z.string(),
  destinationCity: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  duration: z.string(),
  stops: z.number(),
  cabinClass: z.string(),
  passengers: z.number(),
  date: z.string(),
  createdAt: z.string(),
});

const HotelItemSchema = z.object({
  type: z.literal('hotel'),
  price: z.number(),
  priceType: z.enum(['total', 'per_person', 'per_night', 'per_unit']),
  priceAppliesTo: z.number(),
  nights: z.number(),
  currency: z.string().default('USD'),
  // Hotel-specific fields
  name: z.string(),
  location: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  roomType: z.string(),
  stars: z.number(),
  amenities: z.array(z.string()),
  guests: z.number(),
  image: z.string().optional(),
  createdAt: z.string(),
});

const ActivityItemSchema = z.object({
  type: z.literal('activity'),
  price: z.number(),
  priceType: z.enum(['total', 'per_person', 'per_night', 'per_unit']),
  priceAppliesTo: z.number(),
  currency: z.string().default('USD'),
  // Activity-specific fields
  name: z.string(),
  location: z.string(),
  description: z.string(),
  duration: z.string(),
  time: z.string().optional(),
  participants: z.number(),
  includes: z.array(z.string()),
  image: z.string().optional(),
  date: z.string(),
  createdAt: z.string(),
});

const TransferItemSchema = z.object({
  type: z.literal('transfer'),
  price: z.number(),
  priceType: z.enum(['total', 'per_person', 'per_night', 'per_unit']),
  priceAppliesTo: z.number(),
  currency: z.string().default('USD'),
  // Transfer-specific fields
  provider: z.string(),
  vehicleType: z.string(),
  pickupLocation: z.string(),
  dropoffLocation: z.string(),
  pickupTime: z.string(),
  passengers: z.number(),
  meetAndGreet: z.boolean(),
  date: z.string(),
  createdAt: z.string(),
});

const CarItemSchema = z.object({
  type: z.literal('car'),
  price: z.number(),
  priceType: z.enum(['total', 'per_person', 'per_night', 'per_unit']),
  priceAppliesTo: z.number(),
  currency: z.string().default('USD'),
  // Car-specific fields
  company: z.string(),
  carType: z.string(),
  carClass: z.string(),
  pickupLocation: z.string(),
  dropoffLocation: z.string(),
  pickupDate: z.string(),
  dropoffDate: z.string(),
  days: z.number(),
  features: z.array(z.string()),
  image: z.string().optional(),
  createdAt: z.string(),
});

const CustomItemSchema = z.object({
  type: z.literal('custom'),
  price: z.number(),
  priceType: z.enum(['total', 'per_person', 'per_night', 'per_unit']),
  priceAppliesTo: z.number(),
  currency: z.string().default('USD'),
  // Custom-specific fields
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  quantity: z.number(),
  date: z.string().optional(),
  createdAt: z.string(),
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
  // Components - using unified item schema
  flights: z.array(FlightItemSchema).default([]),
  hotels: z.array(HotelItemSchema).default([]),
  activities: z.array(ActivityItemSchema).default([]),
  transfers: z.array(TransferItemSchema).default([]),
  carRentals: z.array(CarItemSchema).default([]),
  customItems: z.array(CustomItemSchema).default([]),
  // Pricing context
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

    // Calculate pricing using unified QuotePricingService
    const allItems = [...data.flights, ...data.hotels, ...data.activities, ...data.transfers, ...data.carRentals, ...data.customItems];
    
    const travelers = data.adults + data.children + data.infants;
    
    const pricingContext: PricingContext = {
      travelers,
      currency: 'USD',
      agentMarkupPercent: data.agentMarkupPercent,
      taxes: data.taxes,
      fees: data.fees,
      discount: data.discount,
    };

    // Calculate pricing with product markups
    const pricing = calculateQuotePricing(allItems, pricingContext);

    // Validate pricing before saving
    const validation = validatePricing(pricing, travelers);
    if (!validation.valid) {
      console.error("[PRICING_VALIDATION_ERROR]", validation.errors);
      return NextResponse.json(
        { error: "Pricing validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Calculate duration
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Set expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);

    // Create quote with computed pricing
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
        customItems: data.customItems as any,
        // Pricing from unified service
        basePrice: pricing.basePrice,
        productMarkup: pricing.productMarkup,
        flightsCost: data.flights.reduce((sum, f) => sum + f.price, 0),
        hotelsCost: data.hotels.reduce((sum, h) => sum + h.price, 0),
        activitiesCost: data.activities.reduce((sum, a) => sum + a.price, 0),
        transfersCost: data.transfers.reduce((sum, t) => sum + t.price, 0),
        carRentalsCost: data.carRentals.reduce((sum, c) => sum + c.price, 0),
        insuranceCost: 0,
        customItemsCost: data.customItems.reduce((sum, i) => sum + i.price, 0),
        subtotal: pricing.subtotal,
        agentMarkup: pricing.agentMarkup,
        agentMarkupPercent: pricing.agentMarkupPercent,
        taxes: pricing.taxes,
        fees: pricing.fees,
        discount: pricing.discount,
        total: pricing.total,
        currency: pricing.currency,
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
          basePrice: quote.basePrice,
          productMarkup: quote.productMarkup,
          agentMarkup: quote.agentMarkup,
        },
      },
    });

    return NextResponse.json({ quote }, { status: 201 });

  } catch (error) {
    console.error("[QUOTE_CREATE_ERROR]", error);

    // Check for specific error types
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));
      
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: fieldErrors,
          hint: "Check that all required fields are present and formatted correctly"
        },
        { status: 400 }
      );
    }

    // Check for Prisma database errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any };
      
      // Unique constraint violations
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { 
            error: "Duplicate record", 
            details: prismaError.meta?.target,
            hint: "A quote with this information already exists"
          },
          { status: 409 }
        );
      }
      
      // Foreign key constraint violations
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { 
            error: "Invalid reference", 
            details: prismaError.meta?.field_name,
            hint: "Check that client ID is valid"
          },
          { status: 400 }
        );
      }
    }

    // Check for known application errors
    if (error instanceof Error) {
      // Custom validation errors from QuoteSchemaMapper
      if (error.message.includes("Cannot save quote")) {
        return NextResponse.json(
          { 
            error: "Quote validation failed", 
            hint: error.message
          },
          { status: 400 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { 
        error: "Unable to save quote", 
        hint: "Please try again. If the problem persists, contact support.",
        supportEmail: "support@fly2any.com"
      },
      { status: 500 }
    );
  }
}
