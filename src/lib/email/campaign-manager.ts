/**
 * 🚀 ADVANCED EMAIL CAMPAIGN MANAGEMENT SYSTEM
 * Complete campaign management with automation, A/B testing, and analytics
 */

import { emailService, EmailData } from './email-service';
import { prisma } from '@/lib/database/prisma';

export interface CampaignTemplate {
  id: string;
  name: string;
  template: string;
  subject: string;
  previewText?: string;
  tags?: string[];
  variables?: Record<string, any>;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  templates: CampaignTemplate[];
  audience: AudienceConfig;
  schedule: ScheduleConfig;
  automation?: AutomationConfig;
  abTest?: ABTestConfig;
  metrics?: CampaignMetrics;
  createdAt: Date;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
}

export type CampaignType = 
  | 'welcome_series' 
  | 'promotional' 
  | 'newsletter' 
  | 'transactional' 
  | 're_engagement' 
  | 'price_alert' 
  | 'booking_follow_up'
  | 'drip_campaign'
  | 'seasonal';

export type CampaignStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'running' 
  | 'paused' 
  | 'completed' 
  | 'failed';

export interface AudienceConfig {
  segments?: string[];
  filters?: {
    country?: string[];
    interests?: string[];
    bookingHistory?: 'none' | 'first_time' | 'returning' | 'frequent';
    lastActivity?: { days: number; operator: 'within' | 'after' };
    priceRange?: { min: number; max: number };
  };
  excludeSegments?: string[];
  testPercentage?: number; // For A/B testing
}

export interface ScheduleConfig {
  type: 'immediate' | 'scheduled' | 'recurring' | 'trigger_based';
  sendAt?: Date;
  timezone?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0 = Sunday
    dayOfMonth?: number;
    time?: string; // HH:MM format
  };
  triggers?: {
    event: string;
    delay?: number; // in minutes
    conditions?: Record<string, any>;
  }[];
}

export interface AutomationConfig {
  isActive: boolean;
  workflow: AutomationStep[];
  triggers: {
    event: string;
    conditions?: Record<string, any>;
  }[];
}

export interface AutomationStep {
  id: string;
  type: 'email' | 'wait' | 'condition' | 'action';
  config: {
    templateId?: string;
    waitDuration?: number; // in hours
    condition?: string;
    action?: string;
  };
  nextSteps: string[];
}

export interface ABTestConfig {
  isEnabled: boolean;
  testName: string;
  variants: {
    id: string;
    name: string;
    templateId: string;
    trafficPercentage: number;
  }[];
  testMetric: 'open_rate' | 'click_rate' | 'conversion_rate';
  minimumSampleSize: number;
  confidenceLevel: number;
  duration: number; // in hours
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  conversions: number;
  revenue?: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  bounceRate: number;
}

export interface DripCampaignStep {
  id: string;
  order: number;
  templateId: string;
  delayDays: number;
  conditions?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt';
    value: any;
  }[];
}

export class CampaignManager {
  /**
   * Create a new campaign
   */
  async createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'metrics'>): Promise<Campaign> {
    try {
      const campaign = await prisma.campaign.create({
        data: {
          name: campaignData.name,
          type: campaignData.type,
          status: campaignData.status,
          templates: campaignData.templates,
          audience: campaignData.audience,
          schedule: campaignData.schedule,
          automation: campaignData.automation,
          abTest: campaignData.abTest,
          startDate: campaignData.startDate,
          endDate: campaignData.endDate,
          createdBy: campaignData.createdBy
        }
      });

      console.log(`📧 Campaign created: ${campaign.name} (${campaign.id})`);
      return campaign as Campaign;
    } catch (error) {
      console.error('❌ Failed to create campaign:', error);
      throw new Error('Failed to create campaign');
    }
  }

  /**
   * Launch a campaign
   */
  async launchCampaign(campaignId: string): Promise<{ success: boolean; message: string }> {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Validate campaign before launching
      const validation = await this.validateCampaign(campaign as Campaign);
      if (!validation.isValid) {
        return { success: false, message: validation.errors.join(', ') };
      }

      // Update campaign status
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { 
          status: 'running',
          startDate: new Date()
        }
      });

      // Process campaign based on type
      await this.processCampaign(campaign as Campaign);

      console.log(`🚀 Campaign launched: ${campaign.name}`);
      return { success: true, message: 'Campaign launched successfully' };
    } catch (error) {
      console.error('❌ Failed to launch campaign:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Launch failed' };
    }
  }

  /**
   * Process campaign execution
   */
  private async processCampaign(campaign: Campaign): Promise<void> {
    const audience = await this.getAudience(campaign.audience);
    
    if (campaign.abTest?.isEnabled) {
      await this.executeABTest(campaign, audience);
    } else {
      await this.executeCampaign(campaign, audience);
    }
  }

  /**
   * Execute A/B test campaign
   */
  private async executeABTest(campaign: Campaign, audience: any[]): Promise<void> {
    if (!campaign.abTest) return;

    const variants = campaign.abTest.variants;
    const totalAudience = audience.length;
    
    for (const variant of variants) {
      const variantSize = Math.floor(totalAudience * (variant.trafficPercentage / 100));
      const variantAudience = audience.splice(0, variantSize);
      
      console.log(`📊 Executing A/B test variant: ${variant.name} for ${variantAudience.length} recipients`);
      
      // Send emails to this variant's audience
      await this.sendToAudience(
        variantAudience, 
        campaign.templates.find(t => t.id === variant.templateId)!,
        campaign.id,
        { variant: variant.id }
      );
    }
  }

  /**
   * Execute regular campaign
   */
  private async executeCampaign(campaign: Campaign, audience: any[]): Promise<void> {
    const template = campaign.templates[0]; // Use first template for non-A/B campaigns
    
    console.log(`📧 Executing campaign: ${campaign.name} for ${audience.length} recipients`);
    
    await this.sendToAudience(audience, template, campaign.id);
  }

  /**
   * Send emails to audience
   */
  private async sendToAudience(
    audience: any[], 
    template: CampaignTemplate, 
    campaignId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const batchSize = 100; // Process in batches to avoid overwhelming the email service
    
    for (let i = 0; i < audience.length; i += batchSize) {
      const batch = audience.slice(i, i + batchSize);
      
      const sendPromises = batch.map(async (recipient) => {
        try {
          // Personalize template data
          const templateData = {
            ...template.variables,
            firstName: recipient.firstName,
            email: recipient.email,
            ...recipient.preferences
          };

          const result = await emailService.sendTemplatedEmail(
            template.template,
            recipient.email,
            templateData
          );

          // Log campaign email
          await this.logCampaignEmail(campaignId, recipient.email, template.id, result, metadata);
          
          return result;
        } catch (error) {
          console.error(`❌ Failed to send to ${recipient.email}:`, error);
          await this.logCampaignEmail(campaignId, recipient.email, template.id, { success: false, error: error instanceof Error ? error.message : 'Unknown error' }, metadata);
        }
      });

      await Promise.allSettled(sendPromises);
      
      // Brief delay between batches
      if (i + batchSize < audience.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Create drip campaign
   */
  async createDripCampaign(
    name: string,
    steps: DripCampaignStep[],
    audienceConfig: AudienceConfig,
    createdBy: string
  ): Promise<Campaign> {
    const automation: AutomationConfig = {
      isActive: true,
      workflow: steps.map(step => ({
        id: step.id,
        type: 'email',
        config: {
          templateId: step.templateId,
          waitDuration: step.delayDays * 24
        },
        nextSteps: []
      })),
      triggers: [{
        event: 'user_signup',
        conditions: {}
      }]
    };

    // Link workflow steps
    automation.workflow.forEach((step, index) => {
      if (index < automation.workflow.length - 1) {
        step.nextSteps = [automation.workflow[index + 1].id];
      }
    });

    return await this.createCampaign({
      name,
      type: 'drip_campaign',
      status: 'draft',
      templates: [], // Templates will be loaded from steps
      audience: audienceConfig,
      schedule: {
        type: 'trigger_based',
        triggers: automation.triggers
      },
      automation,
      createdBy
    });
  }

  /**
   * Create welcome series campaign
   */
  async createWelcomeSeries(createdBy: string): Promise<Campaign> {
    const steps: DripCampaignStep[] = [
      {
        id: 'welcome-1',
        order: 1,
        templateId: 'welcome-lead',
        delayDays: 0, // Immediate
        conditions: []
      },
      {
        id: 'welcome-2',
        order: 2,
        templateId: 'getting-started',
        delayDays: 2,
        conditions: []
      },
      {
        id: 'welcome-3',
        order: 3,
        templateId: 'first-deal-recommendations',
        delayDays: 7,
        conditions: [{
          field: 'hasBooked',
          operator: 'equals',
          value: false
        }]
      }
    ];

    return await this.createDripCampaign(
      'Welcome Series - New Users',
      steps,
      {
        filters: {
          bookingHistory: 'none',
          lastActivity: { days: 1, operator: 'within' }
        }
      },
      createdBy
    );
  }

  /**
   * Get audience based on configuration
   */
  private async getAudience(audienceConfig: AudienceConfig): Promise<any[]> {
    try {
      const whereClause: any = {};

      // Apply filters
      if (audienceConfig.filters) {
        const filters = audienceConfig.filters;
        
        if (filters.country) {
          whereClause.country = { in: filters.country };
        }
        
        if (filters.interests) {
          whereClause.interests = { hasSome: filters.interests };
        }
        
        if (filters.bookingHistory && filters.bookingHistory !== 'none') {
          // Add booking history logic
          switch (filters.bookingHistory) {
            case 'first_time':
              whereClause.bookings = { none: {} };
              break;
            case 'returning':
              whereClause.bookings = { some: {} };
              break;
            case 'frequent':
              whereClause.bookings = { some: {} }; // Could add count logic
              break;
          }
        }
        
        if (filters.lastActivity) {
          const date = new Date();
          date.setDate(date.getDate() - filters.lastActivity.days);
          
          if (filters.lastActivity.operator === 'within') {
            whereClause.lastActivityAt = { gte: date };
          } else {
            whereClause.lastActivityAt = { lte: date };
          }
        }
      }

      // Get audience from database
      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          // country, interests, preferences fields not in current User schema
        }
      });

      console.log(`👥 Audience selected: ${users.length} recipients`);
      return users;
    } catch (error) {
      console.error('❌ Failed to get audience:', error);
      return [];
    }
  }

  /**
   * Validate campaign before launch
   */
  private async validateCampaign(campaign: Campaign): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check templates
    if (!campaign.templates || campaign.templates.length === 0) {
      errors.push('At least one template is required');
    }

    // Check A/B test configuration
    if (campaign.abTest?.isEnabled) {
      if (!campaign.abTest.variants || campaign.abTest.variants.length < 2) {
        errors.push('A/B test requires at least 2 variants');
      }
      
      const totalPercentage = campaign.abTest.variants.reduce((sum, v) => sum + v.trafficPercentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.1) {
        errors.push('A/B test variant percentages must sum to 100%');
      }
    }

    // Check schedule
    if (campaign.schedule.type === 'scheduled' && !campaign.schedule.sendAt) {
      errors.push('Scheduled campaigns require a send date');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Log campaign email activity
   */
  private async logCampaignEmail(
    campaignId: string,
    email: string,
    templateId: string,
    result: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.campaignEmail.create({
        data: {
          campaignId,
          email,
          templateId,
          status: result.success ? 'sent' : 'failed',
          provider: result.provider,
          providerMessageId: result.messageId,
          error: result.error,
          metadata: metadata || {},
          sentAt: result.success ? new Date() : undefined
        }
      });
    } catch (error) {
      console.error('❌ Failed to log campaign email:', error);
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string): Promise<CampaignMetrics> {
    try {
      const emailStats = await prisma.campaignEmail.groupBy({
        by: ['status'],
        where: { campaignId },
        _count: true
      });

      const stats = emailStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>);

      const sent = stats.sent || 0;
      const delivered = sent - (stats.bounced || 0);
      const opened = stats.opened || 0;
      const clicked = stats.clicked || 0;
      const unsubscribed = stats.unsubscribed || 0;
      const bounced = stats.bounced || 0;
      const conversions = stats.converted || 0;

      return {
        sent,
        delivered,
        opened,
        clicked,
        unsubscribed,
        bounced,
        conversions,
        openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
        clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
        conversionRate: clicked > 0 ? (conversions / clicked) * 100 : 0,
        unsubscribeRate: sent > 0 ? (unsubscribed / sent) * 100 : 0,
        bounceRate: sent > 0 ? (bounced / sent) * 100 : 0
      };
    } catch (error) {
      console.error('❌ Failed to get campaign analytics:', error);
      throw new Error('Failed to get campaign analytics');
    }
  }

  /**
   * Pause campaign
   */
  async pauseCampaign(campaignId: string): Promise<void> {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'paused' }
    });
    console.log(`⏸️ Campaign paused: ${campaignId}`);
  }

  /**
   * Resume campaign
   */
  async resumeCampaign(campaignId: string): Promise<void> {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'running' }
    });
    console.log(`▶️ Campaign resumed: ${campaignId}`);
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(filters?: {
    status?: CampaignStatus;
    type?: CampaignType;
    createdBy?: string;
  }): Promise<Campaign[]> {
    const whereClause: any = {};
    
    if (filters?.status) whereClause.status = filters.status;
    if (filters?.type) whereClause.type = filters.type;
    if (filters?.createdBy) whereClause.createdBy = filters.createdBy;

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return campaigns as Campaign[];
  }

  /**
   * Schedule recurring campaigns
   */
  async scheduleRecurringCampaigns(): Promise<void> {
    const recurringCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'running',
        schedule: {
          path: ['type'],
          equals: 'recurring'
        }
      }
    });

    for (const campaign of recurringCampaigns) {
      await this.checkRecurringSchedule(campaign as Campaign);
    }
  }

  /**
   * Check if recurring campaign should run
   */
  private async checkRecurringSchedule(campaign: Campaign): Promise<void> {
    if (!campaign.schedule.recurring) return;

    const now = new Date();
    const recurring = campaign.schedule.recurring;

    let shouldRun = false;

    switch (recurring.frequency) {
      case 'daily':
        shouldRun = true; // Run daily campaigns every day
        break;
      case 'weekly':
        shouldRun = recurring.dayOfWeek === now.getDay();
        break;
      case 'monthly':
        shouldRun = recurring.dayOfMonth === now.getDate();
        break;
    }

    if (shouldRun) {
      console.log(`🔄 Running recurring campaign: ${campaign.name}`);
      await this.processCampaign(campaign);
    }
  }
}

// Export singleton instance
export const campaignManager = new CampaignManager();