import { NextRequest, NextResponse } from 'next/server';
import { userSegmentationEngine } from '@/lib/ml/user-segmentation';

/**
 * POST /api/ml/segment-user
 * ==========================
 * Classifies user into behavioral segment using ML
 *
 * Request body:
 * {
 *   search: { route, departureDay, tripLength, destination, ... },
 *   interaction: { usedPriceFilter, sortedBy, clickedFlights, ... }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { search, interaction } = body;

    // Validate search data
    if (!search || !search.route) {
      return NextResponse.json(
        { error: 'Missing required field: search.route' },
        { status: 400 }
      );
    }

    // Build search behavior
    const searchBehavior = {
      route: search.route || '',
      departureDay: determineDepartureDay(search.departure),
      tripLength: search.tripLength || calculateTripLength(search.departure, search.return),
      destination: search.to || '',
      isFlexibleDates: search.isFlexibleDates || false,
      searchTime: new Date(),
      advanceBooking: search.advanceBooking || calculateAdvanceBooking(search.departure),
      adults: search.adults || 1,
      children: search.children || 0,
      infants: search.infants || 0,
      cabinClass: search.class || 'economy',
    };

    // Build interaction behavior (if provided)
    let interactionBehavior;
    if (interaction) {
      interactionBehavior = {
        usedPriceFilter: interaction.usedPriceFilter || false,
        minPriceSet: interaction.minPriceSet,
        maxPriceSet: interaction.maxPriceSet,
        sortedBy: interaction.sortedBy,
        clickedFlights: interaction.clickedFlights || [],
        timeSpent: interaction.timeSpent || 0,
        deviceType: interaction.deviceType || detectDeviceType(request.headers.get('user-agent') || ''),
      };
    }

    // Classify user
    const result = await userSegmentationEngine.classifyUser(
      searchBehavior,
      interactionBehavior
    );

    return NextResponse.json({
      success: true,
      segment: result.segment,
      confidence: result.confidence,
      signals: result.signals,
      recommendations: result.recommendations,
      metadata: {
        classifiedAt: new Date().toISOString(),
        searchBehavior,
        hasInteractionData: !!interactionBehavior,
      },
    });
  } catch (error) {
    console.error('User segmentation error:', error);
    return NextResponse.json(
      { error: 'Failed to classify user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper functions

function determineDepartureDay(departureDate?: string): 'weekday' | 'weekend' {
  if (!departureDate) return 'weekday';

  const date = new Date(departureDate);
  const day = date.getDay();

  return day === 0 || day === 6 ? 'weekend' : 'weekday';
}

function calculateTripLength(departure?: string, returnDate?: string): number | undefined {
  if (!departure || !returnDate) return undefined;

  const start = new Date(departure);
  const end = new Date(returnDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

function calculateAdvanceBooking(departure?: string): number {
  if (!departure) return 14; // Default 2 weeks

  const today = new Date();
  const departureDate = new Date(departure);
  const diffTime = departureDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

function detectDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }

  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}
