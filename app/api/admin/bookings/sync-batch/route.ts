export const dynamic = 'force-dynamic';

/**
 * Admin Batch Booking Sync API
 * POST /api/admin/bookings/sync-batch - Sync multiple bookings
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/admin/middleware';
import { Resource, Action } from '@/lib/admin/rbac';
import { syncBookingsBatch } from '@/lib/bookings/sync-service';

export const POST = withPermission(Resource.BOOKINGS, Action.UPDATE, async (request) => {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      status,
      provider,
      unsynced = true,
      limit = 50,
    } = body;

    console.log(`🔄 Batch sync requested: status=${status}, provider=${provider}, limit=${limit}`);

    const result = await syncBookingsBatch({
      status,
      provider,
      unsynced,
      limit: Math.min(limit, 100), // Cap at 100
    });

    return NextResponse.json({
      success: true,
      summary: {
        total: result.total,
        synced: result.synced,
        failed: result.failed,
      },
      results: result.results.map(r => ({
        bookingId: r.bookingId,
        success: r.success,
        provider: r.provider,
        changesCount: r.changes.length,
        error: r.error,
        duration: r.duration,
      })),
    });

  } catch (error: any) {
    console.error('Batch sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
