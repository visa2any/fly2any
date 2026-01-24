/**
 * Admin Alert System
 * Fire-and-forget, non-blocking alert delivery for critical errors
 */

export interface AlertPayload {
  errorName: string;
  summary: string;
  page: string;
  agentId?: string;
  quoteId?: string;
  environment: 'production' | 'staging' | 'development';
  timestamp: number;
  metadata?: Record<string, unknown> | { [key: string]: unknown };
  severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';
}

export interface AlertChannel {
  name: string;
  enabled: boolean;
  send: (payload: AlertPayload) => Promise<void>;
}

// ============================================
// TELEGRAM ALERT CHANNEL
// ============================================
class TelegramAlertChannel implements AlertChannel {
  name = 'telegram';
  enabled = false;

  constructor() {
    // Check if Telegram is configured
    this.enabled = !!process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN && !!process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  }

  async send(payload: AlertPayload): Promise<void> {
    if (!this.enabled) return;

    try {
      const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

      if (!botToken || !chatId) return;

      const message = this.formatMessage(payload);

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        console.warn('[TelegramAlert] Failed to send alert:', await response.text());
      }
    } catch (error) {
      // Fire-and-forget - never throw
      console.warn('[TelegramAlert] Error sending alert:', error);
    }
  }

  private formatMessage(payload: AlertPayload): string {
    const emoji = payload.severity === 'CRITICAL' ? '🚨' : '⚠️';
    const envEmoji = payload.environment === 'production' ? '🔴' : '🟡';
    
    let message = `${emoji} <b>${payload.errorName}</b>\n\n`;
    message += `${envEmoji} <b>Environment:</b> ${payload.environment}\n`;
    message += `<b>Page:</b> ${payload.page}\n`;
    message += `<b>Time:</b> ${new Date(payload.timestamp).toISOString()}\n`;
    
    if (payload.agentId) message += `<b>Agent ID:</b> ${payload.agentId}\n`;
    if (payload.quoteId) message += `<b>Quote ID:</b> ${payload.quoteId}\n`;
    
    message += `\n<b>Summary:</b>\n${payload.summary}\n`;
    
    if (payload.metadata && Object.keys(payload.metadata).length > 0) {
      message += `\n<b>Metadata:</b>\n`;
      Object.entries(payload.metadata).forEach(([key, value]) => {
        message += `<code>${key}:</code> ${JSON.stringify(value)}\n`;
      });
    }
    
    return message;
  }
}

// ============================================
// CONSOLE ALERT CHANNEL (DEV/STAGING)
// ============================================
class ConsoleAlertChannel implements AlertChannel {
  name = 'console';
  enabled = true;

  async send(payload: AlertPayload): Promise<void> {
    if (payload.environment === 'production') return; // Don't spam console in prod

    const emoji = payload.severity === 'CRITICAL' ? '🚨' : '⚠️';
    
    console.group(`${emoji} ${payload.errorName}`);
    console.error('Summary:', payload.summary);
    console.error('Environment:', payload.environment);
    console.error('Page:', payload.page);
    console.error('Time:', new Date(payload.timestamp).toISOString());
    if (payload.agentId) console.error('Agent ID:', payload.agentId);
    if (payload.quoteId) console.error('Quote ID:', payload.quoteId);
    if (payload.metadata) console.error('Metadata:', payload.metadata);
    console.groupEnd();
  }
}

// ============================================
// WEBHOOK ALERT CHANNEL (SECONDARY)
// ============================================
class WebhookAlertChannel implements AlertChannel {
  name = 'webhook';
  enabled = false;

  constructor() {
    this.enabled = !!process.env.NEXT_PUBLIC_ALERT_WEBHOOK_URL;
  }

  async send(payload: AlertPayload): Promise<void> {
    if (!this.enabled) return;

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_ALERT_WEBHOOK_URL;
      if (!webhookUrl) return;

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      // Fire-and-forget - never throw
      console.warn('[WebhookAlert] Error sending alert:', error);
    }
  }
}

// ============================================
// ALERT MANAGER
// ============================================
class AlertManager {
  private channels: AlertChannel[] = [];
  private static instance: AlertManager;

  private constructor() {
    this.channels = [
      new ConsoleAlertChannel(),
      new TelegramAlertChannel(),
      new WebhookAlertChannel(),
    ];
  }

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  /**
   * Send alert to all enabled channels
   * Fire-and-forget - never blocks or throws
   */
  async sendAlert(payload: AlertPayload): Promise<void> {
    // Run all sends in parallel, don't await any
    const promises = this.channels
      .filter((channel) => channel.enabled)
      .map((channel) => 
        channel.send(payload).catch((error) => {
          console.warn(`[AlertManager] ${channel.name} failed:`, error);
        })
      );

    // Fire and forget - don't await
    Promise.all(promises).catch(() => {
      // Suppress all errors
    });
  }

  /**
   * Check if any alerts are enabled for critical errors
   */
  isCriticalAlertingEnabled(): boolean {
    return this.channels.some(
      (channel) => channel.enabled && (channel.name === 'telegram' || channel.name === 'webhook')
    );
  }
}

// ============================================
// PUBLIC API
// ============================================
export const alertManager = AlertManager.getInstance();

/**
 * Send critical alert (non-blocking, fire-and-forget)
 */
export async function sendCriticalAlert(payload: AlertPayload): Promise<void> {
  await alertManager.sendAlert(payload);
}

/**
 * Check if critical alerting is configured
 */
export function isAlertingConfigured(): boolean {
  return alertManager.isCriticalAlertingEnabled();
}