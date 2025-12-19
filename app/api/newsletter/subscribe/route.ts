/**
 * Newsletter Subscription API
 *
 * POST /api/newsletter/subscribe
 * Body: { email: string, firstName?: string, source?: string }
 *
 * Features:
 * - Email validation
 * - Duplicate check
 * - Welcome email via Mailgun
 * - Rate limiting (basic)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EmailService } from '@/lib/services/email-service';
import crypto from 'crypto';

// Simple rate limiting using in-memory store (in production, use Redis)
const subscriptionAttempts = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = subscriptionAttempts.get(ip);

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    subscriptionAttempts.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return true;
  }

  record.count++;
  return false;
}

// Email validation regex
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Rate limit check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, firstName, source = 'website' } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check for existing subscription
    const existingSubscriber = await prisma?.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingSubscriber) {
      // If already subscribed and active, return success (idempotent)
      if (existingSubscriber.status === 'ACTIVE') {
        return NextResponse.json({
          success: true,
          message: 'You\'re already subscribed to our newsletter!',
          alreadySubscribed: true,
        });
      }

      // If previously unsubscribed, reactivate
      await prisma?.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          status: 'ACTIVE',
          firstName: firstName || existingSubscriber.firstName,
          source,
          reactivatedAt: new Date(),
        },
      });

      // Send welcome email
      await EmailService.sendNewsletterConfirmation(normalizedEmail, {
        email: normalizedEmail,
        firstName: firstName || existingSubscriber.firstName || undefined,
      });

      return NextResponse.json({
        success: true,
        message: 'Welcome back! Your subscription has been reactivated.',
        reactivated: true,
      });
    }

    // Generate verification token for double opt-in
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new subscriber with PENDING status
    await prisma?.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        firstName: firstName || null,
        source,
        status: 'PENDING',
        verificationToken,
        tokenExpiry,
        subscribedAt: new Date(),
      },
    });

    // Send verification email (double opt-in)
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/verify?token=${verificationToken}`;
    await EmailService.sendVerificationEmail(normalizedEmail, {
      email: normalizedEmail,
      firstName: firstName || undefined,
      verifyUrl,
    });

    console.log(`📧 [NEWSLETTER] Verification sent: ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Please check your email and click the verification link to confirm your subscription.',
      pendingVerification: true,
    });
  } catch (error: any) {
    console.error('[NEWSLETTER_SUBSCRIBE_ERROR]', error);

    // Handle Prisma unique constraint error gracefully
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: true,
        message: 'You\'re already subscribed to our newsletter!',
        alreadySubscribed: true,
      });
    }

    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Health check / info
export async function GET() {
  // Get subscriber count (for admin dashboard)
  const count = await prisma?.newsletterSubscriber.count({
    where: { status: 'ACTIVE' },
  });

  return NextResponse.json({
    service: 'Newsletter Subscription',
    status: 'healthy',
    activeSubscribers: count || 0,
    features: [
      'Email validation',
      'Duplicate prevention',
      'Rate limiting',
      'Confirmation emails via Mailgun',
    ],
  });
}
