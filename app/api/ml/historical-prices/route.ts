import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const departDate = searchParams.get('departDate')
    const days = parseInt(searchParams.get('days') || '30', 10)

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Missing origin or destination' },
        { status: 400 }
      )
    }

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const prices = await prisma.priceHistory.findMany({
      where: {
        origin,
        destination,
        ...(departDate ? { departDate: { gte: departDate } } : {}),
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'asc' },
      take: 500
    })

    return NextResponse.json({
      prices: prices.map(p => ({
        price: p.price,
        timestamp: p.timestamp,
        departDate: p.departDate,
        provider: p.provider
      })),
      count: prices.length
    })
  } catch (error) {
    console.error('Error fetching historical prices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical prices' },
      { status: 500 }
    )
  }
}
