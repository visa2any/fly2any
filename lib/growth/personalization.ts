/**
 * ML Personalization Engine - Fly2Any Growth OS
 * User behavior tracking, scoring, and personalized recommendations
 */

export interface UserBehavior {
  userId: string
  sessionId: string
  events: BehaviorEvent[]
  preferences: UserPreferences
  score: UserScore
  segments: string[]
  lastUpdated: Date
}

export interface BehaviorEvent {
  type: EventType
  timestamp: Date
  data: Record<string, any>
  weight: number
}

export type EventType =
  | 'search'
  | 'view_result'
  | 'click_flight'
  | 'start_booking'
  | 'complete_booking'
  | 'create_alert'
  | 'share'
  | 'refer'
  | 'review'
  | 'page_view'
  | 'time_on_page'

export interface UserPreferences {
  preferredOrigins: string[]
  preferredDestinations: string[]
  preferredAirlines: string[]
  priceRange: { min: number; max: number }
  travelStyle: 'budget' | 'comfort' | 'luxury' | 'unknown'
  tripTypes: Array<'business' | 'leisure' | 'family' | 'solo'>
  preferredCabin: 'economy' | 'premium_economy' | 'business' | 'first'
  flexibility: 'fixed' | 'flexible' | 'very_flexible'
  bookingWindow: 'last_minute' | 'advance' | 'far_advance'
}

export interface UserScore {
  engagementScore: number // 0-100
  intentScore: number // 0-100 likelihood to book
  valueScore: number // 0-100 potential lifetime value
  loyaltyScore: number // 0-100
  overallScore: number // weighted average
}

export interface PersonalizedContent {
  heroDeals: DealRecommendation[]
  suggestedRoutes: RouteRecommendation[]
  emailSubject: string
  ctaText: string
  featuredDestinations: string[]
}

export interface DealRecommendation {
  origin: string
  destination: string
  price: number
  savings: number
  relevanceScore: number
  reason: string
}

export interface RouteRecommendation {
  origin: string
  destination: string
  avgPrice: number
  popularity: number
  matchScore: number
}

// Event weights for scoring
const EVENT_WEIGHTS: Record<EventType, number> = {
  search: 5,
  view_result: 3,
  click_flight: 10,
  start_booking: 25,
  complete_booking: 100,
  create_alert: 15,
  share: 20,
  refer: 30,
  review: 25,
  page_view: 1,
  time_on_page: 2,
}

// Decay factor for older events (per day)
const DECAY_FACTOR = 0.95

export class PersonalizationEngine {
  private userBehaviors: Map<string, UserBehavior> = new Map()

  /**
   * Track user event
   */
  trackEvent(
    userId: string,
    sessionId: string,
    eventType: EventType,
    data: Record<string, any> = {}
  ): void {
    const behavior = this.getOrCreateBehavior(userId, sessionId)

    const event: BehaviorEvent = {
      type: eventType,
      timestamp: new Date(),
      data,
      weight: EVENT_WEIGHTS[eventType],
    }

    behavior.events.push(event)
    this.updatePreferences(behavior, event)
    this.updateScore(behavior)

    console.log(`[Personalization] Tracked ${eventType} for user ${userId}`)
  }

  /**
   * Get user behavior profile
   */
  getUserProfile(userId: string): UserBehavior | null {
    return this.userBehaviors.get(userId) || null
  }

  /**
   * Calculate user score
   */
  calculateScore(userId: string): UserScore {
    const behavior = this.userBehaviors.get(userId)
    if (!behavior) {
      return { engagementScore: 0, intentScore: 0, valueScore: 0, loyaltyScore: 0, overallScore: 0 }
    }

    return this.updateScore(behavior)
  }

  /**
   * Get personalized content for user
   */
  async getPersonalizedContent(userId: string): Promise<PersonalizedContent> {
    const behavior = this.userBehaviors.get(userId)
    const prefs = behavior?.preferences

    // Generate personalized deals
    const heroDeals = await this.getPersonalizedDeals(prefs)
    const suggestedRoutes = await this.getSuggestedRoutes(prefs)
    const featuredDestinations = await this.getFeaturedDestinations(prefs)

    // Personalized messaging based on user segment
    const segment = this.getPrimarySegment(behavior)
    const { emailSubject, ctaText } = this.getPersonalizedMessaging(segment)

    return {
      heroDeals,
      suggestedRoutes,
      emailSubject,
      ctaText,
      featuredDestinations,
    }
  }

  /**
   * Get personalized deal recommendations
   */
  async getPersonalizedDeals(prefs?: UserPreferences): Promise<DealRecommendation[]> {
    // Mock deals - in production, fetch from database and ML model
    const allDeals: DealRecommendation[] = [
      { origin: 'JFK', destination: 'LHR', price: 450, savings: 200, relevanceScore: 0, reason: '' },
      { origin: 'LAX', destination: 'NRT', price: 680, savings: 320, relevanceScore: 0, reason: '' },
      { origin: 'SFO', destination: 'CDG', price: 520, savings: 180, relevanceScore: 0, reason: '' },
      { origin: 'ORD', destination: 'FCO', price: 490, savings: 210, relevanceScore: 0, reason: '' },
      { origin: 'MIA', destination: 'CUN', price: 180, savings: 70, relevanceScore: 0, reason: '' },
    ]

    // Score each deal based on user preferences
    return allDeals.map(deal => {
      let score = 50 // Base score

      if (prefs) {
        // Boost if matches preferred origins
        if (prefs.preferredOrigins.includes(deal.origin)) {
          score += 20
          deal.reason = 'From your preferred airport'
        }

        // Boost if matches preferred destinations
        if (prefs.preferredDestinations.includes(deal.destination)) {
          score += 25
          deal.reason = 'You searched this destination before'
        }

        // Check price range
        if (deal.price >= prefs.priceRange.min && deal.price <= prefs.priceRange.max) {
          score += 15
          if (!deal.reason) deal.reason = 'Within your budget'
        }

        // High savings always relevant
        if (deal.savings > 200) {
          score += 10
          if (!deal.reason) deal.reason = `Save $${deal.savings}!`
        }
      }

      return { ...deal, relevanceScore: Math.min(100, score), reason: deal.reason || 'Great deal' }
    }).sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  /**
   * Get route suggestions
   */
  async getSuggestedRoutes(prefs?: UserPreferences): Promise<RouteRecommendation[]> {
    const routes: RouteRecommendation[] = []

    if (prefs?.preferredOrigins.length) {
      const origin = prefs.preferredOrigins[0]

      // Popular routes from preferred origin
      routes.push(
        { origin, destination: 'LHR', avgPrice: 480, popularity: 95, matchScore: 90 },
        { origin, destination: 'CDG', avgPrice: 520, popularity: 88, matchScore: 85 },
        { origin, destination: 'NRT', avgPrice: 720, popularity: 75, matchScore: 70 },
      )
    }

    // Fill with popular routes if needed
    if (routes.length < 5) {
      routes.push(
        { origin: 'JFK', destination: 'LHR', avgPrice: 450, popularity: 98, matchScore: 60 },
        { origin: 'LAX', destination: 'HNL', avgPrice: 280, popularity: 92, matchScore: 55 },
      )
    }

    return routes.slice(0, 5)
  }

  /**
   * Get featured destinations for user
   */
  async getFeaturedDestinations(prefs?: UserPreferences): Promise<string[]> {
    if (prefs?.preferredDestinations.length) {
      // Mix of searched destinations and similar ones
      return [...prefs.preferredDestinations.slice(0, 3), 'Paris', 'Tokyo', 'London'].slice(0, 6)
    }

    // Default popular destinations
    return ['Paris', 'London', 'Tokyo', 'Barcelona', 'Rome', 'Dubai']
  }

  /**
   * Segment user based on behavior
   */
  segmentUser(userId: string): string[] {
    const behavior = this.userBehaviors.get(userId)
    if (!behavior) return ['new_user']

    const segments: string[] = []
    const score = behavior.score

    // Engagement-based segments
    if (score.engagementScore > 80) segments.push('power_user')
    else if (score.engagementScore > 50) segments.push('active_user')
    else if (score.engagementScore > 20) segments.push('casual_user')
    else segments.push('dormant_user')

    // Intent-based segments
    if (score.intentScore > 70) segments.push('high_intent')
    else if (score.intentScore > 40) segments.push('medium_intent')
    else segments.push('browsing')

    // Value-based segments
    if (score.valueScore > 80) segments.push('high_value')
    else if (score.valueScore > 40) segments.push('medium_value')

    // Behavior-based segments
    const prefs = behavior.preferences
    if (prefs.travelStyle === 'luxury') segments.push('luxury_traveler')
    if (prefs.travelStyle === 'budget') segments.push('budget_conscious')
    if (prefs.tripTypes.includes('business')) segments.push('business_traveler')
    if (prefs.tripTypes.includes('family')) segments.push('family_traveler')

    // Event-based segments
    const hasAlerts = behavior.events.some(e => e.type === 'create_alert')
    if (hasAlerts) segments.push('deal_hunter')

    const hasReferred = behavior.events.some(e => e.type === 'refer')
    if (hasReferred) segments.push('advocate')

    behavior.segments = segments
    return segments
  }

  /**
   * Get dynamic homepage content
   */
  async getDynamicHomepage(userId: string): Promise<{
    headline: string
    subheadline: string
    deals: DealRecommendation[]
    cta: string
  }> {
    const behavior = this.userBehaviors.get(userId)
    const segments = behavior?.segments || ['new_user']

    let headline = 'Find Your Perfect Flight'
    let subheadline = 'Search 1000+ airlines for the best deals'
    let cta = 'Search Flights'

    if (segments.includes('power_user')) {
      headline = 'Welcome Back!'
      subheadline = 'We found new deals on your favorite routes'
      cta = 'See My Deals'
    } else if (segments.includes('high_intent')) {
      headline = 'Ready to Book?'
      subheadline = 'Your dream trip is just a click away'
      cta = 'Continue Booking'
    } else if (segments.includes('deal_hunter')) {
      headline = 'Today\'s Best Deals'
      subheadline = 'Prices dropped on routes you\'re watching'
      cta = 'View Price Drops'
    } else if (segments.includes('luxury_traveler')) {
      headline = 'Premium Travel, Better Prices'
      subheadline = 'Business & First Class deals just for you'
      cta = 'Explore Premium'
    }

    const deals = await this.getPersonalizedDeals(behavior?.preferences)

    return { headline, subheadline, deals, cta }
  }

  /**
   * Get personalized email content
   */
  getPersonalizedEmailContent(userId: string): {
    subject: string
    preheader: string
    ctaText: string
    tone: 'urgent' | 'friendly' | 'professional' | 'exciting'
  } {
    const segments = this.segmentUser(userId)

    if (segments.includes('high_intent')) {
      return {
        subject: 'Don\'t miss out - prices are rising!',
        preheader: 'Complete your booking before prices change',
        ctaText: 'Book Now',
        tone: 'urgent',
      }
    }

    if (segments.includes('deal_hunter')) {
      return {
        subject: '🔥 Price drop on your watched routes!',
        preheader: 'The deals you\'ve been waiting for are here',
        ctaText: 'See Deals',
        tone: 'exciting',
      }
    }

    if (segments.includes('business_traveler')) {
      return {
        subject: 'Business class deals for your next trip',
        preheader: 'Premium travel at affordable prices',
        ctaText: 'View Options',
        tone: 'professional',
      }
    }

    return {
      subject: 'Your weekly flight deals are here!',
      preheader: 'Save big on flights to top destinations',
      ctaText: 'Explore Deals',
      tone: 'friendly',
    }
  }

  // Private methods

  private getOrCreateBehavior(userId: string, sessionId: string): UserBehavior {
    let behavior = this.userBehaviors.get(userId)

    if (!behavior) {
      behavior = {
        userId,
        sessionId,
        events: [],
        preferences: this.getDefaultPreferences(),
        score: { engagementScore: 0, intentScore: 0, valueScore: 0, loyaltyScore: 0, overallScore: 0 },
        segments: ['new_user'],
        lastUpdated: new Date(),
      }
      this.userBehaviors.set(userId, behavior)
    }

    return behavior
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      preferredOrigins: [],
      preferredDestinations: [],
      preferredAirlines: [],
      priceRange: { min: 0, max: 2000 },
      travelStyle: 'unknown',
      tripTypes: [],
      preferredCabin: 'economy',
      flexibility: 'flexible',
      bookingWindow: 'advance',
    }
  }

  private updatePreferences(behavior: UserBehavior, event: BehaviorEvent): void {
    const prefs = behavior.preferences
    const data = event.data

    switch (event.type) {
      case 'search':
        if (data.origin && !prefs.preferredOrigins.includes(data.origin)) {
          prefs.preferredOrigins = [data.origin, ...prefs.preferredOrigins].slice(0, 5)
        }
        if (data.destination && !prefs.preferredDestinations.includes(data.destination)) {
          prefs.preferredDestinations = [data.destination, ...prefs.preferredDestinations].slice(0, 10)
        }
        if (data.cabin) prefs.preferredCabin = data.cabin
        break

      case 'click_flight':
        if (data.airline && !prefs.preferredAirlines.includes(data.airline)) {
          prefs.preferredAirlines = [data.airline, ...prefs.preferredAirlines].slice(0, 5)
        }
        if (data.price) {
          // Update price range based on clicks
          prefs.priceRange.max = Math.max(prefs.priceRange.max, data.price * 1.5)
          prefs.priceRange.min = Math.min(prefs.priceRange.min, data.price * 0.5)
        }
        break

      case 'complete_booking':
        // Booking data is strongest signal
        if (data.cabin === 'business' || data.cabin === 'first') {
          prefs.travelStyle = 'luxury'
        }
        if (data.tripType && !prefs.tripTypes.includes(data.tripType)) {
          prefs.tripTypes.push(data.tripType)
        }
        break
    }

    behavior.lastUpdated = new Date()
  }

  private updateScore(behavior: UserBehavior): UserScore {
    const now = Date.now()

    // Calculate engagement score based on weighted events with decay
    let totalWeight = 0
    behavior.events.forEach(event => {
      const daysSince = (now - event.timestamp.getTime()) / (1000 * 60 * 60 * 24)
      const decayedWeight = event.weight * Math.pow(DECAY_FACTOR, daysSince)
      totalWeight += decayedWeight
    })

    const engagementScore = Math.min(100, totalWeight / 5)

    // Calculate intent score based on funnel progression
    const hasSearch = behavior.events.some(e => e.type === 'search')
    const hasClick = behavior.events.some(e => e.type === 'click_flight')
    const hasStartBooking = behavior.events.some(e => e.type === 'start_booking')
    const hasBooking = behavior.events.some(e => e.type === 'complete_booking')
    const hasAlert = behavior.events.some(e => e.type === 'create_alert')

    let intentScore = 0
    if (hasSearch) intentScore += 20
    if (hasClick) intentScore += 25
    if (hasStartBooking) intentScore += 35
    if (hasAlert) intentScore += 15
    if (hasBooking) intentScore = 100

    // Calculate value score
    const bookings = behavior.events.filter(e => e.type === 'complete_booking')
    const totalSpent = bookings.reduce((sum, e) => sum + (e.data.price || 0), 0)
    const valueScore = Math.min(100, totalSpent / 20) // $2000 = 100 score

    // Loyalty score based on repeat behavior
    const uniqueDays = new Set(behavior.events.map(e =>
      e.timestamp.toISOString().split('T')[0]
    )).size
    const loyaltyScore = Math.min(100, uniqueDays * 5)

    // Overall weighted score
    const overallScore = Math.round(
      engagementScore * 0.25 +
      intentScore * 0.35 +
      valueScore * 0.25 +
      loyaltyScore * 0.15
    )

    behavior.score = { engagementScore, intentScore, valueScore, loyaltyScore, overallScore }
    return behavior.score
  }

  private getPrimarySegment(behavior?: UserBehavior): string {
    if (!behavior) return 'new_user'
    return behavior.segments[0] || 'casual_user'
  }

  private getPersonalizedMessaging(segment: string): { emailSubject: string; ctaText: string } {
    const messaging: Record<string, { emailSubject: string; ctaText: string }> = {
      power_user: { emailSubject: 'Your personalized deals are ready', ctaText: 'View My Deals' },
      high_intent: { emailSubject: 'Complete your booking - prices may change', ctaText: 'Book Now' },
      deal_hunter: { emailSubject: 'Price drops on your watched routes!', ctaText: 'See Price Drops' },
      luxury_traveler: { emailSubject: 'Premium travel at unbeatable prices', ctaText: 'Explore Premium' },
      business_traveler: { emailSubject: 'Business class deals for your next trip', ctaText: 'View Business Class' },
      new_user: { emailSubject: 'Welcome to Fly2Any - Start saving today', ctaText: 'Start Searching' },
      default: { emailSubject: 'This week\'s best flight deals', ctaText: 'Explore Deals' },
    }

    return messaging[segment] || messaging.default
  }
}

export const personalizationEngine = new PersonalizationEngine()
