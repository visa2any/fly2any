import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/cart/track
 * ====================
 * Track abandoned cart for recovery
 */

export async function POST(request: NextRequest) {
  try {
    const cart = await request.json();

    // Validate required fields
    if (!cart.id || !cart.flightData || !cart.searchData) {
      return NextResponse.json(
        { error: 'Missing required cart data' },
        { status: 400 }
      );
    }

    // TODO: Store in database (PostgreSQL, MongoDB, Redis, etc.)
    // For now, log to console
    console.log(`🛒 Abandoned cart tracked:`);
    console.log(`   ID: ${cart.id}`);
    console.log(`   Step: ${cart.step}`);
    console.log(`   Route: ${cart.flightData.route}`);
    console.log(`   Price: ${cart.currency} ${cart.totalPrice}`);
    console.log(`   Email: ${cart.email || 'Not provided'}`);

    // In production, you would:
    // await db.abandonedCarts.insert(cart);

    return NextResponse.json({
      success: true,
      cartId: cart.id,
      tracked: true,
    });

  } catch (error) {
    console.error('Cart tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track cart',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
