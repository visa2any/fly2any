/**
 * Hotelbeds Hotel Search API Route
 *
 * Endpoint: POST /api/hotels/hotelbeds-search
 *
 * Searches hotels using Hotelbeds APItude API
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchHotels, normalizeHotelbedsHotel } from '@/lib/api/hotelbeds';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SearchRequest {
  location?: string;
  latitude?: number;
  longitude?: number;
  checkin: string;
  checkout: string;
  adults?: number;
  children?: number;
  rooms?: number;
  currency?: string;
  radius?: number; // In kilometers
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();

    const {
      latitude,
      longitude,
      checkin,
      checkout,
      adults = 2,
      children = 0,
      rooms = 1,
      currency = 'USD',
      radius = 20,
    } = body;

    // Validate required fields
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required for Hotelbeds search' },
        { status: 400 }
      );
    }

    if (!checkin || !checkout) {
      return NextResponse.json(
        { error: 'Check-in and check-out dates are required' },
        { status: 400 }
      );
    }

    console.log(`🏨 Hotelbeds Search: ${latitude},${longitude} | ${checkin} → ${checkout} | ${adults}A ${children}C`);

    // Build occupancies array
    const paxes = [];
    for (let i = 0; i < adults; i++) {
      paxes.push({ type: 'AD' as const, age: 30 });
    }
    for (let i = 0; i < children; i++) {
      paxes.push({ type: 'CH' as const, age: 10 });
    }

    // Search Hotelbeds
    const response = await searchHotels({
      stay: {
        checkIn: checkin,
        checkOut: checkout,
      },
      occupancies: [
        {
          rooms,
          adults,
          children,
          paxes,
        },
      ],
      geolocation: {
        latitude,
        longitude,
        radius,
        unit: 'km',
      },
      language: 'ENG',
    });

    const hotels = response.hotels?.hotels || [];

    console.log(`✅ Hotelbeds returned ${hotels.length} hotels in ${response.auditData?.processTime}ms`);

    // Normalize hotels
    const normalizedHotels = hotels.map((hotel) =>
      normalizeHotelbedsHotel(hotel, checkin, checkout)
    );

    return NextResponse.json({
      success: true,
      provider: 'hotelbeds',
      hotels: normalizedHotels,
      total: hotels.length,
      meta: {
        processTime: response.auditData?.processTime,
        timestamp: response.auditData?.timestamp,
        environment: response.auditData?.environment,
      },
    });
  } catch (error: any) {
    console.error('❌ Hotelbeds Search Error:', error);

    return NextResponse.json(
      {
        success: false,
        provider: 'hotelbeds',
        error: error.message || 'Failed to search Hotelbeds hotels',
        hotels: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
