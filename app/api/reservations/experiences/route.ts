import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

/**
 * Batch Experiences Reservation API
 * Creates reservations for multiple items (tours, activities, transfers)
 * Status: pending_confirmation (manual ticketing workflow)
 */

interface CartItemInput {
  type: 'tour' | 'activity' | 'transfer';
  productId: string;
  name: string;
  date: string;
  time?: string;
  participants: {
    adults: number;
    children: number;
  };
  totalPrice: number;
  currency: string;
  location?: string;
  duration?: string;
  bookingLink?: string;
}

interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

interface ReservationInput {
  items: CartItemInput[];
  customer: CustomerInput;
  total: number;
  currency: string;
}

// Generate unique IDs
const generateOrderId = () => `EXP-${Date.now().toString(36).toUpperCase()}`;
const generateReservationId = (type: string) => `${type.toUpperCase().slice(0, 2)}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    const body: ReservationInput = await request.json();
    const { items, customer, total, currency } = body;

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'No items provided',
      }, { status: 400 });
    }

    if (!customer?.firstName || !customer?.email || !customer?.phone) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Customer information is required',
      }, { status: 400 });
    }

    const orderId = generateOrderId();
    const reservations: Array<{
      id: string;
      type: string;
      name: string;
      status: string;
    }> = [];

    console.log(`📦 Creating batch reservation ${orderId} with ${items.length} items...`);

    // Process each item
    for (const item of items) {
      const reservationId = generateReservationId(item.type);

      // In production, this would:
      // 1. Store in database
      // 2. Create individual reservation records
      // 3. Trigger email notifications
      // 4. Add to admin queue for manual processing

      reservations.push({
        id: reservationId,
        type: item.type,
        name: item.name,
        status: 'pending_confirmation',
      });

      console.log(`  ✅ ${item.type} reservation created: ${reservationId}`);
    }

    // Log booking for admin dashboard (notification will be created via SSE)
    console.log(`📢 New experiences booking: ${orderId}`, {
      customer: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      items: items.length,
      total: `${currency} ${total}`,
    });

    // Send confirmation email (placeholder - would use Mailgun in production)
    console.log(`  📧 Confirmation email queued for ${customer.email}`);

    const response = {
      success: true,
      orderId,
      reservations,
      message: `Successfully created ${items.length} reservation(s). Confirmation pending.`,
      meta: {
        total,
        currency,
        customer: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
        },
        status: 'pending_confirmation',
        estimatedConfirmation: '24 hours',
      },
    };

    console.log(`✅ Batch reservation ${orderId} completed successfully`);

    return NextResponse.json(response, {
      headers: {
        'X-Order-Id': orderId,
      },
    });
  }, { category: 'business' as any, severity: 'critical' as any });
}

// Get reservation status (for future use)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Order ID is required',
    }, { status: 400 });
  }

  // In production, this would fetch from database
  return NextResponse.json({
    success: true,
    orderId,
    status: 'pending_confirmation',
    message: 'Order status lookup not yet implemented',
  });
}
