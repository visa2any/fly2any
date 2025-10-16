import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightOffers } = body;

    if (!flightOffers || !Array.isArray(flightOffers) || flightOffers.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid flight offers' },
        { status: 400 }
      );
    }

    // Confirm pricing with Amadeus
    const results = await amadeusAPI.confirmFlightPrice(flightOffers);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Flight confirm error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm flight price' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
