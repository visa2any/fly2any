import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Create Duffel client for offer validation
const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN || '',
});

/**
 * Validate Offer API - Check if offer is still valid before checkout
 */
export async function POST(request: NextRequest) {
  try {
    const { offerId, originalPrice, searchParams } = await request.json();

    if (!offerId) {
      return NextResponse.json({ valid: false, error: 'Missing offerId' }, { status: 400 });
    }

    try {
      const offer = await duffel.offers.get(offerId);
      const currentPrice = parseFloat(offer.data.total_amount);
      const priceChanged = originalPrice && Math.abs(currentPrice - originalPrice) > 0.01;

      return NextResponse.json({
        valid: true,
        offerId: offer.data.id,
        currentPrice,
        currency: offer.data.total_currency,
        priceChanged,
        priceDifference: priceChanged ? currentPrice - originalPrice : 0,
        expiresAt: offer.data.expires_at,
      });
    } catch (duffelError: any) {
      const errorCode = duffelError.errors?.[0]?.code || '';
      if (errorCode === 'offer_no_longer_available' ||
          duffelError.message?.includes('expired')) {
        return NextResponse.json({
          valid: false,
          expired: true,
          error: 'OFFER_EXPIRED',
          message: 'This offer has expired. Please search again.',
          searchParams,
        });
      }
      throw duffelError;
    }
  } catch (error: any) {
    console.error('[Offer Validate]', error.message);
    return NextResponse.json({
      valid: false,
      error: 'VALIDATION_FAILED',
      message: error.message || 'Failed to validate offer',
    }, { status: 500 });
  }
}
