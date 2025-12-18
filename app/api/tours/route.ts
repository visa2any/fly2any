import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getGeocodeWithFallback } from '@/lib/data/geocodes';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { handleApiError } from '@/lib/monitoring/global-error-handler';

export const dynamic = 'force-dynamic';

/**
 * Tours Search API - OPTIMIZED with caching and error handling
 * Uses Amadeus Tours & Activities API
 * Cache: 4 hours (tours don't change frequently)
 * Performance: 15s timeout, empty result caching
 */
export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const { searchParams } = new URL(request.url);

    const destination = searchParams.get('destination');
    const startDate = searchParams.get('startDate');
    const radius = parseInt(searchParams.get('radius') || '10');

    if (!destination) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'destination is required',
        data: [],
        meta: { count: 0 }
      }, { status: 400 });
    }

    // Convert destination (city code or name) to geocode
    const geocode = getGeocodeWithFallback(destination);

    // Round coords to 2 decimals for better cache hits
    const roundedLat = Math.round(geocode.latitude * 100) / 100;
    const roundedLng = Math.round(geocode.longitude * 100) / 100;
    const cacheKey = generateCacheKey('tours:search:v3', {
      lat: roundedLat,
      lng: roundedLng,
      r: radius,
      dest: destination.toLowerCase().substring(0, 20)
    });

    // Check cache first (4 hour TTL) - FAST PATH
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`⚡ Tours cache HIT for ${destination}`);
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT', 'X-Response-Time': '< 50ms', 'Cache-Control': 'public, max-age=14400' }
      });
    }

    const startTime = Date.now();
    console.log(`🗺️ Searching tours at "${destination}" (${geocode.latitude}, ${geocode.longitude})...`);

    let tours: any[] = [];
    let apiError: string | null = null;

    /**
     * Apply markup: $35 minimum OR 35% whichever is higher
     * This is the Fly2Any margin applied to all tour bookings
     */
    const applyMarkup = (item: any) => {
      const basePrice = item.price?.amount ? parseFloat(item.price.amount) : null;
      if (basePrice === null) return item;

      const markupAmount = Math.max(35, basePrice * 0.35);
      const finalPrice = basePrice + markupAmount;

      return {
        ...item,
        price: {
          ...item.price,
          amount: finalPrice.toFixed(2),
          baseAmount: basePrice.toFixed(2),
          markup: markupAmount.toFixed(2),
          markupPercent: ((markupAmount / basePrice) * 100).toFixed(1),
        }
      };
    };

    try {
      // Cap radius at 2km for optimal performance
      // Even 1km returns 1000+ activities in major cities
      // API max is 20km but larger radius causes timeouts
      const effectiveRadius = Math.min(radius, 2);
      const result = await Promise.race([
        amadeusAPI.searchActivities({
          latitude: geocode.latitude,
          longitude: geocode.longitude,
          radius: effectiveRadius,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Amadeus timeout')), 20000))
      ]) as any;

      // Filter for tour-like activities (broadened keywords for better coverage)
      if (result?.data && Array.isArray(result.data)) {
        const tourKeywords = [
          'tour', 'trip', 'excursion', 'guided', 'visit', 'experience',
          'adventure', 'cruise', 'snorkel', 'diving', 'cenote', 'ruins',
          'day trip', 'sunset', 'sunrise', 'safari', 'exploration', 'sightseeing',
          'discover', 'explore', 'journey', 'expedition', 'tasting', 'walking'
        ];
        tours = result.data
          .filter((item: any) => {
            const name = (item.name || '').toLowerCase();
            const desc = (item.shortDescription || item.description || '').toLowerCase();
            return tourKeywords.some(kw => name.includes(kw) || desc.includes(kw));
          })
          .map(applyMarkup); // Apply markup to all tours
      }
    } catch (error: any) {
      apiError = error.message;
      console.error('⚠️ Amadeus tours search failed:', error.message);
    }

    const responseTime = Date.now() - startTime;

    const response = {
      success: true,
      data: tours,
      meta: {
        count: tours.length,
        destination,
        location: { latitude: geocode.latitude, longitude: geocode.longitude, radius },
        responseTime: `${responseTime}ms`,
        message: tours.length === 0
          ? (apiError ? 'Tours search temporarily unavailable.' : 'No tours found for this destination.')
          : undefined
      }
    };

    // Cache for 4 hours (or 5 min for empty results)
    const cacheTTL = tours.length > 0 ? 14400 : 300;
    await setCache(cacheKey, response, cacheTTL);
    console.log(`✅ Found ${tours.length} tours in ${responseTime}ms - cached for ${cacheTTL}s`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${responseTime}ms`,
        'Cache-Control': `public, max-age=${cacheTTL}`
      }
    });
  }, { category: 'external_api' as any, severity: 'normal' as any });
}
