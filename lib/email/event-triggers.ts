/**
 * Event-Driven Email Triggers
 *
 * Automatically triggers emails based on real user events.
 * No batch logic - pure event-driven architecture.
 *
 * @version 1.0.0
 */

import { aiEmailEngine, UserContext, EmailIntent, AIDecisionResult } from './ai-decision-engine';
import { emailService } from './service';
import { mailgunClient } from './mailgun-client';
import prisma from '@/lib/prisma';

// ===================================
// TYPES
// ===================================

export type EmailEvent =
  | 'flight_search'
  | 'price_drop'
  | 'search_abandoned'
  | 'booking_started'
  | 'booking_failed'
  | 'booking_confirmed'
  | 'payment_received'
  | 'ticket_issued'
  | 'trip_upcoming'
  | 'trip_completed'
  | 'user_inactive'
  | 'user_signup'
  | 'coupon_eligible';

export interface EventPayload {
  event: EmailEvent;
  userId?: string;
  email: string;
  data: Record<string, any>;
  timestamp?: Date;
}

export interface TriggerResult {
  triggered: boolean;
  emailId?: string;
  decision: AIDecisionResult;
  scheduledFor?: Date;
}

// ===================================
// EVENT → EMAIL MAPPING
// ===================================

const EVENT_EMAIL_MAP: Record<EmailEvent, {
  intent: EmailIntent['type'];
  priority: EmailIntent['priority'];
  template: string;
  delayMinutes?: number;
}> = {
  flight_search: {
    intent: 'marketing',
    priority: 'low',
    template: 'abandoned_search',
    delayMinutes: 30, // Wait 30 min before sending
  },
  price_drop: {
    intent: 'alert',
    priority: 'high',
    template: 'price_alert',
  },
  search_abandoned: {
    intent: 'recovery',
    priority: 'medium',
    template: 'abandoned_search',
    delayMinutes: 60,
  },
  booking_started: {
    intent: 'recovery',
    priority: 'high',
    template: 'abandoned_booking',
    delayMinutes: 15,
  },
  booking_failed: {
    intent: 'transactional',
    priority: 'critical',
    template: 'booking_failed',
  },
  booking_confirmed: {
    intent: 'transactional',
    priority: 'critical',
    template: 'booking_confirmation',
  },
  payment_received: {
    intent: 'transactional',
    priority: 'critical',
    template: 'payment_received',
  },
  ticket_issued: {
    intent: 'transactional',
    priority: 'critical',
    template: 'eticket',
  },
  trip_upcoming: {
    intent: 'transactional',
    priority: 'high',
    template: 'trip_reminder',
    delayMinutes: 0, // Send at scheduled time
  },
  trip_completed: {
    intent: 'marketing',
    priority: 'low',
    template: 'trip_review',
    delayMinutes: 1440, // 24 hours after
  },
  user_inactive: {
    intent: 'marketing',
    priority: 'low',
    template: 'reactivation',
  },
  user_signup: {
    intent: 'transactional',
    priority: 'high',
    template: 'welcome',
  },
  coupon_eligible: {
    intent: 'marketing',
    priority: 'medium',
    template: 'coupon_offer',
  },
};

// ===================================
// EMAIL TRIGGER SERVICE
// ===================================

class EmailTriggerService {
  private scheduledEmails: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Process an event and trigger appropriate email
   */
  async trigger(payload: EventPayload): Promise<TriggerResult> {
    const config = EVENT_EMAIL_MAP[payload.event];
    if (!config) {
      return {
        triggered: false,
        decision: {
          decision: 'skip',
          reason: `Unknown event: ${payload.event}`,
          confidence: 1,
        },
      };
    }

    // Build user context
    const userContext = await this.buildUserContext(payload);

    // Build email intent
    const intent: EmailIntent = {
      type: config.intent,
      event: payload.event,
      priority: config.priority,
      data: payload.data,
    };

    // Get AI decision
    const decision = await aiEmailEngine.decide(userContext, intent);

    // Log the decision
    await this.logDecision(payload, decision);

    // Handle decision
    if (decision.decision === 'skip') {
      return { triggered: false, decision };
    }

    if (decision.decision === 'delay') {
      const totalDelay = (decision.delayMinutes || 0) + (config.delayMinutes || 0);
      const scheduledTime = new Date(Date.now() + totalDelay * 60 * 1000);

      await this.scheduleEmail(payload, scheduledTime);

      return {
        triggered: true,
        decision,
        scheduledFor: scheduledTime,
      };
    }

    // Send immediately
    const emailId = await this.sendEmail(payload, config.template, decision);

    return {
      triggered: true,
      emailId,
      decision,
    };
  }

  /**
   * Build user context from payload and database
   */
  private async buildUserContext(payload: EventPayload): Promise<UserContext> {
    const context: UserContext = {
      email: payload.email,
      userId: payload.userId,
    };

    if (payload.userId && prisma) {
      try {
        // Get user data
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        // Get email stats
        const emailStats = await prisma.emailLog.aggregate({
          where: { recipientEmail: payload.email },
          _count: { id: true },
          _max: { sentAt: true, openedAt: true },
        });

        const openedCount = await prisma.emailLog.count({
          where: {
            recipientEmail: payload.email,
            openedAt: { not: null },
          },
        });

        context.totalEmailsSent = emailStats._count.id;
        context.totalEmailsOpened = openedCount;
        context.lastEmailSent = emailStats._max.sentAt || undefined;
        context.lastEmailOpened = emailStats._max.openedAt || undefined;

        // Get price alert count
        const alertCount = await prisma.priceAlert.count({
          where: { userId: payload.userId },
        });
        context.priceAlertCount = alertCount;

      } catch (e) {
        console.warn('[EmailTrigger] Could not fetch user context:', e);
      }
    }

    return context;
  }

  /**
   * Schedule email for later delivery
   */
  private async scheduleEmail(payload: EventPayload, sendAt: Date): Promise<void> {
    const key = `${payload.email}:${payload.event}:${Date.now()}`;
    const delay = sendAt.getTime() - Date.now();

    if (delay <= 0) {
      await this.sendEmail(payload, EVENT_EMAIL_MAP[payload.event].template, {
        decision: 'send',
        reason: 'Scheduled time passed',
        confidence: 1,
      });
      return;
    }

    // Store scheduled email in database
    if (prisma) {
      try {
        await prisma.scheduledEmail.create({
          data: {
            email: payload.email,
            event: payload.event,
            payload: JSON.stringify(payload),
            scheduledFor: sendAt,
            status: 'pending',
          },
        });
      } catch {
        // Table might not exist
      }
    }

    // Set timeout (for short delays only - long delays handled by cron)
    if (delay < 60 * 60 * 1000) { // Less than 1 hour
      const timeout = setTimeout(async () => {
        await this.sendEmail(payload, EVENT_EMAIL_MAP[payload.event].template, {
          decision: 'send',
          reason: 'Scheduled delivery',
          confidence: 1,
        });
        this.scheduledEmails.delete(key);
      }, delay);

      this.scheduledEmails.set(key, timeout);
    }

    console.log(`📧 [EmailTrigger] Scheduled ${payload.event} email for ${sendAt.toISOString()}`);
  }

  /**
   * Send email using appropriate template
   */
  private async sendEmail(
    payload: EventPayload,
    template: string,
    decision: AIDecisionResult
  ): Promise<string | undefined> {
    console.log(`📧 [EmailTrigger] Sending ${template} to ${payload.email}`);

    try {
      let success = false;
      const data = payload.data;

      // Route to appropriate email function
      switch (template) {
        case 'abandoned_search':
          success = await emailService.sendAbandonedSearch(payload.email, {
            firstName: data.firstName || 'Traveler',
            origin: data.origin,
            originCity: data.originCity || data.origin,
            destination: data.destination,
            destinationCity: data.destinationCity || data.destination,
            departureDate: data.departureDate,
            returnDate: data.returnDate,
            lowestPrice: data.lowestPrice,
            currency: data.currency || 'USD',
            searchUrl: data.searchUrl || `https://www.fly2any.com/flights?from=${data.origin}&to=${data.destination}`,
          });
          break;

        case 'abandoned_booking':
          success = await emailService.sendAbandonedBooking(payload.email, {
            firstName: data.firstName || 'Traveler',
            origin: data.origin,
            originCity: data.originCity || data.origin,
            destination: data.destination,
            destinationCity: data.destinationCity || data.destination,
            departureDate: data.departureDate,
            price: data.price,
            currency: data.currency || 'USD',
            airline: data.airline,
            resumeUrl: data.resumeUrl || `https://www.fly2any.com/booking/resume`,
            expiresIn: '24 hours',
          });
          break;

        case 'price_alert':
          success = await emailService.sendPriceAlert(payload.email, {
            origin: data.origin,
            destination: data.destination,
            departDate: data.departDate,
            returnDate: data.returnDate,
            currentPrice: data.currentPrice,
            targetPrice: data.targetPrice,
            currency: data.currency || 'USD',
          });
          break;

        case 'welcome':
          success = await emailService.sendEmailVerification(payload.email, {
            firstName: data.firstName || 'Traveler',
            verificationUrl: data.verificationUrl || 'https://www.fly2any.com/verify',
            expiresIn: '24 hours',
          });
          break;

        default:
          console.warn(`[EmailTrigger] Unknown template: ${template}`);
          return undefined;
      }

      // Log email sent
      if (success) {
        await this.logEmailSent(payload, template, decision);
        return `email_${Date.now()}`;
      }

    } catch (error) {
      console.error(`[EmailTrigger] Error sending ${template}:`, error);
    }

    return undefined;
  }

  /**
   * Log AI decision
   */
  private async logDecision(payload: EventPayload, decision: AIDecisionResult): Promise<void> {
    console.log(`🤖 [AI] ${payload.event} → ${decision.decision}: ${decision.reason}`);

    if (prisma) {
      try {
        await prisma.emailDecisionLog.create({
          data: {
            email: payload.email,
            event: payload.event,
            decision: decision.decision,
            reason: decision.reason,
            confidence: decision.confidence,
            metadata: JSON.stringify(decision),
          },
        });
      } catch {
        // Table might not exist
      }
    }
  }

  /**
   * Log email sent
   */
  private async logEmailSent(
    payload: EventPayload,
    template: string,
    decision: AIDecisionResult
  ): Promise<void> {
    if (prisma) {
      try {
        await prisma.emailLog.create({
          data: {
            recipientEmail: payload.email,
            userId: payload.userId,
            emailType: EVENT_EMAIL_MAP[payload.event].intent,
            template,
            event: payload.event,
            sentAt: new Date(),
            aiDecision: decision.decision,
            metadata: JSON.stringify({ decision, payload: payload.data }),
          },
        });
      } catch {
        // Table might not exist
      }
    }
  }

  /**
   * Cancel scheduled email
   */
  cancelScheduled(email: string, event: EmailEvent): boolean {
    for (const [key, timeout] of this.scheduledEmails.entries()) {
      if (key.startsWith(`${email}:${event}:`)) {
        clearTimeout(timeout);
        this.scheduledEmails.delete(key);
        console.log(`📧 [EmailTrigger] Cancelled scheduled ${event} email for ${email}`);
        return true;
      }
    }
    return false;
  }
}

// Export singleton
export const emailTrigger = new EmailTriggerService();

// ===================================
// CONVENIENCE FUNCTIONS
// ===================================

export async function triggerEmailEvent(event: EmailEvent, email: string, data: Record<string, any>, userId?: string) {
  return emailTrigger.trigger({
    event,
    email,
    data,
    userId,
    timestamp: new Date(),
  });
}

// Specific trigger functions
export const triggerFlightSearch = (email: string, data: any, userId?: string) =>
  triggerEmailEvent('flight_search', email, data, userId);

export const triggerPriceDrop = (email: string, data: any, userId?: string) =>
  triggerEmailEvent('price_drop', email, data, userId);

export const triggerSearchAbandoned = (email: string, data: any, userId?: string) =>
  triggerEmailEvent('search_abandoned', email, data, userId);

export const triggerBookingStarted = (email: string, data: any, userId?: string) =>
  triggerEmailEvent('booking_started', email, data, userId);

export const triggerBookingConfirmed = (email: string, data: any, userId?: string) =>
  triggerEmailEvent('booking_confirmed', email, data, userId);

export const triggerUserSignup = (email: string, data: any, userId?: string) =>
  triggerEmailEvent('user_signup', email, data, userId);
