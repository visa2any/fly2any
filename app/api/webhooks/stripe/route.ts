/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events (payment confirmations, refunds, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/config';
import { getPrismaClient } from '@/lib/db/prisma';
import { convertAmountToCredits } from '@/lib/stripe/config';
import type { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrismaClient();
    if (!stripe || !webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 503 }
      );
    }

    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(prisma, event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(prisma, event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(prisma: PrismaClient, session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  if (!metadata) return;

  const { tripId, userId, creatorId, pricePerPerson, platformFee } = metadata;

  try {
    // Update member status to confirmed
    await prisma.groupMember.updateMany({
      where: {
        tripGroupId: tripId,
        userId: userId,
        paymentIntentId: session.id,
      },
      data: {
        status: 'confirmed',
        paymentStatus: 'completed',
        paidAt: new Date(),
      },
    });

    // Increment trip member count
    await prisma.tripGroup.update({
      where: { id: tripId },
      data: {
        currentMembers: { increment: 1 },
        totalBookingValue: { increment: parseInt(pricePerPerson) },
      },
    });

    // Award credits to trip creator (10% of trip price)
    const creditsToAward = Math.round(parseInt(pricePerPerson) * 0.1);

    await prisma.user.update({
      where: { id: creatorId },
      data: {
        tripMatchCredits: { increment: creditsToAward },
        tripMatchLifetimeEarned: { increment: creditsToAward },
      },
    });

    // Create credit transaction record
    await prisma.creditTransaction.create({
      data: {
        userId: creatorId,
        type: 'earn',
        amount: creditsToAward,
        source: 'trip_booking',
        status: 'completed',
        description: `Earned from member joining your trip`,
        metadata: {
          tripId,
          memberId: userId,
          bookingAmount: pricePerPerson,
        },
      },
    });

    // Create notification for creator
    await prisma.notification.create({
      data: {
        userId: creatorId,
        type: 'trip_booking',
        title: 'New Trip Member!',
        message: `Someone joined your trip and you earned ${creditsToAward} credits ($${(creditsToAward / 10).toFixed(2)})!`,
        actionUrl: `/tripmatch/trips/${tripId}`,
        metadata: {
          tripId,
          creditsEarned: creditsToAward,
        },
      },
    });

    // Create notification for member
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'trip_confirmation',
        title: 'Trip Confirmed!',
        message: 'Your payment was successful. Get ready for an amazing trip!',
        actionUrl: `/tripmatch/trips/${tripId}`,
        metadata: {
          tripId,
        },
      },
    });

    console.log(`✅ Checkout completed for trip ${tripId}, user ${userId}`);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
  // Additional payment success handling if needed
}

async function handlePaymentFailed(prisma: PrismaClient, paymentIntent: Stripe.PaymentIntent) {
  console.log(`❌ Payment failed: ${paymentIntent.id}`);

  // Update member status to failed
  await prisma.groupMember.updateMany({
    where: {
      paymentIntentId: paymentIntent.id,
    },
    data: {
      status: 'cancelled',
      paymentStatus: 'failed',
    },
  });
}

async function handleRefund(charge: Stripe.Charge) {
  console.log(`💰 Refund processed: ${charge.id}`);

  // Handle refund logic (reverse credit awards, update member status, etc.)
  // Implementation depends on your refund policy
}
