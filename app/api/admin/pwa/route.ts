import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper: Check admin authorization (session-based or token-based)
async function isAdminAuthorized(request: NextRequest): Promise<boolean> {
  // Method 1: Session-based auth (user with admin role)
  const session = await auth();
  if (session?.user && (session.user as any).role === 'admin') {
    return true;
  }

  // Method 2: Token-based auth (Authorization header)
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET;
  if (adminSecret && authHeader === `Bearer ${adminSecret}`) {
    return true;
  }

  // Method 3: Admin email check (allow specific emails)
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (session?.user?.email && adminEmails.includes(session.user.email.toLowerCase())) {
    return true;
  }

  return false;
}

// Get PWA Statistics
export async function GET(request: NextRequest) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get push subscription stats
    const [totalSubscriptions, recentSubscriptions] = await Promise.all([
      prisma?.pushSubscription.count() || 0,
      prisma?.pushSubscription.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }) || 0,
    ]);

    // Browser breakdown
    const subscriptions = await prisma?.pushSubscription.findMany({
      select: { userAgent: true },
    }) || [];

    const browserStats: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const ua = sub.userAgent || 'Unknown';
      let browser = 'Other';
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Edge')) browser = 'Edge';
      browserStats[browser] = (browserStats[browser] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalSubscriptions,
        recentSubscriptions,
        browserBreakdown: browserStats,
      },
    });
  } catch (error) {
    console.error('PWA stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
