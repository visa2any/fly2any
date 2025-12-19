/**
 * Newsletter Email Verification (Double Opt-in)
 * GET /api/newsletter/verify?token=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EmailService } from '@/lib/services/email-service';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/newsletter/error?reason=missing_token', request.url));
  }

  try {
    // Find subscriber by token
    const subscriber = await prisma?.newsletterSubscriber.findFirst({
      where: {
        verificationToken: token,
        status: 'PENDING',
      },
    });

    if (!subscriber) {
      return NextResponse.redirect(new URL('/newsletter/error?reason=invalid_token', request.url));
    }

    // Check token expiry
    if (subscriber.tokenExpiry && new Date() > subscriber.tokenExpiry) {
      return NextResponse.redirect(new URL('/newsletter/error?reason=expired', request.url));
    }

    // Activate subscription
    await prisma?.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'ACTIVE',
        verificationToken: null,
        tokenExpiry: null,
        verifiedAt: new Date(),
      },
    });

    // Send welcome email
    await EmailService.sendNewsletterConfirmation(subscriber.email, {
      email: subscriber.email,
      firstName: subscriber.firstName || undefined,
    });

    console.log(`✅ [NEWSLETTER] Verified: ${subscriber.email}`);

    // Redirect to success page
    return NextResponse.redirect(new URL('/newsletter/confirmed', request.url));
  } catch (error) {
    console.error('[NEWSLETTER_VERIFY_ERROR]', error);
    return NextResponse.redirect(new URL('/newsletter/error?reason=server_error', request.url));
  }
}
