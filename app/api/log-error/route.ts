import { NextRequest, NextResponse } from 'next/server';

/**
 * Error Log API Endpoint
 *
 * Receives error logs from the client and processes them.
 * This endpoint can be extended to:
 * - Store errors in a database
 * - Forward to external logging services
 * - Send alerts for critical errors
 * - Aggregate error statistics
 */

interface ErrorLogRequest {
  errorId: string;
  message: string;
  stack?: string;
  severity: 'fatal' | 'error' | 'warning' | 'info';
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ErrorLogRequest = await request.json();

    // Validate required fields
    if (!body.errorId || !body.message || !body.severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log to server console (for development/debugging)
    console.error('[Error API]', {
      errorId: body.errorId,
      severity: body.severity,
      message: body.message,
      metadata: body.metadata,
    });

    // TODO: Add production error logging
    // Examples:
    // 1. Store in database for analysis
    // await db.errors.create({
    //   data: {
    //     errorId: body.errorId,
    //     message: body.message,
    //     stack: body.stack,
    //     severity: body.severity,
    //     metadata: body.metadata,
    //     timestamp: new Date(),
    //   },
    // });

    // 2. Send to external logging service (e.g., Datadog, Loggly)
    // await fetch('https://logging-service.com/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(body),
    // });

    // 3. Send alerts for critical errors
    // if (body.severity === 'fatal') {
    //   await sendAlert({
    //     channel: 'engineering',
    //     message: `Critical error: ${body.message}`,
    //     errorId: body.errorId,
    //   });
    // }

    return NextResponse.json(
      {
        success: true,
        errorId: body.errorId,
        message: 'Error logged successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Error API] Failed to process error log:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process error log',
      },
      { status: 500 }
    );
  }
}

// Prevent caching of error logs
export const dynamic = 'force-dynamic';
