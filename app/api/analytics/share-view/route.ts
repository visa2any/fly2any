import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/analytics/share-view
 * Track when someone views a shared flight
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightId, platform, sharedBy, ref, timestamp } = body;

    // Validate required fields
    if (!flightId) {
      return NextResponse.json(
        { error: 'Missing required field: flightId' },
        { status: 400 }
      );
    }

    // Extract tracking data
    const trackingData = {
      flightId,
      platform: platform || 'direct',
      sharedBy: sharedBy || null,
      referralCode: ref || null,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      referer: request.headers.get('referer'),
    };

    console.log('👀 Shared Flight View Tracked:', trackingData);

    // In production, save to database
    // await db.shareViews.create(trackingData);

    // Update view count for the shared flight
    // await db.flights.increment({ id: flightId }, 'sharedViews', 1);

    // Update conversion funnel metrics
    // if (sharedBy) {
    //   await db.users.increment({ id: sharedBy }, 'referralViews', 1);
    // }

    return NextResponse.json({
      success: true,
      message: 'Share view tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking share view:', error);
    return NextResponse.json(
      { error: 'Failed to track share view' },
      { status: 500 }
    );
  }
}
