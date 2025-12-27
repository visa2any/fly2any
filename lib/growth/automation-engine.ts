/**
 * FLY2ANY E2E GROWTH AUTOMATION ENGINE
 * Central orchestration for revenue-driving automation
 *
 * @version 1.0.0
 */

import { prisma } from '@/lib/prisma';

// ============================================================================
// TYPES
// ============================================================================

export interface DealData {
  id: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  price: number;
  originalPrice: number;
  discount: number;
  airline?: string;
  departureDate: string;
  returnDate?: string;
  imageUrl?: string;
  deepLink: string;
  type: 'flight' | 'hotel' | 'tour' | 'activity';
}

export interface CartAbandonmentData {
  userId?: string;
  sessionId: string;
  email?: string;
  firstName?: string;
  cartItems: CartItem[];
  cartValue: number;
  currency: string;
  abandonedAt: string;
  checkoutStep: number;
  source: 'flights' | 'hotels' | 'journey' | 'cars' | 'tours';
}

export interface CartItem {
  type: 'flight' | 'hotel' | 'car' | 'tour' | 'activity' | 'transfer';
  title: string;
  subtitle?: string;
  price: number;
  imageUrl?: string;
  details: Record<string, any>;
}

export interface BookingData {
  bookingId: string;
  userId?: string;
  email: string;
  firstName: string;
  type: 'flight' | 'hotel' | 'tour' | 'activity' | 'transfer' | 'car';
  destination: string;
  destinationCode?: string;
  checkIn: string;
  checkOut?: string;
  totalPrice: number;
  currency: string;
}

export interface UpsellRecommendation {
  type: 'hotel' | 'transfer' | 'activity' | 'tour' | 'car';
  title: string;
  subtitle: string;
  price: number;
  imageUrl?: string;
  deepLink: string;
  relevanceScore: number;
}

// ============================================================================
// DEAL SCORING ENGINE
// ============================================================================

export class DealScoringEngine {
  // USA popular routes for scoring boost
  private static readonly popularRoutes = new Set([
    'JFK-LAX', 'LAX-JFK', 'JFK-MIA', 'MIA-JFK', 'LAX-SFO', 'SFO-LAX',
    'ORD-LAX', 'LAX-ORD', 'JFK-LAS', 'LAS-JFK', 'ATL-LAX', 'LAX-ATL',
    'JFK-SFO', 'SFO-JFK', 'JFK-MCO', 'MCO-JFK', 'DFW-LAX', 'LAX-DFW',
    'JFK-CUN', 'MIA-CUN', 'LAX-HNL', 'SFO-HNL', 'JFK-CDG', 'JFK-LHR',
  ]);

  /**
   * Score a deal for distribution priority (0-100)
   */
  static score(deal: DealData): number {
    let score = 0;

    // Discount weight (max 50 points)
    score += Math.min(deal.discount * 1.25, 50);

    // Route popularity (max 20 points)
    const routeKey = `${deal.origin}-${deal.destination}`;
    if (this.popularRoutes.has(routeKey)) {
      score += 20;
    }

    // Price attractiveness (max 15 points) - lower prices score higher
    if (deal.price < 100) score += 15;
    else if (deal.price < 200) score += 12;
    else if (deal.price < 300) score += 8;
    else if (deal.price < 500) score += 5;

    // Timing bonus (max 10 points) - deals expiring soon
    const daysUntilDeparture = Math.floor(
      (new Date(deal.departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDeparture >= 7 && daysUntilDeparture <= 60) {
      score += 10;
    } else if (daysUntilDeparture >= 3 && daysUntilDeparture < 7) {
      score += 5; // Last-minute but not too urgent
    }

    // Type bonus (max 5 points)
    if (deal.type === 'flight') score += 5;
    else if (deal.type === 'hotel') score += 4;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Determine distribution channels based on score
   */
  static getDistributionChannels(score: number, discount: number): DistributionChannels {
    return {
      twitter: score >= 25,
      instagram: score >= 40,
      facebook: score >= 35,
      tiktok: score >= 60 && discount >= 40,
      linkedin: false, // Only for special campaigns
      emailBlast: score >= 70 && discount >= 40,
      emailTargeted: score >= 50 && discount >= 30,
      pushNotification: score >= 80,
    };
  }
}

export interface DistributionChannels {
  twitter: boolean;
  instagram: boolean;
  facebook: boolean;
  tiktok: boolean;
  linkedin: boolean;
  emailBlast: boolean;
  emailTargeted: boolean;
  pushNotification: boolean;
}

// ============================================================================
// USA TIMING ENGINE
// ============================================================================

export class USATimingEngine {
  /**
   * Check if current time is optimal for USA engagement
   */
  static isOptimalTime(channel: keyof DistributionChannels): boolean {
    const now = new Date();
    const etHour = this.getETHour(now);
    const dayOfWeek = now.getDay(); // 0 = Sunday

    switch (channel) {
      case 'twitter':
        // 8 AM, 12 PM, 5-7 PM ET
        return [8, 12, 17, 18, 19].includes(etHour);

      case 'instagram':
        // 11 AM - 1 PM, 7-9 PM ET
        return (etHour >= 11 && etHour <= 13) || (etHour >= 19 && etHour <= 21);

      case 'facebook':
        // 9 AM - 12 PM, 3-4 PM ET
        return (etHour >= 9 && etHour <= 12) || (etHour >= 15 && etHour <= 16);

      case 'tiktok':
        // 7-9 PM, 12 PM ET
        return etHour === 12 || (etHour >= 19 && etHour <= 21);

      case 'linkedin':
        // Tuesday-Thursday 8-10 AM ET
        return dayOfWeek >= 2 && dayOfWeek <= 4 && etHour >= 8 && etHour <= 10;

      case 'emailBlast':
      case 'emailTargeted':
        // Tuesday-Thursday 10 AM, 7 PM ET
        return dayOfWeek >= 2 && dayOfWeek <= 4 && (etHour === 10 || etHour === 19);

      default:
        return true;
    }
  }

  /**
   * Get next optimal time for a channel
   */
  static getNextOptimalTime(channel: keyof DistributionChannels): Date {
    const now = new Date();
    const checkTime = new Date(now);

    // Check next 7 days
    for (let i = 0; i < 7 * 24; i++) {
      checkTime.setHours(checkTime.getHours() + 1);
      if (this.isOptimalTime(channel)) {
        return checkTime;
      }
    }

    return now; // Fallback
  }

  private static getETHour(date: Date): number {
    // Convert to ET (Eastern Time)
    const etOffset = -5; // EST (adjust for DST if needed)
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const et = new Date(utc + 3600000 * etOffset);
    return et.getHours();
  }
}

// ============================================================================
// RATE LIMITER
// ============================================================================

export class DistributionRateLimiter {
  private static limits: Record<string, { max: number; windowHours: number }> = {
    twitter: { max: 4, windowHours: 24 },
    instagram: { max: 1, windowHours: 24 },
    instagramStories: { max: 3, windowHours: 24 },
    facebook: { max: 2, windowHours: 24 },
    tiktok: { max: 1, windowHours: 24 },
    linkedin: { max: 1, windowHours: 48 },
    emailBlast: { max: 1, windowHours: 24 },
    emailPerUser: { max: 1, windowHours: 24 },
    emailPerUserWeekly: { max: 4, windowHours: 168 },
  };

  /**
   * Check if we can post to a channel
   */
  static async canPost(channel: string): Promise<boolean> {
    const limit = this.limits[channel];
    if (!limit) return true;

    const windowStart = new Date(Date.now() - limit.windowHours * 60 * 60 * 1000);

    try {
      const count = await prisma.analyticsEvent.count({
        where: {
          eventType: 'SOCIAL_POST',
          metadata: {
            path: ['channel'],
            equals: channel,
          },
          createdAt: { gte: windowStart },
        },
      });

      return count < limit.max;
    } catch {
      return true; // Allow if check fails
    }
  }

  /**
   * Check if we can email a specific user
   */
  static async canEmailUser(userId: string, emailType: 'promotional' | 'transactional'): Promise<boolean> {
    if (emailType === 'transactional') return true;

    const dailyWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const weeklyWindow = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
      const [dailyCount, weeklyCount] = await Promise.all([
        prisma.analyticsEvent.count({
          where: {
            userId,
            eventType: 'EMAIL_SENT',
            metadata: { path: ['type'], equals: 'promotional' },
            createdAt: { gte: dailyWindow },
          },
        }),
        prisma.analyticsEvent.count({
          where: {
            userId,
            eventType: 'EMAIL_SENT',
            metadata: { path: ['type'], equals: 'promotional' },
            createdAt: { gte: weeklyWindow },
          },
        }),
      ]);

      return dailyCount < 1 && weeklyCount < 4;
    } catch {
      return true;
    }
  }

  /**
   * Record a distribution action
   */
  static async recordAction(channel: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'SOCIAL_POST',
          metadata: { channel, ...metadata },
        },
      });
    } catch (error) {
      console.error('[RateLimiter] Failed to record action:', error);
    }
  }
}

// ============================================================================
// CONTENT GENERATOR (AI Integration Ready)
// ============================================================================

export class ContentGenerator {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

  /**
   * Generate platform-specific content for a deal
   */
  static async generateDealContent(deal: DealData): Promise<PlatformContent> {
    const savings = Math.round(deal.originalPrice - deal.price);
    const savingsPercent = Math.round(deal.discount);

    return {
      twitter: this.generateTwitterContent(deal, savings, savingsPercent),
      instagram: this.generateInstagramContent(deal, savings, savingsPercent),
      facebook: this.generateFacebookContent(deal, savings, savingsPercent),
      emailSubject: this.generateEmailSubject(deal, savingsPercent),
      emailPreview: this.generateEmailPreview(deal, savings),
    };
  }

  private static generateTwitterContent(deal: DealData, savings: number, percent: number): string {
    const templates = [
      `🔥 FLASH DEAL: ${deal.originCity} → ${deal.destinationCity} from $${deal.price}! Save ${percent}% 💸\n\n✈️ Book now before it's gone!\n\n${this.BASE_URL}/flights?from=${deal.origin}&to=${deal.destination}`,
      `✈️ ${percent}% OFF ${deal.originCity} to ${deal.destinationCity}!\n\n💰 Now: $${deal.price} (was $${deal.originalPrice})\n📅 Travel dates available!\n\n${this.BASE_URL}/flights?from=${deal.origin}&to=${deal.destination}`,
      `🚨 Deal Alert! ${deal.originCity} ✈️ ${deal.destinationCity}\n\n$${deal.price} (Save $${savings}!)\n\nLimited seats at this price 👇\n${this.BASE_URL}/flights?from=${deal.origin}&to=${deal.destination}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private static generateInstagramContent(deal: DealData, savings: number, percent: number): string {
    return `✈️ ${deal.originCity} → ${deal.destinationCity}\n\n💰 $${deal.price} (${percent}% OFF!)\n💵 Save $${savings}\n\n📅 Dates: ${deal.departureDate}${deal.returnDate ? ` - ${deal.returnDate}` : ''}\n\nLink in bio to book! 🔗\n\n#fly2any #traveldeals #cheapflights #${deal.destinationCity.toLowerCase().replace(/\s/g, '')} #travelhacks #flightdeals`;
  }

  private static generateFacebookContent(deal: DealData, savings: number, percent: number): string {
    return `🔥 Amazing Flight Deal Alert!\n\n✈️ ${deal.originCity} to ${deal.destinationCity}\n💰 Only $${deal.price} (was $${deal.originalPrice})\n📈 You save: $${savings} (${percent}% off!)\n\nDon't miss this incredible deal - prices like this don't last!\n\n👉 Book now: ${this.BASE_URL}/flights?from=${deal.origin}&to=${deal.destination}`;
  }

  private static generateEmailSubject(deal: DealData, percent: number): string {
    const subjects = [
      `🔥 ${percent}% OFF: ${deal.originCity} → ${deal.destinationCity} from $${deal.price}`,
      `Flash Sale: Fly to ${deal.destinationCity} for just $${deal.price}!`,
      `Don't miss it: ${deal.originCity} to ${deal.destinationCity} - ${percent}% off!`,
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  private static generateEmailPreview(deal: DealData, savings: number): string {
    return `Save $${savings} on flights from ${deal.originCity} to ${deal.destinationCity}. Limited availability - book now!`;
  }
}

export interface PlatformContent {
  twitter: string;
  instagram: string;
  facebook: string;
  emailSubject: string;
  emailPreview: string;
}

// ============================================================================
// UPSELL ENGINE
// ============================================================================

export class UpsellEngine {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

  /**
   * Get upsell recommendations based on booking type
   */
  static async getRecommendations(booking: BookingData): Promise<UpsellRecommendation[]> {
    const recommendations: UpsellRecommendation[] = [];

    switch (booking.type) {
      case 'flight':
        // Recommend hotels at destination
        recommendations.push({
          type: 'hotel',
          title: `Hotels in ${booking.destination}`,
          subtitle: 'Complete your trip with the perfect stay',
          price: 0, // Will be fetched dynamically
          deepLink: `${this.BASE_URL}/hotels?location=${encodeURIComponent(booking.destination)}&checkIn=${booking.checkIn}${booking.checkOut ? `&checkOut=${booking.checkOut}` : ''}`,
          relevanceScore: 95,
        });

        // Recommend airport transfers
        recommendations.push({
          type: 'transfer',
          title: 'Airport Transfer',
          subtitle: `Hassle-free transfer in ${booking.destination}`,
          price: 0,
          deepLink: `${this.BASE_URL}/transfers?destination=${encodeURIComponent(booking.destination)}`,
          relevanceScore: 85,
        });

        // Recommend activities
        recommendations.push({
          type: 'activity',
          title: `Things to do in ${booking.destination}`,
          subtitle: 'Discover local experiences',
          price: 0,
          deepLink: `${this.BASE_URL}/activities?location=${encodeURIComponent(booking.destination)}`,
          relevanceScore: 75,
        });
        break;

      case 'hotel':
        // Recommend transfers
        recommendations.push({
          type: 'transfer',
          title: 'Airport Transfer',
          subtitle: 'Get picked up from the airport',
          price: 0,
          deepLink: `${this.BASE_URL}/transfers?destination=${encodeURIComponent(booking.destination)}`,
          relevanceScore: 90,
        });

        // Recommend tours
        recommendations.push({
          type: 'tour',
          title: `Tours in ${booking.destination}`,
          subtitle: 'Explore with local guides',
          price: 0,
          deepLink: `${this.BASE_URL}/tours?location=${encodeURIComponent(booking.destination)}`,
          relevanceScore: 85,
        });

        // Recommend activities
        recommendations.push({
          type: 'activity',
          title: `Activities & Experiences`,
          subtitle: 'Make your stay memorable',
          price: 0,
          deepLink: `${this.BASE_URL}/activities?location=${encodeURIComponent(booking.destination)}`,
          relevanceScore: 80,
        });
        break;

      case 'tour':
      case 'activity':
        // Recommend hotels
        recommendations.push({
          type: 'hotel',
          title: `Stay in ${booking.destination}`,
          subtitle: 'Extend your adventure',
          price: 0,
          deepLink: `${this.BASE_URL}/hotels?location=${encodeURIComponent(booking.destination)}`,
          relevanceScore: 90,
        });
        break;
    }

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

// ============================================================================
// CART ABANDONMENT TRACKER
// ============================================================================

export class CartAbandonmentTracker {
  /**
   * Record cart abandonment event
   */
  static async trackAbandonment(data: CartAbandonmentData): Promise<string> {
    try {
      const event = await prisma.analyticsEvent.create({
        data: {
          eventType: 'CART_ABANDONED',
          userId: data.userId,
          sessionId: data.sessionId,
          metadata: {
            email: data.email,
            firstName: data.firstName,
            cartItems: data.cartItems,
            cartValue: data.cartValue,
            currency: data.currency,
            abandonedAt: data.abandonedAt,
            checkoutStep: data.checkoutStep,
            source: data.source,
            recoveryStatus: 'pending',
          },
        },
      });

      console.log('[CartAbandonment] Tracked:', event.id);
      return event.id;
    } catch (error) {
      console.error('[CartAbandonment] Track failed:', error);
      throw error;
    }
  }

  /**
   * Check if user converted after abandonment
   */
  static async checkConversion(abandonmentId: string): Promise<boolean> {
    try {
      const event = await prisma.analyticsEvent.findUnique({
        where: { id: abandonmentId },
      });

      if (!event) return false;

      const metadata = event.metadata as any;
      const abandonedAt = new Date(metadata.abandonedAt);

      // Check for booking created after abandonment
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [
            { userId: event.userId || undefined },
            { contactEmail: metadata.email },
          ],
          createdAt: { gt: abandonedAt },
        },
      });

      if (booking) {
        // Mark as recovered
        await prisma.analyticsEvent.update({
          where: { id: abandonmentId },
          data: {
            metadata: {
              ...metadata,
              recoveryStatus: 'converted',
              convertedAt: new Date().toISOString(),
              bookingId: booking.id,
            },
          },
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('[CartAbandonment] Conversion check failed:', error);
      return false;
    }
  }

  /**
   * Mark abandonment as email sent
   */
  static async markEmailSent(abandonmentId: string, emailNumber: 1 | 2): Promise<void> {
    try {
      const event = await prisma.analyticsEvent.findUnique({
        where: { id: abandonmentId },
      });

      if (!event) return;

      const metadata = event.metadata as any;
      await prisma.analyticsEvent.update({
        where: { id: abandonmentId },
        data: {
          metadata: {
            ...metadata,
            [`email${emailNumber}SentAt`]: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('[CartAbandonment] Mark email sent failed:', error);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const GrowthAutomation = {
  DealScoring: DealScoringEngine,
  USATiming: USATimingEngine,
  RateLimiter: DistributionRateLimiter,
  Content: ContentGenerator,
  Upsell: UpsellEngine,
  CartAbandonment: CartAbandonmentTracker,
};
