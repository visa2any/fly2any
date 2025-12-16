/**
 * Track Search API
 * POST /api/track/search
 *
 * Client-side tracking for abandoned search recovery emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { trackFlightSearch, trackBookingStarted } from '@/lib/email/search-tracker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, data } = body;

    if (!email || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user ID if logged in
    let userId: string | undefined;
    try {
      const session = await auth();
      userId = session?.user?.id;
    } catch {
      // Not logged in
    }

    if (type === 'flight_search') {
      await trackFlightSearch(email, userId, {
        origin: data.origin,
        destination: data.destination,
        departureDate: data.departureDate,
        returnDate: data.returnDate,
        adults: data.adults || 1,
        cabinClass: data.cabinClass,
        lowestPrice: data.lowestPrice,
        currency: data.currency,
      });
    } else if (type === 'booking_started') {
      await trackBookingStarted(email, userId, {
        origin: data.origin,
        destination: data.destination,
        departureDate: data.departureDate,
        price: data.price,
        currency: data.currency,
        offerId: data.offerId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Track API] Error:', error);
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}
