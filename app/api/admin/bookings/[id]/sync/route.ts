/**
 * Admin Booking Sync API
 * POST /api/admin/bookings/[id]/sync - Sync booking with provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/admin/middleware';
import { Resource, Action } from '@/lib/admin/rbac';
import { syncBooking, getBookingSyncStatus } from '@/lib/bookings/sync-service';

// POST - Sync booking with provider
export const POST = withPermission(Resource.BOOKINGS, Action.UPDATE, async (request, context) => {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { force = false, includeServices = true } = body;

    console.log(`🔄 Admin sync requested for booking: ${id}`);

    const result = await syncBooking(id, {
      force,
      includeAvailableServices: includeServices,
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        syncedAt: result.syncedAt,
        duration: result.duration,
      }, { status: result.error?.includes('not found') ? 404 : 500 });
    }

    return NextResponse.json({
      success: true,
      bookingId: result.bookingId,
      provider: result.provider,
      changes: result.changes,
      syncedAt: result.syncedAt,
      duration: result.duration,

      // Summary data
      order: result.order ? {
        status: result.order.status,
        bookingReference: result.order.bookingReference,
        paymentStatus: result.order.paymentStatus,
        eTickets: result.order.passengers
          .filter(p => p.ticketNumber)
          .map(p => ({
            passenger: `${p.firstName} ${p.lastName}`,
            ticketNumber: p.ticketNumber,
          })),
        conditions: result.order.conditions,
        servicesCount: result.order.services.length,
        availableServicesCount: result.order.availableServices?.length || 0,
      } : null,
    });

  } catch (error: any) {
    console.error('Sync API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// GET - Get sync status
export const GET = withPermission(Resource.BOOKINGS, Action.READ, async (request, context) => {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const status = await getBookingSyncStatus(id);

    return NextResponse.json({
      success: true,
      ...status,
    });

  } catch (error: any) {
    console.error('Sync status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
