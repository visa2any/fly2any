// Email Marketing System - Type Definitions
// Enterprise-grade type system for email marketing platform

export interface ContactProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  position?: string;
  avatarUrl?: string;
  
  // Engagement Metrics
  engagementScore: number; // 0-100
  lastActivity: Date;
  totalEmailsSent: number;
  totalOpened: number;
  totalClicked: number;
  avgOpenRate: number;
  avgClickRate: number;
  
  // Segmentation
  segments: string[];
  tags: ContactTag[];
  customFields: Record<string, any>;
  lists: string[];
  
  // Location Data
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  
  // Behavioral Data
  preferredOpenTime?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  emailClient?: string;
  
  // Status
  status: 'active' | 'inactive' | 'bounced' | 'unsubscribed' | 'pending';
  emailStatus: 'verified' | 'unverified' | 'invalid';
  subscriptionDate: Date;
  unsubscribeDate?: Date;
  unsubscribeReason?: string;
  
  // Activity Timeline
  timeline: ActivityEvent[];
  notes: ContactNote[];
  
  // Metadata
  source: 'import' | 'signup' | 'api' | 'manual' | 'integration';
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface ContactTag {
  id: string;
  name: string;
  color: string;
  category?: string;
  createdAt: Date;
}

export interface ActivityEvent {
  id: string;
  contactId: string;
  type: 'email_sent' | 'email_opened' | 'link_clicked' | 'unsubscribed' | 
        'resubscribed' | 'bounced' | 'marked_spam' | 'replied' | 'forwarded' |
        'profile_updated' | 'tag_added' | 'tag_removed' | 'list_added' | 'list_removed';
  timestamp: Date;
  details: {
    campaignId?: string;
    campaignName?: string;
    emailSubject?: string;
    linkUrl?: string;
    tagName?: string;
    listName?: string;
    fieldChanged?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

export interface ContactNote {
  id: string;
  contactId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  isPinned: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  previewText?: string;
  type: 'regular' | 'automated' | 'ab_test' | 'rss' | 'transactional';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  
  // Content
  template: EmailTemplate;
  htmlContent: string;
  textContent?: string;
  
  // Recipients
  recipientLists: string[];
  recipientSegments: Segment[];
  excludeLists?: string[];
  totalRecipients: number;
  
  // Scheduling
  sendTime?: Date;
  timezone?: string;
  sendOptimization?: boolean;
  batchSize?: number;
  throttleRate?: number; // emails per hour
  
  // Tracking
  trackOpens: boolean;
  trackClicks: boolean;
  googleAnalytics?: boolean;
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  
  // A/B Testing
  abTest?: {
    enabled: boolean;
    variants: CampaignVariant[];
    winnerCriteria: 'open_rate' | 'click_rate' | 'conversion';
    testPercentage: number;
    testDuration: number; // hours
    winnerId?: string;
  };
  
  // Performance
  stats: CampaignStats;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  completedAt?: Date;
}

export interface CampaignVariant {
  id: string;
  name: string;
  subject?: string;
  previewText?: string;
  fromName?: string;
  htmlContent?: string;
  sendTime?: Date;
  stats?: CampaignStats;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  uniqueOpens: number;
  clicked: number;
  uniqueClicks: number;
  bounced: number;
  unsubscribed: number;
  markedAsSpam: number;
  forwarded: number;
  replied: number;
  
  // Rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  spamRate: number;
  
  // Revenue (if tracked)
  revenue?: number;
  orders?: number;
  avgOrderValue?: number;
  roi?: number;
  
  // Engagement over time
  opensByHour?: Record<number, number>;
  clicksByHour?: Record<number, number>;
  deviceBreakdown?: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  
  // Top performing
  topLinks?: Array<{
    url: string;
    clicks: number;
    uniqueClicks: number;
  }>;
  
  // Geographic data
  opensByCountry?: Record<string, number>;
  clicksByCountry?: Record<string, number>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'promotional' | 'newsletter' | 'transactional' | 'welcome' | 
           'abandoned' | 'reengagement' | 'event' | 'survey' | 'custom';
  thumbnail?: string;
  htmlContent: string;
  textContent?: string;
  variables: TemplateVariable[];
  isResponsive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  avgPerformance?: {
    openRate: number;
    clickRate: number;
  };
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'image' | 'button' | 'html' | 'repeater';
  defaultValue?: any;
  required: boolean;
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  type: 'static' | 'dynamic';
  conditions: SegmentCondition[];
  matchType: 'all' | 'any';
  contactCount: number;
  
  // UI
  icon?: string;
  color?: string;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastCalculated: Date;
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 
           'starts_with' | 'ends_with' | 'greater_than' | 'less_than' |
           'is_empty' | 'is_not_empty' | 'in_list' | 'not_in_list' |
           'in_last_days' | 'not_in_last_days';
  value: any;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'array';
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft' | 'archived';
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  
  // Settings
  allowReentry: boolean;
  maxReentries?: number;
  cooldownPeriod?: number; // hours
  
  // Performance
  stats: {
    totalEnrolled: number;
    currentlyActive: number;
    completed: number;
    avgCompletionTime: number; // hours
    conversionRate: number;
  };
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
}

export interface WorkflowTrigger {
  type: 'subscription' | 'tag_added' | 'date_based' | 'activity' | 
        'ecommerce' | 'custom_event' | 'webhook';
  conditions: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: 'email' | 'delay' | 'condition' | 'action' | 'goal';
  name: string;
  
  // Step specific config
  config: {
    // For email step
    campaignId?: string;
    
    // For delay step
    delayAmount?: number;
    delayUnit?: 'minutes' | 'hours' | 'days' | 'weeks';
    
    // For condition step
    conditions?: SegmentCondition[];
    truePath?: string; // next step id
    falsePath?: string; // next step id
    
    // For action step
    actionType?: 'add_tag' | 'remove_tag' | 'update_field' | 'webhook';
    actionConfig?: Record<string, any>;
    
    // For goal step
    goalType?: 'email_opened' | 'link_clicked' | 'conversion';
    goalConfig?: Record<string, any>;
  };
  
  // Next step
  nextStepId?: string;
  
  // Stats
  stats?: {
    processed: number;
    completed: number;
    failed: number;
  };
}

export interface BulkOperation {
  id: string;
  type: 'import' | 'export' | 'update' | 'delete' | 'tag' | 'segment';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  errors?: string[];
  startedAt: Date;
  completedAt?: Date;
  createdBy: string;
  config: Record<string, any>;
  resultFileUrl?: string;
}

export interface EmailAnalytics {
  // Overview
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  
  // Trends (last 30 days)
  trends: {
    sent: TrendData[];
    opened: TrendData[];
    clicked: TrendData[];
    bounced: TrendData[];
  };
  
  // Best performing
  topCampaigns: Array<{
    id: string;
    name: string;
    openRate: number;
    clickRate: number;
    revenue?: number;
  }>;
  
  // Engagement patterns
  bestSendTimes: Array<{
    dayOfWeek: string;
    hour: number;
    openRate: number;
  }>;
  
  // List health
  listHealth: {
    totalContacts: number;
    activeContacts: number;
    inactiveContacts: number;
    bouncedContacts: number;
    unsubscribedContacts: number;
    engagementScore: number;
  };
  
  // Revenue tracking
  revenue?: {
    total: number;
    byChannel: Record<string, number>;
    byCampaign: Array<{
      campaignId: string;
      revenue: number;
      orders: number;
    }>;
  };
}

export interface TrendData {
  date: string;
  value: number;
  change?: number; // percentage change from previous period
}

export interface DeliverabilityReport {
  // Reputation scores
  senderScore: number; // 0-100
  domainReputation: number; // 0-100
  ipReputation: number; // 0-100
  
  // Authentication
  spfStatus: 'pass' | 'fail' | 'neutral';
  dkimStatus: 'pass' | 'fail' | 'neutral';
  dmarcStatus: 'pass' | 'fail' | 'none';
  
  // Blacklist monitoring
  blacklists: Array<{
    name: string;
    listed: boolean;
    listedDate?: Date;
  }>;
  
  // Inbox placement
  inboxPlacement: {
    inbox: number; // percentage
    spam: number;
    missing: number;
  };
  
  // Bounce analysis
  bounceBreakdown: {
    hard: number;
    soft: number;
    blocked: number;
  };
  
  // Recommendations
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    issue: string;
    solution: string;
  }>;
  
  lastChecked: Date;
}

export interface UserPreferences {
  // Display
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  
  // Email settings
  defaultFromName: string;
  defaultFromEmail: string;
  defaultReplyTo: string;
  signatureHtml?: string;
  
  // Campaign defaults
  defaultTrackOpens: boolean;
  defaultTrackClicks: boolean;
  defaultGoogleAnalytics: boolean;
  
  // Notifications
  emailNotifications: {
    campaignSent: boolean;
    campaignCompleted: boolean;
    bounceAlert: boolean;
    unsubscribeAlert: boolean;
    weeklyReport: boolean;
  };
  
  // UI preferences
  defaultView: 'grid' | 'list' | 'kanban';
  itemsPerPage: number;
  showAdvancedFeatures: boolean;
  keyboardShortcuts: boolean;
}