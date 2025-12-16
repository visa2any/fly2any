/**
 * Autonomous Campaign Flows
 *
 * Self-running email sequences that:
 * - Self-adjust based on user behavior
 * - Stop when conversion happens
 * - Avoid email fatigue
 *
 * @version 1.0.0
 */

import { emailTrigger, EmailEvent } from './event-triggers';
import prisma from '@/lib/prisma';

// ===================================
// TYPES
// ===================================

export interface CampaignStep {
  id: string;
  delayHours: number;
  emailEvent: EmailEvent;
  condition?: (userId: string) => Promise<boolean>;
  stopOnConversion?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  triggerEvent: EmailEvent;
  steps: CampaignStep[];
  maxEmails: number;
  cooldownDays: number;
}

export interface UserCampaignState {
  campaignId: string;
  userId: string;
  email: string;
  currentStep: number;
  startedAt: Date;
  lastEmailAt?: Date;
  converted: boolean;
  completed: boolean;
}

// ===================================
// CAMPAIGN DEFINITIONS
// ===================================

export const CAMPAIGNS: Record<string, Campaign> = {
  // Abandoned Search Recovery Flow
  abandoned_search_recovery: {
    id: 'abandoned_search_recovery',
    name: 'Abandoned Search Recovery',
    triggerEvent: 'flight_search',
    maxEmails: 3,
    cooldownDays: 7,
    steps: [
      {
        id: 'reminder_1',
        delayHours: 1,
        emailEvent: 'search_abandoned',
        stopOnConversion: true,
      },
      {
        id: 'price_watch',
        delayHours: 24,
        emailEvent: 'price_drop',
        condition: async (userId) => {
          // Only send if user hasn't booked
          if (!prisma) return true;
          const booking = await prisma.booking.findFirst({
            where: { userId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
          });
          return !booking;
        },
        stopOnConversion: true,
      },
      {
        id: 'urgency',
        delayHours: 72,
        emailEvent: 'coupon_eligible',
        condition: async (userId) => {
          if (!prisma) return true;
          const booking = await prisma.booking.findFirst({
            where: { userId, createdAt: { gte: new Date(Date.now() - 72 * 60 * 60 * 1000) } },
          });
          return !booking;
        },
        stopOnConversion: true,
      },
    ],
  },

  // New User Onboarding
  new_user_onboarding: {
    id: 'new_user_onboarding',
    name: 'New User Onboarding',
    triggerEvent: 'user_signup',
    maxEmails: 4,
    cooldownDays: 30,
    steps: [
      {
        id: 'welcome',
        delayHours: 0,
        emailEvent: 'user_signup',
      },
      {
        id: 'first_search_prompt',
        delayHours: 24,
        emailEvent: 'search_abandoned', // Repurpose as "try searching" email
        condition: async (userId) => {
          // Only if user hasn't searched yet
          if (!prisma) return true;
          const search = await prisma.searchLog?.findFirst({
            where: { userId },
          });
          return !search;
        },
      },
      {
        id: 'feature_highlight',
        delayHours: 72,
        emailEvent: 'coupon_eligible', // First-time discount
        stopOnConversion: true,
      },
    ],
  },

  // Booking Recovery Flow
  booking_recovery: {
    id: 'booking_recovery',
    name: 'Booking Recovery',
    triggerEvent: 'booking_started',
    maxEmails: 3,
    cooldownDays: 3,
    steps: [
      {
        id: 'reminder_quick',
        delayHours: 0.5, // 30 minutes
        emailEvent: 'booking_started',
        stopOnConversion: true,
      },
      {
        id: 'reminder_urgency',
        delayHours: 4,
        emailEvent: 'booking_started',
        condition: async (userId) => {
          if (!prisma) return true;
          const booking = await prisma.booking.findFirst({
            where: { userId, status: 'confirmed', createdAt: { gte: new Date(Date.now() - 4 * 60 * 60 * 1000) } },
          });
          return !booking;
        },
        stopOnConversion: true,
      },
      {
        id: 'final_offer',
        delayHours: 24,
        emailEvent: 'coupon_eligible',
        stopOnConversion: true,
      },
    ],
  },

  // Dormant User Reactivation
  dormant_reactivation: {
    id: 'dormant_reactivation',
    name: 'Dormant User Reactivation',
    triggerEvent: 'user_inactive',
    maxEmails: 2,
    cooldownDays: 30,
    steps: [
      {
        id: 'miss_you',
        delayHours: 0,
        emailEvent: 'user_inactive',
      },
      {
        id: 'special_offer',
        delayHours: 168, // 7 days
        emailEvent: 'coupon_eligible',
        condition: async (userId) => {
          if (!prisma) return true;
          const activity = await prisma.user.findFirst({
            where: { id: userId, updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          });
          return !activity;
        },
        stopOnConversion: true,
      },
    ],
  },

  // Post-Trip Engagement
  post_trip: {
    id: 'post_trip',
    name: 'Post-Trip Engagement',
    triggerEvent: 'trip_completed',
    maxEmails: 2,
    cooldownDays: 90,
    steps: [
      {
        id: 'review_request',
        delayHours: 24,
        emailEvent: 'trip_completed',
      },
      {
        id: 'next_trip_inspiration',
        delayHours: 168, // 7 days
        emailEvent: 'flight_search',
      },
    ],
  },
};

// ===================================
// CAMPAIGN ENGINE
// ===================================

class CampaignEngine {
  private activeFlows: Map<string, UserCampaignState> = new Map();

  /**
   * Start a campaign flow for a user
   */
  async startCampaign(
    campaignId: string,
    userId: string,
    email: string,
    initialData: Record<string, any>
  ): Promise<boolean> {
    const campaign = CAMPAIGNS[campaignId];
    if (!campaign) {
      console.warn(`[Campaign] Unknown campaign: ${campaignId}`);
      return false;
    }

    const flowKey = `${campaignId}:${userId}`;

    // Check if already in this campaign
    if (this.activeFlows.has(flowKey)) {
      console.log(`[Campaign] User ${userId} already in ${campaignId}`);
      return false;
    }

    // Check cooldown
    const canStart = await this.checkCooldown(campaignId, userId, campaign.cooldownDays);
    if (!canStart) {
      console.log(`[Campaign] User ${userId} in cooldown for ${campaignId}`);
      return false;
    }

    // Initialize state
    const state: UserCampaignState = {
      campaignId,
      userId,
      email,
      currentStep: 0,
      startedAt: new Date(),
      converted: false,
      completed: false,
    };

    this.activeFlows.set(flowKey, state);

    // Log campaign start
    await this.logCampaignEvent(state, 'started');

    // Execute first step
    await this.executeStep(campaign, state, initialData);

    return true;
  }

  /**
   * Execute current campaign step
   */
  private async executeStep(
    campaign: Campaign,
    state: UserCampaignState,
    data: Record<string, any>
  ): Promise<void> {
    if (state.currentStep >= campaign.steps.length) {
      await this.completeCampaign(state, 'completed');
      return;
    }

    if (state.converted) {
      await this.completeCampaign(state, 'converted');
      return;
    }

    const step = campaign.steps[state.currentStep];

    // Check step condition
    if (step.condition) {
      const shouldProceed = await step.condition(state.userId);
      if (!shouldProceed) {
        console.log(`[Campaign] Condition not met for step ${step.id}, skipping`);
        state.currentStep++;
        await this.executeStep(campaign, state, data);
        return;
      }
    }

    // Schedule email with delay
    const delayMs = step.delayHours * 60 * 60 * 1000;

    if (delayMs > 0) {
      setTimeout(async () => {
        await this.sendStepEmail(campaign, state, step, data);
      }, delayMs);

      console.log(`[Campaign] Scheduled step ${step.id} for ${state.email} in ${step.delayHours}h`);
    } else {
      await this.sendStepEmail(campaign, state, step, data);
    }
  }

  /**
   * Send email for campaign step
   */
  private async sendStepEmail(
    campaign: Campaign,
    state: UserCampaignState,
    step: CampaignStep,
    data: Record<string, any>
  ): Promise<void> {
    // Check if converted before sending
    if (step.stopOnConversion) {
      const converted = await this.checkConversion(state.userId);
      if (converted) {
        state.converted = true;
        await this.completeCampaign(state, 'converted');
        return;
      }
    }

    // Trigger the email
    const result = await emailTrigger.trigger({
      event: step.emailEvent,
      email: state.email,
      userId: state.userId,
      data: {
        ...data,
        campaignId: campaign.id,
        stepId: step.id,
      },
    });

    if (result.triggered) {
      state.lastEmailAt = new Date();
      await this.logCampaignEvent(state, 'email_sent', { stepId: step.id });
    }

    // Move to next step
    state.currentStep++;

    // Schedule next step
    if (state.currentStep < campaign.steps.length && !state.converted) {
      const nextStep = campaign.steps[state.currentStep];
      const delayMs = nextStep.delayHours * 60 * 60 * 1000;

      setTimeout(async () => {
        await this.executeStep(campaign, state, data);
      }, Math.max(delayMs, 1000));
    } else {
      await this.completeCampaign(state, 'completed');
    }
  }

  /**
   * Mark user as converted (stops campaign)
   */
  async markConverted(userId: string, campaignId?: string): Promise<void> {
    for (const [key, state] of this.activeFlows.entries()) {
      if (state.userId === userId && (!campaignId || state.campaignId === campaignId)) {
        state.converted = true;
        await this.completeCampaign(state, 'converted');
      }
    }
  }

  /**
   * Complete campaign
   */
  private async completeCampaign(state: UserCampaignState, reason: string): Promise<void> {
    state.completed = true;
    const flowKey = `${state.campaignId}:${state.userId}`;
    this.activeFlows.delete(flowKey);

    await this.logCampaignEvent(state, 'completed', { reason });
    console.log(`[Campaign] ${state.campaignId} completed for ${state.email}: ${reason}`);
  }

  /**
   * Check conversion (user made a booking)
   */
  private async checkConversion(userId: string): Promise<boolean> {
    if (!prisma) return false;

    try {
      const booking = await prisma.booking.findFirst({
        where: {
          userId,
          status: { in: ['confirmed', 'ticketed'] },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      });
      return !!booking;
    } catch {
      return false;
    }
  }

  /**
   * Check campaign cooldown
   */
  private async checkCooldown(campaignId: string, userId: string, cooldownDays: number): Promise<boolean> {
    if (!prisma) return true;

    try {
      const recentCampaign = await prisma.campaignLog?.findFirst({
        where: {
          campaignId,
          userId,
          createdAt: { gte: new Date(Date.now() - cooldownDays * 24 * 60 * 60 * 1000) },
        },
      });
      return !recentCampaign;
    } catch {
      return true;
    }
  }

  /**
   * Log campaign event
   */
  private async logCampaignEvent(
    state: UserCampaignState,
    event: string,
    data?: Record<string, any>
  ): Promise<void> {
    if (!prisma) return;

    try {
      await prisma.campaignLog?.create({
        data: {
          campaignId: state.campaignId,
          userId: state.userId,
          email: state.email,
          event,
          step: state.currentStep,
          metadata: JSON.stringify(data || {}),
        },
      });
    } catch {
      // Table might not exist
    }
  }

  /**
   * Get active campaigns for user
   */
  getActiveCampaigns(userId: string): UserCampaignState[] {
    const active: UserCampaignState[] = [];
    for (const state of this.activeFlows.values()) {
      if (state.userId === userId && !state.completed) {
        active.push(state);
      }
    }
    return active;
  }
}

// Export singleton
export const campaignEngine = new CampaignEngine();

// ===================================
// AUTO-START CAMPAIGNS
// ===================================

export async function autoStartCampaign(event: EmailEvent, userId: string, email: string, data: Record<string, any>) {
  // Find campaigns triggered by this event
  for (const campaign of Object.values(CAMPAIGNS)) {
    if (campaign.triggerEvent === event) {
      await campaignEngine.startCampaign(campaign.id, userId, email, data);
    }
  }
}
