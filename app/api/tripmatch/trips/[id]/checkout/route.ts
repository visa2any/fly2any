/**
 * TripMatch Checkout API
 * POST /api/tripmatch/trips/[id]/checkout
 *
 * Creates a Stripe Checkout session for joining a trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/db/prisma';
import { stripe, STRIPE_CONFIG, calculatePlatformFee } from '@/lib/stripe/config';

export const runtime = 'nodejs';

interface CheckoutBody {
  customizations?: {
    flightPreference?: string;
    hotelPreference?: string;
    dietaryRestrictions?: string;
    emergencyContact?: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrismaClient();
    // Authentication check
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    // Check Stripe configuration
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 503 }
      );
    }

    const tripId = params.id;
    const body: CheckoutBody = await request.json();

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get trip details
    const trip = await prisma.tripGroup.findUnique({
      where: { id: tripId },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Check if trip is full
    if (trip.currentMembers >= trip.maxMembers) {
      return NextResponse.json(
        { error: 'Trip is full' },
        { status: 400 }
      );
    }

    // Check if user already joined
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        tripGroupId: tripId,
        userId: user.id,
        status: { in: ['pending', 'confirmed'] },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'You have already joined this trip' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const pricePerPerson = parseInt(trip.estimatedPricePerPerson);
    const platformFee = calculatePlatformFee(pricePerPerson);
    const totalAmount = pricePerPerson + platformFee;

    // Create Stripe Checkout Session
    const baseUrl = request.headers.get('origin') || 'http://localhost:3001';
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: [...STRIPE_CONFIG.paymentMethodTypes],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: trip.title,
              description: `Group trip to ${trip.destination}`,
              images: trip.coverImageUrl ? [trip.coverImageUrl] : [],
            },
            unit_amount: pricePerPerson * 100, // Convert to cents
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: 'TripMatch Platform Fee',
              description: 'Service and platform fees',
            },
            unit_amount: platformFee * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/tripmatch/trips/${tripId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/tripmatch/trips/${tripId}?canceled=true`,
      customer_email: user.email,
      metadata: {
        tripId: trip.id,
        userId: user.id,
        creatorId: trip.creatorId,
        pricePerPerson: pricePerPerson.toString(),
        platformFee: platformFee.toString(),
        customizations: JSON.stringify(body.customizations || {}),
      },
    });

    // Store pending member record
    await prisma.groupMember.create({
      data: {
        tripGroupId: tripId,
        userId: user.id,
        role: 'member',
        status: 'pending',
        joinedAt: new Date(),
        paymentStatus: 'pending',
        paymentIntentId: checkoutSession.id,
        amountPaid: totalAmount,
        customizations: body.customizations || {},
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
        amount: totalAmount,
        breakdown: {
          tripPrice: pricePerPerson,
          platformFee,
              total: totalAmount,
        },
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
