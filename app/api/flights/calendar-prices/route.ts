import { NextRequest, NextResponse } from 'next/server';
import { getCached, generateCacheKey } from '@/lib/cache/helpers';
import { calculateOptimalTTL } from '@/lib/cache/seasonal-ttl';
import { getRouteStatistics } from '@/lib/analytics/search-logger';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

interface DatePrice {
  date: string; // YYYY-MM-DD
  price: number; // USD
  available: boolean;
  isWeekend: boolean;
  isCheapest: boolean;
  approximate: boolean; // Indicates if this is from crowdsourced approximation
  cached: boolean;
  cachedAt?: string;
}

interface PriceCalendarData {
  dates: DatePrice[];
  cheapestDate: string | null;
  averagePrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  currency: string;
  route: string;
  coverage: {
    total: number;
    cached: number;
    approximate: number;
    percentage: number;
  };
}

/**
 * Helper function to extract airport code from various formats
 */
function extractAirportCode(value: string | null): string {
  if (!value) return '';

  const trimmed = value.trim();

  // Handle comma-separated codes (extract first code only)
  if (trimmed.includes(',')) {
    const firstCode = trimmed.split(',')[0].trim();
    return extractAirportCode(firstCode);
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

  return trimmed.toUpperCase();
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * GET /api/flights/calendar-prices
 *
 * Returns price data for a date range around a center date.
 * Uses cached prices from actual user searches (zero-cost crowdsourcing).
 *
 * Query params:
 *  - origin: Airport code (e.g., JFK)
 *  - destination: Airport code (e.g., LAX)
 *  - centerDate: Center date (YYYY-MM-DD)
 *  - range: Number of days before/after center date (default: 15)
 *  - adults: Number of adults (default: 1)
 *  - cabinClass: Cabin class (economy, premium, business, first)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    // Extract and validate parameters
    const originParam = searchParams.get('origin');
    const destinationParam = searchParams.get('destination');
    const centerDateParam = searchParams.get('centerDate');
    const rangeParam = searchParams.get('range');
    const adultsParam = searchParams.get('adults');
    const cabinClassParam = searchParams.get('cabinClass');

    // Extract clean airport codes
    const origin = extractAirportCode(originParam);
    const destination = extractAirportCode(destinationParam);

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
          details: `Expected 3-letter codes. Got: origin="${origin}", destination="${destination}"`
        },
        { status: 400 }
      );
    }

    // Parse center date (default to today if not provided)
    const centerDate = centerDateParam ? new Date(centerDateParam) : new Date();
    centerDate.setHours(0, 0, 0, 0);

    // Validate center date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (centerDate < today) {
      return NextResponse.json(
        { error: 'Center date cannot be in the past' },
        { status: 400 }
      );
    }

    // Parse range (default: 15 days)
    const range = rangeParam ? Math.min(parseInt(rangeParam), 30) : 15; // Cap at 30 days
    const adults = adultsParam ? parseInt(adultsParam) : 1;
    const cabinClass = cabinClassParam || 'economy';

    const routeKey = `${origin}-${destination}`;

    console.log('📅 Calendar Prices API:', {
      route: routeKey,
      centerDate: centerDate.toISOString().split('T')[0],
      range,
      adults,
      cabinClass
    });

    // Generate date range: centerDate ±range days
    const startDate = new Date(centerDate);
    startDate.setDate(centerDate.getDate() - range);

    const endDate = new Date(centerDate);
    endDate.setDate(centerDate.getDate() + range);

    const totalDays = range * 2 + 1; // -range to +range, inclusive

    const dates: DatePrice[] = [];
    const prices: number[] = [];
    let cachedCount = 0;
    let approximateCount = 0;

    // Lookup cached prices for each date in the range
    for (let i = 0; i < totalDays; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];

      // Skip dates in the past
      if (checkDate < today) {
        continue;
      }

      // Lookup cached price
      const priceCacheKey = generateCacheKey('calendar-price', {
        origin,
        destination,
        date: dateStr,
      });

      const cachedPrice = await getCached<any>(priceCacheKey);

      if (cachedPrice && cachedPrice.price) {
        const price = parseFloat(cachedPrice.price);
        prices.push(price);
        cachedCount++;

        if (cachedPrice.approximate) {
          approximateCount++;
        }

        dates.push({
          date: dateStr,
          price,
          available: true,
          isWeekend: isWeekend(checkDate),
          isCheapest: false, // Will be updated after we find the min
          approximate: cachedPrice.approximate || false,
          cached: true,
          cachedAt: cachedPrice.timestamp,
        });
      } else {
        // No cached price available
        dates.push({
          date: dateStr,
          price: 0,
          available: false,
          isWeekend: isWeekend(checkDate),
          isCheapest: false,
          approximate: false,
          cached: false,
        });
      }
    }

    // Calculate statistics
    const availableDates = dates.filter(d => d.available);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
    const averagePrice = prices.length > 0
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : null;

    // Mark cheapest date(s)
    if (minPrice !== null) {
      dates.forEach(date => {
        if (date.available && date.price === minPrice) {
          date.isCheapest = true;
        }
      });
    }

    // Find cheapest date
    const cheapestDate = availableDates.length > 0
      ? availableDates.reduce((min, d) => d.price < min.price ? d : min).date
      : null;

    const coverage = {
      total: totalDays - (startDate < today ? Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0),
      cached: cachedCount,
      approximate: approximateCount,
      percentage: cachedCount > 0 ? (cachedCount / totalDays * 100) : 0,
    };

    const response: PriceCalendarData = {
      dates,
      cheapestDate,
      averagePrice: averagePrice !== null ? Math.round(averagePrice * 100) / 100 : null,
      minPrice,
      maxPrice,
      currency: 'USD',
      route: routeKey,
      coverage,
    };

    const duration = Date.now() - startTime;

    console.log('✅ Calendar Prices:', {
      route: routeKey,
      range: `${range * 2 + 1} days`,
      coverage: `${cachedCount}/${totalDays} (${coverage.percentage.toFixed(1)}%)`,
      approximate: approximateCount,
      cheapest: cheapestDate ? `$${minPrice} on ${cheapestDate}` : 'N/A',
      duration: `${duration}ms`,
    });

    // Cache the response for 5 minutes
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Calendar-Coverage': `${coverage.percentage.toFixed(1)}%`,
        'X-Calendar-Cached': cachedCount.toString(),
        'X-Response-Time': `${duration}ms`,
      },
    });

  } catch (error: any) {
    console.error('Error fetching calendar prices:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch calendar prices',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
