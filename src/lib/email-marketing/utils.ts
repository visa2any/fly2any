// Email Marketing Utilities
export interface Contact {
  id?: string;
  nome: string;
  email: string;
  segmento?: string;
  emailStatus?: string;
  tags?: string[];
  subscribedAt?: Date;
  lastEmailSent?: Date;
  totalEmailsSent?: number;
  totalOpens?: number;
  totalClicks?: number;
  engagementScore?: number;
  city?: string;
  phone?: string;
  preferences?: {
    marketing: boolean;
    newsletter: boolean;
    promotions: boolean;
  };
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  subject?: string;
  content?: string;
  sent: number;
  opens: number;
  clicks: number;
  bounces?: number;
  unsubscribes?: number;
  date: string;
  status: string;
  segmentId?: string;
  templateId?: string;
  abTestId?: string;
  deliveryRate?: number;
  openRate?: number;
  clickRate?: number;
  conversionRate?: number;
  revenue?: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  html: string;
  subject: string;
  variables?: string[];
  industry?: string;
  rating?: number;
  downloads?: number;
  createdAt?: Date;
}

export interface Segment {
  id: string;
  name: string;
  conditions: SegmentCondition[];
  contactCount: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  isActive: boolean;
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | string[];
  type: 'text' | 'number' | 'date' | 'boolean' | 'array';
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
  createdAt: Date;
  updatedAt: Date;
  totalRuns?: number;
  successRate?: number;
}

export interface WorkflowTrigger {
  type: 'contact_added' | 'email_opened' | 'email_clicked' | 'date_based' | 'tag_added' | 'segment_joined';
  config: Record<string, any>;
}

export interface WorkflowAction {
  id: string;
  type: 'send_email' | 'add_tag' | 'remove_tag' | 'move_to_segment' | 'wait' | 'webhook';
  config: Record<string, any>;
  delay?: number; // in minutes
}

export interface WorkflowCondition {
  field: string;
  operator: string;
  value: any;
}

export interface ABTest {
  id: string;
  name: string;
  campaignId: string;
  variants: ABTestVariant[];
  status: 'draft' | 'running' | 'completed' | 'paused';
  trafficSplit: number[];
  winnerCriteria: 'open_rate' | 'click_rate' | 'conversion_rate' | 'revenue';
  confidenceLevel: number;
  startDate?: Date;
  endDate?: Date;
  winner?: string;
  results?: ABTestResults;
}

export interface ABTestVariant {
  id: string;
  name: string;
  subject?: string;
  content?: string;
  templateId?: string;
  sent: number;
  opens: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface ABTestResults {
  winner: string;
  confidence: number;
  improvement: number;
  significance: boolean;
}

export interface EmailActivity {
  id: string;
  contactId: string;
  campaignId?: string;
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'complained';
  timestamp: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
  };
}

// Utility Functions

export const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return num.toLocaleString('pt-BR');
};

export const calculateRate = (part: number, total: number): string => {
  if (total === 0 || !part) return '0%';
  return ((part / total) * 100).toFixed(1) + '%';
};

export const calculateEngagementScore = (contact: Contact): number => {
  const opens = contact.totalOpens || 0;
  const clicks = contact.totalClicks || 0;
  const sent = contact.totalEmailsSent || 1;
  
  const openRate = opens / sent;
  const clickRate = clicks / sent;
  
  // Weighted engagement score (0-100)
  return Math.min(100, Math.round((openRate * 60) + (clickRate * 40)));
};

export const getEngagementLevel = (score: number): { level: string; color: string; description: string } => {
  if (score >= 80) return { level: 'Muito Alto', color: 'text-green-600', description: 'Altamente engajado' };
  if (score >= 60) return { level: 'Alto', color: 'text-blue-600', description: 'Bem engajado' };
  if (score >= 40) return { level: 'Médio', color: 'text-yellow-600', description: 'Moderadamente engajado' };
  if (score >= 20) return { level: 'Baixo', color: 'text-orange-600', description: 'Pouco engajado' };
  return { level: 'Muito Baixo', color: 'text-red-600', description: 'Desengajado' };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const cleanEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const getDomainFromEmail = (email: string): string => {
  return email.split('@')[1] || '';
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateShort = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const generateCampaignName = (type: string): string => {
  const now = new Date();
  const typeNames = {
    promotional: 'Promocional',
    newsletter: 'Newsletter',
    reactivation: 'Reativação',
    welcome: 'Boas-vindas',
    announcement: 'Anúncio'
  };
  
  const typeName = typeNames[type as keyof typeof typeNames] || type;
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  return `${typeName} - ${dateStr} ${timeStr}`;
};

export const getStatusColor = (status: string): string => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    sending: 'bg-yellow-100 text-yellow-700',
    sent: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    paused: 'bg-orange-100 text-orange-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700'
  };
  
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700';
};

export const getBounceReasonIcon = (reason: string): string => {
  const reasonIcons = {
    'hard_bounce': '❌',
    'soft_bounce': '⚠️',
    'complaint': '🚫',
    'unsubscribed': '✋',
    'suppressed': '🔇',
    'invalid': '❓'
  };
  
  return reasonIcons[reason as keyof typeof reasonIcons] || '❓';
};

export const calculateDeliverabilityScore = (campaign: Campaign): number => {
  const deliveredRate = ((campaign.sent - (campaign.bounces || 0)) / campaign.sent) * 100;
  const openRate = (campaign.opens / campaign.sent) * 100;
  const clickRate = (campaign.clicks / campaign.sent) * 100;
  const unsubscribeRate = ((campaign.unsubscribes || 0) / campaign.sent) * 100;
  
  // Weighted deliverability score
  let score = 0;
  score += deliveredRate * 0.4; // 40% weight for delivery
  score += openRate * 0.3; // 30% weight for opens
  score += clickRate * 0.2; // 20% weight for clicks
  score -= unsubscribeRate * 0.1; // 10% penalty for unsubscribes
  
  return Math.max(0, Math.min(100, score));
};

export const segmentContacts = (contacts: Contact[], conditions: SegmentCondition[]): Contact[] => {
  return contacts.filter(contact => {
    return conditions.every(condition => {
      const fieldValue = getFieldValue(contact, condition.field);
      return evaluateCondition(fieldValue, condition);
    });
  });
};

const getFieldValue = (contact: Contact, field: string): any => {
  const fieldMap: Record<string, any> = {
    email: contact.email,
    nome: contact.nome,
    segmento: contact.segmento,
    city: contact.city,
    phone: contact.phone,
    tags: contact.tags || [],
    engagementScore: contact.engagementScore || 0,
    totalEmailsSent: contact.totalEmailsSent || 0,
    totalOpens: contact.totalOpens || 0,
    totalClicks: contact.totalClicks || 0,
    lastEmailSent: contact.lastEmailSent,
    subscribedAt: contact.subscribedAt
  };
  
  return fieldMap[field];
};

const evaluateCondition = (value: any, condition: SegmentCondition): boolean => {
  const { operator, value: conditionValue } = condition;
  
  switch (operator) {
    case 'equals':
      return value === conditionValue;
    case 'not_equals':
      return value !== conditionValue;
    case 'contains':
      return String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
    case 'not_contains':
      return !String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
    case 'starts_with':
      return String(value).toLowerCase().startsWith(String(conditionValue).toLowerCase());
    case 'ends_with':
      return String(value).toLowerCase().endsWith(String(conditionValue).toLowerCase());
    case 'greater_than':
      return Number(value) > Number(conditionValue);
    case 'less_than':
      return Number(value) < Number(conditionValue);
    case 'in':
      return Array.isArray(conditionValue) && conditionValue.includes(value);
    case 'not_in':
      return Array.isArray(conditionValue) && !conditionValue.includes(value);
    default:
      return false;
  }
};

export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generateRandomColor = (): string => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-rose-500', 'bg-emerald-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Template variables replacement
export const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>
): string => {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    result = result.replace(regex, value || '');
  });
  
  return result;
};

// Extract template variables
export const extractTemplateVariables = (template: string): string[] => {
  const regex = /{{([^}]+)}}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }
  
  return variables;
};

// Validate template syntax
export const validateTemplate = (template: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for unclosed template variables
  const openBraces = (template.match(/{/g) || []).length;
  const closeBraces = (template.match(/}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    errors.push('Chaves de template não balanceadas');
  }
  
  // Check for basic HTML validity (simplified)
  if (template.includes('<') && !template.includes('>')) {
    errors.push('HTML malformado detectado');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email performance metrics
export const calculateEmailMetrics = (campaign: Campaign) => {
  const deliveryRate = calculateRate(campaign.sent - (campaign.bounces || 0), campaign.sent);
  const openRate = calculateRate(campaign.opens, campaign.sent);
  const clickRate = calculateRate(campaign.clicks, campaign.sent);
  const clickToOpenRate = calculateRate(campaign.clicks, campaign.opens);
  const unsubscribeRate = calculateRate(campaign.unsubscribes || 0, campaign.sent);
  
  return {
    deliveryRate,
    openRate,
    clickRate,
    clickToOpenRate,
    unsubscribeRate,
    deliverabilityScore: calculateDeliverabilityScore(campaign)
  };
};

// Time zone utilities
export const getTimezoneOffset = (): number => {
  return new Date().getTimezoneOffset();
};

export const formatTimeForTimezone = (date: Date, timezone = 'America/Sao_Paulo'): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// URL utilities for tracking
export const buildTrackingUrl = (baseUrl: string, params: Record<string, string>): string => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
};

export const generateUnsubscribeUrl = (contactId: string, campaignId: string): string => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://fly2any.com.br'
    : 'http://localhost:3000';
  
  return `${baseUrl}/unsubscribe?contact=${contactId}&campaign=${campaignId}`;
};

export const generateTrackingPixelUrl = (contactId: string, campaignId: string): string => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://fly2any.com.br'
    : 'http://localhost:3000';
  
  return `${baseUrl}/api/email-marketing/track/open?contact=${contactId}&campaign=${campaignId}`;
};