/**
 * Scheduler Agent - Fly2Any Marketing OS
 * Intelligent scheduling for optimal social media posting times
 * Uses AI Growth Brain + platform-specific optimization
 */

import { PrismaClient } from '@prisma/client';
import { SocialPlatform, OPTIMAL_POST_TIMES, PLATFORM_CONFIGS } from './types';
import { getRateLimitStatus } from './index';

const prisma = new PrismaClient();

// Global audience timezone distribution (US focus)
const TIMEZONE_WEIGHTS: Record<string, number> = {
  'America/New_York': 0.35,      // EST - highest weight
  'America/Chicago': 0.20,       // CST
  'America/Denver': 0.10,        // MST
  'America/Los_Angeles': 0.25,   // PST
  'America/Anchorage': 0.02,     // AKST
  'Pacific/Honolulu': 0.02,      // HST
  'Europe/London': 0.03,         // GMT
  'Europe/Paris': 0.03,          // CET
};

// Day of week engagement multipliers
const DAY_MULTIPLIERS: Record<number, number> = {
  0: 0.85,  // Sunday
  1: 1.00,  // Monday
  2: 1.05,  // Tuesday (best for B2B)
  3: 1.00,  // Wednesday
  4: 1.10,  // Thursday (best for travel)
  5: 0.95,  // Friday
  6: 0.90,  // Saturday
};

export interface ScheduleRequest {
  platform: SocialPlatform;
  contentType: 'deal' | 'guide' | 'social' | 'blog';
  priority?: number; // 0-10, higher = more urgent
  timezone?: string;
  preferredHour?: number; // 0-23 UTC
  minDelayMinutes?: number; // Minimum minutes from now
}

export interface ScheduleResult {
  scheduledAt: Date;
  timezone: string;
  score: number;
  reason: string;
}

class SchedulerAgent {
  /**
   * Get optimal posting time for a specific platform and content
   */
  async getOptimalTime(request: ScheduleRequest): Promise<ScheduleResult> {
    const {
      platform,
      contentType,
      priority = 5,
      timezone = 'America/New_York',
      preferredHour,
      minDelayMinutes = 5,
    } = request;

    // Check rate limits
    const rateLimit = await getRateLimitStatus(platform);
    if (!rateLimit.allowed) {
      // If rate limited, schedule for after reset
      return {
        scheduledAt: rateLimit.resetAt,
        timezone,
        score: 0.5,
        reason: `Rate limited. Scheduled after reset at ${rateLimit.resetAt.toISOString()}`,
      };
    }

    // Get candidate times
    const candidates = this.generateCandidateTimes(platform, minDelayMinutes);

    // Score each candidate
    const scoredCandidates = await Promise.all(
      candidates.map(async (time) => ({
        time,
        score: await this.scoreTime(time, platform, contentType, priority),
      }))
    );

    // Apply preferred hour boost if specified
    if (preferredHour !== undefined) {
      for (const candidate of scoredCandidates) {
        if (candidate.time.getUTCHours() === preferredHour) {
          candidate.score *= 1.2;
        }
      }
    }

    // Sort by score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    const best = scoredCandidates[0];

    return {
      scheduledAt: best.time,
      timezone,
      score: best.score,
      reason: this.explainScore(best.time, platform, best.score),
    };
  }

  /**
   * Schedule content for multiple platforms
   */
  async scheduleForPlatforms(
    platforms: SocialPlatform[],
    contentType: 'deal' | 'guide' | 'social' | 'blog',
    options: { stagger?: boolean; priority?: number } = {}
  ): Promise<Map<SocialPlatform, ScheduleResult>> {
    const { stagger = true, priority = 5 } = options;
    const results = new Map<SocialPlatform, ScheduleResult>();

    let lastScheduledTime: Date | null = null;

    for (const platform of platforms) {
      const minDelay = stagger && lastScheduledTime
        ? Math.max(5, Math.floor((lastScheduledTime.getTime() - Date.now()) / 60000) + 15)
        : 5;

      const result = await this.getOptimalTime({
        platform,
        contentType,
        priority,
        minDelayMinutes: minDelay,
      });

      results.set(platform, result);
      lastScheduledTime = result.scheduledAt;
    }

    return results;
  }

  /**
   * Generate candidate posting times
   */
  private generateCandidateTimes(platform: SocialPlatform, minDelayMinutes: number): Date[] {
    const candidates: Date[] = [];
    const now = new Date();
    const minTime = new Date(now.getTime() + minDelayMinutes * 60 * 1000);
    const optimalHours = OPTIMAL_POST_TIMES[platform];

    // Add optimal hours for today and tomorrow
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      for (const hour of optimalHours) {
        const candidate = new Date(now);
        candidate.setUTCDate(candidate.getUTCDate() + dayOffset);
        candidate.setUTCHours(hour, 0, 0, 0);

        if (candidate > minTime) {
          candidates.push(candidate);
        }
      }
    }

    // Add some non-optimal slots as fallback
    for (let hoursAhead = 1; hoursAhead <= 6; hoursAhead++) {
      const candidate = new Date(minTime.getTime() + hoursAhead * 60 * 60 * 1000);
      candidate.setUTCMinutes(0, 0, 0);
      candidates.push(candidate);
    }

    return candidates.slice(0, 20); // Limit candidates
  }

  /**
   * Score a candidate time
   */
  private async scoreTime(
    time: Date,
    platform: SocialPlatform,
    contentType: string,
    priority: number
  ): Promise<number> {
    let score = 50; // Base score

    // 1. Optimal hour bonus (0-20 points)
    const optimalHours = OPTIMAL_POST_TIMES[platform];
    if (optimalHours.includes(time.getUTCHours())) {
      score += 20;
    }

    // 2. Day of week multiplier
    const dayMultiplier = DAY_MULTIPLIERS[time.getUTCDay()];
    score *= dayMultiplier;

    // 3. Timezone coverage (0-10 points)
    const tzScore = this.calculateTimezoneScore(time);
    score += tzScore * 10;

    // 4. Queue competition penalty
    const queuedCount = await this.getQueuedPostsCount(platform, time);
    score -= queuedCount * 5;

    // 5. Priority boost
    score += priority * 2;

    // 6. Content type bonus
    if (contentType === 'deal' && [17, 21].includes(time.getUTCHours())) {
      score += 10; // Deals perform better in evening
    }
    if (contentType === 'blog' && [14, 15].includes(time.getUTCHours())) {
      score += 10; // Blog posts perform better mid-day
    }

    // 7. Recency penalty (sooner is generally better)
    const hoursFromNow = (time.getTime() - Date.now()) / (60 * 60 * 1000);
    if (hoursFromNow < 24) {
      score += 5;
    } else if (hoursFromNow > 48) {
      score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate timezone coverage score
   */
  private calculateTimezoneScore(time: Date): number {
    let score = 0;
    const utcHour = time.getUTCHours();

    // Calculate what local hour this is in each timezone
    // and how good that hour is for engagement
    const timezoneOffsets: Record<string, number> = {
      'America/New_York': -5,
      'America/Chicago': -6,
      'America/Denver': -7,
      'America/Los_Angeles': -8,
    };

    for (const [tz, offset] of Object.entries(timezoneOffsets)) {
      const localHour = (utcHour + offset + 24) % 24;
      const weight = TIMEZONE_WEIGHTS[tz] || 0;

      // Good hours: 8am-10am, 12pm-2pm, 5pm-9pm
      if ((localHour >= 8 && localHour <= 10) ||
          (localHour >= 12 && localHour <= 14) ||
          (localHour >= 17 && localHour <= 21)) {
        score += weight;
      }
    }

    return score;
  }

  /**
   * Get count of already queued posts for time slot
   */
  private async getQueuedPostsCount(platform: SocialPlatform, time: Date): Promise<number> {
    const windowStart = new Date(time.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(time.getTime() + 30 * 60 * 1000);

    const count = await prisma.contentQueue.count({
      where: {
        platforms: { has: platform },
        status: 'pending',
        scheduledAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
    });

    return count;
  }

  /**
   * Generate human-readable explanation
   */
  private explainScore(time: Date, platform: SocialPlatform, score: number): string {
    const optimalHours = OPTIMAL_POST_TIMES[platform];
    const isOptimal = optimalHours.includes(time.getUTCHours());
    const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });

    if (score >= 80) {
      return `Excellent time for ${platform} on ${dayName}. ${isOptimal ? 'Optimal posting hour.' : ''}`;
    } else if (score >= 60) {
      return `Good time for ${platform}. ${isOptimal ? 'Peak engagement hour.' : 'Reasonable audience availability.'}`;
    } else if (score >= 40) {
      return `Acceptable time. Consider scheduling earlier if possible.`;
    } else {
      return `Sub-optimal time due to rate limits or competition.`;
    }
  }

  /**
   * Get scheduling summary for admin dashboard
   */
  async getSchedulingSummary(): Promise<{
    queuedByPlatform: Record<string, number>;
    nextPosts: Array<{ platform: string; scheduledAt: Date }>;
    recommendedSlots: Array<{ platform: string; time: Date; score: number }>;
  }> {
    // Count queued posts by platform
    const queued = await prisma.contentQueue.groupBy({
      by: ['platforms'],
      where: { status: 'pending' },
      _count: true,
    });

    const queuedByPlatform: Record<string, number> = {};
    for (const q of queued) {
      for (const p of q.platforms) {
        queuedByPlatform[p] = (queuedByPlatform[p] || 0) + q._count;
      }
    }

    // Get next scheduled posts
    const nextPosts = await prisma.contentQueue.findMany({
      where: { status: 'pending' },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
      select: { platforms: true, scheduledAt: true },
    });

    // Generate recommended slots
    const platforms: SocialPlatform[] = ['twitter', 'instagram', 'facebook'];
    const recommendations: Array<{ platform: string; time: Date; score: number }> = [];

    for (const platform of platforms) {
      const result = await this.getOptimalTime({
        platform,
        contentType: 'deal',
        priority: 5,
      });
      recommendations.push({
        platform,
        time: result.scheduledAt,
        score: result.score,
      });
    }

    return {
      queuedByPlatform,
      nextPosts: nextPosts.map(p => ({
        platform: p.platforms[0],
        scheduledAt: p.scheduledAt,
      })),
      recommendedSlots: recommendations,
    };
  }
}

export const schedulerAgent = new SchedulerAgent();
