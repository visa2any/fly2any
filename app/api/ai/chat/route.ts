/**
 * AI Chat API Endpoint
 * Routes queries through smart NLP + Groq AI system
 *
 * SECURITY: Rate limited + session/auth required
 */

import { NextRequest, NextResponse } from 'next/server';
import { routeQuery, type SessionContext } from '@/lib/ai/smart-router';
import { getUsageStats, type GroqMessage } from '@/lib/ai/groq-client';
import type { TeamType } from '@/lib/ai/consultant-handoff';
import { checkRateLimit, addRateLimitHeaders, getClientIP } from '@/lib/security/rate-limiter';
import { AI_RATE_LIMITS } from '@/lib/security/rate-limit-config';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Rate limit: 30 req/min for AI chat
const CHAT_RATE_LIMIT = {
  ...AI_RATE_LIMITS.chat,
  maxRequests: 30,
  windowMs: 60 * 1000,
  keyPrefix: 'ai-chat',
};

/**
 * Validate session token for guest users
 * Token format: timestamp:hash where hash = HMAC(timestamp + ip, secret)
 */
function validateGuestToken(token: string, ip: string): boolean {
  if (!token) return false;
  try {
    const [timestamp, hash] = token.split(':');
    if (!timestamp || !hash) return false;

    // Token expires after 24 hours
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) return false;

    const secret = process.env.NEXTAUTH_SECRET || 'fly2any-chat-secret';
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}:${ip}`)
      .digest('hex')
      .substring(0, 16);

    return hash === expectedHash;
  } catch {
    return false;
  }
}

/**
 * Generate guest session token
 */
function generateGuestToken(ip: string): string {
  const timestamp = Date.now().toString();
  const secret = process.env.NEXTAUTH_SECRET || 'fly2any-chat-secret';
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}:${ip}`)
    .digest('hex')
    .substring(0, 16);
  return `${timestamp}:${hash}`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  // === RATE LIMITING === (outside error wrapper - expected response)
  const rateLimitResult = await checkRateLimit(request, CHAT_RATE_LIMIT);
  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Please slow down. Try again in a moment.',
        retryAfter: rateLimitResult.retryAfter,
        success: false
      },
      { status: 429 }
    );
    addRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  // Wrap main business logic with global error handler
  return handleApiError(
    request,
    async () => {
      const body = await request.json();
      const {
        message,
        previousTeam,
        conversationHistory = [],
        customerName,
        useAI = true,
        sessionToken,
        sessionContext: clientSessionContext
      } = body as {
        message: string;
        previousTeam?: TeamType;
        conversationHistory?: GroqMessage[];
        customerName?: string;
        useAI?: boolean;
        sessionToken?: string;
        sessionContext?: SessionContext;
      };

      // === AUTHENTICATION ===
      // Allow either: 1) Authenticated user, or 2) Valid guest token
      const session = await auth();
      const isAuthenticated = !!session?.user;
      const hasValidGuestToken = validateGuestToken(sessionToken || '', ip);

      if (!isAuthenticated && !hasValidGuestToken) {
        // Return new guest token for first-time users
        const newToken = generateGuestToken(ip);
        return NextResponse.json(
          {
            error: 'Session required',
            message: 'Please use the provided session token for chat access.',
            sessionToken: newToken,
            success: false
          },
          { status: 401 }
        );
      }

      if (!message || typeof message !== 'string') {
        return NextResponse.json(
          { error: 'Message is required', success: false },
          { status: 400 }
        );
      }

      // Route the query through smart router (with session context for persistence)
      const result = await routeQuery(message, {
        previousTeam: previousTeam as TeamType | null,
        conversationHistory: conversationHistory as GroqMessage[],
        customerName,
        useAI,
        sessionContext: clientSessionContext
      });

      // Get current usage stats
      const usageStats = await getUsageStats();

      const response = NextResponse.json({
        success: true,
        ...result,
        // Return updated session context for client to persist
        sessionContext: result.sessionContext,
        usage: {
          dailyRemaining: usageStats.dailyRemaining,
          percentUsed: usageStats.percentUsed
        }
      });

      addRateLimitHeaders(response, rateLimitResult);
      return response;
    },
    {
      category: ErrorCategory.EXTERNAL_API,
      severity: ErrorSeverity.HIGH
    }
  );
}

/**
 * GET - Returns current AI usage statistics
 * Also rate limited
 */
export async function GET(request: NextRequest) {
  // Rate limiting for stats endpoint (outside error wrapper)
  const rateLimitResult = await checkRateLimit(request, {
    maxRequests: 60,
    windowMs: 60 * 1000,
    keyPrefix: 'ai-stats',
  });

  if (!rateLimitResult.success) {
    const response = NextResponse.json(
      { error: 'Too many requests', success: false },
      { status: 429 }
    );
    addRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  // Wrap stats retrieval with global error handler
  return handleApiError(
    request,
    async () => {
      const stats = getUsageStats();
      const response = NextResponse.json({ success: true, stats });
      addRateLimitHeaders(response, rateLimitResult);
      return response;
    },
    {
      category: ErrorCategory.EXTERNAL_API,
      severity: ErrorSeverity.NORMAL
    }
  );
}
