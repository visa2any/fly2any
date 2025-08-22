/**
 * ⚡ REAL-TIME EMAIL ANALYTICS API
 * Provides real-time system status and monitoring data
 */

import { NextRequest, NextResponse } from 'next/server';
import { emailMonitoring } from '@/lib/email/monitoring';

export async function GET(request: NextRequest) {
  try {
    console.log('⚡ Fetching real-time email analytics...');

    // Get monitoring metrics
    const monitoringMetrics = await emailMonitoring.getMonitoringMetrics();

    const response = {
      emailsInQueue: monitoringMetrics.emailsInQueue,
      emailsProcessingPerMinute: monitoringMetrics.emailsProcessingPerMinute,
      lastEmailSent: monitoringMetrics.lastEmailSent.toISOString(),
      systemHealth: monitoringMetrics.systemHealth,
      apiRateLimitUsage: monitoringMetrics.apiRateLimitUsage,
      webhookEventsProcessed: monitoringMetrics.webhookEventsProcessed,
      providerStatus: monitoringMetrics.providerStatus,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Real-time data fetched:`, {
      systemHealth: response.systemHealth,
      emailsInQueue: response.emailsInQueue,
      processingRate: response.emailsProcessingPerMinute
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Failed to fetch real-time analytics:', error);
    
    // Return fallback data if monitoring system fails
    const fallbackResponse = {
      emailsInQueue: 0,
      emailsProcessingPerMinute: 0,
      lastEmailSent: new Date().toISOString(),
      systemHealth: 'warning' as const,
      apiRateLimitUsage: 0,
      webhookEventsProcessed: 0,
      providerStatus: [{
        provider: 'MAILGUN',
        status: 'warning' as const,
        latency: 0,
        successRate: 0,
        errorCount: 1,
        lastError: 'Monitoring system unavailable'
      }],
      timestamp: new Date().toISOString(),
      error: 'Monitoring system temporarily unavailable'
    };

    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}