/**
 * Offer Refresh API — Fly2Any
 *
 * Re-searches for a flight to get fresh offer when original expires.
 * Returns the best matching offer or alternatives.
 */

import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';
import { alertApiError } from '@/lib/monitoring/customer-error-alerts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RefreshRequest {
  originalOfferId: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
  // Original flight details for matching
  originalPrice?: number;
  originalAirline?: string;
  originalDepartureTime?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshRequest = await request.json();
    const {
      originalOfferId,
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      infants = 0,
      cabinClass = 'economy',
      originalPrice,
      originalAirline,
      originalDepartureTime,
    } = body;

    console.log('🔄 Refreshing offer:', {
      originalOfferId,
      route: `${origin} → ${destination}`,
      date: departureDate,
    });

    // Re-search for flights
    const searchResult = await duffelAPI.searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      cabinClass: cabinClass as any,
      maxResults: 20,
    });

    const offers = searchResult.data || [];

    if (offers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'NO_FLIGHTS_FOUND',
        message: 'No flights available for this route. Please try different dates.',
        searchUrl: buildSearchUrl({ origin, destination, departureDate, returnDate, adults }),
      }, { status: 404 });
    }

    // Find best matching offer
    let bestMatch = offers[0];
    let matchScore = 0;

    for (const offer of offers) {
      let score = 0;

      // Match airline (+3)
      if (originalAirline && offer.validatingAirlineCodes?.includes(originalAirline)) {
        score += 3;
      }

      // Match departure time within 2 hours (+2)
      if (originalDepartureTime) {
        const origTime = new Date(originalDepartureTime).getTime();
        const offerTime = new Date(offer.itineraries?.[0]?.segments?.[0]?.departure?.at).getTime();
        const diffHours = Math.abs(origTime - offerTime) / (1000 * 60 * 60);
        if (diffHours <= 2) score += 2;
      }

      // Price within 10% (+1)
      if (originalPrice) {
        const offerPrice = parseFloat(offer.price?.total || '0');
        const priceDiff = Math.abs(offerPrice - originalPrice) / originalPrice;
        if (priceDiff <= 0.1) score += 1;
      }

      if (score > matchScore) {
        matchScore = score;
        bestMatch = offer;
      }
    }

    const newPrice = parseFloat(bestMatch.price?.total || '0');
    const priceChange = originalPrice
      ? ((newPrice - originalPrice) / originalPrice * 100).toFixed(1)
      : null;

    console.log('✅ Offer refreshed:', {
      newOfferId: bestMatch.id,
      newPrice,
      priceChange: priceChange ? `${priceChange}%` : 'N/A',
      matchScore,
    });

    return NextResponse.json({
      success: true,
      offer: bestMatch,
      matchScore,
      priceChange: priceChange ? parseFloat(priceChange) : null,
      message: priceChange && parseFloat(priceChange) > 5
        ? `Price updated: ${parseFloat(priceChange) > 0 ? '+' : ''}${priceChange}%`
        : 'Fresh price available',
      alternatives: offers.slice(0, 5).map(o => ({
        id: o.id,
        price: o.price?.total,
        airline: o.validatingAirlineCodes?.[0],
        departure: o.itineraries?.[0]?.segments?.[0]?.departure?.at,
      })),
    });
  } catch (error: any) {
    console.error('❌ Offer refresh failed:', error);

    // Alert admins about refresh failures
    await alertApiError(request, error, {
      errorCode: 'OFFER_REFRESH_FAILED',
      endpoint: '/api/flights/offer/refresh',
    }, { priority: 'normal' }).catch(() => {});

    return NextResponse.json({
      success: false,
      error: 'REFRESH_FAILED',
      message: 'Unable to refresh prices. Please search again.',
    }, { status: 500 });
  }
}

function buildSearchUrl(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
}): string {
  const searchParams = new URLSearchParams({
    from: params.origin,
    to: params.destination,
    departure: params.departureDate,
    adults: params.adults.toString(),
  });

  if (params.returnDate) {
    searchParams.set('return', params.returnDate);
  }

  return `/flights/results?${searchParams.toString()}`;
}
