import { NextRequest, NextResponse } from 'next/server';
import { getDuffelClient } from '@/lib/flights/duffel-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Validate Offer API - Check if offer is still valid before checkout
 * 
 * Returns:
 * - valid: true/false
 * - currentPrice: current price (if still valid)
 * - priceChanged: true if price is different from original
 * - newOfferId: if offer was refreshed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, originalPrice, searchParams } = body;

    if (!offerId) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Missing offerId' 
      }, { status: 400 });
    }

    const duffel = getDuffelClient();

    // Try to get the current offer from Duffel
    try {
      const offer = await duffel.offers.get(offerId);
      
      // Offer is still valid
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
      // Offer expired or not found - need to re-search
      const errorMessage = duffelError.message || '';
      
      if (errorMessage.includes('expired') || 
          errorMessage.includes('not_found') ||
          duffelError.errors?.[0]?.code === 'offer_no_longer_available') {
        
        // If search params provided, we could do a quick re-search
        // For now, just return invalid and let frontend handle re-search
        return NextResponse.json({
          valid: false,
          expired: true,
          error: 'OFFER_EXPIRED',
          message: 'This offer has expired. Please search again for current prices.',
          searchParams, // Return search params for re-search
        });
      }

      throw duffelError;
    }
  } catch (error: any) {
    console.error('[Offer Validate] Error:', error);
    return NextResponse.json({
      valid: false,
      error: 'VALIDATION_FAILED',
      message: error.message || 'Failed to validate offer',
    }, { status: 500 });
  }
}
