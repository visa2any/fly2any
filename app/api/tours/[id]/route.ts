import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { handleApiError } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

/**
 * Tour Details API - Fetch single tour by ID
 * Uses Amadeus Activities API
 * Cache: 6 hours (tour details don't change frequently)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiError(request, async () => {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Tour ID is required',
        data: null,
      }, { status: 400 });
    }

    // Check cache first
    const cacheKey = generateCacheKey('tour:detail:v1', { id });
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`⚡ Tour detail cache HIT for ${id}`);
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=21600' }
      });
    }

    const startTime = Date.now();
    console.log(`🗺️ Fetching tour details for ${id}...`);

    try {
      // Fetch from Amadeus
      const result = await amadeusAPI.getActivityById(id);

      if (!result?.data) {
        return NextResponse.json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Tour not found',
          data: null,
        }, { status: 404 });
      }

      const tour = result.data;
      const responseTime = Date.now() - startTime;

      const response = {
        success: true,
        data: tour,
        meta: {
          responseTime: `${responseTime}ms`,
        }
      };

      // Cache for 6 hours
      await setCache(cacheKey, response, 21600);
      console.log(`✅ Tour detail fetched in ${responseTime}ms - cached`);

      return NextResponse.json(response, {
        headers: {
          'X-Cache': 'MISS',
          'X-Response-Time': `${responseTime}ms`,
          'Cache-Control': 'public, max-age=21600'
        }
      });
    } catch (error: any) {
      console.error('⚠️ Tour detail fetch failed:', error.message);
      return NextResponse.json({
        success: false,
        error: 'API_ERROR',
        message: 'Unable to fetch tour details',
        data: null,
      }, { status: 500 });
    }
  }, { category: 'external_api' as any, severity: 'normal' as any });
}
