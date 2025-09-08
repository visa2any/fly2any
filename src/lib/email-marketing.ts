/**
 * Email Marketing Service - V2 Compatible Version
 * Main service class for email marketing operations
 */

import { EmailContactsDB, EmailCampaignsDB, EmailSendsDB, EmailContact, EmailCampaign } from './email-marketing-db';
import { emailMarketingLogger } from './email-marketing-logger';

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
  async addContact(contact: EmailContact): Promise<EmailContact> {
    try {
      const result = await EmailContactsDB.create(contact);
      emailMarketingLogger.info('Contact added', { 
        email: contact.email,
        contactId: result.id 
      });
      return result;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to add contact', { 
        email: contact.email,
        error: error.message 
      });
      throw error;
    }
  }

  async getContact(id: string): Promise<EmailContact | null> {
    return EmailContactsDB.getById(id);
  }

  async getContactByEmail(email: string): Promise<EmailContact | null> {
    return EmailContactsDB.getByEmail(email);
  }

  async updateContact(id: string, updates: Partial<EmailContact>): Promise<EmailContact | null> {
    try {
      const result = await EmailContactsDB.update(id, updates);
      if (result) {
        emailMarketingLogger.info('Contact updated', { 
          contactId: id,
          updates: Object.keys(updates)
        });
      }
      return result;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to update contact', { 
        contactId: id,
        error: error.message 
      });
      throw error;
    }
  }

  async unsubscribeContact(email: string): Promise<boolean> {
    try {
      const contact = await EmailContactsDB.getByEmail(email);
      if (!contact) return false;

      const updated = await EmailContactsDB.update(contact.id!, {
        status: 'unsubscribed',
        unsubscribedAt: new Date().toISOString()
      });

      if (updated) {
        emailMarketingLogger.info('Contact unsubscribed', { 
          email,
          contactId: contact.id 
        });
        return true;
      }
      return false;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to unsubscribe contact', { 
        email,
        error: error.message 
      });
      return false;
    }
  }

  async getContacts(limit = 100, offset = 0): Promise<EmailContact[]> {
    return EmailContactsDB.getAll(limit, offset);
  }

  async getActiveContacts(): Promise<EmailContact[]> {
    return EmailContactsDB.getByStatus('active');
  }

  // Campaign Management
  async createCampaign(campaign: EmailCampaign): Promise<EmailCampaign> {
    try {
      const result = await EmailCampaignsDB.create(campaign);
      emailMarketingLogger.info('Campaign created', { 
        campaignId: result.id,
        name: campaign.name 
      });
      return result;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to create campaign', { 
        name: campaign.name,
        error: error.message 
      });
      throw error;
    }
  }

  async getCampaign(id: string): Promise<EmailCampaign | null> {
    return EmailCampaignsDB.getById(id);
  }

  async getCampaigns(): Promise<EmailCampaign[]> {
    return EmailCampaignsDB.getAll();
  }

  async updateCampaignStatus(id: string, status: string): Promise<EmailCampaign | null> {
    try {
      const result = await EmailCampaignsDB.updateStatus(id, status);
      if (result) {
        emailMarketingLogger.logCampaignEvent(id, `status changed to ${status}`);
      }
      return result;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to update campaign status', { 
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
      const campaign = await EmailCampaignsDB.getById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        throw new Error('Campaign must be in draft or scheduled status to send');
      }

      // Update campaign status to sending
      await EmailCampaignsDB.updateStatus(campaignId, 'sending');

      // Get active contacts (in a real implementation, this would be filtered by segments)
      const contacts = await EmailContactsDB.getByStatus('active');

      if (contacts.length === 0) {
        emailMarketingLogger.warn('No active contacts found for campaign', { campaignId });
        await EmailCampaignsDB.updateStatus(campaignId, 'completed');
        return false;
      }

      // Create send records
      const sendPromises = contacts.map(contact =>
        EmailSendsDB.create({
          contactId: contact.id!,
          campaignId,
          status: 'pending',
          maxRetries: options.maxRetries || 3
        })
      );

      await Promise.all(sendPromises);

      emailMarketingLogger.logCampaignEvent(campaignId, 'sending started', {
        totalContacts: contacts.length,
        sendRate: options.sendRate || 50
      });

      // In a real implementation, this would trigger the actual email sending process
      // For now, we'll just mark it as sent
      await EmailCampaignsDB.updateStatus(campaignId, 'sent');
      await EmailCampaignsDB.updateStats(campaignId, {
        totalSent: contacts.length
      });

      return true;

    } catch (error: any) {
      emailMarketingLogger.error('Failed to send campaign', { 
        campaignId,
        error: error.message 
      });
      
      // Revert campaign status on failure
      await EmailCampaignsDB.updateStatus(campaignId, 'draft');
      throw error;
    }
  }

  async pauseCampaign(campaignId: string): Promise<boolean> {
    try {
      const result = await EmailCampaignsDB.updateStatus(campaignId, 'paused');
      if (result) {
        emailMarketingLogger.logCampaignEvent(campaignId, 'paused');
        return true;
      }
      return false;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to pause campaign', { 
        campaignId,
        error: error.message 
      });
      return false;
    }
  }

  async resumeCampaign(campaignId: string): Promise<boolean> {
    try {
      const result = await EmailCampaignsDB.updateStatus(campaignId, 'sending');
      if (result) {
        emailMarketingLogger.logCampaignEvent(campaignId, 'resumed');
        return true;
      }
      return false;
    } catch (error: any) {
      emailMarketingLogger.error('Failed to resume campaign', { 
        campaignId,
        error: error.message 
      });
      return false;
    }
  }

  // Analytics and Stats
  async getCampaignStats(campaignId: string): Promise<CampaignStats | null> {
    try {
      const campaign = await EmailCampaignsDB.getById(campaignId);
      if (!campaign) return null;

      const sends = await EmailSendsDB.getByCampaign(campaignId);

      const stats: CampaignStats = {
        totalSent: campaign.totalSent || 0,
        totalDelivered: campaign.totalDelivered || 0,
        totalOpened: campaign.totalOpened || 0,
        totalClicked: campaign.totalClicked || 0,
        totalBounced: campaign.totalBounced || 0,
        totalUnsubscribed: campaign.totalUnsubscribed || 0,
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
      emailMarketingLogger.error('Failed to get campaign stats', { 
        campaignId,
        error: error.message 
      });
      return null;
    }
  }

  async getOverallStats(): Promise<any> {
    try {
      const campaigns = await EmailCampaignsDB.getAll();
      const contacts = await EmailContactsDB.getAll(1000, 0);

      const totalSent = campaigns.reduce((sum, c) => sum + (c.totalSent || 0), 0);
      const totalOpened = campaigns.reduce((sum, c) => sum + (c.totalOpened || 0), 0);
      const totalClicked = campaigns.reduce((sum, c) => sum + (c.totalClicked || 0), 0);

      return {
        totalContacts: contacts.length,
        activeContacts: contacts.filter(c => c.status === 'active').length,
        totalCampaigns: campaigns.length,
        completedCampaigns: campaigns.filter(c => c.status === 'completed' || c.status === 'sent').length,
        totalEmailsSent: totalSent,
        averageOpenRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0',
        averageClickRate: totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0.0'
      };

    } catch (error: any) {
      emailMarketingLogger.error('Failed to get overall stats', { error: error.message });
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
  async bulkAddContacts(contacts: EmailContact[]): Promise<{ success: EmailContact[], errors: string[] }> {
    try {
      const result = await EmailContactsDB.bulkCreate(contacts);
      const results = { success: result.inserted, errors: result.errors };
      
      emailMarketingLogger.logBulkOperation('contact import', contacts.length, result.inserted.length, contacts.length - result.inserted.length);

      return results;
    } catch (error: any) {
      emailMarketingLogger.error('Bulk contact import failed', { 
        totalContacts: contacts.length,
        error: error.message 
      });
      return { success: [], errors: [`Bulk import failed: ${error.message}`] };
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string, details: any }> {
    try {
      // Test database connections
      const contactCount = (await EmailContactsDB.getAll(1, 0)).length >= 0;
      const campaignCount = (await EmailCampaignsDB.getAll()).length >= 0;

      if (contactCount && campaignCount) {
        return {
          status: 'healthy',
          details: {
            database: 'connected',
            timestamp: new Date().toISOString()
          }
        };
      } else {
        return {
          status: 'unhealthy',
          details: {
            database: 'connection issues',
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (error: any) {
      return {
        status: 'unhealthy',
        details: {
          database: 'error',
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