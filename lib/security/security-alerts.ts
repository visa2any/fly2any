/**
 * Security Alert System
 *
 * Sends email notifications when suspicious activity is detected.
 * Uses Resend for reliable email delivery.
 *
 * Alert Types:
 * - Bot detection
 * - Rate limit exceeded (high volume)
 * - Threat score exceeded
 * - Daily budget exceeded
 * - Honeypot triggered
 */

import { Resend } from 'resend';
import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Configuration
const CONFIG = {
  alertEmail: process.env.SECURITY_ALERT_EMAIL || process.env.ADMIN_EMAIL || 'alerts@fly2any.com',
  fromEmail: 'security@fly2any.com',
  // Throttle alerts to prevent spam (max 1 email per type per 5 minutes)
  throttleWindowMs: 5 * 60 * 1000,
  // Only alert in production
  enabledEnvs: ['production'],
  // Minimum threat score to alert (0-100)
  minThreatScoreAlert: 60,
  // Minimum blocks before alerting
  minBlocksBeforeAlert: 5,
};

export interface SecurityAlertData {
  type: 'bot_detected' | 'rate_limit' | 'threat_score' | 'daily_budget' | 'honeypot' | 'high_volume';
  ip: string;
  endpoint?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  threatScore?: number;
  reasons?: string[];
  requestCount?: number;
  threshold?: number;
  timestamp: string;
}

/**
 * Check if we should send an alert (throttling)
 */
async function shouldSendAlert(alertType: string, ip: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) {
    // No Redis = allow all alerts (may send duplicates)
    return true;
  }

  try {
    const throttleKey = `security_alert_throttle:${alertType}:${ip}`;
    const existing = await redis.get(throttleKey);

    if (existing) {
      return false; // Already sent recently
    }

    // Set throttle key
    await redis.set(throttleKey, '1', { ex: Math.floor(CONFIG.throttleWindowMs / 1000) });
    return true;
  } catch (error) {
    console.error('[SecurityAlerts] Redis error:', error);
    return true; // Allow on error
  }
}

/**
 * Track blocked requests to aggregate alerts
 */
async function trackBlockedRequest(ip: string, type: string): Promise<number> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) {
    return 1;
  }

  try {
    const key = `security_blocks:${ip}:${type}`;
    const count = await redis.incr(key);

    // Set 1 hour expiry on first block
    if (count === 1) {
      await redis.expire(key, 3600);
    }

    return count;
  } catch (error) {
    console.error('[SecurityAlerts] Track error:', error);
    return 1;
  }
}

/**
 * Format security alert email HTML
 */
function formatAlertEmail(data: SecurityAlertData): string {
  const alertColors: Record<string, string> = {
    bot_detected: '#ef4444',
    rate_limit: '#f97316',
    threat_score: '#dc2626',
    daily_budget: '#eab308',
    honeypot: '#7c3aed',
    high_volume: '#f43f5e',
  };

  const alertTitles: Record<string, string> = {
    bot_detected: 'Bot Activity Detected',
    rate_limit: 'Rate Limit Exceeded',
    threat_score: 'High Threat Score',
    daily_budget: 'Daily Budget Exceeded',
    honeypot: 'Honeypot Triggered',
    high_volume: 'High Volume Attack',
  };

  const color = alertColors[data.type] || '#ef4444';
  const title = alertTitles[data.type] || 'Security Alert';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: ${color}; padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">
        Fly2Any Security System
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 24px;">
      <div style="background: #fef2f2; border-left: 4px solid ${color}; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-weight: 600;">
          Suspicious activity has been blocked on your platform.
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 140px;">
            Alert Type
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
            <span style="background: ${color}; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
              ${data.type.replace('_', ' ').toUpperCase()}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">
            IP Address
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-family: monospace;">
            ${data.ip}
          </td>
        </tr>
        ${data.country || data.city ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">
            Location
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
            ${[data.city, data.country].filter(Boolean).join(', ') || 'Unknown'}
          </td>
        </tr>
        ` : ''}
        ${data.endpoint ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">
            Endpoint
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-family: monospace;">
            ${data.endpoint}
          </td>
        </tr>
        ` : ''}
        ${data.threatScore !== undefined ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">
            Threat Score
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
            <span style="background: ${data.threatScore >= 70 ? '#dc2626' : data.threatScore >= 50 ? '#f97316' : '#eab308'}; color: white; padding: 2px 8px; border-radius: 4px; font-weight: 600;">
              ${data.threatScore}/100
            </span>
          </td>
        </tr>
        ` : ''}
        ${data.requestCount !== undefined ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">
            Request Count
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
            ${data.requestCount} requests ${data.threshold ? `(limit: ${data.threshold})` : ''}
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">
            Timestamp
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
            ${new Date(data.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })} EST
          </td>
        </tr>
      </table>

      ${data.reasons && data.reasons.length > 0 ? `
      <div style="margin-top: 20px;">
        <h3 style="color: #374151; font-size: 14px; margin: 0 0 12px;">Detection Reasons:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
          ${data.reasons.map(r => `<li style="margin-bottom: 4px;">${r}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      ${data.userAgent ? `
      <div style="margin-top: 20px;">
        <h3 style="color: #374151; font-size: 14px; margin: 0 0 8px;">User Agent:</h3>
        <p style="margin: 0; color: #6b7280; font-size: 12px; font-family: monospace; background: #f3f4f6; padding: 8px; border-radius: 4px; word-break: break-all;">
          ${data.userAgent}
        </p>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 16px 24px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
        This is an automated security alert from Fly2Any.<br>
        Review your security dashboard for more details.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send security alert email
 */
export async function sendSecurityAlert(data: SecurityAlertData): Promise<boolean> {
  // Only send in production
  if (!CONFIG.enabledEnvs.includes(process.env.NODE_ENV || 'development')) {
    console.log('[SecurityAlerts] Skipping alert (not production):', data.type);
    return false;
  }

  // Check if Resend is configured
  if (!resend) {
    console.warn('[SecurityAlerts] Resend not configured - cannot send alert');
    return false;
  }

  // Check throttle
  const canSend = await shouldSendAlert(data.type, data.ip);
  if (!canSend) {
    console.log('[SecurityAlerts] Alert throttled:', data.type, data.ip);
    return false;
  }

  try {
    const result = await resend.emails.send({
      from: CONFIG.fromEmail,
      to: CONFIG.alertEmail,
      subject: `[SECURITY] ${data.type.replace('_', ' ').toUpperCase()} - ${data.ip}`,
      html: formatAlertEmail(data),
    });

    console.log('[SecurityAlerts] Alert sent:', result);
    return true;
  } catch (error) {
    console.error('[SecurityAlerts] Failed to send alert:', error);
    return false;
  }
}

/**
 * Alert on bot detection
 */
export async function alertBotDetected(
  ip: string,
  userAgent: string,
  endpoint?: string
): Promise<void> {
  const blockCount = await trackBlockedRequest(ip, 'bot');

  // Only alert after multiple blocks
  if (blockCount >= CONFIG.minBlocksBeforeAlert) {
    await sendSecurityAlert({
      type: 'bot_detected',
      ip,
      userAgent,
      endpoint,
      requestCount: blockCount,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Alert on high threat score
 */
export async function alertHighThreatScore(
  ip: string,
  threatScore: number,
  reasons: string[],
  endpoint?: string,
  userAgent?: string
): Promise<void> {
  if (threatScore < CONFIG.minThreatScoreAlert) {
    return;
  }

  await sendSecurityAlert({
    type: 'threat_score',
    ip,
    threatScore,
    reasons,
    endpoint,
    userAgent,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Alert on rate limit exceeded (high volume)
 */
export async function alertRateLimitExceeded(
  ip: string,
  endpoint: string,
  requestCount: number,
  threshold: number
): Promise<void> {
  const blockCount = await trackBlockedRequest(ip, 'rate_limit');

  // Alert when blocks exceed threshold significantly
  if (blockCount >= 10 || requestCount >= threshold * 2) {
    await sendSecurityAlert({
      type: 'rate_limit',
      ip,
      endpoint,
      requestCount,
      threshold,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Alert on honeypot triggered
 */
export async function alertHoneypotTriggered(
  ip: string,
  endpoint: string,
  userAgent?: string
): Promise<void> {
  // Honeypots are always suspicious - alert immediately
  await sendSecurityAlert({
    type: 'honeypot',
    ip,
    endpoint,
    userAgent,
    reasons: ['Accessed honeypot endpoint', 'Likely automated scanner'],
    timestamp: new Date().toISOString(),
  });
}

/**
 * Alert on daily budget exceeded
 */
export async function alertDailyBudgetExceeded(
  ip: string,
  endpoint: string,
  requestCount: number
): Promise<void> {
  await sendSecurityAlert({
    type: 'daily_budget',
    ip,
    endpoint,
    requestCount,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get alert statistics
 */
export async function getAlertStats(): Promise<{
  totalAlerts: number;
  alertsByType: Record<string, number>;
  topBlockedIPs: Array<{ ip: string; count: number }>;
}> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) {
    return {
      totalAlerts: 0,
      alertsByType: {},
      topBlockedIPs: [],
    };
  }

  try {
    // Get blocked IPs
    const blockedIPs = await redis.hgetall('blocked_ips');
    const topIPs = Object.entries(blockedIPs || {})
      .map(([ip, count]) => ({ ip, count: parseInt(count as string) || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalAlerts: topIPs.reduce((sum, ip) => sum + ip.count, 0),
      alertsByType: {},
      topBlockedIPs: topIPs,
    };
  } catch (error) {
    console.error('[SecurityAlerts] Stats error:', error);
    return {
      totalAlerts: 0,
      alertsByType: {},
      topBlockedIPs: [],
    };
  }
}

export default {
  sendSecurityAlert,
  alertBotDetected,
  alertHighThreatScore,
  alertRateLimitExceeded,
  alertHoneypotTriggered,
  alertDailyBudgetExceeded,
  getAlertStats,
};
