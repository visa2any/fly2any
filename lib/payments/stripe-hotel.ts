/**
 * Stripe Payment Service for Hotel Bookings
 * Handles payment intents, confirmations, and refunds for hotel reservations
 */

import Stripe from 'stripe'

// Don't throw error at module initialization to allow builds without Stripe configured
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    })
  : null

// Helper to ensure Stripe is configured
const ensureStripe = (): Stripe => {
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  return stripe
}

export interface CreatePaymentIntentParams {
  amount: number // in cents (e.g., 18500 for $185.00)
  currency: string // e.g., 'usd', 'eur', 'gbp'
  metadata: {
    hotelId: string
    hotelName: string
    roomId: string
    roomName: string
    checkIn: string
    checkOut: string
    nights: number
    guestEmail: string
    guestName: string
  }
  description?: string
}

export interface ConfirmPaymentParams {
  paymentIntentId: string
  paymentMethodId: string
}

/**
 * Create a payment intent for hotel booking
 */
export async function createHotelPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<Stripe.PaymentIntent> {
  try {
    const stripeClient = ensureStripe()
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      metadata: {
        ...params.metadata,
        type: 'hotel_booking',
        nights: params.metadata.nights.toString(),
      },
      description: params.description || `Hotel booking: ${params.metadata.hotelName}`,
      automatic_payment_methods: {
        enabled: true,
      },
      // Capture funds immediately (not pre-authorization)
      capture_method: 'automatic',
      // Optional: Enable 3D Secure for additional security
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw new Error(`Failed to create payment intent: ${(error as Error).message}`)
  }
}

/**
 * Confirm a payment intent with a payment method
 */
export async function confirmHotelPayment(
  params: ConfirmPaymentParams
): Promise<Stripe.PaymentIntent> {
  try {
    const stripeClient = ensureStripe()
    const paymentIntent = await stripeClient.paymentIntents.confirm(params.paymentIntentId, {
      payment_method: params.paymentMethodId,
    })

    return paymentIntent
  } catch (error) {
    console.error('Error confirming payment:', error)
    throw new Error(`Failed to confirm payment: ${(error as Error).message}`)
  }
}

/**
 * Retrieve a payment intent by ID
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const stripeClient = ensureStripe()
    return await stripeClient.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    throw new Error(`Failed to retrieve payment intent: ${(error as Error).message}`)
  }
}

/**
 * Cancel a payment intent (before payment is captured)
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const stripeClient = ensureStripe()
    return await stripeClient.paymentIntents.cancel(paymentIntentId)
  } catch (error) {
    console.error('Error cancelling payment intent:', error)
    throw new Error(`Failed to cancel payment intent: ${(error as Error).message}`)
  }
}

/**
 * Create a refund for a completed payment
 */
export async function refundHotelPayment(
  paymentIntentId: string,
  amount?: number, // Optional partial refund amount in cents
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  try {
    const stripeClient = ensureStripe()
    const refund = await stripeClient.refunds.create({
      payment_intent: paymentIntentId,
      amount, // If not provided, refunds the full amount
      reason: reason || 'requested_by_customer',
    })

    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    throw new Error(`Failed to create refund: ${(error as Error).message}`)
  }
}

/**
 * Save a payment method for future use (optional for returning customers)
 */
export async function savePaymentMethod(
  paymentMethodId: string,
  customerId: string
): Promise<Stripe.PaymentMethod> {
  try {
    const stripeClient = ensureStripe()
    return await stripeClient.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })
  } catch (error) {
    console.error('Error saving payment method:', error)
    throw new Error(`Failed to save payment method: ${(error as Error).message}`)
  }
}

/**
 * Create a Stripe customer (for logged-in users)
 */
export async function createStripeCustomer(params: {
  email: string
  name?: string
  metadata?: Record<string, string>
}): Promise<Stripe.Customer> {
  try {
    const stripeClient = ensureStripe()
    return await stripeClient.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        ...params.metadata,
        source: 'fly2any_hotel_booking',
      },
    })
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw new Error(`Failed to create customer: ${(error as Error).message}`)
  }
}

/**
 * Calculate Stripe fee (for internal accounting)
 * Stripe charges 2.9% + $0.30 per successful card charge
 */
export function calculateStripeFee(amountInCents: number): number {
  const percentageFee = Math.round(amountInCents * 0.029)
  const fixedFee = 30 // $0.30 in cents
  return percentageFee + fixedFee
}

/**
 * Format amount for display (convert cents to dollars)
 */
export function formatAmount(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100)
}

export default stripe
