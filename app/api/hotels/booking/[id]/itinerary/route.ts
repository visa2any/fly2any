/**
 * Download Hotel Booking Itinerary
 * GET /api/hotels/booking/[id]/itinerary
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      )
    }

    const booking = await prisma.hotelBooking.findUnique({
      where: { id: params.id },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: booking.currency,
    }).format(parseFloat(booking.totalPrice.toString()))

    const itinerary = `
╔════════════════════════════════════════════════════════════╗
║           FLY2ANY HOTEL BOOKING CONFIRMATION              ║
╚════════════════════════════════════════════════════════════╝

CONFIRMATION NUMBER: ${booking.confirmationNumber}
BOOKING DATE: ${format(booking.createdAt, 'MMMM d, yyyy')}

═══════════════════════════════════════════════════════════════
HOTEL INFORMATION
═══════════════════════════════════════════════════════════════

${booking.hotelName}
${booking.hotelAddress || ''}
${booking.hotelCity}, ${booking.hotelCountry}
${booking.hotelPhone ? `Phone: ${booking.hotelPhone}` : ''}
${booking.hotelEmail ? `Email: ${booking.hotelEmail}` : ''}

═══════════════════════════════════════════════════════════════
BOOKING DETAILS
═══════════════════════════════════════════════════════════════

CHECK-IN:  ${format(booking.checkInDate, 'EEEE, MMMM d, yyyy')}
           After 3:00 PM

CHECK-OUT: ${format(booking.checkOutDate, 'EEEE, MMMM d, yyyy')}
           Before 11:00 AM

ROOM TYPE: ${booking.roomName}
NIGHTS:    ${booking.nights} ${booking.nights === 1 ? 'night' : 'nights'}
BED TYPE:  ${booking.bedType || 'Standard'}
GUESTS:    ${booking.maxGuests || 2}

═══════════════════════════════════════════════════════════════
GUEST INFORMATION
═══════════════════════════════════════════════════════════════

PRIMARY GUEST: ${booking.guestTitle || ''} ${booking.guestFirstName} ${booking.guestLastName}
EMAIL:         ${booking.guestEmail}
PHONE:         ${booking.guestPhone}

${booking.additionalGuests ? `ADDITIONAL GUESTS:\n${JSON.parse(booking.additionalGuests as string).map((g: any) => `• ${g.firstName} ${g.lastName}`).join('\n')}` : ''}

═══════════════════════════════════════════════════════════════
PAYMENT SUMMARY
═══════════════════════════════════════════════════════════════

Price per Night: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: booking.currency }).format(parseFloat(booking.pricePerNight.toString()))}
Number of Nights: ${booking.nights}
Subtotal: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: booking.currency }).format(parseFloat(booking.subtotal.toString()))}
Taxes & Fees: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: booking.currency }).format(parseFloat(booking.taxesAndFees.toString()))}

TOTAL PAID: ${formattedPrice}

Payment Status: ${booking.paymentStatus.toUpperCase()}
${booking.paidAt ? `Payment Date: ${format(booking.paidAt, 'MMMM d, yyyy h:mm a')}` : ''}

${booking.specialRequests ? `═══════════════════════════════════════════════════════════════
SPECIAL REQUESTS
═══════════════════════════════════════════════════════════════

${booking.specialRequests}

*Special requests are subject to availability and cannot be guaranteed.
` : ''}
═══════════════════════════════════════════════════════════════
IMPORTANT INFORMATION
═══════════════════════════════════════════════════════════════

✓ Please bring a valid government-issued ID
✓ A credit card may be required for incidentals at check-in
✓ Early check-in and late checkout are subject to availability
✓ Cancellation Policy: ${booking.cancellationPolicy || 'Contact hotel for details'}

═══════════════════════════════════════════════════════════════
WHAT'S NEXT?
═══════════════════════════════════════════════════════════════

1. You'll receive a reminder email 24 hours before check-in
2. Bring this confirmation (printed or digital) to the hotel
3. Contact us if you need to make any changes
4. Enjoy your stay!

═══════════════════════════════════════════════════════════════
NEED HELP?
═══════════════════════════════════════════════════════════════

Email: support@fly2any.com
Phone: +1 (555) 123-4567
Website: https://fly2any.com/help

═══════════════════════════════════════════════════════════════

© ${new Date().getFullYear()} Fly2Any. All rights reserved.

Generated on: ${format(new Date(), 'MMMM d, yyyy h:mm a')}
    `.trim()

    return new NextResponse(itinerary, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="Fly2Any-Booking-${booking.confirmationNumber}.txt"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating itinerary:', error)
    return NextResponse.json(
      { error: 'Failed to generate itinerary', message: error.message },
      { status: 500 }
    )
  }
}
