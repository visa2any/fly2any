import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { EmailMarketingDatabase, EmailContact, EmailEvent } from './email-marketing-database';

// MailGun Service for Production Email Marketing
export class MailgunService {
  private mailgun: any;
  private domain: string = '';

  constructor() {
    // Initialize MailGun client
    const mg = new Mailgun(formData);
    
    // Get credentials from environment variables
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    
    if (!apiKey || !domain) {
      console.warn('⚠️ MailGun credentials not found in environment variables');
      console.log('📝 Required environment variables:');
      console.log('   - MAILGUN_API_KEY: Your MailGun API key');
      console.log('   - MAILGUN_DOMAIN: Your verified MailGun domain');
      return;
    }

    this.mailgun = mg.client({
      username: 'api',
      key: apiKey
    });
    
    this.domain = domain;
    console.log(`✅ MailGun initialized with domain: ${this.domain}`);
  }

  // Send single email
  async sendSingleEmail(params: {
    to: string;
    from: string;
    fromName?: string;
    subject: string;
    html: string;
    text?: string;
    campaignId?: string;
    contactId?: string;
    trackingEnabled?: boolean;
  }): Promise<{ success: boolean; messageId?: string; error?: string; domainStatus?: string }> {
    try {
      if (!this.mailgun) {
        throw new Error('MailGun not initialized. Check environment variables.');
      }

      // Check domain verification status first
      let domainStatus = 'unknown';
      try {
        const domainInfo = await this.mailgun.domains.get(this.domain);
        domainStatus = domainInfo.state || 'unverified';
        
        if (domainStatus === 'unverified') {
          console.warn(`⚠️ Domain ${this.domain} is unverified. Email sending may be restricted to authorized recipients only.`);
          console.log(`📝 To verify domain: Add DNS records in your domain registrar as shown in MailGun dashboard.`);
        }
      } catch (domainError) {
        console.warn(`⚠️ Could not check domain status: ${domainError}`);
      }

      const fromAddress = params.fromName ? 
        `${params.fromName} <${params.from}>` : params.from;

      const emailData: any = {
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text || this.htmlToText(params.html),
        
        // Enable tracking
        'o:tracking': params.trackingEnabled !== false ? 'yes' : 'no',
        'o:tracking-clicks': 'yes',
        'o:tracking-opens': 'yes',
        
        // Custom variables for tracking
        'v:campaign_id': params.campaignId || '',
        'v:contact_id': params.contactId || '',
      };

      // Add tracking pixel and click tracking
      if (params.trackingEnabled !== false && params.contactId) {
        emailData.html = this.addTrackingPixel(params.html, params.contactId, params.campaignId);
      }

      const response = await this.mailgun.messages.create(this.domain, emailData);
      
      // Record sent event
      if (params.contactId) {
        await EmailMarketingDatabase.recordEmailEvent({
          contact_id: params.contactId,
          campaign_id: params.campaignId,
          event_type: 'sent',
          event_data: {
            to: params.to,
            subject: params.subject,
            mailgun_message_id: response.id
          },
          mailgun_message_id: response.id
        });
      }

      console.log(`📧 Email sent successfully to ${params.to}`);
      return { 
        success: true, 
        messageId: response.id,
        domainStatus 
      };
    } catch (error: any) {
      console.error('❌ MailGun send error:', error);
      
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let domainStatus = 'unknown';
      
      // Enhanced error handling for unverified domain issues
      if (error.status === 400 && error.message?.includes('unverified')) {
        domainStatus = 'unverified';
        errorMessage = `Domain ${this.domain} is unverified. Please configure DNS records in your domain registrar and wait for verification. Currently restricted to authorized recipients only.`;
      } else if (error.status === 400 && error.message?.includes('not allowed to send')) {
        domainStatus = 'unverified';
        errorMessage = `Email sending restricted. Domain ${this.domain} is unverified and recipient is not in authorized recipients list. Add recipient to authorized recipients in MailGun dashboard or verify domain.`;
      }
      
      return { 
        success: false, 
        error: errorMessage,
        domainStatus
      };
    }
  }

  // Send bulk email campaign
  async sendBulkCampaign(params: {
    campaignId: string;
    from: string;
    fromName?: string;
    subject: string;
    html: string;
    text?: string;
    contacts: EmailContact[];
    batchSize?: number;
  }): Promise<{ 
    success: boolean; 
    sent: number; 
    failed: number; 
    errors: string[] 
  }> {
    try {
      if (!this.mailgun) {
        throw new Error('MailGun not initialized');
      }

      const batchSize = params.batchSize || 100;
      let sent = 0;
      let failed = 0;
      const errors: string[] = [];

      console.log(`📤 Starting bulk campaign: ${params.campaignId} to ${params.contacts.length} contacts`);

      // Process contacts in batches
      for (let i = 0; i < params.contacts.length; i += batchSize) {
        const batch = params.contacts.slice(i, i + batchSize);
        
        // Prepare recipient variables for personalization
        const recipientVariables: Record<string, any> = {};
        const recipients: string[] = [];

        batch.forEach(contact => {
          if (contact.email_status === 'active') {
            recipients.push(contact.email);
            recipientVariables[contact.email] = {
              first_name: contact.first_name || 'Cliente',
              contact_id: contact.id,
              campaign_id: params.campaignId
            };
          }
        });

        if (recipients.length === 0) continue;

        try {
          // Send batch using MailGun batch sending
          const response = await this.mailgun.messages.create(this.domain, {
            from: params.fromName ? `${params.fromName} <${params.from}>` : params.from,
            to: recipients,
            subject: params.subject,
            html: this.personalizeHtml(params.html),
            text: params.text || this.htmlToText(params.html),
            
            // Enable tracking
            'o:tracking': 'yes',
            'o:tracking-clicks': 'yes',
            'o:tracking-opens': 'yes',
            
            // Recipient variables for personalization
            'recipient-variables': JSON.stringify(recipientVariables),
            
            // Campaign tracking
            'v:campaign_id': params.campaignId,
            'o:tag': [`campaign:${params.campaignId}`, 'bulk-email']
          });

          sent += recipients.length;
          console.log(`✅ Sent batch of ${recipients.length} emails`);

          // Record sent events for each contact
          for (const contact of batch) {
            if (contact.email_status === 'active') {
              await EmailMarketingDatabase.recordEmailEvent({
                contact_id: contact.id,
                campaign_id: params.campaignId,
                event_type: 'sent',
                event_data: {
                  to: contact.email,
                  subject: params.subject,
                  batch_id: response.id
                },
                mailgun_message_id: response.id
              });
            }
          }

          // Small delay between batches to avoid rate limiting
          if (i + batchSize < params.contacts.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

        } catch (batchError) {
          failed += recipients.length;
          const errorMsg = batchError instanceof Error ? batchError.message : 'Batch send failed';
          errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${errorMsg}`);
          console.error(`❌ Batch send failed:`, errorMsg);
        }
      }

      console.log(`📊 Campaign completed: ${sent} sent, ${failed} failed`);
      return {
        success: sent > 0,
        sent,
        failed,
        errors
      };

    } catch (error) {
      console.error('❌ Bulk campaign error:', error);
      return {
        success: false,
        sent: 0,
        failed: params.contacts.length,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Handle MailGun webhooks for tracking
  async handleWebhook(webhookData: any): Promise<void> {
    try {
      const eventType = webhookData['event-data']?.event;
      const messageId = webhookData['event-data']?.message?.headers?.['message-id'];
      const recipient = webhookData['event-data']?.recipient;
      const timestamp = webhookData['event-data']?.timestamp;
      const campaignId = webhookData['event-data']?.['user-variables']?.campaign_id;
      const contactId = webhookData['event-data']?.['user-variables']?.contact_id;

      if (!eventType || !messageId) {
        console.log('⚠️ Invalid webhook data received');
        return;
      }

      // Map MailGun events to our event types
      const eventTypeMap: Record<string, string> = {
        'delivered': 'delivered',
        'opened': 'opened',
        'clicked': 'clicked',
        'bounced': 'bounced',
        'unsubscribed': 'unsubscribed',
        'complained': 'complained'
      };

      const mappedEventType = eventTypeMap[eventType];
      if (!mappedEventType) {
        console.log(`⚠️ Unhandled webhook event type: ${eventType}`);
        return;
      }

      // Find contact by email if contactId not provided
      let finalContactId = contactId;
      if (!finalContactId && recipient) {
        const contacts = await EmailMarketingDatabase.getEmailContacts({ limit: 1 });
        const contact = contacts.contacts.find(c => c.email === recipient);
        finalContactId = contact?.id;
      }

      if (!finalContactId) {
        console.log(`⚠️ Contact not found for email: ${recipient}`);
        return;
      }

      // Record the event
      await EmailMarketingDatabase.recordEmailEvent({
        contact_id: finalContactId,
        campaign_id: campaignId,
        event_type: mappedEventType as any,
        event_data: {
          ...webhookData['event-data'],
          recipient,
          timestamp: new Date(timestamp * 1000).toISOString()
        },
        ip_address: webhookData['event-data']?.['client-info']?.['client-ip'],
        user_agent: webhookData['event-data']?.['client-info']?.['user-agent'],
        link_url: webhookData['event-data']?.url,
        mailgun_event_id: webhookData['event-data']?.id,
        mailgun_message_id: messageId
      });

      // Handle unsubscribe
      if (mappedEventType === 'unsubscribed') {
        await this.handleUnsubscribe(recipient);
      }

      console.log(`📊 Recorded ${mappedEventType} event for ${recipient}`);

    } catch (error) {
      console.error('❌ Webhook processing error:', error);
    }
  }

  // Handle unsubscribe
  private async handleUnsubscribe(email: string): Promise<void> {
    try {
      // Update contact status in database
      const contacts = await EmailMarketingDatabase.getEmailContacts({ limit: 1000 });
      const contact = contacts.contacts.find(c => c.email === email);
      
      if (contact) {
        // Update in email_contacts table
        await EmailMarketingDatabase.recordEmailEvent({
          contact_id: contact.id,
          event_type: 'unsubscribed',
          event_data: { email, timestamp: new Date().toISOString() }
        });

        console.log(`🚫 Unsubscribed: ${email}`);
      }
    } catch (error) {
      console.error('Error handling unsubscribe:', error);
    }
  }

  // Verify MailGun webhook signature
  verifyWebhookSignature(timestamp: string, token: string, signature: string): boolean {
    try {
      const webhookSigningKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY;
      if (!webhookSigningKey) {
        console.warn('⚠️ MAILGUN_WEBHOOK_SIGNING_KEY not set');
        return true; // Allow in development
      }

      const crypto = require('crypto');
      const value = timestamp + token;
      const hash = crypto
        .createHmac('sha256', webhookSigningKey)
        .update(value)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  // Add tracking pixel to HTML
  private addTrackingPixel(html: string, contactId: string, campaignId?: string): string {
    const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fly2any.com'}/api/email-marketing/v2/track/open?contact_id=${contactId}&campaign_id=${campaignId || ''}`;
    const trackingPixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none;" />`;
    
    // Add pixel before closing body tag, or at the end if no body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `${trackingPixel}</body>`);
    } else {
      return html + trackingPixel;
    }
  }

  // Personalize HTML with variables
  private personalizeHtml(html: string): string {
    return html
      .replace(/\{\{first_name\}\}/g, '%recipient.first_name%')
      .replace(/\{\{email\}\}/g, '%recipient_email%')
      .replace(/\{\{contact_id\}\}/g, '%recipient.contact_id%');
  }

  // Convert HTML to plain text (basic implementation)
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Test MailGun configuration
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.mailgun) {
        return {
          success: false,
          message: 'MailGun not initialized. Check MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables.'
        };
      }

      // First try to get domain information to test API connection
      try {
        const domainInfo = await this.mailgun.domains.get(this.domain);
        
        return {
          success: true,
          message: `MailGun connection successful! Domain '${this.domain}' found. Status: ${domainInfo.state || 'active'}`
        };
      } catch (domainError: any) {
        console.log('Domain check error:', domainError.message);
        
        // If domain check fails, try to list domains to verify API key
        try {
          const domains = await this.mailgun.domains.list({ limit: 5 });
          return {
            success: true,
            message: `MailGun API key is valid! Found ${domains.items?.length || 0} domains. Your domain '${this.domain}' might not be added yet.`
          };
        } catch (apiError: any) {
          return {
            success: false,
            message: `MailGun API key authentication failed: ${apiError.message}`
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `MailGun test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Check domain verification status
  async getDomainVerificationStatus(): Promise<{ 
    status: 'verified' | 'unverified' | 'unknown'; 
    message: string;
    dnsRecords?: any;
    recommendations?: string[];
  }> {
    try {
      if (!this.mailgun) {
        return {
          status: 'unknown',
          message: 'MailGun not initialized'
        };
      }

      const domainInfo = await this.mailgun.domains.get(this.domain);
      const status = domainInfo.state as 'verified' | 'unverified';
      
      if (status === 'verified') {
        return {
          status: 'verified',
          message: `✅ Domain ${this.domain} is verified and ready for professional email sending.`
        };
      } else {
        const recommendations = [
          '1. Log into your MailGun dashboard at https://app.mailgun.com',
          `2. Navigate to Sending > Domains > ${this.domain}`,
          '3. Copy the DNS records shown in the "DNS Records" tab',
          '4. Add these records to your domain registrar/DNS provider',
          '5. Wait for DNS propagation (up to 24 hours)',
          '6. Check verification status in MailGun dashboard'
        ];

        return {
          status: 'unverified',
          message: `⚠️ Domain ${this.domain} is unverified. Email sending restricted to 5 authorized recipients until verified.`,
          dnsRecords: domainInfo.receiving_dns_records || domainInfo.sending_dns_records,
          recommendations
        };
      }
    } catch (error) {
      return {
        status: 'unknown',
        message: `Could not check domain status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Add authorized recipient (for unverified domains)
  async addAuthorizedRecipient(email: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.mailgun) {
        throw new Error('MailGun not initialized');
      }

      // Note: This requires API access to authorized recipients endpoint
      // The actual implementation depends on MailGun's authorized recipients API
      console.log(`📝 To add authorized recipient: ${email}`);
      console.log(`1. Visit https://app.mailgun.com/app/sending/domains/${this.domain}/authorized-recipients`);
      console.log(`2. Click "Add Authorized Recipient"`);
      console.log(`3. Enter: ${email}`);
      console.log(`4. Click "Save"`);

      return {
        success: true,
        message: `Instructions logged for adding ${email} as authorized recipient. Check console output.`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to add authorized recipient: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get MailGun domain stats
  async getDomainStats(): Promise<any> {
    try {
      if (!this.mailgun) {
        throw new Error('MailGun not initialized');
      }

      const stats = await this.mailgun.stats.getDomain(this.domain);
      return stats;
    } catch (error) {
      console.error('Error getting MailGun domain stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const mailgunService = new MailgunService();