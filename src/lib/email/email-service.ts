/**
 * 📧 EMAIL SERVICE INTEGRATION
 * Multi-provider email service with fallback support
 */

import { prisma } from '@/lib/database/prisma';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailData {
  to: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  template?: string;
  templateData?: Record<string, any>;
  bookingId?: string;
}

export interface EmailProvider {
  name: string;
  send(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

class SendGridProvider implements EmailProvider {
  name = 'SENDGRID';

  async send(emailData: EmailData) {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: emailData.to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@fly2any.com',
        subject: emailData.subject,
        text: emailData.textContent,
        html: emailData.htmlContent,
      };

      const response = await sgMail.send(msg);
      return {
        success: true,
        messageId: response[0]?.headers?.['x-message-id']
      };
    } catch (error: any) {
      console.error('❌ SendGrid error:', error);
      return {
        success: false,
        error: error.message || 'SendGrid send failed'
      };
    }
  }
}

class MailgunProvider implements EmailProvider {
  name = 'MAILGUN';

  async send(emailData: EmailData) {
    try {
      const formData = require('form-data');
      const Mailgun = require('mailgun.js');

      const mailgun = new Mailgun(formData);
      const mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY
      });

      const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: `Fly2Any <noreply@${process.env.MAILGUN_DOMAIN}>`,
        to: [emailData.to],
        subject: emailData.subject,
        text: emailData.textContent,
        html: emailData.htmlContent,
      });

      return {
        success: true,
        messageId: response.id
      };
    } catch (error: any) {
      console.error('❌ Mailgun error:', error);
      return {
        success: false,
        error: error.message || 'Mailgun send failed'
      };
    }
  }
}

class SMTPProvider implements EmailProvider {
  name = 'SMTP';

  async send(emailData: EmailData) {
    try {
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@fly2any.com',
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.textContent,
        html: emailData.htmlContent,
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error: any) {
      console.error('❌ SMTP error:', error);
      return {
        success: false,
        error: error.message || 'SMTP send failed'
      };
    }
  }
}

export class EmailService {
  private providers: EmailProvider[] = [];

  constructor() {
    // Initialize providers based on environment variables
    if (process.env.SENDGRID_API_KEY) {
      this.providers.push(new SendGridProvider());
    }
    
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      this.providers.push(new MailgunProvider());
    }

    if (process.env.SMTP_HOST) {
      this.providers.push(new SMTPProvider());
    }

    if (this.providers.length === 0) {
      console.warn('⚠️ No email providers configured. Emails will be logged only.');
    }
  }

  /**
   * Send email with automatic fallback between providers
   */
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; provider?: string; error?: string }> {
    console.log('📧 Sending email to:', emailData.to);

    // Log the email attempt
    let emailLogId: string | undefined;
    try {
      const emailLog = await prisma.emailLog.create({
        data: {
          to: emailData.to,
          subject: emailData.subject,
          template: emailData.template || 'custom',
          htmlContent: emailData.htmlContent,
          textContent: emailData.textContent,
          bookingId: emailData.bookingId,
          status: 'PENDING'
        }
      });
      emailLogId = emailLog.id;
    } catch (dbError) {
      console.warn('⚠️ Failed to log email to database:', (dbError as Error).message);
    }

    // If no providers configured, just log
    if (this.providers.length === 0) {
      console.log('📧 EMAIL WOULD BE SENT (No providers configured):', {
        to: emailData.to,
        subject: emailData.subject,
        htmlLength: emailData.htmlContent?.length,
        textLength: emailData.textContent?.length
      });

      if (emailLogId) {
        try {
          await prisma.emailLog.update({
            where: { id: emailLogId },
            data: {
              status: 'SENT',
              emailProvider: 'MOCK',
              providerMessageId: `mock-${Date.now()}`,
              sentAt: new Date()
            }
          });
        } catch (dbError) {
          console.warn('⚠️ Failed to update email log:', (dbError as Error).message);
        }
      }

      return {
        success: true,
        messageId: `mock-${Date.now()}`,
        provider: 'MOCK'
      };
    }

    // Try each provider in order
    for (const provider of this.providers) {
      try {
        console.log(`📧 Attempting to send via ${provider.name}...`);
        const result = await provider.send(emailData);

        if (result.success) {
          console.log(`✅ Email sent successfully via ${provider.name}`);

          // Update email log
          if (emailLogId) {
            try {
              await prisma.emailLog.update({
                where: { id: emailLogId },
                data: {
                  status: 'SENT',
                  emailProvider: provider.name,
                  providerMessageId: result.messageId,
                  sentAt: new Date()
                }
              });
            } catch (dbError) {
              console.warn('⚠️ Failed to update email log:', (dbError as Error).message);
            }
          }

          return {
            success: true,
            messageId: result.messageId,
            provider: provider.name
          };
        } else {
          console.warn(`⚠️ ${provider.name} failed:`, result.error);
        }
      } catch (error) {
        console.error(`❌ ${provider.name} provider error:`, error);
      }
    }

    // All providers failed
    console.error('❌ All email providers failed');

    if (emailLogId) {
      try {
        await prisma.emailLog.update({
          where: { id: emailLogId },
          data: {
            status: 'FAILED'
          }
        });
      } catch (dbError) {
        console.warn('⚠️ Failed to update email log:', (dbError as Error).message);
      }
    }

    return {
      success: false,
      error: 'All email providers failed'
    };
  }

  /**
   * Send templated email
   */
  async sendTemplatedEmail(
    template: string,
    to: string,
    templateData: Record<string, any>,
    bookingId?: string
  ): Promise<{ success: boolean; messageId?: string; provider?: string; error?: string }> {
    try {
      const emailTemplate = await this.getEmailTemplate(template, templateData);
      
      return await this.sendEmail({
        to,
        subject: emailTemplate.subject,
        htmlContent: emailTemplate.htmlContent,
        textContent: emailTemplate.textContent,
        template,
        templateData,
        bookingId
      });
    } catch (error) {
      console.error('❌ Templated email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Template processing failed'
      };
    }
  }

  /**
   * Get and process email template
   */
  private async getEmailTemplate(templateName: string, data: Record<string, any>): Promise<EmailTemplate> {
    // Import the specific template
    try {
      const template = await import(`./templates/${templateName}`);
      return template.default(data);
    } catch (error) {
      console.error(`❌ Template '${templateName}' not found, using fallback`);
      
      // Fallback generic template
      return {
        subject: `Flight Booking Update - ${data.bookingReference || ''}`,
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #3B82F6;">✈️ Fly2Any</h1>
                <h2>Flight Booking Update</h2>
                <p>Dear ${data.passengerName || 'Valued Customer'},</p>
                <p>This is an update regarding your booking reference: <strong>${data.bookingReference || 'N/A'}</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
                <p>If you have any questions, please contact our support team.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">
                  Best regards,<br>
                  The Fly2Any Team<br>
                  <a href="mailto:support@fly2any.com">support@fly2any.com</a>
                </p>
              </div>
            </body>
          </html>
        `,
        textContent: `
Flight Booking Update

Dear ${data.passengerName || 'Valued Customer'},

This is an update regarding your booking reference: ${data.bookingReference || 'N/A'}

Details:
${JSON.stringify(data, null, 2)}

If you have any questions, please contact our support team.

Best regards,
The Fly2Any Team
support@fly2any.com
        `
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();