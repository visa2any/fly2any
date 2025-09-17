import { sql } from '@vercel/postgres';
import { mailgunService } from '@/lib/mailgun-service';
import { EmailMarketingDatabase } from '@/lib/email-marketing-database';

// Database-based Email Queue Service
// Can be enhanced with Redis later for better performance
export class EmailQueueService {

  // Add email to queue
  static async addToQueue(emailData: {
    campaignId?: string;
    contactId?: string;
    emailAddress: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    fromEmail: string;
    fromName?: string;
    replyTo?: string;
    priority?: number;
    scheduledAt?: Date;
    trackingData?: any;
  }) {
    try {
      const result = await sql`
        INSERT INTO email_queue (
          campaign_id, contact_id, email_address, subject,
          html_content, text_content, from_email, from_name,
          reply_to, priority, scheduled_at, tracking_data
        ) VALUES (
          ${emailData.campaignId || null},
          ${emailData.contactId || null},
          ${emailData.emailAddress},
          ${emailData.subject},
          ${emailData.htmlContent},
          ${emailData.textContent || null},
          ${emailData.fromEmail},
          ${emailData.fromName || null},
          ${emailData.replyTo || null},
          ${emailData.priority || 1},
          ${emailData.scheduledAt?.toISOString() || new Date().toISOString()},
          ${JSON.stringify(emailData.trackingData || {})}
        )
        RETURNING id
      `;

      console.log(`📧 Email queued for ${emailData.emailAddress}`);
      return { success: true, queueId: result.rows[0].id };
    } catch (error) {
      console.error('Error adding email to queue:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Process queue - send pending emails
  static async processQueue(batchSize: number = 10) {
    try {
      // Get pending emails ordered by priority and scheduled time
      const result = await sql`
        SELECT * FROM email_queue
        WHERE status = 'pending'
        AND scheduled_at <= NOW()
        AND attempts < max_attempts
        ORDER BY priority DESC, scheduled_at ASC
        LIMIT ${batchSize}
      `;

      const emailsToProcess = result.rows;
      console.log(`📤 Processing ${emailsToProcess.length} emails from queue`);

      const processed = [];
      const failed = [];

      for (const email of emailsToProcess) {
        try {
          // Mark as processing
          await this.updateEmailStatus(email.id, 'processing');

          // Send email via MailGun
          const sendResult = await mailgunService.sendSingleEmail({
            to: email.email_address,
            from: email.from_email,
            fromName: email.from_name,
            subject: email.subject,
            html: email.html_content,
            text: email.text_content,
            campaignId: email.campaign_id,
            contactId: email.contact_id,
            trackingEnabled: true
          });

          if (sendResult.success) {
            // Mark as sent
            await sql`
              UPDATE email_queue
              SET status = 'sent',
                  sent_at = NOW(),
                  mailgun_message_id = ${sendResult.messageId},
                  updated_at = NOW()
              WHERE id = ${email.id}
            `;

            // Record email event
            if (email.contact_id && email.campaign_id) {
              await EmailMarketingDatabase.recordEmailEvent({
                contact_id: email.contact_id,
                campaign_id: email.campaign_id,
                event_type: 'sent',
                event_data: { messageId: sendResult.messageId },
                mailgun_message_id: sendResult.messageId
              });
            }

            processed.push(email.id);
            console.log(`✅ Email sent to ${email.email_address}`);
          } else {
            throw new Error(sendResult.error || 'Send failed');
          }
        } catch (sendError) {
          console.error(`❌ Failed to send email to ${email.email_address}:`, sendError);

          // Increment attempts and mark as failed if max attempts reached
          await sql`
            UPDATE email_queue
            SET attempts = attempts + 1,
                error_message = ${sendError instanceof Error ? sendError.message : 'Unknown error'},
                status = CASE
                  WHEN attempts + 1 >= max_attempts THEN 'failed'
                  ELSE 'pending'
                END,
                updated_at = NOW()
            WHERE id = ${email.id}
          `;

          failed.push({ id: email.id, error: sendError instanceof Error ? sendError.message : 'Unknown error' });
        }
      }

      return {
        success: true,
        processed: processed.length,
        failed: failed.length,
        details: { processed, failed }
      };
    } catch (error) {
      console.error('Error processing email queue:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Update email status
  private static async updateEmailStatus(emailId: string, status: string) {
    await sql`
      UPDATE email_queue
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${emailId}
    `;
  }

  // Get queue statistics
  static async getQueueStats() {
    try {
      const result = await sql`
        SELECT
          status,
          COUNT(*) as count
        FROM email_queue
        GROUP BY status
      `;

      const stats: any = {
        pending: 0,
        processing: 0,
        sent: 0,
        failed: 0
      };

      result.rows.forEach(row => {
        stats[row.status] = parseInt(row.count);
      });

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send bulk campaign to queue
  static async queueBulkCampaign(campaignData: {
    campaignId: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    fromEmail: string;
    fromName: string;
    contacts: Array<{ id: string; email: string; firstName?: string; lastName?: string; }>;
    priority?: number;
    scheduledAt?: Date;
  }) {
    try {
      console.log(`📧 Queuing bulk campaign for ${campaignData.contacts.length} contacts`);

      let queued = 0;
      const errors = [];

      for (const contact of campaignData.contacts) {
        // Personalize content if needed
        let personalizedHtml = campaignData.htmlContent;
        let personalizedSubject = campaignData.subject;

        // Basic personalization
        if (contact.firstName) {
          personalizedHtml = personalizedHtml.replace(/\{\{first_name\}\}/g, contact.firstName);
          personalizedSubject = personalizedSubject.replace(/\{\{first_name\}\}/g, contact.firstName);
        }
        if (contact.lastName) {
          personalizedHtml = personalizedHtml.replace(/\{\{last_name\}\}/g, contact.lastName);
        }

        const queueResult = await this.addToQueue({
          campaignId: campaignData.campaignId,
          contactId: contact.id,
          emailAddress: contact.email,
          subject: personalizedSubject,
          htmlContent: personalizedHtml,
          textContent: campaignData.textContent,
          fromEmail: campaignData.fromEmail,
          fromName: campaignData.fromName,
          priority: campaignData.priority || 1,
          scheduledAt: campaignData.scheduledAt,
          trackingData: {
            campaignId: campaignData.campaignId,
            contactId: contact.id
          }
        });

        if (queueResult.success) {
          queued++;
        } else {
          errors.push({ contact: contact.email, error: queueResult.error });
        }
      }

      console.log(`📤 Campaign queued: ${queued} emails, ${errors.length} errors`);

      return {
        success: true,
        queued,
        errors: errors.length,
        errorDetails: errors
      };
    } catch (error) {
      console.error('Error queuing bulk campaign:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Clear failed emails from queue
  static async clearFailedEmails() {
    try {
      const result = await sql`
        DELETE FROM email_queue
        WHERE status = 'failed'
        RETURNING id
      `;

      return { success: true, cleared: result.rowCount };
    } catch (error) {
      console.error('Error clearing failed emails:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Retry failed emails
  static async retryFailedEmails() {
    try {
      const result = await sql`
        UPDATE email_queue
        SET status = 'pending',
            attempts = 0,
            error_message = NULL,
            updated_at = NOW()
        WHERE status = 'failed'
        RETURNING id
      `;

      return { success: true, retried: result.rowCount };
    } catch (error) {
      console.error('Error retrying failed emails:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}