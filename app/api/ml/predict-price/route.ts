import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma'

const prisma = getPrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { origin, destination, departDate, returnDate } = body

    if (!origin || !destination || !departDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch historical price data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const historicalPrices = await prisma.priceHistory.findMany({
      where: {
        origin,
        destination,
        departDate: { gte: departDate }, // Prices for similar or future dates
        timestamp: { gte: thirtyDaysAgo }
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    })

    if (historicalPrices.length === 0) {
      return NextResponse.json({
        prediction: null,
        message: 'Insufficient historical data for prediction'
      })
    }

    // Calculate prediction
    const prices = historicalPrices.map(h => h.price)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    // Simple prediction model
    const departDateObj = new Date(departDate)
    const daysUntilDeparture = Math.floor(
      (departDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    // Price adjustment based on booking window
    let adjustment = 0
    if (daysUntilDeparture < 7) adjustment = 0.15
    else if (daysUntilDeparture < 14) adjustment = 0.08
    else if (daysUntilDeparture < 21) adjustment = 0.05
    else if (daysUntilDeparture > 90) adjustment = -0.05

    const predictedPrice = Math.round(avgPrice * (1 + adjustment))
    const confidence = Math.min(0.9, historicalPrices.length / 50)

    // Recommendation
    let recommendation = 'book_now'
    if (predictedPrice < avgPrice * 0.95) recommendation = 'book_now'
    else if (daysUntilDeparture > 21) recommendation = 'wait'

    const prediction = {
      predictedPrice,
      confidence,
      priceRange: {
        min: Math.round(predictedPrice * 0.85),
        max: Math.round(predictedPrice * 1.15)
      },
      recommendation,
      savingsEstimate: predictedPrice < avgPrice ? Math.round(avgPrice - predictedPrice) : undefined,
      insights: [
        daysUntilDeparture < 14 ? 'Booking within 2 weeks - prices typically increase' : '',
        predictedPrice < minPrice * 1.1 ? 'Current price is near historical low' : '',
        daysUntilDeparture > 60 ? 'Booking early - consider price alerts' : ''
      ].filter(Boolean)
    }

    // Store prediction
    await prisma.pricePrediction.create({
      data: {
        origin,
        destination,
        departDate,
        returnDate,
        predictedPrice,
        confidence,
        priceRange: prediction.priceRange,
        modelVersion: 'v1.0-simple',
        features: {
          daysUntilDeparture,
          avgPrice,
          minPrice,
          maxPrice,
          sampleSize: historicalPrices.length
        },
        recommendation,
        savingsEstimate: prediction.savingsEstimate,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error('Error predicting price:', error)
    return NextResponse.json(
      { error: 'Failed to predict price' },
      { status: 500 }
    )
  }
}
