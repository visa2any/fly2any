/**
 * Email Marketing Service - V2 Compatible Version
 * Main service class for email marketing operations
 */

import { EmailMarketingDatabase, EmailContact as V2EmailContact, EmailCampaign as V2EmailCampaign } from './email-marketing-database';
import { emailMarketingLogger } from './email-marketing-logger';

// Use V2 interfaces
type EmailContact = V2EmailContact;
type EmailCampaign = V2EmailCampaign;

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
}

export interface SendOptions {
  sendRate?: number; // emails per minute
  maxRetries?: number;
  scheduleAt?: Date;
  testMode?: boolean;
}

export interface CampaignStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

class EmailMarketingService {
  
  // Contact Management
  async addContact(contact: Partial<EmailContact>): Promise<EmailContact | null> {
    try {
      // Initialize V2 database if needed
      await EmailMarketingDatabase.initializeEmailTables();
      
      // For V2 system, we would need to create via the proper V2 methods
      // This is a simplified implementation - in production use proper V2 contact creation
      emailMarketingLogger.info('Contact add requested (V2)', { 
        email: contact.email
      });
      
      // V2 system handles contact creation differently
      // Return null for now as this needs proper implementation
      return null;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to add contact (V2)', { 
        email: contact.email,
        error: error.message 
      });
      throw error;
    }
  }

  async getContact(id: string): Promise<EmailContact | null> {
    try {
      const result = await EmailMarketingDatabase.getEmailContacts({ limit: 1 });
      return result.contacts.find(c => c.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  async getContactByEmail(email: string): Promise<EmailContact | null> {
    try {
      const result = await EmailMarketingDatabase.getEmailContacts({ limit: 1000 });
      return result.contacts.find(c => c.email === email) || null;
    } catch (error) {
      return null;
    }
  }

  async updateContact(id: string, updates: Partial<EmailContact>): Promise<EmailContact | null> {
    try {
      // V2 system doesn't have direct update method
      // This would need to be implemented properly in V2
      emailMarketingLogger.info('Contact update requested (V2)', { 
        contactId: id,
        updates: Object.keys(updates)
      });
      return null;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to update contact (V2)', { 
        contactId: id,
        error: error.message 
      });
      throw error;
    }
  }

  async unsubscribeContact(email: string): Promise<boolean> {
    try {
      // V2 system would handle unsubscribe differently
      emailMarketingLogger.info('Contact unsubscribe requested (V2)', { email });
      // This needs proper V2 implementation
      return false;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to unsubscribe contact (V2)', { 
        email,
        error: error.message 
      });
      return false;
    }
  }

  async getContacts(limit = 100, offset = 0): Promise<EmailContact[]> {
    try {
      const result = await EmailMarketingDatabase.getEmailContacts({ limit, offset });
      return result.contacts;
    } catch (error) {
      return [];
    }
  }

  async getActiveContacts(): Promise<EmailContact[]> {
    try {
      const result = await EmailMarketingDatabase.getEmailContacts({ 
        status: 'active', 
        limit: 1000 
      });
      return result.contacts;
    } catch (error) {
      return [];
    }
  }

  // Campaign Management
  async createCampaign(campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
    try {
      await EmailMarketingDatabase.initializeEmailTables();
      
      const campaignData: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at'> = {
        name: campaign.name || 'Untitled Campaign',
        subject: campaign.subject || 'Campaign Subject',
        content: campaign.content || 'Campaign Content',
        template_type: campaign.template_type || 'custom',
        status: campaign.status || 'draft',
        from_email: campaign.from_email || 'noreply@fly2any.com',
        from_name: campaign.from_name || 'Fly2Any',
        timezone: campaign.timezone || 'America/Sao_Paulo',
        total_recipients: campaign.total_recipients || 0,
        total_sent: campaign.total_sent || 0,
        total_delivered: campaign.total_delivered || 0,
        total_opened: campaign.total_opened || 0,
        total_clicked: campaign.total_clicked || 0,
        total_unsubscribed: campaign.total_unsubscribed || 0,
        total_bounced: campaign.total_bounced || 0,
        created_by: campaign.created_by || 'system'
      };
      
      const result = await EmailMarketingDatabase.createCampaign(campaignData);
      emailMarketingLogger.info('Campaign created (V2)', { 
        campaignId: result.id,
        name: campaign.name 
      });
      return result;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to create campaign (V2)', { 
        name: campaign.name,
        error: error.message 
      });
      throw error;
    }
  }

  async getCampaign(id: string): Promise<EmailCampaign | null> {
    try {
      const campaigns = await EmailMarketingDatabase.getEmailCampaigns(1000);
      return campaigns.find(c => c.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  async getCampaigns(): Promise<EmailCampaign[]> {
    try {
      return await EmailMarketingDatabase.getEmailCampaigns(1000);
    } catch (error) {
      return [];
    }
  }

  async updateCampaignStatus(id: string, status: string): Promise<EmailCampaign | null> {
    try {
      // V2 system doesn't have direct update methods
      emailMarketingLogger.logCampaignEvent(id, `status change requested to ${status} (V2)`);
      return null;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to update campaign status (V2)', { 
        campaignId: id,
        status,
        error: error.message 
      });
      throw error;
    }
  }

  // Email Sending
  async sendCampaign(campaignId: string, options: SendOptions = {}): Promise<boolean> {
    try {
      // TODO: Replace with actual database call
      const campaign = { status: 'draft' } as any; // await getCampaignById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        throw new Error('Campaign must be in draft or scheduled status to send');
      }

      // V2 system handles campaign sending differently
      emailMarketingLogger.info('Campaign send requested (V2)', { campaignId });

      // Get active contacts from V2 system
      const result = await EmailMarketingDatabase.getEmailContacts({ 
        status: 'active', 
        limit: 10000 
      });
      const contacts = result.contacts;

      if (contacts.length === 0) {
        emailMarketingLogger.warn('No active contacts found for campaign (V2)', { campaignId });
        return false;
      }

      emailMarketingLogger.logCampaignEvent(campaignId, 'sending started', {
        totalContacts: contacts.length,
        sendRate: options.sendRate || 50
      });

      // V2 system would handle actual email sending through the V2 API
      emailMarketingLogger.info('Campaign would be sent via V2 system', {
        campaignId,
        totalContacts: contacts.length
      });

      return true;

    } catch (error: any) {
      emailMarketingLogger.error('Failed to send campaign', { 
        campaignId,
        error: error.message 
      });
      
      // V2 system error handling
      throw error;
    }
  }

  async pauseCampaign(campaignId: string): Promise<boolean> {
    try {
      emailMarketingLogger.logCampaignEvent(campaignId, 'pause requested (V2)');
      return false;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to pause campaign (V2)', { 
        campaignId,
        error: error.message 
      });
      return false;
    }
  }

  async resumeCampaign(campaignId: string): Promise<boolean> {
    try {
      emailMarketingLogger.logCampaignEvent(campaignId, 'resume requested (V2)');
      return false;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to resume campaign (V2)', { 
        campaignId,
        error: error.message 
      });
      return false;
    }
  }

  // Analytics and Stats
  async getCampaignStats(campaignId: string): Promise<CampaignStats | null> {
    try {
      const campaigns = await EmailMarketingDatabase.getEmailCampaigns(1000);
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) return null;

      const stats: CampaignStats = {
        totalSent: campaign.total_sent || 0,
        totalDelivered: campaign.total_delivered || 0,
        totalOpened: campaign.total_opened || 0,
        totalClicked: campaign.total_clicked || 0,
        totalBounced: campaign.total_bounced || 0,
        totalUnsubscribed: campaign.total_unsubscribed || 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0
      };

      // Calculate rates
      if (stats.totalSent > 0) {
        stats.deliveryRate = (stats.totalDelivered / stats.totalSent) * 100;
        stats.bounceRate = (stats.totalBounced / stats.totalSent) * 100;
      }

      if (stats.totalDelivered > 0) {
        stats.openRate = (stats.totalOpened / stats.totalDelivered) * 100;
      }

      if (stats.totalOpened > 0) {
        stats.clickRate = (stats.totalClicked / stats.totalOpened) * 100;
      }

      return stats;

    } catch (error: any) {
      emailMarketingLogger.error('Failed to get campaign stats (V2)', { 
        campaignId,
        error: error.message 
      });
      return null;
    }
  }

  async getOverallStats(): Promise<any> {
    try {
      const campaigns = await EmailMarketingDatabase.getEmailCampaigns(1000);
      const contactsResult = await EmailMarketingDatabase.getEmailContacts({ limit: 10000 });
      const contacts = contactsResult.contacts;

      const totalSent = campaigns.reduce((sum, c) => sum + (c.total_sent || 0), 0);
      const totalOpened = campaigns.reduce((sum, c) => sum + (c.total_opened || 0), 0);
      const totalClicked = campaigns.reduce((sum, c) => sum + (c.total_clicked || 0), 0);

      return {
        totalContacts: contacts.length,
        activeContacts: contacts.filter(c => c.email_status === 'active').length,
        totalCampaigns: campaigns.length,
        completedCampaigns: campaigns.filter(c => c.status === 'sent').length,
        totalEmailsSent: totalSent,
        averageOpenRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0',
        averageClickRate: totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0.0'
      };

    } catch (error: any) {
      emailMarketingLogger.error('Failed to get overall stats (V2)', { error: error.message });
      return {
        totalContacts: 0,
        activeContacts: 0,
        totalCampaigns: 0,
        completedCampaigns: 0,
        totalEmailsSent: 0,
        averageOpenRate: '0.0',
        averageClickRate: '0.0'
      };
    }
  }

  // Bulk operations
  async bulkAddContacts(contacts: Partial<EmailContact>[]): Promise<{ success: EmailContact[], errors: string[] }> {
    try {
      await EmailMarketingDatabase.initializeEmailTables();
      
      emailMarketingLogger.logBulkOperation('contact import (V2)', contacts.length, 0, contacts.length);
      
      // V2 system would handle bulk imports differently
      // For now, return empty success array
      return { success: [], errors: ['V2 bulk import not yet implemented'] };
    } catch (error: any) {
      emailMarketingLogger.error('Bulk contact import failed (V2)', { 
        totalContacts: contacts.length,
        error: error.message 
      });
      return { success: [], errors: [`Bulk import failed: ${error.message}`] };
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string, details: any }> {
    try {
      // Test V2 database connections
      const stats = await EmailMarketingDatabase.getEmailMarketingStats('24h');
      const isHealthy = stats.totalContacts >= 0;

      if (isHealthy) {
        return {
          status: 'healthy',
          details: {
            database: 'connected (V2)',
            totalContacts: stats.totalContacts,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        return {
          status: 'unhealthy',
          details: {
            database: 'connection issues (V2)',
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (error: any) {
      return {
        status: 'unhealthy',
        details: {
          database: 'error (V2)',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Get system status
  async getSystemStatus(): Promise<any> {
    try {
      const health = await this.healthCheck();
      const stats = await this.getOverallStats();
      
      return {
        status: health.status,
        stats,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const emailMarketingService = new EmailMarketingService();

// Export default for backward compatibility
export default emailMarketingService;