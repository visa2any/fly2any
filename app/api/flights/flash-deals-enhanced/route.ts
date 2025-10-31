import { NextRequest, NextResponse } from 'next/server';
import { duffelAPI } from '@/lib/api/duffel';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { calculateValueScore } from '@/lib/ml/value-scorer';
import { AIRLINES } from '@/lib/data/airlines';

// Changed from 'edge' to 'nodejs' - Duffel SDK requires Node.js runtime
export const runtime = 'nodejs';

// Popular international routes for flash deals
const FLASH_DEAL_ROUTES = [
  { from: 'BOS', to: 'BCN', typical: 650 },
  { from: 'ORD', to: 'AMS', typical: 700 },
  { from: 'SEA', to: 'LHR', typical: 750 },
  { from: 'MIA', to: 'MAD', typical: 580 },
  { from: 'LAX', to: 'CDG', typical: 720 },
  { from: 'JFK', to: 'FCO', typical: 680 },
  { from: 'SFO', to: 'NRT', typical: 850 },
  { from: 'DFW', to: 'FRA', typical: 690 },
];

// Urgency types for deals
const URGENCY_TYPES = ['low-seats', 'high-demand', 'rising-price'] as const;
type UrgencyType = typeof URGENCY_TYPES[number];

interface FlashDeal {
  id: string;
  from: string;
  to: string;
  price: number;
  originalPrice: number;
  savings: number;
  savingsPercent: number;
  valueScore: number;
  carrier: string;
  carrierName: string;
  departureDate: string;
  returnDate?: string;
  expiresAt: string;
  timeRemaining: string;
  urgency: UrgencyType;
  urgencyValue?: number;
  viewersLast24h: number;
  bookingsLast24h: number;
  badges: string[];
}

/**
 * Calculate time remaining from expiration timestamp
 */
function calculateTimeRemaining(expiresAt: string): string {
  const now = new Date().getTime();
  const expires = new Date(expiresAt).getTime();
  const diff = expires - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Generate realistic urgency indicators
 */
function generateUrgencyIndicators(
  price: number,
  savingsPercent: number,
  routeIndex: number
): {
  urgency: UrgencyType;
  urgencyValue?: number;
  viewersLast24h: number;
  bookingsLast24h: number;
} {
  // Use route index and price as seed for deterministic randomness
  const seed = (routeIndex * 100 + price) % 100;

  let urgency: UrgencyType;
  let urgencyValue: number | undefined;

  // Higher savings = more likely to be high-demand or low-seats
  if (savingsPercent > 40) {
    urgency = seed % 2 === 0 ? 'low-seats' : 'high-demand';
    if (urgency === 'low-seats') {
      urgencyValue = 3 + (seed % 5); // 3-7 seats left
    }
  } else if (savingsPercent > 30) {
    urgency = seed % 3 === 0 ? 'low-seats' : seed % 3 === 1 ? 'high-demand' : 'rising-price';
    if (urgency === 'low-seats') {
      urgencyValue = 5 + (seed % 8); // 5-12 seats left
    }
  } else {
    urgency = 'rising-price';
  }

  // Generate social proof numbers
  const baseViewers = 150 + (seed * 50);
  const baseBookings = 8 + Math.floor(seed / 10);

  // More aggressive deals get more views and bookings
  const multiplier = 1 + (savingsPercent / 100);
  const viewersLast24h = Math.floor(baseViewers * multiplier);
  const bookingsLast24h = Math.floor(baseBookings * multiplier);

  return {
    urgency,
    urgencyValue,
    viewersLast24h,
    bookingsLast24h,
  };
}

/**
 * Generate badges based on deal characteristics
 */
function generateBadges(
  savingsPercent: number,
  urgency: UrgencyType,
  valueScore: number
): string[] {
  const badges: string[] = [];

  if (savingsPercent >= 50) {
    badges.push('🔥 HOT DEAL');
  } else if (savingsPercent >= 40) {
    badges.push('⚡ FLASH SALE');
  } else if (savingsPercent >= 30) {
    badges.push('💎 GREAT VALUE');
  }

  if (urgency === 'low-seats') {
    badges.push('🎯 LIMITED SEATS');
  } else if (urgency === 'high-demand') {
    badges.push('🔥 HIGH DEMAND');
  } else if (urgency === 'rising-price') {
    badges.push('📈 PRICE RISING');
  }

  if (valueScore >= 90) {
    badges.push('⭐ TOP RATED');
  }

  return badges;
}

/**
 * Fetch flash deals for a specific route
 */
async function fetchRouteDeals(
  route: typeof FLASH_DEAL_ROUTES[0],
  routeIndex: number
): Promise<FlashDeal | null> {
  try {
    // Calculate departure date (10+ days from now, varying by route)
    const daysFromNow = 10 + (routeIndex * 2);
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + daysFromNow);
    const departureDateStr = departureDate.toISOString().split('T')[0];

    // Calculate return date (7 days later for week-long trip)
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 7);
    const returnDateStr = returnDate.toISOString().split('T')[0];

    console.log(`Searching Duffel for flash deal: ${route.from} -> ${route.to} (${departureDateStr})`);

    // Search flights using Duffel API
    const searchResult = await duffelAPI.searchFlights({
      origin: route.from,
      destination: route.to,
      departureDate: departureDateStr,
      returnDate: returnDateStr,
      adults: 1,
      cabinClass: 'economy',
      maxResults: 1, // Only need cheapest offer
    });

    if (!searchResult.data || searchResult.data.length === 0) {
      console.log(`No offers found for ${route.from} -> ${route.to}`);
      return null;
    }

    // Get the cheapest offer
    const cheapestOffer = searchResult.data[0];
    const price = parseFloat(cheapestOffer.price.total);
    const originalPrice = route.typical;
    const savings = originalPrice - price;
    const savingsPercent = Math.round((savings / originalPrice) * 100);

    // Only include deals with >15% savings (lowered from 20% to show more deals)
    if (savingsPercent < 15) {
      console.log(`Skipping ${route.from} -> ${route.to}: only ${savingsPercent}% savings`);
      return null;
    }

    console.log(`Found flash deal: ${route.from} -> ${route.to} - $${price} (${savingsPercent}% off)`);

    // Extract carrier from Duffel format
    const carrierCode = cheapestOffer.validatingAirlineCodes?.[0] ||
                       cheapestOffer.itineraries?.[0]?.segments?.[0]?.carrierCode ||
                       'XX';
    const airlineInfo = AIRLINES.find(a => a.code === carrierCode);

    // Calculate value score (out of 100)
    const valueScore = calculateValueScore({
      price,
      marketAvgPrice: originalPrice,
      rating: 4.5,
      reviewCount: 1000,
      demandLevel: 80,
      availabilityLevel: 30,
    });

    // Generate expiration time (1-6 hours from now)
    const hoursUntilExpiry = 1 + (routeIndex % 6);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hoursUntilExpiry);
    const expiresAtStr = expiresAt.toISOString();

    // Generate urgency indicators
    const urgencyData = generateUrgencyIndicators(price, savingsPercent, routeIndex);

    // Generate badges
    const badges = generateBadges(savingsPercent, urgencyData.urgency, valueScore);

    // Extract actual departure date from offer
    const actualDepartureDate = cheapestOffer.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T')[0] || departureDateStr;

    // Create deal object
    const deal: FlashDeal = {
      id: `flash-${route.from}-${route.to}-${Date.now()}-${routeIndex}`,
      from: route.from,
      to: route.to,
      price,
      originalPrice,
      savings,
      savingsPercent,
      valueScore,
      carrier: carrierCode,
      carrierName: airlineInfo?.name || carrierCode,
      departureDate: actualDepartureDate,
      returnDate: returnDateStr,
      expiresAt: expiresAtStr,
      timeRemaining: calculateTimeRemaining(expiresAtStr),
      urgency: urgencyData.urgency,
      urgencyValue: urgencyData.urgencyValue,
      viewersLast24h: urgencyData.viewersLast24h,
      bookingsLast24h: urgencyData.bookingsLast24h,
      badges,
    };

    return deal;
  } catch (error) {
    console.error(`Error fetching deals for ${route.from}-${route.to}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Generate cache key (30-minute buckets for time-sensitive deals)
    const cacheKey = generateCacheKey('flash-deals-enhanced', {
      timestamp: Math.floor(Date.now() / (1000 * 60 * 30)), // 30-minute buckets
    });

    // Try to get from cache
    const cached = await getCached<{ data: FlashDeal[]; meta: any; timestamp: number }>(cacheKey);
    if (cached) {
      // Recalculate time remaining for all deals
      const deals = cached.data.map((deal: FlashDeal) => ({
        ...deal,
        timeRemaining: calculateTimeRemaining(deal.expiresAt),
      }));

      return NextResponse.json({
        data: deals,
        meta: {
          ...cached.meta,
          fromCache: true,
          cacheAge: Math.floor((Date.now() - cached.timestamp) / 1000),
        },
      });
    }

    console.log('Fetching flash deals from Duffel API...');

    // Fetch deals for all routes in parallel
    const dealPromises = FLASH_DEAL_ROUTES.map((route, index) =>
      fetchRouteDeals(route, index)
    );

    const dealsResults = await Promise.all(dealPromises);

    // Filter out null results and sort by value score (descending)
    const deals = dealsResults
      .filter((deal): deal is FlashDeal => deal !== null)
      .sort((a, b) => b.valueScore - a.valueScore);

    console.log(`Found ${deals.length} flash deals with >20% savings`);

    // Calculate metadata
    const now = new Date();
    const meta = {
      totalDeals: deals.length,
      averageSavings: deals.length > 0
        ? Math.round(deals.reduce((sum, d) => sum + d.savingsPercent, 0) / deals.length)
        : 0,
      bestDeal: deals.length > 0 ? deals[0].id : null,
      generatedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // 30 minutes
      source: 'Duffel',
      fromCache: false,
    };

    // Cache the results (30 minutes - flash deals are time-sensitive)
    const responseData = {
      data: deals,
      meta,
      timestamp: Date.now(),
    };

    await setCache(cacheKey, responseData, 30 * 60); // 30 minutes

    return NextResponse.json({
      data: deals,
      meta,
    });
  } catch (error) {
    console.error('Error fetching flash deals:', error);

    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to fetch flash deals',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        meta: {
          totalDeals: 0,
          source: 'Duffel',
        },
      },
      { status: 500 }
    );
  }
}
