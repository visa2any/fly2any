import { NextRequest, NextResponse } from 'next/server';
import { getCached, generateCacheKey } from '@/lib/cache/helpers';

// Mark this route as dynamic (it uses request params)
export const dynamic = 'force-dynamic';

// Helper function to extract airport code from various formats
function extractAirportCode(value: string | null): string {
  if (!value) return '';

  const trimmed = value.trim();

  // Handle comma-separated codes (extract first code only)
  if (trimmed.includes(',')) {
    const firstCode = trimmed.split(',')[0].trim();
    return extractAirportCode(firstCode); // Recursively process first code
  }

  // If already a 3-letter code, return as-is
  if (/^[A-Z]{3}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Extract code from formats like "New York (JFK)" or "JFK - New York"
  const codeMatch = trimmed.match(/\(([A-Z]{3})\)|^([A-Z]{3})\s*-/i);
  if (codeMatch) {
    return (codeMatch[1] || codeMatch[2]).toUpperCase();
  }

  // Return original if no pattern matches
  return trimmed.toUpperCase();
}

export async function GET(request: NextRequest) {
  // Declare variables outside try-catch so they're accessible in error handling
  let origin: string | null = null;
  let destination: string | null = null;
  let cacheKey: string = '';

  try {
    const { searchParams } = new URL(request.url);

    const originParam = searchParams.get('origin');
    const destinationParam = searchParams.get('destination');

    // Extract clean airport codes
    origin = extractAirportCode(originParam);
    destination = extractAirportCode(destinationParam);

    console.log('📍 Cheapest-dates API - Code extraction:', {
      originParam,
      extractedOrigin: origin,
      destinationParam,
      extractedDestination: destination
    });

    const departureDate = searchParams.get('departureDate');
    const oneWay = searchParams.get('oneWay');
    const duration = searchParams.get('duration');
    const nonStop = searchParams.get('nonStop');
    const maxPrice = searchParams.get('maxPrice');
    const viewBy = searchParams.get('viewBy');

    // Support flexible date range queries
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const daysAhead = searchParams.get('daysAhead'); // Default: 365 for broader coverage

    // Validate extracted codes
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    if (origin.length !== 3 || destination.length !== 3) {
      return NextResponse.json(
        {
          error: 'Invalid airport code format',
          details: `Origin: "${origin}" (${origin.length} chars), Destination: "${destination}" (${destination.length} chars). Expected 3-letter codes.`
        },
        { status: 400 }
      );
    }

    // 📅 Lookup cached prices from actual flight searches
    // Determine date range to check
    const today = new Date();
    let startDate = today;
    let totalDays = 30; // Default to 30 days (1 month) - optimized for fast calendar display

    // If specific date range provided, use it
    if (startDateParam) {
      startDate = new Date(startDateParam);
    }
    if (endDateParam) {
      const endDate = new Date(endDateParam);
      totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    } else if (daysAhead) {
      totalDays = parseInt(daysAhead);
    }

    // Cap at 365 days to prevent excessive queries
    totalDays = Math.min(totalDays, 365);

    const pricesData: any[] = [];
    const pricesMap: { [date: string]: number } = {};

    console.log('📅 Looking up cached calendar prices for', `${origin} → ${destination}`, `(checking ${totalDays} days)`);

    // Early exit tracker - stop checking if no prices found
    let consecutiveMisses = 0;
    const MAX_CONSECUTIVE_MISSES = 30; // Stop after 30 days with no data

    // Check cached prices for the specified date range
    for (let i = 0; i < totalDays; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];

      // Lookup price for this date (forward direction)
      const priceCacheKey = generateCacheKey('calendar-price', {
        origin,
        destination,
        date: dateStr,
      });

      const cachedPrice = await getCached<any>(priceCacheKey);
      let foundPrice = false;

      if (cachedPrice && cachedPrice.price) {
        pricesData.push({
          type: 'flight-date',
          origin,
          destination,
          departureDate: dateStr,
          price: {
            total: cachedPrice.price.toFixed(2),
            currency: cachedPrice.currency || 'USD',
          },
          cached: true,
          cachedAt: cachedPrice.timestamp,
        });
        pricesMap[dateStr] = cachedPrice.price;
        foundPrice = true;
        consecutiveMisses = 0; // Reset counter
      }

      // ALSO check reverse direction (for return flights)
      const reverseCacheKey = generateCacheKey('calendar-price', {
        origin: destination,
        destination: origin,
        date: dateStr,
      });

      const reverseCachedPrice = await getCached<any>(reverseCacheKey);

      if (reverseCachedPrice && reverseCachedPrice.price) {
        if (!pricesMap[dateStr]) {
          pricesData.push({
            type: 'flight-date',
            origin: destination,
            destination: origin,
            departureDate: dateStr,
            price: {
              total: reverseCachedPrice.price.toFixed(2),
              currency: reverseCachedPrice.currency || 'USD',
            },
            cached: true,
            cachedAt: reverseCachedPrice.timestamp,
            isReturn: true,
          });
          pricesMap[dateStr] = reverseCachedPrice.price;
          foundPrice = true;
          consecutiveMisses = 0;
        }
      }

      // Track consecutive misses for early exit
      if (!foundPrice) {
        consecutiveMisses++;

        // Early exit if no prices found for extended period
        if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES && Object.keys(pricesMap).length === 0) {
          console.log(`📅 Early exit: No prices found in first ${MAX_CONSECUTIVE_MISSES} days`);
          break;
        }
      }
    }

    console.log('📅 Found cached prices for', Object.keys(pricesMap).length, 'dates');

    const result = {
      data: pricesData,
      meta: {
        count: pricesData.length,
        route: `${origin} → ${destination}`,
        daysChecked: totalDays,
        dateRange: `${startDate.toISOString().split('T')[0]} to ${new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
        source: 'cached-searches',
        note: 'Prices from actual user searches. Only searched dates shown.',
      },
      prices: pricesMap, // Simple map for easy lookup: { "2025-11-05": 99 }
    };

    // Cache the API response for 5 minutes to prevent duplicate lookups
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Cache-Source': 'calendar-prices',
      },
    });
  } catch (error: any) {
    console.error('Error looking up calendar prices:', error);

    // Return empty result on error (no cached prices found)
    return NextResponse.json(
      {
        data: [],
        meta: {
          count: 0,
          route: origin && destination ? `${origin} → ${destination}` : 'unknown',
          source: 'cached-searches',
          note: 'No cached prices available for this route yet.',
        },
        prices: {},
      },
      { status: 200 }
    );
  }
}
