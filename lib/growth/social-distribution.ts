/**
 * Social Media Distribution Service
 * Handles automated posting to social platforms via n8n
 *
 * @version 1.0.0
 */

import { DealScoringEngine, ContentGenerator, DistributionRateLimiter, USATimingEngine, DistributionChannels } from './automation-engine';

// ============================================================================
// TYPES
// ============================================================================

export interface SocialPost {
  platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin';
  content: string;
  imageUrl?: string;
  link?: string;
  hashtags?: string[];
  scheduledFor?: Date;
}

export interface DealForDistribution {
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
  type: 'flight' | 'hotel' | 'tour' | 'activity';
}

export interface DistributionResult {
  dealId: string;
  score: number;
  channels: DistributionChannels;
  posts: SocialPost[];
  emailCampaign?: {
    type: 'blast' | 'targeted';
    audienceSize: number;
  };
  skipped?: boolean;
  skipReason?: string;
}

// ============================================================================
// SOCIAL DISTRIBUTION SERVICE
// ============================================================================

export class SocialDistributionService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';
  private static readonly N8N_WEBHOOK_URL = process.env.N8N_DISTRIBUTION_WEBHOOK_URL;

  /**
   * Process a deal for distribution across channels
   */
  static async distributeDeal(deal: DealForDistribution): Promise<DistributionResult> {
    // Score the deal
    const score = DealScoringEngine.score({
      ...deal,
      deepLink: `${this.BASE_URL}/flights?from=${deal.origin}&to=${deal.destination}`,
    });

    // Determine channels
    const channels = DealScoringEngine.getDistributionChannels(score, deal.discount);

    // Check rate limits
    const posts: SocialPost[] = [];
    const content = await ContentGenerator.generateDealContent({
      ...deal,
      deepLink: `${this.BASE_URL}/flights?from=${deal.origin}&to=${deal.destination}`,
    });

    // Generate posts for each enabled channel
    if (channels.twitter && await DistributionRateLimiter.canPost('twitter')) {
      const scheduledFor = USATimingEngine.isOptimalTime('twitter')
        ? new Date()
        : USATimingEngine.getNextOptimalTime('twitter');

      posts.push({
        platform: 'twitter',
        content: content.twitter,
        link: `${this.BASE_URL}/flights?from=${deal.origin}&to=${deal.destination}`,
        scheduledFor,
      });
    }

    if (channels.instagram && await DistributionRateLimiter.canPost('instagram')) {
      posts.push({
        platform: 'instagram',
        content: content.instagram,
        imageUrl: deal.imageUrl || `${this.BASE_URL}/api/og/deal?from=${deal.origin}&to=${deal.destination}&price=${deal.price}`,
        hashtags: this.generateHashtags(deal),
      });
    }

    if (channels.facebook && await DistributionRateLimiter.canPost('facebook')) {
      posts.push({
        platform: 'facebook',
        content: content.facebook,
        link: `${this.BASE_URL}/flights?from=${deal.origin}&to=${deal.destination}`,
        imageUrl: deal.imageUrl,
      });
    }

    // Determine email campaign type
    let emailCampaign: DistributionResult['emailCampaign'];
    if (channels.emailBlast) {
      emailCampaign = { type: 'blast', audienceSize: 0 }; // Size determined by n8n
    } else if (channels.emailTargeted) {
      emailCampaign = { type: 'targeted', audienceSize: 0 };
    }

    const result: DistributionResult = {
      dealId: deal.id,
      score,
      channels,
      posts,
      emailCampaign,
    };

    // Trigger n8n workflow if configured
    if (this.N8N_WEBHOOK_URL && posts.length > 0) {
      await this.triggerN8NDistribution(result, deal, content);
    }

    return result;
  }

  /**
   * Generate hashtags for a deal
   */
  private static generateHashtags(deal: DealForDistribution): string[] {
    const hashtags = ['fly2any', 'traveldeals', 'cheapflights'];

    // Add destination hashtag
    const destTag = deal.destinationCity.toLowerCase().replace(/\s+/g, '');
    hashtags.push(destTag);

    // Add discount hashtag if significant
    if (deal.discount >= 40) {
      hashtags.push('flashsale');
    } else if (deal.discount >= 25) {
      hashtags.push('dealalert');
    }

    // Add type hashtag
    if (deal.type === 'flight') {
      hashtags.push('flightdeals');
    } else if (deal.type === 'hotel') {
      hashtags.push('hoteldeals');
    }

    return hashtags.slice(0, 10); // Max 10 hashtags
  }

  /**
   * Trigger n8n distribution workflow
   */
  private static async triggerN8NDistribution(
    result: DistributionResult,
    deal: DealForDistribution,
    content: Awaited<ReturnType<typeof ContentGenerator.generateDealContent>>
  ): Promise<void> {
    try {
      await fetch(this.N8N_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`,
        },
        body: JSON.stringify({
          type: 'deal_distribute',
          deal,
          result,
          content,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('[SocialDistribution] Failed to trigger n8n:', error);
    }
  }

  /**
   * Get optimal posting schedule for a day
   */
  static getOptimalSchedule(): Record<string, Date[]> {
    const now = new Date();
    const schedule: Record<string, Date[]> = {
      twitter: [],
      instagram: [],
      facebook: [],
    };

    // Generate optimal times for today
    for (let hour = 8; hour <= 21; hour++) {
      const checkTime = new Date(now);
      checkTime.setHours(hour, 0, 0, 0);

      if (checkTime > now) {
        if ([8, 12, 17, 18, 19].includes(hour)) {
          schedule.twitter.push(new Date(checkTime));
        }
        if ([11, 12, 13, 19, 20, 21].includes(hour)) {
          schedule.instagram.push(new Date(checkTime));
        }
        if ([9, 10, 11, 12, 15, 16].includes(hour)) {
          schedule.facebook.push(new Date(checkTime));
        }
      }
    }

    return schedule;
  }
}

// ============================================================================
// API ENDPOINTS FOR N8N
// ============================================================================

/**
 * Prepare deal data for n8n consumption
 */
export function prepareDealForN8N(deal: DealForDistribution) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fly2any.com';

  return {
    ...deal,
    score: DealScoringEngine.score({
      ...deal,
      deepLink: `${baseUrl}/flights?from=${deal.origin}&to=${deal.destination}`,
    }),
    links: {
      direct: `${baseUrl}/flights?from=${deal.origin}&to=${deal.destination}`,
      search: `${baseUrl}/flights/results?from=${deal.origin}&to=${deal.destination}&date=${deal.departureDate}`,
      deals: `${baseUrl}/deals`,
    },
    formatting: {
      priceFormatted: `$${deal.price.toLocaleString()}`,
      originalPriceFormatted: `$${deal.originalPrice.toLocaleString()}`,
      savings: `$${(deal.originalPrice - deal.price).toLocaleString()}`,
      discountFormatted: `${deal.discount}%`,
      route: `${deal.originCity} → ${deal.destinationCity}`,
      routeCode: `${deal.origin}-${deal.destination}`,
    },
  };
}
