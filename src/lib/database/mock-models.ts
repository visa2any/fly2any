/**
 * Type-safe mock implementations for missing Prisma models
 * This file provides fallback functionality until proper database schema is implemented
 */

// Mock types for missing models
export interface SystemAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  service: string;
  threshold?: number;
  currentValue?: number;
  status: 'active' | 'resolved' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  isResolved: boolean;
  metadata?: any;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  template: string;
  subject: string;
  previewText?: string;
  tags?: string[];
  variables?: Record<string, any>;
}

export interface AudienceConfig {
  segments: string[];
  filters?: Record<string, any>;
  totalRecipients?: number;
}

export interface ScheduleConfig {
  type: 'immediate' | 'scheduled' | 'recurring';
  sendAt?: Date;
  timezone?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';
  templates: CampaignTemplate[];
  audience: AudienceConfig;
  schedule: ScheduleConfig;
  subject?: string;
  content?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  recipientCount?: number;
  openCount?: number;
  clickCount?: number;
}

export interface CampaignEmail {
  id: string;
  campaignId: string;
  emailLogId: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained';
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  metadata?: any;
}

export interface WebhookEvent {
  id: string;
  eventType: string;
  provider: string;
  payload: any;
  processedAt?: Date;
  status: 'pending' | 'processed' | 'failed';
  createdAt: Date;
  error?: string;
  retryCount: number;
}

export interface WebhookLog {
  id: string;
  eventType: string;
  provider: string;
  status: 'success' | 'error';
  payload: any;
  response?: any;
  error?: string;
  processingTimeMs?: number;
  createdAt: Date;
}

export interface EmailAnalyticsEvent {
  id: string;
  eventType: string;
  emailLogId: string;
  timestamp: Date;
  metadata?: any;
  userAgent?: string;
  ipAddress?: string;
  location?: any;
}

export interface DomainReputation {
  id: string;
  domain: string;
  reputation: number;
  status: 'good' | 'warning' | 'poor';
  lastChecked: Date;
  totalSent: number;
  totalDelivered: number;
  totalBounced: number;
  totalComplained: number;
  metrics?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  data: any;
  generatedAt: Date;
  scheduledFor?: Date;
  status: 'generated' | 'sent' | 'failed';
}

export type ReportType = 
  | 'performance_summary'
  | 'campaign_analysis'
  | 'deliverability_report'
  | 'engagement_trends'
  | 'provider_comparison';

export type ReportFrequency = 'daily' | 'weekly' | 'monthly';

export type ReportFormat = 'pdf' | 'csv' | 'html' | 'json';

export interface ReportConfig {
  id: string;
  name: string;
  type: ReportType;
  frequency: ReportFrequency;
  enabled: boolean;
  isActive: boolean;
  format: ReportFormat[];
  schedule: string;
  recipients: string[];
  lastRun?: Date;
  nextRunDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Lead {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
  tags?: string[];
  metadata?: any;
}

// Type-safe mock implementations
export class MockPrismaModels {
  // SystemAlert mock
  static systemAlert = {
    findMany: async (args?: any): Promise<SystemAlert[]> => {
      console.warn('[MOCK] SystemAlert.findMany called - using mock data');
      return [];
    },
    groupBy: async (args?: any): Promise<any[]> => {
      console.warn('[MOCK] SystemAlert.groupBy called - using mock data');
      return [];
    },
    updateMany: async (args?: any): Promise<{ count: number }> => {
      console.warn('[MOCK] SystemAlert.updateMany called - using mock implementation');
      return { count: 0 };
    },
    deleteMany: async (args?: any): Promise<{ count: number }> => {
      console.warn('[MOCK] SystemAlert.deleteMany called - using mock implementation');
      return { count: 0 };
    },
    findFirst: async (args?: any): Promise<SystemAlert | null> => {
      console.warn('[MOCK] SystemAlert.findFirst called - using mock data');
      return null;
    },
    update: async (args?: any): Promise<SystemAlert | null> => {
      console.warn('[MOCK] SystemAlert.update called - using mock implementation');
      return null;
    },
    create: async (args?: any): Promise<SystemAlert> => {
      console.warn('[MOCK] SystemAlert.create called - using mock implementation');
      return {
        id: 'mock-id',
        type: 'mock',
        severity: 'info',
        title: 'Mock Alert',
        message: 'This is a mock alert',
        service: 'mock-service',
        threshold: 100,
        currentValue: 150,
        status: 'active',
        isResolved: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  };

  // Campaign mock
  static campaign = {
    findMany: async (args?: any): Promise<Campaign[]> => {
      console.warn('[MOCK] Campaign.findMany called - using mock data');
      return [];
    },
    findUnique: async (args?: any): Promise<Campaign | null> => {
      console.warn('[MOCK] Campaign.findUnique called - using mock data');
      return null;
    },
    create: async (args?: any): Promise<Campaign> => {
      console.warn('[MOCK] Campaign.create called - using mock implementation');
      return {
        id: 'mock-campaign',
        name: 'Mock Campaign',
        status: 'draft',
        type: 'email',
        templates: [],
        audience: { segments: [], totalRecipients: 0 },
        schedule: { type: 'immediate' },
        createdBy: 'mock-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    update: async (args?: any): Promise<Campaign> => {
      console.warn('[MOCK] Campaign.update called - using mock implementation');
      return {
        id: 'mock-campaign',
        name: 'Mock Campaign',
        status: 'draft',
        type: 'email',
        templates: [],
        audience: { segments: [], totalRecipients: 0 },
        schedule: { type: 'immediate' },
        createdBy: 'mock-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  };

  // CampaignEmail mock
  static campaignEmail = {
    groupBy: async (args?: any): Promise<any[]> => {
      console.warn('[MOCK] CampaignEmail.groupBy called - using mock data');
      return [];
    },
    create: async (args?: any): Promise<CampaignEmail> => {
      console.warn('[MOCK] CampaignEmail.create called - using mock implementation');
      return {
        id: 'mock-campaign-email',
        campaignId: 'mock-campaign',
        emailLogId: 'mock-email-log',
        status: 'sent',
        sentAt: new Date()
      };
    },
    updateMany: async (args?: any): Promise<{ count: number }> => {
      console.warn('[MOCK] CampaignEmail.updateMany called - using mock implementation');
      return { count: 0 };
    }
  };

  // WebhookEvent mock
  static webhookEvent = {
    groupBy: async (args?: any): Promise<any[]> => {
      console.warn('[MOCK] WebhookEvent.groupBy called - using mock data');
      return [];
    },
    create: async (args?: any): Promise<WebhookEvent> => {
      console.warn('[MOCK] WebhookEvent.create called - using mock implementation');
      return {
        id: 'mock-webhook-event',
        eventType: 'mock',
        provider: 'mock',
        payload: {},
        status: 'pending',
        createdAt: new Date(),
        retryCount: 0
      };
    },
    update: async (args?: any): Promise<WebhookEvent> => {
      console.warn('[MOCK] WebhookEvent.update called - using mock implementation');
      return {
        id: 'mock-webhook-event',
        eventType: 'mock',
        provider: 'mock',
        payload: {},
        status: 'processed',
        createdAt: new Date(),
        retryCount: 0,
        processedAt: new Date()
      };
    },
    count: async (args?: any): Promise<number> => {
      console.warn('[MOCK] WebhookEvent.count called - using mock data');
      return 0;
    }
  };

  // WebhookLog mock
  static webhookLog = {
    create: async (args?: any): Promise<WebhookLog> => {
      console.warn('[MOCK] WebhookLog.create called - using mock implementation');
      return {
        id: 'mock-webhook-log',
        eventType: 'mock',
        provider: 'mock',
        status: 'success',
        payload: {},
        createdAt: new Date()
      };
    }
  };

  // EmailAnalyticsEvent mock
  static emailAnalyticsEvent = {
    groupBy: async (args?: any): Promise<any[]> => {
      console.warn('[MOCK] EmailAnalyticsEvent.groupBy called - using mock data');
      return [];
    },
    create: async (args?: any): Promise<EmailAnalyticsEvent> => {
      console.warn('[MOCK] EmailAnalyticsEvent.create called - using mock implementation');
      return {
        id: 'mock-analytics-event',
        eventType: 'mock',
        emailLogId: 'mock-email-log',
        timestamp: new Date()
      };
    }
  };

  // DomainReputation mock
  static domainReputation = {
    upsert: async (args?: any): Promise<DomainReputation> => {
      console.warn('[MOCK] DomainReputation.upsert called - using mock implementation');
      return {
        id: 'mock-domain-reputation',
        domain: 'example.com',
        reputation: 100,
        status: 'good',
        lastChecked: new Date(),
        totalSent: 1000,
        totalDelivered: 950,
        totalBounced: 30,
        totalComplained: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    update: async (args?: any): Promise<DomainReputation> => {
      console.warn('[MOCK] DomainReputation.update called - using mock implementation');
      return {
        id: 'mock-domain-reputation',
        domain: 'example.com',
        reputation: 100,
        status: 'good',
        lastChecked: new Date(),
        totalSent: 1000,
        totalDelivered: 950,
        totalBounced: 30,
        totalComplained: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    findUnique: async (args?: any): Promise<DomainReputation | null> => {
      console.warn('[MOCK] DomainReputation.findUnique called - using mock data');
      return null;
    },
    findMany: async (args?: any): Promise<DomainReputation[]> => {
      console.warn('[MOCK] DomainReputation.findMany called - using mock data');
      return [];
    }
  };

  // EmailReport mock
  static emailReport = {
    create: async (args?: any): Promise<EmailReport> => {
      console.warn('[MOCK] EmailReport.create called - using mock implementation');
      return {
        id: 'mock-email-report',
        title: 'Mock Report',
        type: 'daily',
        data: {},
        generatedAt: new Date(),
        status: 'generated'
      };
    }
  };

  // ReportConfig mock
  static reportConfig = {
    findUnique: async (args?: any): Promise<ReportConfig | null> => {
      console.warn('[MOCK] ReportConfig.findUnique called - using mock data');
      return null;
    },
    create: async (args?: any): Promise<ReportConfig> => {
      console.warn('[MOCK] ReportConfig.create called - using mock implementation');
      return {
        id: 'mock-report-config',
        name: 'Mock Report Config',
        type: 'performance_summary',
        frequency: 'daily',
        enabled: true,
        isActive: true,
        format: ['pdf', 'csv'],
        schedule: '0 9 * * *',
        recipients: [],
        nextRunDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'mock-user'
      };
    },
    findMany: async (args?: any): Promise<ReportConfig[]> => {
      console.warn('[MOCK] ReportConfig.findMany called - using mock data');
      return [];
    }
  };

  // Lead mock
  static lead = {
    updateMany: async (args?: any): Promise<{ count: number }> => {
      console.warn('[MOCK] Lead.updateMany called - using mock implementation');
      return { count: 0 };
    }
  };
}