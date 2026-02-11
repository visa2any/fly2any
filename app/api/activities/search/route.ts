import { NextRequest, NextResponse } from 'next/server';
import { amadeusAPI } from '@/lib/api/amadeus';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { handleApiError } from '@/lib/monitoring/global-error-handler';
import { GLOBAL_CITIES } from '@/lib/data/global-cities-database';

export const dynamic = 'force-dynamic';

// Build a fast lookup map from GLOBAL_CITIES for O(1) access
const CITY_LOOKUP = new Map<string, { lat: number; lng: number; country: string }>();

// Normalize string for matching (remove accents, lowercase)
function normalizeForLookup(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// Initialize lookup map from global database
for (const city of GLOBAL_CITIES) {
  const coords = { lat: city.location.lat, lng: city.location.lng, country: city.countryCode };
  CITY_LOOKUP.set(normalizeForLookup(city.name), coords);
  CITY_LOOKUP.set(normalizeForLookup(city.city), coords);
  CITY_LOOKUP.set(normalizeForLookup(city.id), coords);
  if (city.aliases) {
    for (const alias of city.aliases) {
      CITY_LOOKUP.set(normalizeForLookup(alias), coords);
    }
  }
}

/**
 * Get coordinates from city query
 */
function getCityCoordinates(query: string): { lat: number; lng: number; country: string } | null {
  const normalized = normalizeForLookup(query);
  if (CITY_LOOKUP.has(normalized)) return CITY_LOOKUP.get(normalized)!;

  const globalMatch = GLOBAL_CITIES.find(city => {
    const cityName = normalizeForLookup(city.name);
    const cityCity = normalizeForLookup(city.city);
    if (normalized.length >= 4) {
      if (cityName.includes(normalized) || normalized.includes(cityName) ||
          cityCity.includes(normalized) || normalized.includes(cityCity)) {
        return true;
      }
    }
    return false;
  });

  if (globalMatch) {
    return {
      lat: globalMatch.location.lat,
      lng: globalMatch.location.lng,
      country: globalMatch.countryCode,
    };
  }
  return null;
}

/**
 * Geocode unknown cities using Nominatim
 */
async function geocodeCity(query: string): Promise<{ lat: number; lng: number; country: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Fly2Any Travel Platform (contact@fly2any.com)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || data.length === 0) return null;
    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      country: result.address?.country_code?.toUpperCase() || 'XX',
    };
  } catch (error) {
    return null;
  }
}

/**
 * Activities Search API - OPTIMIZED with caching
 * Uses Amadeus Tours & Activities API
 * Cache: 4 hours (activities don't change frequently)
 * Performance: 15s timeout, empty result caching
 */
export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    let latitude = parseFloat(searchParams.get('latitude') || '0');
    let longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseInt(searchParams.get('radius') || '20');
    const type = searchParams.get('type') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50); // Default 12, max 50
    const offset = parseInt(searchParams.get('offset') || '0');

    // Resolve query to coordinates if lat/lng missing
    if ((!latitude || !longitude) && query) {
      const cityCoords = getCityCoordinates(query);
      if (cityCoords) {
        latitude = cityCoords.lat;
        longitude = cityCoords.lng;
      } else {
        const geocoded = await geocodeCity(query);
        if (geocoded) {
          latitude = geocoded.lat;
          longitude = geocoded.lng;
        }
      }
    }

    if (!latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'latitude and longitude (or a valid city query) required',
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
    // Cache stores full enriched results, we paginate from cache
    const cached = await getCached<any[]>(cacheKey);
    if (cached) {
      const totalCount = cached.length;
      const paginatedFromCache = cached.slice(offset, offset + limit);
      return NextResponse.json({
        success: true,
        data: paginatedFromCache,
        meta: {
          count: paginatedFromCache.length,
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
          type,
          location: { latitude, longitude, radius },
          responseTime: '< 50ms',
          cached: true
        }
      }, {
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

      // Check if Amadeus returned an error (graceful degradation in API means we get { data: [], error: '...' })
      if (result.error) {
        throw new Error(result.error);
      }

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

    // Apply pagination AFTER all filtering/enrichment
    const totalCount = enrichedActivities.length;
    const paginatedActivities = enrichedActivities.slice(offset, offset + limit);

    const response = {
      success: true,
      data: paginatedActivities,
      meta: {
        count: paginatedActivities.length,
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
        type,
        location: { latitude, longitude, radius },
        responseTime: `${responseTime}ms`,
        message: totalCount === 0
          ? (apiError ? 'Activities search temporarily unavailable.' : 'No activities found for this location.')
          : undefined
      }
    };

    // Cache FULL enriched results for 4 hours (or 5 min for empty, 30s for error)
    // Pagination is applied at response time, not cache time
    // PERFORMANCE FIX: When API error occurs, use very short TTL (30s) to allow quick recovery
    // Previously cached errors for 300s, blocking Rome activities for 5 minutes
    const cacheTTL = enrichedActivities.length > 0 ? 14400 : (apiError ? 30 : 300);
    await setCache(cacheKey, enrichedActivities, cacheTTL);
    console.log(`✅ Found ${totalCount} ${type} (returning ${paginatedActivities.length}) in ${responseTime}ms - cached for ${cacheTTL}s${apiError ? ' ⚠️ API error' : ''}`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time': `${responseTime}ms`,
        'Cache-Control': `public, max-age=${cacheTTL}`
      }
    });
  }, { category: 'external_api' as any, severity: 'normal' as any });
}
