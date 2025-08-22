/**
 * 📱 SMS SERVICE INTEGRATION
 * Multi-provider SMS service with fallback support
 */

import { prisma } from '@/lib/database/prisma';

export interface SMSData {
  to: string;
  message: string;
  bookingId?: string;
  template?: string;
  templateData?: Record<string, any>;
}

export interface SMSProvider {
  name: string;
  send(smsData: SMSData): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

class TwilioProvider implements SMSProvider {
  name = 'TWILIO';

  async send(smsData: SMSData) {
    try {
      let twilio;
      try {
        twilio = require('twilio');
      } catch (e) {
        console.warn('⚠️ Twilio not installed - SMS functionality disabled');
        return { success: false, error: 'Twilio dependency not available' };
      }
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      const message = await client.messages.create({
        body: smsData.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: smsData.to
      });

      return {
        success: true,
        messageId: message.sid
      };
    } catch (error: any) {
      console.error('❌ Twilio error:', error);
      return {
        success: false,
        error: error.message || 'Twilio send failed'
      };
    }
  }
}

class AWSSNSProvider implements SMSProvider {
  name = 'AWS_SNS';

  async send(smsData: SMSData) {
    try {
      let AWS;
      try {
        AWS = require('aws-sdk');
      } catch (e) {
        console.warn('⚠️ AWS SDK not installed - SMS functionality disabled');
        return { success: false, error: 'AWS SDK dependency not available' };
      }
      const sns = new AWS.SNS({
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });

      const params = {
        Message: smsData.message,
        PhoneNumber: smsData.to,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          }
        }
      };

      const result = await sns.publish(params).promise();

      return {
        success: true,
        messageId: result.MessageId
      };
    } catch (error: any) {
      console.error('❌ AWS SNS error:', error);
      return {
        success: false,
        error: error.message || 'AWS SNS send failed'
      };
    }
  }
}

export class SMSService {
  private providers: SMSProvider[] = [];

  constructor() {
    // Initialize providers based on environment variables
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.providers.push(new TwilioProvider());
    }
    
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.providers.push(new AWSSNSProvider());
    }

    if (this.providers.length === 0) {
      console.warn('⚠️ No SMS providers configured. SMS messages will be logged only.');
    }
  }

  /**
   * Send SMS with automatic fallback between providers
   */
  async sendSMS(smsData: SMSData): Promise<{ success: boolean; messageId?: string; provider?: string; error?: string }> {
    console.log('📱 Sending SMS to:', this.maskPhoneNumber(smsData.to));

    // Format phone number
    const formattedPhone = this.formatPhoneNumber(smsData.to);
    if (!formattedPhone) {
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }

    // Log the SMS attempt
    let smsLogId: string | undefined;
    try {
      const smsLog = await prisma.sMSLog.create({
        data: {
          to: formattedPhone,
          message: smsData.message,
          service: 'PENDING',
          status: 'PENDING',
          bookingId: smsData.bookingId
        }
      });
      smsLogId = smsLog.id;
    } catch (dbError) {
      console.warn('⚠️ Failed to log SMS to database:', (dbError as Error).message);
    }

    // If no providers configured, just log
    if (this.providers.length === 0) {
      console.log('📱 SMS WOULD BE SENT (No providers configured):', {
        to: this.maskPhoneNumber(formattedPhone),
        message: smsData.message.substring(0, 100) + '...',
        length: smsData.message.length
      });

      if (smsLogId) {
        try {
          await prisma.sMSLog.update({
            where: { id: smsLogId },
            data: {
              status: 'SENT',
              service: 'MOCK',
              sentAt: new Date()
            }
          });
        } catch (dbError) {
          console.warn('⚠️ Failed to update SMS log:', (dbError as Error).message);
        }
      }

      return {
        success: true,
        messageId: `mock-${Date.now()}`,
        provider: 'MOCK'
      };
    }

    // Try each provider in order
    const smsDataWithFormattedPhone = { ...smsData, to: formattedPhone };
    
    for (const provider of this.providers) {
      try {
        console.log(`📱 Attempting to send via ${provider.name}...`);
        const result = await provider.send(smsDataWithFormattedPhone);

        if (result.success) {
          console.log(`✅ SMS sent successfully via ${provider.name}`);

          // Update SMS log
          if (smsLogId) {
            try {
              await prisma.sMSLog.update({
                where: { id: smsLogId },
                data: {
                  status: 'SENT',
                  service: provider.name,
                  sentAt: new Date()
                }
              });
            } catch (dbError) {
              console.warn('⚠️ Failed to update SMS log:', (dbError as Error).message);
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
    console.error('❌ All SMS providers failed');

    if (smsLogId) {
      try {
        await prisma.sMSLog.update({
          where: { id: smsLogId },
          data: {
            status: 'FAILED'
          }
        });
      } catch (dbError) {
        console.warn('⚠️ Failed to update SMS log:', (dbError as Error).message);
      }
    }

    return {
      success: false,
      error: 'All SMS providers failed'
    };
  }

  /**
   * Send templated SMS
   */
  async sendTemplatedSMS(
    template: string,
    to: string,
    templateData: Record<string, any>,
    bookingId?: string
  ): Promise<{ success: boolean; messageId?: string; provider?: string; error?: string }> {
    try {
      const message = this.generateSMSMessage(template, templateData);
      
      return await this.sendSMS({
        to,
        message,
        template,
        templateData,
        bookingId
      });
    } catch (error) {
      console.error('❌ Templated SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Template processing failed'
      };
    }
  }

  /**
   * Generate SMS message from template
   */
  private generateSMSMessage(template: string, data: Record<string, any>): string {
    switch (template) {
      case 'booking-confirmation':
        return `✈️ Flight Confirmed! Booking: ${data.bookingReference}. ${data.route} on ${data.date}. Check email for details. Fly2Any`;

      case 'checkin-reminder':
        return `⏰ Check-in opens in 1 hour for flight ${data.flightNumber} (${data.route}). Booking: ${data.bookingReference}. Fly2Any`;

      case 'flight-delay':
        return `⚠️ Flight ${data.flightNumber} delayed. New departure: ${data.newTime}. Booking: ${data.bookingReference}. Check app for updates. Fly2Any`;

      case 'cancellation-confirmation':
        return `❌ Booking ${data.bookingReference} cancelled. Refund: ${data.refundAmount}. Processing 5-10 days. Questions? support@fly2any.com Fly2Any`;

      case 'boarding-reminder':
        return `🛫 Boarding soon! Flight ${data.flightNumber} Gate ${data.gate || 'TBD'}. Arrive 30min early. Booking: ${data.bookingReference}. Fly2Any`;

      default:
        // Fallback generic message
        return `Flight Update - Booking: ${data.bookingReference || 'N/A'}. Check your email for details. Fly2Any`;
    }
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.length === 10) {
      // US number without country code
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      // US number with country code
      return `+${digits}`;
    } else if (digits.length >= 10 && digits.length <= 15) {
      // International number
      return `+${digits}`;
    }
    
    return null; // Invalid format
  }

  /**
   * Mask phone number for logging
   */
  private maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) return phone;
    return phone.substring(0, 3) + '***' + phone.substring(phone.length - 2);
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone: string): boolean {
    return this.formatPhoneNumber(phone) !== null;
  }
}

// Export singleton instance
export const smsService = new SMSService();