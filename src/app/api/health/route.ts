import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { DatabaseFallback } from '@/lib/database-fallback';
import { promises as fs } from 'fs';
import path from 'path';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details?: string;
  timestamp: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  environment: string;
  timestamp: string;
  uptime: number;
  checks: HealthCheck[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  
  try {
    // Test PostgreSQL connection
    await sql`SELECT 1`;
    
    return {
      service: 'database',
      status: 'healthy',
      responseTime: Date.now() - start,
      details: 'PostgreSQL connection successful',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      details: `PostgreSQL connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    };
  }
}

async function checkFallbackDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  
  try {
    // Test file system access for fallback database
    const dataDir = path.join(process.cwd(), 'data');
    await fs.access(dataDir);
    
    // Test read/write capability
    const testFile = path.join(dataDir, 'health-test.json');
    const testData = { test: true, timestamp: new Date().toISOString() };
    
    await fs.writeFile(testFile, JSON.stringify(testData));
    const readData = await fs.readFile(testFile, 'utf-8');
    JSON.parse(readData);
    await fs.unlink(testFile); // Cleanup
    
    return {
      service: 'fallback_database',
      status: 'healthy',
      responseTime: Date.now() - start,
      details: 'File system read/write successful',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: 'fallback_database',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      details: `File system access failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    };
  }
}

async function checkEmailService(): Promise<HealthCheck> {
  const start = Date.now();
  
  try {
    // Check if environment variables are set
    const emailConfig = {
      ses: !!process.env.AWS_SES_REGION,
      smtp: !!process.env.SMTP_HOST,
      n8n: !!process.env.N8N_WEBHOOK_EMAIL
    };
    
    const configuredServices = Object.entries(emailConfig).filter(([_, configured]) => configured).map(([service]) => service);
    
    if (configuredServices.length === 0) {
      return {
        service: 'email',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        details: 'No email service configured',
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      service: 'email',
      status: 'healthy',
      responseTime: Date.now() - start,
      details: `Configured services: ${configuredServices.join(', ')}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: 'email',
      status: 'degraded',
      responseTime: Date.now() - start,
      details: `Email service check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    };
  }
}

async function checkN8NWebhooks(): Promise<HealthCheck> {
  const start = Date.now();
  
  try {
    const n8nConfig = {
      lead_webhook: !!process.env.N8N_WEBHOOK_LEAD,
      email_webhook: !!process.env.N8N_WEBHOOK_EMAIL
    };
    
    const configuredWebhooks = Object.entries(n8nConfig).filter(([_, configured]) => configured).map(([webhook]) => webhook);
    
    if (configuredWebhooks.length === 0) {
      return {
        service: 'n8n_webhooks',
        status: 'degraded',
        responseTime: Date.now() - start,
        details: 'No N8N webhooks configured',
        timestamp: new Date().toISOString()
      };
    }
    
    // Test webhook connectivity (basic check)
    let webhookTests = 0;
    let webhookSuccess = 0;
    
    if (process.env.N8N_WEBHOOK_LEAD) {
      webhookTests++;
      try {
        const response = await fetch(process.env.N8N_WEBHOOK_LEAD, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5s timeout
        });
        if (response.ok || response.status === 405) { // HEAD might not be allowed, but endpoint exists
          webhookSuccess++;
        }
      } catch (error) {
        // Webhook unreachable
      }
    }
    
    const successRate = webhookTests > 0 ? webhookSuccess / webhookTests : 0;
    
    return {
      service: 'n8n_webhooks',
      status: successRate === 1 ? 'healthy' : successRate > 0 ? 'degraded' : 'unhealthy',
      responseTime: Date.now() - start,
      details: `${webhookSuccess}/${webhookTests} webhooks reachable. Configured: ${configuredWebhooks.join(', ')}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: 'n8n_webhooks',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      details: `N8N webhook check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    };
  }
}

async function checkMemoryUsage(): Promise<HealthCheck> {
  const start = Date.now();
  
  try {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssUsedMB = Math.round(memUsage.rss / 1024 / 1024);
    
    // Consider degraded if heap usage > 80% or RSS > 512MB
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    const status = heapUsagePercent > 80 || rssUsedMB > 512 ? 'degraded' : 'healthy';
    
    return {
      service: 'memory',
      status,
      responseTime: Date.now() - start,
      details: `Heap: ${heapUsedMB}MB/${heapTotalMB}MB (${Math.round(heapUsagePercent)}%), RSS: ${rssUsedMB}MB`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: 'memory',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      details: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    };
  }
}

function getOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
  const hasUnhealthy = checks.some(check => check.status === 'unhealthy');
  const hasDegraded = checks.some(check => check.status === 'degraded');
  
  if (hasUnhealthy) return 'unhealthy';
  if (hasDegraded) return 'degraded';
  return 'healthy';
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Run all health checks in parallel
    const checks = await Promise.all([
      checkDatabase(),
      checkFallbackDatabase(),
      checkEmailService(),
      checkN8NWebhooks(),
      checkMemoryUsage()
    ]);
    
    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      degraded: checks.filter(c => c.status === 'degraded').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length
    };
    
    const overallStatus = getOverallStatus(checks);
    
    const response: HealthResponse = {
      status: overallStatus,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
      summary
    };
    
    // Set appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(response, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    // If health check itself fails
    const errorResponse: HealthResponse = {
      status: 'unhealthy',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: [{
        service: 'health_check',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        details: `Health check system failure: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }],
      summary: {
        total: 1,
        healthy: 0,
        degraded: 0,
        unhealthy: 1
      }
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// Lightweight health check for load balancers
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    // Quick basic checks only
    const quickChecks = await Promise.all([
      checkMemoryUsage(),
      checkFallbackDatabase()
    ]);
    
    const hasUnhealthy = quickChecks.some(check => check.status === 'unhealthy');
    
    return new NextResponse(null, { 
      status: hasUnhealthy ? 503 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}