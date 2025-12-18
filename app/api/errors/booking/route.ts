import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Booking Error Logging API
 * Receives and stores client-side booking errors
 */
export async function POST(request: NextRequest) {
  try {
    const { errors } = await request.json();

    if (!errors || !Array.isArray(errors)) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Log to server console for monitoring
    errors.forEach((err: any) => {
      console.log(
        `🚨 [${err.severity?.toUpperCase()}] ${err.flow}/${err.stage}:`,
        err.error,
        err.metadata ? JSON.stringify(err.metadata) : ''
      );
    });

    // In production: Store in database, send to monitoring service (Sentry, etc.)
    // For now, just acknowledge receipt

    return NextResponse.json({
      success: true,
      received: errors.length,
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
