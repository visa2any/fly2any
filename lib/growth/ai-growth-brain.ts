/**
 * Fly2Any AI Growth Brain
 * Ultra-Premium Level 6 — Intelligent Growth Decision Layer
 *
 * Maximizes: LTV, Retention, Repeat bookings, Revenue efficiency
 * Minimizes: Churn, CAC, Email fatigue, Incentive overuse
 *
 * Core: Growth must feel organic, intelligent, respectful.
 * Never optimize short-term at expense of trust.
 *
 * @version 1.0.0
 */

import prisma from '@/lib/prisma';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type LTVSegment = 'LOW' | 'MEDIUM' | 'HIGH' | 'VIP';
export type ChurnLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RecommendedAction = 'NONE' | 'CONTENT' | 'ALERT' | 'EMAIL' | 'PUSH' | 'VALUE' | 'DISCOUNT';

export interface UserProfile {
  userId: string;
  email: string;
  registeredAt: Date;
  country?: string;
  device?: 'mobile' | 'desktop';
  language?: string;
  currency?: string;
}

export interface BehavioralSignals {
  searchesPerWeek: number;
  destinationsSearched: string[];
  priceSensitivity: 'low' | 'medium' | 'high';
  bookingAttempts: number;
  successfulBookings: number;
  abandonedBookings: number;
  ancillaryPurchases: number;
}

export interface EngagementSignals {
  emailOpenRate: number;
  clickThroughRate: number;
  sessionFrequency: number;
  lastActivityAt?: Date;
  daysInactive: number;
}

export interface FinancialSignals {
  totalRevenue: number;
  averageOrderValue: number;
  discountUsageCount: number;
  refundCount: number;
  cancellationCount: number;
}

export interface GrowthDecision {
  userId: string;
  ltvScore: number;
  ltvSegment: LTVSegment;
  churnProbability: number;
  churnLevel: ChurnLevel;
  recommendedAction: RecommendedAction;
  reasoning: string;
  confidence: number;
  personalization?: {
    tone: 'deal' | 'value' | 'premium';
    destinations?: string[];
    urgency: 'low' | 'medium' | 'high';
  };
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  // LTV Thresholds
  ltv: {
    low: 200,
    medium: 1000,
    high: 5000,
  },
  // Churn weights
  churn: {
    inactivityWeight: 0.35,
    engagementWeight: 0.25,
    abandonmentWeight: 0.20,
    refundWeight: 0.20,
  },
  // Action thresholds
  action: {
    minChurnForIntervention: 30,
    minChurnForDiscount: 60,
    maxDiscountForHighLTV: false, // Never discount high LTV by default
  },
  // Cache TTL (minutes)
  cacheTTL: 60,
};

// In-memory cache for scores
const scoreCache = new Map<string, { decision: GrowthDecision; timestamp: number }>();

// ═══════════════════════════════════════════════════════════════
// AI GROWTH BRAIN
// ═══════════════════════════════════════════════════════════════

export class AIGrowthBrain {
  /**
   * Main evaluation function — analyzes user and recommends action
   */
  async evaluate(userId: string): Promise<GrowthDecision> {
    // Check cache first
    const cached = this.getCached(userId);
    if (cached) return cached;

    // Gather all signals
    const [profile, behavioral, engagement, financial] = await Promise.all([
      this.getUserProfile(userId),
      this.getBehavioralSignals(userId),
      this.getEngagementSignals(userId),
      this.getFinancialSignals(userId),
    ]);

    if (!profile) {
      return this.defaultDecision(userId, 'User not found');
    }

    // Calculate scores
    const ltvScore = this.calculateLTV(profile, behavioral, financial);
    const ltvSegment = this.segmentLTV(ltvScore);
    const churnProbability = this.calculateChurn(behavioral, engagement, financial);
    const churnLevel = this.segmentChurn(churnProbability);

    // Determine action
    const action = this.decideAction(ltvSegment, churnLevel, behavioral, engagement);
    const personalization = this.personalize(ltvSegment, behavioral, engagement);

    const decision: GrowthDecision = {
      userId,
      ltvScore,
      ltvSegment,
      churnProbability,
      churnLevel,
      recommendedAction: action.action,
      reasoning: action.reasoning,
      confidence: action.confidence,
      personalization,
    };

    // Cache result
    this.setCache(userId, decision);

    return decision;
  }

  // ─────────────────────────────────────────────────────────────
  // LTV CALCULATION
  // ─────────────────────────────────────────────────────────────

  private calculateLTV(
    profile: UserProfile,
    behavioral: BehavioralSignals,
    financial: FinancialSignals
  ): number {
    // Base: total revenue
    let score = financial.totalRevenue;

    // Recency bonus (more recent = higher)
    const daysSinceRegistration = Math.floor((Date.now() - profile.registeredAt.getTime()) / 86400000);
    const recencyMultiplier = daysSinceRegistration < 30 ? 1.2 : daysSinceRegistration < 90 ? 1.1 : 1.0;
    score *= recencyMultiplier;

    // Frequency bonus
    const bookingFrequency = behavioral.successfulBookings / Math.max(1, daysSinceRegistration / 30);
    score *= (1 + bookingFrequency * 0.2);

    // Engagement bonus
    if (behavioral.searchesPerWeek > 3) score *= 1.1;
    if (behavioral.ancillaryPurchases > 0) score *= 1.15;

    // Negative signals
    if (financial.refundCount > 0) score *= 0.9;
    if (financial.cancellationCount > 1) score *= 0.85;

    // Normalize to 0-100 scale
    return Math.min(100, Math.round(score / 100));
  }

  private segmentLTV(score: number): LTVSegment {
    if (score >= 80) return 'VIP';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }

  // ─────────────────────────────────────────────────────────────
  // CHURN PREDICTION
  // ─────────────────────────────────────────────────────────────

  private calculateChurn(
    behavioral: BehavioralSignals,
    engagement: EngagementSignals,
    financial: FinancialSignals
  ): number {
    let churnScore = 0;

    // Inactivity signal (35%)
    const inactivityScore = Math.min(100, engagement.daysInactive * 2);
    churnScore += inactivityScore * CONFIG.churn.inactivityWeight;

    // Engagement decline (25%)
    const engagementScore = 100 - (engagement.emailOpenRate * 50 + engagement.clickThroughRate * 50);
    churnScore += engagementScore * CONFIG.churn.engagementWeight;

    // Abandonment signal (20%)
    const abandonRate = behavioral.bookingAttempts > 0
      ? (behavioral.abandonedBookings / behavioral.bookingAttempts) * 100
      : 0;
    churnScore += abandonRate * CONFIG.churn.abandonmentWeight;

    // Negative financial signals (20%)
    const refundRate = financial.refundCount * 15 + financial.cancellationCount * 10;
    churnScore += Math.min(100, refundRate) * CONFIG.churn.refundWeight;

    return Math.min(100, Math.round(churnScore));
  }

  private segmentChurn(probability: number): ChurnLevel {
    if (probability >= 86) return 'CRITICAL';
    if (probability >= 61) return 'HIGH';
    if (probability >= 31) return 'MEDIUM';
    return 'LOW';
  }

  // ─────────────────────────────────────────────────────────────
  // ACTION DECISION
  // ─────────────────────────────────────────────────────────────

  private decideAction(
    ltvSegment: LTVSegment,
    churnLevel: ChurnLevel,
    behavioral: BehavioralSignals,
    engagement: EngagementSignals
  ): { action: RecommendedAction; reasoning: string; confidence: number } {

    // VIP users — never discount, always value
    if (ltvSegment === 'VIP') {
      if (churnLevel === 'CRITICAL') {
        return { action: 'VALUE', reasoning: 'VIP at critical churn — exclusive value offer', confidence: 90 };
      }
      if (churnLevel === 'HIGH') {
        return { action: 'EMAIL', reasoning: 'VIP at high churn — personalized re-engagement', confidence: 85 };
      }
      return { action: 'NONE', reasoning: 'VIP stable — no intervention needed', confidence: 95 };
    }

    // High LTV — protect margin, use value not discount
    if (ltvSegment === 'HIGH') {
      if (churnLevel === 'CRITICAL') {
        return { action: 'VALUE', reasoning: 'High LTV critical churn — exclusive value, no discount', confidence: 85 };
      }
      if (churnLevel === 'HIGH') {
        return { action: 'ALERT', reasoning: 'High LTV high churn — price alert on searched routes', confidence: 80 };
      }
      return { action: 'CONTENT', reasoning: 'High LTV low risk — personalized content', confidence: 90 };
    }

    // Medium LTV — balance retention and cost
    if (ltvSegment === 'MEDIUM') {
      if (churnLevel === 'CRITICAL') {
        return { action: 'DISCOUNT', reasoning: 'Medium LTV critical — targeted discount to save', confidence: 75 };
      }
      if (churnLevel === 'HIGH') {
        return { action: 'EMAIL', reasoning: 'Medium LTV high churn — re-engagement email', confidence: 80 };
      }
      if (engagement.daysInactive > 14) {
        return { action: 'PUSH', reasoning: 'Medium LTV inactive — push notification', confidence: 70 };
      }
      return { action: 'NONE', reasoning: 'Medium LTV stable — no action', confidence: 85 };
    }

    // Low LTV — minimal investment
    if (ltvSegment === 'LOW') {
      if (churnLevel === 'CRITICAL' && behavioral.successfulBookings > 0) {
        return { action: 'EMAIL', reasoning: 'Low LTV but has booked — light re-engagement', confidence: 60 };
      }
      if (behavioral.searchesPerWeek > 2) {
        return { action: 'ALERT', reasoning: 'Low LTV but active searcher — price alert', confidence: 65 };
      }
      return { action: 'NONE', reasoning: 'Low LTV low activity — no investment', confidence: 90 };
    }

    return { action: 'NONE', reasoning: 'No clear signal — silence is better', confidence: 95 };
  }

  // ─────────────────────────────────────────────────────────────
  // PERSONALIZATION
  // ─────────────────────────────────────────────────────────────

  private personalize(
    ltvSegment: LTVSegment,
    behavioral: BehavioralSignals,
    engagement: EngagementSignals
  ): GrowthDecision['personalization'] {
    // Tone based on price sensitivity
    const tone = behavioral.priceSensitivity === 'high' ? 'deal' :
                 ltvSegment === 'VIP' || ltvSegment === 'HIGH' ? 'premium' : 'value';

    // Urgency based on churn risk and activity
    const urgency = engagement.daysInactive > 21 ? 'high' :
                    engagement.daysInactive > 7 ? 'medium' : 'low';

    return {
      tone,
      destinations: behavioral.destinationsSearched.slice(0, 3),
      urgency,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // DATA GATHERING
  // ─────────────────────────────────────────────────────────────

  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!prisma) return null;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, createdAt: true, country: true },
      });
      if (!user) return null;
      return {
        userId: user.id,
        email: user.email || '',
        registeredAt: user.createdAt,
        country: user.country || undefined,
      };
    } catch { return null; }
  }

  private async getBehavioralSignals(userId: string): Promise<BehavioralSignals> {
    const base: BehavioralSignals = {
      searchesPerWeek: 0,
      destinationsSearched: [],
      priceSensitivity: 'medium',
      bookingAttempts: 0,
      successfulBookings: 0,
      abandonedBookings: 0,
      ancillaryPurchases: 0,
    };
    if (!prisma) return base;
    try {
      const [bookings, alerts] = await Promise.all([
        prisma.booking.findMany({
          where: { userId },
          select: { status: true, createdAt: true },
        }),
        prisma.priceAlert?.count({ where: { userId } }) || 0,
      ]);
      const successful = bookings.filter(b => ['confirmed', 'ticketed'].includes(b.status || '')).length;
      const abandoned = bookings.filter(b => b.status === 'abandoned').length;
      return {
        ...base,
        bookingAttempts: bookings.length,
        successfulBookings: successful,
        abandonedBookings: abandoned,
        priceSensitivity: (alerts || 0) > 3 ? 'high' : (alerts || 0) > 0 ? 'medium' : 'low',
      };
    } catch { return base; }
  }

  private async getEngagementSignals(userId: string): Promise<EngagementSignals> {
    const base: EngagementSignals = {
      emailOpenRate: 0.5,
      clickThroughRate: 0.1,
      sessionFrequency: 0,
      daysInactive: 0,
    };
    if (!prisma) return base;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { updatedAt: true },
      });
      const emailStats = await prisma.emailLog?.aggregate({
        where: { userId },
        _count: { id: true },
      }).catch(() => null);
      const opened = await prisma.emailLog?.count({
        where: { userId, openedAt: { not: null } },
      }).catch(() => 0);
      const clicked = await prisma.emailLog?.count({
        where: { userId, clickedAt: { not: null } },
      }).catch(() => 0);
      const total = emailStats?._count?.id || 1;
      const daysInactive = user?.updatedAt
        ? Math.floor((Date.now() - new Date(user.updatedAt).getTime()) / 86400000)
        : 0;
      return {
        emailOpenRate: (opened || 0) / total,
        clickThroughRate: (clicked || 0) / total,
        sessionFrequency: 0,
        lastActivityAt: user?.updatedAt,
        daysInactive,
      };
    } catch { return base; }
  }

  private async getFinancialSignals(userId: string): Promise<FinancialSignals> {
    const base: FinancialSignals = {
      totalRevenue: 0,
      averageOrderValue: 0,
      discountUsageCount: 0,
      refundCount: 0,
      cancellationCount: 0,
    };
    if (!prisma) return base;
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId, status: { in: ['confirmed', 'ticketed'] } },
        select: { totalAmount: true },
      });
      const refunds = await prisma.booking.count({
        where: { userId, status: 'refunded' },
      });
      const cancellations = await prisma.booking.count({
        where: { userId, status: 'cancelled' },
      });
      const total = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
      return {
        totalRevenue: total,
        averageOrderValue: bookings.length > 0 ? total / bookings.length : 0,
        discountUsageCount: 0,
        refundCount: refunds,
        cancellationCount: cancellations,
      };
    } catch { return base; }
  }

  // ─────────────────────────────────────────────────────────────
  // CACHING
  // ─────────────────────────────────────────────────────────────

  private getCached(userId: string): GrowthDecision | null {
    const cached = scoreCache.get(userId);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CONFIG.cacheTTL * 60 * 1000) {
      scoreCache.delete(userId);
      return null;
    }
    return cached.decision;
  }

  private setCache(userId: string, decision: GrowthDecision): void {
    scoreCache.set(userId, { decision, timestamp: Date.now() });
    // Clean old entries
    if (scoreCache.size > 1000) {
      const cutoff = Date.now() - CONFIG.cacheTTL * 60 * 1000;
      for (const [key, val] of scoreCache) {
        if (val.timestamp < cutoff) scoreCache.delete(key);
      }
    }
  }

  private defaultDecision(userId: string, reason: string): GrowthDecision {
    return {
      userId,
      ltvScore: 0,
      ltvSegment: 'LOW',
      churnProbability: 0,
      churnLevel: 'LOW',
      recommendedAction: 'NONE',
      reasoning: reason,
      confidence: 0,
    };
  }

  /**
   * Invalidate cache for user (call after meaningful events)
   */
  invalidateCache(userId: string): void {
    scoreCache.delete(userId);
  }

  /**
   * Batch evaluate multiple users (for cron jobs)
   */
  async batchEvaluate(userIds: string[]): Promise<GrowthDecision[]> {
    return Promise.all(userIds.map(id => this.evaluate(id)));
  }
}

export const growthBrain = new AIGrowthBrain();

// ═══════════════════════════════════════════════════════════════
// QUICK HELPERS
// ═══════════════════════════════════════════════════════════════

export async function evaluateUser(userId: string): Promise<GrowthDecision> {
  return growthBrain.evaluate(userId);
}

export async function shouldIntervene(userId: string): Promise<boolean> {
  const decision = await growthBrain.evaluate(userId);
  return decision.recommendedAction !== 'NONE';
}

export async function getChurnRisk(userId: string): Promise<{ probability: number; level: ChurnLevel }> {
  const decision = await growthBrain.evaluate(userId);
  return { probability: decision.churnProbability, level: decision.churnLevel };
}

export async function getLTVSegment(userId: string): Promise<{ score: number; segment: LTVSegment }> {
  const decision = await growthBrain.evaluate(userId);
  return { score: decision.ltvScore, segment: decision.ltvSegment };
}
