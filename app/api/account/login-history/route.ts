import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/account/login-history - Get login history
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();

    // Get login history (last 50 entries)
    const loginHistory = await prisma.loginHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    // Detect suspicious logins (simplified logic)
    // In production, you'd want more sophisticated detection:
    // - Compare with user's typical locations
    // - Check for rapid location changes
    // - Detect unusual login times
    // - Flag logins from new devices/browsers
    const history = loginHistory.map((entry) => ({
      id: entry.id,
      device: entry.device,
      browser: entry.browser,
      os: entry.os,
      location: entry.location,
      ipAddress: entry.ipAddress,
      success: entry.success,
      timestamp: entry.timestamp.toISOString(),
      suspicious: false, // TODO: Implement suspicious login detection
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching login history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
