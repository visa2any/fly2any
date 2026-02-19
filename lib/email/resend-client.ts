/**
 * UNIFIED RESEND EMAIL CLIENT
 * 
 * Single source of truth for all email sending.
 * Used by EmailService (marketing/transactional) and NotificationService (booking lifecycle).
 * 
 * Features:
 * - Resend API integration with retry logic
 * - Supports both production and development modes
 * - Force-send option for testing in development
 * - Tag support for analytics
 */

import { Resend } from 'resend';

// ===================================
// TYPES
// ===================================

export interface ResendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: string[];
  forceSend?: boolean; // Bypass production check for testing
}

export interface ResendSendResult {
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
  // Resend DOES NOT allow sending from @gmail.com or @yahoo.com unless those domains are verified (which travelers won't have).
  // We MUST use onboarding@resend.dev or a verified domain.
  fromEmail: (() => {
    const envFrom = (process.env.EMAIL_FROM_RESEND || process.env.EMAIL_FROM || '').trim();
    // If it's a gmail/yahoo address and we are using Resend, it WILL fail.
    if (envFrom.toLowerCase().includes('gmail.com') || envFrom.toLowerCase().includes('yahoo.com')) {
      return 'onboarding@resend.dev';
    }
    return envFrom || 'onboarding@resend.dev';
  })(),
  replyToEmail: (process.env.EMAIL_REPLY_TO || 'fly2any.travel@gmail.com').trim(),
  isProduction: process.env.NODE_ENV === 'production',
};

// Initialize Resend client
const resend = CONFIG.apiKey ? new Resend(CONFIG.apiKey) : null;

// ===================================
// RESEND CLIENT CLASS
// ===================================

class ResendClient {
  private retryAttempts = 5; // Increased for free tier stability
  private retryDelay = 2000; // Increased delay for 2req/sec limit

  /**
   * Send an email via Resend
   */
  async send(options: ResendEmailOptions): Promise<ResendSendResult> {
    // Send in production, or when forceSend is set for testing
    const shouldActuallySend = CONFIG.isProduction || options.forceSend;

    if (!shouldActuallySend) {
      console.log('📧 [RESEND] Simulated email (dev mode):', {
        to: options.to,
        subject: options.subject,
        from: options.from || CONFIG.fromEmail,
      });
      return { success: true, simulated: true };
    }

    if (!CONFIG.apiKey || !resend) {
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    // Attempt to send with exponential backoff + jitter
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await this.sendViaApi(options);
      } catch (error: any) {
        const isRateLimit = error.message.toLowerCase().includes('too many requests');
        
        console.warn(`⚠️ [RESEND] Attempt ${attempt}/${this.retryAttempts} failed:`, error.message);

        if (attempt < this.retryAttempts) {
          // Add jitter to prevent "thundering herd" if many errors happen at once
          const jitter = Math.random() * 1000;
          const waitTime = (this.retryDelay * attempt) + jitter;
          await this.delay(waitTime);
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
  private async sendViaApi(options: ResendEmailOptions): Promise<ResendSendResult> {
    if (!resend) throw new Error('Resend client not initialized');

    const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

    // Ensure we don't use a gmail 'from' address even if passed in options
    let from = options.from || CONFIG.fromEmail;
    if (from.toLowerCase().includes('gmail.com') || from.toLowerCase().includes('yahoo.com')) {
      from = 'onboarding@resend.dev';
    }

    // Fix: Unique tag names to avoid Resend duplication error
    const formattedTags = options.tags?.map((tag, index) => ({
      name: `category_${index}`, 
      value: tag.substring(0, 255)
    })) || [];

    const { data, error } = await resend.emails.send({
      from,
      to: toAddresses,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || CONFIG.replyToEmail,
      tags: formattedTags,
      headers: {
        'X-Mailer': 'Fly2Any Mailer v4.1',
      },
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    return {
      success: true,
      messageId: data?.id,
      simulated: false,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isConfigured(): boolean {
    return !!CONFIG.apiKey;
  }
}

// Export the client
export const resendClient = new ResendClient();

// Configuration export
export const RESEND_CONFIG = {
  fromEmail: CONFIG.fromEmail,
  replyToEmail: CONFIG.replyToEmail,
  isProduction: CONFIG.isProduction,
};
