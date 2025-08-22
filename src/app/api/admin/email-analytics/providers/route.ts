/**
 * 🔌 EMAIL PROVIDERS STATUS API
 * Provides email provider health and performance data
 */

import { NextRequest, NextResponse } from 'next/server';
import { emailMonitoring } from '@/lib/email/monitoring';

export async function GET(request: NextRequest) {
  try {
    console.log('🔌 Fetching email provider status...');

    // Perform health check
    const healthResults = await emailMonitoring.performHealthCheck();

    // Get provider statistics
    const providerStats = healthResults.map(result => {
      // Map health check results to provider stats format
      const isMailgunProvider = result.service === 'mailgun';
      
      return {
        provider: isMailgunProvider ? 'MAILGUN' : result.service.toUpperCase(),
        sent: result.details?.emailsSent || 0,
        delivered: result.details?.emailsDelivered || 0,
        failed: result.details?.emailsFailed || 0,
        deliveryRate: isMailgunProvider ? calculateDeliveryRate(result) : 0,
        avgResponseTime: result.responseTime,
        status: result.status,
        lastChecked: result.lastChecked.toISOString(),
        rateLimitRemaining: result.details?.rateLimitRemaining,
        rateLimitLimit: result.details?.rateLimitLimit,
        details: {
          message: result.message,
          ...result.details
        }
      };
    });

    console.log(`✅ Provider status fetched for ${providerStats.length} providers`);
    return NextResponse.json(providerStats);

  } catch (error: any) {
    console.error('❌ Failed to fetch provider status:', error);
    
    // Return fallback data
    const fallbackStats = [{
      provider: 'MAILGUN',
      sent: 0,
      delivered: 0,
      failed: 0,
      deliveryRate: 0,
      avgResponseTime: 0,
      status: 'warning' as const,
      lastChecked: new Date().toISOString(),
      details: {
        message: 'Provider status temporarily unavailable',
        error: error.message
      }
    }];

    return NextResponse.json(fallbackStats, { status: 200 });
  }
}

function calculateDeliveryRate(healthResult: any): number {
  if (!healthResult.details) return 0;
  
  const sent = healthResult.details.emailsSent || 0;
  const delivered = healthResult.details.emailsDelivered || 0;
  
  if (sent === 0) return 0;
  return (delivered / sent) * 100;
}