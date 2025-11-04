/**
 * Admin Webhooks API
 * Provides webhook event management for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import { handleWebhookEvent, type DuffelWebhookEvent } from '@/lib/webhooks/event-handlers';

/**
 * GET - Retrieve webhook events with filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);

    // Query parameters
    const status = searchParams.get('status'); // received, processing, processed, failed
    const eventType = searchParams.get('event_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query dynamically based on filters
    let query = `
      SELECT
        id,
        event_type,
        event_data,
        status,
        error_message,
        retry_count,
        received_at,
        processed_at,
        created_at
      FROM webhook_events
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (eventType) {
      query += ` AND event_type = $${paramIndex}`;
      params.push(eventType);
      paramIndex++;
    }

    query += ` ORDER BY received_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute query
    const events = await executeQuery(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM webhook_events WHERE 1=1`;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (eventType) {
      countQuery += ` AND event_type = $${countParamIndex}`;
      countParams.push(eventType);
    }

    const countResult = await executeQuery(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0');

    // Get statistics
    const stats = await getWebhookStats();

    return NextResponse.json({
      events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      stats,
    });

  } catch (error) {
    console.error('[Admin Webhooks API] Error fetching webhooks:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch webhook events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Retry failed webhook event
 */
export async function POST(req: NextRequest) {
  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { eventId, action } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (action === 'retry') {
      // Fetch event from database
      const result = await sql`
        SELECT * FROM webhook_events WHERE id = ${eventId}
      `;

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      const event = result[0];

      // Parse event data
      const eventData = typeof event.event_data === 'string'
        ? JSON.parse(event.event_data)
        : event.event_data;

      // Update retry count
      await sql`
        UPDATE webhook_events
        SET
          status = 'processing',
          retry_count = retry_count + 1,
          error_message = NULL
        WHERE id = ${eventId}
      `;

      // Retry processing
      try {
        await handleWebhookEvent(eventData as DuffelWebhookEvent);

        // Update as processed
        await sql`
          UPDATE webhook_events
          SET
            status = 'processed',
            processed_at = ${new Date().toISOString()}
          WHERE id = ${eventId}
        `;

        return NextResponse.json({
          success: true,
          message: 'Event processed successfully',
          eventId,
        });

      } catch (error) {
        // Update with error
        await sql`
          UPDATE webhook_events
          SET
            status = 'failed',
            error_message = ${error instanceof Error ? error.message : 'Unknown error'}
          WHERE id = ${eventId}
        `;

        return NextResponse.json(
          {
            error: 'Failed to process event',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[Admin Webhooks API] Error processing request:', error);

    return NextResponse.json(
      {
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to execute parameterized queries
 * (Neon's sql template doesn't support dynamic parameter building well)
 */
async function executeQuery(query: string, params: any[]): Promise<any[]> {
  // For simple queries without parameters
  if (params.length === 0) {
    return await sql`${sql.unsafe(query)}` as any[];
  }

  // Build query using Neon's sql template with dynamic parameters
  // This is a workaround for Neon's template limitation
  let result: any[] = [];

  if (params.length === 2 && query.includes('LIMIT') && query.includes('OFFSET')) {
    // Special case for pagination queries
    const [limit, offset] = params;

    if (query.includes('status =')) {
      const status = params[0];
      const limitVal = params[1];
      const offsetVal = params[2];
      result = await sql`
        SELECT
          id,
          event_type,
          event_data,
          status,
          error_message,
          retry_count,
          received_at,
          processed_at,
          created_at
        FROM webhook_events
        WHERE status = ${status}
        ORDER BY received_at DESC
        LIMIT ${limitVal} OFFSET ${offsetVal}
      ` as any[];
    } else {
      result = await sql`
        SELECT
          id,
          event_type,
          event_data,
          status,
          error_message,
          retry_count,
          received_at,
          processed_at,
          created_at
        FROM webhook_events
        ORDER BY received_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as any[];
    }
  } else if (params.length === 1) {
    // Count query with status filter
    const status = params[0];
    result = await sql`
      SELECT COUNT(*) as total FROM webhook_events WHERE status = ${status}
    ` as any[];
  } else {
    // No filters, just limit and offset
    const [limit, offset] = params;
    result = await sql`
      SELECT
        id,
        event_type,
        event_data,
        status,
        error_message,
        retry_count,
        received_at,
        processed_at,
        created_at
      FROM webhook_events
      ORDER BY received_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as any[];
  }

  return result;
}

/**
 * Get webhook statistics
 */
async function getWebhookStats() {
  try {
    const stats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'processed') as processed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'processing') as processing,
        COUNT(*) FILTER (WHERE status = 'received') as received
      FROM webhook_events
    `;

    const recentEvents = await sql`
      SELECT
        event_type,
        COUNT(*) as count
      FROM webhook_events
      WHERE received_at > NOW() - INTERVAL '24 hours'
      GROUP BY event_type
      ORDER BY count DESC
    `;

    return {
      total: parseInt(stats[0].total),
      processed: parseInt(stats[0].processed),
      failed: parseInt(stats[0].failed),
      processing: parseInt(stats[0].processing),
      received: parseInt(stats[0].received),
      recentEvents: recentEvents.map(e => ({
        type: e.event_type,
        count: parseInt(e.count),
      })),
    };
  } catch (error) {
    console.error('[Admin Webhooks API] Error getting stats:', error);
    return {
      total: 0,
      processed: 0,
      failed: 0,
      processing: 0,
      received: 0,
      recentEvents: [],
    };
  }
}
