/**
 * Hotel Pre-booking API Endpoint
 * POST /api/hotels/booking/prebook
 * 
 * Creates a pre-booking to secure rates and availability
 * before collecting full guest information
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { liteApiClient } from '@/lib/hotels/liteapi-client';
import type { PreBookingResponse, APIResponse } from '@/types/hotels';

// Rate limiting for booking attempts
const BOOKING_RATE_LIMIT = 5; // attempts per minute per IP
const bookingAttempts = new Map<string, { count: number; resetTime: number }>();

// Validation schema for pre-booking request
const prebookSchema = z.object({
  rateId: z.string().min(1, 'Rate ID is required'),
  hotelId: z.string().min(1, 'Hotel ID is required'),
  searchParams: z.object({
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid check-in date format'),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid check-out date format'),
    adults: z.number().min(1).max(8),
    children: z.number().min(0).max(8),
    rooms: z.number().min(1).max(5),
    currency: z.string().length(3).default('USD')
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
  }),
  clientInfo: z.object({
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    sessionId: z.string().optional()
  }).optional()
});

/**
 * Check rate limiting for IP address
 */
function checkRateLimit(ipAddress: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now();
  const windowStart = Math.floor(now / 60000) * 60000; // 1-minute window
  
  const attempts = bookingAttempts.get(ipAddress);
  
  if (!attempts || attempts.resetTime !== windowStart) {
    // Reset or create new entry
    bookingAttempts.set(ipAddress, {
      count: 1,
      resetTime: windowStart
    });
    return { allowed: true, remainingAttempts: BOOKING_RATE_LIMIT - 1 };
  }
  
  if (attempts.count >= BOOKING_RATE_LIMIT) {
    return { allowed: false, remainingAttempts: 0 };
  }
  
  attempts.count++;
  return { allowed: true, remainingAttempts: BOOKING_RATE_LIMIT - attempts.count };
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = forwarded?.split(',')[0] || realIP || 'unknown';
  return clientIP.trim();
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
 * Transform LiteAPI pre-booking response
 */
function transformPrebookingResponse(liteApiResponse: any): PreBookingResponse {
  const data = liteApiResponse.data;
  
  return {
    prebookId: data.prebook_id || data.id,
    status: data.status === 'confirmed' ? 'confirmed' : 
            data.status === 'pending' ? 'pending' : 'failed',
    validUntil: data.valid_until || new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes default
    totalPrice: {
      amount: data.total_price?.amount || data.rate?.price?.amount || 0,
      currency: data.total_price?.currency || data.rate?.price?.currency || 'USD',
      formatted: formatPrice(
        data.total_price?.amount || data.rate?.price?.amount || 0,
        data.total_price?.currency || data.rate?.price?.currency || 'USD'
      )
    }
  };
}

/**
 * Log pre-booking analytics
 */
async function logPrebookingAnalytics(
  requestData: any, 
  result: PreBookingResponse | null, 
  success: boolean,
  processingTime: number,
  requestId: string
) {
  try {
    console.log('[Hotel Prebooking Analytics]', {
      requestId,
      hotelId: requestData.hotelId,
      rateId: requestData.rateId,
      checkIn: requestData.searchParams.checkIn,
      checkOut: requestData.searchParams.checkOut,
      guests: {
        adults: requestData.searchParams.adults,
        children: requestData.searchParams.children,
        rooms: requestData.searchParams.rooms
      },
      totalAmount: result?.totalPrice?.amount || 0,
      currency: result?.totalPrice?.currency || 'BRL',
      success,
      processingTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Prebooking analytics logging failed:', error);
  }
}

/**
 * POST /api/hotels/booking/prebook
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Get client information
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Check rate limiting
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({
        status: 'error',
        message: 'Too many booking attempts. Please try again later.',
        data: null,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          remainingAttempts: 0
        }
      } as APIResponse<null>, { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 60000) * 60 + 60)
        }
      });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid JSON in request body',
        data: null,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      } as APIResponse<null>, { status: 400 });
    }

    console.log(`[${requestId}] Pre-booking request:`, {
      rateId: requestBody.rateId,
      hotelId: requestBody.hotelId,
      clientIP,
      userAgent: userAgent.substring(0, 100)
    });

    // Validate request data
    let validatedData;
    try {
      validatedData = prebookSchema.parse({
        ...requestBody,
        clientInfo: {
          ipAddress: clientIP,
          userAgent,
          sessionId: requestBody.clientInfo?.sessionId
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          status: 'error',
          message: 'Invalid request data',
          data: null,
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

    // Make pre-booking request to LiteAPI
    console.log(`[${requestId}] Making LiteAPI pre-booking request`);
    const liteApiResponse = await liteApiClient.prebookHotel(validatedData.rateId);

    if (!liteApiResponse || !liteApiResponse.data) {
      throw new Error('Invalid response from LiteAPI');
    }

    // Check if pre-booking was successful
    if (!liteApiResponse.success || liteApiResponse.data.status === 'failed') {
      const errorMessage = liteApiResponse.data?.error || 
                          liteApiResponse.message || 
                          'Pre-booking failed';
      
      await logPrebookingAnalytics(validatedData, null, false, Date.now() - startTime, requestId);
      
      return NextResponse.json({
        status: 'error',
        message: errorMessage,
        data: null,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      } as APIResponse<null>, { status: 409 }); // Conflict - rate not available
    }

    // Transform response
    const prebookingResponse = transformPrebookingResponse(liteApiResponse);

    // Log analytics
    const processingTime = Date.now() - startTime;
    await logPrebookingAnalytics(validatedData, prebookingResponse, true, processingTime, requestId);

    console.log(`[${requestId}] Pre-booking successful: ${prebookingResponse.prebookId} in ${processingTime}ms`);

    const response: APIResponse<PreBookingResponse> = {
      status: 'success',
      data: prebookingResponse,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime,
        remainingAttempts: rateLimitCheck.remainingAttempts
      }
    };

    return NextResponse.json(response, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimitCheck.remainingAttempts)
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Pre-booking error:`, error);

    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('LiteAPI Error')) {
        if (error.message.includes('rate not available') || 
            error.message.includes('sold out') ||
            error.message.includes('no availability')) {
          errorMessage = 'This rate is no longer available. Please search again.';
          statusCode = 409;
        } else if (error.message.includes('invalid rate') || 
                  error.message.includes('rate expired')) {
          errorMessage = 'Invalid or expired rate. Please search again.';
          statusCode = 410;
        } else {
          errorMessage = 'Booking service temporarily unavailable';
          statusCode = 503;
        }
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Pre-booking request timeout';
        statusCode = 408;
      } else {
        errorMessage = error.message;
      }
    }

    const errorResponse: APIResponse<null> = {
      status: 'error',
      message: errorMessage,
      data: null,
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
 * OPTIONS /api/hotels/booking/prebook - CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// Export configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;