/**
 * Content Queue Manager - Fly2Any Marketing OS
 * Persistent queue management for social content distribution
 * Integrates with existing AutomationOrchestrator
 */

import { Prisma } from '@prisma/client';
import { getPrismaClient } from '@/lib/prisma';
import { SocialPlatform, SocialPostContent } from './types';
import { postToPlatform, logSocialPost, isDuplicatePost, getRateLimitStatus, createDealContent } from './index';
import { imageAgent } from './image-agent';
import { schedulerAgent } from './scheduler-agent';

const prisma = getPrismaClient();

export interface QueueItem {
  type: 'deal' | 'guide' | 'social' | 'blog';
  title: string;
  content: string;
  platforms: SocialPlatform[];
  imageUrl?: string;
  imagePrompt?: string;
  link?: string;
  hashtags?: string[];
  productType?: 'flight' | 'hotel' | 'tour' | 'transfer';
  productId?: string;
  productData?: Record<string, any>;
  scheduledAt?: Date;
  priority?: number;
  createdBy?: string;
}

export interface QueueStats {
  pending: number;
  processing: number;
  posted: number;
  failed: number;
  byPlatform: Record<string, number>;
}

class ContentQueueManager {
  /**
   * Add content to the queue
   */
  async enqueue(item: QueueItem): Promise<string> {
    // Get optimal scheduling if not specified
    let scheduledAt = item.scheduledAt;
    let timezone = 'America/New_York';

    if (!scheduledAt) {
      const schedule = await schedulerAgent.getOptimalTime({
        platform: item.platforms[0],
        contentType: item.type,
        priority: item.priority,
      });
      scheduledAt = schedule.scheduledAt;
      timezone = schedule.timezone;
    }

    // Get image if needed
    let imageUrl = item.imageUrl;
    if (!imageUrl && item.productType) {
      const imageResult = await imageAgent.getImage({
        productType: item.productType,
        productData: item.productData,
        prompt: item.imagePrompt,
        platform: item.platforms[0],
      });
      imageUrl = imageResult.url;
    }

    // Create queue entry
    const entry = await prisma.contentQueue.create({
      data: {
        type: item.type,
        title: item.title,
        content: item.content,
        platforms: item.platforms,
        imageUrl,
        imagePrompt: item.imagePrompt,
        link: item.link,
        hashtags: item.hashtags || [],
        productType: item.productType,
        productId: item.productId,
        productData: item.productData as Prisma.JsonObject,
        scheduledAt,
        timezone,
        priority: item.priority || 0,
        createdBy: item.createdBy || 'system',
      },
    });

    console.log(`[Queue] Content added: ${entry.id} scheduled for ${scheduledAt.toISOString()}`);

    return entry.id;
  }

  /**
   * Add a deal to the queue (convenience method)
   */
  async enqueueDeal(deal: {
    type: 'flight' | 'hotel' | 'tour' | 'transfer';
    origin?: string;
    destination: string;
    name?: string;
    price: number;
    originalPrice?: number;
    imageUrl?: string;
    link: string;
  }): Promise<string> {
    const content = createDealContent(deal);

    return this.enqueue({
      type: 'deal',
      title: `${deal.type.charAt(0).toUpperCase() + deal.type.slice(1)} Deal: ${deal.destination}`,
      content: content.text,
      platforms: ['twitter', 'facebook', 'instagram'],
      imageUrl: deal.imageUrl || content.imageUrl,
      link: deal.link,
      hashtags: content.hashtags,
      productType: deal.type,
      productData: deal,
      priority: 7, // Deals are high priority
    });
  }

  /**
   * Process pending queue items
   */
  async processQueue(limit: number = 10): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
    results: Array<{ id: string; platform: string; success: boolean; error?: string }>;
  }> {
    const now = new Date();
    const results: Array<{ id: string; platform: string; success: boolean; error?: string }> = [];

    // Get items ready to be processed
    const items = await prisma.contentQueue.findMany({
      where: {
        status: 'pending',
        scheduledAt: { lte: now },
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledAt: 'asc' },
      ],
      take: limit,
    });

    console.log(`[Queue] Processing ${items.length} items`);

    for (const item of items) {
      // Mark as processing
      await prisma.contentQueue.update({
        where: { id: item.id },
        data: { status: 'processing' },
      });

      const platformResults: Record<string, any> = {};
      let allSuccess = true;

      for (const platform of item.platforms as SocialPlatform[]) {
        // Check rate limit
        const rateLimit = await getRateLimitStatus(platform);
        if (!rateLimit.allowed) {
          console.log(`[Queue] Rate limited for ${platform}, rescheduling`);
          platformResults[platform] = { success: false, error: 'Rate limited' };
          results.push({ id: item.id, platform, success: false, error: 'Rate limited' });
          allSuccess = false;
          continue;
        }

        // Check for duplicates
        const isDupe = await isDuplicatePost(platform, item.content, 24);
        if (isDupe) {
          console.log(`[Queue] Duplicate detected for ${platform}, skipping`);
          platformResults[platform] = { success: false, error: 'Duplicate content' };
          results.push({ id: item.id, platform, success: false, error: 'Duplicate' });
          continue;
        }

        // Post to platform
        const postContent: SocialPostContent = {
          text: item.content,
          title: item.title,
          imageUrl: item.imageUrl || undefined,
          link: item.link || undefined,
          hashtags: item.hashtags,
          productType: item.productType as any,
          productData: item.productData as Record<string, any>,
        };

        try {
          const result = await postToPlatform(platform, postContent);
          platformResults[platform] = result;

          // Log to database
          await logSocialPost(item.id, result, postContent);

          results.push({
            id: item.id,
            platform,
            success: result.success,
            error: result.error,
          });

          if (!result.success) {
            allSuccess = false;
          }

          // Delay between platforms
          await new Promise(r => setTimeout(r, 2000));

        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          platformResults[platform] = { success: false, error: message };
          results.push({ id: item.id, platform, success: false, error: message });
          allSuccess = false;
        }
      }

      // Update queue item status
      const newStatus = allSuccess ? 'posted' : (item.retryCount >= item.maxRetries ? 'failed' : 'pending');

      await prisma.contentQueue.update({
        where: { id: item.id },
        data: {
          status: newStatus,
          postedAt: allSuccess ? new Date() : null,
          results: platformResults as Prisma.JsonObject,
          retryCount: allSuccess ? item.retryCount : item.retryCount + 1,
          error: allSuccess ? null : Object.values(platformResults).find((r: any) => r.error)?.error,
        },
      });
    }

    return {
      processed: items.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    const [pending, processing, posted, failed] = await Promise.all([
      prisma.contentQueue.count({ where: { status: 'pending' } }),
      prisma.contentQueue.count({ where: { status: 'processing' } }),
      prisma.contentQueue.count({ where: { status: 'posted' } }),
      prisma.contentQueue.count({ where: { status: 'failed' } }),
    ]);

    // Count by platform
    const platformCounts = await prisma.contentQueue.groupBy({
      by: ['platforms'],
      where: { status: 'pending' },
      _count: true,
    });

    const byPlatform: Record<string, number> = {};
    for (const pc of platformCounts) {
      for (const p of pc.platforms) {
        byPlatform[p] = (byPlatform[p] || 0) + pc._count;
      }
    }

    return { pending, processing, posted, failed, byPlatform };
  }

  /**
   * Cancel a queued item
   */
  async cancel(id: string): Promise<boolean> {
    try {
      await prisma.contentQueue.update({
        where: { id },
        data: { status: 'cancelled' },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retry failed items
   */
  async retryFailed(): Promise<number> {
    const result = await prisma.contentQueue.updateMany({
      where: {
        status: 'failed',
        retryCount: { lt: 3 },
      },
      data: {
        status: 'pending',
        error: null,
      },
    });

    return result.count;
  }

  /**
   * Clean old completed items
   */
  async cleanup(olderThanDays: number = 30): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    const result = await prisma.contentQueue.deleteMany({
      where: {
        status: { in: ['posted', 'cancelled'] },
        createdAt: { lt: cutoff },
      },
    });

    return result.count;
  }

  /**
   * Get upcoming scheduled posts
   */
  async getUpcoming(limit: number = 20): Promise<any[]> {
    return prisma.contentQueue.findMany({
      where: { status: 'pending' },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });
  }
}

export const contentQueueManager = new ContentQueueManager();
