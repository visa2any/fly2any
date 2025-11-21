import { NextRequest, NextResponse } from 'next/server'
import { processCommissionLifecycle } from '@/lib/services/commissionLifecycleService'

/**
 * Cron Job: Process Commission Lifecycle
 *
 * This endpoint is called by Vercel Cron (configured in vercel.json)
 * Runs every hour to automatically progress commissions through their lifecycle:
 *
 * 1. Start trips (pending → trip_in_progress)
 * 2. Complete trips (trip_in_progress → trip_completed → in_hold_period)
 * 3. Release commissions (in_hold_period → available)
 *
 * Protected by CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('❌ CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('⚠️  Unauthorized cron request')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Run lifecycle processor
    const results = await processCommissionLifecycle()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        tripsStarted: results.tripsStarted.processed,
        tripsCompleted: results.tripsCompleted.processed,
        commissionsReleased: results.commissionsReleased.processed,
      },
      message: 'Commission lifecycle processed successfully',
    })
  } catch (error) {
    console.error('❌ Cron job error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process commission lifecycle',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
