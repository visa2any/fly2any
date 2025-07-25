import { emailMarketingLogger, EmailEvent, LogLevel } from './email-marketing-logger';

export interface Alert {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  campaignId?: string;
  contactId?: string;
  email?: string;
  metadata?: Record<string, any>;
  acknowledged: boolean;
  resolvedAt?: string;
  actions?: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    event?: EmailEvent;
    level?: LogLevel;
    threshold?: number;
    timeWindow?: number; // minutes
    campaignId?: string;
  };
  actions: {
    notify?: boolean;
    webhook?: string;
    email?: string[];
    pauseCampaign?: boolean;
  };
}

export class EmailMarketingAlertSystem {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private subscribers: Array<(alert: Alert) => void> = [];

  constructor() {
    this.initializeDefaultRules();
    this.startMonitoring();
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'high-failure-rate',
        name: 'High Email Failure Rate',
        description: 'Alert when email failure rate exceeds 20% in 15 minutes',
        enabled: true,
        conditions: {
          event: EmailEvent.EMAIL_FAILED,
          threshold: 0.2, // 20%
          timeWindow: 15
        },
        actions: {
          notify: true,
          pauseCampaign: true
        }
      },
      {
        id: 'campaign-stuck',
        name: 'Campaign Processing Stuck',
        description: 'Alert when campaign heartbeat stops for 10 minutes',
        enabled: true,
        conditions: {
          event: EmailEvent.HEARTBEAT,
          timeWindow: 10
        },
        actions: {
          notify: true,
          pauseCampaign: false
        }
      },
      {
        id: 'critical-system-error',
        name: 'Critical System Error',
        description: 'Alert on any critical system error',
        enabled: true,
        conditions: {
          level: LogLevel.CRITICAL
        },
        actions: {
          notify: true,
          pauseCampaign: true
        }
      },
      {
        id: 'rate-limit-exceeded',
        name: 'Rate Limit Frequently Exceeded',
        description: 'Alert when rate limiting occurs more than 5 times in 30 minutes',
        enabled: true,
        conditions: {
          event: EmailEvent.RATE_LIMITED,
          threshold: 5,
          timeWindow: 30
        },
        actions: {
          notify: true
        }
      },
      {
        id: 'mass-bounces',
        name: 'Mass Email Bounces',
        description: 'Alert when bounce rate exceeds 10% in 60 minutes',
        enabled: true,
        conditions: {
          event: EmailEvent.EMAIL_BOUNCED,
          threshold: 0.1, // 10%
          timeWindow: 60
        },
        actions: {
          notify: true,
          pauseCampaign: true
        }
      },
      {
        id: 'credentials-failure',
        name: 'Email Credentials Failure',
        description: 'Alert when email credentials fail to load',
        enabled: true,
        conditions: {
          event: EmailEvent.CREDENTIALS_LOADED,
          level: LogLevel.CRITICAL
        },
        actions: {
          notify: true,
          pauseCampaign: true
        }
      }
    ];
  }

  /**
   * Start monitoring logs for alert conditions
   */
  private startMonitoring(): void {
    // Check for alerts every minute
    setInterval(() => {
      this.checkAlertConditions();
    }, 60000);

    // Cleanup old alerts every hour
    setInterval(() => {
      this.cleanupOldAlerts();
    }, 3600000);
  }

  /**
   * Check all alert rules against recent logs
   */
  private async checkAlertConditions(): Promise<void> {
    try {
      for (const rule of this.rules) {
        if (!rule.enabled) continue;

        const shouldAlert = await this.evaluateRule(rule);
        if (shouldAlert) {
          await this.triggerAlert(rule, shouldAlert);
        }
      }
    } catch (error) {
      console.error('Error checking alert conditions:', error);
    }
  }

  /**
   * Evaluate a single alert rule
   */
  private async evaluateRule(rule: AlertRule): Promise<any> {
    try {
      const timeWindow = rule.conditions.timeWindow || 60; // Default 60 minutes
      const stats = await emailMarketingLogger.getLogStatistics(timeWindow / 60);

      switch (rule.id) {
        case 'high-failure-rate':
          return this.checkFailureRate(stats, rule);
        
        case 'campaign-stuck':
          return this.checkCampaignHeartbeat(stats, rule);
        
        case 'critical-system-error':
          return this.checkCriticalErrors(stats, rule);
        
        case 'rate-limit-exceeded':
          return this.checkRateLimits(stats, rule);
        
        case 'mass-bounces':
          return this.checkBounceRate(stats, rule);
        
        case 'credentials-failure':
          return this.checkCredentialsFailure(stats, rule);
        
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
      return null;
    }
  }

  /**
   * Check email failure rate
   */
  private checkFailureRate(stats: any, rule: AlertRule): any {
    const sentEmails = stats.byEvent[EmailEvent.EMAIL_SENT] || 0;
    const failedEmails = stats.byEvent[EmailEvent.EMAIL_FAILED] || 0;
    const totalEmails = sentEmails + failedEmails;

    if (totalEmails < 10) return null; // Need minimum sample size

    const failureRate = failedEmails / totalEmails;
    const threshold = rule.conditions.threshold || 0.2;

    if (failureRate > threshold) {
      return {
        failureRate: (failureRate * 100).toFixed(1),
        threshold: (threshold * 100).toFixed(1),
        totalEmails,
        failedEmails
      };
    }

    return null;
  }

  /**
   * Check campaign heartbeat
   */
  private checkCampaignHeartbeat(stats: any, rule: AlertRule): any {
    const heartbeats = stats.byEvent[EmailEvent.HEARTBEAT] || 0;
    const timeWindow = rule.conditions.timeWindow || 10;
    
    // If we have active campaigns but no heartbeats in time window, alert
    const activeCampaigns = Object.keys(stats.byCampaign).length;
    
    if (activeCampaigns > 0 && heartbeats === 0) {
      return {
        activeCampaigns,
        timeWindow,
        lastHeartbeat: 'None in time window'
      };
    }

    return null;
  }

  /**
   * Check critical errors
   */
  private checkCriticalErrors(stats: any, rule: AlertRule): any {
    if (stats.criticalIssues.length > 0) {
      return {
        criticalCount: stats.criticalIssues.length,
        recentErrors: stats.criticalIssues.slice(0, 3)
      };
    }

    return null;
  }

  /**
   * Check rate limits
   */
  private checkRateLimits(stats: any, rule: AlertRule): any {
    const rateLimits = stats.byEvent[EmailEvent.RATE_LIMITED] || 0;
    const threshold = rule.conditions.threshold || 5;

    if (rateLimits > threshold) {
      return {
        rateLimitCount: rateLimits,
        threshold,
        timeWindow: rule.conditions.timeWindow
      };
    }

    return null;
  }

  /**
   * Check bounce rate
   */
  private checkBounceRate(stats: any, rule: AlertRule): any {
    const sentEmails = stats.byEvent[EmailEvent.EMAIL_SENT] || 0;
    const bouncedEmails = stats.byEvent[EmailEvent.EMAIL_BOUNCED] || 0;

    if (sentEmails < 10) return null; // Need minimum sample size

    const bounceRate = bouncedEmails / sentEmails;
    const threshold = rule.conditions.threshold || 0.1;

    if (bounceRate > threshold) {
      return {
        bounceRate: (bounceRate * 100).toFixed(1),
        threshold: (threshold * 100).toFixed(1),
        bouncedEmails,
        sentEmails
      };
    }

    return null;
  }

  /**
   * Check credentials failure
   */
  private checkCredentialsFailure(stats: any, rule: AlertRule): any {
    const credentialErrors = stats.errors.filter((error: any) => 
      error.event === EmailEvent.CREDENTIALS_LOADED && 
      error.level >= LogLevel.ERROR
    );

    if (credentialErrors.length > 0) {
      return {
        credentialErrors: credentialErrors.length,
        recentErrors: credentialErrors.slice(0, 2)
      };
    }

    return null;
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(rule: AlertRule, alertData: any): Promise<void> {
    const alert: Alert = {
      id: `${rule.id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: this.mapRuleToAlertLevel(rule),
      title: rule.name,
      message: this.generateAlertMessage(rule, alertData),
      metadata: {
        ruleId: rule.id,
        alertData,
        conditions: rule.conditions
      },
      acknowledged: false,
      actions: Object.keys(rule.actions).filter(action => 
        rule.actions[action as keyof typeof rule.actions]
      )
    };

    // Add to alerts list
    this.alerts.push(alert);

    // Execute alert actions
    await this.executeAlertActions(rule, alert, alertData);

    // Notify subscribers
    this.notifySubscribers(alert);

    // Log the alert
    emailMarketingLogger.warn(
      EmailEvent.SYSTEM_ERROR,
      `Alert triggered: ${alert.title}`,
      {
        metadata: {
          alertId: alert.id,
          ruleId: rule.id,
          level: alert.level,
          alertData
        }
      }
    );
  }

  /**
   * Map rule to alert level
   */
  private mapRuleToAlertLevel(rule: AlertRule): Alert['level'] {
    if (rule.conditions.level === LogLevel.CRITICAL) return 'critical';
    if (rule.actions.pauseCampaign) return 'error';
    if (rule.conditions.threshold && rule.conditions.threshold > 0.5) return 'error';
    return 'warning';
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(rule: AlertRule, alertData: any): string {
    switch (rule.id) {
      case 'high-failure-rate':
        return `Email failure rate of ${alertData.failureRate}% exceeds threshold of ${alertData.threshold}% (${alertData.failedEmails}/${alertData.totalEmails} emails failed)`;
      
      case 'campaign-stuck':
        return `${alertData.activeCampaigns} active campaigns detected but no heartbeat signals received in ${alertData.timeWindow} minutes`;
      
      case 'critical-system-error':
        return `${alertData.criticalCount} critical system errors detected. Recent: ${alertData.recentErrors.map((e: any) => e.message).join(', ')}`;
      
      case 'rate-limit-exceeded':
        return `Rate limiting occurred ${alertData.rateLimitCount} times in ${alertData.timeWindow} minutes (threshold: ${alertData.threshold})`;
      
      case 'mass-bounces':
        return `Bounce rate of ${alertData.bounceRate}% exceeds threshold of ${alertData.threshold}% (${alertData.bouncedEmails}/${alertData.sentEmails} emails bounced)`;
      
      case 'credentials-failure':
        return `${alertData.credentialErrors} email credential failures detected`;
      
      default:
        return rule.description;
    }
  }

  /**
   * Execute alert actions
   */
  private async executeAlertActions(rule: AlertRule, alert: Alert, alertData: any): Promise<void> {
    try {
      // Pause campaign if configured
      if (rule.actions.pauseCampaign && alertData.campaignId) {
        // Implementation would pause the specific campaign
        console.log(`Would pause campaign ${alertData.campaignId} due to alert ${alert.id}`);
      }

      // Send webhook if configured
      if (rule.actions.webhook) {
        await this.sendWebhook(rule.actions.webhook, alert);
      }

      // Send emails if configured
      if (rule.actions.email && rule.actions.email.length > 0) {
        await this.sendAlertEmails(rule.actions.email, alert);
      }
    } catch (error) {
      console.error('Error executing alert actions:', error);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(webhookUrl: string, alert: Alert): Promise<void> {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert,
          timestamp: new Date().toISOString(),
          source: 'email-marketing-alerts'
        })
      });
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  }

  /**
   * Send alert emails
   */
  private async sendAlertEmails(emails: string[], alert: Alert): Promise<void> {
    // Implementation would send alert emails
    console.log(`Would send alert emails to: ${emails.join(', ')}`);
    console.log(`Alert: ${alert.title} - ${alert.message}`);
  }

  /**
   * Notify subscribers
   */
  private notifySubscribers(alert: Alert): void {
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  /**
   * Subscribe to alerts
   */
  subscribe(callback: (alert: Alert) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get all alerts
   */
  getAlerts(filter?: {
    level?: Alert['level'];
    acknowledged?: boolean;
    campaignId?: string;
    hours?: number;
  }): Alert[] {
    let filteredAlerts = [...this.alerts];

    if (filter) {
      if (filter.level) {
        filteredAlerts = filteredAlerts.filter(alert => alert.level === filter.level);
      }
      
      if (filter.acknowledged !== undefined) {
        filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged === filter.acknowledged);
      }
      
      if (filter.campaignId) {
        filteredAlerts = filteredAlerts.filter(alert => alert.campaignId === filter.campaignId);
      }
      
      if (filter.hours) {
        const since = new Date(Date.now() - (filter.hours * 60 * 60 * 1000));
        filteredAlerts = filteredAlerts.filter(alert => 
          new Date(alert.timestamp) >= since
        );
      }
    }

    return filteredAlerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Add custom alert rule
   */
  addRule(rule: Omit<AlertRule, 'id'>): string {
    const newRule: AlertRule = {
      ...rule,
      id: `custom-${Date.now()}`
    };
    
    this.rules.push(newRule);
    return newRule.id;
  }

  /**
   * Update alert rule
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
      return true;
    }
    return false;
  }

  /**
   * Delete alert rule
   */
  deleteRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index > -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all alert rules
   */
  getRules(): AlertRule[] {
    return [...this.rules];
  }

  /**
   * Cleanup old alerts
   */
  private cleanupOldAlerts(): void {
    const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp) >= sevenDaysAgo
    );
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(hours: number = 24): {
    total: number;
    byLevel: Record<string, number>;
    acknowledged: number;
    resolved: number;
    active: number;
  } {
    const alerts = this.getAlerts({ hours });
    
    const stats = {
      total: alerts.length,
      byLevel: {} as Record<string, number>,
      acknowledged: 0,
      resolved: 0,
      active: 0
    };

    alerts.forEach(alert => {
      stats.byLevel[alert.level] = (stats.byLevel[alert.level] || 0) + 1;
      
      if (alert.acknowledged) stats.acknowledged++;
      if (alert.resolvedAt) stats.resolved++;
      if (!alert.acknowledged && !alert.resolvedAt) stats.active++;
    });

    return stats;
  }
}

// Singleton instance
export const emailMarketingAlerts = new EmailMarketingAlertSystem();