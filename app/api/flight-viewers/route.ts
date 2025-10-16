import { NextRequest, NextResponse } from 'next/server';
import { incrementViewers, getViewers, decrementViewers, getViewersBatch } from '@/lib/cache/viewers';

/**
 * POST /api/flight-viewers
 * Register a viewer for a flight (increment count)
 *
 * Body: { flightId: string, action: 'join' | 'leave' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightId, action = 'join' } = body;

    // Validate flightId
    if (!flightId || typeof flightId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Flight ID is required and must be a string',
            code: 'INVALID_FLIGHT_ID',
          },
        },
        { status: 400 }
      );
    }

    let viewerCount: number;

    if (action === 'leave') {
      // User is leaving - decrement count
      viewerCount = await decrementViewers(flightId);
    } else {
      // User is joining - increment count
      viewerCount = await incrementViewers(flightId);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          flightId,
          viewerCount,
          action,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST /api/flight-viewers error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to update viewer count',
          code: 'UPDATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/flight-viewers
 * Get current viewer count for one or more flights
 *
 * Query params:
 * - flightId: string (single flight)
 * - flightIds: string[] (multiple flights, comma-separated)
 *
 * Examples:
 * - GET /api/flight-viewers?flightId=FL123
 * - GET /api/flight-viewers?flightIds=FL123,FL456,FL789
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check for single flight ID
    const flightId = searchParams.get('flightId');

    // Check for multiple flight IDs
    const flightIdsParam = searchParams.get('flightIds');

    // Single flight request
    if (flightId) {
      const viewerCount = await getViewers(flightId);

      return NextResponse.json(
        {
          success: true,
          data: {
            flightId,
            viewerCount,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    }

    // Multiple flights request
    if (flightIdsParam) {
      const flightIds = flightIdsParam.split(',').map(id => id.trim()).filter(Boolean);

      if (flightIds.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'At least one flight ID is required',
              code: 'INVALID_FLIGHT_IDS',
            },
          },
          { status: 400 }
        );
      }

      const viewersMap = await getViewersBatch(flightIds);

      // Convert Map to object for JSON response
      const viewers: Record<string, number> = {};
      viewersMap.forEach((count, id) => {
        viewers[id] = count;
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            viewers,
            count: flightIds.length,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    }

    // No flight ID provided
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Flight ID is required (use ?flightId=XXX or ?flightIds=XXX,YYY)',
          code: 'MISSING_FLIGHT_ID',
        },
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('GET /api/flight-viewers error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to fetch viewer count',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/flight-viewers
 * Manually decrement viewer count (for cleanup/testing)
 *
 * Query param: flightId
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flightId = searchParams.get('flightId');

    if (!flightId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Flight ID is required',
            code: 'MISSING_FLIGHT_ID',
          },
        },
        { status: 400 }
      );
    }

    const viewerCount = await decrementViewers(flightId);

    return NextResponse.json(
      {
        success: true,
        data: {
          flightId,
          viewerCount,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/flight-viewers error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to decrement viewer count',
          code: 'DELETE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
