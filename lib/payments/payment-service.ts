import Stripe from 'stripe';
import { Duffel } from '@duffel/api';

/**
 * Payment Service
 *
 * Handles payment processing through multiple gateways:
 * - Stripe: Credit/debit card payments with 3D Secure support
 * - Duffel Payments: Airline-specific payment processing
 *
 * Features:
 * - Payment intent creation
 * - 3D Secure authentication
 * - Payment confirmation
 * - Refund processing
 * - Webhook handling
 */

// Lazy initialization to avoid build-time errors
let stripe: Stripe | null = null;
let duffel: Duffel | null = null;

function getStripeClient(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });
  }
  return stripe;
}

function getDuffelClient(): Duffel {
  if (!duffel) {
    if (!process.env.DUFFEL_ACCESS_TOKEN) {
      throw new Error('DUFFEL_ACCESS_TOKEN is not configured');
    }
    duffel = new Duffel({
      token: process.env.DUFFEL_ACCESS_TOKEN,
    });
  }
  return duffel;
}

export interface PaymentIntentData {
  amount: number;
  currency: string;
  bookingReference: string;
  customerEmail: string;
  customerName: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentConfirmation {
  paymentIntentId: string;
  status: 'succeeded' | 'processing' | 'requires_action' | 'failed';
  amount: number;
  currency: string;
  paymentMethod?: string;
  last4?: string;
  brand?: string;
  clientSecret?: string;
}

export interface RefundData {
  paymentIntentId: string;
  amount?: number; // If not provided, full refund
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, string>;
}

export interface HoldPricing {
  duration: number; // in hours
  price: number;
  currency: string;
  expiresAt: Date;
}

class PaymentService {
  private stripeInitialized: boolean;
  private duffelInitialized: boolean;

  constructor() {
    this.stripeInitialized = !!process.env.STRIPE_SECRET_KEY;
    this.duffelInitialized = !!process.env.DUFFEL_ACCESS_TOKEN;

    if (!this.stripeInitialized) {
      console.warn('⚠️  STRIPE_SECRET_KEY not set - Stripe payments will not be available');
    }

    if (!this.duffelInitialized) {
      console.warn('⚠️  DUFFEL_ACCESS_TOKEN not set - Duffel payments will not be available');
    }
  }

  /**
   * Create Stripe Payment Intent
   *
   * Creates a payment intent that can be confirmed on the client side
   * with Stripe Elements and 3D Secure support
   *
   * TEST MODE: If Stripe not configured, returns mock payment intent for testing
   */
  async createPaymentIntent(data: PaymentIntentData): Promise<PaymentConfirmation> {
    // TEST MODE: If Stripe not configured, return mock payment intent
    if (!this.stripeInitialized) {
      console.warn('⚠️  Stripe not configured - using TEST MODE');
      console.log('💳 Creating TEST MODE payment intent...');
      console.log(`   Amount: ${data.amount} ${data.currency}`);
      console.log(`   Customer: ${data.customerEmail}`);
      console.log(`   Booking: ${data.bookingReference}`);

      const mockPaymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substr(2, 16)}`;

      console.log('✅ TEST MODE payment intent created!');
      console.log(`   Payment Intent ID: ${mockPaymentIntentId}`);
      console.log(`   Status: requires_payment_method (test mode)`);

      return {
        paymentIntentId: mockPaymentIntentId,
        status: 'requires_payment_method' as any,
        amount: data.amount,
        currency: data.currency.toUpperCase(),
        clientSecret: mockClientSecret,
      };
    }

    try {
      console.log('💳 Creating Stripe payment intent...');
      console.log(`   Amount: ${data.amount} ${data.currency}`);
      console.log(`   Customer: ${data.customerEmail}`);
      console.log(`   Booking: ${data.bookingReference}`);

      // Create payment intent with automatic payment methods
      const paymentIntent = await getStripeClient().paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        description: data.description,
        receipt_email: data.customerEmail,
        metadata: {
          bookingReference: data.bookingReference,
          customerName: data.customerName,
          ...data.metadata,
        },
        // Enable automatic payment methods and 3D Secure
        automatic_payment_methods: {
          enabled: true,
        },
        // Capture automatically when payment succeeds
        capture_method: 'automatic',
      });

      console.log('✅ Payment intent created successfully!');
      console.log(`   Payment Intent ID: ${paymentIntent.id}`);
      console.log(`   Status: ${paymentIntent.status}`);
      console.log(`   Client Secret: ${paymentIntent.client_secret?.substring(0, 20)}...`);

      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status as any,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        clientSecret: paymentIntent.client_secret || undefined,
      };
    } catch (error: any) {
      console.error('❌ Stripe payment intent creation error:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm Payment Intent
   *
   * Retrieves the current status of a payment intent
   * Used to verify payment completion after 3D Secure redirect
   *
   * TEST MODE: If payment intent ID starts with "pi_test_", simulates successful payment
   */
  async confirmPayment(paymentIntentId: string): Promise<PaymentConfirmation> {
    // TEST MODE: If test payment intent, simulate success
    if (paymentIntentId.startsWith('pi_test_')) {
      console.log('🔍 Confirming TEST MODE payment...');
      console.log(`   Payment Intent ID: ${paymentIntentId}`);

      // Simulate 2-second processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('✅ TEST MODE payment confirmed successfully!');
      console.log(`   Status: succeeded (test mode)`);
      console.log(`   Card: •••• 4242 (Visa test card)`);

      return {
        paymentIntentId,
        status: 'succeeded',
        amount: 0, // Amount not available in test mode
        currency: 'USD',
        paymentMethod: 'pm_test_card',
        last4: '4242',
        brand: 'visa',
      };
    }

    if (!this.stripeInitialized) {
      throw new Error('Stripe not initialized - check STRIPE_SECRET_KEY');
    }

    try {
      console.log(`🔍 Confirming payment intent: ${paymentIntentId}`);

      const paymentIntent = await getStripeClient().paymentIntents.retrieve(paymentIntentId, {
        expand: ['payment_method'],
      });

      console.log(`✅ Payment intent retrieved`);
      console.log(`   Status: ${paymentIntent.status}`);

      // Extract payment method details if available
      let last4: string | undefined;
      let brand: string | undefined;

      if (paymentIntent.payment_method && typeof paymentIntent.payment_method === 'object') {
        const pm = paymentIntent.payment_method as Stripe.PaymentMethod;
        last4 = pm.card?.last4;
        brand = pm.card?.brand;
      }

      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status as any,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        paymentMethod: typeof paymentIntent.payment_method === 'string'
          ? paymentIntent.payment_method
          : paymentIntent.payment_method?.id,
        last4,
        brand,
      };
    } catch (error: any) {
      console.error('❌ Payment confirmation error:', error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Process Refund
   *
   * Creates a refund for a payment intent
   * Can be partial or full refund
   */
  async processRefund(data: RefundData): Promise<any> {
    if (!this.stripeInitialized) {
      throw new Error('Stripe not initialized - check STRIPE_SECRET_KEY');
    }

    try {
      console.log(`💰 Processing refund for payment: ${data.paymentIntentId}`);
      if (data.amount) {
        console.log(`   Refund Amount: ${data.amount} (partial)`);
      } else {
        console.log(`   Refund Amount: Full refund`);
      }

      const refund = await getStripeClient().refunds.create({
        payment_intent: data.paymentIntentId,
        amount: data.amount ? Math.round(data.amount * 100) : undefined,
        reason: data.reason,
        metadata: data.metadata,
      });

      console.log('✅ Refund processed successfully!');
      console.log(`   Refund ID: ${refund.id}`);
      console.log(`   Status: ${refund.status}`);
      console.log(`   Amount: ${refund.amount / 100}`);

      return {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
        currency: refund.currency.toUpperCase(),
      };
    } catch (error: any) {
      console.error('❌ Refund processing error:', error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * Calculate Hold Pricing
   *
   * Determines the cost to hold a booking based on hold duration:
   * - 0-6 hours: $19.99
   * - 6-24 hours: $39.99
   * - 24-48 hours: $59.99
   * - 48-72 hours: $89.99 (maximum hold duration)
   */
  calculateHoldPricing(holdDurationHours: number): HoldPricing {
    let price = 0;
    let actualDuration = holdDurationHours;

    // Cap at 72 hours (3 days)
    if (holdDurationHours > 72) {
      actualDuration = 72;
    }

    // Apply tiered pricing
    if (holdDurationHours <= 6) {
      price = 19.99;
    } else if (holdDurationHours <= 24) {
      price = 39.99;
    } else if (holdDurationHours <= 48) {
      price = 59.99;
    } else {
      price = 89.99;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + actualDuration);

    return {
      duration: actualDuration,
      price,
      currency: 'USD',
      expiresAt,
    };
  }

  /**
   * Create Duffel Payment
   *
   * Creates a payment through Duffel's payment API
   * Used for airline-specific payment processing
   */
  async createDuffelPayment(orderId: string, amount: number, currency: string): Promise<any> {
    if (!this.duffelInitialized) {
      console.warn('⚠️  Duffel not initialized - using Stripe instead');
      return null;
    }

    try {
      console.log('🎫 Creating Duffel payment...');
      console.log(`   Order ID: ${orderId}`);
      console.log(`   Amount: ${amount} ${currency}`);

      // Duffel payments are created as part of the order
      // This method is for future integration when using Duffel's payment gateway
      console.log('ℹ️  Duffel payment integration pending - using Stripe for now');

      return {
        success: true,
        provider: 'stripe',
        message: 'Payment will be processed through Stripe',
      };
    } catch (error: any) {
      console.error('❌ Duffel payment error:', error);
      throw new Error(`Failed to create Duffel payment: ${error.message}`);
    }
  }

  /**
   * Verify Webhook Signature
   *
   * Validates that a webhook event came from Stripe
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    if (!this.stripeInitialized) {
      throw new Error('Stripe not initialized - check STRIPE_SECRET_KEY');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not set');
    }

    try {
      const event = getStripeClient().webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      return event;
    } catch (error: any) {
      console.error('❌ Webhook signature verification failed:', error);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  /**
   * Handle Webhook Event
   *
   * Processes Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    console.log(`📨 Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.requires_action':
        console.log('⏳ Payment requires additional action (3D Secure)');
        break;

      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`ℹ️  Unhandled webhook event type: ${event.type}`);
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('✅ Payment succeeded!');
    console.log(`   Payment Intent ID: ${paymentIntent.id}`);
    console.log(`   Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);
    console.log(`   Booking Reference: ${paymentIntent.metadata.bookingReference}`);

    // Update booking status in database
    try {
      const { bookingStorage } = await import('@/lib/bookings/storage');
      const bookingReference = paymentIntent.metadata.bookingReference;

      if (!bookingReference) {
        console.error('❌ No booking reference in payment metadata');
        return;
      }

      const booking = await bookingStorage.findByReferenceAsync(bookingReference);
      if (!booking) {
        console.error(`❌ Booking not found: ${bookingReference}`);
        return;
      }

      await bookingStorage.update(booking.id, {
        status: 'confirmed',
        payment: {
          ...booking.payment,
          status: 'paid',
          paymentIntentId: paymentIntent.id,
          transactionId: paymentIntent.id,
          paidAt: new Date().toISOString(),
        },
      });

      console.log(`✅ Booking ${bookingReference} updated to confirmed/paid`);
    } catch (error: any) {
      console.error('❌ Error updating booking after payment success:', error);
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.error('❌ Payment failed!');
    console.error(`   Payment Intent ID: ${paymentIntent.id}`);
    console.error(`   Booking Reference: ${paymentIntent.metadata.bookingReference}`);
    console.error(`   Error: ${paymentIntent.last_payment_error?.message}`);

    // Update booking status in database
    try {
      const { bookingStorage } = await import('@/lib/bookings/storage');
      const bookingReference = paymentIntent.metadata.bookingReference;

      if (!bookingReference) {
        console.error('❌ No booking reference in payment metadata');
        return;
      }

      const booking = await bookingStorage.findByReferenceAsync(bookingReference);
      if (!booking) {
        console.error(`❌ Booking not found: ${bookingReference}`);
        return;
      }

      await bookingStorage.update(booking.id, {
        payment: {
          ...booking.payment,
          status: 'failed',
        },
      });

      console.log(`✅ Booking ${bookingReference} updated to failed payment`);
    } catch (error: any) {
      console.error('❌ Error updating booking after payment failure:', error);
    }
  }

  /**
   * Handle refund
   */
  private async handleRefund(charge: Stripe.Charge): Promise<void> {
    console.log('💰 Refund processed');
    console.log(`   Charge ID: ${charge.id}`);
    console.log(`   Amount Refunded: ${charge.amount_refunded / 100}`);

    // TODO: Update booking status in database
  }

  /**
   * Check if services are available
   */
  isStripeAvailable(): boolean {
    return this.stripeInitialized;
  }

  isDuffelAvailable(): boolean {
    return this.duffelInitialized;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Types are already exported at their declaration above
