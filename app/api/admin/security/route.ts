/**
 * Security Admin API
 *
 * Provides security metrics, blocked IPs, and management endpoints.
 * Protected by admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Redis } from '@upstash/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

interface SecurityMetrics {
  overview: {
    totalBlockedIPs: number;
    honeypotTriggers24h: number;
    rateLimitBlocks24h: number;
    suspiciousRequests24h: number;
  };
  topBlockedIPs: Array<{ ip: string; count: number; reason?: string }>;
  recentSuspiciousActivity: Array<{
    ip: string;
    path: string;
    reason: string;
    timestamp: string;
  }>;
  honeypotLog: Array<{
    ip: string;
    path: string;
    userAgent: string;
    timestamp: string;
  }>;
  threatScoreDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

// Helper: Check admin authorization
async function isAdminAuthorized(request: NextRequest): Promise<boolean> {
  const session = await auth();
  if (session?.user && (session.user as any).role === 'admin') return true;

  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET;
  if (adminSecret && authHeader === `Bearer ${adminSecret}`) return true;

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (session?.user?.email && adminEmails.includes(session.user.email.toLowerCase())) return true;

  return false;
}

export async function GET(request: NextRequest) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis not available', metrics: null });
    }

    // Fetch all metrics from Redis
    const [
      blockedIPs,
      honeypotTriggers,
      suspiciousLogs,
      honeypotLogs,
      manualBlocked,
    ] = await Promise.all([
      redis.hgetall('blocked_ips') as Promise<Record<string, string> | null>,
      redis.hgetall('honeypot_triggers') as Promise<Record<string, string> | null>,
      redis.lrange('suspicious_requests', 0, 49) as Promise<string[]>,
      redis.lrange('honeypot_log', 0, 49) as Promise<string[]>,
      redis.hgetall('manual_blocked_ips') as Promise<Record<string, string> | null>,
    ]);

    // Process blocked IPs
    const blockedEntries = Object.entries(blockedIPs || {})
      .map(([ip, count]) => ({ ip, count: Number(count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Process honeypot triggers
    const honeypotCount = Object.values(honeypotTriggers || {})
      .reduce((sum: number, count) => sum + Number(count), 0);

    // Parse logs
    const parseSafe = (str: string) => {
      try { return JSON.parse(str); } catch { return null; }
    };

    const suspiciousActivity = (suspiciousLogs || [])
      .map(parseSafe)
      .filter(Boolean)
      .slice(0, 20);

    const honeypotActivity = (honeypotLogs || [])
      .map(parseSafe)
      .filter(Boolean)
      .slice(0, 20);

    const metrics: SecurityMetrics = {
      overview: {
        totalBlockedIPs: Object.keys(blockedIPs || {}).length + Object.keys(manualBlocked || {}).length,
        honeypotTriggers24h: honeypotCount,
        rateLimitBlocks24h: blockedEntries.reduce((sum, e) => sum + e.count, 0),
        suspiciousRequests24h: suspiciousActivity.length,
      },
      topBlockedIPs: blockedEntries,
      recentSuspiciousActivity: suspiciousActivity,
      honeypotLog: honeypotActivity,
      threatScoreDistribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: suspiciousActivity.length,
      },
    };

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Security API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security metrics' },
      { status: 500 }
    );
  }
}

/**
 * POST - Manage blocked IPs
 */
export async function POST(request: NextRequest) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!redis) {
      return NextResponse.json({ error: 'Redis not available' }, { status: 503 });
    }

    const body = await request.json();
    const { action, ip, reason } = body;

    switch (action) {
      case 'block':
        if (!ip) return NextResponse.json({ error: 'IP required' }, { status: 400 });
        await redis.hset('manual_blocked_ips', { [ip]: reason || 'manual_block' });
        return NextResponse.json({ success: true, message: `IP ${ip} blocked` });

      case 'unblock':
        if (!ip) return NextResponse.json({ error: 'IP required' }, { status: 400 });
        await redis.hdel('manual_blocked_ips', ip);
        await redis.hdel('blocked_ips', ip);
        await redis.del(`blocked:${ip}`);
        return NextResponse.json({ success: true, message: `IP ${ip} unblocked` });

      case 'clear_honeypot':
        await redis.del('honeypot_log');
        await redis.del('honeypot_triggers');
        return NextResponse.json({ success: true, message: 'Honeypot logs cleared' });

      case 'clear_suspicious':
        await redis.del('suspicious_requests');
        return NextResponse.json({ success: true, message: 'Suspicious logs cleared' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Security API] POST error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
