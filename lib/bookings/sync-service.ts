/**
 * Booking Sync Service
 * Provider-agnostic sync engine for booking management
 */

import { getSql } from '@/lib/db/connection';
import { duffelAdapter } from './providers/duffel-adapter';
import type {
  BookingProvider,
  ProviderOrder,
  SyncResult,
  SyncChange,
} from './providers/types';

// Provider registry - plug and play
const providers: Record<string, BookingProvider> = {
  duffel: duffelAdapter,
  // amadeus: amadeusAdapter, // Future
  // sabre: sabreAdapter,     // Future
};

export interface BookingSyncOptions {
  /** Force sync even if recently synced */
  force?: boolean;
  /** Skip sync if synced within this many minutes */
  skipIfRecentMinutes?: number;
  /** Include available services */
  includeAvailableServices?: boolean;
}

/**
 * Sync a single booking with its provider
 */
export async function syncBooking(
  bookingId: string,
  options: BookingSyncOptions = {}
): Promise<SyncResult> {
  const startTime = Date.now();
  const { force = false, skipIfRecentMinutes = 5, includeAvailableServices = false } = options;

  try {
    // Get booking from database
    const bookings = await sql`
      SELECT * FROM bookings WHERE id = ${bookingId} OR booking_reference = ${bookingId}
    `;

    if (!bookings || bookings.length === 0) {
      return {
        success: false,
        bookingId,
        provider: 'unknown',
        changes: [],
        error: 'Booking not found',
        syncedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }

    const booking = bookings[0];

    // Check if recently synced
    if (!force && booking.last_synced_at) {
      const lastSync = new Date(booking.last_synced_at);
      const minutesSinceSync = (Date.now() - lastSync.getTime()) / 60000;
      if (minutesSinceSync < skipIfRecentMinutes) {
        return {
          success: true,
          bookingId: booking.id,
          provider: booking.source_api || 'unknown',
          changes: [],
          syncedAt: booking.last_synced_at,
          duration: Date.now() - startTime,
        };
      }
    }

    // Determine provider
    const providerCode = (booking.source_api || 'duffel').toLowerCase();
    const provider = providers[providerCode];

    if (!provider) {
      return {
        success: false,
        bookingId: booking.id,
        provider: providerCode,
        changes: [],
        error: `Provider '${providerCode}' not supported`,
        syncedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }

    // Get order ID
    const orderId = booking.duffel_order_id || booking.amadeus_booking_id || booking.provider_booking_id;

    if (!orderId) {
      return {
        success: false,
        bookingId: booking.id,
        provider: providerCode,
        changes: [],
        error: 'No provider order ID found',
        syncedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }

    // Fetch from provider
    console.log(`🔄 Syncing booking ${booking.booking_reference} from ${provider.name}...`);
    const order = await provider.getOrder(orderId);

    // Get available services if requested
    if (includeAvailableServices && provider.getAvailableServices) {
      order.availableServices = await provider.getAvailableServices(orderId);
    }

    // Calculate changes
    const changes = detectChanges(booking, order);

    // Log significant changes
    const criticalChanges = changes.filter(c => c.significance === 'critical');
    if (criticalChanges.length > 0) {
      console.log(`⚠️  Critical changes detected for ${booking.booking_reference}:`);
      criticalChanges.forEach(c => console.log(`   - ${c.field}: ${c.oldValue} → ${c.newValue}`));
    }

    // Update database
    await updateBookingFromProvider(booking.id, order, changes);

    return {
      success: true,
      bookingId: booking.id,
      provider: provider.name,
      changes,
      order,
      syncedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };

  } catch (error: any) {
    console.error(`❌ Sync failed for ${bookingId}:`, error.message);

    // Update sync error in database
    if (sql) {
      await sql`
        UPDATE bookings SET
          sync_status = 'error',
          sync_error = ${error.message},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${bookingId} OR booking_reference = ${bookingId}
      `.catch(() => {});
    }

    return {
      success: false,
      bookingId,
      provider: 'unknown',
      changes: [],
      error: error.message,
      syncedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Sync multiple bookings (batch)
 */
export async function syncBookingsBatch(
  filter: { status?: string; provider?: string; unsynced?: boolean; limit?: number }
): Promise<{ total: number; synced: number; failed: number; results: SyncResult[] }> {
  const { status, provider, unsynced = true, limit = 50 } = filter;

  // Build query
  let query = sql`
    SELECT id FROM bookings WHERE deleted_at IS NULL
  `;

  if (status) {
    query = sql`${query} AND status = ${status}`;
  }
  if (provider) {
    query = sql`${query} AND source_api = ${provider}`;
  }
  if (unsynced) {
    query = sql`${query} AND (last_synced_at IS NULL OR last_synced_at < NOW() - INTERVAL '1 hour')`;
  }

  query = sql`${query} ORDER BY created_at DESC LIMIT ${limit}`;

  const bookings = await query;
  const results: SyncResult[] = [];

  for (const booking of bookings) {
    const result = await syncBooking(booking.id, { force: true });
    results.push(result);
  }

  return {
    total: bookings.length,
    synced: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };
}

/**
 * Detect changes between local booking and provider order
 */
function detectChanges(booking: any, order: ProviderOrder): SyncChange[] {
  const changes: SyncChange[] = [];

  // Status change
  if (order.status !== booking.provider_status) {
    changes.push({
      field: 'status',
      oldValue: booking.provider_status,
      newValue: order.status,
      significance: order.status === 'cancelled' ? 'critical' : 'warning',
    });
  }

  // E-ticket issued
  const hasTickets = order.documents.some(d => d.type === 'electronic_ticket');
  const hadTickets = booking.e_tickets && JSON.parse(booking.e_tickets || '[]').length > 0;
  if (hasTickets && !hadTickets) {
    changes.push({
      field: 'e_tickets',
      oldValue: 'none',
      newValue: 'issued',
      significance: 'info',
    });
  }

  // Payment status
  if (order.paymentStatus !== booking.duffel_payment_status) {
    changes.push({
      field: 'payment_status',
      oldValue: booking.duffel_payment_status,
      newValue: order.paymentStatus,
      significance: order.paymentStatus === 'paid' ? 'info' : 'warning',
    });
  }

  // Services added
  const currentServices = JSON.parse(booking.services || '[]');
  if (order.services.length !== currentServices.length) {
    changes.push({
      field: 'services',
      oldValue: currentServices.length,
      newValue: order.services.length,
      significance: 'info',
    });
  }

  return changes;
}

/**
 * Update booking in database with provider data
 */
async function updateBookingFromProvider(
  bookingId: string,
  order: ProviderOrder,
  changes: SyncChange[]
): Promise<void> {
  if (!sql) return;

  // Extract e-tickets
  const eTickets = order.passengers
    .filter(p => p.ticketNumber)
    .map(p => ({
      passenger_id: p.id,
      first_name: p.firstName,
      last_name: p.lastName,
      ticket_number: p.ticketNumber,
      issued_at: p.ticketIssuedAt,
    }));

  // Update booking
  await sql`
    UPDATE bookings SET
      -- Sync status
      last_synced_at = CURRENT_TIMESTAMP,
      sync_status = 'synced',
      sync_error = NULL,
      provider_status = ${order.status},
      provider_last_update = ${order.syncedAt},

      -- E-tickets
      e_tickets = ${JSON.stringify(eTickets)},
      documents = ${JSON.stringify(order.documents)},

      -- Update ticketing status if tickets issued
      ticketing_status = CASE
        WHEN ${eTickets.length > 0} THEN 'ticketed'
        ELSE ticketing_status
      END,

      -- Policies
      cancellation_policy = ${JSON.stringify(order.conditions.refundBeforeDeparture || null)},
      change_policy = ${JSON.stringify(order.conditions.changeBeforeDeparture || null)},

      -- Services
      services = ${JSON.stringify(order.services)},
      available_services = ${JSON.stringify(order.availableServices || null)},

      -- Payment (Duffel)
      duffel_payment_status = ${order.paymentStatus},
      duffel_balance_due = ${order.balanceDue},

      -- Raw response (for audit)
      duffel_order_raw = ${JSON.stringify(order.raw)},

      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${bookingId}
  `;

  // Log changes
  if (changes.length > 0) {
    console.log(`✅ Synced booking ${bookingId}: ${changes.length} changes`);
  }
}

/**
 * Get sync status for a booking
 */
export async function getBookingSyncStatus(bookingId: string): Promise<{
  lastSynced: string | null;
  status: 'pending' | 'synced' | 'error';
  error: string | null;
  hasETickets: boolean;
  providerStatus: string | null;
}> {
  if (!sql) {
    return { lastSynced: null, status: 'pending', error: null, hasETickets: false, providerStatus: null };
  }

  const result = await sql`
    SELECT
      last_synced_at,
      sync_status,
      sync_error,
      e_tickets,
      provider_status
    FROM bookings WHERE id = ${bookingId} OR booking_reference = ${bookingId}
  `;

  if (!result || result.length === 0) {
    return { lastSynced: null, status: 'pending', error: 'Not found', hasETickets: false, providerStatus: null };
  }

  const booking = result[0];
  const eTickets = JSON.parse(booking.e_tickets || '[]');

  return {
    lastSynced: booking.last_synced_at,
    status: booking.sync_status || 'pending',
    error: booking.sync_error,
    hasETickets: eTickets.length > 0,
    providerStatus: booking.provider_status,
  };
}
