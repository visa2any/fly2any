import { NextRequest, NextResponse } from 'next/server';
import { airlineDataService } from '@/lib/airlines/airline-data-service';
import { getAirlineData } from '@/lib/flights/airline-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/airlines/[code] - Get airline by IATA code
 *
 * Returns full airline profile with fleet, routes, and operational stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.toUpperCase();

    // Try database first
    let airline = await airlineDataService.getProfile(code);

    // Fallback to static data if not in database
    if (!airline) {
      const staticData = getAirlineData(code);
      if (staticData) {
        return NextResponse.json({
          success: true,
          source: 'static',
          airline: {
            iataCode: code,
            name: staticData.name,
            alliance: staticData.alliance,
            brandPrimaryColor: staticData.brandColors?.primary,
            brandSecondaryColor: staticData.brandColors?.secondary,
            hubAirports: staticData.hubAirports || [],
            loyaltyProgramName: staticData.frequentFlyerProgram,
            overallRating: staticData.ratings?.overall,
            onTimeRating: staticData.ratings?.onTimePerformance,
            comfortRating: staticData.ratings?.comfort,
            serviceRating: staticData.ratings?.service,
          },
        });
      }

      return NextResponse.json(
        { success: false, error: 'Airline not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      source: 'database',
      airline,
    });
  } catch (error: any) {
    console.error('Error fetching airline:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch airline' },
      { status: 500 }
    );
  }
}
