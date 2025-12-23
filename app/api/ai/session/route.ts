/**
 * AI Session Management API - Database-Backed
 *
 * Tracks user sessions with privacy-first approach:
 * - Anonymous session tracking (IP-based)
 * - Progressive engagement
 * - GDPR/CCPA compliant
 * - IP anonymization after 24 hours
 * - Seamless migration to authenticated users
 *
 * STABILITY: Uses persistent PostgreSQL storage via Prisma
 *
 * @route POST /api/ai/session - Create or update session
 * @route GET /api/ai/session?sessionId=xxx or ?ip=xxx - Retrieve session
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserSession } from '@/lib/ai/auth-strategy';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Type cast for Prisma model (handles model naming)
const db = prisma as any;

interface StoredSession extends UserSession {
  userAgent?: string;
  shouldAnonymize: boolean;
  anonymizedAt?: Date;
}

// ============================================================================
// SESSION MANAGEMENT FUNCTIONS (Database-Backed)
// ============================================================================

/**
 * Extract IP address from request headers
 * Handles various proxy configurations and CDNs
 */
function extractIPAddress(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;

  return request.ip || 'unknown';
}

/**
 * Generate cryptographically secure session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `session_${timestamp}_${randomBytes}`;
}

/**
 * Anonymize IP address (GDPR compliance)
 */
function anonymizeIP(ip: string): string {
  if (ip === 'unknown') return ip;

  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.0.0`;
    }
  }

  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}::`;
    }
  }

  return ip;
}

/**
 * Hash IP address for lookup (privacy-preserving)
 */
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * Find session by IP address (database)
 */
async function findSessionByIP(ip: string): Promise<any | null> {
  if (!prisma) return null;

  const ipHash = hashIP(ip);

  try {
    const session = await db.aISession.findFirst({
      where: {
        ipAddressHash: ipHash,
        anonymizedAt: null,
      },
      orderBy: { lastActivity: 'desc' },
    });

    return session;
  } catch (error) {
    console.error('[Session] DB lookup error:', error);
    return null;
  }
}

/**
 * Find session by session ID (database)
 */
async function findSessionById(sessionId: string): Promise<any | null> {
  if (!prisma) return null;

  try {
    return await db.aISession.findUnique({
      where: { sessionId },
    });
  } catch (error) {
    console.error('[Session] DB lookup error:', error);
    return null;
  }
}

/**
 * Create new session (database)
 */
async function createSession(ip: string, userAgent?: string): Promise<any> {
  const sessionId = generateSessionId();
  const ipHash = hashIP(ip);

  if (!prisma) {
    // Fallback for when DB isn't available
    return {
      id: sessionId,
      sessionId,
      ipAddressHash: ipHash,
      isAuthenticated: false,
      conversationCount: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
      userAgent,
    };
  }

  try {
    return await db.aISession.create({
      data: {
        sessionId,
        ipAddressHash: ipHash,
        userAgent,
        isAuthenticated: false,
        conversationCount: 0,
        lastActivity: new Date(),
      },
    });
  } catch (error) {
    console.error('[Session] DB create error:', error);
    // Return in-memory fallback
    return {
      id: sessionId,
      sessionId,
      ipAddressHash: ipHash,
      isAuthenticated: false,
      conversationCount: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
      userAgent,
    };
  }
}

/**
 * Update session activity and conversation count (database)
 */
async function updateSession(session: any, incrementConversation: boolean = false): Promise<any> {
  if (!prisma) return session;

  const shouldAnonymize = !session.isAuthenticated && !session.anonymizedAt &&
    (Date.now() - new Date(session.createdAt).getTime()) >= 24 * 60 * 60 * 1000;

  try {
    return await db.aISession.update({
      where: { id: session.id },
      data: {
        lastActivity: new Date(),
        conversationCount: incrementConversation
          ? { increment: 1 }
          : session.conversationCount,
        ...(shouldAnonymize && {
          ipAddressAnonymized: anonymizeIP(session.ipAddressHash),
          anonymizedAt: new Date(),
        }),
      },
    });
  } catch (error) {
    console.error('[Session] DB update error:', error);
    return session;
  }
}

/**
 * Upgrade session to authenticated user (database)
 */
async function upgradeSession(
  session: any,
  userId: string,
  email: string,
  name: string
): Promise<any> {
  if (!prisma) {
    return {
      ...session,
      isAuthenticated: true,
      userId,
      email,
      name,
    };
  }

  try {
    return await db.aISession.update({
      where: { id: session.id },
      data: {
        isAuthenticated: true,
        userId,
        email,
        name,
      },
    });
  } catch (error) {
    console.error('[Session] DB upgrade error:', error);
    return session;
  }
}

/**
 * Clean up old sessions (garbage collection)
 */
async function cleanupOldSessions(): Promise<number> {
  if (!prisma) return 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const result = await db.aISession.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        isAuthenticated: false,
      },
    });

    return result.count;
  } catch (error) {
    console.error('[Session] DB cleanup error:', error);
    return 0;
  }
}

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

/**
 * POST /api/ai/session
 * Create or update session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'create', sessionId, incrementConversation, userId, email, name } = body;

    const ip = extractIPAddress(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    switch (action) {
      case 'create': {
        let session = await findSessionByIP(ip);

        if (!session) {
          session = await createSession(ip, userAgent);
        } else {
          session = await updateSession(session, false);
        }

        return NextResponse.json({
          success: true,
          session: formatSessionResponse(session),
        });
      }

      case 'update':
      case 'increment': {
        if (!sessionId) {
          return NextResponse.json(
            { success: false, error: 'Session ID required for update' },
            { status: 400 }
          );
        }

        let session = await findSessionById(sessionId);

        if (!session) {
          session = await createSession(ip, userAgent);
        } else {
          session = await updateSession(session, incrementConversation || action === 'increment');
        }

        return NextResponse.json({
          success: true,
          session: formatSessionResponse(session),
        });
      }

      case 'upgrade': {
        if (!sessionId) {
          return NextResponse.json(
            { success: false, error: 'Session ID required for upgrade' },
            { status: 400 }
          );
        }

        if (!userId || !email || !name) {
          return NextResponse.json(
            { success: false, error: 'User ID, email, and name required for upgrade' },
            { status: 400 }
          );
        }

        let session = await findSessionById(sessionId);

        if (!session) {
          return NextResponse.json(
            { success: false, error: 'Session not found' },
            { status: 404 }
          );
        }

        session = await upgradeSession(session, userId, email, name);

        return NextResponse.json({
          success: true,
          session: formatSessionResponse(session),
          message: 'Session upgraded to authenticated user',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Session API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/session?sessionId=xxx or ?ip=current
 * Retrieve session by ID or IP
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const ipParam = searchParams.get('ip');
    const cleanup = searchParams.get('cleanup');

    // Trigger cleanup if requested
    if (cleanup === 'true') {
      const deleted = await cleanupOldSessions();
      const totalSessions = prisma ? await db.aISession.count() : 0;

      return NextResponse.json({
        success: true,
        message: `Cleanup completed. Deleted ${deleted} old sessions.`,
        totalSessions,
      });
    }

    // Retrieve by session ID
    if (sessionId) {
      const session = await findSessionById(sessionId);

      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }

      await updateSession(session, false);

      return NextResponse.json({
        success: true,
        session: formatSessionResponse(session),
      });
    }

    // Retrieve by current IP
    if (ipParam === 'current') {
      const ip = extractIPAddress(request);
      let session = await findSessionByIP(ip);

      if (!session) {
        const userAgent = request.headers.get('user-agent') || undefined;
        session = await createSession(ip, userAgent);
      } else {
        session = await updateSession(session, false);
      }

      return NextResponse.json({
        success: true,
        session: formatSessionResponse(session),
      });
    }

    // Return stats if no params
    const stats = await getSessionStats();
    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('[Session API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/session?sessionId=xxx
 * Delete session (GDPR right to be forgotten)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    try {
      await db.aISession.delete({
        where: { sessionId },
      });
    } catch {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });

  } catch (error) {
    console.error('[Session API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format session for API response (remove sensitive data)
 */
function formatSessionResponse(session: any) {
  return {
    sessionId: session.sessionId,
    ipAddress: session.anonymizedAt ? session.ipAddressAnonymized : '[hidden for privacy]',
    isAuthenticated: session.isAuthenticated,
    userId: session.userId,
    email: session.email,
    name: session.name,
    conversationCount: session.conversationCount,
    lastActivity: session.lastActivity instanceof Date
      ? session.lastActivity.toISOString()
      : session.lastActivity,
    createdAt: session.createdAt instanceof Date
      ? session.createdAt.toISOString()
      : session.createdAt,
    anonymizedAt: session.anonymizedAt instanceof Date
      ? session.anonymizedAt.toISOString()
      : session.anonymizedAt,
    userAgent: session.userAgent,
  };
}

/**
 * Get session statistics (database)
 */
async function getSessionStats() {
  if (!prisma) {
    return {
      totalSessions: 0,
      authenticatedSessions: 0,
      anonymousSessions: 0,
      anonymizedSessions: 0,
      activeSessions24h: 0,
      totalConversations: 0,
      averageConversationsPerSession: 0,
      storageType: 'none',
    };
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const [
      totalSessions,
      authenticatedSessions,
      anonymizedSessions,
      activeSessions24h,
      conversationSum,
    ] = await Promise.all([
      db.aISession.count(),
      db.aISession.count({ where: { isAuthenticated: true } }),
      db.aISession.count({ where: { anonymizedAt: { not: null } } }),
      db.aISession.count({ where: { lastActivity: { gte: twentyFourHoursAgo } } }),
      db.aISession.aggregate({ _sum: { conversationCount: true } }),
    ]);

    const totalConversations = conversationSum._sum.conversationCount || 0;

    return {
      totalSessions,
      authenticatedSessions,
      anonymousSessions: totalSessions - authenticatedSessions,
      anonymizedSessions,
      activeSessions24h,
      totalConversations,
      averageConversationsPerSession: totalSessions > 0
        ? (totalConversations / totalSessions).toFixed(2)
        : 0,
      storageType: 'postgresql',
    };
  } catch (error) {
    console.error('[Session] Stats error:', error);
    return {
      totalSessions: 0,
      storageType: 'error',
    };
  }
}
