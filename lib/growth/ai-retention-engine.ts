/**
 * Fly2Any AI Retention Engine
 * Ultra-Premium Level 6 — Autonomous Retention Orchestration
 *
 * Goals: Reduce churn, increase repeat bookings, extend LTV, preserve trust
 * Philosophy: Helpful, never intrusive. Silence is valid.
 *
 * @version 1.0.0
 */

import { growthBrain, GrowthDecision, LTVSegment, ChurnLevel } from './ai-growth-brain';
import { triggerEmailEvent } from '@/lib/email/event-triggers';
import prisma from '@/lib/prisma';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type FlowType = 'PASSIVE' | 'REENGAGEMENT' | 'INTENT' | 'ABANDONMENT' | 'TRUST' | 'LOYALTY';
export type Channel = 'IN_APP' | 'EMAIL' | 'PUSH' | 'ALERT';
export type ExpectedOutcome = 'Retention' | 'Booking' | 'Engagement';

export interface RetentionEvent {
  type: 'search' | 'abandonment' | 'price_drop' | 'inactivity' | 'error' | 'booking' | 'return_visit';
  userId: string;
  email?: string;
  data?: Record<string, any>;
  timestamp: Date;
}

export interface RetentionFlow {
  userId: string;
  flowType: FlowType;
  triggerReason: string;
  channel: Channel;
  incentiveUsed: boolean;
  incentiveType?: 'fare_protection' | 'credit' | 'discount' | 'value_addon';
  expectedOutcome: ExpectedOutcome;
  confidence: number;
  personalization: {
    destination?: string;
    tone: 'calm' | 'urgent' | 'premium';
    message?: string;
  };
  executed: boolean;
  executedAt?: Date;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  // Flow frequency limits
  frequency: {
    maxFlowsPerDay: 1,
    maxFlowsPerWeek: 3,
    cooldownHours: 24,
  },
  // Incentive thresholds
  incentive: {
    minChurnForIncentive: 60,
    neverDiscountVIP: true,
    maxDiscountPercent: 10,
  },
  // Channel priority
  channelPriority: ['IN_APP', 'EMAIL', 'PUSH', 'ALERT'] as Channel[],
};

// Active flows tracking
const activeFlows = new Map<string, RetentionFlow>();
const flowHistory = new Map<string, { flows: RetentionFlow[]; lastFlowAt: Date }>();

// ═══════════════════════════════════════════════════════════════
// AI RETENTION ENGINE
// ═══════════════════════════════════════════════════════════════

export class AIRetentionEngine {
  /**
   * Process retention event and determine if flow should trigger
   */
  async processEvent(event: RetentionEvent): Promise<RetentionFlow | null> {
    // Get growth brain decision
    const decision = await growthBrain.evaluate(event.userId);

    // Check if user already has active flow
    if (activeFlows.has(event.userId)) {
      return null; // Never trigger multiple flows simultaneously
    }

    // Check frequency limits
    if (!this.checkFrequencyLimits(event.userId)) {
      return null;
    }

    // Determine flow type based on event and user state
    const flow = this.determineFlow(event, decision);

    if (!flow || flow.flowType === 'PASSIVE') {
      return null; // No action needed
    }

    // Execute flow
    await this.executeFlow(flow, event);

    return flow;
  }

  /**
   * Determine appropriate flow based on event and user state
   */
  private determineFlow(event: RetentionEvent, decision: GrowthDecision): RetentionFlow | null {
    const { ltvSegment, churnLevel, churnProbability } = decision;

    // Base flow structure
    const baseFlow: Partial<RetentionFlow> = {
      userId: event.userId,
      incentiveUsed: false,
      executed: false,
      personalization: { tone: 'calm' },
    };

    // ─── Event-based flow determination ───

    // Price drop on watched route
    if (event.type === 'price_drop') {
      return {
        ...baseFlow,
        flowType: 'INTENT',
        triggerReason: 'Price drop on watched route',
        channel: this.selectChannel(ltvSegment, 'ALERT'),
        expectedOutcome: 'Booking',
        confidence: 85,
        personalization: {
          tone: 'calm',
          destination: event.data?.destination,
          message: `Price dropped to $${event.data?.newPrice}`,
        },
      } as RetentionFlow;
    }

    // Search abandonment
    if (event.type === 'abandonment' && event.data?.stage === 'search') {
      if (churnProbability < 30) return null; // Low risk, do nothing

      return {
        ...baseFlow,
        flowType: 'ABANDONMENT',
        triggerReason: 'Search abandoned with medium+ churn risk',
        channel: this.selectChannel(ltvSegment, 'EMAIL'),
        incentiveUsed: this.shouldUseIncentive(ltvSegment, churnProbability),
        expectedOutcome: 'Booking',
        confidence: 70,
        personalization: {
          tone: 'calm',
          destination: event.data?.destination,
        },
      } as RetentionFlow;
    }

    // Booking abandonment
    if (event.type === 'abandonment' && event.data?.stage === 'booking') {
      return {
        ...baseFlow,
        flowType: 'ABANDONMENT',
        triggerReason: 'Booking abandoned at checkout',
        channel: this.selectChannel(ltvSegment, 'EMAIL'),
        incentiveUsed: this.shouldUseIncentive(ltvSegment, churnProbability),
        incentiveType: ltvSegment === 'VIP' ? 'value_addon' : 'credit',
        expectedOutcome: 'Booking',
        confidence: 80,
        personalization: {
          tone: ltvSegment === 'VIP' ? 'premium' : 'calm',
          destination: event.data?.destination,
        },
      } as RetentionFlow;
    }

    // Inactivity detection
    if (event.type === 'inactivity') {
      if (ltvSegment === 'VIP') {
        return {
          ...baseFlow,
          flowType: 'TRUST',
          triggerReason: 'VIP user inactivity — trust reinforcement',
          channel: 'EMAIL',
          incentiveUsed: false, // Never discount VIP
          expectedOutcome: 'Engagement',
          confidence: 75,
          personalization: { tone: 'premium' },
        } as RetentionFlow;
      }

      if (churnLevel === 'HIGH' || churnLevel === 'CRITICAL') {
        return {
          ...baseFlow,
          flowType: 'REENGAGEMENT',
          triggerReason: `High churn risk (${churnProbability}%) after inactivity`,
          channel: this.selectChannel(ltvSegment, 'EMAIL'),
          incentiveUsed: this.shouldUseIncentive(ltvSegment, churnProbability),
          expectedOutcome: 'Engagement',
          confidence: 65,
          personalization: { tone: 'calm' },
        } as RetentionFlow;
      }

      return null; // Low churn, do nothing
    }

    // Error or friction detected
    if (event.type === 'error') {
      return {
        ...baseFlow,
        flowType: 'TRUST',
        triggerReason: 'Error/friction detected — trust reinforcement',
        channel: 'IN_APP',
        incentiveUsed: false,
        expectedOutcome: 'Retention',
        confidence: 90,
        personalization: {
          tone: 'calm',
          message: 'We\'re here to help. Our support team is available 24/7.',
        },
      } as RetentionFlow;
    }

    // Return visit after long absence
    if (event.type === 'return_visit' && event.data?.daysAbsent > 30) {
      return {
        ...baseFlow,
        flowType: 'LOYALTY',
        triggerReason: `Return visit after ${event.data.daysAbsent} days`,
        channel: 'IN_APP',
        incentiveUsed: false,
        expectedOutcome: 'Engagement',
        confidence: 80,
        personalization: {
          tone: ltvSegment === 'VIP' ? 'premium' : 'calm',
          message: 'Welcome back. We\'ve saved your preferences.',
        },
      } as RetentionFlow;
    }

    // Successful booking — loyalty building
    if (event.type === 'booking') {
      if (decision.bookingCount >= 3) {
        return {
          ...baseFlow,
          flowType: 'LOYALTY',
          triggerReason: 'Repeat customer — loyalty reinforcement',
          channel: 'EMAIL',
          incentiveUsed: false,
          expectedOutcome: 'Retention',
          confidence: 85,
          personalization: { tone: 'premium' },
        } as RetentionFlow;
      }
    }

    // Default: passive (no action)
    return null;
  }

  /**
   * Select best channel based on user segment
   */
  private selectChannel(segment: LTVSegment, preferred: Channel): Channel {
    // VIP gets premium channels
    if (segment === 'VIP') {
      return preferred === 'PUSH' ? 'EMAIL' : preferred;
    }
    return preferred;
  }

  /**
   * Determine if incentive should be used
   */
  private shouldUseIncentive(segment: LTVSegment, churnProbability: number): boolean {
    // Never discount VIP
    if (segment === 'VIP' && CONFIG.incentive.neverDiscountVIP) {
      return false;
    }
    // Only use incentive if high churn risk
    return churnProbability >= CONFIG.incentive.minChurnForIncentive;
  }

  /**
   * Check frequency limits
   */
  private checkFrequencyLimits(userId: string): boolean {
    const history = flowHistory.get(userId);
    if (!history) return true;

    const now = Date.now();
    const hoursSinceLastFlow = (now - history.lastFlowAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastFlow < CONFIG.frequency.cooldownHours) {
      return false;
    }

    const recentFlows = history.flows.filter(f =>
      f.executedAt && (now - f.executedAt.getTime()) < 7 * 24 * 60 * 60 * 1000
    );

    return recentFlows.length < CONFIG.frequency.maxFlowsPerWeek;
  }

  /**
   * Execute the retention flow
   */
  private async executeFlow(flow: RetentionFlow, event: RetentionEvent): Promise<void> {
    flow.executed = true;
    flow.executedAt = new Date();

    // Track active flow
    activeFlows.set(flow.userId, flow);

    // Update history
    const history = flowHistory.get(flow.userId) || { flows: [], lastFlowAt: new Date() };
    history.flows.push(flow);
    history.lastFlowAt = new Date();
    flowHistory.set(flow.userId, history);

    // Execute based on channel
    try {
      switch (flow.channel) {
        case 'EMAIL':
          if (event.email) {
            await this.sendEmailFlow(flow, event.email);
          }
          break;
        case 'ALERT':
          // Price alert already handled by alert system
          break;
        case 'IN_APP':
        case 'PUSH':
          // Would integrate with push/in-app notification system
          await this.logFlow(flow);
          break;
      }
    } catch (error) {
      console.error('[Retention] Flow execution error:', error);
    }

    // Remove from active after 1 hour
    setTimeout(() => activeFlows.delete(flow.userId), 60 * 60 * 1000);
  }

  /**
   * Send email-based retention flow
   */
  private async sendEmailFlow(flow: RetentionFlow, email: string): Promise<void> {
    const eventMap: Record<FlowType, string> = {
      PASSIVE: '',
      REENGAGEMENT: 'user_inactive',
      INTENT: 'price_drop',
      ABANDONMENT: 'search_abandoned',
      TRUST: 'booking_confirmed',
      LOYALTY: 'trip_completed',
    };

    const eventType = eventMap[flow.flowType];
    if (!eventType) return;

    await triggerEmailEvent(eventType as any, email, {
      destination: flow.personalization.destination,
      message: flow.personalization.message,
      flowType: flow.flowType,
      incentiveUsed: flow.incentiveUsed,
    }, flow.userId);
  }

  /**
   * Log flow for analytics
   */
  private async logFlow(flow: RetentionFlow): Promise<void> {
    if (!prisma) return;
    try {
      await prisma.webhookEvent?.create({
        data: {
          id: `retention_${Date.now()}_${flow.userId}`,
          eventType: 'retention_flow',
          eventData: flow as any,
          status: 'processed',
          receivedAt: new Date(),
        },
      });
    } catch { /* ignore */ }
  }

  /**
   * Get flow metrics for a user
   */
  getFlowMetrics(userId: string): { activeFlow: RetentionFlow | null; history: RetentionFlow[] } {
    return {
      activeFlow: activeFlows.get(userId) || null,
      history: flowHistory.get(userId)?.flows || [],
    };
  }

  /**
   * Batch process inactive users (for cron)
   */
  async processInactiveUsers(userIds: string[], emails: Record<string, string>): Promise<RetentionFlow[]> {
    const flows: RetentionFlow[] = [];
    for (const userId of userIds) {
      const flow = await this.processEvent({
        type: 'inactivity',
        userId,
        email: emails[userId],
        timestamp: new Date(),
      });
      if (flow) flows.push(flow);
    }
    return flows;
  }
}

export const retentionEngine = new AIRetentionEngine();

// ═══════════════════════════════════════════════════════════════
// QUICK HELPERS
// ═══════════════════════════════════════════════════════════════

export async function triggerRetention(event: RetentionEvent): Promise<RetentionFlow | null> {
  return retentionEngine.processEvent(event);
}

export async function onSearchAbandoned(userId: string, email: string, destination: string): Promise<RetentionFlow | null> {
  return retentionEngine.processEvent({
    type: 'abandonment',
    userId,
    email,
    data: { stage: 'search', destination },
    timestamp: new Date(),
  });
}

export async function onBookingAbandoned(userId: string, email: string, destination: string, amount: number): Promise<RetentionFlow | null> {
  return retentionEngine.processEvent({
    type: 'abandonment',
    userId,
    email,
    data: { stage: 'booking', destination, amount },
    timestamp: new Date(),
  });
}

export async function onPriceDrop(userId: string, email: string, destination: string, oldPrice: number, newPrice: number): Promise<RetentionFlow | null> {
  return retentionEngine.processEvent({
    type: 'price_drop',
    userId,
    email,
    data: { destination, oldPrice, newPrice },
    timestamp: new Date(),
  });
}

export async function onUserError(userId: string, errorType: string): Promise<RetentionFlow | null> {
  return retentionEngine.processEvent({
    type: 'error',
    userId,
    data: { errorType },
    timestamp: new Date(),
  });
}
