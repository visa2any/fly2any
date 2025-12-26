/**
 * API Route: Create Stripe Payment Intent for Hotel Booking
 * POST /api/hotels/create-payment-intent
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHotelPaymentIntent } from '@/lib/payments/stripe-hotel'
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface CreatePaymentIntentRequest {
  amount: number // Total price in dollars (will be converted to cents)
  currency: string
  hotelId: string
  hotelName: string
  roomId: string
  roomName: string
  checkIn: string
  checkOut: string
  nights: number
  guestEmail: string
  guestName: string
}

export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    const body: CreatePaymentIntentRequest = await request.json()

    // Validation
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 }
      )
    }

    if (!body.currency) {
      return NextResponse.json(
        { error: 'Currency is required' },
        { status: 400 }
      )
    }

    if (!body.hotelId || !body.hotelName || !body.roomId || !body.roomName) {
      return NextResponse.json(
        { error: 'Missing required hotel or room information' },
        { status: 400 }
      )
    }

    if (!body.guestEmail || !body.guestName) {
      return NextResponse.json(
        { error: 'Guest information is required' },
        { status: 400 }
      )
    }

    // Convert dollars to cents for Stripe (e.g., $185.50 -> 18550 cents)
    const amountInCents = Math.round(body.amount * 100)

    // Create payment intent
    const paymentIntent = await createHotelPaymentIntent({
      amount: amountInCents,
      currency: body.currency,
      metadata: {
        hotelId: body.hotelId,
        hotelName: body.hotelName,
        roomId: body.roomId,
        roomName: body.roomName,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        nights: body.nights,
        guestEmail: body.guestEmail,
        guestName: body.guestName,
      },
      description: `Hotel booking: ${body.hotelName} (${body.nights} nights)`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  }, { category: ErrorCategory.PAYMENT, severity: ErrorSeverity.CRITICAL })
}
