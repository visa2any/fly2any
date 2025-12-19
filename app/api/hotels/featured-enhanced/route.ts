import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi';
// Note: Amadeus disabled for featured hotels - no real photos available
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import { calculateValueScore } from '@/lib/ml/value-scorer';

// Force dynamic rendering for nextUrl.searchParams usage
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Enhanced Featured Hotels API with Continent Filtering
 *
 * GET /api/hotels/featured-enhanced?continent=americas|europe|asia-pacific|beach|luxury|all
 *
 * Features:
 * - Continental/category filtering
 * - Real Duffel hotel data with photos
 * - ML-powered value scoring
 * - Marketing signals (urgency, demand, trending)
 * - Social proof indicators
 * - Conversion optimization
 */

interface HotelDestination {
  query: string;
  city: string;
  country: string;
  continent: 'americas' | 'europe' | 'asia-pacific' | 'beach' | 'luxury';
  category?: string[];
}

// Comprehensive destination catalog with real worldwide locations
const destinations: HotelDestination[] = [
  // Americas
  { query: 'Times Square, New York', city: 'New York', country: 'USA', continent: 'americas', category: ['city', 'luxury'] },
  { query: 'South Beach, Miami', city: 'Miami', country: 'USA', continent: 'americas', category: ['beach', 'luxury'] },
  { query: 'Downtown Los Angeles', city: 'Los Angeles', country: 'USA', continent: 'americas', category: ['city'] },
  { query: 'Toronto Downtown', city: 'Toronto', country: 'Canada', continent: 'americas', category: ['city'] },
  { query: 'Cancun Hotel Zone', city: 'Cancún', country: 'Mexico', continent: 'americas', category: ['beach', 'resort'] },

  // Europe
  { query: 'Central Paris', city: 'Paris', country: 'France', continent: 'europe', category: ['city', 'luxury'] },
  { query: 'Rome City Center', city: 'Rome', country: 'Italy', continent: 'europe', category: ['city', 'luxury'] },
  { query: 'Barcelona Gothic Quarter', city: 'Barcelona', country: 'Spain', continent: 'europe', category: ['city', 'beach'] },
  { query: 'London West End', city: 'London', country: 'UK', continent: 'europe', category: ['city', 'luxury'] },
  { query: 'Amsterdam Central', city: 'Amsterdam', country: 'Netherlands', continent: 'europe', category: ['city'] },

  // Asia-Pacific
  { query: 'Tokyo Shibuya', city: 'Tokyo', country: 'Japan', continent: 'asia-pacific', category: ['city', 'luxury'] },
  { query: 'Singapore Marina Bay', city: 'Singapore', country: 'Singapore', continent: 'asia-pacific', category: ['city', 'luxury'] },
  { query: 'Bali Seminyak', city: 'Bali', country: 'Indonesia', continent: 'asia-pacific', category: ['beach', 'resort'] },
  { query: 'Sydney Harbour', city: 'Sydney', country: 'Australia', continent: 'asia-pacific', category: ['city', 'beach'] },
  { query: 'Bangkok Sukhumvit', city: 'Bangkok', country: 'Thailand', continent: 'asia-pacific', category: ['city'] },

  // Beach/Resort Destinations
  { query: 'Maldives Resort', city: 'Malé', country: 'Maldives', continent: 'beach', category: ['beach', 'luxury', 'resort'] },
  { query: 'Phuket Beach', city: 'Phuket', country: 'Thailand', continent: 'beach', category: ['beach', 'resort'] },
  { query: 'Honolulu Waikiki', city: 'Honolulu', country: 'USA', continent: 'beach', category: ['beach', 'luxury'] },
  { query: 'Dubai Marina', city: 'Dubai', country: 'UAE', continent: 'luxury', category: ['beach', 'city', 'luxury'] },
];

/**
 * Deterministic seeded random number generator
 * Uses city name as seed to ensure consistent results
 */
function seededRandom(seed: string, index: number = 0): number {
  let hash = 0;
  const str = seed + index.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert hash to number between 0 and 1
  return Math.abs(hash % 1000) / 1000;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const continentFilter = searchParams.get('continent') || 'all';
    const limit = parseInt(searchParams.get('limit') || '8');

    // Filter destinations by continent
    let filteredDestinations = destinations;
    if (continentFilter !== 'all') {
      filteredDestinations = destinations.filter(d =>
        d.continent === continentFilter || d.category?.includes(continentFilter)
      );
    }

    // Limit results
    filteredDestinations = filteredDestinations.slice(0, limit);

    const cacheKey = generateCacheKey('hotels:featured-enhanced', {
      continent: continentFilter,
      limit,
      version: 'v5-no-amadeus', // Cache bust - removed Amadeus hotels
    });

    // Try cache (24 hour TTL - refresh once daily)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached featured hotels for ${continentFilter}`);
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'public, max-age=86400', // 24 hours
        }
      });
    }

    // Date calculations for search
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(checkIn.getDate() + 14); // 2 weeks from now
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3); // 3 night stay

    const checkInStr = checkIn.toISOString().split('T')[0];
    const checkOutStr = checkOut.toISOString().split('T')[0];

    console.log(`🔍 Fetching ${filteredDestinations.length} featured hotels for ${continentFilter}...`);

    // Premium placeholder images by city (Unsplash/CDN) for hotels without photos
    const cityPlaceholderImages: Record<string, string[]> = {
      'New York': ['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80'],
      'Miami': ['https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80', 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800&q=80'],
      'Los Angeles': ['https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80', 'https://images.unsplash.com/photo-1515896769750-31548aa180ed?w=800&q=80'],
      'Toronto': ['https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=800&q=80'],
      'Cancún': ['https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800&q=80'],
      'Paris': ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&q=80'],
      'Rome': ['https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80'],
      'Barcelona': ['https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80'],
      'London': ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80'],
      'Amsterdam': ['https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80'],
      'Tokyo': ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80'],
      'Singapore': ['https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80'],
      'Bali': ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80'],
      'Sydney': ['https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80'],
      'Bangkok': ['https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80'],
      'Malé': ['https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80'],
      'Phuket': ['https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80'],
      'Honolulu': ['https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=800&q=80'],
      'Dubai': ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80'],
    };
    const defaultHotelImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';

    // City coordinates for LiteAPI search + IATA codes for Amadeus
    const cityData: Record<string, { lat: number; lng: number; iata: string }> = {
      'Times Square, New York': { lat: 40.7580, lng: -73.9855, iata: 'NYC' },
      'South Beach, Miami': { lat: 25.7907, lng: -80.1300, iata: 'MIA' },
      'Downtown Los Angeles': { lat: 34.0522, lng: -118.2437, iata: 'LAX' },
      'Toronto Downtown': { lat: 43.6532, lng: -79.3832, iata: 'YYZ' },
      'Cancun Hotel Zone': { lat: 21.1619, lng: -86.8515, iata: 'CUN' },
      'Central Paris': { lat: 48.8566, lng: 2.3522, iata: 'PAR' },
      'Rome City Center': { lat: 41.9028, lng: 12.4964, iata: 'ROM' },
      'Barcelona Gothic Quarter': { lat: 41.3851, lng: 2.1734, iata: 'BCN' },
      'London West End': { lat: 51.5074, lng: -0.1278, iata: 'LON' },
      'Amsterdam Central': { lat: 52.3676, lng: 4.9041, iata: 'AMS' },
      'Tokyo Shibuya': { lat: 35.6580, lng: 139.7016, iata: 'TYO' },
      'Singapore Marina Bay': { lat: 1.2834, lng: 103.8607, iata: 'SIN' },
      'Bali Seminyak': { lat: -8.6913, lng: 115.1681, iata: 'DPS' },
      'Sydney Harbour': { lat: -33.8688, lng: 151.2093, iata: 'SYD' },
      'Bangkok Sukhumvit': { lat: 13.7563, lng: 100.5018, iata: 'BKK' },
      'Maldives Resort': { lat: 4.1755, lng: 73.5093, iata: 'MLE' },
      'Phuket Beach': { lat: 7.9519, lng: 98.3381, iata: 'HKT' },
      'Honolulu Waikiki': { lat: 21.2793, lng: -157.8292, iata: 'HNL' },
      'Dubai Marina': { lat: 25.0657, lng: 55.1404, iata: 'DXB' },
    };

    // Fetch hotels from each destination using LiteAPI + Amadeus fallback
    const hotelPromises = filteredDestinations.map(async (dest) => {
      try {
        const city = cityData[dest.query] || { lat: 40.7128, lng: -74.0060, iata: 'NYC' };
        let hotel: any = null;
        const source = 'liteapi'; // Only LiteAPI for featured (has real photos)

        // Try LiteAPI first
        try {
          const results = await liteAPI.searchHotelsWithMinRates({
            latitude: city.lat,
            longitude: city.lng,
            checkinDate: checkInStr,
            checkoutDate: checkOutStr,
            adults: 2,
            children: 0,
            currency: 'USD',
            guestNationality: 'US',
            limit: 2,
          });
          if (results?.hotels?.[0]) {
            hotel = results.hotels[0];
            source = 'liteapi';
          }
        } catch (liteErr) {
          console.log(`LiteAPI failed for ${dest.city}, trying Amadeus...`);
        }

        // Skip Amadeus fallback for featured hotels - only use LiteAPI
        // Amadeus hotels don't have photos and cause broken cards
        if (!hotel) {
          console.log(`⚠️ No LiteAPI hotel for ${dest.city} - skipping (no Amadeus fallback)`);
        }

        if (!hotel) return null;

        // Process the hotel (from either LiteAPI or Amadeus)
        // Debug: Log photo fields for first few hotels
        if (filteredDestinations.indexOf(dest) < 3) {
            console.log(`📸 Hotel "${hotel.name}" photo fields:`, {
              image: hotel.image,
              thumbnail: hotel.thumbnail,
              images: hotel.images?.slice(0, 2),
              main_photo: (hotel as any).main_photo,
            });
          }

          // LiteAPI hotel structure
          const price = hotel.lowestPricePerNight || hotel.lowestPrice || 0;

          // ML Value Score Calculation (deterministic)
          const hotelSeed = dest.city + hotel.id;
          const hotelAny = hotel as any;
          const valueScore = calculateValueScore({
            price: price || 150,
            marketAvgPrice: (price || 150) * 1.4,
            rating: hotelAny.starRating || hotelAny.stars || 4,
            reviewCount: hotelAny.reviewCount || 500,
            demandLevel: Math.floor(seededRandom(hotelSeed, 0) * 40) + 60, // 60-100
            availabilityLevel: Math.floor(seededRandom(hotelSeed, 1) * 60) + 20, // 20-80
          });

          // Marketing signals (deterministic)
          const demandLevel = Math.floor(seededRandom(hotelSeed, 2) * 40) + 60;
          const availableRooms = Math.floor(seededRandom(hotelSeed, 3) * 10) + 2;
          const viewersLast24h = Math.floor(seededRandom(hotelSeed, 4) * 150) + 50;
          const bookingsLast24h = Math.floor(seededRandom(hotelSeed, 5) * 20) + 5;
          const trending = demandLevel > 85;
          const priceDropRecent = seededRandom(hotelSeed, 6) > 0.7;

          return {
            ...hotel,
            id: hotel.id,
            name: hotel.name,
            city: dest.city,
            country: dest.country,
            continent: dest.continent,
            category: dest.category || [],

            // Pricing - use hotel's rate data
            lowestRate: hotelAny.lowestRate || price,
            pricePerNight: Math.round(price),
            originalPrice: priceDropRecent ? Math.round(price * 1.25) : undefined,

            // ML Features
            valueScore,

            // Marketing Signals
            demandLevel,
            availableRooms,
            trending,
            priceDropRecent,

            // Social Proof
            viewersLast24h,
            bookingsLast24h,

            // Photos - Robust extraction with city-based fallback for Amadeus
            images: (() => {
              if (hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
                return hotel.images;
              }
              // Fallback: use city placeholder images
              const cityImages = cityPlaceholderImages[dest.city] || [defaultHotelImage];
              return cityImages.map((url: string) => ({ url }));
            })(),
            mainImage: (() => {
              // Try images array first (has highest quality photos)
              if (hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
                const firstImg = hotel.images[0] as any;
                if (firstImg) {
                  if (typeof firstImg === 'object' && firstImg.url && String(firstImg.url).length > 0) {
                    return String(firstImg.url);
                  }
                  if (typeof firstImg === 'string' && firstImg.length > 0) {
                    return firstImg;
                  }
                }
              }
              // Try direct image field
              if (hotel.image && String(hotel.image).length > 0) {
                return String(hotel.image);
              }
              // Try thumbnail
              if (hotel.thumbnail && String(hotel.thumbnail).length > 0) {
                return String(hotel.thumbnail);
              }
              // Try raw LiteAPI fields
              if (hotelAny.main_photo && String(hotelAny.main_photo).length > 0) {
                return String(hotelAny.main_photo);
              }
              // FALLBACK: Use city-based placeholder image (for Amadeus hotels)
              const cityImages = cityPlaceholderImages[dest.city];
              if (cityImages && cityImages.length > 0) {
                return cityImages[0];
              }
              return defaultHotelImage;
            })(),

            // Additional data
            starRating: hotelAny.starRating || hotelAny.stars,
            reviewRating: hotelAny.reviewRating || hotelAny.rating,
            reviewCount: hotelAny.reviewCount || 0,
            amenities: hotel.amenities || [],
            address: hotel.address,
            location: hotelAny.location || { latitude: hotel.latitude, longitude: hotel.longitude },

            // Source indicator (LiteAPI or Amadeus)
            source,
            _amadeusOffer: hotel._amadeusOffer, // For Amadeus manual booking
          };
      } catch (error: any) {
        console.error(`Error fetching ${dest.city}:`, error.message);
        return null;
      }
    });

    const hotels = await Promise.all(hotelPromises);
    const validHotels = hotels.filter(h => h !== null);

    // Log if no hotels found (no demo fallback - only real API data)
    if (validHotels.length === 0) {
      console.log(`⚠️ No hotels found for ${continentFilter} (LiteAPI + Amadeus fallback)`);
    }

    // Sort by value score
    validHotels.sort((a, b) => (b?.valueScore || 0) - (a?.valueScore || 0));

    const response = {
      data: validHotels,
      meta: {
        count: validHotels.length,
        continent: continentFilter,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Cache for 24 hours (86400 seconds) - refresh daily with real API prices
    await setCache(cacheKey, response, 86400);

    console.log(`✅ Fetched ${validHotels.length} featured hotels for ${continentFilter}`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'Cache-Control': 'public, max-age=86400', // 24 hours
      }
    });
  } catch (error: any) {
    console.error('❌ Featured hotels enhanced error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch featured hotels',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Note: Using Node.js runtime (not edge) because Duffel SDK requires Node.js APIs
// export const runtime = 'edge';
