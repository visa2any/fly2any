/**
 * Flight Search Analytics Logger
 *
 * Logs every flight search to Postgres for:
 * - Route popularity tracking
 * - Cache priority optimization
 * - User behavior ML
 * - Zero-cost calendar price crowdsourcing
 */

import { sql } from '@/lib/db/connection';
import { createHash } from 'crypto';

export interface FlightSearchLog {
  // Search parameters
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;

  // Passengers
  adults: number;
  children?: number;
  infants?: number;

  // Preferences
  cabinClass?: string;
  nonStop?: boolean;

  // Results
  resultsCount: number;
  lowestPrice?: number; // In cents
  highestPrice?: number;
  avgPrice?: number;
  currency?: string;

  // API metadata
  amadeusResults?: number;
  duffelResults?: number;
  apiResponseTimeMs?: number;
  cacheHit?: boolean;

  // User context
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;

  // Geo
  countryCode?: string;
  region?: string;
  timezone?: string;
}

export interface BookingConversion {
  searchId: string;
  bookedFlightId: string;
  bookingId: string;
  timeToBookSeconds: number;
}

/**
 * Hash IP address for privacy (GDPR compliance)
 */
function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

/**
 * Generate browser fingerprint (anonymized)
 */
function generateFingerprint(userAgent?: string, accept?: string): string {
  if (!userAgent) return 'unknown';

  const data = `${userAgent}|${accept || 'unknown'}`;
  return createHash('md5').update(data).digest('hex').substring(0, 32);
}

/**
 * Log flight search to Postgres
 */
export async function logFlightSearch(
  search: FlightSearchLog,
  request?: Request
): Promise<string | null> {
  try {
    // Hash IP for privacy
    const ipHash = search.ipAddress
      ? hashIP(search.ipAddress)
      : null;

    // Generate browser fingerprint
    const browserFingerprint = generateFingerprint(
      search.userAgent,
      request?.headers.get('accept') || undefined
    );

    // Insert search log
    const result = await sql`
      INSERT INTO flight_search_logs (
        origin,
        destination,
        departure_date,
        return_date,
        is_round_trip,
        adults,
        children,
        infants,
        cabin_class,
        non_stop,
        results_count,
        lowest_price,
        highest_price,
        avg_price,
        currency,
        amadeus_results,
        duffel_results,
        api_response_time_ms,
        cache_hit,
        user_id,
        session_id,
        ip_hash,
        browser_fingerprint,
        user_agent,
        referer,
        country_code,
        region,
        timezone
      ) VALUES (
        ${search.origin},
        ${search.destination},
        ${search.departureDate},
        ${search.returnDate || null},
        ${!!search.returnDate},
        ${search.adults},
        ${search.children || 0},
        ${search.infants || 0},
        ${search.cabinClass || null},
        ${search.nonStop || false},
        ${search.resultsCount},
        ${search.lowestPrice || null},
        ${search.highestPrice || null},
        ${search.avgPrice || null},
        ${search.currency || 'USD'},
        ${search.amadeusResults || 0},
        ${search.duffelResults || 0},
        ${search.apiResponseTimeMs || null},
        ${search.cacheHit || false},
        ${search.userId || null},
        ${search.sessionId || null},
        ${ipHash},
        ${browserFingerprint},
        ${search.userAgent || null},
        ${search.referer || null},
        ${search.countryCode || null},
        ${search.region || null},
        ${search.timezone || null}
      )
      RETURNING id
    `;

    const searchId = result[0]?.id;

    if (searchId) {
      console.log(`📊 Logged flight search: ${search.origin}→${search.destination} (${searchId})`);
    }

    return searchId;
  } catch (error) {
    // Don't block search if logging fails
    console.error('Failed to log flight search:', error);
    return null;
  }
}

/**
 * Update search log with booking conversion
 */
export async function logBookingConversion(
  conversion: BookingConversion
): Promise<void> {
  try {
    await sql`
      UPDATE flight_search_logs
      SET
        converted = true,
        booked_flight_id = ${conversion.bookedFlightId},
        booking_id = ${conversion.bookingId},
        time_to_book_seconds = ${conversion.timeToBookSeconds}
      WHERE id = ${conversion.searchId}
    `;

    console.log(`🎉 Logged booking conversion for search ${conversion.searchId}`);
  } catch (error) {
    console.error('Failed to log booking conversion:', error);
  }
}

/**
 * Get route popularity statistics
 */
export async function getRouteStatistics(route: string): Promise<{
  searches30d: number;
  searches7d: number;
  searches24h: number;
  conversionRate: number;
  avgPrice: number;
  cachePriority: number;
  recommendedTtl: number;
} | null> {
  try {
    const result = await sql`
      SELECT
        searches_30d,
        searches_7d,
        searches_24h,
        conversion_rate,
        avg_price,
        cache_priority,
        recommended_ttl_seconds
      FROM route_statistics
      WHERE route = ${route}
    `;

    if (result.length === 0) return null;

    return {
      searches30d: result[0].searches_30d || 0,
      searches7d: result[0].searches_7d || 0,
      searches24h: result[0].searches_24h || 0,
      conversionRate: parseFloat(result[0].conversion_rate || '0'),
      avgPrice: result[0].avg_price || 0,
      cachePriority: result[0].cache_priority || 0,
      recommendedTtl: result[0].recommended_ttl_seconds || 900,
    };
  } catch (error) {
    console.error('Failed to get route statistics:', error);
    return null;
  }
}

/**
 * Get popular routes (top N by search volume)
 */
export async function getPopularRoutes(limit: number = 50): Promise<{
  route: string;
  origin: string;
  destination: string;
  searches30d: number;
  avgPrice: number;
}[]> {
  try {
    const result = await sql`
      SELECT
        route,
        origin,
        destination,
        searches_30d,
        avg_price
      FROM route_statistics
      ORDER BY searches_30d DESC
      LIMIT ${limit}
    `;

    return result.map((row: any) => ({
      route: row.route,
      origin: row.origin,
      destination: row.destination,
      searches30d: row.searches_30d || 0,
      avgPrice: row.avg_price || 0,
    }));
  } catch (error) {
    console.error('Failed to get popular routes:', error);
    return [];
  }
}

/**
 * Update calendar cache coverage
 */
export async function updateCacheCoverage(
  route: string,
  date: string,
  cachedPrice: number,
  ttlSeconds: number,
  source: 'user-search' | 'pre-warm' | 'demo' = 'user-search'
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await sql`
      INSERT INTO calendar_cache_coverage (
        route,
        date,
        has_cache,
        cache_source,
        cached_price,
        cached_at,
        expires_at,
        ttl_seconds,
        searches_count
      ) VALUES (
        ${route},
        ${date},
        true,
        ${source},
        ${cachedPrice},
        NOW(),
        ${expiresAt.toISOString()},
        ${ttlSeconds},
        1
      )
      ON CONFLICT (route, date) DO UPDATE SET
        has_cache = true,
        cached_price = ${cachedPrice},
        cached_at = NOW(),
        expires_at = ${expiresAt.toISOString()},
        ttl_seconds = ${ttlSeconds},
        searches_count = calendar_cache_coverage.searches_count + 1,
        updated_at = NOW()
    `;

    console.log(`📅 Updated cache coverage: ${route} on ${date} = $${(cachedPrice / 100).toFixed(2)}`);
  } catch (error) {
    console.error('Failed to update cache coverage:', error);
  }
}

/**
 * Get cache coverage for a route
 */
export async function getCacheCoverage(
  route: string,
  startDate: string,
  endDate: string
): Promise<{
  date: string;
  hasCache: boolean;
  price: number | null;
  expiresAt: string | null;
}[]> {
  try {
    const result = await sql`
      SELECT
        date,
        has_cache,
        cached_price,
        expires_at
      FROM calendar_cache_coverage
      WHERE route = ${route}
        AND date >= ${startDate}::date
        AND date <= ${endDate}::date
      ORDER BY date ASC
    `;

    return result.map((row: any) => ({
      date: row.date,
      hasCache: row.has_cache || false,
      price: row.cached_price,
      expiresAt: row.expires_at,
    }));
  } catch (error) {
    console.error('Failed to get cache coverage:', error);
    return [];
  }
}
