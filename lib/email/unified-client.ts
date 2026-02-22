/**
 * UNIFIED EMAIL CLIENT (Resend Only)
 * 
 * Provides a consistent interface for the entire application.
 * Strictly using Resend as the sole email provider.
 */

import { Resend } from 'resend';

// ===================================
// TYPES
// ===================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: string[];
  forceSend?: boolean; // Bypass simulation in dev
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: 'resend' | 'simulated';
}

// ===================================
// CONFIGURATION
// ===================================

const CONFIG = {
  resendApiKey: process.env.RESEND_API_KEY?.trim(),
  fromEmail: process.env.EMAIL_FROM || 'Fly2Any <onboarding@resend.dev>',
  replyToEmail: process.env.EMAIL_REPLY_TO || 'fly2any.travel@gmail.com',
  isProduction: process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production',
};

// Initialize Resend client
const resend = CONFIG.resendApiKey ? new Resend(CONFIG.resendApiKey) : null;

// ===================================
// UNIFIED CLIENT CLASS
// ===================================

class UnifiedClient {
  /**
   * Send an email via Resend
   */
  async send(options: EmailOptions): Promise<SendResult> {
    const shouldActuallySend = CONFIG.isProduction || options.forceSend;
    const from = options.from || CONFIG.fromEmail;
    const to = Array.isArray(options.to) ? options.to : [options.to];

    // Check for Resend
    if (resend && CONFIG.resendApiKey) {
      if (!shouldActuallySend) {
        return this.simulate('resend', from, to, options.subject);
      }
      return this.sendViaResend(options, from, to);
    }

    // Fallback to simulation/error
    console.warn('⚠️ [UnifiedClient] Resend API key is missing');
    return {
      success: true,
      provider: 'simulated',
      error: 'Resend API key missing',
    };
  }

  /**
   * Internal: Send via Resend
   */
  private async sendViaResend(options: EmailOptions, from: string, to: string[]): Promise<SendResult> {
    try {
      if (!resend) throw new Error('Resend not initialized');

      // format tags for Resend
      const formattedTags = options.tags?.map((tag, index) => ({
        name: `category_${index}`,
        value: tag.substring(0, 255)
      })) || [];

      // Ensure we don't use a gmail 'from' address (Resend restriction)
      let finalFrom = from;
      if (finalFrom.toLowerCase().includes('gmail.com') || finalFrom.toLowerCase().includes('yahoo.com')) {
        finalFrom = 'onboarding@resend.dev';
      }

      const sendEmail = async (fromAddress: string) => {
        return await resend.emails.send({
          from: fromAddress,
          to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          replyTo: options.replyTo || CONFIG.replyToEmail,
          tags: formattedTags,
        });
      };

      let { data, error } = await sendEmail(finalFrom);

      // Automatic fallback for unverified domains
      if (error && error.message.toLowerCase().includes('domain is not verified') && finalFrom !== 'onboarding@resend.dev') {
        console.warn(`⚠️ [UnifiedClient] Domain not verified for ${finalFrom}. Falling back to onboarding@resend.dev`);
        const fallbackResult = await sendEmail('onboarding@resend.dev');
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        messageId: data?.id,
        provider: 'resend',
      };
    } catch (error: any) {
      console.error('❌ [UnifiedClient] Resend failed:', error.message);
      return { success: false, error: error.message, provider: 'resend' };
    }
  }

  private simulate(provider: string, from: string, to: string[], subject: string): SendResult {
    console.log(`📧 [UnifiedClient] Simulated (${provider}) email:`, {
      from,
      to,
      subject,
    });
    return { success: true, provider: 'simulated' };
  }

  isProduction(): boolean {
    return CONFIG.isProduction;
  }
}

export const unifiedClient = new UnifiedClient();
