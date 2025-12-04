import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';
import { applyMarkup } from '@/lib/config/ancillary-markup';

/**
 * GET /api/orders/[orderId]/services
 *
 * Get available services (bags, seats) that can be added to an existing order.
 * This enables post-booking upselling - customers can add bags after checkout.
 *
 * Revenue opportunity: $25-75 per bag with 25% markup
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId || !orderId.startsWith('ord_')) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    console.log(`📦 Fetching post-booking services for order: ${orderId}`);

    const result = await duffelAPI.getOrderAvailableServices(orderId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Apply markup to all service prices
    const applyMarkupToServices = (services: any[], serviceType: 'baggage' | 'seats') => {
      return services.map(service => {
        const netPrice = parseFloat(service.totalAmount || '0');
        const markup = applyMarkup(netPrice, serviceType);

        return {
          ...service,
          netPrice: netPrice,
          customerPrice: markup.customerPrice,
          markupAmount: markup.markupAmount,
          displayPrice: `${service.totalCurrency} ${markup.customerPrice.toFixed(2)}`,
        };
      });
    };

    const markedUpData = {
      baggage: applyMarkupToServices(result.data.baggage, 'baggage'),
      seats: applyMarkupToServices(result.data.seats, 'seats'),
      other: result.data.other, // No markup on other services
    };

    return NextResponse.json({
      success: true,
      data: markedUpData,
      meta: {
        ...result.meta,
        markupApplied: true,
        note: 'Prices include service fee. Add bags or seats to your existing booking.',
      },
    });

  } catch (error: any) {
    console.error('❌ Error in post-booking services API:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch available services',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders/[orderId]/services
 *
 * Add services (bags, seats) to an existing order.
 * Customer has already paid for their flight and wants to add extras.
 *
 * Request body:
 * {
 *   services: [{ id: string, quantity: number }],
 *   paymentIntentId?: string // Stripe payment intent for the add-on
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const { services, paymentIntentId } = body;

    if (!orderId || !orderId.startsWith('ord_')) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Services array is required' },
        { status: 400 }
      );
    }

    // Validate each service
    for (const service of services) {
      if (!service.id || typeof service.quantity !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Each service must have id and quantity' },
          { status: 400 }
        );
      }
    }

    console.log(`➕ Adding ${services.length} service(s) to order: ${orderId}`);

    // First, get available services to calculate payment amount
    const availableResult = await duffelAPI.getOrderAvailableServices(orderId);

    if (!availableResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to verify available services' },
        { status: 500 }
      );
    }

    // Calculate total payment amount
    const allServices = [
      ...availableResult.data.baggage,
      ...availableResult.data.seats,
      ...availableResult.data.other,
    ];

    let totalPayment = 0;
    let currency = 'USD';

    for (const requestedService of services) {
      const serviceDetails = allServices.find(s => s.id === requestedService.id);

      if (!serviceDetails) {
        return NextResponse.json(
          { success: false, error: `Service ${requestedService.id} not found or not available` },
          { status: 400 }
        );
      }

      const servicePrice = parseFloat(serviceDetails.totalAmount || '0');
      totalPayment += servicePrice * requestedService.quantity;
      currency = serviceDetails.totalCurrency || 'USD';
    }

    console.log(`   💰 Total payment required: ${currency} ${totalPayment.toFixed(2)}`);

    // Add services to order via Duffel API
    const result = await duffelAPI.addServicesToOrder(
      orderId,
      services,
      totalPayment.toFixed(2),
      currency
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        orderId,
        servicesAdded: services.length,
        totalPaid: `${currency} ${totalPayment.toFixed(2)}`,
        message: 'Services successfully added to your booking!',
      },
    });

  } catch (error: any) {
    console.error('❌ Error adding services to order:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to add services to order',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
