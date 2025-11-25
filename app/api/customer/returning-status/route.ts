import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

/**
 * Check if a customer is a returning customer
 *
 * A returning customer is one who has:
 * 1. A previous verified card authorization
 * 2. With all documents uploaded
 *
 * GET /api/customer/returning-status?email=customer@email.com
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { isReturning: false, reason: 'No email provided' },
        { status: 200 }
      );
    }

    const prisma = getPrismaClient();

    // Check for previous verified authorization with documents
    const previousAuth = await prisma.cardAuthorization.findFirst({
      where: {
        email: email.toLowerCase(),
        status: 'VERIFIED',
        // Must have uploaded documents previously
        cardFrontImage: { not: null },
        cardBackImage: { not: null },
        idDocumentImage: { not: null },
      },
      select: {
        id: true,
        bookingReference: true,
        cardholderName: true,
        cardLast4: true,
        cardBrand: true,
        verifiedAt: true,
      },
      orderBy: {
        verifiedAt: 'desc',
      },
    });

    if (previousAuth) {
      return NextResponse.json({
        isReturning: true,
        lastVerified: previousAuth.verifiedAt,
        cardholderName: previousAuth.cardholderName,
        cardHint: `${previousAuth.cardBrand?.toUpperCase()} ****${previousAuth.cardLast4}`,
      });
    }

    // Check for any previous authorization (even pending/rejected)
    const anyPreviousAuth = await prisma.cardAuthorization.findFirst({
      where: {
        email: email.toLowerCase(),
      },
      select: {
        id: true,
        status: true,
        bookingReference: true,
      },
    });

    if (anyPreviousAuth) {
      return NextResponse.json({
        isReturning: false,
        hasPreviousAttempts: true,
        reason: 'Has previous authorization attempts but not verified with documents',
      });
    }

    return NextResponse.json({
      isReturning: false,
      reason: 'New customer',
    });
  } catch (error: any) {
    console.error('Error checking returning status:', error);
    return NextResponse.json(
      { isReturning: false, error: 'Unable to check status' },
      { status: 200 } // Return 200 with false to not break the flow
    );
  }
}
