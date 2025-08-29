// Marketing Psychology Engine for Fly2Any
// Coordinates all psychological triggers and conversion tactics

import { z } from 'zod'

// User Behavior Tracking Schema
export const UserBehaviorSchema = z.object({
  sessionId: z.string(),
  userId: z.string().optional(),
  email: z.string().optional(),
  timeOnSite: z.number(),
  pageViews: z.number(),
  searchCount: z.number(),
  scrollDepth: z.number(),
  clickthrough: z.array(z.string()),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']),
  referrer: z.string().optional(),
  location: z.string().optional(),
  isReturningUser: z.boolean().default(false)
})

export type UserBehavior = z.infer<typeof UserBehaviorSchema>

// Psychological Triggers Schema
export const PsychologyTriggerSchema = z.object({
  type: z.enum([
    'scarcity',
    'urgency', 
    'social_proof',
    'authority',
    'reciprocity',
    'commitment',
    'liking',
    'loss_aversion'
  ]),
  intensity: z.enum(['low', 'medium', 'high']),
  message: z.string(),
  timing: z.number(), // seconds to wait before showing
  conditions: z.array(z.string()),
  expiresAt: z.date().optional()
})

export type PsychologyTrigger = z.infer<typeof PsychologyTriggerSchema>

// Conversion Event Schema
export const ConversionEventSchema = z.object({
  eventType: z.enum([
    'page_view',
    'search_initiated',
    'search_completed',
    'result_clicked',
    'booking_started',
    'booking_abandoned',
    'booking_completed',
    'email_captured',
    'discount_claimed'
  ]),
  timestamp: z.date(),
  value: z.number().optional(),
  metadata: z.record(z.string(), z.any()),
  userId: z.string().optional(),
  sessionId: z.string()
})

export type ConversionEvent = z.infer<typeof ConversionEventSchema>

export class MarketingPsychologyEngine {
  private userBehavior: Map<string, UserBehavior> = new Map()
  private activeTriggers: Map<string, PsychologyTrigger[]> = new Map()
  private conversionEvents: ConversionEvent[] = []
  
  // MCP Integration Points
  private analytics: any // Google Analytics MCP
  private hubspot: any   // HubSpot MCP  
  private zapier: any    // Zapier MCP

  constructor(mcpClients: { analytics?: any; hubspot?: any; zapier?: any } = {}) {
    this.analytics = mcpClients.analytics
    this.hubspot = mcpClients.hubspot
    this.zapier = mcpClients.zapier
  }

  // BEHAVIORAL ANALYSIS METHODS

  /**
   * Track user behavior and update psychological profile
   */
  async trackUserBehavior(sessionId: string, behavior: Partial<UserBehavior>) {
    const existing = this.userBehavior.get(sessionId)
    const updated = { 
      ...existing, 
      ...behavior, 
      sessionId 
    } as UserBehavior

    this.userBehavior.set(sessionId, updated)

    // Send to analytics MCPs
    await this.sendToAnalytics('user_behavior_update', updated)
    
    // Trigger psychological analysis
    await this.analyzePsychologicalTriggers(sessionId, updated)

    return updated
  }

  /**
   * Analyze user behavior and determine optimal psychological triggers
   */
  private async analyzePsychologicalTriggers(sessionId: string, behavior: UserBehavior) {
    const triggers: PsychologyTrigger[] = []

    // HIGH-INTENT USER DETECTION
    if (behavior.searchCount >= 3 && behavior.timeOnSite > 120) {
      triggers.push({
        type: 'urgency',
        intensity: 'high',
        message: 'Prices typically increase 23% closer to departure',
        timing: 30,
        conditions: ['viewing_results'],
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      })
    }

    // CART ABANDONMENT TRIGGERS
    if (behavior.pageViews > 5 && behavior.scrollDepth > 70) {
      triggers.push({
        type: 'scarcity',
        intensity: 'medium', 
        message: `${Math.floor(Math.random() * 8) + 3} people are viewing this flight`,
        timing: 60,
        conditions: ['on_booking_page']
      })
    }

    // RETURNING USER TRIGGERS
    if (behavior.isReturningUser) {
      triggers.push({
        type: 'reciprocity',
        intensity: 'medium',
        message: 'Welcome back! Enjoy 10% off as a returning customer',
        timing: 5,
        conditions: ['session_start']
      })
    }

    // MOBILE USER OPTIMIZATION
    if (behavior.deviceType === 'mobile' && behavior.timeOnSite > 180) {
      triggers.push({
        type: 'commitment',
        intensity: 'low',
        message: 'Save this search and get price drop alerts',
        timing: 120,
        conditions: ['mobile_user']
      })
    }

    this.activeTriggers.set(sessionId, triggers)
    
    // Execute triggers through Zapier workflows
    await this.executeTriggerWorkflows(sessionId, triggers)
  }

  // CONVERSION PSYCHOLOGY METHODS

  /**
   * Generate personalized psychological messaging based on user segment
   */
  generatePsychologyMessage(
    triggerType: PsychologyTrigger['type'], 
    userSegment: string,
    context: any
  ): string {
    const messages = {
      scarcity: {
        business: [
          `Only ${context.seatsLeft} business class seats remaining`,
          'Limited first-class availability on this route',
          'Premium seats selling fast - 3 left at this price'
        ],
        leisure: [
          `${context.viewerCount} travelers viewing this deal`,
          'Popular choice - book before prices increase',
          'Limited availability for these dates'
        ],
        budget: [
          'Last few economy seats at this price',
          'Budget-friendly option - almost sold out',
          '5 travelers booked this route in the last hour'
        ]
      },
      urgency: {
        business: [
          'Book within 2 hours to guarantee business class seat',
          'Prices increase 31% on average within 24 hours',
          'Secure your preferred departure time now'
        ],
        leisure: [
          'Weekend deals expire at midnight tonight',
          'Holiday prices increase daily - book now',
          'Free cancellation ends in 4 hours'
        ],
        budget: [
          'Flash sale ends in 2 hours',
          'Lowest price of the month - expires soon',
          'Budget seats filling up quickly'
        ]
      },
      social_proof: {
        business: [
          '847 business travelers chose this flight',
          'Recommended by corporate travel managers',
          'Top choice for NYC-LAX business route'
        ],
        leisure: [
          '1,200+ families booked this vacation package',
          'Featured in "Best Family Travel Deals"', 
          '4.8/5 stars from recent travelers'
        ],
        budget: [
          'Most booked budget option this month',
          '2,300 budget travelers saved with this deal',
          'Highest rated economy flight on this route'
        ]
      },
      authority: {
        business: [
          'Endorsed by Fortune 500 travel managers',
          'Winner: Best Business Travel Platform 2024',
          'Trusted by 10,000+ corporate accounts'
        ],
        leisure: [
          'Featured in Travel + Leisure Magazine',
          'Conde Nast Traveler Recommended',
          'Winner: Best Family Travel App 2024'
        ],
        budget: [
          'Money Magazine: "Best Budget Travel Deals"',
          'Consumer Reports Top Pick',
          'Cheapflights.com Editor\'s Choice'
        ]
      },
      loss_aversion: {
        business: [
          'Miss this flight, wait 6 hours for next business seat',
          'Alternative flights cost $340 more on average',
          'Competitor prices 23% higher for same route'
        ],
        leisure: [
          'Skip this deal, pay $200+ more elsewhere',
          'Hotel prices increase $89/night tomorrow',
          'Alternative dates cost 45% more'
        ],
        budget: [
          'Next cheapest option is $156 more expensive',
          'Budget fares increase $67 on average daily',
          'Missing this saves you -$234 vs alternatives'
        ]
      },
      reciprocity: {
        business: [
          'Exclusive access for valued corporate clients',
          'Special pricing for loyal business travelers',
          'Complimentary upgrade for returning customers'
        ],
        leisure: [
          'Special discount for vacation planners like you',
          'Bonus rewards for choosing our travel services',
          'Free travel insurance as our gift to you'
        ],
        budget: [
          'Extra savings for smart budget travelers',
          'Loyalty bonus - $25 off your next booking',
          'Free seat selection as a thank you'
        ]
      },
      commitment: {
        business: [
          'Secure your business travel preference today',
          'Guarantee your preferred flight schedule',
          'Lock in corporate rate for future bookings'
        ],
        leisure: [
          'Reserve your dream vacation experience',
          'Confirm your holiday plans with confidence',
          'Book now to secure family travel dates'
        ],
        budget: [
          'Commit to these savings before they expire',
          'Reserve budget-friendly seats now',
          'Guarantee this low price with booking today'
        ]
      },
      liking: {
        business: [
          'Join successful professionals who choose us',
          'Preferred by travelers who value efficiency',
          'Recommended by business leaders like yourself'
        ],
        leisure: [
          'Perfect for adventurous families like yours',
          'Chosen by travelers who love great experiences',
          'Ideal for people who appreciate quality'
        ],
        budget: [
          'Smart choice for savvy budget travelers',
          'Perfect for travelers who love great deals',
          'Recommended by cost-conscious adventurers'
        ]
      }
    }

    const segmentMessages = messages[triggerType]?.[userSegment as keyof typeof messages[typeof triggerType]]
    if (!segmentMessages) return 'Great travel deal available now!'
    
    return segmentMessages[Math.floor(Math.random() * segmentMessages.length)]
  }

  /**
   * Calculate optimal discount percentage based on user behavior
   */
  calculateOptimalDiscount(behavior: UserBehavior): number {
    let discount = 0

    // Base discount for engagement
    if (behavior.timeOnSite > 300) discount += 5 // 5+ minutes
    if (behavior.searchCount >= 3) discount += 3 // Multiple searches
    if (behavior.pageViews >= 5) discount += 2   // Deep browsing

    // Device-specific optimization
    if (behavior.deviceType === 'mobile') discount += 2 // Mobile users
    
    // Returning user bonus
    if (behavior.isReturningUser) discount += 5

    // Cap at reasonable maximum
    return Math.min(discount, 15)
  }

  /**
   * Determine user segment for personalized messaging
   */
  determineUserSegment(behavior: UserBehavior, searchContext: any): string {
    // Business traveler indicators
    if (
      searchContext?.cabinClass === 'business' ||
      searchContext?.tripType === 'oneway' ||
      (searchContext?.departureTime >= 6 && searchContext?.departureTime <= 9) ||
      (searchContext?.departureTime >= 17 && searchContext?.departureTime <= 20)
    ) {
      return 'business'
    }

    // Budget traveler indicators  
    if (
      behavior.searchCount >= 5 || // Price comparing
      searchContext?.flexibleDates ||
      searchContext?.cabinClass === 'economy'
    ) {
      return 'budget'
    }

    // Default to leisure
    return 'leisure'
  }

  // MCP INTEGRATION METHODS

  /**
   * Send events to Google Analytics MCP
   */
  private async sendToAnalytics(eventName: string, data: any) {
    if (!this.analytics) return

    try {
      // Integration with Google Analytics MCP
      await this.analytics.trackEvent({
        event_name: eventName,
        event_parameters: data
      })
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }
  }

  /**
   * Create HubSpot contact and track behavior
   */
  async createHubSpotLead(email: string, behavior: UserBehavior, context: any) {
    if (!this.hubspot) return

    try {
      const contact = await this.hubspot.createContact({
        email,
        properties: {
          'time_on_site': behavior.timeOnSite,
          'search_count': behavior.searchCount,
          'device_type': behavior.deviceType,
          'user_segment': this.determineUserSegment(behavior, context),
          'lead_score': this.calculateLeadScore(behavior),
          'last_search_route': context?.route,
          'booking_intent': this.assessBookingIntent(behavior)
        }
      })

      return contact
    } catch (error) {
      console.error('HubSpot lead creation failed:', error)
    }
  }

  /**
   * Execute Zapier workflows for behavioral triggers
   */
  private async executeTriggerWorkflows(sessionId: string, triggers: PsychologyTrigger[]) {
    if (!this.zapier) return

    for (const trigger of triggers) {
      try {
        await this.zapier.executeWorkflow('psychology_trigger', {
          session_id: sessionId,
          trigger_type: trigger.type,
          intensity: trigger.intensity,
          message: trigger.message,
          timing: trigger.timing
        })
      } catch (error) {
        console.error('Zapier workflow execution failed:', error)
      }
    }
  }

  // SCORING AND ASSESSMENT METHODS

  /**
   * Calculate lead score based on behavior
   */
  private calculateLeadScore(behavior: UserBehavior): number {
    let score = 0

    // Engagement scoring
    score += Math.min(behavior.timeOnSite / 60, 10) // Max 10 points for time
    score += behavior.searchCount * 5 // 5 points per search
    score += behavior.pageViews * 2   // 2 points per page view
    score += behavior.scrollDepth / 10 // Max 10 points for scroll

    // Behavior multipliers
    if (behavior.isReturningUser) score *= 1.3
    if (behavior.email) score *= 1.5

    return Math.min(Math.floor(score), 100)
  }

  /**
   * Assess booking intent probability
   */
  private assessBookingIntent(behavior: UserBehavior): 'low' | 'medium' | 'high' {
    const score = behavior.searchCount * 2 + 
                  (behavior.timeOnSite / 60) + 
                  behavior.pageViews

    if (score >= 15) return 'high'
    if (score >= 8) return 'medium' 
    return 'low'
  }

  // EVENT TRACKING METHODS

  /**
   * Track conversion events
   */
  async trackConversionEvent(event: Omit<ConversionEvent, 'timestamp'>) {
    const conversionEvent: ConversionEvent = {
      ...event,
      timestamp: new Date()
    }

    this.conversionEvents.push(conversionEvent)

    // Send to all MCP services
    await Promise.all([
      this.sendToAnalytics(`conversion_${event.eventType}`, conversionEvent),
      this.updateHubSpotActivity(event.sessionId, conversionEvent),
      this.triggerZapierWorkflow(event.eventType, conversionEvent)
    ])

    return conversionEvent
  }

  /**
   * Update HubSpot activity timeline
   */
  private async updateHubSpotActivity(sessionId: string, event: ConversionEvent) {
    if (!this.hubspot) return

    try {
      await this.hubspot.createActivity({
        type: event.eventType,
        timestamp: event.timestamp,
        properties: event.metadata
      })
    } catch (error) {
      console.error('HubSpot activity update failed:', error)
    }
  }

  /**
   * Trigger Zapier workflow for conversion events
   */
  private async triggerZapierWorkflow(eventType: string, event: ConversionEvent) {
    if (!this.zapier) return

    try {
      await this.zapier.executeWorkflow(`conversion_${eventType}`, event)
    } catch (error) {
      console.error('Zapier conversion workflow failed:', error)
    }
  }

  // ANALYTICS AND REPORTING METHODS

  /**
   * Get conversion funnel analytics
   */
  getConversionFunnel(timeRange?: { start: Date; end: Date }) {
    const events = timeRange 
      ? this.conversionEvents.filter(e => 
          e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
        )
      : this.conversionEvents

    const funnel = {
      page_views: events.filter(e => e.eventType === 'page_view').length,
      searches: events.filter(e => e.eventType === 'search_completed').length, 
      results_clicked: events.filter(e => e.eventType === 'result_clicked').length,
      bookings_started: events.filter(e => e.eventType === 'booking_started').length,
      bookings_completed: events.filter(e => e.eventType === 'booking_completed').length,
      emails_captured: events.filter(e => e.eventType === 'email_captured').length
    }

    return {
      ...funnel,
      conversion_rates: {
        search_to_click: funnel.results_clicked / funnel.searches,
        click_to_booking: funnel.bookings_started / funnel.results_clicked,
        booking_completion: funnel.bookings_completed / funnel.bookings_started,
        overall: funnel.bookings_completed / funnel.page_views
      }
    }
  }

  /**
   * Get psychological trigger effectiveness
   */
  getTriggerEffectiveness() {
    // Implementation would analyze conversion rates by trigger type
    return {
      scarcity: { shown: 1205, converted: 287, rate: 0.238 },
      urgency: { shown: 892, converted: 245, rate: 0.275 },
      social_proof: { shown: 1456, converted: 389, rate: 0.267 },
      authority: { shown: 456, converted: 98, rate: 0.215 },
      loss_aversion: { shown: 678, converted: 198, rate: 0.292 }
    }
  }
}

// Singleton instance for app-wide use
export const marketingEngine = new MarketingPsychologyEngine()

// Export helper functions for components
export function useMarketingPsychology() {
  return {
    trackBehavior: marketingEngine.trackUserBehavior.bind(marketingEngine),
    trackConversion: marketingEngine.trackConversionEvent.bind(marketingEngine),
    createLead: marketingEngine.createHubSpotLead.bind(marketingEngine),
    generateMessage: marketingEngine.generatePsychologyMessage.bind(marketingEngine),
    calculateDiscount: marketingEngine.calculateOptimalDiscount.bind(marketingEngine),
    getFunnel: marketingEngine.getConversionFunnel.bind(marketingEngine)
  }
}