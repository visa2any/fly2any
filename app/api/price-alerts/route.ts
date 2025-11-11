import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for price alert
const PriceAlertSchema = z.object({
  origin: z.string().min(3).max(3),
  destination: z.string().min(3).max(3),
  departDate: z.string(),
  returnDate: z.string().optional(),
  currentPrice: z.number().positive(),
  targetPrice: z.number().positive(),
  currency: z.string().default('USD'),
});

/**
 * GET /api/price-alerts
 * Get all price alerts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const priceAlerts = await prisma.priceAlert.findMany({
      where: {
        userId: session.user.id,
        ...(activeOnly ? { active: true } : {}),
      },
      orderBy: [
        { triggered: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ alerts: priceAlerts });
  } catch (error) {
    console.error('[Price Alerts] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price alerts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/price-alerts
 * Create a new price alert
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const body = await request.json();

    // Validate request body
    const validatedData = PriceAlertSchema.parse(body);

    // Validate that target price is less than current price
    if (validatedData.targetPrice >= validatedData.currentPrice) {
      return NextResponse.json(
        { error: 'Target price must be less than current price' },
        { status: 400 }
      );
    }

    // Check if user already has an active alert for this route
    const existingAlert = await prisma.priceAlert.findFirst({
      where: {
        userId: session.user.id,
        origin: validatedData.origin,
        destination: validatedData.destination,
        departDate: validatedData.departDate,
        returnDate: validatedData.returnDate || null,
        active: true,
      },
    });

    if (existingAlert) {
      // Update existing alert
      const updated = await prisma.priceAlert.update({
        where: { id: existingAlert.id },
        data: {
          currentPrice: validatedData.currentPrice,
          targetPrice: validatedData.targetPrice,
          currency: validatedData.currency,
          triggered: false, // Reset triggered status
          triggeredAt: null,
        },
      });

      return NextResponse.json({ alert: updated, updated: true });
    }

    // Create new price alert
    const priceAlert = await prisma.priceAlert.create({
      data: {
        userId: session.user.id,
        ...validatedData,
      },
    });

    return NextResponse.json({ alert: priceAlert, created: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.format() },
        { status: 400 }
      );
    }

    console.error('[Price Alerts] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create price alert' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/price-alerts?id=[alertId]
 * Delete a price alert
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const alert = await prisma.priceAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      return NextResponse.json(
        { error: 'Price alert not found' },
        { status: 404 }
      );
    }

    if (alert.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete the alert
    await prisma.priceAlert.delete({
      where: { id: alertId },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('[Price Alerts] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete price alert' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/price-alerts?id=[alertId]
 * Update a price alert (toggle active status or update price)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Verify ownership
    const alert = await prisma.priceAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      return NextResponse.json(
        { error: 'Price alert not found' },
        { status: 404 }
      );
    }

    if (alert.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update the alert
    const updateData: any = {};

    if (body.active !== undefined) {
      updateData.active = body.active;
    }

    if (body.currentPrice !== undefined) {
      updateData.currentPrice = body.currentPrice;
      updateData.lastChecked = new Date();
    }

    if (body.targetPrice !== undefined) {
      updateData.targetPrice = body.targetPrice;
      // Reset triggered status if target price changes
      updateData.triggered = false;
      updateData.triggeredAt = null;
    }

    const updated = await prisma.priceAlert.update({
      where: { id: alertId },
      data: updateData,
    });

    return NextResponse.json({ alert: updated, updated: true });
  } catch (error) {
    console.error('[Price Alerts] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update price alert' },
      { status: 500 }
    );
  }
}
