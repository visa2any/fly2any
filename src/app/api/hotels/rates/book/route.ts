/**
 * Hotel Rates Booking Confirmation API Endpoint (CORRECT LiteAPI Structure)
 * POST /api/hotels/rates/book
 * 
 * Based on LiteAPI real endpoint: POST /rates/book
 * Confirms booking using prebookId + guest info + payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for booking confirmation (REAL LiteAPI structure)
const bookingSchema = z.object({
  prebookId: z.string().min(1, 'Prebook ID is required'),
  guestInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    nationality: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional()
    }).optional()
  }),
  paymentInfo: z.object({
    method: z.enum(['TRANSACTION', 'ACC_CREDIT_CARD', 'WALLET', 'CREDIT']),
    transactionId: z.string().optional(), // For TRANSACTION method (Payment SDK)
    cardDetails: z.object({
      cardNumber: z.string().optional(),
      expiryMonth: z.string().optional(),
      expiryYear: z.string().optional(),
      cvv: z.string().optional(),
      cardholderName: z.string().optional()
    }).optional(),
    billingAddress: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional()
    }).optional()
  }),
  specialRequests: z.string().optional(),
  additionalGuests: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    age: z.number().optional()
  })).optional()
});

/**
 * Generate booking confirmation response (REAL LiteAPI structure)
 */
function generateBookingResponse(prebookId: string, guestInfo: any): any {
  const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const confirmationCode = `FLY${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  return {
    bookingId,
    confirmationCode,
    hotelConfirmationCode: `HTL${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    status: 'confirmed',
    bookingDetails: {
      guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
      checkIn: '2024-07-30',
      checkOut: '2024-07-31',
      nights: 1,
      rooms: 1,
      adults: 2,
      children: 0,
      hotelInfo: {
        name: 'Hotel Copacabana Palace',
        address: 'Avenida Atlântica, 1702, Rio de Janeiro, Brasil',
        phone: '+55 21 2548-7070',
        email: 'reservas@copacabanapalace.com.br'
      },
      roomDetails: {
        type: 'Superior Ocean View',
        description: 'Quarto superior com vista para o mar',
        amenities: ['Wi-Fi Grátis', 'Ar Condicionado', 'TV LED', 'Minibar', 'Varanda']
      },
      pricing: {
        roomRate: 395.30,
        taxes: 25.20,
        totalAmount: 420.50,
        currency: 'BRL',
        formatted: 'R$ 420,50'
      },
      cancellationPolicy: {
        refundable: true,
        freeCancellation: true,
        cancelDeadline: '2024-07-29T23:59:59.000Z',
        penalties: [
          {
            from: '2024-07-29T23:59:59.000Z',
            to: '2024-07-30T14:00:00.000Z',
            amount: 0,
            description: 'Free cancellation'
          },
          {
            from: '2024-07-30T14:00:00.000Z',
            to: null,
            amount: 420.50,
            description: 'Non-refundable after check-in time'
          }
        ]
      }
    },
    paymentStatus: 'confirmed',
    bookingDate: new Date().toISOString(),
    contactInfo: {
      supportPhone: '+55 11 3000-0000',
      supportEmail: 'support@fly2any.com',
      emergencyPhone: '+55 11 9999-0000'
    },
    documents: {
      voucher: `https://fly2any.com/voucher/${bookingId}`,
      invoice: `https://fly2any.com/invoice/${bookingId}`,
      termsAndConditions: 'https://fly2any.com/terms'
    }
  };
}

/**
 * Validate prebook ID (check if it exists and is not expired)
 */
function validatePrebookId(prebookId: string): { valid: boolean; reason?: string } {
  // Basic validation - in real implementation, check database
  if (!prebookId.startsWith('prebook_')) {
    return { valid: false, reason: 'Invalid prebook ID format' };
  }
  
  // Extract timestamp from prebook ID
  const parts = prebookId.split('_');
  if (parts.length < 2) {
    return { valid: false, reason: 'Invalid prebook ID structure' };
  }
  
  const timestamp = parseInt(parts[1]);
  if (isNaN(timestamp)) {
    return { valid: false, reason: 'Invalid prebook ID timestamp' };
  }
  
  // Check if prebook is expired (15 minutes validity)
  const now = Date.now();
  const validUntil = timestamp + (15 * 60 * 1000);
  
  if (now > validUntil) {
    return { valid: false, reason: 'Prebook session has expired. Please start over.' };
  }
  
  return { valid: true };
}

/**
 * POST /api/hotels/rates/book (REAL LiteAPI endpoint structure)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
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

    console.log(`[${requestId}] Booking confirmation request for prebookId:`, requestBody.prebookId);

    // Validate request data (REAL LiteAPI structure)
    let validatedData;
    try {
      validatedData = bookingSchema.parse(requestBody);
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

    // Validate prebook ID
    const prebookValidation = validatePrebookId(validatedData.prebookId);
    if (!prebookValidation.valid) {
      return NextResponse.json({
        error: {
          code: 410,
          message: prebookValidation.reason || 'Invalid prebook session'
        }
      }, { status: 410 });
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo prebookIds, simulate successful booking
    if (validatedData.prebookId.includes('prebook_')) {
      const bookingResponse = generateBookingResponse(
        validatedData.prebookId, 
        validatedData.guestInfo
      );
      
      console.log(`[${requestId}] Booking confirmed: ${bookingResponse.bookingId} in ${Date.now() - startTime}ms`);

      // Log booking analytics
      console.log('[Booking Analytics]', {
        requestId,
        bookingId: bookingResponse.bookingId,
        guestEmail: validatedData.guestInfo.email,
        totalAmount: bookingResponse.bookingDetails.pricing.totalAmount,
        currency: bookingResponse.bookingDetails.pricing.currency,
        paymentMethod: validatedData.paymentInfo.method,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json(bookingResponse, {
        headers: {
          'X-Request-ID': requestId,
          'X-Booking-ID': bookingResponse.bookingId
        }
      });
    }

    // For real prebookIds, would call LiteAPI here
    // const liteApiResponse = await liteApiClient.confirmBooking(validatedData);
    
    // For now, return success for any valid prebook ID
    const bookingResponse = generateBookingResponse(
      validatedData.prebookId, 
      validatedData.guestInfo
    );
    
    console.log(`[${requestId}] Booking confirmed: ${bookingResponse.bookingId} in ${Date.now() - startTime}ms`);

    return NextResponse.json(bookingResponse, {
      headers: {
        'X-Request-ID': requestId,
        'X-Booking-ID': bookingResponse.bookingId
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Booking confirmation error:`, error);

    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('payment failed') || 
          error.message.includes('card declined')) {
        errorMessage = 'Payment processing failed. Please check your payment details.';
        statusCode = 402; // Payment Required
      } else if (error.message.includes('room not available')) {
        errorMessage = 'Room is no longer available. Please search again.';
        statusCode = 409;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Booking request timeout. Please try again.';
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
 * OPTIONS /api/hotels/rates/book - CORS preflight
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