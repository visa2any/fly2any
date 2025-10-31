import { NextResponse } from 'next/server';
import { duffelStaysAPI } from '@/lib/api/duffel-stays';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { calculateValueScore } from '@/components/shared/ValueScoreBadge';

/**
 * Featured Hotels API Route for Homepage
 *
 * GET /api/hotels/featured
 *
 * Returns curated list of hotels from popular destinations for homepage display.
 * Features:
 * - 4 hotels from different major cities
 * - Best value scores
 * - Real data from Duffel Stays API
 * - Aggressive caching (1 hour)
 */
export async function GET() {
  try {
    const cacheKey = generateCacheKey('hotels:featured', {});

    // Try to get from cache (1 hour TTL)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log('✅ Returning cached featured hotels');
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'public, max-age=3600',
        }
      });
    }

    // Define popular destinations with dates for next week
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(checkIn.getDate() + 7); // 1 week from now
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2); // 2 night stay

    const checkInStr = checkIn.toISOString().split('T')[0];
    const checkOutStr = checkOut.toISOString().split('T')[0];

    // Popular US cities for homepage
    const destinations = [
      { query: 'Times Square, New York', city: 'New York' },
      { query: 'South Beach, Miami', city: 'Miami' },
      { query: 'Downtown San Francisco', city: 'San Francisco' },
      { query: 'Los Angeles Airport', city: 'Los Angeles' },
    ];

    console.log('🔍 Fetching featured hotels from popular destinations...');

    // Fetch hotels from each destination
    const hotelPromises = destinations.map(async (dest) => {
      try {
        const results = await duffelStaysAPI.searchAccommodations({
          location: { query: dest.query },
          checkIn: checkInStr,
          checkOut: checkOutStr,
          guests: { adults: 2 },
          radius: 3, // 3km radius
          limit: 5, // Get top 5 to select best
          currency: 'USD',
        });

        // Get hotels with best value scores
        if (results && results.data && Array.isArray(results.data) && results.data.length > 0) {
          const hotelsWithScores = results.data.map((hotel: any) => {
            if (!hotel) return null;

            const lowestRate = hotel.rates && Array.isArray(hotel.rates) && hotel.rates.length > 0
              ? hotel.rates[0]
              : null;
            const price = lowestRate && lowestRate.totalPrice && lowestRate.totalPrice.amount
              ? parseFloat(lowestRate.totalPrice.amount)
              : 0;

            const valueScore = calculateValueScore({
              price: price || 100,
              marketAvgPrice: (price || 100) * 1.5, // Estimate market avg
              rating: hotel.starRating || 3,
              reviewCount: hotel.reviewCount || 100,
              demandLevel: 75,
              availabilityLevel: 50,
            });

            return {
              ...hotel,
              valueScore,
              lowestRate,
              city: dest.city,
            };
          }).filter(h => h !== null);

          // Sort by value score and return best hotel
          if (hotelsWithScores.length > 0) {
            hotelsWithScores.sort((a, b) => (b?.valueScore || 0) - (a?.valueScore || 0));
            return hotelsWithScores[0];
          }
        }
        return null;
      } catch (error: any) {
        console.error(`Error fetching hotels for ${dest.city}:`, error.message || error);
        return null;
      }
    });

    const hotels = await Promise.all(hotelPromises);
    const validHotels = hotels.filter(h => h !== null);

    const response = {
      data: validHotels,
      meta: {
        count: validHotels.length,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Store in cache (1 hour TTL)
    await setCache(cacheKey, response, 3600);

    console.log(`✅ Fetched ${validHotels.length} featured hotels`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (error: any) {
    console.error('❌ Featured hotels error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch featured hotels',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
