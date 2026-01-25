export const dynamic = 'force-dynamic';

// app/api/agents/quotes/[id]/route.ts
// Quote Detail, Update, Delete (HARDENED)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { 
  QuoteErrorFactory,
  createQuoteSuccess,
  type QuoteSuccessResponse,
} from "@/lib/errors/QuoteApiErrors";
import { 
  validateQuoteData,
  validateClientOwnership,
  validatePricingConsistency,
  validateQuoteItems,
  calculateQuotePricingSafe,
} from "@/lib/validation/quote-validator";
import { 
  updateQuoteWithOptimisticLock,
  validateQuoteState,
  getQuoteVersion,
} from "@/lib/database/concurrency";
import { QuoteOperationTracker } from "@/lib/logging/quote-observability";
import { generateCorrelationId } from "@/lib/errors/QuoteApiErrors";

// GET /api/agents/quotes/[id] - Get quote details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = generateCorrelationId();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      const error = QuoteErrorFactory.persistenceFailed(
        correlationId,
        { reason: 'Authentication required' }
      );
      return NextResponse.json(error, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      const error = QuoteErrorFactory.agentNotFound(correlationId);
      return NextResponse.json(error, { status: 404 });
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
      const error = QuoteErrorFactory.persistenceFailed(
        correlationId,
        {
          reason: 'Quote not found',
          quoteId: params.id,
        }
      );
      return NextResponse.json(error, { status: 404 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    const apiError = QuoteErrorFactory.internalError(correlationId, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(apiError, { status: 500 });
  }
}

// PATCH /api/agents/quotes/[id] - Update quote (HARDENED)
const UpdateQuoteSchema = z.object({
  version: z.number().int().positive(), // REQUIRED for optimistic locking
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
  // Initialize operation tracker for observability
  let tracker: QuoteOperationTracker | null = null;
  let correlationId = generateCorrelationId();
  let agentId: string | null = null;
  let quoteId = params.id;

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

    // Validate quote state for UPDATE operation
    await validateQuoteState(quoteId, 'UPDATE', agent.id);

    // Parse and validate request body
    const body = await request.json();
    const data = UpdateQuoteSchema.parse(body);

    // CRITICAL: Version is REQUIRED for optimistic locking
    const currentVersion = await getQuoteVersion(quoteId);
    if (!currentVersion) {
      const error = QuoteErrorFactory.persistenceFailed(
        correlationId,
        {
          reason: 'Quote not found',
          quoteId,
        }
      );
      return NextResponse.json(error, { status: 404 });
    }

    const expectedVersion = data.version || currentVersion;

    // Initialize operation tracker
    tracker = new QuoteOperationTracker(
      'UPDATE',
      agent.id,
      quoteId,
      {
        previousVersion: currentVersion,
        requestedVersion: expectedVersion,
        updateFields: Object.keys(data).filter(k => k !== 'version'),
      }
    );
    correlationId = tracker.getCorrelationId();

    // Validate quote data (if provided)
    if (data.tripName || data.destination || data.startDate || data.endDate ||
        data.adults !== undefined || data.children !== undefined || data.infants !== undefined) {
      const quoteData = {
        tripName: data.tripName,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        adults: data.adults,
        children: data.children,
        infants: data.infants,
      };
      await validateQuoteData(quoteData, 'UPDATE');
    }

    // Validate quote items (if provided)
    if (data.flights || data.hotels || data.activities ||
        data.transfers || data.carRentals || data.customItems) {
      const quoteItems = {
        flights: data.flights,
        hotels: data.hotels,
        activities: data.activities,
        transfers: data.transfers,
        carRentals: data.carRentals,
        customItems: data.customItems,
      };
      await validateQuoteItems(quoteItems);
    }

    // Recalculate pricing if needed
    let updateData: any = { ...data, version: undefined };

    if (data.flights || data.hotels || data.activities ||
        data.transfers || data.carRentals || data.insurance ||
        data.customItems || data.agentMarkupPercent !== undefined ||
        data.discount !== undefined) {
      
      // Get current quote for values not provided
      const currentQuote = await prisma!.agentQuote.findUnique({
        where: { id: quoteId },
      });

      if (!currentQuote) {
        const error = QuoteErrorFactory.persistenceFailed(
          correlationId,
          { reason: 'Quote not found during update', quoteId }
        );
        return NextResponse.json(error, { status: 404 });
      }

      const flights = data.flights || currentQuote.flights as any[];
      const hotels = data.hotels || currentQuote.hotels as any[];
      const activities = data.activities || currentQuote.activities as any[];
      const transfers = data.transfers || currentQuote.transfers as any[];
      const carRentals = data.carRentals || currentQuote.carRentals as any[];
      const insurance = data.insurance || currentQuote.insurance;
      const customItems = data.customItems || currentQuote.customItems as any[];

      const travelers = (data.adults !== undefined ? data.adults : currentQuote.adults) +
                       (data.children !== undefined ? data.children : currentQuote.children) +
                       (data.infants !== undefined ? data.infants : currentQuote.infants);

      // Calculate pricing
      const pricing = calculateQuotePricingSafe(
        { flights, hotels, activities, transfers, carRentals, customItems, insurance },
        travelers
      );

      // Validate pricing consistency
      await validatePricingConsistency(
        { flights, hotels, activities, transfers, carRentals, customItems, insurance },
        pricing,
        travelers
      );

      // Add pricing to update data
      updateData = {
        ...updateData,
        flightsCost: flights.reduce((sum: number, f: any) => sum + f.price, 0),
        hotelsCost: hotels.reduce((sum: number, h: any) => sum + h.price, 0),
        activitiesCost: activities.reduce((sum: number, a: any) => sum + a.price, 0),
        transfersCost: transfers.reduce((sum: number, t: any) => sum + t.price, 0),
        carRentalsCost: carRentals.reduce((sum: number, c: any) => sum + c.price, 0),
        insuranceCost: insurance?.price || 0,
        customItemsCost: customItems.reduce((sum: number, i: any) => sum + i.price, 0),
        subtotal: pricing.subtotal,
        agentMarkup: pricing.agentMarkup,
        total: pricing.total,
      };
    }

    // Parse dates
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    // Recalculate duration
    if (data.startDate || data.endDate) {
      const start = updateData.startDate;
      const end = updateData.endDate;
      updateData.duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Recalculate travelers
    if (data.adults !== undefined || data.children !== undefined || data.infants !== undefined) {
      const adults = data.adults || 0;
      const children = data.children !== undefined ? data.children : 0;
      const infants = data.infants !== undefined ? data.infants : 0;
      updateData.travelers = adults + children + infants;
    }

    // Update with optimistic locking (atomic)
    const result = await updateQuoteWithOptimisticLock(
      quoteId,
      expectedVersion,
      updateData,
      session.user.id
    );

    // Track success
    tracker.success(quoteId);

    // Return structured success response
    const response: QuoteSuccessResponse = createQuoteSuccess(
      result.id,
      result.version,
      result.updatedAt || new Date(),
      { quote: result }
    );
    
    return NextResponse.json(response, { status: 200 });

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

// DELETE /api/agents/quotes/[id] - Delete quote
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = generateCorrelationId();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      const error = QuoteErrorFactory.persistenceFailed(
        correlationId,
        { reason: 'Authentication required' }
      );
      return NextResponse.json(error, { status: 401 });
    }

    const agent = await prisma!.travelAgent.findUnique({
      where: { userId: session.user.id },
    });

    if (!agent) {
      const error = QuoteErrorFactory.agentNotFound(correlationId);
      return NextResponse.json(error, { status: 404 });
    }

    // Validate quote state for DELETE operation
    await validateQuoteState(params.id, 'DELETE', agent.id);

    const quote = await prisma!.agentQuote.findFirst({
      where: {
        id: params.id,
        agentId: agent.id,
      },
    });

    if (!quote) {
      const error = QuoteErrorFactory.persistenceFailed(
        correlationId,
        {
          reason: 'Quote not found',
          quoteId: params.id,
        }
      );
      return NextResponse.json(error, { status: 404 });
    }

    // Update as cancelled
    await prisma!.agentQuote.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED" as any,
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
        metadata: {
          correlationId,
          quoteNumber: quote.quoteNumber,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const apiError = QuoteErrorFactory.internalError(correlationId, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(apiError, { status: 500 });
  }
}