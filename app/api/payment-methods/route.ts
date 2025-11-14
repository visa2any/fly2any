import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { getPrismaClient } from '@/lib/prisma';

/**
 * GET /api/payment-methods
 * Fetch all payment methods for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const methods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      methods,
      total: methods.length,
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payment-methods
 * Create a new payment method (simplified - requires Stripe integration for production)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const prisma = getPrismaClient();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Basic validation
    if (!body.cardNumber || !body.expiryMonth || !body.expiryYear || !body.cvv) {
      return NextResponse.json(
        { error: 'Missing required card information' },
        { status: 400 }
      );
    }

    // TODO: In production, integrate with Stripe to tokenize card
    // For now, we'll store basic information (never store full card number in production!)

    const last4 = body.cardNumber.slice(-4);
    const brand = detectCardBrand(body.cardNumber);

    // If setting as default, unset other defaults first
    if (body.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const method = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type: 'card',
        provider: 'stripe',
        last4,
        brand,
        expiryMonth: parseInt(body.expiryMonth),
        expiryYear: parseInt(body.expiryYear),
        cardholderName: body.cardholderName,
        nickname: body.nickname,
        isDefault: body.isDefault || false,
        // TODO: stripePaymentMethodId would be set here after Stripe tokenization
      },
    });

    return NextResponse.json({
      success: true,
      method,
      message: 'Payment method added successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
}

// Helper function to detect card brand
function detectCardBrand(cardNumber: string): string {
  const number = cardNumber.replace(/\s/g, '');

  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  if (/^3[47]/.test(number)) return 'amex';
  if (/^6(?:011|5)/.test(number)) return 'discover';

  return 'unknown';
}
