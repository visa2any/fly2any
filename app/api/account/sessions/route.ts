import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

// Helper function to parse user agent
function parseUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return { device: 'Desktop', browser: 'Unknown', os: 'Unknown' };
  }

  // Detect device
  let device = 'Desktop';
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    device = 'Mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    device = 'Tablet';
  }

  // Detect browser
  let browser = 'Unknown';
  if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/Firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Edge|Edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/MSIE|Trident/i.test(userAgent)) {
    browser = 'Internet Explorer';
  }

  // Detect OS
  let os = 'Unknown';
  if (/Windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/Mac OS X/i.test(userAgent)) {
    os = 'macOS';
  } else if (/Linux/i.test(userAgent)) {
    os = 'Linux';
  } else if (/Android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iOS|iPhone|iPad/i.test(userAgent)) {
    os = 'iOS';
  }

  return { device, browser, os };
}

// GET /api/account/sessions - Get active sessions
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();

    // Get current session token
    const currentSessionToken = req.cookies.get('next-auth.session-token')?.value;

    // Get NextAuth sessions
    const nextAuthSessions = await prisma.session.findMany({
      where: { userId: session.user.id },
      orderBy: { expires: 'desc' },
    });

    // Get custom user sessions
    const userSessions = await prisma.userSession.findMany({
      where: { userId: session.user.id },
      orderBy: { lastActive: 'desc' },
    });

    // Combine and format sessions
    const sessions = [
      ...nextAuthSessions.map((s) => ({
        id: s.id,
        device: null,
        browser: null,
        os: null,
        location: null,
        ipAddress: null,
        lastActive: s.expires.toISOString(),
        isCurrent: s.sessionToken === currentSessionToken,
      })),
      ...userSessions.map((s) => ({
        id: s.id,
        device: s.device,
        browser: s.browser,
        os: s.os,
        location: s.location,
        ipAddress: s.ipAddress,
        lastActive: s.lastActive.toISOString(),
        isCurrent: false,
      })),
    ];

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/account/sessions/all - Revoke all other sessions
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();

    // Get current session token
    const currentSessionToken = req.cookies.get('next-auth.session-token')?.value;

    // Delete all NextAuth sessions except current
    if (currentSessionToken) {
      await prisma.session.deleteMany({
        where: {
          userId: session.user.id,
          sessionToken: { not: currentSessionToken },
        },
      });
    }

    // Delete all custom user sessions
    await prisma.userSession.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true, message: 'All other sessions revoked' });
  } catch (error) {
    console.error('Error revoking sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
