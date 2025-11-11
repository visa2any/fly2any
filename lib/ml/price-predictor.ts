/**
 * AI Price Prediction Service
 * Predicts flight prices based on historical data and patterns
 */

export interface PricePredictionInput {
  origin: string
  destination: string
  departDate: string
  returnDate?: string
  passengers?: number
  cabinClass?: string
}

export interface PricePredictionResult {
  predictedPrice: number
  confidence: number
  priceRange: {
    min: number
    max: number
  }
  recommendation: 'book_now' | 'wait' | 'flexible_dates'
  savingsEstimate?: number
  insights: string[]
}

export interface HistoricalPrice {
  price: number
  timestamp: Date
}

class PricePredictor {
  /**
   * Predict price for a given flight route
   */
  async predict(input: PricePredictionInput): Promise<PricePredictionResult> {
    // Fetch historical price data
    const historicalPrices = await this.fetchHistoricalPrices(input)

    if (historicalPrices.length < 5) {
      // Not enough data for prediction
      return this.getDefaultPrediction(input)
    }

    // Calculate features
    const features = this.extractFeatures(input, historicalPrices)

    // Make prediction using simple model
    const prediction = this.simplePredict(features, historicalPrices)

    return prediction
  }

  private async fetchHistoricalPrices(input: PricePredictionInput): Promise<HistoricalPrice[]> {
    try {
      const response = await fetch(
        `/api/ml/historical-prices?origin=${input.origin}&destination=${input.destination}&departDate=${input.departDate}`
      )

      if (!response.ok) return []

      const data = await response.json()
      return data.prices || []
    } catch (error) {
      console.error('Error fetching historical prices:', error)
      return []
    }
  }

  private extractFeatures(input: PricePredictionInput, historical: HistoricalPrice[]): Record<string, number> {
    const departDate = new Date(input.departDate)
    const today = new Date()

    // Days until departure
    const daysUntilDeparture = Math.floor((departDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Day of week
    const dayOfWeek = departDate.getDay()

    // Month
    const month = departDate.getMonth()

    // Is weekend
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0

    // Is holiday season (summer, winter holidays)
    const isHolidaySeason = (month >= 5 && month <= 8) || month === 11 ? 1 : 0

    // Price trends
    const prices = historical.map(h => h.price)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceVolatility = this.calculateStdDev(prices) / avgPrice

    // Recent trend (last 7 days)
    const recentPrices = historical.slice(-7).map(h => h.price)
    const recentAvg = recentPrices.length > 0
      ? recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
      : avgPrice
    const priceTrend = (recentAvg - avgPrice) / avgPrice

    return {
      daysUntilDeparture,
      dayOfWeek,
      month,
      isWeekend,
      isHolidaySeason,
      avgPrice,
      minPrice,
      maxPrice,
      priceVolatility,
      priceTrend
    }
  }

  private simplePredict(features: Record<string, number>, historical: HistoricalPrice[]): PricePredictionResult {
    // Simple linear model based on booking window
    const basePrice = features.avgPrice

    // Booking window adjustment
    let priceAdjustment = 0
    if (features.daysUntilDeparture < 7) {
      priceAdjustment = 0.15 // 15% higher for last-minute bookings
    } else if (features.daysUntilDeparture < 14) {
      priceAdjustment = 0.08
    } else if (features.daysUntilDeparture < 21) {
      priceAdjustment = 0.05
    } else if (features.daysUntilDeparture > 90) {
      priceAdjustment = -0.05 // 5% lower for early bookings
    }

    // Weekend adjustment
    if (features.isWeekend) {
      priceAdjustment += 0.05
    }

    // Holiday season adjustment
    if (features.isHolidaySeason) {
      priceAdjustment += 0.10
    }

    // Trend adjustment
    priceAdjustment += features.priceTrend * 0.5

    const predictedPrice = Math.round(basePrice * (1 + priceAdjustment))

    // Calculate confidence based on data quality
    const confidence = Math.min(0.95, historical.length / 30 * (1 - Math.min(features.priceVolatility, 0.3)))

    // Price range (confidence interval)
    const rangeFactor = features.priceVolatility * 1.5
    const priceRange = {
      min: Math.round(predictedPrice * (1 - rangeFactor)),
      max: Math.round(predictedPrice * (1 + rangeFactor))
    }

    // Recommendation
    let recommendation: 'book_now' | 'wait' | 'flexible_dates' = 'book_now'
    let savingsEstimate: number | undefined

    if (predictedPrice < features.avgPrice * 0.95) {
      recommendation = 'book_now'
      savingsEstimate = Math.round(features.avgPrice - predictedPrice)
    } else if (features.priceTrend < 0 && features.daysUntilDeparture > 14) {
      recommendation = 'wait'
      savingsEstimate = Math.round(predictedPrice * 0.08)
    } else if (features.daysUntilDeparture < 7) {
      recommendation = 'book_now'
    } else if (features.priceVolatility > 0.2) {
      recommendation = 'flexible_dates'
    }

    // Generate insights
    const insights: string[] = []

    if (features.daysUntilDeparture < 14) {
      insights.push('Booking within 2 weeks - prices typically increase')
    }

    if (predictedPrice < features.minPrice * 1.1) {
      insights.push('Current price is near historical low')
    }

    if (features.isHolidaySeason) {
      insights.push('Holiday season - expect higher demand')
    }

    if (features.priceTrend > 0.05) {
      insights.push('Prices trending upward recently')
    } else if (features.priceTrend < -0.05) {
      insights.push('Prices trending downward recently')
    }

    if (features.isWeekend) {
      insights.push('Weekend travel - consider weekday alternatives for savings')
    }

    return {
      predictedPrice,
      confidence,
      priceRange,
      recommendation,
      savingsEstimate,
      insights
    }
  }

  private calculateStdDev(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2))
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
    return Math.sqrt(variance)
  }

  private getDefaultPrediction(input: PricePredictionInput): PricePredictionResult {
    // Default prediction when not enough data
    return {
      predictedPrice: 500,
      confidence: 0.3,
      priceRange: { min: 400, max: 700 },
      recommendation: 'book_now',
      insights: ['Limited historical data available', 'Recommendation based on general patterns']
    }
  }
}

// Singleton instance
let predictorInstance: PricePredictor | null = null

export function getPricePredictor(): PricePredictor {
  if (!predictorInstance) {
    predictorInstance = new PricePredictor()
  }
  return predictorInstance
}
