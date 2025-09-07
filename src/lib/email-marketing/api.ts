// Email Marketing API Client
import { 
  Contact, 
  Campaign, 
  EmailTemplate, 
  Segment, 
  AutomationWorkflow, 
  ABTest, 
  EmailActivity 
} from './utils';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StatsResponse {
  totalContacts: number;
  segmentStats: Record<string, number>;
  campaignsSent: number;
  avgOpenRate: string;
  avgClickRate: string;
  totalRevenue?: number;
  growthRate?: number;
  deliverabilityScore?: number;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  complained: number;
  revenue: number;
}

export interface AnalyticsData {
  campaigns: Campaign[];
  performance: {
    openRates: Array<{ date: string; rate: number }>;
    clickRates: Array<{ date: string; rate: number }>;
    deliveryRates: Array<{ date: string; rate: number }>;
  };
  topSegments: Array<{ name: string; contacts: number; openRate: number }>;
  deviceStats: Array<{ device: string; count: number; percentage: number }>;
  locationStats: Array<{ country: string; count: number; percentage: number }>;
}

class EmailMarketingAPI {
  private baseUrl = '/api/email-marketing';
  
  // Generic fetch wrapper with error handling
  private async fetch<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Stats & Analytics
  async getStats(): Promise<ApiResponse<StatsResponse>> {
    return this.fetch<StatsResponse>('?action=stats');
  }

  async getAnalytics(dateRange?: { start: Date; end: Date }): Promise<ApiResponse<AnalyticsData>> {
    const params = new URLSearchParams();
    params.set('action', 'analytics');
    
    if (dateRange) {
      params.set('start', dateRange.start.toISOString());
      params.set('end', dateRange.end.toISOString());
    }
    
    return this.fetch<AnalyticsData>(`?${params}`);
  }

  async getCampaignStats(campaignId: string): Promise<ApiResponse<CampaignStats>> {
    return this.fetch<CampaignStats>(`?action=campaign_stats&id=${campaignId}`);
  }

  // Contacts Management
  async getContacts(
    page = 1, 
    limit = 100, 
    filters?: {
      segment?: string;
      search?: string;
      engagementLevel?: string;
    }
  ): Promise<ApiResponse<{ contacts: Contact[]; total: number; page: number; totalPages: number }>> {
    const params = new URLSearchParams({
      action: 'contacts',
      page: page.toString(),
      limit: limit.toString()
    });

    if (filters?.segment) params.set('segment', filters.segment);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.engagementLevel) params.set('engagement', filters.engagementLevel);

    return this.fetch(`?${params}`);
  }

  async getContact(id: string): Promise<ApiResponse<Contact>> {
    return this.fetch<Contact>(`?action=contact&id=${id}`);
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<ApiResponse<Contact>> {
    return this.fetch<Contact>(`?action=update_contact&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact)
    });
  }

  async deleteContact(id: string): Promise<ApiResponse> {
    return this.fetch(`?action=delete_contact&id=${id}`, { method: 'DELETE' });
  }

  async bulkDeleteContacts(ids: string[]): Promise<ApiResponse> {
    return this.fetch('?action=bulk_delete_contacts', {
      method: 'POST',
      body: JSON.stringify({ contactIds: ids })
    });
  }

  async addContactTags(contactIds: string[], tags: string[]): Promise<ApiResponse> {
    return this.fetch('?action=add_tags', {
      method: 'POST',
      body: JSON.stringify({ contactIds, tags })
    });
  }

  async removeContactTags(contactIds: string[], tags: string[]): Promise<ApiResponse> {
    return this.fetch('?action=remove_tags', {
      method: 'POST',
      body: JSON.stringify({ contactIds, tags })
    });
  }

  async moveContactsToSegment(contactIds: string[], segmentId: string): Promise<ApiResponse> {
    return this.fetch('?action=move_to_segment', {
      method: 'POST',
      body: JSON.stringify({ contactIds, segmentId })
    });
  }

  // Campaigns Management
  async getCampaigns(
    page = 1, 
    limit = 50
  ): Promise<ApiResponse<{ campaigns: Campaign[]; total: number; page: number; totalPages: number }>> {
    return this.fetch(`?action=campaigns&page=${page}&limit=${limit}`);
  }

  async getCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return this.fetch<Campaign>(`?action=campaign&id=${id}`);
  }

  async createCampaign(campaign: {
    name: string;
    type: string;
    subject: string;
    content: string;
    segmentId?: string;
    templateId?: string;
    scheduleDate?: Date;
  }): Promise<ApiResponse<Campaign>> {
    return this.fetch<Campaign>('?action=create_campaign', {
      method: 'POST',
      body: JSON.stringify(campaign)
    });
  }

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return this.fetch<Campaign>(`?action=update_campaign&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaign)
    });
  }

  async deleteCampaign(id: string): Promise<ApiResponse> {
    return this.fetch(`?action=delete_campaign&id=${id}`, { method: 'DELETE' });
  }

  async duplicateCampaign(id: string, name?: string): Promise<ApiResponse<Campaign>> {
    return this.fetch<Campaign>(`?action=duplicate_campaign&id=${id}`, {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  }

  async sendCampaign(
    type: string, 
    options?: {
      segment?: string;
      scheduleDate?: Date;
      testEmails?: string[];
    }
  ): Promise<ApiResponse<{ campaignId: string; totalRecipients: number; status: string }>> {
    return this.fetch('', {
      method: 'POST',
      body: JSON.stringify({
        action: `send_${type}`,
        ...options
      })
    });
  }

  async pauseCampaign(id: string): Promise<ApiResponse> {
    return this.fetch(`?action=pause_campaign&id=${id}`, { method: 'POST' });
  }

  async resumeCampaign(id: string): Promise<ApiResponse> {
    return this.fetch(`?action=resume_campaign&id=${id}`, { method: 'POST' });
  }

  async sendTestEmail(
    email: string, 
    campaignType: string
  ): Promise<ApiResponse> {
    return this.fetch('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'send_test',
        email,
        campaignType
      })
    });
  }

  // Email Templates
  async getTemplates(
    category?: string
  ): Promise<ApiResponse<{ templates: EmailTemplate[]; categories: string[] }>> {
    const params = new URLSearchParams({ action: 'templates' });
    if (category) params.set('category', category);
    
    return this.fetch(`?${params}`);
  }

  async getTemplate(id: string): Promise<ApiResponse<EmailTemplate>> {
    return this.fetch<EmailTemplate>(`?action=template&id=${id}`);
  }

  async saveTemplate(template: {
    name: string;
    category: string;
    description: string;
    html: string;
    subject: string;
  }): Promise<ApiResponse<EmailTemplate>> {
    return this.fetch<EmailTemplate>('?action=save_template', {
      method: 'POST',
      body: JSON.stringify(template)
    });
  }

  async deleteTemplate(id: string): Promise<ApiResponse> {
    return this.fetch(`?action=delete_template&id=${id}`, { method: 'DELETE' });
  }

  // Segments Management
  async getSegments(): Promise<ApiResponse<Segment[]>> {
    return this.fetch<Segment[]>('?action=segments');
  }

  async getSegment(id: string): Promise<ApiResponse<Segment>> {
    return this.fetch<Segment>(`?action=segment&id=${id}`);
  }

  async createSegment(segment: {
    name: string;
    description?: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  }): Promise<ApiResponse<Segment>> {
    return this.fetch<Segment>('?action=create_segment', {
      method: 'POST',
      body: JSON.stringify(segment)
    });
  }

  async updateSegment(id: string, segment: Partial<Segment>): Promise<ApiResponse<Segment>> {
    return this.fetch<Segment>(`?action=update_segment&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(segment)
    });
  }

  async deleteSegment(id: string): Promise<ApiResponse> {
    return this.fetch(`?action=delete_segment&id=${id}`, { method: 'DELETE' });
  }

  async previewSegment(conditions: any[]): Promise<ApiResponse<{ count: number; preview: Contact[] }>> {
    return this.fetch('?action=preview_segment', {
      method: 'POST',
      body: JSON.stringify({ conditions })
    });
  }

  // Automation Workflows
  async getWorkflows(): Promise<ApiResponse<AutomationWorkflow[]>> {
    return this.fetch<AutomationWorkflow[]>('?action=workflows');
  }

  async getWorkflow(id: string): Promise<ApiResponse<AutomationWorkflow>> {
    return this.fetch<AutomationWorkflow>(`?action=workflow&id=${id}`);
  }

  async createWorkflow(workflow: {
    name: string;
    description?: string;
    trigger: any;
    actions: any[];
    conditions?: any[];
  }): Promise<ApiResponse<AutomationWorkflow>> {
    return this.fetch<AutomationWorkflow>('?action=create_workflow', {
      method: 'POST',
      body: JSON.stringify(workflow)
    });
  }

  async updateWorkflow(id: string, workflow: Partial<AutomationWorkflow>): Promise<ApiResponse<AutomationWorkflow>> {
    return this.fetch<AutomationWorkflow>(`?action=update_workflow&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow)
    });
  }

  async deleteWorkflow(id: string): Promise<ApiResponse> {
    return this.fetch(`?action=delete_workflow&id=${id}`, { method: 'DELETE' });
  }

  async activateWorkflow(id: string): Promise<ApiResponse> {
    return this.fetch(`?action=activate_workflow&id=${id}`, { method: 'POST' });
  }

  async deactivateWorkflow(id: string): Promise<ApiResponse> {
    return this.fetch(`?action=deactivate_workflow&id=${id}`, { method: 'POST' });
  }

  // A/B Testing
  async getABTests(): Promise<ApiResponse<ABTest[]>> {
    return this.fetch<ABTest[]>('?action=ab_tests');
  }

  async getABTest(id: string): Promise<ApiResponse<ABTest>> {
    return this.fetch<ABTest>(`?action=ab_test&id=${id}`);
  }

  async createABTest(test: {
    name: string;
    campaignId: string;
    variants: Array<{
      name: string;
      subject?: string;
      content?: string;
    }>;
    trafficSplit: number[];
    winnerCriteria: string;
    confidenceLevel: number;
  }): Promise<ApiResponse<ABTest>> {
    return this.fetch<ABTest>('?action=create_ab_test', {
      method: 'POST',
      body: JSON.stringify(test)
    });
  }

  async startABTest(id: string): Promise<ApiResponse> {
    return this.fetch(`?action=start_ab_test&id=${id}`, { method: 'POST' });
  }

  async stopABTest(id: string): Promise<ApiResponse> {
    return this.fetch(`?action=stop_ab_test&id=${id}`, { method: 'POST' });
  }

  async getABTestResults(id: string): Promise<ApiResponse<any>> {
    return this.fetch(`?action=ab_test_results&id=${id}`);
  }

  // Activity & Tracking
  async getActivity(
    filters?: {
      contactId?: string;
      campaignId?: string;
      type?: string;
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<ApiResponse<EmailActivity[]>> {
    const params = new URLSearchParams({ action: 'activity' });
    
    if (filters?.contactId) params.set('contact', filters.contactId);
    if (filters?.campaignId) params.set('campaign', filters.campaignId);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.dateRange) {
      params.set('start', filters.dateRange.start.toISOString());
      params.set('end', filters.dateRange.end.toISOString());
    }
    
    return this.fetch<EmailActivity[]>(`?${params}`);
  }

  async getRecentActivity(limit = 50): Promise<ApiResponse<EmailActivity[]>> {
    return this.fetch<EmailActivity[]>(`?action=recent_activity&limit=${limit}`);
  }

  // Import/Export
  async exportContacts(
    format: 'csv' | 'xlsx' = 'csv',
    filters?: {
      segment?: string;
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const params = new URLSearchParams({
      action: 'export_contacts',
      format
    });
    
    if (filters?.segment) params.set('segment', filters.segment);
    if (filters?.dateRange) {
      params.set('start', filters.dateRange.start.toISOString());
      params.set('end', filters.dateRange.end.toISOString());
    }
    
    return this.fetch(`?${params}`, { method: 'POST' });
  }

  async importContacts(file: File): Promise<ApiResponse<{
    imported: number;
    duplicates: number;
    invalid: number;
    errors?: string[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/email-import', {
        method: 'POST',
        body: formData
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no upload'
      };
    }
  }

  // System Operations
  async getSystemHealth(): Promise<ApiResponse<{
    status: 'healthy' | 'warning' | 'error';
    checks: Array<{ name: string; status: string; message?: string }>;
    uptime: number;
    lastCheck: Date;
  }>> {
    return this.fetch('?action=health');
  }

  async restartPausedCampaigns(): Promise<ApiResponse<{ restarted: number }>> {
    return this.fetch('?action=auto_restart');
  }

  async getLogs(
    level?: 'error' | 'warn' | 'info',
    limit = 100
  ): Promise<ApiResponse<Array<{
    timestamp: Date;
    level: string;
    message: string;
    data?: any;
  }>>> {
    const params = new URLSearchParams({ action: 'logs', limit: limit.toString() });
    if (level) params.set('level', level);
    
    return this.fetch(`?${params}`);
  }

  // Deliverability
  async checkDeliverability(): Promise<ApiResponse<{
    score: number;
    issues: Array<{ type: string; severity: string; message: string; fix: string }>;
    recommendations: string[];
  }>> {
    return this.fetch('?action=deliverability_check');
  }

  async getDomainReputation(domain: string): Promise<ApiResponse<{
    reputation: number;
    blacklisted: boolean;
    issues: string[];
    recommendations: string[];
  }>> {
    return this.fetch(`?action=domain_reputation&domain=${encodeURIComponent(domain)}`);
  }

  // Webhooks
  async getWebhookLogs(limit = 100): Promise<ApiResponse<Array<{
    id: string;
    event: string;
    timestamp: Date;
    status: number;
    data: any;
  }>>> {
    return this.fetch(`?action=webhook_logs&limit=${limit}`);
  }
}

// Create singleton instance
export const emailMarketingAPI = new EmailMarketingAPI();

// Export for manual instantiation if needed
export { EmailMarketingAPI };

// Utility hooks for React components
export const useEmailMarketingAPI = () => {
  return emailMarketingAPI;
};

// Error handling utilities
export const handleAPIError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.error) return error.error;
  if (error?.message) return error.message;
  if (error instanceof Error) return error.message;
  return 'Erro desconhecido na API';
};

// Response type guards
export const isSuccessResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } => {
  return response.success === true && response.data !== undefined;
};

export const isErrorResponse = (response: ApiResponse): response is ApiResponse & { success: false; error: string } => {
  return response.success === false && typeof response.error === 'string';
};