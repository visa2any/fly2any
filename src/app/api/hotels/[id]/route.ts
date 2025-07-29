/**
 * Hotel Details API Endpoint
 * GET /api/hotels/[id]
 * 
 * Retrieves detailed information for a specific hotel
 * Includes rates, reviews, amenities, and images
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { liteApiClient } from '@/lib/hotels/liteapi-client';
import type { Hotel, APIResponse } from '@/types/hotels';

// Cache for hotel details (longer TTL since details change less frequently)
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const detailsCache = new Map<string, { data: any; timestamp: number }>();

// Validation schema for query parameters
const detailsQuerySchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(8)).optional(),
  children: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(0).max(8)).optional(),
  rooms: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(5)).optional(),
  currency: z.string().length(3).default('USD'),
  includeRates: z.string().transform(val => val === 'true').default(() => true)
});

/**
 * Transform LiteAPI hotel response to our Hotel type
 */
function transformHotelDetails(liteApiHotel: any, includeRates = true): Hotel {
  return {
    id: liteApiHotel.id,
    name: liteApiHotel.name,
    description: liteApiHotel.description || '',
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
      })) || []
    },
    images: liteApiHotel.images?.map((image: any, index: number) => ({
      url: image.url,
      description: image.description || `${liteApiHotel.name} - Image ${index + 1}`,
      width: image.width,
      height: image.height,
      isMain: image.is_main || index === 0
    })) || [],
    amenities: liteApiHotel.amenities?.map((amenity: any) => ({
      id: amenity.id || amenity.name.toLowerCase().replace(/\s+/g, '_'),
      name: amenity.name,
      category: amenity.category || 'general',
      icon: amenity.icon,
      description: amenity.description,
      isFree: amenity.is_free !== false // Default to true if not specified
    })) || [],
    policies: liteApiHotel.policies ? {
      checkIn: liteApiHotel.policies.check_in || '15:00',
      checkOut: liteApiHotel.policies.check_out || '11:00',
      children: liteApiHotel.policies.children,
      pets: liteApiHotel.policies.pets,
      extraBeds: liteApiHotel.policies.extra_beds,
      smoking: liteApiHotel.policies.smoking
    } : {
      checkIn: '15:00',
      checkOut: '11:00'
    },
    rates: includeRates && liteApiHotel.rates?.map((rate: any) => ({
      id: rate.id,
      rateId: rate.rate_id,
      roomType: {
        id: rate.room_type?.id || rate.id,
        name: rate.room_type?.name || rate.room_name || 'Standard Room',
        description: rate.room_type?.description,
        maxOccupancy: rate.max_occupancy || 2,
        bedTypes: rate.room_type?.bed_types || [{ type: 'double', count: 1 }],
        size: rate.room_type?.size,
        amenities: (rate.room_type?.amenities || []).map((amenity: any) => ({
          id: amenity.id || amenity.name.toLowerCase().replace(/\s+/g, '_'),
          name: amenity.name,
          category: amenity.category || 'comfort',
          icon: amenity.icon,
          isFree: amenity.is_free !== false
        })),
        images: rate.room_type?.images?.map((image: any) => ({
          url: image.url,
          description: image.description,
          width: image.width,
          height: image.height,
          isMain: image.is_main
        })) || []
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
      })) || []
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
    } : undefined,
    sustainability: liteApiHotel.sustainability ? {
      level: liteApiHotel.sustainability.level || 0,
      certifications: liteApiHotel.sustainability.certifications || []
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
 * Check if cache entry is valid
 */
function isCacheValid(entry: { timestamp: number }): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Generate cache key for hotel details
 */
function generateCacheKey(hotelId: string, params: any): string {
  const cacheParams = {
    hotelId,
    ...params
  };
  
  const sortedParams = Object.keys(cacheParams)
    .sort()
    .reduce((result, key) => {
      result[key] = cacheParams[key];
      return result;
    }, {} as any);
  
  return btoa(JSON.stringify(sortedParams));
}

/**
 * GET /api/hotels/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const resolvedParams = await params;
  const hotelId = resolvedParams.id;

  try {
    // Validate hotel ID
    if (!hotelId || typeof hotelId !== 'string') {
      return NextResponse.json({
        status: 'error',
        data: null,
        message: 'Invalid hotel ID',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      } as APIResponse<null>, { status: 400 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    console.log(`[${requestId}] Hotel details request for ${hotelId}:`, rawParams);

    let validatedParams;
    try {
      validatedParams = detailsQuerySchema.parse(rawParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          status: 'error',
          data: null,
          message: 'Invalid query parameters',
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
    const cacheKey = generateCacheKey(hotelId, validatedParams);
    const cachedResult = detailsCache.get(cacheKey);
    
    if (cachedResult && isCacheValid(cachedResult)) {
      console.log(`[${requestId}] Returning cached hotel details`);
      
      const response: APIResponse<Hotel> = {
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

    // Prepare parameters for LiteAPI
    const liteApiParams = validatedParams.checkIn && validatedParams.checkOut ? {
      checkIn: validatedParams.checkIn,
      checkOut: validatedParams.checkOut,
      adults: validatedParams.adults,
      children: validatedParams.children,
      rooms: validatedParams.rooms,
      currency: validatedParams.currency
    } : undefined;

    // Get hotel details from LiteAPI
    console.log(`[${requestId}] Fetching hotel details from LiteAPI`);
    const liteApiResponse = await liteApiClient.getHotelDetails(hotelId, liteApiParams);

    if (!liteApiResponse || !liteApiResponse.data) {
      return NextResponse.json({
        status: 'error',
        data: null,
        message: 'Hotel not found',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      } as APIResponse<null>, { status: 404 });
    }

    // Transform response data
    const hotel = transformHotelDetails(liteApiResponse.data, validatedParams.includeRates);

    // If rates were requested but not included in hotel details, fetch them separately
    if (validatedParams.includeRates && liteApiParams && (!hotel.rates || hotel.rates.length === 0)) {
      try {
        console.log(`[${requestId}] Fetching rates separately`);
        const ratesResponse = await liteApiClient.getHotelRates(hotelId, {
          checkIn: liteApiParams.checkIn!,
          checkOut: liteApiParams.checkOut!,
          adults: liteApiParams.adults || 2,
          children: liteApiParams.children,
          rooms: liteApiParams.rooms || 1,
          currency: liteApiParams.currency
        });

        if (ratesResponse && ratesResponse.data && ratesResponse.data.rates) {
          hotel.rates = ratesResponse.data.rates.map((rate: any) => ({
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
            promotions: rate.promotions || []
          }));

          // Update lowest rate
          if (hotel.rates && hotel.rates.length > 0) {
            const lowestRateAmount = Math.min(...hotel.rates.map(r => r.price.amount));
            const lowestRate = hotel.rates.find(r => r.price.amount === lowestRateAmount);
            if (lowestRate) {
              hotel.lowestRate = lowestRate.price;
            }
          }
        }
      } catch (error) {
        console.warn(`[${requestId}] Failed to fetch rates separately:`, error);
        // Continue without rates - not a critical error
      }
    }

    // Cache the result
    detailsCache.set(cacheKey, {
      data: hotel,
      timestamp: Date.now()
    });

    // Clean old cache entries
    if (detailsCache.size > 500) {
      const entries = Array.from(detailsCache.entries());
      const outdated = entries.filter(([, entry]) => !isCacheValid(entry));
      outdated.forEach(([key]) => detailsCache.delete(key));
    }

    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] Hotel details fetched successfully in ${processingTime}ms`);

    const response: APIResponse<Hotel> = {
      status: 'success',
      data: hotel,
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
    console.error(`[${requestId}] Hotel details error:`, error);

    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('LiteAPI Error')) {
        if (error.message.includes('not found') || error.message.includes('404')) {
          errorMessage = 'Hotel not found';
          statusCode = 404;
        } else {
          errorMessage = 'Hotel service temporarily unavailable';
          statusCode = 503;
        }
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout';
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
 * OPTIONS /api/hotels/[id] - CORS preflight
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