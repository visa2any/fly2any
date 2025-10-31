/**
 * Duffel Webhook Event Handlers
 * Processes various webhook events from Duffel API
 */

import { bookingStorage } from '../bookings/storage';
import { notificationService } from '../notifications/notification-service';
import { sql } from '../db/connection';
import type { Booking, PaymentStatus } from '../bookings/types';

/**
 * Duffel Webhook Event Types
 */
export interface DuffelWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  live_mode: boolean;
  occurred_at: string;
}

export interface DuffelOrder {
  id: string;
  booking_reference: string;
  created_at: string;
  live_mode: boolean;
  total_amount: string;
  total_currency: string;
  passengers: Array<{
    id: string;
    given_name: string;
    family_name: string;
    email?: string;
  }>;
  slices: Array<{
    origin: { iata_code: string };
    destination: { iata_code: string };
    departure_date: string;
  }>;
  payment_status?: {
    awaiting_payment: boolean;
    payment_required_by?: string;
    price_guarantee_expires_at?: string;
  };
  metadata?: Record<string, any>;
}

export interface DuffelOrderCancellation {
  id: string;
  order_id: string;
  confirmed_at?: string;
  created_at: string;
  expires_at?: string;
  refund_amount: string;
  refund_currency: string;
  refund_to: 'arc_bsp_cash' | 'card' | 'voucher' | 'awaiting_payment';
}

/**
 * Order Created Handler
 * Called when a new order is successfully created in Duffel
 */
export async function orderCreatedHandler(event: DuffelWebhookEvent): Promise<void> {
  const order = event.data.object as DuffelOrder;

  try {
    console.log(`[Webhook] Processing order.created event for order: ${order.id}`);

    // Find booking by Duffel order ID or booking reference
    let booking: Booking | null = null;

    // Try to find by Duffel order ID first
    const bookings = await bookingStorage.search({
      limit: 1000 // Get all bookings to search through
    });

    booking = bookings.find(b => b.duffelOrderId === order.id) || null;

    if (!booking) {
      // Try to match by booking reference or metadata
      const internalReference = order.metadata?.internalBookingReference;
      if (internalReference) {
        booking = await bookingStorage.findByReferenceAsync(internalReference);
      }
    }

    if (!booking) {
      console.warn(`[Webhook] No booking found for Duffel order: ${order.id}`);
      return;
    }

    // Update booking with Duffel details
    await bookingStorage.update(booking.id, {
      duffelOrderId: order.id,
      duffelBookingReference: order.booking_reference,
      status: 'pending', // Still pending payment
      notes: booking.notes
        ? `${booking.notes}\n\nDuffel order created successfully at ${order.created_at}`
        : `Duffel order created successfully at ${order.created_at}`,
    });

    console.log(`[Webhook] Updated booking ${booking.bookingReference} with Duffel order details`);

    // Send notification to customer
    await notificationService.sendOrderCreatedEmail(booking, order);

  } catch (error) {
    console.error('[Webhook] Error handling order.created:', error);
    throw error;
  }
}

/**
 * Order Creation Failed Handler
 * Called when order creation fails in Duffel
 */
export async function orderCreationFailedHandler(event: DuffelWebhookEvent): Promise<void> {
  const data = event.data.object;

  try {
    console.log(`[Webhook] Processing order.creation_failed event`);

    // Extract error details
    const errorMessage = data.errors?.[0]?.message || 'Unknown error';
    const errorCode = data.errors?.[0]?.code || 'unknown';

    // Try to find the related booking
    const internalReference = data.metadata?.internalBookingReference;
    if (!internalReference) {
      console.warn('[Webhook] No internal booking reference in failed order');
      return;
    }

    const booking = await bookingStorage.findByReferenceAsync(internalReference);
    if (!booking) {
      console.warn(`[Webhook] No booking found for reference: ${internalReference}`);
      return;
    }

    // Update booking status to failed
    await bookingStorage.update(booking.id, {
      status: 'cancelled',
      cancellationReason: `Duffel order creation failed: ${errorMessage} (${errorCode})`,
      notes: booking.notes
        ? `${booking.notes}\n\nDuffel order creation failed: ${errorMessage}`
        : `Duffel order creation failed: ${errorMessage}`,
    });

    console.log(`[Webhook] Updated booking ${booking.bookingReference} as failed`);

    // Notify customer and admin
    await notificationService.sendOrderFailedEmail(booking, errorMessage);
    await notificationService.sendAdminAlert({
      type: 'order_creation_failed',
      bookingReference: booking.bookingReference,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Webhook] Error handling order.creation_failed:', error);
    throw error;
  }
}

/**
 * Payment Succeeded Handler
 * Called when payment is successfully processed
 */
export async function paymentSucceededHandler(event: DuffelWebhookEvent): Promise<void> {
  const payment = event.data.object;

  try {
    console.log(`[Webhook] Processing payment.succeeded event`);

    // Find the associated order
    const orderId = payment.order_id;
    if (!orderId) {
      console.warn('[Webhook] No order_id in payment.succeeded event');
      return;
    }

    // Find booking by Duffel order ID
    const bookings = await bookingStorage.search({
      limit: 1000
    });

    const booking = bookings.find(b => b.duffelOrderId === orderId);
    if (!booking) {
      console.warn(`[Webhook] No booking found for Duffel order: ${orderId}`);
      return;
    }

    // Update payment status
    const updatedPayment = {
      ...booking.payment,
      status: 'paid' as PaymentStatus,
      transactionId: payment.id,
      paidAt: event.occurred_at,
    };

    await bookingStorage.update(booking.id, {
      status: 'confirmed',
      payment: updatedPayment,
      notes: booking.notes
        ? `${booking.notes}\n\nPayment confirmed via Duffel at ${event.occurred_at}`
        : `Payment confirmed via Duffel at ${event.occurred_at}`,
    });

    console.log(`[Webhook] Payment confirmed for booking ${booking.bookingReference}`);

    // Send confirmation email to customer
    await notificationService.sendPaymentSuccessEmail(booking);

    // Notify admin
    await notificationService.sendAdminAlert({
      type: 'payment_succeeded',
      bookingReference: booking.bookingReference,
      amount: booking.payment.amount,
      currency: booking.payment.currency,
      timestamp: event.occurred_at,
    });

  } catch (error) {
    console.error('[Webhook] Error handling payment.succeeded:', error);
    throw error;
  }
}

/**
 * Payment Failed Handler
 * Called when payment processing fails
 */
export async function paymentFailedHandler(event: DuffelWebhookEvent): Promise<void> {
  const payment = event.data.object;

  try {
    console.log(`[Webhook] Processing payment.failed event`);

    const orderId = payment.order_id;
    if (!orderId) {
      console.warn('[Webhook] No order_id in payment.failed event');
      return;
    }

    // Find booking by Duffel order ID
    const bookings = await bookingStorage.search({
      limit: 1000
    });

    const booking = bookings.find(b => b.duffelOrderId === orderId);
    if (!booking) {
      console.warn(`[Webhook] No booking found for Duffel order: ${orderId}`);
      return;
    }

    // Update payment status
    const updatedPayment = {
      ...booking.payment,
      status: 'failed' as PaymentStatus,
    };

    const errorMessage = payment.failure_reason || 'Payment processing failed';

    await bookingStorage.update(booking.id, {
      payment: updatedPayment,
      notes: booking.notes
        ? `${booking.notes}\n\nPayment failed: ${errorMessage}`
        : `Payment failed: ${errorMessage}`,
    });

    console.log(`[Webhook] Payment failed for booking ${booking.bookingReference}`);

    // Notify customer
    await notificationService.sendPaymentFailedEmail(booking, errorMessage);

    // Notify admin
    await notificationService.sendAdminAlert({
      type: 'payment_failed',
      bookingReference: booking.bookingReference,
      error: errorMessage,
      timestamp: event.occurred_at,
    });

  } catch (error) {
    console.error('[Webhook] Error handling payment.failed:', error);
    throw error;
  }
}

/**
 * Schedule Change Handler
 * Called when airline initiates a schedule change
 */
export async function scheduleChangeHandler(event: DuffelWebhookEvent): Promise<void> {
  const change = event.data.object;

  try {
    console.log(`[Webhook] Processing order.airline_initiated_change_detected event`);

    const orderId = change.order_id;
    if (!orderId) {
      console.warn('[Webhook] No order_id in schedule change event');
      return;
    }

    // Find booking by Duffel order ID
    const bookings = await bookingStorage.search({
      limit: 1000
    });

    const booking = bookings.find(b => b.duffelOrderId === orderId);
    if (!booking) {
      console.warn(`[Webhook] No booking found for Duffel order: ${orderId}`);
      return;
    }

    // Extract change details
    const changeType = change.change_type || 'schedule_change';
    const changeDescription = change.description || 'The airline has made changes to your flight schedule';

    // Add note to booking
    await bookingStorage.update(booking.id, {
      notes: booking.notes
        ? `${booking.notes}\n\n[${event.occurred_at}] SCHEDULE CHANGE: ${changeDescription}`
        : `[${event.occurred_at}] SCHEDULE CHANGE: ${changeDescription}`,
    });

    console.log(`[Webhook] Schedule change detected for booking ${booking.bookingReference}`);

    // Notify customer
    await notificationService.sendScheduleChangeEmail(booking, {
      changeType,
      description: changeDescription,
      detectedAt: event.occurred_at,
      newDetails: change.new_slices || [],
    });

    // Notify admin (high priority)
    await notificationService.sendAdminAlert({
      type: 'schedule_change',
      bookingReference: booking.bookingReference,
      changeType,
      description: changeDescription,
      timestamp: event.occurred_at,
      priority: 'high',
    });

  } catch (error) {
    console.error('[Webhook] Error handling schedule change:', error);
    throw error;
  }
}

/**
 * Cancellation Confirmed Handler
 * Called when order cancellation is confirmed
 */
export async function cancellationHandler(event: DuffelWebhookEvent): Promise<void> {
  const cancellation = event.data.object as DuffelOrderCancellation;

  try {
    console.log(`[Webhook] Processing order_cancellation.confirmed event`);

    const orderId = cancellation.order_id;
    if (!orderId) {
      console.warn('[Webhook] No order_id in cancellation event');
      return;
    }

    // Find booking by Duffel order ID
    const bookings = await bookingStorage.search({
      limit: 1000
    });

    const booking = bookings.find(b => b.duffelOrderId === orderId);
    if (!booking) {
      console.warn(`[Webhook] No booking found for Duffel order: ${orderId}`);
      return;
    }

    // Update booking with cancellation details
    const refundAmount = parseFloat(cancellation.refund_amount);
    const updatedPayment = {
      ...booking.payment,
      status: 'refunded' as PaymentStatus,
      refundAmount,
      refundedAt: cancellation.confirmed_at || event.occurred_at,
    };

    await bookingStorage.update(booking.id, {
      status: 'cancelled',
      payment: updatedPayment,
      cancelledAt: cancellation.confirmed_at || event.occurred_at,
      notes: booking.notes
        ? `${booking.notes}\n\nCancellation confirmed. Refund amount: ${cancellation.refund_currency} ${refundAmount}`
        : `Cancellation confirmed. Refund amount: ${cancellation.refund_currency} ${refundAmount}`,
    });

    console.log(`[Webhook] Cancellation confirmed for booking ${booking.bookingReference}`);

    // Notify customer
    await notificationService.sendCancellationConfirmedEmail(booking, {
      refundAmount,
      refundCurrency: cancellation.refund_currency,
      refundMethod: cancellation.refund_to,
      confirmedAt: cancellation.confirmed_at || event.occurred_at,
    });

    // Notify admin
    await notificationService.sendAdminAlert({
      type: 'cancellation_confirmed',
      bookingReference: booking.bookingReference,
      refundAmount,
      refundCurrency: cancellation.refund_currency,
      timestamp: event.occurred_at,
    });

  } catch (error) {
    console.error('[Webhook] Error handling cancellation:', error);
    throw error;
  }
}

/**
 * Main event dispatcher
 * Routes webhook events to appropriate handlers
 */
export async function handleWebhookEvent(event: DuffelWebhookEvent): Promise<void> {
  console.log(`[Webhook] Received event: ${event.type}`);

  const handlers: Record<string, (event: DuffelWebhookEvent) => Promise<void>> = {
    'order.created': orderCreatedHandler,
    'order.creation_failed': orderCreationFailedHandler,
    'payment.succeeded': paymentSucceededHandler,
    'payment.failed': paymentFailedHandler,
    'order.airline_initiated_change_detected': scheduleChangeHandler,
    'order_cancellation.confirmed': cancellationHandler,
  };

  const handler = handlers[event.type];

  if (!handler) {
    console.warn(`[Webhook] No handler found for event type: ${event.type}`);
    return;
  }

  await handler(event);
}
