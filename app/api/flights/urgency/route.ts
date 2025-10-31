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

    return NextResponse.json({
      success: true,
      signals: urgencySignals,
      metadata: {
        flightId,
        route,
        generatedAt: new Date().toISOString(),
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
