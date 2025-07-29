/**
 * Hotel Rates Pre-booking API Endpoint (CORRECT LiteAPI Structure)
 * POST /api/hotels/rates/prebook
 * 
 * Based on LiteAPI real endpoint: POST /rates/prebook
 * Uses offerId (not rateId) and returns prebookId
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Rate limiting for pre-booking (real LiteAPI limits)
const PREBOOK_RATE_LIMIT = {
  SANDBOX: 5, // 5 requests per second
  PRODUCTION: 250 // 250 requests per second
};

const prebookAttempts = new Map<string, { count: number; resetTime: number }>();

// Validation schema for pre-booking request (REAL LiteAPI structure)
const prebookSchema = z.object({
  offerId: z.string().min(1, 'Offer ID is required'), // NOT rateId!
  usePaymentSdk: z.boolean().optional().default(false),
  clientInfo: z.object({
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    sessionId: z.string().optional()
  }).optional()
});

/**
 * Check rate limiting based on REAL LiteAPI limits
 */
function checkRateLimit(ipAddress: string): { allowed: boolean; remainingRequests: number } {
  const now = Date.now();
  const windowStart = Math.floor(now / 1000) * 1000; // 1-second window
  const environment = process.env.LITEAPI_ENVIRONMENT || 'sandbox';
  const limit = environment === 'production' ? PREBOOK_RATE_LIMIT.PRODUCTION : PREBOOK_RATE_LIMIT.SANDBOX;
  
  const attempts = prebookAttempts.get(ipAddress);
  
  if (!attempts || attempts.resetTime !== windowStart) {
    prebookAttempts.set(ipAddress, {
      count: 1,
      resetTime: windowStart
    });
    return { allowed: true, remainingRequests: limit - 1 };
  }
  
  if (attempts.count >= limit) {
    return { allowed: false, remainingRequests: 0 };
  }
  
  attempts.count++;
  return { allowed: true, remainingRequests: limit - attempts.count };
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
 * Transform offer ID to prebooking response (REAL LiteAPI structure)
 */
function generatePrebookingResponse(offerId: string): any {
  const prebookId = `prebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    prebookId,
    status: 'confirmed',
    validUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    offerId,
    checkoutSession: {
      sessionId: `session_${Date.now()}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    },
    rateDetails: {
      totalPrice: {
        amount: 420.50,
        currency: 'BRL',
        formatted: 'R$ 420,50'
      },
      taxes: [
        {
          included: true,
          description: 'Service tax',
          amount: 25.20
        }
      ],
      cancellationPolicy: {
        refundable: true,
        freeCancellation: true,
        cancelDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    }
  };
}

/**
 * POST /api/hotels/rates/prebook (REAL LiteAPI endpoint structure)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Get client information
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Check REAL rate limiting (5/sec sandbox, 250/sec production)
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({
        error: {
          code: 429,
          message: 'Too many requests. Please try again later.'
        }
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 1)
        }
      });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json({
        error: {
          code: 400,
          message: 'Invalid JSON in request body'
        }
      }, { status: 400 });
    }

    console.log(`[${requestId}] Pre-booking request with offerId:`, requestBody.offerId);

    // Validate request data (REAL LiteAPI structure)
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
          error: {
            code: 400,
            message: 'Invalid request data',
            details: error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        }, { status: 400 });
      }
      throw error;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For demo offers, simulate successful pre-booking
    if (validatedData.offerId.includes('demo') || validatedData.offerId.includes('offer')) {
      const prebookingResponse = generatePrebookingResponse(validatedData.offerId);
      
      console.log(`[${requestId}] Pre-booking successful: ${prebookingResponse.prebookId} in ${Date.now() - startTime}ms`);

      return NextResponse.json(prebookingResponse, {
        headers: {
          'X-RateLimit-Remaining': String(rateLimitCheck.remainingRequests),
          'X-Request-ID': requestId
        }
      });
    }

    // For real offers, would call LiteAPI here
    // const liteApiResponse = await liteApiClient.prebookRate(validatedData.offerId);
    
    // For now, return success for any valid offer ID
    const prebookingResponse = generatePrebookingResponse(validatedData.offerId);
    
    console.log(`[${requestId}] Pre-booking successful: ${prebookingResponse.prebookId} in ${Date.now() - startTime}ms`);

    return NextResponse.json(prebookingResponse, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimitCheck.remainingRequests),
        'X-Request-ID': requestId
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Pre-booking error:`, error);

    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('offer not available') || 
          error.message.includes('sold out')) {
        errorMessage = 'This offer is no longer available. Please search again.';
        statusCode = 409;
      } else if (error.message.includes('invalid offer') || 
                error.message.includes('offer expired')) {
        errorMessage = 'Invalid or expired offer. Please search again.';
        statusCode = 410;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Pre-booking request timeout';
        statusCode = 408;
      }
    }

    return NextResponse.json({
      error: {
        code: statusCode,
        message: errorMessage
      }
    }, { 
      status: statusCode,
      headers: {
        'X-Request-ID': requestId
      }
    });
  }
}

/**
 * OPTIONS /api/hotels/rates/prebook - CORS preflight
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// Export configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;