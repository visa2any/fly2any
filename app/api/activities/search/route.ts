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
    // v5: Force fresh data after POI filter fix (Jan 2026)
    const cacheKey = generateCacheKey('activities:search:v5', { lat: roundedLat, lng: roundedLng, r: radius, t: type });

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
      // Cap radius at 2km for optimal performance
      // Even 1km returns 1000+ activities in major cities
      // API max is 20km but larger radius causes timeouts
      const effectiveRadius = Math.min(radius, 2);
      const result = await Promise.race([
        amadeusAPI.searchActivities({
          latitude,
          longitude,
          radius: effectiveRadius,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Amadeus timeout')), 20000))
      ]) as any;

      activities = result.data || [];
    } catch (error: any) {
      apiError = error.message;
      console.error('⚠️ Amadeus activities search failed:', error.message);
    }

    const responseTime = Date.now() - startTime;

    // CRITICAL: Filter out free POIs - only show bookable activities with prices
    // Amadeus returns both free attractions (churches, parks) and bookable tours
    // We only want bookable activities with actual prices
    if (activities.length > 0) {
      activities = activities.filter((a: any) => {
        const hasPrice = a.price?.amount && parseFloat(a.price.amount) > 0;
        return hasPrice;
      });
      console.log(`📋 After price filter: ${activities.length} bookable activities`);
    }

    // Filter by type (after we have results)
    // Broadened filter to catch more tour-like activities
    if (activities.length > 0) {
      if (type === 'tours') {
        const tourKeywords = [
          'tour', 'trip', 'excursion', 'guided', 'visit', 'experience',
          'adventure', 'cruise', 'snorkel', 'diving', 'cenote', 'ruins',
          'day trip', 'sunset', 'sunrise', 'safari', 'exploration', 'sightseeing',
          'discover', 'explore', 'journey', 'expedition', 'tasting', 'walking'
        ];
        activities = activities.filter((a: any) => {
          const name = (a.name || '').toLowerCase();
          const desc = (a.shortDescription || a.description || '').toLowerCase();
          return tourKeywords.some(kw => name.includes(kw) || desc.includes(kw));
        });
      } else if (type === 'activities') {
        // Activities = things that are NOT tours (classes, shows, tickets, etc.)
        const tourKeywords = ['tour', 'trip', 'excursion', 'guided'];
        activities = activities.filter((a: any) => {
          const name = (a.name || '').toLowerCase();
          return !tourKeywords.some(kw => name.includes(kw));
        });
      }
    }

    // Sort by: has image first, then by rating
    activities.sort((a: any, b: any) => {
      const aHasImage = a.pictures?.length > 0 ? 1 : 0;
      const bHasImage = b.pictures?.length > 0 ? 1 : 0;
      if (bHasImage !== aHasImage) return bHasImage - aHasImage;
      return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
    });

    /**
     * Apply markup: $35 minimum OR 35% whichever is higher
     * This is the Fly2Any margin applied to all activity bookings
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

    // Enrich activities with categories, markup, and synthetic engagement data
    const enrichedActivities = activities.map((activity: any) => {
      // First apply markup
      const withMarkup = applyMarkup(activity);

      const text = `${activity.name || ''} ${activity.shortDescription || ''} ${activity.description || ''}`.toLowerCase();
      const seed = (activity.id || '').charCodeAt(0) + (activity.id || '').length;

      // Auto-categorize based on content
      const categories: string[] = [];
      if (text.includes('tour') || text.includes('guided') || text.includes('excursion')) categories.push('Tours');
      if (text.includes('museum') || text.includes('gallery') || text.includes('art')) categories.push('Culture');
      if (text.includes('food') || text.includes('wine') || text.includes('tasting') || text.includes('culinary')) categories.push('Food & Drink');
      if (text.includes('adventure') || text.includes('snorkel') || text.includes('dive') || text.includes('zip')) categories.push('Adventure');
      if (text.includes('cruise') || text.includes('boat') || text.includes('sailing')) categories.push('Water Activities');
      if (text.includes('sunset') || text.includes('sunrise') || text.includes('romantic')) categories.push('Romantic');
      if (text.includes('family') || text.includes('kids') || text.includes('children')) categories.push('Family Friendly');
      if (categories.length === 0) categories.push('Experiences');

      return {
        ...withMarkup,
        categories,
        // Synthetic engagement data (consistent per activity ID)
        reviewCount: 50 + (seed % 200),
        bookingsToday: 3 + (seed % 12),
        spotsLeft: 4 + (seed % 8),
        isPopular: seed % 5 === 0,
        isBestSeller: seed % 7 === 0,
      };
    });

    const response = {
      success: true,
      data: enrichedActivities,
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
