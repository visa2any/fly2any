/**
 * Get User's Hotel Bookings
 * GET /api/hotels/bookings?tab=upcoming|past|cancelled
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'upcoming'

    const now = new Date()
    let where: any = { userId: session.user.id }

    if (tab === 'upcoming') {
      where.checkInDate = { gte: now }
      where.status = { in: ['confirmed', 'pending'] }
    } else if (tab === 'past') {
      where.checkOutDate = { lt: now }
      where.status = 'completed'
    } else if (tab === 'cancelled') {
      where.status = 'cancelled'
    }

    const bookings = await prisma.hotelBooking.findMany({
      where,
      orderBy: tab === 'upcoming'
        ? { checkInDate: 'asc' }
        : { checkOutDate: 'desc' },
      select: {
        id: true,
        confirmationNumber: true,
        hotelName: true,
        hotelCity: true,
        hotelCountry: true,
        roomName: true,
        checkInDate: true,
        checkOutDate: true,
        nights: true,
        totalPrice: true,
        currency: true,
        status: true,
        guestFirstName: true,
        guestLastName: true,
        guestEmail: true,
        createdAt: true,
        cancellable: true,
      },
    })

    return NextResponse.json({ bookings })
  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings', message: error.message },
      { status: 500 }
    )
  }
}
