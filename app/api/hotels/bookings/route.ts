/**
 * Get User's Hotel Bookings
 * GET /api/hotels/bookings?tab=upcoming|past|cancelled
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/db/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'upcoming'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const now = new Date()
    let where: any = { guestEmail: session.user.email }

    if (tab === 'upcoming') {
      where.checkInDate = { gte: now }
      where.status = { in: ['confirmed', 'pending'] }
    } else if (tab === 'past') {
      where.checkOutDate = { lt: now }
      where.status = 'completed'
    } else if (tab === 'cancelled') {
      where.status = 'cancelled'
    }

    const [bookings, total] = await Promise.all([
      prisma.hotelBooking.findMany({
        where,
        orderBy: tab === 'upcoming'
          ? { checkInDate: 'asc' }
          : { checkOutDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.hotelBooking.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      bookings,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings', message: error.message },
      { status: 500 }
    )
  }
}
