import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/analytics/share
 * Track share events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, flightId, userId, timestamp } = body;

    // Validate required fields
    if (!platform || !flightId) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, flightId' },
        { status: 400 }
      );
    }

    // In production, save to database
    console.log('📊 Share Event Tracked:', {
      platform,
      flightId,
      userId,
      timestamp,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    });

    // TODO: Save to analytics database
    // await db.shareEvents.create({
    //   platform,
    //   flightId,
    //   userId,
    //   timestamp,
    //   userAgent: request.headers.get('user-agent'),
    //   referer: request.headers.get('referer'),
    // });

    // Update share count (in production, increment in database)
    // await db.flights.increment({ id: flightId }, 'shareCount', 1);

    return NextResponse.json({
      success: true,
      message: 'Share event tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking share event:', error);
    return NextResponse.json(
      { error: 'Failed to track share event' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/share?flightId=xxx
 * Get share analytics for a flight
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flightId = searchParams.get('flightId');

    if (!flightId) {
      return NextResponse.json(
        { error: 'Missing required parameter: flightId' },
        { status: 400 }
      );
    }

    // In production, fetch from database
    const mockAnalytics = {
      flightId,
      totalShares: Math.floor(Math.random() * 100) + 10,
      sharesByPlatform: {
        whatsapp: Math.floor(Math.random() * 40) + 5,
        facebook: Math.floor(Math.random() * 30) + 3,
        twitter: Math.floor(Math.random() * 20) + 2,
        linkedin: Math.floor(Math.random() * 15) + 1,
        email: Math.floor(Math.random() * 25) + 3,
        copy: Math.floor(Math.random() * 50) + 8,
      },
      clickThroughRate: (Math.random() * 0.3 + 0.1).toFixed(2), // 10-40%
      conversionRate: (Math.random() * 0.15 + 0.05).toFixed(2), // 5-20%
      viralCoefficient: (Math.random() * 0.5 + 0.2).toFixed(2), // 0.2-0.7
    };

    return NextResponse.json({
      success: true,
      data: mockAnalytics,
    });
  } catch (error) {
    console.error('Error fetching share analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share analytics' },
      { status: 500 }
    );
  }
}
