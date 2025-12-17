import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';

export const dynamic = 'force-dynamic';

/**
 * Activities Search API
 * Uses Amadeus Tours & Activities API
 * Returns real activity data for booking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseInt(searchParams.get('radius') || '20');
    const type = searchParams.get('type') || 'all'; // 'tours' | 'activities' | 'all'

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'latitude and longitude are required' },
        { status: 400 }
      );
    }

    console.log(`🎯 Searching activities at ${latitude}, ${longitude} (radius: ${radius}km)...`);

    const result = await amadeusAPI.searchActivities({
      latitude,
      longitude,
      radius: Math.min(radius, 20), // Max 20km
    });

    let activities = result.data || [];

    // Filter by type if specified
    if (type === 'tours') {
      activities = activities.filter((a: any) =>
        a.name?.toLowerCase().includes('tour') ||
        a.name?.toLowerCase().includes('trip') ||
        a.name?.toLowerCase().includes('excursion') ||
        a.description?.toLowerCase().includes('guided')
      );
    } else if (type === 'activities') {
      activities = activities.filter((a: any) =>
        !a.name?.toLowerCase().includes('tour') &&
        !a.name?.toLowerCase().includes('trip')
      );
    }

    console.log(`✅ Found ${activities.length} ${type} options`);

    return NextResponse.json({
      data: activities,
      meta: {
        count: activities.length,
        type,
        location: { latitude, longitude, radius }
      }
    });
  } catch (error: any) {
    console.error('❌ Activities search error:', error.message);
    return NextResponse.json(
      { error: 'Failed to search activities', message: error.message },
      { status: 500 }
    );
  }
}
