/**
 * 🔍 EMAIL SYSTEM MONITORING & HEALTH CHECKS
 * Comprehensive monitoring for Mailgun email system with alerts and diagnostics
 */

import { prisma } from '@/lib/database/prisma';
import { emailService } from './email-service';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  message: string;
  lastChecked: Date;
  details?: Record<string, any>;
}

export interface SystemAlert {
  id: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  service: string;
  threshold?: number;
  currentValue?: number;
  createdAt: Date;
  resolvedAt?: Date;
  isResolved: boolean;
}

export type AlertType = 
  | 'bounce_rate_high'
  | 'delivery_rate_low'
  | 'api_rate_limit'
  | 'queue_backlog'
  | 'provider_failure'
  | 'webhook_failure'
  | 'database_connection'
  | 'email_volume_spike'
  | 'unsubscribe_spike'
  | 'reputation_warning';

export interface MonitoringMetrics {
  emailsInQueue: number;
  emailsProcessingPerMinute: number;
  averageProcessingTime: number;
  providerStatus: ProviderHealthStatus[];
  apiRateLimitUsage: number;
  webhookEventsProcessed: number;
  lastEmailSent: Date;
  systemHealth: 'healthy' | 'warning' | 'critical';
  alerts: SystemAlert[];
}

export interface ProviderHealthStatus {
  provider: string;
  status: 'healthy' | 'warning' | 'critical';
  latency: number;
  successRate: number;
  errorCount: number;
  lastError?: string;
  rateLimitRemaining?: number;
}

export interface QueueStatus {
  totalInQueue: number;
  priorityQueue: number;
  standardQueue: number;
  lowPriorityQueue: number;
  processingRate: number;
  averageWaitTime: number;
  oldestInQueue: Date | null;
}

export interface DeliverabilityMetrics {
  deliveryRate: number;
  bounceRate: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  complaintRate: number;
  reputationScore: number;
  domainReputation: Record<string, number>;
}

class EmailMonitoringSystem {
  private alertThresholds = {
    bounceRate: 5.0,        // 5% bounce rate threshold
    deliveryRate: 95.0,     // 95% delivery rate minimum
    apiRateLimit: 90.0,     // 90% API rate limit usage
    queueBacklog: 10000,    // 10k emails in queue
    responseTime: 5000,     // 5 second response time
    unsubscribeRate: 2.0,   // 2% unsubscribe rate
    complaintRate: 0.1,     // 0.1% complaint rate
    reputationScore: 70     // Minimum reputation score
  };

  private healthCheckCache = new Map<string, HealthCheckResult>();
  private lastHealthCheck = 0;
  private healthCheckInterval = 60000; // 1 minute

  /**
   * Perform comprehensive system health check
   */
  async performHealthCheck(): Promise<HealthCheckResult[]> {
    const now = Date.now();
    
    // Use cached results if recent
    if (now - this.lastHealthCheck < this.healthCheckInterval && this.healthCheckCache.size > 0) {
      return Array.from(this.healthCheckCache.values());
    }

    console.log('🔍 Performing email system health check...');
    
    const healthChecks = await Promise.allSettled([
      this.checkMailgunAPI(),
      this.checkDatabaseConnection(),
      this.checkEmailQueue(),
      this.checkWebhookEndpoints(),
      this.checkDeliverabilityMetrics(),
      this.checkSystemResources()
    ]);

    const results: HealthCheckResult[] = [];
    
    healthChecks.forEach((check, index) => {
      if (check.status === 'fulfilled') {
        results.push(check.value);
      } else {
        // Create error result for failed checks
        const services = ['mailgun', 'database', 'queue', 'webhooks', 'deliverability', 'resources'];
        results.push({
          service: services[index] || 'unknown',
          status: 'critical',
          responseTime: 0,
          message: `Health check failed: ${check.reason?.message || 'Unknown error'}`,
          lastChecked: new Date()
        });
      }
    });

    // Cache results
    results.forEach(result => {
      this.healthCheckCache.set(result.service, result);
    });
    this.lastHealthCheck = now;

    // Check for alerts based on health check results
    await this.processHealthCheckAlerts(results);

    console.log(`✅ Health check completed. Status: ${this.getOverallHealth(results)}`);
    return results;
  }

  /**
   * Check Mailgun API health
   */
  private async checkMailgunAPI(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        return {
          service: 'mailgun',
          status: 'critical',
          responseTime: 0,
          message: 'Mailgun API credentials not configured',
          lastChecked: new Date()
        };
      }

      // Test API connectivity with domain info request
      const formData = require('form-data');
      const Mailgun = require('mailgun.js');
      
      const mailgun = new Mailgun(formData);
      const mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
        url: 'https://api.mailgun.net'
      });

      const domainInfo = await mg.domains.get(process.env.MAILGUN_DOMAIN);
      const responseTime = Date.now() - startTime;

      // Check rate limits from response headers
      const rateLimitRemaining = domainInfo.headers?.['x-ratelimit-remaining'];
      const rateLimitLimit = domainInfo.headers?.['x-ratelimit-limit'];
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = 'Mailgun API is responding normally';

      if (rateLimitRemaining && rateLimitLimit) {
        const usagePercentage = ((rateLimitLimit - rateLimitRemaining) / rateLimitLimit) * 100;
        if (usagePercentage > this.alertThresholds.apiRateLimit) {
          status = 'warning';
          message = `API rate limit usage high: ${usagePercentage.toFixed(1)}%`;
        }
      }

      if (responseTime > this.alertThresholds.responseTime) {
        // If response time is extremely high, escalate to critical
        if (responseTime > this.alertThresholds.responseTime * 2) {
          status = 'critical';
        } else if (status !== 'warning') {
          status = 'warning';
        }
        message = `${message}. High response time: ${responseTime}ms`;
      }

      return {
        service: 'mailgun',
        status,
        responseTime,
        message,
        lastChecked: new Date(),
        details: {
          domain: domainInfo.domain?.name,
          state: domainInfo.domain?.state,
          rateLimitRemaining,
          rateLimitLimit
        }
      };
    } catch (error: any) {
      return {
        service: 'mailgun',
        status: 'critical',
        responseTime: Date.now() - startTime,
        message: `Mailgun API error: ${error.message}`,
        lastChecked: new Date(),
        details: { error: error.message }
      };
    }
  }

  /**
   * Check database connection and email logs
   */
  private async checkDatabaseConnection(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test database connection with a simple query
      const emailCount = await prisma.emailLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      const responseTime = Date.now() - startTime;
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = 'Database connection is healthy';

      if (responseTime > 2000) {
        status = 'warning';
        message = `Database responding slowly: ${responseTime}ms`;
      } else if (responseTime > 5000) {
        status = 'critical';
        message = `Database very slow: ${responseTime}ms`;
      }

      return {
        service: 'database',
        status,
        responseTime,
        message,
        lastChecked: new Date(),
        details: {
          emailsLast24h: emailCount,
          queryTime: responseTime
        }
      };
    } catch (error: any) {
      return {
        service: 'database',
        status: 'critical',
        responseTime: Date.now() - startTime,
        message: `Database connection failed: ${error.message}`,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check email queue status
   */
  private async checkEmailQueue(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const queueStatus = await this.getQueueStatus();
      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = `Queue processing normally: ${queueStatus.totalInQueue} emails in queue`;

      if (queueStatus.totalInQueue > this.alertThresholds.queueBacklog) {
        status = 'critical';
        message = `Queue backlog critical: ${queueStatus.totalInQueue} emails`;
      } else if (queueStatus.totalInQueue > this.alertThresholds.queueBacklog / 2) {
        status = 'warning';
        message = `Queue backlog warning: ${queueStatus.totalInQueue} emails`;
      }

      if (queueStatus.averageWaitTime > 300000) { // 5 minutes
        status = status === 'critical' ? 'critical' : 'warning';
        message = `${message}. High wait time: ${Math.round(queueStatus.averageWaitTime / 60000)}min`;
      }

      return {
        service: 'queue',
        status,
        responseTime,
        message,
        lastChecked: new Date(),
        details: queueStatus
      };
    } catch (error: any) {
      return {
        service: 'queue',
        status: 'critical',
        responseTime: Date.now() - startTime,
        message: `Queue check failed: ${error.message}`,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check webhook endpoints health
   */
  private async checkWebhookEndpoints(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Check recent webhook events processing
      const recentWebhookEvents = await prisma.webhookEvent.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          },
          processed: true
        }
      });

      const failedEvents = await prisma.webhookEvent.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000)
          },
          processed: false,
          attempts: {
            gt: 3
          }
        }
      });

      const responseTime = Date.now() - startTime;
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = `Webhooks processing normally: ${recentWebhookEvents} events processed`;

      const failureRate = recentWebhookEvents > 0 ? (failedEvents / recentWebhookEvents) * 100 : 0;
      
      if (failureRate > 10) {
        status = 'critical';
        message = `Webhook failure rate critical: ${failureRate.toFixed(1)}%`;
      } else if (failureRate > 5) {
        status = 'warning';
        message = `Webhook failure rate warning: ${failureRate.toFixed(1)}%`;
      }

      return {
        service: 'webhooks',
        status,
        responseTime,
        message,
        lastChecked: new Date(),
        details: {
          eventsProcessed: recentWebhookEvents,
          failedEvents,
          failureRate
        }
      };
    } catch (error: any) {
      return {
        service: 'webhooks',
        status: 'critical',
        responseTime: Date.now() - startTime,
        message: `Webhook check failed: ${error.message}`,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check deliverability metrics
   */
  private async checkDeliverabilityMetrics(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const metrics = await this.getDeliverabilityMetrics();
      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = `Deliverability healthy: ${metrics.deliveryRate.toFixed(1)}% delivery rate`;

      // Check critical thresholds
      if (metrics.bounceRate > this.alertThresholds.bounceRate) {
        status = 'critical';
        message = `High bounce rate: ${metrics.bounceRate.toFixed(1)}%`;
      } else if (metrics.deliveryRate < this.alertThresholds.deliveryRate) {
        status = 'critical';
        message = `Low delivery rate: ${metrics.deliveryRate.toFixed(1)}%`;
      } else if (metrics.complaintRate > this.alertThresholds.complaintRate) {
        status = 'warning';
        message = `High complaint rate: ${metrics.complaintRate.toFixed(1)}%`;
      } else if (metrics.unsubscribeRate > this.alertThresholds.unsubscribeRate) {
        status = 'warning';
        message = `High unsubscribe rate: ${metrics.unsubscribeRate.toFixed(1)}%`;
      }

      return {
        service: 'deliverability',
        status,
        responseTime,
        message,
        lastChecked: new Date(),
        details: metrics
      };
    } catch (error: any) {
      return {
        service: 'deliverability',
        status: 'critical',
        responseTime: Date.now() - startTime,
        message: `Deliverability check failed: ${error.message}`,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Check system resources
   */
  private async checkSystemResources(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Check memory usage and processing capacity
      const memoryUsage = process.memoryUsage();
      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = 'System resources normal';

      const memoryUsedMB = memoryUsage.heapUsed / 1024 / 1024;
      const memoryTotalMB = memoryUsage.heapTotal / 1024 / 1024;
      const memoryUtilization = (memoryUsedMB / memoryTotalMB) * 100;

      if (memoryUtilization > 90) {
        status = 'critical';
        message = `Memory usage critical: ${memoryUtilization.toFixed(1)}%`;
      } else if (memoryUtilization > 80) {
        status = 'warning';
        message = `Memory usage high: ${memoryUtilization.toFixed(1)}%`;
      }

      return {
        service: 'resources',
        status,
        responseTime,
        message,
        lastChecked: new Date(),
        details: {
          memoryUsedMB: Math.round(memoryUsedMB),
          memoryTotalMB: Math.round(memoryTotalMB),
          memoryUtilization: Math.round(memoryUtilization),
          uptime: Math.round(process.uptime())
        }
      };
    } catch (error: any) {
      return {
        service: 'resources',
        status: 'critical',
        responseTime: Date.now() - startTime,
        message: `Resource check failed: ${error.message}`,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Get queue status
   */
  async getQueueStatus(): Promise<QueueStatus> {
    try {
      const pendingEmails = await prisma.emailLog.findMany({
        where: {
          status: 'PENDING'
        },
        select: {
          id: true,
          createdAt: true,
          // priority field not in current EmailLog schema
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      const priorityCounts = pendingEmails.reduce((acc: Record<string, number>, email: any) => {
        const priority = (email as any).priority || 'standard';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate processing rate (emails processed in last 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentlySent = await prisma.emailLog.count({
        where: {
          status: 'SENT',
          sentAt: {
            gte: tenMinutesAgo
          }
        }
      });

      const processingRate = recentlySent * 6; // Per hour

      // Calculate average wait time
      const averageWaitTime = pendingEmails.length > 0 
        ? pendingEmails.reduce((sum: number, email: any) => 
            sum + (Date.now() - email.createdAt.getTime()), 0) / pendingEmails.length
        : 0;

      return {
        totalInQueue: pendingEmails.length,
        priorityQueue: priorityCounts.high || 0,
        standardQueue: priorityCounts.standard || 0,
        lowPriorityQueue: priorityCounts.low || 0,
        processingRate,
        averageWaitTime,
        oldestInQueue: pendingEmails.length > 0 ? pendingEmails[0].createdAt : null
      };
    } catch (error) {
      console.error('❌ Failed to get queue status:', error);
      throw error;
    }
  }

  /**
   * Get deliverability metrics
   */
  async getDeliverabilityMetrics(): Promise<DeliverabilityMetrics> {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const emailStats = await prisma.emailLog.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: last24Hours
          }
        },
        _count: true
      });

      const webhookStats = await prisma.webhookEvent.groupBy({
        by: ['eventType'],
        where: {
          createdAt: {
            gte: last24Hours
          }
        },
        _count: true
      });

      const stats = emailStats.reduce((acc: Record<string, number>, stat: any) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>);

      const webhookCounts = webhookStats.reduce((acc: Record<string, number>, stat: any) => {
        acc[stat.eventType] = stat._count;
        return acc;
      }, {} as Record<string, number>);

      const totalSent = stats.SENT || 0;
      const totalFailed = stats.FAILED || 0;
      const totalDelivered = totalSent - (webhookCounts.bounced || 0);
      const opened = webhookCounts.opened || 0;
      const clicked = webhookCounts.clicked || 0;
      const unsubscribed = webhookCounts.unsubscribed || 0;
      const complaints = webhookCounts.complained || 0;

      return {
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        bounceRate: totalSent > 0 ? ((webhookCounts.bounced || 0) / totalSent) * 100 : 0,
        openRate: totalDelivered > 0 ? (opened / totalDelivered) * 100 : 0,
        clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
        unsubscribeRate: totalSent > 0 ? (unsubscribed / totalSent) * 100 : 0,
        complaintRate: totalSent > 0 ? (complaints / totalSent) * 100 : 0,
        reputationScore: this.calculateReputationScore(totalDelivered, webhookCounts.bounced || 0, complaints),
        domainReputation: {} // TODO: Implement domain-specific reputation tracking
      };
    } catch (error) {
      console.error('❌ Failed to get deliverability metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate reputation score based on engagement metrics
   */
  private calculateReputationScore(delivered: number, bounced: number, complaints: number): number {
    if (delivered === 0) return 0;
    
    const bounceRate = (bounced / delivered) * 100;
    const complaintRate = (complaints / delivered) * 100;
    
    let score = 100;
    score -= bounceRate * 10; // Bounce penalty
    score -= complaintRate * 50; // Complaint penalty (more severe)
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get overall system health
   */
  private getOverallHealth(results: HealthCheckResult[]): 'healthy' | 'warning' | 'critical' {
    if (results.some(r => r.status === 'critical')) return 'critical';
    if (results.some(r => r.status === 'warning')) return 'warning';
    return 'healthy';
  }

  /**
   * Process health check results and create alerts
   */
  private async processHealthCheckAlerts(results: HealthCheckResult[]): Promise<void> {
    for (const result of results) {
      if (result.status === 'critical' || result.status === 'warning') {
        await this.createAlert({
          type: this.getAlertTypeFromService(result.service),
          severity: result.status === 'critical' ? 'critical' : 'warning',
          title: `${result.service.toUpperCase()} Health Check Alert`,
          message: result.message,
          service: result.service,
          currentValue: result.responseTime
        });
      }
    }
  }

  /**
   * Create system alert
   */
  async createAlert(alertData: Omit<SystemAlert, 'id' | 'createdAt' | 'isResolved'>): Promise<SystemAlert> {
    try {
      // Check if similar alert already exists and is not resolved
      const existingAlert = await prisma.systemAlert.findFirst({
        where: {
          type: alertData.type,
          service: alertData.service,
          isResolved: false,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      });

      if (existingAlert) {
        // Update existing alert
        const updated = await prisma.systemAlert.update({
          where: { id: existingAlert.id },
          data: {
            message: alertData.message,
            currentValue: alertData.currentValue,
            updatedAt: new Date()
          }
        });
        return updated as SystemAlert;
      }

      // Create new alert
      const alert = await prisma.systemAlert.create({
        data: {
          ...alertData,
          isResolved: false
        }
      });

      console.log(`🚨 Alert created: ${alert.title}`);

      // Send notification (implement your notification logic here)
      await this.sendAlertNotification(alert as SystemAlert);

      return alert as SystemAlert;
    } catch (error) {
      console.error('❌ Failed to create alert:', error);
      throw error;
    }
  }

  /**
   * Send alert notification
   */
  private async sendAlertNotification(alert: SystemAlert): Promise<void> {
    // Implement notification logic (email, Slack, webhook, etc.)
    console.log(`📢 Notification: ${alert.severity.toUpperCase()} - ${alert.title}: ${alert.message}`);
    
    // Example: Send email notification to admins
    try {
      if (alert.severity === 'critical') {
        await emailService.sendEmail({
          to: process.env.ADMIN_EMAIL || 'admin@fly2any.com',
          subject: `🚨 CRITICAL ALERT: ${alert.title}`,
          htmlContent: `
            <h2>Critical System Alert</h2>
            <p><strong>Service:</strong> ${alert.service}</p>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p><strong>Time:</strong> ${alert.createdAt.toLocaleString()}</p>
            <p>Please investigate immediately.</p>
          `,
          textContent: `CRITICAL ALERT: ${alert.title}\n\nService: ${alert.service}\nMessage: ${alert.message}\nTime: ${alert.createdAt.toLocaleString()}\n\nPlease investigate immediately.`
        });
      }
    } catch (error) {
      console.error('❌ Failed to send alert notification:', error);
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    try {
      await prisma.systemAlert.update({
        where: { id: alertId },
        data: {
          isResolved: true,
          resolvedAt: new Date()
        }
      });
      console.log(`✅ Alert resolved: ${alertId}`);
    } catch (error) {
      console.error('❌ Failed to resolve alert:', error);
      throw error;
    }
  }

  /**
   * Get monitoring metrics for dashboard
   */
  async getMonitoringMetrics(): Promise<MonitoringMetrics> {
    try {
      const [healthResults, queueStatus, lastEmail] = await Promise.all([
        this.performHealthCheck(),
        this.getQueueStatus(),
        prisma.emailLog.findFirst({
          where: { status: 'SENT' },
          orderBy: { sentAt: 'desc' },
          select: { sentAt: true }
        })
      ]);

      const activeAlerts = await prisma.systemAlert.findMany({
        where: { isResolved: false },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      // Calculate processing rate
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentEmails = await prisma.emailLog.count({
        where: {
          sentAt: { gte: tenMinutesAgo }
        }
      });

      const webhookEventsProcessed = await prisma.webhookEvent.count({
        where: {
          createdAt: { gte: tenMinutesAgo },
          processed: true
        }
      });

      return {
        emailsInQueue: queueStatus.totalInQueue,
        emailsProcessingPerMinute: Math.round(recentEmails / 10),
        averageProcessingTime: queueStatus.averageWaitTime,
        providerStatus: this.getProviderStatusFromHealthCheck(healthResults),
        apiRateLimitUsage: this.getAPIRateLimitUsage(healthResults),
        webhookEventsProcessed,
        lastEmailSent: lastEmail?.sentAt || new Date(),
        systemHealth: this.getOverallHealth(healthResults),
        alerts: activeAlerts as SystemAlert[]
      };
    } catch (error) {
      console.error('❌ Failed to get monitoring metrics:', error);
      throw error;
    }
  }

  /**
   * Get provider status from health check results
   */
  private getProviderStatusFromHealthCheck(healthResults: HealthCheckResult[]): ProviderHealthStatus[] {
    const mailgunHealth = healthResults.find(r => r.service === 'mailgun');
    
    return [{
      provider: 'MAILGUN',
      status: mailgunHealth?.status || 'critical',
      latency: mailgunHealth?.responseTime || 0,
      successRate: 99.5, // TODO: Calculate from actual data
      errorCount: 0, // TODO: Calculate from actual data
      lastError: undefined,
      rateLimitRemaining: mailgunHealth?.details?.rateLimitRemaining
    }];
  }

  /**
   * Get API rate limit usage from health check
   */
  private getAPIRateLimitUsage(healthResults: HealthCheckResult[]): number {
    const mailgunHealth = healthResults.find(r => r.service === 'mailgun');
    if (mailgunHealth?.details?.rateLimitRemaining && mailgunHealth?.details?.rateLimitLimit) {
      const remaining = mailgunHealth.details.rateLimitRemaining;
      const limit = mailgunHealth.details.rateLimitLimit;
      return ((limit - remaining) / limit) * 100;
    }
    return 0;
  }

  /**
   * Map service name to alert type
   */
  private getAlertTypeFromService(service: string): AlertType {
    const mapping: Record<string, AlertType> = {
      'mailgun': 'provider_failure',
      'database': 'database_connection',
      'queue': 'queue_backlog',
      'webhooks': 'webhook_failure',
      'deliverability': 'delivery_rate_low',
      'resources': 'email_volume_spike'
    };
    return mapping[service] || 'provider_failure';
  }

  /**
   * Start monitoring daemon (call this on app startup)
   */
  startMonitoring(): void {
    console.log('🔍 Starting email monitoring daemon...');
    
    // Perform health checks every 5 minutes
    setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('❌ Monitoring daemon error:', error);
      }
    }, 5 * 60 * 1000);

    // Initial health check
    setTimeout(() => this.performHealthCheck(), 5000);
    
    console.log('✅ Email monitoring daemon started');
  }
}

// Export singleton instance
export const emailMonitoring = new EmailMonitoringSystem();