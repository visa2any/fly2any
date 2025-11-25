import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getPrismaClient } from '@/lib/prisma';
import { notifyNewBooking } from '@/lib/notifications/notification-service';

/**
 * Credit Card Authorization API
 *
 * Handles submission of card authorization forms for manual payment processing.
 * Stores authorization data securely for admin review and chargeback protection.
 *
 * POST /api/booking-flow/card-authorization
 */

export const dynamic = 'force-dynamic';

interface CardAuthorizationRequest {
  bookingReference: string;
  cardholderName: string;
  cardLast4: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  email: string;
  phone: string;
  cardFrontImage: string | null;
  cardBackImage: string | null;
  idDocumentImage: string | null;
  signatureImage: string | null;
  signatureTyped: string;
  ackAuthorize: boolean;
  ackCardholder: boolean;
  ackNonRefundable: boolean;
  ackPassengerInfo: boolean;
  ackTerms: boolean;
  amount: number;
  currency: string;
}

// Simple risk assessment based on available data
function calculateRiskScore(data: CardAuthorizationRequest): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // High-value transaction
  if (data.amount > 2000) {
    score += 15;
    factors.push('High-value transaction (>$2000)');
  }
  if (data.amount > 5000) {
    score += 20;
    factors.push('Very high-value transaction (>$5000)');
  }

  // Missing documents
  if (!data.cardFrontImage) {
    score += 10;
    factors.push('Card front image not provided');
  }
  if (!data.cardBackImage) {
    score += 5;
    factors.push('Card back image not provided');
  }
  if (!data.idDocumentImage) {
    score += 15;
    factors.push('ID document not provided');
  }

  // Signature check
  if (!data.signatureImage) {
    score += 10;
    factors.push('Digital signature not provided');
  }

  // Email domain check (free email = slightly higher risk for business travel)
  const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  const emailDomain = data.email.split('@')[1]?.toLowerCase();
  if (freeEmailDomains.includes(emailDomain)) {
    score += 5;
    factors.push('Using free email provider');
  }

  // International card (non-US billing)
  if (data.billingCountry !== 'US') {
    score += 10;
    factors.push('International billing address');
  }

  return { score: Math.min(score, 100), factors };
}

export async function POST(request: NextRequest) {
  try {
    const body: CardAuthorizationRequest = await request.json();
    const headersList = await headers();

    // Get client info
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
                      headersList.get('x-real-ip') ||
                      'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Validate required fields
    if (!body.bookingReference || !body.cardholderName || !body.cardLast4) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate acknowledgments
    if (!body.ackAuthorize || !body.ackCardholder || !body.ackNonRefundable ||
        !body.ackPassengerInfo || !body.ackTerms) {
      return NextResponse.json(
        { error: 'ACKNOWLEDGMENT_REQUIRED', message: 'All acknowledgments must be accepted' },
        { status: 400 }
      );
    }

    // Calculate risk score
    const { score: riskScore, factors: riskFactors } = calculateRiskScore(body);

    const prisma = getPrismaClient();

    // Check if authorization already exists for this booking
    const existingAuth = await prisma.cardAuthorization.findUnique({
      where: { bookingReference: body.bookingReference },
    });

    if (existingAuth) {
      return NextResponse.json(
        { error: 'ALREADY_EXISTS', message: 'Authorization already submitted for this booking' },
        { status: 409 }
      );
    }

    // Create card authorization record
    const authorization = await prisma.cardAuthorization.create({
      data: {
        bookingReference: body.bookingReference,
        cardholderName: body.cardholderName,
        cardLast4: body.cardLast4,
        cardBrand: body.cardBrand,
        expiryMonth: body.expiryMonth,
        expiryYear: body.expiryYear,
        billingStreet: body.billingStreet,
        billingCity: body.billingCity,
        billingState: body.billingState,
        billingZip: body.billingZip,
        billingCountry: body.billingCountry,
        email: body.email,
        phone: body.phone,
        amount: body.amount,
        currency: body.currency,
        cardFrontImage: body.cardFrontImage,
        cardBackImage: body.cardBackImage,
        idDocumentImage: body.idDocumentImage,
        signatureImage: body.signatureImage,
        signatureTyped: body.signatureTyped,
        ackAuthorize: body.ackAuthorize,
        ackCardholder: body.ackCardholder,
        ackNonRefundable: body.ackNonRefundable,
        ackPassengerInfo: body.ackPassengerInfo,
        ackTerms: body.ackTerms,
        ipAddress,
        userAgent,
        riskScore,
        riskFactors: riskFactors as any,
        status: 'PENDING',
        submittedAt: new Date(),
      },
    });

    console.log(`✅ [Card Auth] Authorization created for ${body.bookingReference}`);
    console.log(`   Risk Score: ${riskScore} | Factors: ${riskFactors.join(', ') || 'None'}`);

    // Send notification to admins about new authorization needing review
    try {
      // Use Telegram notification if configured
      const telegramMessage = `
🔐 *Card Authorization Submitted*

📋 *Booking:* ${body.bookingReference}
💳 *Card:* ${body.cardBrand.toUpperCase()} ****${body.cardLast4}
👤 *Cardholder:* ${body.cardholderName}
💰 *Amount:* ${body.currency} ${body.amount.toLocaleString()}

📊 *Risk Score:* ${riskScore}/100
${riskFactors.length > 0 ? `⚠️ *Factors:* ${riskFactors.join(', ')}` : '✅ No risk factors'}

📍 *IP:* ${ipAddress}
📧 *Email:* ${body.email}

🔗 Review: ${process.env.NEXT_PUBLIC_APP_URL}/admin/authorizations
      `.trim();

      // Send via notification service (Telegram + in-app)
      const { notifyTelegramAdmins, broadcastSSE } = await import('@/lib/notifications/notification-service');

      await notifyTelegramAdmins(telegramMessage);

      // Broadcast SSE for real-time dashboard update
      broadcastSSE('admin', 'authorization_submitted', {
        bookingReference: body.bookingReference,
        cardLast4: body.cardLast4,
        amount: body.amount,
        currency: body.currency,
        riskScore,
        timestamp: new Date().toISOString(),
      });
    } catch (notifyError) {
      console.error('⚠️ Failed to send authorization notification:', notifyError);
    }

    return NextResponse.json({
      success: true,
      authorizationId: authorization.id,
      bookingReference: body.bookingReference,
      status: 'PENDING',
      riskScore,
      message: 'Authorization submitted successfully. Your booking is being processed.',
    });
  } catch (error: any) {
    console.error('❌ [Card Auth] Error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to submit authorization. Please try again.'
      },
      { status: 500 }
    );
  }
}

// GET - Check authorization status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingReference = searchParams.get('bookingReference');

    if (!bookingReference) {
      return NextResponse.json(
        { error: 'MISSING_REFERENCE', message: 'Booking reference is required' },
        { status: 400 }
      );
    }

    const prisma = getPrismaClient();

    const authorization = await prisma.cardAuthorization.findUnique({
      where: { bookingReference },
      select: {
        id: true,
        bookingReference: true,
        status: true,
        cardLast4: true,
        cardBrand: true,
        amount: true,
        currency: true,
        submittedAt: true,
        verifiedAt: true,
        rejectionReason: true,
      },
    });

    if (!authorization) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'No authorization found for this booking' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization,
    });
  } catch (error: any) {
    console.error('❌ [Card Auth] Error checking status:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to check authorization status' },
      { status: 500 }
    );
  }
}
