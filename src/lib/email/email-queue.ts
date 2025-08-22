/**
 * Enterprise Email Queue System
 * Handles email delivery with retry logic, rate limiting, and monitoring
 */

interface EmailJob {
  id: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  type: 'lead_notification' | 'customer_confirmation' | 'marketing' | 'system';
  attempts: number;
  maxAttempts: number;
  data: {
    to: string | string[];
    subject: string;
    template: string;
    templateData: Record<string, any>;
    provider?: 'gmail' | 'sendgrid' | 'n8n' | 'resend';
    tags?: string[];
  };
  scheduledAt: Date;
  createdAt: Date;
  lastAttemptAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed';
  metadata?: Record<string, any>;
}

interface EmailProvider {
  name: string;
  priority: number;
  rateLimit: number; // emails per minute
  isHealthy: boolean;
  lastHealthCheck: Date;
  send: (job: EmailJob) => Promise<EmailSendResult>;
}

interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: string;
  deliveredAt: Date;
  error?: string;
  retryAfter?: number; // seconds
}

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  avgProcessingTime: number;
  throughput: number; // emails per hour
  errorRate: number;
}

class EmailQueue {
  private queue: Map<string, EmailJob> = new Map();
  private processing: Set<string> = new Set();
  private providers: EmailProvider[] = [];
  private isRunning = false;
  private processingInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;
  private stats: QueueStats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    avgProcessingTime: 0,
    throughput: 0,
    errorRate: 0
  };

  constructor() {
    this.initializeProviders();
    this.startHealthChecks();
  }

  /**
   * Add email job to queue with priority handling
   */
  async addJob(emailData: Omit<EmailJob['data'], 'templateData'> & { templateData: Record<string, any> }, options?: {
    priority?: EmailJob['priority'];
    delay?: number; // seconds
    maxAttempts?: number;
  }): Promise<string> {
    const jobId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const job: EmailJob = {
      id: jobId,
      priority: options?.priority || 'normal',
      type: this.inferEmailType(emailData.template),
      attempts: 0,
      maxAttempts: options?.maxAttempts || 3,
      data: emailData,
      scheduledAt: new Date(now.getTime() + (options?.delay || 0) * 1000),
      createdAt: now,
      deliveryStatus: 'pending'
    };

    this.queue.set(jobId, job);
    this.updateStats();
    
    // Log job creation
    console.log(`📧 [EMAIL-QUEUE] Job ${jobId} added`, {
      priority: job.priority,
      type: job.type,
      recipient: Array.isArray(emailData.to) ? emailData.to.length + ' recipients' : emailData.to,
      template: emailData.template,
      scheduledAt: job.scheduledAt.toISOString()
    });

    return jobId;
  }

  /**
   * Start processing the queue
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 2000); // Process every 2 seconds

    console.log('📧 [EMAIL-QUEUE] Queue processing started');
  }

  /**
   * Stop processing the queue
   */
  stop(): void {
    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    console.log('📧 [EMAIL-QUEUE] Queue processing stopped');
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return { ...this.stats };
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): EmailJob | undefined {
    return this.queue.get(jobId);
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: EmailJob['deliveryStatus']): EmailJob[] {
    return Array.from(this.queue.values()).filter(job => job.deliveryStatus === status);
  }

  /**
   * Retry failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    const job = this.queue.get(jobId);
    if (!job || job.deliveryStatus !== 'failed') {
      return false;
    }

    job.attempts = 0;
    job.deliveryStatus = 'pending';
    job.scheduledAt = new Date();
    job.error = undefined;
    job.failedAt = undefined;

    console.log(`📧 [EMAIL-QUEUE] Job ${jobId} manually retried`);
    return true;
  }

  /**
   * Process the queue - main worker function
   */
  private async processQueue(): Promise<void> {
    const availableJobs = this.getAvailableJobs();
    const healthyProviders = this.getHealthyProviders();

    if (availableJobs.length === 0 || healthyProviders.length === 0) {
      return;
    }

    // Process jobs in priority order
    const sortedJobs = availableJobs.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Process up to 5 jobs concurrently
    const jobsToProcess = sortedJobs.slice(0, 5);
    
    await Promise.all(
      jobsToProcess.map(job => this.processJob(job, healthyProviders))
    );
  }

  /**
   * Process individual email job
   */
  private async processJob(job: EmailJob, providers: EmailProvider[]): Promise<void> {
    if (this.processing.has(job.id)) return;

    this.processing.add(job.id);
    job.deliveryStatus = 'pending';
    job.lastAttemptAt = new Date();
    job.attempts++;

    const startTime = Date.now();

    try {
      // Select best available provider
      const provider = this.selectProvider(providers, job);
      if (!provider) {
        throw new Error('No available email providers');
      }

      console.log(`📧 [EMAIL-QUEUE] Processing job ${job.id} with ${provider.name}`, {
        attempt: job.attempts,
        maxAttempts: job.maxAttempts,
        recipient: Array.isArray(job.data.to) ? job.data.to.length + ' recipients' : job.data.to
      });

      // Send email
      const result = await provider.send(job);
      
      if (result.success) {
        job.deliveryStatus = 'sent';
        job.completedAt = new Date();
        job.metadata = {
          ...job.metadata,
          messageId: result.messageId,
          provider: result.provider,
          deliveredAt: result.deliveredAt,
          processingTime: Date.now() - startTime
        };

        console.log(`✅ [EMAIL-QUEUE] Job ${job.id} completed successfully`, {
          provider: result.provider,
          messageId: result.messageId,
          processingTime: Date.now() - startTime
        });

        this.stats.completed++;
      } else {
        throw new Error(result.error || 'Email sending failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      job.error = errorMessage;

      console.error(`❌ [EMAIL-QUEUE] Job ${job.id} failed (attempt ${job.attempts}/${job.maxAttempts})`, {
        error: errorMessage,
        processingTime: Date.now() - startTime
      });

      if (job.attempts >= job.maxAttempts) {
        job.deliveryStatus = 'failed';
        job.failedAt = new Date();
        this.stats.failed++;
        
        // Log permanent failure
        console.error(`💀 [EMAIL-QUEUE] Job ${job.id} permanently failed after ${job.maxAttempts} attempts`);
      } else {
        // Schedule retry with exponential backoff
        const backoffDelay = Math.pow(2, job.attempts) * 60 * 1000; // 2^attempts minutes
        job.scheduledAt = new Date(Date.now() + backoffDelay);
        job.deliveryStatus = 'pending';

        console.log(`⏰ [EMAIL-QUEUE] Job ${job.id} scheduled for retry in ${backoffDelay/1000}s`);
      }
    } finally {
      this.processing.delete(job.id);
      this.updateStats();
    }
  }

  /**
   * Get jobs available for processing
   */
  private getAvailableJobs(): EmailJob[] {
    const now = new Date();
    return Array.from(this.queue.values()).filter(job =>
      job.deliveryStatus === 'pending' &&
      job.scheduledAt <= now &&
      !this.processing.has(job.id) &&
      job.attempts < job.maxAttempts
    );
  }

  /**
   * Get healthy email providers
   */
  private getHealthyProviders(): EmailProvider[] {
    return this.providers.filter(provider => provider.isHealthy);
  }

  /**
   * Select best provider for job
   */
  private selectProvider(providers: EmailProvider[], job: EmailJob): EmailProvider | null {
    if (providers.length === 0) return null;

    // If job specifies a provider, try to use it
    if (job.data.provider) {
      const preferredProvider = providers.find(p => p.name === job.data.provider);
      if (preferredProvider) return preferredProvider;
    }

    // Otherwise, select by priority and rate limits
    return providers.reduce((best, current) => {
      if (!best) return current;
      
      // Higher priority wins
      if (current.priority > best.priority) return current;
      if (current.priority < best.priority) return best;
      
      // If same priority, prefer higher rate limit
      return current.rateLimit > best.rateLimit ? current : best;
    });
  }

  /**
   * Initialize email providers
   */
  private initializeProviders(): void {
    // Gmail SMTP Provider
    this.providers.push({
      name: 'gmail',
      priority: 3,
      rateLimit: 30, // 30 emails per minute
      isHealthy: true,
      lastHealthCheck: new Date(),
      send: async (job: EmailJob) => {
        try {
          const response = await fetch('/api/email-gmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: Array.isArray(job.data.to) ? job.data.to[0] : job.data.to,
              subject: job.data.subject,
              html: await this.renderTemplate(job.data.template, job.data.templateData),
              text: this.generateTextFromTemplate(job.data.template, job.data.templateData)
            })
          });

          const result = await response.json();
          return {
            success: result.success,
            messageId: result.messageId,
            provider: 'gmail',
            deliveredAt: new Date(),
            error: result.error
          };
        } catch (error) {
          return {
            success: false,
            provider: 'gmail',
            deliveredAt: new Date(),
            error: error instanceof Error ? error.message : 'Gmail provider error'
          };
        }
      }
    });

    // N8N Webhook Provider
    if (process.env.N8N_WEBHOOK_EMAIL) {
      this.providers.push({
        name: 'n8n',
        priority: 2,
        rateLimit: 60, // 60 emails per minute
        isHealthy: true,
        lastHealthCheck: new Date(),
        send: async (job: EmailJob) => {
          try {
            const response = await fetch(process.env.N8N_WEBHOOK_EMAIL!, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: job.data.to,
                subject: job.data.subject,
                html: await this.renderTemplate(job.data.template, job.data.templateData),
                template: job.data.template,
                templateData: job.data.templateData,
                timestamp: new Date().toISOString()
              })
            });

            return {
              success: response.ok,
              messageId: `n8n_${Date.now()}`,
              provider: 'n8n',
              deliveredAt: new Date(),
              error: response.ok ? undefined : `N8N webhook failed: ${response.status}`
            };
          } catch (error) {
            return {
              success: false,
              provider: 'n8n',
              deliveredAt: new Date(),
              error: error instanceof Error ? error.message : 'N8N provider error'
            };
          }
        }
      });
    }

    console.log(`📧 [EMAIL-QUEUE] Initialized ${this.providers.length} email providers:`, 
      this.providers.map(p => `${p.name} (priority: ${p.priority})`).join(', '));
  }

  /**
   * Start health checks for providers
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.checkProviderHealth();
    }, 60000); // Check every minute
  }

  /**
   * Check health of all providers
   */
  private async checkProviderHealth(): Promise<void> {
    for (const provider of this.providers) {
      try {
        // Simple health check - try to connect/validate
        if (provider.name === 'gmail') {
          provider.isHealthy = !!(process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD);
        } else if (provider.name === 'n8n') {
          provider.isHealthy = !!process.env.N8N_WEBHOOK_EMAIL;
        }
        
        provider.lastHealthCheck = new Date();
      } catch (error) {
        provider.isHealthy = false;
        console.warn(`⚠️ [EMAIL-QUEUE] Provider ${provider.name} health check failed:`, error);
      }
    }
  }

  /**
   * Infer email type from template
   */
  private inferEmailType(template: string): EmailJob['type'] {
    if (template.includes('lead') || template.includes('notification')) return 'lead_notification';
    if (template.includes('confirmation') || template.includes('welcome')) return 'customer_confirmation';
    if (template.includes('marketing') || template.includes('newsletter')) return 'marketing';
    return 'system';
  }

  /**
   * Render email template (placeholder implementation)
   */
  private async renderTemplate(template: string, data: Record<string, any>): Promise<string> {
    // This would integrate with your template system
    // For now, return a simple placeholder
    return `<html><body><h1>Email Template: ${template}</h1><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`;
  }

  /**
   * Generate text version from template
   */
  private generateTextFromTemplate(template: string, data: Record<string, any>): string {
    return `Email Template: ${template}\n\n${Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n')}`;
  }

  /**
   * Update queue statistics
   */
  private updateStats(): void {
    const jobs = Array.from(this.queue.values());
    this.stats.pending = jobs.filter(j => j.deliveryStatus === 'pending').length;
    this.stats.processing = this.processing.size;
    
    // Calculate other stats...
    const completedJobs = jobs.filter(j => j.deliveryStatus === 'sent');
    const failedJobs = jobs.filter(j => j.deliveryStatus === 'failed');
    
    this.stats.errorRate = jobs.length > 0 ? (failedJobs.length / jobs.length) * 100 : 0;
    
    if (completedJobs.length > 0) {
      const totalProcessingTime = completedJobs.reduce((sum, job) => 
        sum + (job.metadata?.processingTime || 0), 0);
      this.stats.avgProcessingTime = totalProcessingTime / completedJobs.length;
    }
  }
}

// Singleton instance
export const emailQueue = new EmailQueue();

// Auto-start the queue
emailQueue.start();

export type { EmailJob, EmailProvider, EmailSendResult, QueueStats };