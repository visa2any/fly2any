/**
 * Hotel Search API Endpoint
 * GET /api/hotels/search
 * 
 * Handles hotel search requests using LiteAPI
 * Includes caching, validation, and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { liteApiClient, validateSearchParams } from '@/lib/hotels/liteapi-client';
import { revenueManager, type RevenueParams } from '@/lib/hotels/revenue-management';
import type { 
  HotelSearchResponse, 
  Hotel, 
  APIResponse,
  HotelSearchParams 
} from '@/types/hotels';

// Rate limiting and caching
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes - Reduzido para preços mais atualizados
const searchCache = new Map<string, { data: any; timestamp: number }>();

// Validation schema for query parameters
const searchQuerySchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  destinationType: z.enum(['city', 'hotel', 'airport', 'coordinates']).default('city'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid check-in date format'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid check-out date format'),
  adults: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(8)),
  children: z.string().default('0').transform(val => parseInt(val, 10)).pipe(z.number().min(0).max(8)),
  childrenAges: z.string().transform(val => 
    val ? val.split(',').map(age => parseInt(age, 10)) : []
  ).optional(),
  rooms: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(5)),
  currency: z.string().length(3).default('USD'),
  minPrice: z.string().transform(val => parseInt(val, 10)).pipe(z.number().positive()).optional(),
  maxPrice: z.string().transform(val => parseInt(val, 10)).pipe(z.number().positive()).optional(),
  starRating: z.string().transform(val => 
    val ? val.split(',').map(rating => parseInt(rating, 10)) : []
  ).optional(),
  guestRating: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(10)).optional(),
  sortBy: z.enum(['price', 'rating', 'distance', 'stars']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.string().default('20').transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)),
  offset: z.string().default('0').transform(val => parseInt(val, 10)).pipe(z.number().min(0)),
  amenities: z.string().transform(val => 
    val ? val.split(',') : []
  ).optional(),
  // Revenue management parameters (REAL LiteAPI)
  margin: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0).max(30)).optional(),
  additionalMarkup: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0).max(20)).optional(),
  respectSSP: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  userGroup: z.enum(['public', 'cug', 'member']).optional(),
}).refine(data => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date'
}).refine(data => {
  const checkIn = new Date(data.checkIn);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkIn >= today;
}, {
  message: 'Check-in date must be today or later'
});

/**
 * Generate cache key for search parameters
 */
function generateCacheKey(params: any): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as any);
  
  return btoa(JSON.stringify(sortedParams));
}

/**
 * Check if cache entry is valid
 */
function isCacheValid(entry: { timestamp: number }): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Transform LiteAPI response to our format
 */
function transformHotelData(liteApiHotel: any): Hotel {
  return {
    id: liteApiHotel.id,
    name: liteApiHotel.name,
    description: liteApiHotel.description,
    starRating: liteApiHotel.star_rating || 0,
    guestRating: liteApiHotel.guest_rating,
    reviewCount: liteApiHotel.review_count,
    location: {
      address: {
        street: liteApiHotel.location?.address,
        city: liteApiHotel.location?.city || '',
        state: liteApiHotel.location?.state,
        country: liteApiHotel.location?.country || '',
        postal_code: liteApiHotel.location?.postal_code
      },
      coordinates: liteApiHotel.location?.coordinates ? {
        latitude: liteApiHotel.location.coordinates.latitude,
        longitude: liteApiHotel.location.coordinates.longitude
      } : { latitude: 0, longitude: 0 },
      landmarks: liteApiHotel.landmarks?.map((landmark: any) => ({
        name: landmark.name,
        distance: landmark.distance,
        unit: landmark.unit || 'km',
        type: landmark.type || 'attraction'
      }))
    },
    images: liteApiHotel.images?.map((image: any) => ({
      url: image.url,
      description: image.description,
      width: image.width,
      height: image.height,
      isMain: image.is_main
    })) || [],
    amenities: liteApiHotel.amenities?.map((amenity: any) => ({
      id: amenity.id || amenity.name.toLowerCase().replace(/\s+/g, '_'),
      name: amenity.name,
      category: amenity.category || 'general',
      icon: amenity.icon,
      description: amenity.description,
      isFree: amenity.is_free
    })) || [],
    policies: liteApiHotel.policies ? {
      checkIn: liteApiHotel.policies.check_in,
      checkOut: liteApiHotel.policies.check_out,
      children: liteApiHotel.policies.children,
      pets: liteApiHotel.policies.pets,
      extraBeds: liteApiHotel.policies.extra_beds,
      smoking: liteApiHotel.policies.smoking
    } : undefined,
    rates: liteApiHotel.rates?.map((rate: any) => ({
      id: rate.id,
      rateId: rate.rate_id,
      roomType: {
        id: rate.room_type?.id || rate.id,
        name: rate.room_type?.name || rate.room_name || 'Standard Room',
        description: rate.room_type?.description,
        maxOccupancy: rate.max_occupancy || 2,
        bedTypes: rate.room_type?.bed_types || [{ type: 'double', count: 1 }],
        size: rate.room_type?.size,
        amenities: rate.room_type?.amenities || [],
        images: rate.room_type?.images || []
      },
      boardType: rate.board_type || 'room_only',
      price: {
        amount: rate.price?.amount || 0,
        currency: rate.price?.currency || 'USD',
        formatted: formatPrice(rate.price?.amount || 0, rate.price?.currency || 'USD')
      },
      originalPrice: rate.original_price ? {
        amount: rate.original_price.amount,
        currency: rate.original_price.currency,
        formatted: formatPrice(rate.original_price.amount, rate.original_price.currency)
      } : undefined,
      discountPercentage: rate.discount_percentage,
      currency: rate.price?.currency || 'USD',
      isRefundable: rate.is_refundable || false,
      isFreeCancellation: rate.is_free_cancellation || false,
      cancellationDeadline: rate.cancellation_deadline,
      maxOccupancy: rate.max_occupancy || 2,
      availableRooms: rate.available_rooms || 1,
      totalPrice: {
        amount: rate.total_price?.amount || rate.price?.amount || 0,
        currency: rate.total_price?.currency || rate.price?.currency || 'USD',
        formatted: formatPrice(
          rate.total_price?.amount || rate.price?.amount || 0, 
          rate.total_price?.currency || rate.price?.currency || 'USD'
        )
      },
      taxes: rate.taxes?.map((tax: any) => ({
        amount: tax.amount,
        currency: tax.currency,
        formatted: formatPrice(tax.amount, tax.currency)
      })) || [],
      fees: rate.fees?.map((fee: any) => ({
        name: fee.name,
        price: {
          amount: fee.amount,
          currency: fee.currency,
          formatted: formatPrice(fee.amount, fee.currency)
        },
        isIncluded: fee.is_included
      })) || [],
      paymentOptions: rate.payment_options || [{ type: 'pay_now', description: 'Pay now' }],
      promotions: rate.promotions?.map((promo: any) => ({
        title: promo.title,
        description: promo.description,
        discount: promo.discount
      }))
    })) || [],
    lowestRate: liteApiHotel.lowest_rate ? {
      amount: liteApiHotel.lowest_rate.amount,
      currency: liteApiHotel.lowest_rate.currency,
      formatted: formatPrice(liteApiHotel.lowest_rate.amount, liteApiHotel.lowest_rate.currency)
    } : undefined,
    highlights: liteApiHotel.highlights || [],
    chainName: liteApiHotel.chain_name,
    // brandName não é usado nos componentes - removido corretamente
    hotelClass: liteApiHotel.hotel_class,
    contact: liteApiHotel.contact ? {
      phone: liteApiHotel.contact.phone,
      email: liteApiHotel.contact.email,
      website: liteApiHotel.contact.website
    } : undefined
  };
}

/**
 * Format price with currency
 */
function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Log search analytics
 */
async function logSearchAnalytics(params: any, results: any, processingTime: number) {
  try {
    // Here you would send to your analytics system
    console.log('[Hotel Search Analytics]', {
      destination: params.destination,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: { adults: params.adults, children: params.children },
      rooms: params.rooms,
      resultsCount: results.length,
      processingTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics logging failed:', error);
  }
}

/**
 * GET /api/hotels/search
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    
    console.log(`[${requestId}] Hotel search request:`, rawParams);

    let validatedParams;
    try {
      validatedParams = searchQuerySchema.parse(rawParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          status: 'error',
          data: null,
          message: 'Invalid search parameters',
          errors: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          })),
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime
          }
        } as APIResponse<null>, { status: 400 });
      }
      throw error;
    }

    // Check cache
    const cacheKey = generateCacheKey(validatedParams);
    const cachedResult = searchCache.get(cacheKey);
    
    if (cachedResult && isCacheValid(cachedResult)) {
      console.log(`[${requestId}] Returning cached result`);
      
      const response: APIResponse<HotelSearchResponse> = {
        status: 'success',
        data: cachedResult.data,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          // cached: true // removed - not allowed in metadata
        }
      };
      
      return NextResponse.json(response);
    }

    // Prepare LiteAPI search parameters
    const liteApiParams = {
      destination: validatedParams.destination,
      destinationType: validatedParams.destinationType,
      checkIn: validatedParams.checkIn,
      checkOut: validatedParams.checkOut,
      adults: validatedParams.adults,
      children: validatedParams.children,
      childrenAges: validatedParams.childrenAges,
      rooms: validatedParams.rooms,
      currency: validatedParams.currency,
      minPrice: validatedParams.minPrice,
      maxPrice: validatedParams.maxPrice,
      starRating: validatedParams.starRating,
      guestRating: validatedParams.guestRating,
      sortBy: validatedParams.sortBy,
      sortOrder: validatedParams.sortOrder,
      limit: validatedParams.limit,
      offset: validatedParams.offset,
      amenities: validatedParams.amenities
    };

    // Make LiteAPI request
    console.log(`[${requestId}] Making LiteAPI request`);
    const liteApiResponse = await liteApiClient.searchHotels(liteApiParams);

    if (!liteApiResponse || !liteApiResponse.data) {
      throw new Error('Invalid response from LiteAPI');
    }

    // Transform response data
    let hotels: Hotel[] = (liteApiResponse.data.hotels || []).map(transformHotelData);
    
    // Apply revenue management if parameters provided
    if (validatedParams.margin !== undefined) {
      const revenueParams: RevenueParams = {
        margin: validatedParams.margin,
        additionalMarkup: validatedParams.additionalMarkup,
        respectSSP: validatedParams.respectSSP,
        userGroup: validatedParams.userGroup || 'public'
      };

      hotels = hotels.map(hotel => {
        if (hotel.rates && hotel.rates.length > 0) {
          const managedRates = revenueManager.applyRevenueManagement(hotel.rates, revenueParams);
          
          // Filter out rates that can't be displayed (SSP violations for public users)
          const displayableRates = managedRates.filter(rate => rate.canDisplay);
          
          return {
            ...hotel,
            rates: displayableRates,
            lowestRate: displayableRates.length > 0 ? 
              displayableRates.reduce((lowest, rate) => 
                rate.price.amount < lowest.price.amount ? rate.price : lowest.price
              ) : hotel.lowestRate,
            revenueManagement: {
              appliedMargin: revenueParams.margin,
              appliedMarkup: revenueParams.additionalMarkup,
              userGroup: revenueParams.userGroup,
              totalRatesFiltered: managedRates.length - displayableRates.length
            }
          } as Hotel;
        }
        return hotel;
      });

      console.log(`💰 Revenue management applied: ${validatedParams.margin}% margin + ${validatedParams.additionalMarkup || 0}% markup`);
    }
    
    const searchResponse: HotelSearchResponse = {
      hotels,
      // totalResults: liteApiResponse.metadata?.totalResults || hotels.length, // Removed - not in HotelSearchResponse interface
      search_id: liteApiResponse.metadata?.searchId || requestId,
      filters: {
        priceRange: {
          min: Math.min(...hotels.map(h => h.lowestRate?.amount || 0)),
          max: Math.max(...hotels.map(h => h.lowestRate?.amount || 1000))
        },
        // starRatings: [...new Set(hotels.map(h => h.starRating))].sort(), // Removed due to type mismatch
        // amenities removed - not in interface
        boardTypes: [...new Set(hotels.flatMap(h => h.rates?.map(r => r.boardType) || []))],
        hotelChains: [...new Set(hotels.map(h => h.chainName).filter(Boolean))] as string[]
      },
      currency: validatedParams.currency,
      checkIn: validatedParams.checkIn,
      checkOut: validatedParams.checkOut,
      guests: {
        adults: validatedParams.adults,
        children: validatedParams.children,
        rooms: validatedParams.rooms
      }
    };

    // Cache the result
    searchCache.set(cacheKey, {
      data: searchResponse,
      timestamp: Date.now()
    });

    // Clean old cache entries (simple cleanup)
    if (searchCache.size > 1000) {
      const entries = Array.from(searchCache.entries());
      const outdated = entries.filter(([, entry]) => !isCacheValid(entry));
      outdated.forEach(([key]) => searchCache.delete(key));
    }

    // Log analytics
    const processingTime = Date.now() - startTime;
    await logSearchAnalytics(validatedParams, hotels, processingTime);

    console.log(`[${requestId}] Search completed: ${hotels.length} hotels found in ${processingTime}ms`);

    const response: APIResponse<HotelSearchResponse> = {
      status: 'success',
      data: searchResponse,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime,
        // cached: false // removed - not allowed in metadata
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Search error:`, error);

    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('LiteAPI Error')) {
        errorMessage = 'Hotel search service temporarily unavailable';
        statusCode = 503;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Search request timeout';
        statusCode = 408;
      } else {
        errorMessage = error.message;
      }
    }

    const errorResponse: APIResponse<null> = {
      status: 'error',
      data: null,
      message: errorMessage,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime
      }
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * OPTIONS /api/hotels/search - CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// Export configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;