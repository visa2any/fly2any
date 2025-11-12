/**
 * Stripe Configuration & Client
 *
 * Handles Stripe initialization for both server and client environments
 */

import Stripe from 'stripe';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';

// Server-side Stripe instance
// Note: Allow null during build time, will be checked at runtime in API routes
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    })
  : null;

// Client-side Stripe promise
let stripePromise: Promise<StripeJS | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('Stripe publishable key not found');
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(publishableKey);
    }
  }
  return stripePromise;
};

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethodTypes: ['card'],
  // TripMatch commission (platform fee)
  platformCommissionRate: 0.10, // 10%
  // Credit conversion rate
  creditsPerDollar: 10, // 10 credits = $1
} as const;

export const calculatePlatformFee = (amount: number): number => {
  return Math.round(amount * STRIPE_CONFIG.platformCommissionRate);
};

export const convertCreditsToAmount = (credits: number): number => {
  return Math.round((credits / STRIPE_CONFIG.creditsPerDollar) * 100); // Convert to cents
};

export const convertAmountToCredits = (amountInCents: number): number => {
  return Math.round((amountInCents / 100) * STRIPE_CONFIG.creditsPerDollar);
};
