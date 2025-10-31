/**
 * REAL-TIME URGENCY ENGINE
 * =========================
 * Generates urgency signals to drive conversion:
 * - Price lock timers
 * - Social proof (viewing count, recent bookings)
 * - ML price predictions
 * - Scarcity indicators
 */

interface UrgencySignals {
  // Price lock
  priceLock: {
    active: boolean;
    minutesRemaining: number;
    secondsRemaining: number;
  };

  // Social proof
  socialProof: {
    currentViewers: number;
    recentBookings: number;
    bookingsToday: number;
    seatsRemainingAtPrice: number;
  };

  // ML predictions
  mlPredictions: {
    priceTrend: 'rising' | 'stable' | 'falling';
    predictionPercent: number;
    confidenceScore: number;
    timeframe: '24h' | '48h' | '72h';
  };

  // Scarcity
  scarcity: {
    seatsRemaining: number;
    isLowInventory: boolean;
    popularSeatsRemaining?: number; // e.g., window seats
  };

  // Deal quality
  dealQuality: {
    percentVsAverage: number; // -20% = 20% cheaper
    isGoodDeal: boolean;
    isExcellentDeal: boolean;
  };
}

interface FlightContext {
  flightId: string;
  route: string;
  price: number;
  departureDate: string;
  airline: string;
  seatsAvailable?: number;
}

export class UrgencyEngine {
  private priceLocksMap: Map<string, Date> = new Map();
  private viewingCountMap: Map<string, Set<string>> = new Map();
  private bookingCountMap: Map<string, number> = new Map();

  constructor() {
    // Cleanup old data every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Generate real-time urgency signals for a flight
   */
  async generateUrgencySignals(
    flight: FlightContext,
    sessionId: string
  ): Promise<UrgencySignals> {
    return {
      priceLock: this.generatePriceLock(flight.flightId),
      socialProof: this.generateSocialProof(flight.flightId, sessionId),
      mlPredictions: await this.generateMLPredictions(flight),
      scarcity: this.generateScarcitySignals(flight),
      dealQuality: this.generateDealQuality(flight),
    };
  }

  /**
   * Price lock timer (10 minutes)
   */
  private generatePriceLock(flightId: string): {
    active: boolean;
    minutesRemaining: number;
    secondsRemaining: number;
  } {
    const now = new Date();
    let lockTime = this.priceLocksMap.get(flightId);

    // Create new lock if doesn't exist
    if (!lockTime) {
      lockTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
      this.priceLocksMap.set(flightId, lockTime);
    }

    // Calculate remaining time
    const remaining = lockTime.getTime() - now.getTime();

    if (remaining <= 0) {
      // Lock expired, create new one
      lockTime = new Date(now.getTime() + 10 * 60 * 1000);
      this.priceLocksMap.set(flightId, lockTime);
      return {
        active: true,
        minutesRemaining: 10,
        secondsRemaining: 0,
      };
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      active: true,
      minutesRemaining: minutes,
      secondsRemaining: seconds,
    };
  }

  /**
   * Social proof signals
   */
  private generateSocialProof(flightId: string, sessionId: string): {
    currentViewers: number;
    recentBookings: number;
    bookingsToday: number;
    seatsRemainingAtPrice: number;
  } {
    // Track viewing session
    if (!this.viewingCountMap.has(flightId)) {
      this.viewingCountMap.set(flightId, new Set());
    }
    this.viewingCountMap.get(flightId)!.add(sessionId);

    // Current viewers (with some randomization for realism)
    const baseViewers = this.viewingCountMap.get(flightId)!.size;
    const currentViewers = baseViewers + Math.floor(Math.random() * 20) + 10; // Add 10-30 virtual viewers

    // Recent bookings (simulated with slight randomness)
    const recentBookings = Math.floor(Math.random() * 8) + 5; // 5-12 bookings in last hour

    // Bookings today (higher for popular routes)
    const bookingsToday = Math.floor(Math.random() * 100) + 50; // 50-150 bookings today

    // Seats at this price (scarcity)
    const seatsRemainingAtPrice = Math.floor(Math.random() * 15) + 5; // 5-20 seats

    return {
      currentViewers,
      recentBookings,
      bookingsToday,
      seatsRemainingAtPrice,
    };
  }

  /**
   * ML price predictions
   */
  private async generateMLPredictions(flight: FlightContext): Promise<{
    priceTrend: 'rising' | 'stable' | 'falling';
    predictionPercent: number;
    confidenceScore: number;
    timeframe: '24h' | '48h' | '72h';
  }> {
    // In production: Call actual ML price prediction model
    // For now: Use heuristics based on booking patterns

    const daysUntilDeparture = this.getDaysUntilDeparture(flight.departureDate);

    let priceTrend: 'rising' | 'stable' | 'falling' = 'stable';
    let predictionPercent = 0;
    let confidenceScore = 0.75;

    // Heuristic rules
    if (daysUntilDeparture < 7) {
      // Last minute - prices usually rise
      priceTrend = 'rising';
      predictionPercent = Math.floor(Math.random() * 10) + 5; // 5-15% rise
      confidenceScore = 0.85;
    } else if (daysUntilDeparture < 14) {
      // 1-2 weeks out - could go either way
      const rand = Math.random();
      if (rand > 0.6) {
        priceTrend = 'rising';
        predictionPercent = Math.floor(Math.random() * 8) + 3; // 3-10%
      } else if (rand < 0.3) {
        priceTrend = 'falling';
        predictionPercent = Math.floor(Math.random() * 5) + 2; // 2-7%
      }
      confidenceScore = 0.65;
    } else if (daysUntilDeparture > 60) {
      // Far in advance - prices may drop
      priceTrend = 'falling';
      predictionPercent = Math.floor(Math.random() * 7) + 3; // 3-10%
      confidenceScore = 0.70;
    }

    return {
      priceTrend,
      predictionPercent,
      confidenceScore,
      timeframe: daysUntilDeparture < 7 ? '24h' : daysUntilDeparture < 30 ? '48h' : '72h',
    };
  }

  /**
   * Scarcity signals
   */
  private generateScarcitySignals(flight: FlightContext): {
    seatsRemaining: number;
    isLowInventory: boolean;
    popularSeatsRemaining?: number;
  } {
    // In production: Get from actual seat map API
    const seatsRemaining = flight.seatsAvailable || Math.floor(Math.random() * 50) + 20;
    const isLowInventory = seatsRemaining < 15;

    // Popular seats (window/aisle) remaining
    const popularSeatsRemaining = Math.floor(seatsRemaining * 0.4); // ~40% are window/aisle

    return {
      seatsRemaining,
      isLowInventory,
      popularSeatsRemaining,
    };
  }

  /**
   * Deal quality assessment
   */
  private generateDealQuality(flight: FlightContext): {
    percentVsAverage: number;
    isGoodDeal: boolean;
    isExcellentDeal: boolean;
  } {
    // In production: Compare against historical average for route
    // For now: Use randomization within realistic range

    // Simulate: Most flights are -5% to +15% vs average
    const percentVsAverage = (Math.random() * 20) - 5; // -5% to +15%

    const isGoodDeal = percentVsAverage < 0; // Below average
    const isExcellentDeal = percentVsAverage < -10; // 10%+ below average

    return {
      percentVsAverage: Math.round(percentVsAverage),
      isGoodDeal,
      isExcellentDeal,
    };
  }

  /**
   * Helper: Calculate days until departure
   */
  private getDaysUntilDeparture(departureDate: string): number {
    const now = new Date();
    const departure = new Date(departureDate);
    const diffTime = departure.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * Cleanup old data
   */
  private cleanup() {
    const now = new Date();

    // Remove expired price locks
    for (const [flightId, lockTime] of this.priceLocksMap.entries()) {
      if (lockTime.getTime() < now.getTime()) {
        this.priceLocksMap.delete(flightId);
      }
    }

    // Clear viewing sessions older than 30 minutes
    // (In production: would use Redis with TTL)
    this.viewingCountMap.clear();
  }

  /**
   * Record a booking (updates social proof)
   */
  recordBooking(flightId: string) {
    const current = this.bookingCountMap.get(flightId) || 0;
    this.bookingCountMap.set(flightId, current + 1);
  }
}

// Singleton instance
export const urgencyEngine = new UrgencyEngine();
