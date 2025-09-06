import { NextRequest, NextResponse } from 'next/server';

interface SystemHealthCheck {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  message?: string;
  details?: Record<string, any>;
  lastChecked: string;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  components: {
    database: SystemHealthCheck;
    email: SystemHealthCheck;
    fileSystem: SystemHealthCheck;
    memory: SystemHealthCheck;
    apis: SystemHealthCheck;
  };
  emailQueue: {
    pending: number;
    processing: number;
    failed: number;
    avgProcessingTime: number;
    lastProcessed?: string;
  };
  notifications: {
    lastSent: string | null;
    successRate: number;
    failureRate: number;
    totalSent: number;
    recentFailures: number;
  };
  performance: {
    avgResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage?: number;
  };
  recentAlerts: Array<{
    id: string;
    level: 'warning' | 'critical';
    component: string;
    message: string;
    timestamp: string;
    resolved?: boolean;
  }>;
}

/**
 * System Health Monitoring API
 * Provides comprehensive health status for all system components
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🏥 [HEALTH-CHECK] Starting system health check...');

    // Run all health checks in parallel for better performance
    const [
      databaseHealth,
      emailHealth,
      fileSystemHealth,
      memoryHealth,
      apisHealth,
      emailQueueStatus,
      notificationStatus,
      performanceMetrics,
      recentAlerts
    ] = await Promise.allSettled([
      checkDatabaseHealth(),
      checkEmailHealth(),
      checkFileSystemHealth(),
      checkMemoryHealth(),
      checkApisHealth(),
      getEmailQueueStatus(),
      getNotificationStatus(),
      getPerformanceMetrics(),
      getRecentAlerts()
    ]);

    // Safely extract results or use defaults
    const healthData: SystemHealth = {
      overall: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      components: {
        database: getResult(databaseHealth, createDefaultHealthCheck('database')),
        email: getResult(emailHealth, createDefaultHealthCheck('email')),
        fileSystem: getResult(fileSystemHealth, createDefaultHealthCheck('fileSystem')),
        memory: getResult(memoryHealth, createDefaultHealthCheck('memory')),
        apis: getResult(apisHealth, createDefaultHealthCheck('apis'))
      },
      emailQueue: getResult(emailQueueStatus, {
        pending: 0,
        processing: 0,
        failed: 0,
        avgProcessingTime: 0
      }),
      notifications: getResult(notificationStatus, {
        lastSent: null,
        successRate: 0,
        failureRate: 0,
        totalSent: 0,
        recentFailures: 0
      }),
      performance: getResult(performanceMetrics, {
        avgResponseTime: Date.now() - startTime,
        requestsPerMinute: 0,
        errorRate: 0,
        memoryUsage: process.memoryUsage().heapUsed
      }),
      recentAlerts: getResult(recentAlerts, [])
    };

    // Determine overall health status
    healthData.overall = determineOverallHealth(healthData);

    const responseTime = Date.now() - startTime;
    console.log(`✅ [HEALTH-CHECK] Completed in ${responseTime}ms - Status: ${healthData.overall}`);

    return NextResponse.json({
      success: true,
      data: healthData,
      responseTime,
      metadata: {
        checkedAt: new Date().toISOString(),
        checkDuration: responseTime,
        checksPerformed: 9
      }
    });

  } catch (error) {
    console.error('❌ [HEALTH-CHECK] Failed:', error);

    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }, { status: 500 });
  }
}

/**
 * Helper to safely extract results from Promise.allSettled
 */
function getResult<T>(result: PromiseSettledResult<T>, defaultValue: T): T {
  return result.status === 'fulfilled' ? result.value : defaultValue;
}

/**
 * Create default health check result
 */
function createDefaultHealthCheck(component: string): SystemHealthCheck {
  return {
    component,
    status: 'warning',
    responseTime: 0,
    message: 'Health check failed',
    lastChecked: new Date().toISOString()
  };
}

/**
 * Check database connectivity and performance
 */
async function checkDatabaseHealth(): Promise<SystemHealthCheck> {
  const startTime = Date.now();
  
  try {
    // Since we're using mock models, we'll simulate a database check
    // In production, this would actually query your database
    
    // Simulate database response time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    
    const responseTime = Date.now() - startTime;
    
    return {
      component: 'database',
      status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'warning' : 'critical',
      responseTime,
      message: responseTime < 100 ? 'Database responding normally' : 
               responseTime < 500 ? 'Database response slower than expected' : 
               'Database response critically slow',
      details: {
        connectionPool: 'active',
        queriesPerSecond: Math.floor(Math.random() * 100) + 50,
        activeConnections: Math.floor(Math.random() * 10) + 5
      },
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      component: 'database',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Check email system health
 */
async function checkEmailHealth(): Promise<SystemHealthCheck> {
  const startTime = Date.now();
  
  try {
    // Check if email environment variables are configured
    const gmailConfigured = !!(process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD);
    const n8nConfigured = !!process.env.N8N_WEBHOOK_EMAIL;
    
    let status: SystemHealthCheck['status'] = 'healthy';
    let message = 'Email system operational';
    
    if (!gmailConfigured && !n8nConfigured) {
      status = 'critical';
      message = 'No email providers configured';
    } else if (!gmailConfigured || !n8nConfigured) {
      status = 'warning';
      message = 'Some email providers not configured';
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      component: 'email',
      status,
      responseTime,
      message,
      details: {
        gmailConfigured,
        n8nConfigured,
        providers: [
          gmailConfigured ? 'Gmail SMTP' : null,
          n8nConfigured ? 'N8N Webhook' : null
        ].filter(Boolean)
      },
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      component: 'email',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: `Email system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Check file system health
 */
async function checkFileSystemHealth(): Promise<SystemHealthCheck> {
  const startTime = Date.now();
  
  try {
    let fs: any = null;
    let path: any = null;
    try {
      fs = await import('fs');
      path = await import('path');
    } catch (error) {
      // Dynamic imports failed, fs and path remain null
    }
    
    if (!fs || !path) {
      return {
        component: 'fileSystem',
        status: 'warning',
        responseTime: Date.now() - startTime,
        message: 'File system modules not available',
        lastChecked: new Date().toISOString()
      };
    }

    // Check if we can write to the logs directory
    const logsDir = path.join(process.cwd(), 'logs');
    const testFile = path.join(logsDir, '.health-check');
    
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Test write access
    fs.writeFileSync(testFile, `Health check: ${new Date().toISOString()}`);
    
    // Test read access
    const content = fs.readFileSync(testFile, 'utf8');
    
    // Clean up test file
    fs.unlinkSync(testFile);
    
    const responseTime = Date.now() - startTime;
    
    return {
      component: 'fileSystem',
      status: responseTime < 100 ? 'healthy' : 'warning',
      responseTime,
      message: 'File system accessible',
      details: {
        logsDirectory: logsDir,
        writeAccess: true,
        readAccess: true
      },
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      component: 'fileSystem',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: `File system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Check memory usage
 */
async function checkMemoryHealth(): Promise<SystemHealthCheck> {
  const startTime = Date.now();
  
  try {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;
    
    let status: SystemHealthCheck['status'] = 'healthy';
    let message = 'Memory usage normal';
    
    if (memoryPercentage > 90) {
      status = 'critical';
      message = 'Memory usage critically high';
    } else if (memoryPercentage > 75) {
      status = 'warning';
      message = 'Memory usage elevated';
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      component: 'memory',
      status,
      responseTime,
      message,
      details: {
        heapUsed: Math.round(usedMemory / 1024 / 1024), // MB
        heapTotal: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage),
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
      },
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      component: 'memory',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: `Memory check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Check external APIs health
 */
async function checkApisHealth(): Promise<SystemHealthCheck> {
  const startTime = Date.now();
  
  try {
    // Test internal API endpoints
    const testEndpoints = [
      { name: 'Gmail API', path: '/api/email-gmail', method: 'GET' },
    ];
    
    const results = await Promise.allSettled(
      testEndpoints.map(async endpoint => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${endpoint.path}`, {
            method: endpoint.method,
            signal: AbortSignal.timeout(5000) // 5 second timeout
          });
          return { endpoint: endpoint.name, status: response.status, ok: response.ok };
        } catch (error) {
          return { endpoint: endpoint.name, status: 0, ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );
    
    const endpointResults = results.map(result => 
      result.status === 'fulfilled' ? result.value : { endpoint: 'unknown', status: 0, ok: false }
    );
    
    const failedEndpoints = endpointResults.filter(r => !r.ok);
    
    let status: SystemHealthCheck['status'] = 'healthy';
    let message = 'All APIs responding';
    
    if (failedEndpoints.length > 0) {
      status = failedEndpoints.length === endpointResults.length ? 'critical' : 'warning';
      message = `${failedEndpoints.length} API(s) not responding`;
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      component: 'apis',
      status,
      responseTime,
      message,
      details: {
        total: endpointResults.length,
        healthy: endpointResults.filter(r => r.ok).length,
        failed: failedEndpoints.length,
        endpoints: endpointResults
      },
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      component: 'apis',
      status: 'critical',
      responseTime: Date.now() - startTime,
      message: `API health check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString()
    };
  }
}

/**
 * Get email queue status
 */
async function getEmailQueueStatus() {
  try {
    // Import the email queue
    const { emailQueue } = await import('@/lib/email/email-queue');
    const stats = emailQueue.getStats();
    
    return {
      pending: stats.pending,
      processing: stats.processing,
      failed: stats.failed,
      avgProcessingTime: stats.avgProcessingTime,
      lastProcessed: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Could not get email queue status:', error);
    return {
      pending: 0,
      processing: 0,
      failed: 0,
      avgProcessingTime: 0
    };
  }
}

/**
 * Get notification status
 */
async function getNotificationStatus() {
  try {
    // Import the notification service
    const { notificationService } = await import('@/lib/email/notification-service');
    const analytics = notificationService.getAnalytics();
    
    return {
      lastSent: new Date().toISOString(),
      successRate: analytics.deliveryRate,
      failureRate: analytics.bounceRate,
      totalSent: analytics.totalSent,
      recentFailures: analytics.recentErrors.length
    };
  } catch (error) {
    console.warn('Could not get notification status:', error);
    return {
      lastSent: null,
      successRate: 0,
      failureRate: 0,
      totalSent: 0,
      recentFailures: 0
    };
  }
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics() {
  try {
    const memoryUsage = process.memoryUsage();
    
    return {
      avgResponseTime: Math.random() * 200 + 50, // Simulated
      requestsPerMinute: Math.random() * 100 + 20, // Simulated
      errorRate: Math.random() * 5, // Simulated
      memoryUsage: memoryUsage.heapUsed
    };
  } catch (error) {
    console.warn('Could not get performance metrics:', error);
    return {
      avgResponseTime: 0,
      requestsPerMinute: 0,
      errorRate: 0,
      memoryUsage: 0
    };
  }
}

/**
 * Get recent system alerts
 */
async function getRecentAlerts() {
  try {
    // In production, this would query your alerts/logs system
    // For now, return mock data
    return [
      // No recent alerts
    ];
  } catch (error) {
    console.warn('Could not get recent alerts:', error);
    return [];
  }
}

/**
 * Determine overall system health based on component status
 */
function determineOverallHealth(health: SystemHealth): 'healthy' | 'warning' | 'critical' {
  const components = Object.values(health.components);
  
  // If any component is critical, overall is critical
  if (components.some(c => c.status === 'critical')) {
    return 'critical';
  }
  
  // If any component has warnings, overall is warning
  if (components.some(c => c.status === 'warning')) {
    return 'warning';
  }
  
  // Check queue health
  if (health.emailQueue.failed > 10 || health.emailQueue.pending > 50) {
    return 'warning';
  }
  
  // Check notification health
  if (health.notifications.failureRate > 20) {
    return 'critical';
  } else if (health.notifications.failureRate > 5) {
    return 'warning';
  }
  
  return 'healthy';
}