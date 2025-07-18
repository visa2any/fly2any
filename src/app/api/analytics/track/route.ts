import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

// Validation schema for tracking events
const TrackingEventSchema = z.object({
  event_name: z.string(),
  value: z.number().optional(),
  currency: z.string().default('USD'),
  campaign_source: z.string().optional(),
  campaign_medium: z.string().optional(),
  campaign_name: z.string().optional(),
  campaign_content: z.string().optional(),
  campaign_term: z.string().optional(),
  gclid: z.string().optional(),
  fbclid: z.string().optional(),
  msclkid: z.string().optional(),
  page_path: z.string().optional(),
  user_agent: z.string().optional(),
  timestamp: z.string(),
  session_id: z.string().optional(),
  landing_page: z.string().optional(),
  referrer: z.string().optional(),
  lead_data: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    route: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
});

// Create analytics_events table if it doesn't exist
async function ensureAnalyticsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        event_name VARCHAR(100) NOT NULL,
        value DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'USD',
        campaign_source VARCHAR(100),
        campaign_medium VARCHAR(100),
        campaign_name VARCHAR(200),
        campaign_content VARCHAR(200),
        campaign_term VARCHAR(200),
        gclid VARCHAR(200),
        fbclid VARCHAR(200),
        msclkid VARCHAR(200),
        page_path VARCHAR(500),
        user_agent TEXT,
        session_id VARCHAR(100),
        landing_page VARCHAR(500),
        referrer VARCHAR(500),
        lead_name VARCHAR(100),
        lead_email VARCHAR(100),
        lead_phone VARCHAR(50),
        lead_route VARCHAR(200),
        lead_message TEXT,
        ip_address INET,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign_source ON analytics_events(campaign_source);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_gclid ON analytics_events(gclid);
    `;
  } catch (error) {
    console.error('Error creating analytics table:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure table exists
    await ensureAnalyticsTable();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = TrackingEventSchema.parse(body);

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';

    // Insert tracking event
    const result = await sql`
      INSERT INTO analytics_events (
        event_name,
        value,
        currency,
        campaign_source,
        campaign_medium,
        campaign_name,
        campaign_content,
        campaign_term,
        gclid,
        fbclid,
        msclkid,
        page_path,
        user_agent,
        session_id,
        landing_page,
        referrer,
        lead_name,
        lead_email,
        lead_phone,
        lead_route,
        lead_message,
        ip_address,
        created_at
      ) VALUES (
        ${validatedData.event_name},
        ${validatedData.value || null},
        ${validatedData.currency},
        ${validatedData.campaign_source || null},
        ${validatedData.campaign_medium || null},
        ${validatedData.campaign_name || null},
        ${validatedData.campaign_content || null},
        ${validatedData.campaign_term || null},
        ${validatedData.gclid || null},
        ${validatedData.fbclid || null},
        ${validatedData.msclkid || null},
        ${validatedData.page_path || null},
        ${validatedData.user_agent || null},
        ${validatedData.session_id || null},
        ${validatedData.landing_page || null},
        ${validatedData.referrer || null},
        ${validatedData.lead_data?.name || null},
        ${validatedData.lead_data?.email || null},
        ${validatedData.lead_data?.phone || null},
        ${validatedData.lead_data?.route || null},
        ${validatedData.lead_data?.message || null},
        ${ip},
        ${validatedData.timestamp}
      ) RETURNING id
    `;

    // Log successful tracking
    console.log(`📊 Analytics event tracked: ${validatedData.event_name}`, {
      id: result.rows[0].id,
      value: validatedData.value,
      source: validatedData.campaign_source,
    });

    return NextResponse.json({ 
      success: true, 
      id: result.rows[0].id,
      message: 'Event tracked successfully' 
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.format() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

// GET endpoint for analytics data (for dashboard)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const event_name = searchParams.get('event') || null;
  
  try {

    await ensureAnalyticsTable();

    // First check if table has any data
    const countResult = await sql`SELECT COUNT(*) as count FROM analytics_events`;
    const hasData = countResult.rows[0].count > 0;

    if (!hasData) {
      // Return empty but successful response
      return NextResponse.json({
        success: true,
        data: [],
        period: `${days} days`,
        total_events: 0,
        message: 'No data available yet'
      });
    }

    let result;
    if (event_name) {
      result = await sql`
        SELECT 
          event_name,
          COUNT(*) as event_count,
          SUM(value) as total_value,
          AVG(value) as avg_value,
          campaign_source,
          campaign_medium,
          DATE(created_at) as event_date
        FROM analytics_events 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        AND event_name = ${event_name}
        GROUP BY event_name, campaign_source, campaign_medium, DATE(created_at)
        ORDER BY created_at DESC
        LIMIT 1000
      `;
    } else {
      result = await sql`
        SELECT 
          event_name,
          COUNT(*) as event_count,
          SUM(value) as total_value,
          AVG(value) as avg_value,
          campaign_source,
          campaign_medium,
          DATE(created_at) as event_date
        FROM analytics_events 
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY event_name, campaign_source, campaign_medium, DATE(created_at)
        ORDER BY created_at DESC
        LIMIT 1000
      `;
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      period: `${days} days`,
      total_events: result.rowCount,
    });

  } catch (error) {
    console.error('Analytics query error:', error);
    
    // Return empty data instead of error to prevent UI from breaking
    return NextResponse.json({
      success: true,
      data: [],
      period: `${days} days`,
      total_events: 0,
      message: 'No data available',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
