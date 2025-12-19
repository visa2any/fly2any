/**
 * Social Marketing Hub - Fly2Any Marketing OS
 * Unified interface for multi-platform social posting
 */

import { PrismaClient } from '@prisma/client';
import {
  SocialPlatform,
  SocialPostContent,
  SocialPostResult,
  SocialAdapter,
  PLATFORM_CONFIGS,
  OPTIMAL_POST_TIMES,
} from './types';
import { twitterAdapter } from './twitter-adapter';
import { instagramAdapter, facebookAdapter } from './meta-adapter';
import { tiktokAdapter } from './tiktok-adapter';
import { blogAdapter } from './blog-adapter';

const prisma = new PrismaClient();

// Export types
export * from './types';

// Export adapters
export { twitterAdapter } from './twitter-adapter';
export { instagramAdapter, facebookAdapter } from './meta-adapter';
export { tiktokAdapter } from './tiktok-adapter';
export { blogAdapter } from './blog-adapter';

// Adapter registry
const adapters: Record<SocialPlatform, SocialAdapter> = {
  twitter: twitterAdapter,
  instagram: instagramAdapter,
  facebook: facebookAdapter,
  tiktok: tiktokAdapter,
  blog: blogAdapter,
};

/**
 * Get adapter for a specific platform
 */
export function getAdapter(platform: SocialPlatform): SocialAdapter {
  return adapters[platform];
}

/**
 * Get all configured adapters
 */
export function getConfiguredAdapters(): SocialAdapter[] {
  return Object.values(adapters).filter(a => a.isConfigured());
}

/**
 * Post to a single platform
 */
export async function postToPlatform(
  platform: SocialPlatform,
  content: SocialPostContent
): Promise<SocialPostResult> {
  const adapter = adapters[platform];

  if (!adapter.isConfigured()) {
    return {
      platform,
      success: false,
      error: `${platform} is not configured`,
    };
  }

  return adapter.post(content);
}

/**
 * Post to multiple platforms
 */
export async function postToMultiplePlatforms(
  platforms: SocialPlatform[],
  content: SocialPostContent,
  options: { sequential?: boolean; delayMs?: number } = {}
): Promise<SocialPostResult[]> {
  const { sequential = false, delayMs = 2000 } = options;
  const results: SocialPostResult[] = [];

  if (sequential) {
    for (const platform of platforms) {
      const result = await postToPlatform(platform, content);
      results.push(result);
      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  } else {
    const promises = platforms.map(p => postToPlatform(p, content));
    results.push(...await Promise.all(promises));
  }

  return results;
}

/**
 * Post to all configured platforms
 */
export async function postToAll(content: SocialPostContent): Promise<SocialPostResult[]> {
  const configured = getConfiguredAdapters();
  const platforms = configured.map(a => a.platform);
  return postToMultiplePlatforms(platforms, content, { sequential: true, delayMs: 2000 });
}

/**
 * Log social post to database
 */
export async function logSocialPost(
  contentQueueId: string | null,
  result: SocialPostResult,
  content: SocialPostContent
): Promise<void> {
  try {
    await prisma.socialPostLog.create({
      data: {
        contentQueueId,
        platform: result.platform,
        platformPostId: result.postId,
        platformUrl: result.url,
        status: result.success ? 'posted' : 'failed',
        content: content.text,
        imageUrl: content.imageUrl,
        link: content.link,
        error: result.error,
        metadata: result.metadata,
        postedAt: result.success ? new Date() : null,
      },
    });
  } catch (error) {
    console.error('[Social] Failed to log post:', error);
  }
}

/**
 * Check for duplicate posts (prevent spam)
 */
export async function isDuplicatePost(
  platform: SocialPlatform,
  content: string,
  withinHours: number = 24
): Promise<boolean> {
  const since = new Date(Date.now() - withinHours * 60 * 60 * 1000);

  const existing = await prisma.socialPostLog.findFirst({
    where: {
      platform,
      content,
      status: 'posted',
      postedAt: { gte: since },
    },
  });

  return !!existing;
}

/**
 * Get platform rate limit status
 */
export async function getRateLimitStatus(platform: SocialPlatform): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}> {
  const config = PLATFORM_CONFIGS[platform];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentPosts = await prisma.socialPostLog.count({
    where: {
      platform,
      status: 'posted',
      postedAt: { gte: oneHourAgo },
    },
  });

  const remaining = Math.max(0, config.rateLimitPerHour - recentPosts);

  return {
    allowed: remaining > 0,
    remaining,
    resetAt: new Date(Date.now() + 60 * 60 * 1000),
  };
}

/**
 * Get next optimal posting time for platform
 */
export function getNextOptimalTime(platform: SocialPlatform, timezone: string = 'America/New_York'): Date {
  const times = OPTIMAL_POST_TIMES[platform];
  const now = new Date();

  // Find next optimal hour
  const currentHour = now.getUTCHours();
  let nextHour = times.find(h => h > currentHour);

  if (!nextHour) {
    // All times passed today, use first time tomorrow
    nextHour = times[0];
    now.setUTCDate(now.getUTCDate() + 1);
  }

  now.setUTCHours(nextHour, 0, 0, 0);
  return now;
}

/**
 * Format content for deal posts
 */
export function createDealContent(deal: {
  type: 'flight' | 'hotel' | 'tour' | 'transfer';
  origin?: string;
  destination: string;
  price: number;
  originalPrice?: number;
  name?: string;
  imageUrl?: string;
  link: string;
}): SocialPostContent {
  const savings = deal.originalPrice
    ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)
    : 0;

  let text = '';
  const hashtags: string[] = ['Fly2Any', 'TravelDeals'];

  if (deal.type === 'flight') {
    text = `✈️ FLIGHT DEAL: ${deal.origin} → ${deal.destination} from $${deal.price}`;
    if (savings > 0) text += ` (Save ${savings}%)`;
    text += '\n\nBook now before prices go up!';
    hashtags.push('CheapFlights', 'FlightDeals', deal.destination.replace(/\s/g, ''));
  } else if (deal.type === 'hotel') {
    text = `🏨 HOTEL DEAL: ${deal.name} in ${deal.destination}`;
    text += `\nFrom $${deal.price}/night`;
    if (savings > 0) text += ` (${savings}% OFF)`;
    hashtags.push('HotelDeals', 'Travel', deal.destination.replace(/\s/g, ''));
  } else if (deal.type === 'tour') {
    text = `🎯 TOUR DEAL: ${deal.name}`;
    text += `\nFrom $${deal.price}`;
    hashtags.push('Tours', 'Travel', 'Adventure');
  }

  return {
    text,
    imageUrl: deal.imageUrl,
    link: deal.link,
    hashtags,
    productType: deal.type,
    productData: deal,
  };
}
