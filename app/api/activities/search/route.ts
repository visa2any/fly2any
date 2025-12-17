import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * Activities Search API - OPTIMIZED with caching
 * Uses Amadeus Tours & Activities API
 * Cache: 4 hours (activities don't change frequently)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseInt(searchParams.get('radius') || '20');
    const type = searchParams.get('type') || 'all';

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'latitude and longitude required' }, { status: 400 });
    }

    // Round coords to 2 decimals for better cache hits
    const roundedLat = Math.round(latitude * 100) / 100;
    const roundedLng = Math.round(longitude * 100) / 100;
    const cacheKey = generateCacheKey('activities:search', { lat: roundedLat, lng: roundedLng, r: radius, t: type });

    // Check cache first (4 hour TTL)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`⚡ Activities cache HIT for ${roundedLat},${roundedLng}`);
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=14400' }
      });
    }

    console.log(`🎯 Searching activities at ${latitude}, ${longitude}...`);

    const result = await amadeusAPI.searchActivities({
      latitude,
      longitude,
      radius: Math.min(radius, 20),
    });

    let activities = result.data || [];

    // Filter by type
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

    const response = {
      data: activities,
      meta: { count: activities.length, type, location: { latitude, longitude, radius } }
    };

    // Cache for 4 hours
    await setCache(cacheKey, response, 14400);
    console.log(`✅ Found ${activities.length} ${type} - cached`);

    return NextResponse.json(response, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=14400' }
    });
  } catch (error: any) {
    console.error('❌ Activities error:', error.message);
    return NextResponse.json({ error: 'Failed to search', message: error.message }, { status: 500 });
  }
}
