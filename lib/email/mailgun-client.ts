/**
 * UNIFIED MAILGUN EMAIL CLIENT
 *
 * Single source of truth for all email sending in the application.
 * Used by EmailService (marketing/transactional) and NotificationService (booking lifecycle).
 *
 * Features:
 * - Mailgun API integration with retry logic
 * - Supports both production and development modes
 * - Force-send option for testing in development
 * - Tracking enabled (opens, clicks)
 * - Tag support for analytics
 *
 * @version 1.0.0
 */

// ===================================
// TYPES
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
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN || 'mg.fly2any.com',
  fromEmail: process.env.EMAIL_FROM || 'Fly2Any <support@fly2any.com>',
  isProduction: process.env.NODE_ENV === 'production',
  // Mailgun API endpoint (US region - use api.eu.mailgun.net for EU)
  get apiUrl() {
    return `https://api.mailgun.net/v3/${this.domain}/messages`;
  },
};

// ===================================
// MAILGUN CLIENT CLASS
// ===================================

class MailgunClient {
  private retryAttempts = 3;
  private retryDelay = 1000;

  /**
   * Send an email via Mailgun
   */
  async send(options: MailgunEmailOptions): Promise<MailgunSendResult> {
    const shouldActuallySend = CONFIG.isProduction || options.forceSend;

    // Development mode without force: simulate sending
    if (!shouldActuallySend) {
      console.log('📧 [MAILGUN] Simulated email (dev mode):', {
        to: options.to,
        subject: options.subject,
        from: options.from || CONFIG.fromEmail,
        tags: options.tags,
        tip: 'Use forceSend: true to send real emails in development',
      });
      return { success: true, simulated: true };
    }

    // Check for API key
    if (!CONFIG.apiKey) {
      console.error('❌ [MAILGUN] API key not configured');
      return { success: false, error: 'MAILGUN_API_KEY not configured' };
    }

    // Attempt to send with retries
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await this.sendViaApi(options);
        return result;
      } catch (error: any) {
        console.warn(`⚠️ [MAILGUN] Attempt ${attempt}/${this.retryAttempts} failed:`, error.message);

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
   * Internal: Send via Mailgun API
   */
  private async sendViaApi(options: MailgunEmailOptions): Promise<MailgunSendResult> {
    const formData = new FormData();
    formData.append('from', options.from || CONFIG.fromEmail);
    formData.append('to', Array.isArray(options.to) ? options.to.join(',') : options.to);
    formData.append('subject', options.subject);
    formData.append('html', options.html);

    if (options.text) {
      formData.append('text', options.text);
    }

    if (options.replyTo) {
      formData.append('h:Reply-To', options.replyTo);
    }

    // Add tags for Mailgun analytics
    if (options.tags) {
      options.tags.forEach(tag => formData.append('o:tag', tag));
    }

    // Enable tracking
    formData.append('o:tracking', 'yes');
    formData.append('o:tracking-clicks', 'yes');
    formData.append('o:tracking-opens', 'yes');

    const response = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${CONFIG.apiKey}`).toString('base64')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [MAILGUN] Email sent:', result.id);

    return {
      success: true,
      messageId: result.id,
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
   * Check if Mailgun is properly configured
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

// Export singleton instance
export const mailgunClient = new MailgunClient();

// Export config for use by other services
export const MAILGUN_CONFIG = {
  fromEmail: CONFIG.fromEmail,
  domain: CONFIG.domain,
  isProduction: CONFIG.isProduction,
};
