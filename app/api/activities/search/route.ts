import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { handleApiError } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

/**
 * Activities Search API - OPTIMIZED with caching
 * Uses Amadeus Tours & Activities API
 * Cache: 4 hours (activities don't change frequently)
 * Performance: 15s timeout, empty result caching
 */
export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseInt(searchParams.get('radius') || '20');
    const type = searchParams.get('type') || 'all';

    if (!latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'latitude and longitude required',
        data: [],
        meta: { count: 0 }
      }, { status: 400 });
    }

    // Round coords to 2 decimals for better cache hits
    const roundedLat = Math.round(latitude * 100) / 100;
    const roundedLng = Math.round(longitude * 100) / 100;
    const cacheKey = generateCacheKey('activities:search:v2', { lat: roundedLat, lng: roundedLng, r: radius, t: type });

    // Check cache first (4 hour TTL) - FAST PATH
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`⚡ Activities cache HIT for ${roundedLat},${roundedLng}`);
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT', 'X-Response-Time': '< 50ms', 'Cache-Control': 'public, max-age=14400' }
      });
    }

    const startTime = Date.now();
    console.log(`🎯 Searching activities at ${latitude}, ${longitude}...`);

    let activities: any[] = [];
    let apiError: string | null = null;

    try {
      // Add timeout for slow API calls
      const result = await Promise.race([
        amadeusAPI.searchActivities({
          latitude,
          longitude,
          radius: Math.min(radius, 20),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Amadeus timeout')), 15000))
      ]) as any;

      activities = result.data || [];
    } catch (error: any) {
      apiError = error.message;
      console.error('⚠️ Amadeus activities search failed:', error.message);
    }

    const responseTime = Date.now() - startTime;

    // Filter by type (after we have results)
    if (activities.length > 0) {
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
    }

    const response = {
      success: true,
      data: activities,
      meta: {
        count: activities.length,
        type,
        location: { latitude, longitude, radius },
        responseTime: `${responseTime}ms`,
        message: activities.length === 0
          ? (apiError ? 'Activities search temporarily unavailable.' : 'No activities found for this location.')
          : undefined
      }
    };

    // Cache for 4 hours (or 5 min for empty results)
    const cacheTTL = activities.length > 0 ? 14400 : 300;
    await setCache(cacheKey, response, cacheTTL);
    console.log(`✅ Found ${activities.length} ${type} in ${responseTime}ms - cached for ${cacheTTL}s`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${responseTime}ms`,
        'Cache-Control': `public, max-age=${cacheTTL}`
      }
    });
  }, { category: 'external_api' as any, severity: 'normal' as any });
}
