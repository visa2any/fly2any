/**
 * UNIFIED RESEND EMAIL CLIENT
 *
 * Drop-in replacement for Mailgun. Single source of truth for all email sending.
 * Used by EmailService (marketing/transactional) and NotificationService (booking lifecycle).
 *
 * Features:
 * - Resend API integration with retry logic
 * - Supports both production and development modes
 * - Force-send option for testing in development
 * - Tag support for analytics
 *
 * MIGRATION NOTE: Exports `mailgunClient` and `MAILGUN_CONFIG` for backward
 * compatibility. All existing imports continue to work unchanged.
 *
 * @version 2.0.0 - Migrated from Mailgun to Resend
 */

import { Resend } from 'resend';

// ===================================
// TYPES (unchanged interface)
// ===================================

export interface MailgunEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: string[];
  forceSend?: boolean; // Bypass production check for testing
}

export interface MailgunSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

// ===================================
// CONFIGURATION
// ===================================

const CONFIG = {
  apiKey: process.env.RESEND_API_KEY?.trim(),
  // Prioritize Resend-specific env var, fallback to generic one
  fromEmail: (process.env.EMAIL_FROM_RESEND || process.env.EMAIL_FROM || 'Fly2Any <fly2any.travel@gmail.com>').trim(),
  replyToEmail: (process.env.EMAIL_REPLY_TO || 'fly2any.travel@gmail.com').trim(),
  domain: (process.env.EMAIL_DOMAIN || 'gmail.com').trim(),
  isProduction: process.env.NODE_ENV === 'production',
};

// Initialize Resend client
const resend = CONFIG.apiKey ? new Resend(CONFIG.apiKey) : null;

// ===================================
// RESEND CLIENT CLASS
// ===================================

class ResendClient {
  private retryAttempts = 3;
  private retryDelay = 1000;

  /**
   * Send an email via Resend
   */
  async send(options: MailgunEmailOptions): Promise<MailgunSendResult> {
    const shouldActuallySend = CONFIG.isProduction || options.forceSend;

    // Development mode without force: simulate sending
    if (!shouldActuallySend) {
      console.log('📧 [RESEND] Simulated email (dev mode):', {
        to: options.to,
        subject: options.subject,
        from: options.from || CONFIG.fromEmail,
        tags: options.tags,
        tip: 'Use forceSend: true to send real emails in development',
      });
      return { success: true, simulated: true };
    }

    // Check for API key
    if (!CONFIG.apiKey || !resend) {
      console.error('❌ [RESEND] API key not configured');
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    // Attempt to send with retries
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await this.sendViaApi(options);
        return result;
      } catch (error: any) {
        console.warn(`⚠️ [RESEND] Attempt ${attempt}/${this.retryAttempts} failed:`, error.message);

        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        } else {
          return { success: false, error: error.message };
        }
      }
    }

    return { success: false, error: 'Max retry attempts exceeded' };
  }

  /**
   * Internal: Send via Resend API
   */
  private async sendViaApi(options: MailgunEmailOptions): Promise<MailgunSendResult> {
    if (!resend) {
      throw new Error('Resend client not initialized');
    }

    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

    const { data, error } = await resend.emails.send({
      from: options.from || CONFIG.fromEmail,
      to: toAddresses,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || CONFIG.replyToEmail,
      tags: options.tags?.map(tag => ({ name: 'category', value: tag })),
      headers: {
        'X-Mailer': 'Fly2Any Mailer v3.0',
      },
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log('✅ [RESEND] Email sent:', data?.id);

    return {
      success: true,
      messageId: data?.id,
      simulated: false,
    };
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if Resend is properly configured
   */
  isConfigured(): boolean {
    return !!CONFIG.apiKey;
  }

  /**
   * Get current configuration (for debugging)
   */
  getConfig() {
    return {
      domain: CONFIG.domain,
      fromEmail: CONFIG.fromEmail,
      isProduction: CONFIG.isProduction,
      hasApiKey: !!CONFIG.apiKey,
    };
  }
}

// Export with SAME NAMES for backward compatibility (zero import changes needed)
export const mailgunClient = new ResendClient();

export const MAILGUN_CONFIG = {
  fromEmail: CONFIG.fromEmail,
  replyToEmail: CONFIG.replyToEmail,
  domain: CONFIG.domain,
  isProduction: CONFIG.isProduction,
};
