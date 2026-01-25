export const dynamic = 'force-dynamic';

// app/api/agents/quotes/route.ts
// Quote Management - List and Create (HARDENED)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { calculateQuotePricing, validatePricing, type PricingContext } from "@/lib/pricing/QuotePricingService";
import { 
  QuoteErrorFactory,
  createQuoteSuccess,
  type QuoteApiError,
  type QuoteSuccessResponse,
} from "@/lib/errors/QuoteApiErrors";
import { 
  validateQuoteData,
  validateClientOwnership,
  validatePricingConsistency,
  validateQuoteItems,
  calculateQuotePricingSafe,
} from "@/lib/validation/quote-validator";
import { QuoteOperationTracker } from "@/lib/logging/quote-observability";
import { generateCorrelationId } from "@/lib/errors/QuoteApiErrors";
import { executeAtomicTransaction } from "@/lib/database/transaction";

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
      const error = QuoteErrorFactory.persistenceFailed(
        generateCorrelationId(),
        { reason: 'Authentication required' }
      );
      return NextResponse.json(error, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      const error = QuoteErrorFactory.agentNotFound(
        generateCorrelationId()
      );
      return NextResponse.json(error, { status: 404 });
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
    const correlationId = generateCorrelationId();
    const apiError = QuoteErrorFactory.internalError(correlationId, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(apiError, { status: 500 });
  }
}

// Schemas remain the same
const FlightItemSchema = z.object({
  type: z.literal('flight'),
  price: z.number(),
  priceType: z.enum(['total', 'per_person', 'per_night', 'per_unit']),
  priceAppliesTo: z.number(),
  currency: z.string().default('USD'),
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
  flights: z.array(FlightItemSchema).default([]),
  hotels: z.array(HotelItemSchema).default([]),
  activities: z.array(ActivityItemSchema).default([]),
  transfers: z.array(TransferItemSchema).default([]),
  carRentals: z.array(CarItemSchema).default([]),
  customItems: z.array(CustomItemSchema).default([]),
  agentMarkupPercent: z.number().min(0).max(100).default(15),
  discount: z.number().default(0),
  taxes: z.number().default(0),
  fees: z.number().default(0),
  showCommissionToClient: z.boolean().default(false),
  commissionLabel: z.string().optional(),
  expiresInDays: z.number().default(7),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  importantInfo: z.string().optional(),
  customNotes: z.string().optional(),
  agentNotes: z.string().optional(),
});

// POST /api/agents/quotes - Create new quote (HARDENED)
export async function POST(request: NextRequest) {
  // Initialize operation tracker for observability
  let tracker: QuoteOperationTracker | null = null;
  let correlationId = generateCorrelationId();
  let agentId: string | null = null;
  let clientId: string | null = null;

  try {
    // Authentication
    const session = await auth();
    if (!session?.user?.id) {
      const error = QuoteErrorFactory.persistenceFailed(
        correlationId,
        { reason: 'Authentication required' }
      );
      return NextResponse.json(error, { status: 401 });
    }

    // Get agent
    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      const error = QuoteErrorFactory.agentNotFound(correlationId);
      return NextResponse.json(error, { status: 404 });
    }

    agentId = agent.id;

    // Parse and validate request body
    const body = await request.json();
    const data = CreateQuoteSchema.parse(body);

    clientId = data.clientId;

    // Initialize operation tracker
    tracker = new QuoteOperationTracker(
      'CREATE',
      agent.id,
      data.clientId,
      { body: 'REDACTED' } // Don't log sensitive data
    );
    correlationId = tracker.getCorrelationId();

    // Validate quote data
    await validateQuoteData(data, 'CREATE');

    // Validate quote items
    await validateQuoteItems(data);

    // Validate client ownership
    await validateClientOwnership(data.clientId, agent.id);

    // Calculate pricing
    const pricing = calculateQuotePricingSafe(data, data.adults + data.children + data.infants);

    // Validate pricing consistency
    await validatePricingConsistency(data, pricing, data.adults + data.children + data.infants);

    // Execute atomic transaction
    const result = await executeAtomicTransaction(async (tx) => {
      // Type assertion for transaction client
      const txClient = tx as any;
      
      // Calculate duration
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // Set expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);

      // Create quote
      const quote = await txClient.agentQuote.create({
        data: {
          quoteNumber: generateQuoteNumber(),
          agentId: agent.id,
          clientId: data.clientId,
          tripName: data.tripName,
          destination: data.destination,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          duration,
          travelers: data.adults + data.children + data.infants,
          adults: data.adults,
          children: data.children,
          infants: data.infants,
          flights: data.flights as any,
          hotels: data.hotels as any,
          activities: data.activities as any,
          transfers: data.transfers as any,
          carRentals: data.carRentals as any,
          customItems: data.customItems as any,
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
          showCommissionToClient: data.showCommissionToClient,
          commissionLabel: data.commissionLabel,
          expiresAt,
          inclusions: data.inclusions,
          exclusions: data.exclusions,
          importantInfo: data.importantInfo,
          customNotes: data.customNotes,
          agentNotes: data.agentNotes,
          status: "DRAFT",
          version: 1,
          lastModifiedBy: session.user.id,
          lastModifiedAt: new Date(),
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
      await txClient.travelAgent.update({
        where: { id: agent.id },
        data: {
          quotesSent: { increment: 1 },
        },
      });

      // Log activity
      await txClient.agentActivityLog.create({
        data: {
          agentId: agent.id,
          activityType: "quote_created",
          description: `Quote created: ${quote.quoteNumber}`,
          entityType: "quote",
          entityId: quote.id,
          metadata: {
            correlationId,
            client: `${quote.client.firstName} ${quote.client.lastName}`,
            destination: quote.destination,
            total: quote.total,
            basePrice: quote.basePrice,
            productMarkup: quote.productMarkup,
            agentMarkup: quote.agentMarkup,
          },
        },
      });

      return quote;
    });

    // Track success
    tracker.success(result.id);

    // Return structured success response
    const response: QuoteSuccessResponse = createQuoteSuccess(
      result.id,
      result.version,
      result.createdAt,
      { quote: result }
    );
    
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    // Track failure if tracker exists
    if (tracker) {
      if (error instanceof Error && 'code' in error) {
        tracker.failure({
          code: (error as any).code,
          message: error.message,
          severity: 'HIGH',
          stack: error.stack,
        });
      } else {
        tracker.failure({
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'CRITICAL',
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const apiError = QuoteErrorFactory.validationFailed(
        'Quote data validation failed',
        correlationId,
        {
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          }))
        }
      );
      return NextResponse.json(apiError, { status: 400 });
    }

    // Handle QuoteApiError (already structured)
    if (error && typeof error === 'object' && 'errorCode' in error) {
      return NextResponse.json(error, { status: 500 });
    }

    // Handle unknown errors
    const apiError = QuoteErrorFactory.internalError(correlationId, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(apiError, { status: 500 });
  }
}