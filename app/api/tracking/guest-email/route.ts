import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, source, consent } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const prisma = getPrismaClient();

    // Check if already a registered user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      // Already a user, skip guest tracking
      return NextResponse.json({ success: true, isUser: true });
    }

    // Upsert guest email record
    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: {
        source: source || 'guest_checkout',
        reactivatedAt: new Date(),
      },
      create: {
        email: email.toLowerCase(),
        source: source || 'guest_checkout',
        status: consent ? 'ACTIVE' : 'PENDING',
      },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        eventType: 'guest_email_captured',
        eventData: {
          email: email.substring(0, 3) + '***',
          source,
          consent,
        },
        userAgent: request.headers.get('user-agent') || undefined,
      },
    }).catch(() => {}); // Silent fail for activity logging

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[GUEST_EMAIL] Error:', error);
    return NextResponse.json({ success: true }); // Don't reveal errors
  }
}
