import { NextRequest, NextResponse } from 'next/server';
import { urgencyEngine } from '@/lib/ml/urgency-engine';

/**
 * POST /api/flights/urgency
 * ===========================
 * Generates real-time urgency signals for a flight using ML
 *
 * Request body:
 * {
 *   flightId: string,
 *   route: string (e.g., "JFK-LAX"),
 *   price: number,
 *   departureDate: string,
 *   airline: string,
 *   seatsAvailable?: number,
 *   sessionId: string
 * }
 */

// In-memory cache for urgency signals (30 second TTL to keep signals fresh)
const urgencyCache = new Map<string, { data: any; expires: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightId, route, price, departureDate, airline, seatsAvailable, sessionId } = body;

    // Validate inputs
    if (!flightId || !route || !price || !departureDate || !airline || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: flightId, route, price, departureDate, airline, sessionId' },
        { status: 400 }
      );
    }

    // Check cache first (30 second TTL for fresh urgency signals)
    const cacheKey = `${flightId}-${route}-${sessionId}`;
    const now = Date.now();
    const cached = urgencyCache.get(cacheKey);

    if (cached && cached.expires > now) {
      return NextResponse.json(cached.data, {
        headers: {
          'X-Cache-Status': 'HIT',
        },
      });
    }

    // Build flight context
    const flightContext = {
      flightId,
      route,
      price,
      departureDate,
      airline,
      seatsAvailable,
    };

    // Generate urgency signals
    const urgencySignals = await urgencyEngine.generateUrgencySignals(flightContext, sessionId);

    const response = {
      success: true,
      signals: urgencySignals,
      metadata: {
        flightId,
        route,
        generatedAt: new Date().toISOString(),
      },
    };

    // Cache for 30 seconds
    urgencyCache.set(cacheKey, {
      data: response,
      expires: now + 30000, // 30 seconds
    });

    // Clean up expired cache entries periodically
    if (urgencyCache.size > 1000) {
      for (const [key, value] of urgencyCache.entries()) {
        if (value.expires <= now) {
          urgencyCache.delete(key);
        }
      }
    }

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
      },
    });
  } catch (error) {
    console.error('Urgency signal generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate urgency signals', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
