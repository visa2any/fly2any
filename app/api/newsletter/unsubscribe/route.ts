/**
 * Newsletter Unsubscribe API
 *
 * Handles email unsubscription requests
 * - Updates subscriber status to UNSUBSCRIBED
 * - Adds to suppression list
 * - GDPR/CAN-SPAM compliant
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const prisma = getPrismaClient();

    // Update subscriber status
    try {
      await prisma.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          status: 'UNSUBSCRIBED',
          unsubscribedAt: new Date(),
        },
      });
      console.log(`📧 [UNSUBSCRIBE] Updated subscriber status: ${normalizedEmail}`);
    } catch (err) {
      // Subscriber might not exist in the database (external list)
      console.log(`📧 [UNSUBSCRIBE] Subscriber not found: ${normalizedEmail}`);
    }

    // Add to suppression list to prevent future emails
    try {
      await prisma.$executeRaw`
        INSERT INTO "email_suppressions" ("id", "email", "reason", "details", "createdAt")
        VALUES (
          ${`sup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`},
          ${normalizedEmail},
          'unsubscribed',
          'User clicked unsubscribe link',
          NOW()
        )
        ON CONFLICT ("email") DO NOTHING
      `;
      console.log(`📧 [UNSUBSCRIBE] Added to suppression list: ${normalizedEmail}`);
    } catch (err) {
      // Suppression entry might already exist
      console.log(`📧 [UNSUBSCRIBE] Suppression entry already exists for: ${normalizedEmail}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    });
  } catch (error) {
    console.error('[NEWSLETTER_UNSUBSCRIBE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}

// GET method for one-click unsubscribe (RFC 8058)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.redirect(new URL('/unsubscribe', request.url));
  }

  // Process unsubscribe
  const normalizedEmail = email.trim().toLowerCase();
  const prisma = getPrismaClient();

  try {
    // Update subscriber status
    try {
      await prisma.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: {
          status: 'UNSUBSCRIBED',
          unsubscribedAt: new Date(),
        },
      });
    } catch (err) {
      // Subscriber might not exist
    }

    // Add to suppression list
    try {
      await prisma.$executeRaw`
        INSERT INTO "email_suppressions" ("id", "email", "reason", "details", "createdAt")
        VALUES (
          ${`sup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`},
          ${normalizedEmail},
          'unsubscribed',
          'One-click unsubscribe (RFC 8058)',
          NOW()
        )
        ON CONFLICT ("email") DO NOTHING
      `;
    } catch (err) {
      // Already exists
    }
  } catch (error) {
    console.error('[ONE_CLICK_UNSUBSCRIBE] Error:', error);
  }

  // Redirect to confirmation page
  return NextResponse.redirect(
    new URL(`/unsubscribe?email=${encodeURIComponent(normalizedEmail)}&success=true`, request.url)
  );
}
