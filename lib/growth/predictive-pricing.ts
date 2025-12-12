/**
 * Predictive Pricing Engine - Fly2Any Growth OS
 * Fare prediction, trend analysis, and booking recommendations
 */

export interface PriceDataPoint {
  route: string // e.g., "JFK-LHR"
  date: string // Travel date
  price: number
  airline: string
  cabin: 'economy' | 'premium_economy' | 'business' | 'first'
  recordedAt: Date
  daysUntilTravel: number
}

export interface PricePrediction {
  route: string
  travelDate: string
  currentPrice: number
  predictedPrice: number
  confidence: number // 0-100
  trend: 'rising' | 'falling' | 'stable'
  recommendation: 'buy_now' | 'wait' | 'set_alert'
  bestBuyWindow: { start: Date; end: Date } | null
  priceHistory: { date: string; price: number }[]
  factors: PriceFactor[]
}

export interface PriceFactor {
  name: string
  impact: 'positive' | 'negative' | 'neutral'
  description: string
  weight: number // -100 to 100
}

export interface TravelTrend {
  route: string
  period: 'week' | 'month' | 'quarter'
  demandTrend: 'increasing' | 'decreasing' | 'stable'
  avgPrice: number
  priceChange: number // percentage
  popularDays: string[] // e.g., ['Friday', 'Sunday']
  cheapestMonth: string
  peakMonths: string[]
}

export interface BookingRecommendation {
  action: 'book_now' | 'wait_days' | 'set_alert' | 'consider_alternative'
  urgency: 'high' | 'medium' | 'low'
  reason: string
  potentialSavings: number
  alternativeRoutes?: Array<{ route: string; price: number; savings: number }>
  waitDays?: number
}

// Price volatility by route type
const VOLATILITY_FACTORS: Record<string, number> = {
  domestic_short: 0.15,
  domestic_long: 0.20,
  international_short: 0.25,
  international_long: 0.30,
  premium_route: 0.35,
}

// Seasonal price multipliers
const SEASONAL_FACTORS: Record<string, number> = {
  jan: 0.90, feb: 0.85, mar: 0.95,
  apr: 1.00, may: 1.05, jun: 1.15,
  jul: 1.25, aug: 1.20, sep: 0.95,
  oct: 1.00, nov: 0.90, dec: 1.30,
}

// Days until departure price curve
const ADVANCE_BOOKING_CURVE = [
  { days: 7, factor: 1.50 },
  { days: 14, factor: 1.30 },
  { days: 21, factor: 1.15 },
  { days: 30, factor: 1.05 },
  { days: 45, factor: 0.95 },
  { days: 60, factor: 0.90 },
  { days: 90, factor: 0.92 },
  { days: 120, factor: 0.95 },
  { days: 180, factor: 1.00 },
]

export class PredictivePricingEngine {
  private priceHistory: Map<string, PriceDataPoint[]> = new Map()

  /**
   * Record a price observation
   */
  recordPrice(data: Omit<PriceDataPoint, 'recordedAt' | 'daysUntilTravel'>): void {
    const travelDate = new Date(data.date)
    const daysUntilTravel = Math.ceil((travelDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    const dataPoint: PriceDataPoint = {
      ...data,
      recordedAt: new Date(),
      daysUntilTravel,
    }

    const key = `${data.route}_${data.date}`
    const history = this.priceHistory.get(key) || []
    history.push(dataPoint)
    this.priceHistory.set(key, history)
  }

  /**
   * Get price prediction for a route
   */
  async predictPrice(
    route: string,
    travelDate: string,
    currentPrice: number
  ): Promise<PricePrediction> {
    const key = `${route}_${travelDate}`
    const history = this.priceHistory.get(key) || []

    // Calculate prediction based on multiple factors
    const factors = this.analyzePriceFactors(route, travelDate, currentPrice)
    const predictedPrice = this.calculatePredictedPrice(currentPrice, factors)
    const trend = this.determineTrend(history, factors)
    const confidence = this.calculateConfidence(history.length, factors)
    const recommendation = this.getRecommendation(currentPrice, predictedPrice, trend, confidence)
    const bestBuyWindow = this.calculateBestBuyWindow(travelDate, trend)

    return {
      route,
      travelDate,
      currentPrice,
      predictedPrice: Math.round(predictedPrice),
      confidence,
      trend,
      recommendation,
      bestBuyWindow,
      priceHistory: history.map(h => ({ date: h.recordedAt.toISOString(), price: h.price })),
      factors,
    }
  }

  /**
   * Get booking recommendation
   */
  async getBookingRecommendation(
    route: string,
    travelDate: string,
    currentPrice: number
  ): Promise<BookingRecommendation> {
    const prediction = await this.predictPrice(route, travelDate, currentPrice)
    const daysUntilTravel = Math.ceil(
      (new Date(travelDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    // Analyze urgency
    const urgency = this.calculateUrgency(daysUntilTravel, prediction.trend, prediction.confidence)

    // Check for alternatives
    const alternatives = await this.findAlternatives(route, travelDate, currentPrice)

    if (prediction.recommendation === 'buy_now') {
      return {
        action: 'book_now',
        urgency,
        reason: this.generateReason(prediction, daysUntilTravel),
        potentialSavings: 0,
        alternativeRoutes: alternatives.length > 0 ? alternatives : undefined,
      }
    }

    if (prediction.recommendation === 'wait' && prediction.trend === 'falling') {
      const waitDays = this.calculateOptimalWaitDays(daysUntilTravel, prediction)
      return {
        action: 'wait_days',
        urgency,
        reason: `Prices are expected to drop. Wait ${waitDays} days for better rates.`,
        potentialSavings: Math.round(currentPrice - prediction.predictedPrice),
        waitDays,
      }
    }

    if (alternatives.length > 0 && alternatives[0].savings > currentPrice * 0.1) {
      return {
        action: 'consider_alternative',
        urgency: 'medium',
        reason: `Consider ${alternatives[0].route} for $${alternatives[0].savings} savings`,
        potentialSavings: alternatives[0].savings,
        alternativeRoutes: alternatives,
      }
    }

    return {
      action: 'set_alert',
      urgency: 'low',
      reason: 'Set a price alert to catch the best deal',
      potentialSavings: Math.round(currentPrice * 0.15),
    }
  }

  /**
   * Analyze travel trends for a route
   */
  async analyzeTrends(route: string): Promise<TravelTrend> {
    // Get historical data (mock for now)
    const avgPrice = 450 + Math.random() * 200
    const priceChange = (Math.random() - 0.5) * 20

    const popularDays = this.getPopularDays(route)
    const { cheapestMonth, peakMonths } = this.getSeasonalPatterns(route)

    return {
      route,
      period: 'month',
      demandTrend: priceChange > 5 ? 'increasing' : priceChange < -5 ? 'decreasing' : 'stable',
      avgPrice: Math.round(avgPrice),
      priceChange: Math.round(priceChange * 10) / 10,
      popularDays,
      cheapestMonth,
      peakMonths,
    }
  }

  /**
   * Get price forecast for next 30 days
   */
  async getForecast(
    route: string,
    basePrice: number
  ): Promise<Array<{ date: string; predictedPrice: number; confidence: number }>> {
    const forecast: Array<{ date: string; predictedPrice: number; confidence: number }> = []

    for (let i = 1; i <= 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      const prediction = await this.predictPrice(route, dateStr, basePrice)
      forecast.push({
        date: dateStr,
        predictedPrice: prediction.predictedPrice,
        confidence: prediction.confidence,
      })
    }

    return forecast
  }

  // Private methods

  private analyzePriceFactors(route: string, travelDate: string, currentPrice: number): PriceFactor[] {
    const factors: PriceFactor[] = []
    const date = new Date(travelDate)
    const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    // Seasonal factor
    const month = date.toLocaleString('en', { month: 'short' }).toLowerCase()
    const seasonalFactor = SEASONAL_FACTORS[month] || 1.0
    factors.push({
      name: 'Seasonal Demand',
      impact: seasonalFactor > 1.1 ? 'negative' : seasonalFactor < 0.95 ? 'positive' : 'neutral',
      description: seasonalFactor > 1.1
        ? `${month.charAt(0).toUpperCase() + month.slice(1)} is peak travel season`
        : seasonalFactor < 0.95
          ? `${month.charAt(0).toUpperCase() + month.slice(1)} is low season - better prices`
          : 'Average seasonal demand',
      weight: Math.round((seasonalFactor - 1) * 100),
    })

    // Advance booking factor
    const advanceFactor = this.getAdvanceBookingFactor(daysUntil)
    factors.push({
      name: 'Booking Window',
      impact: advanceFactor > 1.1 ? 'negative' : advanceFactor < 0.95 ? 'positive' : 'neutral',
      description: daysUntil < 14
        ? 'Last-minute booking - prices are highest'
        : daysUntil > 60
          ? 'Good advance booking window'
          : 'Normal booking window',
      weight: Math.round((advanceFactor - 1) * 100),
    })

    // Day of week factor
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6
    factors.push({
      name: 'Travel Day',
      impact: isWeekend ? 'negative' : 'positive',
      description: isWeekend
        ? 'Weekend travel typically costs more'
        : 'Midweek travel offers better rates',
      weight: isWeekend ? 10 : -5,
    })

    // Route type factor
    const isInternational = this.isInternationalRoute(route)
    const volatility = isInternational ? 0.25 : 0.15
    factors.push({
      name: 'Route Type',
      impact: 'neutral',
      description: isInternational ? 'International routes have higher volatility' : 'Domestic route - more stable pricing',
      weight: 0,
    })

    // Competition factor (mock)
    const hasCompetition = Math.random() > 0.3
    if (hasCompetition) {
      factors.push({
        name: 'Airline Competition',
        impact: 'positive',
        description: 'Multiple airlines serve this route - competitive pricing',
        weight: -10,
      })
    }

    return factors
  }

  private calculatePredictedPrice(currentPrice: number, factors: PriceFactor[]): number {
    let adjustedPrice = currentPrice

    // Apply all factor weights
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0)
    adjustedPrice = currentPrice * (1 + totalWeight / 100)

    // Add some variance for realism
    const variance = (Math.random() - 0.5) * 0.05
    adjustedPrice *= (1 + variance)

    return Math.max(50, adjustedPrice) // Minimum price floor
  }

  private determineTrend(history: PriceDataPoint[], factors: PriceFactor[]): 'rising' | 'falling' | 'stable' {
    // Check recent price history
    if (history.length >= 3) {
      const recent = history.slice(-3)
      const avgRecent = recent.reduce((s, p) => s + p.price, 0) / recent.length
      const older = history.slice(-6, -3)
      if (older.length > 0) {
        const avgOlder = older.reduce((s, p) => s + p.price, 0) / older.length
        const change = (avgRecent - avgOlder) / avgOlder
        if (change > 0.05) return 'rising'
        if (change < -0.05) return 'falling'
      }
    }

    // Use factors to predict trend
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0)
    if (totalWeight > 10) return 'rising'
    if (totalWeight < -10) return 'falling'
    return 'stable'
  }

  private calculateConfidence(historyLength: number, factors: PriceFactor[]): number {
    // Base confidence from historical data
    let confidence = Math.min(50, historyLength * 10)

    // Add confidence from factor analysis
    confidence += Math.min(40, factors.length * 8)

    // Cap at 95% - never fully confident
    return Math.min(95, confidence)
  }

  private getRecommendation(
    current: number,
    predicted: number,
    trend: string,
    confidence: number
  ): 'buy_now' | 'wait' | 'set_alert' {
    const priceDiff = (predicted - current) / current

    // Strong confidence in price increase - buy now
    if (confidence > 70 && priceDiff > 0.05) return 'buy_now'

    // Price falling and confident - wait
    if (confidence > 60 && priceDiff < -0.05) return 'wait'

    // High price increase expected but low confidence - set alert
    if (priceDiff > 0.1) return 'buy_now'

    // Default to alert for uncertainty
    return 'set_alert'
  }

  private calculateBestBuyWindow(travelDate: string, trend: string): { start: Date; end: Date } | null {
    const travel = new Date(travelDate)
    const now = new Date()
    const daysUntil = Math.ceil((travel.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 14) return null // Too close, buy now

    // Optimal window is typically 3-6 weeks before travel
    const optimalDays = Math.min(45, Math.max(21, daysUntil - 30))
    const windowStart = new Date(travel)
    windowStart.setDate(windowStart.getDate() - optimalDays - 7)
    const windowEnd = new Date(travel)
    windowEnd.setDate(windowEnd.getDate() - optimalDays + 7)

    // Ensure window is in the future
    if (windowEnd < now) return null
    if (windowStart < now) windowStart.setTime(now.getTime())

    return { start: windowStart, end: windowEnd }
  }

  private getAdvanceBookingFactor(daysUntil: number): number {
    for (const point of ADVANCE_BOOKING_CURVE) {
      if (daysUntil <= point.days) return point.factor
    }
    return 1.0
  }

  private calculateUrgency(
    daysUntil: number,
    trend: string,
    confidence: number
  ): 'high' | 'medium' | 'low' {
    if (daysUntil < 7) return 'high'
    if (daysUntil < 14 && trend === 'rising') return 'high'
    if (trend === 'rising' && confidence > 70) return 'medium'
    return 'low'
  }

  private calculateOptimalWaitDays(daysUntil: number, prediction: PricePrediction): number {
    // Don't wait if less than 3 weeks out
    if (daysUntil < 21) return 0

    // Optimal is about 3-6 weeks before travel
    const optimalWindow = Math.max(21, daysUntil - 45)
    return Math.min(14, daysUntil - optimalWindow)
  }

  private async findAlternatives(
    route: string,
    travelDate: string,
    currentPrice: number
  ): Promise<Array<{ route: string; price: number; savings: number }>> {
    // Mock alternative routes
    const [origin, dest] = route.split('-')
    const alternatives: Array<{ route: string; price: number; savings: number }> = []

    // Nearby airports
    const nearbyAirports: Record<string, string[]> = {
      'JFK': ['EWR', 'LGA'],
      'LAX': ['SNA', 'BUR', 'ONT'],
      'ORD': ['MDW'],
      'LHR': ['LGW', 'STN'],
    }

    const nearbyOrigins = nearbyAirports[origin] || []
    const nearbyDests = nearbyAirports[dest] || []

    // Generate alternatives with random savings
    for (const alt of nearbyOrigins) {
      const savings = Math.round(currentPrice * (0.1 + Math.random() * 0.15))
      if (savings > 20) {
        alternatives.push({
          route: `${alt}-${dest}`,
          price: currentPrice - savings,
          savings,
        })
      }
    }

    return alternatives.sort((a, b) => b.savings - a.savings).slice(0, 3)
  }

  private getPopularDays(route: string): string[] {
    // Most routes have similar patterns
    return ['Friday', 'Sunday', 'Monday']
  }

  private getSeasonalPatterns(route: string): { cheapestMonth: string; peakMonths: string[] } {
    // Find cheapest and peak months from seasonal factors
    let cheapest = 'January'
    let cheapestFactor = 2

    Object.entries(SEASONAL_FACTORS).forEach(([month, factor]) => {
      if (factor < cheapestFactor) {
        cheapestFactor = factor
        cheapest = month.charAt(0).toUpperCase() + month.slice(1)
      }
    })

    const peakMonths = Object.entries(SEASONAL_FACTORS)
      .filter(([, factor]) => factor > 1.15)
      .map(([month]) => month.charAt(0).toUpperCase() + month.slice(1))

    return { cheapestMonth: cheapest, peakMonths }
  }

  private isInternationalRoute(route: string): boolean {
    const usAirports = ['JFK', 'LAX', 'ORD', 'SFO', 'MIA', 'ATL', 'DFW', 'DEN', 'SEA', 'BOS', 'EWR', 'IAD', 'PHX']
    const [origin, dest] = route.split('-')
    return !(usAirports.includes(origin) && usAirports.includes(dest))
  }

  private generateReason(prediction: PricePrediction, daysUntil: number): string {
    const reasons: string[] = []

    if (prediction.trend === 'rising') {
      reasons.push('Prices are trending upward')
    }

    if (daysUntil < 14) {
      reasons.push('Last-minute booking window')
    }

    const negativeFactor = prediction.factors.find(f => f.impact === 'negative' && Math.abs(f.weight) > 10)
    if (negativeFactor) {
      reasons.push(negativeFactor.description)
    }

    return reasons.length > 0 ? reasons.join('. ') + '.' : 'Current price is competitive.'
  }
}

export const predictivePricingEngine = new PredictivePricingEngine()
