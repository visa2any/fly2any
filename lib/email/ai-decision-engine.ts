/**
 * AI Email Decision Engine
 *
 * Intelligent decision layer that determines:
 * - IF an email should be sent
 * - WHEN it should be sent (optimal timing)
 * - WHICH template to use
 * - WHAT content to personalize
 *
 * @version 1.0.0
 */

import prisma from '@/lib/prisma';

// ===================================
// TYPES
// ===================================

export type EmailDecision = 'send' | 'delay' | 'skip';

export interface UserContext {
  userId?: string;
  email: string;
  timezone?: string;
  device?: 'mobile' | 'desktop';
  lastEmailSent?: Date;
  lastEmailOpened?: Date;
  totalEmailsSent?: number;
  totalEmailsOpened?: number;
  searchHistory?: Array<{ origin: string; destination: string; date: Date }>;
  bookingHistory?: Array<{ status: string; amount: number; date: Date }>;
  priceAlertCount?: number;
}

export interface EmailIntent {
  type: 'transactional' | 'marketing' | 'alert' | 'recovery';
  event: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  data: Record<string, any>;
}

export interface AIDecisionResult {
  decision: EmailDecision;
  reason: string;
  delayMinutes?: number;
  templateVariant?: string;
  subjectVariant?: string;
  ctaVariant?: string;
  sendTime?: Date;
  confidence: number;
}

// ===================================
// CONFIGURATION
// ===================================

const CONFIG = {
  // Max emails per user per day
  dailyLimit: {
    transactional: 10,
    marketing: 2,
    alert: 5,
    recovery: 1,
  },
  // Minimum hours between same-type emails
  minHoursBetween: {
    transactional: 0, // No limit for transactional
    marketing: 24,
    alert: 4,
    recovery: 48,
  },
  // Optimal send hours (local time)
  optimalHours: {
    marketing: [9, 10, 11, 14, 15, 19, 20], // Business hours + evening
    alert: [8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20], // Wider window
    recovery: [10, 11, 14, 15, 19], // Prime engagement times
  },
  // Never send during these hours (local time)
  quietHours: {
    start: 22, // 10 PM
    end: 7,    // 7 AM
  },
};

// ===================================
// AI DECISION ENGINE
// ===================================

export class AIEmailDecisionEngine {
  /**
   * Main decision function - determines if/when/how to send email
   */
  async decide(user: UserContext, intent: EmailIntent): Promise<AIDecisionResult> {
    // Step 1: Check if email should be sent at all
    const shouldSend = await this.shouldSendEmail(user, intent);
    if (!shouldSend.send) {
      return {
        decision: 'skip',
        reason: shouldSend.reason,
        confidence: 0.95,
      };
    }

    // Step 2: Determine optimal send time
    const timing = this.calculateOptimalTiming(user, intent);
    if (timing.delay > 0) {
      return {
        decision: 'delay',
        reason: timing.reason,
        delayMinutes: timing.delay,
        sendTime: new Date(Date.now() + timing.delay * 60 * 1000),
        confidence: timing.confidence,
      };
    }

    // Step 3: Select best template/content variants
    const variants = this.selectVariants(user, intent);

    return {
      decision: 'send',
      reason: 'All conditions met for immediate delivery',
      templateVariant: variants.template,
      subjectVariant: variants.subject,
      ctaVariant: variants.cta,
      sendTime: new Date(),
      confidence: 0.9,
    };
  }

  /**
   * Check if email should be sent (frequency, engagement, etc.)
   */
  private async shouldSendEmail(
    user: UserContext,
    intent: EmailIntent
  ): Promise<{ send: boolean; reason: string }> {
    // Critical transactional emails always go through
    if (intent.type === 'transactional' && intent.priority === 'critical') {
      return { send: true, reason: 'Critical transactional email' };
    }

    // Check daily limit
    const dailySent = await this.getDailyEmailCount(user.email, intent.type);
    const limit = CONFIG.dailyLimit[intent.type];
    if (dailySent >= limit) {
      return { send: false, reason: `Daily limit reached (${dailySent}/${limit})` };
    }

    // Check minimum time between emails
    if (user.lastEmailSent) {
      const hoursSinceLastEmail = (Date.now() - user.lastEmailSent.getTime()) / (1000 * 60 * 60);
      const minHours = CONFIG.minHoursBetween[intent.type];
      if (hoursSinceLastEmail < minHours) {
        return {
          send: false,
          reason: `Too soon since last email (${hoursSinceLastEmail.toFixed(1)}h < ${minHours}h)`
        };
      }
    }

    // Check engagement score for marketing emails
    if (intent.type === 'marketing') {
      const engagementScore = this.calculateEngagementScore(user);
      if (engagementScore < 0.1) {
        return { send: false, reason: 'Low engagement score - user likely uninterested' };
      }
    }

    // Check quiet hours for non-critical emails
    if (intent.priority !== 'critical') {
      const userHour = this.getUserLocalHour(user.timezone);
      if (userHour >= CONFIG.quietHours.start || userHour < CONFIG.quietHours.end) {
        return { send: false, reason: 'Quiet hours - will delay' };
      }
    }

    return { send: true, reason: 'All checks passed' };
  }

  /**
   * Calculate optimal send timing
   */
  private calculateOptimalTiming(
    user: UserContext,
    intent: EmailIntent
  ): { delay: number; reason: string; confidence: number } {
    // Transactional emails send immediately
    if (intent.type === 'transactional') {
      return { delay: 0, reason: 'Transactional - immediate', confidence: 1.0 };
    }

    const userHour = this.getUserLocalHour(user.timezone);
    const optimalHours = CONFIG.optimalHours[intent.type] || CONFIG.optimalHours.marketing;

    // If current hour is optimal, send now
    if (optimalHours.includes(userHour)) {
      return { delay: 0, reason: 'Current hour is optimal', confidence: 0.85 };
    }

    // Calculate delay to next optimal hour
    const nextOptimalHour = optimalHours.find(h => h > userHour) || optimalHours[0] + 24;
    const delayHours = nextOptimalHour - userHour;
    const delayMinutes = Math.max(0, delayHours * 60);

    return {
      delay: delayMinutes,
      reason: `Delaying to optimal hour (${nextOptimalHour % 24}:00)`,
      confidence: 0.75,
    };
  }

  /**
   * Select best content variants based on user profile
   */
  private selectVariants(
    user: UserContext,
    intent: EmailIntent
  ): { template: string; subject: string; cta: string } {
    // Mobile users get shorter content
    if (user.device === 'mobile') {
      return {
        template: 'mobile_optimized',
        subject: 'short',
        cta: 'action_focused',
      };
    }

    // High-value users (frequent bookers) get premium treatment
    if (user.bookingHistory && user.bookingHistory.length > 2) {
      return {
        template: 'premium',
        subject: 'personalized',
        cta: 'exclusive',
      };
    }

    // Price-sensitive users (many price alerts)
    if (user.priceAlertCount && user.priceAlertCount > 3) {
      return {
        template: 'deal_focused',
        subject: 'savings_highlight',
        cta: 'book_now',
      };
    }

    // Default variants
    return {
      template: 'standard',
      subject: 'standard',
      cta: 'standard',
    };
  }

  /**
   * Calculate user engagement score (0-1)
   */
  private calculateEngagementScore(user: UserContext): number {
    if (!user.totalEmailsSent || user.totalEmailsSent === 0) {
      return 0.5; // New user - neutral score
    }

    const openRate = (user.totalEmailsOpened || 0) / user.totalEmailsSent;
    const recency = user.lastEmailOpened
      ? Math.max(0, 1 - (Date.now() - user.lastEmailOpened.getTime()) / (30 * 24 * 60 * 60 * 1000))
      : 0;

    return openRate * 0.7 + recency * 0.3;
  }

  /**
   * Get user's local hour based on timezone
   */
  private getUserLocalHour(timezone?: string): number {
    try {
      const now = new Date();
      if (timezone) {
        return parseInt(now.toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false }));
      }
      // Default to EST if no timezone
      return parseInt(now.toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }));
    } catch {
      return new Date().getHours();
    }
  }

  /**
   * Get count of emails sent today to user
   */
  private async getDailyEmailCount(email: string, type: string): Promise<number> {
    if (!prisma) return 0;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const count = await prisma.emailLog.count({
        where: {
          recipientEmail: email,
          emailType: type,
          sentAt: { gte: today },
        },
      });
      return count;
    } catch {
      return 0; // If table doesn't exist, assume 0
    }
  }
}

// Export singleton instance
export const aiEmailEngine = new AIEmailDecisionEngine();
