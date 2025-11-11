/**
 * Alert Configuration and Management
 *
 * Defines alert rules, thresholds, and notification handlers for production monitoring.
 * Integrates with Sentry, email, and other notification channels.
 */

import { captureMessage } from './sentry';
import { metricsStore, healthChecker } from './middleware';
import { perfMonitor } from './performance';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  condition: () => boolean | Promise<boolean>;
  threshold: number; // Number of consecutive failures before alerting
  cooldown: number; // Minimum time between alerts (ms)
  enabled: boolean;
  action: () => void | Promise<void>;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  data?: any;
  acknowledged: boolean;
}

/**
 * Alert Manager for monitoring and triggering alerts
 */
class AlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private failureCounts: Map<string, number> = new Map();
  private lastAlertTime: Map<string, number> = new Map();
  private alertHistory: AlertEvent[] = [];
  private maxHistorySize = 1000;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    // High error rate alert
    this.addRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      description: 'Alert when API error rate exceeds threshold',
      severity: 'high',
      threshold: 3,
      cooldown: 300000, // 5 minutes
      enabled: true,
      condition: () => {
        const metrics = metricsStore.exportMetrics();
        const endpoints = metrics.endpoints as any[];

        // Check if any endpoint has > 5% error rate
        return endpoints.some(e => {
          const errorRate = e.errors / (e.requests || 1);
          return errorRate > 0.05 && e.requests > 10;
        });
      },
      action: async () => {
        const metrics = metricsStore.exportMetrics();
        const endpoints = metrics.endpoints as any[];

        const problematicEndpoints = endpoints
          .filter(e => {
            const errorRate = e.errors / (e.requests || 1);
            return errorRate > 0.05 && e.requests > 10;
          })
          .map(e => ({
            path: e.path,
            errorRate: ((e.errors / e.requests) * 100).toFixed(1) + '%',
            requests: e.requests,
            errors: e.errors,
          }));

        await this.sendAlert(
          'high-error-rate',
          'High Error Rate Detected',
          'high',
          { endpoints: problematicEndpoints }
        );
      },
    });

    // Slow API response alert
    this.addRule({
      id: 'slow-api-response',
      name: 'Slow API Response',
      description: 'Alert when API response time is consistently slow',
      severity: 'medium',
      threshold: 5,
      cooldown: 600000, // 10 minutes
      enabled: true,
      condition: () => {
        const summary = perfMonitor.getAllMetrics();
        const slowAPIs = Object.entries(summary)
          .filter(([name]) => name.includes('api-call'))
          .filter(([_, stats]) => stats && stats.p95 > 3000);

        return slowAPIs.length > 0;
      },
      action: async () => {
        const summary = perfMonitor.getAllMetrics();
        const slowAPIs = Object.entries(summary)
          .filter(([name]) => name.includes('api-call'))
          .filter(([_, stats]) => stats && stats.p95 > 3000)
          .map(([name, stats]) => ({
            endpoint: name,
            p95: stats!.p95,
            avg: stats!.avg,
          }));

        await this.sendAlert(
          'slow-api-response',
          'Slow API Response Times',
          'medium',
          { apis: slowAPIs }
        );
      },
    });

    // Database connection issues
    this.addRule({
      id: 'database-unhealthy',
      name: 'Database Connection Issues',
      description: 'Alert when database health check fails',
      severity: 'critical',
      threshold: 1,
      cooldown: 120000, // 2 minutes
      enabled: true,
      condition: () => {
        const health = healthChecker.getServiceHealth('database');
        return health ? !health.healthy : false;
      },
      action: async () => {
        const health = healthChecker.getServiceHealth('database');
        await this.sendAlert(
          'database-unhealthy',
          'Database Connection Failed',
          'critical',
          { health }
        );
      },
    });

    // Redis connection issues
    this.addRule({
      id: 'redis-unhealthy',
      name: 'Redis Connection Issues',
      description: 'Alert when Redis health check fails',
      severity: 'high',
      threshold: 2,
      cooldown: 300000, // 5 minutes
      enabled: true,
      condition: () => {
        const health = healthChecker.getServiceHealth('redis');
        return health ? !health.healthy : false;
      },
      action: async () => {
        const health = healthChecker.getServiceHealth('redis');
        await this.sendAlert(
          'redis-unhealthy',
          'Redis Connection Failed',
          'high',
          { health }
        );
      },
    });

    // External API failures
    this.addRule({
      id: 'external-api-failures',
      name: 'External API Failures',
      description: 'Alert when external APIs (Duffel, Amadeus, Stripe) are failing',
      severity: 'high',
      threshold: 3,
      cooldown: 300000, // 5 minutes
      enabled: true,
      condition: () => {
        const services = ['duffel', 'amadeus', 'stripe'];
        return services.some(service => {
          const health = healthChecker.getServiceHealth(service);
          return health ? !health.healthy : false;
        });
      },
      action: async () => {
        const services = ['duffel', 'amadeus', 'stripe'];
        const failedServices = services
          .map(service => ({
            name: service,
            health: healthChecker.getServiceHealth(service),
          }))
          .filter(s => s.health && !s.health.healthy);

        await this.sendAlert(
          'external-api-failures',
          'External API Failures',
          'high',
          { services: failedServices }
        );
      },
    });

    // Memory usage alert
    this.addRule({
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      description: 'Alert when memory usage exceeds threshold',
      severity: 'medium',
      threshold: 5,
      cooldown: 600000, // 10 minutes
      enabled: true,
      condition: () => {
        if (typeof process !== 'undefined' && process.memoryUsage) {
          const usage = process.memoryUsage();
          const usagePercent = (usage.heapUsed / usage.heapTotal) * 100;
          return usagePercent > 90; // 90% memory usage
        }
        return false;
      },
      action: async () => {
        const usage = process.memoryUsage();
        const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
        const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
        const percentage = ((usage.heapUsed / usage.heapTotal) * 100).toFixed(1);

        await this.sendAlert(
          'high-memory-usage',
          'High Memory Usage',
          'medium',
          {
            used: `${usedMB} MB`,
            total: `${totalMB} MB`,
            percentage: `${percentage}%`,
          }
        );
      },
    });
  }

  /**
   * Add a new alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    this.failureCounts.set(rule.id, 0);
  }

  /**
   * Remove an alert rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    this.failureCounts.delete(ruleId);
    this.lastAlertTime.delete(ruleId);
  }

  /**
   * Enable/disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Check all alert rules
   */
  async checkAlerts(): Promise<void> {
    for (const [ruleId, rule] of this.rules.entries()) {
      if (!rule.enabled) continue;

      try {
        const conditionMet = await rule.condition();

        if (conditionMet) {
          // Increment failure count
          const failures = (this.failureCounts.get(ruleId) || 0) + 1;
          this.failureCounts.set(ruleId, failures);

          // Check if threshold is met
          if (failures >= rule.threshold) {
            // Check cooldown
            const lastAlert = this.lastAlertTime.get(ruleId) || 0;
            const now = Date.now();

            if (now - lastAlert >= rule.cooldown) {
              // Trigger alert
              await rule.action();
              this.lastAlertTime.set(ruleId, now);
              this.failureCounts.set(ruleId, 0); // Reset counter
            }
          }
        } else {
          // Reset failure count if condition is no longer met
          this.failureCounts.set(ruleId, 0);
        }
      } catch (error) {
        console.error(`[Alert] Error checking rule ${ruleId}:`, error);
      }
    }
  }

  /**
   * Send an alert through configured channels
   */
  private async sendAlert(
    ruleId: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    data?: any
  ): Promise<void> {
    const rule = this.rules.get(ruleId);

    console.error(`[ALERT ${severity.toUpperCase()}] ${message}`, data);

    // Create alert event
    const alertEvent: AlertEvent = {
      id: crypto.randomUUID(),
      ruleId,
      ruleName: rule?.name || 'Unknown',
      severity,
      message,
      timestamp: Date.now(),
      data,
      acknowledged: false,
    };

    // Store in history
    this.alertHistory.push(alertEvent);
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.shift();
    }

    // Send to Sentry
    captureMessage(
      `[${rule?.name}] ${message}`,
      severity === 'critical' || severity === 'high' ? 'error' : 'warning',
      data
    );

    // Send to additional channels (email, Slack, PagerDuty, etc.)
    await this.sendToNotificationChannels(alertEvent);
  }

  /**
   * Send alert to configured notification channels
   */
  private async sendToNotificationChannels(alert: AlertEvent): Promise<void> {
    // Email notification (if configured)
    if (process.env.ALERT_EMAIL) {
      // TODO: Implement email notification
      console.log('[Alert] Would send email to:', process.env.ALERT_EMAIL);
    }

    // Slack notification (if configured)
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `${alert.severity.toUpperCase()}: ${alert.message}`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `${this.getSeverityEmoji(alert.severity)} ${alert.ruleName}`,
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: alert.message,
                },
              },
              alert.data && {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `\`\`\`${JSON.stringify(alert.data, null, 2)}\`\`\``,
                },
              },
            ].filter(Boolean),
          }),
        });
      } catch (error) {
        console.error('[Alert] Failed to send Slack notification:', error);
      }
    }

    // PagerDuty notification for critical alerts (if configured)
    if (alert.severity === 'critical' && process.env.PAGERDUTY_ROUTING_KEY) {
      try {
        await fetch('https://events.pagerduty.com/v2/enqueue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routing_key: process.env.PAGERDUTY_ROUTING_KEY,
            event_action: 'trigger',
            payload: {
              summary: alert.message,
              severity: alert.severity,
              source: 'fly2any-monitoring',
              custom_details: alert.data,
            },
          }),
        });
      } catch (error) {
        console.error('[Alert] Failed to send PagerDuty notification:', error);
      }
    }
  }

  /**
   * Get emoji for severity level
   */
  private getSeverityEmoji(severity: string): string {
    const emojis = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🚨',
      critical: '🔥',
    };
    return emojis[severity as keyof typeof emojis] || '❓';
  }

  /**
   * Get alert history
   */
  getAlertHistory(options?: {
    severity?: string;
    since?: number;
    limit?: number;
  }): AlertEvent[] {
    let filtered = [...this.alertHistory];

    if (options?.severity) {
      filtered = filtered.filter(a => a.severity === options.severity);
    }

    if (options?.since) {
      filtered = filtered.filter(a => a.timestamp >= options.since!);
    }

    filtered.sort((a, b) => b.timestamp - a.timestamp);

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Start periodic alert checking
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      console.warn('[Alert] Monitoring already started');
      return;
    }

    console.log(`[Alert] Starting monitoring (interval: ${intervalMs}ms)`);

    this.checkInterval = setInterval(() => {
      this.checkAlerts();
    }, intervalMs);

    // Run initial check
    this.checkAlerts();
  }

  /**
   * Stop periodic alert checking
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[Alert] Monitoring stopped');
    }
  }

  /**
   * Get all rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rule status
   */
  getRuleStatus(ruleId: string) {
    return {
      rule: this.rules.get(ruleId),
      failures: this.failureCounts.get(ruleId) || 0,
      lastAlert: this.lastAlertTime.get(ruleId),
    };
  }
}

/**
 * Singleton instance
 */
export const alertManager = new AlertManager();

/**
 * Initialize monitoring in production
 */
export function initializeAlertMonitoring(): void {
  if (process.env.NODE_ENV === 'production') {
    alertManager.startMonitoring(60000); // Check every minute
    console.log('[Alert] Production monitoring initialized');
  }
}
