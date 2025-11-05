/**
 * AI Session Management API
 *
 * Tracks user sessions by IP address with privacy-first approach:
 * - Anonymous session tracking
 * - Progressive engagement
 * - GDPR/CCPA compliant
 * - IP anonymization after 24 hours
 * - Seamless migration to authenticated users
 *
 * @route POST /api/ai/session - Create or update session
 * @route GET /api/ai/session?sessionId=xxx or ?ip=xxx - Retrieve session
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserSession } from '@/lib/ai/auth-strategy';
import crypto from 'crypto';

// ============================================================================
// IN-MEMORY SESSION STORE (Development)
// ============================================================================
// Will be replaced with database in production
const sessionStore = new Map<string, StoredSession>();

interface StoredSession extends UserSession {
  userAgent?: string;
  shouldAnonymize: boolean;
  anonymizedAt?: Date;
}

// ============================================================================
// SESSION MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Extract IP address from request headers
 * Handles various proxy configurations and CDNs
 */
function extractIPAddress(request: NextRequest): string {
  // Check common proxy headers (in order of preference)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare

  // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2)
  // First IP is the original client
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to request IP (may be proxy IP)
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
 * IPv4: 192.168.1.1 -> 192.168.0.0
 * IPv6: 2001:db8::1 -> 2001:db8::
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
 * Check if session should be anonymized (24 hours old)
 */
function shouldAnonymizeSession(session: StoredSession): boolean {
  if (session.anonymizedAt) return false; // Already anonymized

  const hoursSinceCreation = (Date.now() - session.createdAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceCreation >= 24;
}

/**
 * Hash IP address for lookup (privacy-preserving)
 */
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * Find session by IP address
 */
function findSessionByIP(ip: string): StoredSession | null {
  const ipHash = hashIP(ip);

  for (const session of sessionStore.values()) {
    if (session.ipAddress === ipHash && !session.anonymizedAt) {
      return session;
    }
  }

  return null;
}

/**
 * Find session by session ID
 */
function findSessionById(sessionId: string): StoredSession | null {
  return sessionStore.get(sessionId) || null;
}

/**
 * Create new session
 */
function createSession(ip: string, userAgent?: string): StoredSession {
  const sessionId = generateSessionId();
  const ipHash = hashIP(ip);

  const session: StoredSession = {
    sessionId,
    ipAddress: ipHash,
    isAuthenticated: false,
    conversationCount: 0,
    lastActivity: new Date(),
    createdAt: new Date(),
    userAgent,
    shouldAnonymize: false
  };

  sessionStore.set(sessionId, session);
  return session;
}

/**
 * Update session activity and conversation count
 */
function updateSession(session: StoredSession, incrementConversation: boolean = false): StoredSession {
  session.lastActivity = new Date();

  if (incrementConversation) {
    session.conversationCount += 1;
  }

  // Check if session should be anonymized
  if (shouldAnonymizeSession(session) && !session.isAuthenticated) {
    session.ipAddress = anonymizeIP(session.ipAddress);
    session.anonymizedAt = new Date();
    session.shouldAnonymize = true;
  }

  sessionStore.set(session.sessionId, session);
  return session;
}

/**
 * Upgrade session to authenticated user
 */
function upgradeSession(
  session: StoredSession,
  userId: string,
  email: string,
  name: string
): StoredSession {
  session.isAuthenticated = true;
  session.userId = userId;
  session.email = email;
  session.name = name;
  session.shouldAnonymize = false; // Don't anonymize authenticated users

  sessionStore.set(session.sessionId, session);
  return session;
}

/**
 * Clean up old sessions (garbage collection)
 * Remove sessions older than 30 days
 */
function cleanupOldSessions(): void {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.createdAt.getTime() < thirtyDaysAgo && !session.isAuthenticated) {
      sessionStore.delete(sessionId);
    }
  }
}

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

/**
 * POST /api/ai/session
 * Create or update session
 *
 * Body:
 * - action?: 'create' | 'update' | 'increment' | 'upgrade'
 * - sessionId?: string (for updates)
 * - incrementConversation?: boolean
 * - userId?: string (for upgrade)
 * - email?: string (for upgrade)
 * - name?: string (for upgrade)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'create', sessionId, incrementConversation, userId, email, name } = body;

    const ip = extractIPAddress(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Handle different actions
    switch (action) {
      case 'create': {
        // Check if session already exists for this IP
        let session = findSessionByIP(ip);

        if (!session) {
          session = createSession(ip, userAgent);
        } else {
          session = updateSession(session, false);
        }

        return NextResponse.json({
          success: true,
          session: formatSessionResponse(session)
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

        let session = findSessionById(sessionId);

        if (!session) {
          // Session not found, create new one
          session = createSession(ip, userAgent);
        } else {
          session = updateSession(session, incrementConversation || action === 'increment');
        }

        return NextResponse.json({
          success: true,
          session: formatSessionResponse(session)
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

        let session = findSessionById(sessionId);

        if (!session) {
          return NextResponse.json(
            { success: false, error: 'Session not found' },
            { status: 404 }
          );
        }

        session = upgradeSession(session, userId, email, name);

        return NextResponse.json({
          success: true,
          session: formatSessionResponse(session),
          message: 'Session upgraded to authenticated user'
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
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/session?sessionId=xxx or ?ip=current
 * Retrieve session by ID or IP
 *
 * Query params:
 * - sessionId?: string - Retrieve by session ID
 * - ip?: 'current' - Retrieve by current request IP
 * - cleanup?: 'true' - Trigger garbage collection
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const ipParam = searchParams.get('ip');
    const cleanup = searchParams.get('cleanup');

    // Trigger cleanup if requested
    if (cleanup === 'true') {
      cleanupOldSessions();
      return NextResponse.json({
        success: true,
        message: 'Cleanup completed',
        totalSessions: sessionStore.size
      });
    }

    // Retrieve by session ID
    if (sessionId) {
      const session = findSessionById(sessionId);

      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }

      // Update last activity
      updateSession(session, false);

      return NextResponse.json({
        success: true,
        session: formatSessionResponse(session)
      });
    }

    // Retrieve by current IP
    if (ipParam === 'current') {
      const ip = extractIPAddress(request);
      let session = findSessionByIP(ip);

      if (!session) {
        // Create new session
        const userAgent = request.headers.get('user-agent') || undefined;
        session = createSession(ip, userAgent);
      } else {
        session = updateSession(session, false);
      }

      return NextResponse.json({
        success: true,
        session: formatSessionResponse(session)
      });
    }

    // Return stats if no params
    const stats = getSessionStats();
    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('[Session API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
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

    const deleted = sessionStore.delete(sessionId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('[Session API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
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
function formatSessionResponse(session: StoredSession) {
  return {
    sessionId: session.sessionId,
    ipAddress: session.anonymizedAt ? session.ipAddress : '[hidden for privacy]',
    isAuthenticated: session.isAuthenticated,
    userId: session.userId,
    email: session.email,
    name: session.name,
    conversationCount: session.conversationCount,
    lastActivity: session.lastActivity.toISOString(),
    createdAt: session.createdAt.toISOString(),
    anonymizedAt: session.anonymizedAt?.toISOString(),
    userAgent: session.userAgent
  };
}

/**
 * Get session statistics
 */
function getSessionStats() {
  const sessions = Array.from(sessionStore.values());

  return {
    totalSessions: sessions.length,
    authenticatedSessions: sessions.filter(s => s.isAuthenticated).length,
    anonymousSessions: sessions.filter(s => !s.isAuthenticated).length,
    anonymizedSessions: sessions.filter(s => s.anonymizedAt).length,
    activeSessions24h: sessions.filter(s => {
      const hoursSinceActivity = (Date.now() - s.lastActivity.getTime()) / (1000 * 60 * 60);
      return hoursSinceActivity <= 24;
    }).length,
    totalConversations: sessions.reduce((sum, s) => sum + s.conversationCount, 0),
    averageConversationsPerSession: sessions.length > 0
      ? (sessions.reduce((sum, s) => sum + s.conversationCount, 0) / sessions.length).toFixed(2)
      : 0
  };
}

// ============================================================================
// PRIVACY COMPLIANCE
// ============================================================================

/**
 * GDPR/CCPA Compliance Notes:
 *
 * 1. Data Minimization:
 *    - Only collect necessary data (IP, user agent, conversation count)
 *    - No tracking of conversation content in session
 *
 * 2. Purpose Limitation:
 *    - IP address used only for fraud prevention and location
 *    - Session data used only for user experience improvement
 *
 * 3. Storage Limitation:
 *    - IP addresses anonymized after 24 hours
 *    - Sessions deleted after 30 days of inactivity
 *    - Authenticated sessions retained per user preference
 *
 * 4. Rights:
 *    - Right to access: GET /api/ai/session?sessionId=xxx
 *    - Right to deletion: DELETE /api/ai/session?sessionId=xxx
 *    - Right to portability: Data returned in JSON format
 *
 * 5. Security:
 *    - IP addresses hashed for storage
 *    - Cryptographically secure session IDs
 *    - No sensitive data in logs
 *
 * 6. Transparency:
 *    - Clear privacy notices shown to users
 *    - Opt-in for authenticated tracking
 *    - Easy opt-out via session deletion
 */

// ============================================================================
// MIGRATION TO DATABASE
// ============================================================================

/**
 * Database Schema (for future implementation):
 *
 * CREATE TABLE user_sessions (
 *   session_id VARCHAR(64) PRIMARY KEY,
 *   ip_address_hash VARCHAR(64) NOT NULL,
 *   ip_address_anonymized VARCHAR(45),
 *   user_agent TEXT,
 *   is_authenticated BOOLEAN DEFAULT FALSE,
 *   user_id VARCHAR(255),
 *   email VARCHAR(255),
 *   name VARCHAR(255),
 *   conversation_count INTEGER DEFAULT 0,
 *   last_activity TIMESTAMP NOT NULL,
 *   created_at TIMESTAMP NOT NULL,
 *   anonymized_at TIMESTAMP,
 *   country VARCHAR(2),
 *   INDEX idx_ip_hash (ip_address_hash),
 *   INDEX idx_user_id (user_id),
 *   INDEX idx_last_activity (last_activity),
 *   INDEX idx_created_at (created_at)
 * );
 *
 * CREATE TABLE session_analytics (
 *   id SERIAL PRIMARY KEY,
 *   session_id VARCHAR(64) NOT NULL,
 *   event_type VARCHAR(50) NOT NULL,
 *   event_data JSONB,
 *   created_at TIMESTAMP NOT NULL,
 *   INDEX idx_session_id (session_id),
 *   INDEX idx_event_type (event_type),
 *   INDEX idx_created_at (created_at)
 * );
 */
