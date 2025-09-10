import { NextRequest, NextResponse } from 'next/server';

/**
 * Performance Analytics API Endpoint
 * Handles Core Web Vitals and performance data collection
 */

interface PerformanceEvent {
  type: string;
  timestamp: number;
  page: string;
  [key: string]: any;
}

interface AnalyticsBatch {
  events: PerformanceEvent[];
}

export async function POST(request: NextRequest) {
  try {
    const data: AnalyticsBatch = await request.json();
    
    if (!data.events || !Array.isArray(data.events)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Process each event
    const processedEvents = data.events.map(event => ({
      ...event,
      receivedAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: getClientIP(request),
      referer: request.headers.get('referer'),
    }));

    // Store in database (implement according to your database setup)
    await storePerformanceData(processedEvents);

    // Send to external analytics if configured
    if (process.env.GOOGLE_ANALYTICS_ID) {
      await sendToGoogleAnalytics(processedEvents);
    }

    return NextResponse.json({ 
      success: true, 
      processed: processedEvents.length 
    });

  } catch (error) {
    console.error('Performance analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Retrieve performance data from database
    const data = await getPerformanceData({
      page,
      startDate,
      endDate,
      limit
    });

    // Calculate aggregated metrics
    const metrics = calculateMetrics(data);

    return NextResponse.json({
      data,
      metrics,
      summary: {
        totalEvents: data.length,
        timeRange: { startDate, endDate },
        page
      }
    });

  } catch (error) {
    console.error('Performance data retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance data' },
      { status: 500 }
    );
  }
}

// Helper functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

async function storePerformanceData(events: any[]): Promise<void> {
  // TODO: Implement database storage
  // Example implementations:
  
  // For PostgreSQL with Prisma:
  // await prisma.performanceEvent.createMany({ data: events });
  
  // For MongoDB:
  // await db.collection('performance_events').insertMany(events);
  
  // For now, just log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance events received:', events.length);
  }
}

async function sendToGoogleAnalytics(events: any[]): Promise<void> {
  // Send performance events to Google Analytics
  const promises = events.map(event => {
    if (event.type === 'web_vital') {
      return sendWebVitalToGA(event);
    }
    return Promise.resolve();
  });

  await Promise.allSettled(promises);
}

async function sendWebVitalToGA(event: any): Promise<void> {
  try {
    // Send to Google Analytics 4 Measurement Protocol
    const measurementId = process.env.GOOGLE_ANALYTICS_ID;
    const apiSecret = process.env.GOOGLE_ANALYTICS_API_SECRET;
    
    if (!measurementId || !apiSecret) return;

    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: event.clientId || 'anonymous',
          events: [{
            name: 'web_vitals',
            params: {
              metric_name: event.name,
              metric_value: event.value,
              metric_id: event.id,
              custom_parameter: event.page
            }
          }]
        })
      }
    );

    if (!response.ok) {
      console.warn('Failed to send to Google Analytics:', response.statusText);
    }
  } catch (error) {
    console.warn('Google Analytics error:', error);
  }
}

async function getPerformanceData(filters: {
  page?: string;
  startDate?: string | null;
  endDate?: string | null;
  limit: number;
}): Promise<any[]> {
  // TODO: Implement database retrieval
  // This should query your database based on the filters
  
  // Placeholder return
  return [];
}

function calculateMetrics(data: any[]): any {
  if (!data.length) {
    return {
      avgLCP: 0,
      avgFID: 0,
      avgCLS: 0,
      avgFCP: 0,
      avgTTFB: 0,
      performanceScore: 0,
      sampleSize: 0
    };
  }

  const webVitals = data.filter(event => event.type === 'web_vital');
  
  const lcpValues = webVitals.filter(e => e.name === 'lcp').map(e => e.value);
  const fidValues = webVitals.filter(e => e.name === 'fid').map(e => e.value);
  const clsValues = webVitals.filter(e => e.name === 'cls').map(e => e.value);
  const fcpValues = webVitals.filter(e => e.name === 'fcp').map(e => e.value);
  const ttfbValues = webVitals.filter(e => e.name === 'ttfb').map(e => e.value);

  const avgLCP = lcpValues.reduce((a, b) => a + b, 0) / lcpValues.length || 0;
  const avgFID = fidValues.reduce((a, b) => a + b, 0) / fidValues.length || 0;
  const avgCLS = clsValues.reduce((a, b) => a + b, 0) / clsValues.length || 0;
  const avgFCP = fcpValues.reduce((a, b) => a + b, 0) / fcpValues.length || 0;
  const avgTTFB = ttfbValues.reduce((a, b) => a + b, 0) / ttfbValues.length || 0;

  // Calculate performance score
  const lcpScore = avgLCP <= 2500 ? 100 : avgLCP <= 4000 ? 50 : 0;
  const fidScore = avgFID <= 100 ? 100 : avgFID <= 300 ? 50 : 0;
  const clsScore = avgCLS <= 0.1 ? 100 : avgCLS <= 0.25 ? 50 : 0;
  const performanceScore = (lcpScore + fidScore + clsScore) / 3;

  return {
    avgLCP,
    avgFID,
    avgCLS,
    avgFCP,
    avgTTFB,
    performanceScore: Math.round(performanceScore),
    sampleSize: webVitals.length,
    breakdown: {
      lcp: { avg: avgLCP, score: lcpScore, samples: lcpValues.length },
      fid: { avg: avgFID, score: fidScore, samples: fidValues.length },
      cls: { avg: avgCLS, score: clsScore, samples: clsValues.length },
      fcp: { avg: avgFCP, samples: fcpValues.length },
      ttfb: { avg: avgTTFB, samples: ttfbValues.length }
    }
  };
}