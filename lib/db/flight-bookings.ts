/**
 * Flight Bookings Database Queries
 * Production-ready functions for querying flight booking counts and trends
 */

import { getSql } from './connection';

// ============================================
// TYPES AND INTERFACES
// ============================================

export interface FlightBookingCount {
  flightId: string;
  bookingsToday: number;
  bookingsYesterday: number;
  trend: 'rising' | 'steady' | 'falling';
  totalPassengers: number;
  avgPrice: number;
}

export interface RouteBookingStats {
  routeKey: string;
  bookingsToday: number;
  trend: 'rising' | 'steady' | 'falling';
}

export interface PopularFlight {
  flightId: string;
  routeKey: string;
  carrierCode: string;
  bookings: number;
  passengers: number;
  avgPrice: number;
}

// ============================================
// BOOKING COUNT QUERIES
// ============================================

/**
 * Get booking count for a specific flight in the last 24 hours
 * Uses optimized index: idx_flight_bookings_id_date
 *
 * @param flightId - Unique flight identifier
 * @returns Number of confirmed bookings in last 24 hours
 */
export async function getBookingsToday(flightId: string): Promise<number> {
  const sql = getSql();

  if (!sql) {
    console.warn('Database not configured');
    return 0;
  }

  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM flight_bookings
      WHERE flight_id = ${flightId}
        AND booking_date >= NOW() - INTERVAL '24 hours'
        AND status = 'confirmed'
    `;

    return parseInt(result[0]?.count || '0');
  } catch (error) {
    console.error('Error fetching bookings today:', error);
    return 0;
  }
}

/**
 * Get booking count for yesterday (24-48 hours ago)
 *
 * @param flightId - Unique flight identifier
 * @returns Number of confirmed bookings yesterday
 */
export async function getBookingsYesterday(flightId: string): Promise<number> {
  const sql = getSql();

  if (!sql) {
    console.warn('Database not configured');
    return 0;
  }

  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM flight_bookings
      WHERE flight_id = ${flightId}
        AND booking_date >= NOW() - INTERVAL '48 hours'
        AND booking_date < NOW() - INTERVAL '24 hours'
        AND status = 'confirmed'
    `;

    return parseInt(result[0]?.count || '0');
  } catch (error) {
    console.error('Error fetching bookings yesterday:', error);
    return 0;
  }
}

/**
 * Get booking trend by comparing today vs yesterday
 *
 * @param flightId - Unique flight identifier
 * @returns Trend indicator: 'rising' | 'steady' | 'falling'
 */
export async function getBookingsTrend(flightId: string): Promise<'rising' | 'steady' | 'falling'> {
  try {
    const today = await getBookingsToday(flightId);
    const yesterday = await getBookingsYesterday(flightId);

    // Calculate percentage change
    if (yesterday === 0 && today === 0) return 'steady';
    if (yesterday === 0 && today > 0) return 'rising';
    if (today === 0 && yesterday > 0) return 'falling';

    const percentageChange = ((today - yesterday) / yesterday) * 100;

    // Thresholds for trend classification
    if (percentageChange > 20) return 'rising';
    if (percentageChange < -20) return 'falling';
    return 'steady';
  } catch (error) {
    console.error('Error calculating booking trend:', error);
    return 'steady';
  }
}

/**
 * Get complete booking statistics for a flight
 * Optimized single query with aggregations
 *
 * @param flightId - Unique flight identifier
 * @returns Complete booking count object with trend
 */
export async function getFlightBookingStats(flightId: string): Promise<FlightBookingCount> {
  const sql = getSql();

  if (!sql) {
    console.warn('Database not configured');
    return {
      flightId,
      bookingsToday: 0,
      bookingsYesterday: 0,
      trend: 'steady',
      totalPassengers: 0,
      avgPrice: 0,
    };
  }

  try {
    // Single optimized query for all stats
    const result = await sql`
      SELECT
        ${flightId} as flight_id,
        -- Today's bookings
        COUNT(*) FILTER (
          WHERE booking_date >= NOW() - INTERVAL '24 hours'
        ) as bookings_today,
        -- Yesterday's bookings
        COUNT(*) FILTER (
          WHERE booking_date >= NOW() - INTERVAL '48 hours'
          AND booking_date < NOW() - INTERVAL '24 hours'
        ) as bookings_yesterday,
        -- Total passengers today
        COALESCE(SUM(passenger_count) FILTER (
          WHERE booking_date >= NOW() - INTERVAL '24 hours'
        ), 0) as total_passengers,
        -- Average price today
        COALESCE(AVG(total_amount) FILTER (
          WHERE booking_date >= NOW() - INTERVAL '24 hours'
        ), 0) as avg_price
      FROM flight_bookings
      WHERE flight_id = ${flightId}
        AND booking_date >= NOW() - INTERVAL '48 hours'
        AND status = 'confirmed'
    `;

    const row = result[0];
    const bookingsToday = parseInt(row?.bookings_today || '0');
    const bookingsYesterday = parseInt(row?.bookings_yesterday || '0');

    // Calculate trend
    let trend: 'rising' | 'steady' | 'falling' = 'steady';
    if (bookingsYesterday === 0 && bookingsToday > 0) {
      trend = 'rising';
    } else if (bookingsYesterday > 0) {
      const percentageChange = ((bookingsToday - bookingsYesterday) / bookingsYesterday) * 100;
      if (percentageChange > 20) trend = 'rising';
      else if (percentageChange < -20) trend = 'falling';
    }

    return {
      flightId,
      bookingsToday,
      bookingsYesterday,
      trend,
      totalPassengers: parseInt(row?.total_passengers || '0'),
      avgPrice: parseFloat(row?.avg_price || '0'),
    };
  } catch (error) {
    console.error('Error fetching flight booking stats:', error);
    return {
      flightId,
      bookingsToday: 0,
      bookingsYesterday: 0,
      trend: 'steady',
      totalPassengers: 0,
      avgPrice: 0,
    };
  }
}

// ============================================
// BATCH QUERIES (for multiple flights)
// ============================================

/**
 * Get booking counts for multiple flights in a single query
 * Highly optimized for rendering flight lists
 *
 * @param flightIds - Array of flight identifiers
 * @returns Map of flightId to booking count
 */
export async function getBatchBookingCounts(
  flightIds: string[]
): Promise<Map<string, number>> {
  const sql = getSql();

  if (!sql) {
    console.warn('Database not configured');
    return new Map();
  }

  try {
    if (flightIds.length === 0) return new Map();

    const result = await sql`
      SELECT
        flight_id,
        COUNT(*) as count
      FROM flight_bookings
      WHERE flight_id = ANY(${flightIds})
        AND booking_date >= NOW() - INTERVAL '24 hours'
        AND status = 'confirmed'
      GROUP BY flight_id
    `;

    const countsMap = new Map<string, number>();
    result.forEach((row: any) => {
      countsMap.set(row.flight_id, parseInt(row.count));
    });

    return countsMap;
  } catch (error) {
    console.error('Error fetching batch booking counts:', error);
    return new Map();
  }
}

/**
 * Get complete booking stats for multiple flights
 * Most efficient for bulk operations
 *
 * @param flightIds - Array of flight identifiers
 * @returns Map of flightId to FlightBookingCount
 */
export async function getBatchBookingStats(
  flightIds: string[]
): Promise<Map<string, FlightBookingCount>> {
  const sql = getSql();

  if (!sql) {
    console.warn('Database not configured');
    return new Map();
  }

  try {
    if (flightIds.length === 0) return new Map();

    const result = await sql`
      SELECT
        flight_id,
        -- Today's bookings
        COUNT(*) FILTER (
          WHERE booking_date >= NOW() - INTERVAL '24 hours'
        ) as bookings_today,
        -- Yesterday's bookings
        COUNT(*) FILTER (
          WHERE booking_date >= NOW() - INTERVAL '48 hours'
          AND booking_date < NOW() - INTERVAL '24 hours'
        ) as bookings_yesterday,
        -- Passengers today
        COALESCE(SUM(passenger_count) FILTER (
          WHERE booking_date >= NOW() - INTERVAL '24 hours'
        ), 0) as total_passengers,
        -- Avg price today
        COALESCE(AVG(total_amount) FILTER (
          WHERE booking_date >= NOW() - INTERVAL '24 hours'
        ), 0) as avg_price
      FROM flight_bookings
      WHERE flight_id = ANY(${flightIds})
        AND booking_date >= NOW() - INTERVAL '48 hours'
        AND status = 'confirmed'
      GROUP BY flight_id
    `;

    const statsMap = new Map<string, FlightBookingCount>();

    result.forEach((row: any) => {
      const bookingsToday = parseInt(row.bookings_today || '0');
      const bookingsYesterday = parseInt(row.bookings_yesterday || '0');

      // Calculate trend
      let trend: 'rising' | 'steady' | 'falling' = 'steady';
      if (bookingsYesterday === 0 && bookingsToday > 0) {
        trend = 'rising';
      } else if (bookingsYesterday > 0) {
        const percentageChange = ((bookingsToday - bookingsYesterday) / bookingsYesterday) * 100;
        if (percentageChange > 20) trend = 'rising';
        else if (percentageChange < -20) trend = 'falling';
      }

      statsMap.set(row.flight_id, {
        flightId: row.flight_id,
        bookingsToday,
        bookingsYesterday,
        trend,
        totalPassengers: parseInt(row.total_passengers || '0'),
        avgPrice: parseFloat(row.avg_price || '0'),
      });
    });

    return statsMap;
  } catch (error) {
    console.error('Error fetching batch booking stats:', error);
    return new Map();
  }
}

// ============================================
// ROUTE-BASED QUERIES
// ============================================

/**
 * Get booking statistics for a route (origin-destination)
 * Useful for estimating bookings when specific flight data unavailable
 *
 * @param routeKey - Route identifier (e.g., "JFK-LAX")
 * @returns Route booking statistics
 */
export async function getRouteBookingStats(routeKey: string): Promise<RouteBookingStats> {
  const sql = getSql();

  if (!sql) {
    console.warn('Database not configured');
    return {
      routeKey,
      bookingsToday: 0,
      trend: 'steady',
    };
  }

  try {
    const result = await sql`
      SELECT
        ${routeKey} as route_key,
        COUNT(*) FILTER (
          WHERE booking_date >= NOW() - INTERVAL '24 hours'
        ) as bookings_today,
        COUNT(*) FILTER (
          WHERE booking_date >= NOW() - INTERVAL '48 hours'
          AND booking_date < NOW() - INTERVAL '24 hours'
        ) as bookings_yesterday
      FROM flight_bookings
      WHERE route_key = ${routeKey}
        AND booking_date >= NOW() - INTERVAL '48 hours'
        AND status = 'confirmed'
    `;

    const row = result[0];
    const bookingsToday = parseInt(row?.bookings_today || '0');
    const bookingsYesterday = parseInt(row?.bookings_yesterday || '0');

    // Calculate trend
    let trend: 'rising' | 'steady' | 'falling' = 'steady';
    if (bookingsYesterday === 0 && bookingsToday > 0) {
      trend = 'rising';
    } else if (bookingsYesterday > 0) {
      const percentageChange = ((bookingsToday - bookingsYesterday) / bookingsYesterday) * 100;
      if (percentageChange > 20) trend = 'rising';
      else if (percentageChange < -20) trend = 'falling';
    }

    return {
      routeKey,
      bookingsToday,
      trend,
    };
  } catch (error) {
    console.error('Error fetching route booking stats:', error);
    return {
      routeKey,
      bookingsToday: 0,
      trend: 'steady',
    };
  }
}

// ============================================
// POPULAR FLIGHTS QUERIES
// ============================================

/**
 * Get top N most booked flights in the last 24 hours
 * Useful for "Popular Now" features
 *
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of popular flights with booking counts
 */
export async function getPopularFlights(limit: number = 10): Promise<PopularFlight[]> {
  const sql = getSql();

  if (!sql) {
    console.warn('Database not configured');
    return [];
  }

  try {
    const result = await sql`
      SELECT
        flight_id,
        route_key,
        carrier_code,
        COUNT(*) as bookings,
        SUM(passenger_count) as passengers,
        AVG(total_amount) as avg_price
      FROM flight_bookings
      WHERE booking_date >= NOW() - INTERVAL '24 hours'
        AND status = 'confirmed'
      GROUP BY flight_id, route_key, carrier_code
      ORDER BY bookings DESC
      LIMIT ${limit}
    `;

    return result.map((row: any) => ({
      flightId: row.flight_id,
      routeKey: row.route_key,
      carrierCode: row.carrier_code,
      bookings: parseInt(row.bookings),
      passengers: parseInt(row.passengers || '0'),
      avgPrice: parseFloat(row.avg_price || '0'),
    }));
  } catch (error) {
    console.error('Error fetching popular flights:', error);
    return [];
  }
}

// ============================================
// ESTIMATION FUNCTIONS (Fallback)
// ============================================

/**
 * Estimate booking count when database is unavailable
 * Uses intelligent heuristics based on route popularity and flight attributes
 *
 * @param params - Flight attributes for estimation
 * @returns Estimated booking count
 */
export function estimateBookingCount(params: {
  routeKey: string;
  seatsLeft: number;
  daysUntilDeparture: number;
  isDirect: boolean;
  price: number;
  averageRoutePrice?: number;
}): number {
  const {
    routeKey,
    seatsLeft,
    daysUntilDeparture,
    isDirect,
    price,
    averageRoutePrice,
  } = params;

  // Base booking count by route popularity
  const popularRoutes = [
    'JFK-LAX', 'LAX-JFK', 'LHR-JFK', 'JFK-LHR',
    'DXB-LHR', 'LHR-DXB', 'SIN-HKG', 'HKG-SIN',
  ];
  const isPopularRoute = popularRoutes.includes(routeKey);
  let baseBookings = isPopularRoute ? 80 : 50;

  // Adjust for route popularity (30 points)
  const routeMultiplier = isPopularRoute ? 1.6 : 1.0;
  baseBookings *= routeMultiplier;

  // Adjust for urgency (days until departure)
  let timeMultiplier = 1.0;
  if (daysUntilDeparture <= 3) {
    timeMultiplier = 1.8; // Last-minute bookings surge
  } else if (daysUntilDeparture <= 7) {
    timeMultiplier = 1.5;
  } else if (daysUntilDeparture <= 14) {
    timeMultiplier = 1.2;
  }

  // Adjust for scarcity (seats left)
  let scarcityMultiplier = 1.0;
  if (seatsLeft <= 3) {
    scarcityMultiplier = 1.5; // High demand
  } else if (seatsLeft <= 5) {
    scarcityMultiplier = 1.3;
  } else if (seatsLeft <= 7) {
    scarcityMultiplier = 1.15;
  }

  // Adjust for direct flights (more popular)
  const directMultiplier = isDirect ? 1.3 : 1.0;

  // Adjust for price competitiveness
  let priceMultiplier = 1.0;
  if (averageRoutePrice && averageRoutePrice > 0) {
    const priceRatio = price / averageRoutePrice;
    if (priceRatio < 0.8) {
      priceMultiplier = 1.4; // Very competitive price
    } else if (priceRatio < 0.9) {
      priceMultiplier = 1.2; // Good price
    } else if (priceRatio > 1.2) {
      priceMultiplier = 0.7; // Expensive
    }
  }

  // Calculate final estimate
  const estimatedBookings = Math.round(
    baseBookings * timeMultiplier * scarcityMultiplier * directMultiplier * priceMultiplier
  );

  // Clamp between realistic bounds
  return Math.max(20, Math.min(estimatedBookings, 250));
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create route key from airport codes
 *
 * @param origin - Origin IATA code
 * @param destination - Destination IATA code
 * @returns Route key (e.g., "JFK-LAX")
 */
export function createRouteKey(origin: string, destination: string): string {
  return `${origin.toUpperCase()}-${destination.toUpperCase()}`;
}

/**
 * Calculate days until departure
 *
 * @param departureDate - ISO date string
 * @returns Number of days until departure
 */
export function getDaysUntilDeparture(departureDate: string): number {
  const now = new Date();
  const departure = new Date(departureDate);
  const diffTime = departure.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
