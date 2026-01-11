/**
 * Cost Protection Guard
 *
 * Blocks expensive API calls (Duffel, Amadeus) BEFORE they happen.
 * Uses multi-layer defense: rate limit → threat score → cost budget.
 *
 * Key principle: Reject suspicious requests before incurring API costs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';
import { checkRateLimit, RATE_LIMITS, getClientIP, createRateLimitResponse } from './redis-rate-limiter';
import { calculateThreatScore, isLikelyBot, shouldBlockRequest } from './bot-detection';
import { alertBotDetected, alertHighThreatScore, alertRateLimitExceeded, alertDailyBudgetExceeded } from './security-alerts';

export interface CostGuardConfig {
  /** Maximum requests per IP per day for expensive endpoints */
  dailyBudget?: number;
  /** Threat score threshold to block (0-100) */
  threatThreshold?: number;
  /** Skip protection for authenticated users */
  skipAuthenticated?: boolean;
  /** Endpoint type for logging */
  endpoint?: string;
}

export interface CostGuardResult {
  allowed: boolean;
  reason?: string;
  threatScore?: number;
  dailyRemaining?: number;
  response?: NextResponse;
}

const DEFAULT_CONFIG: Required<CostGuardConfig> = {
  dailyBudget: 50,
  threatThreshold: 60,
  skipAuthenticated: true,
  endpoint: 'unknown',
};

/**
 * Check if request is in test mode (bypass security for E2E tests)
 * Requires matching secret token for security
 */
function isTestMode(request: NextRequest): boolean {
  const testHeader = request.headers.get('x-test-mode');
  const testSecret = request.headers.get('x-test-secret');

  const validModes = ['fare-reconciliation', 'e2e-test'];
  const expectedSecret = process.env.E2E_TEST_SECRET || 'fly2any-e2e-secure-2025';

  if (!testHeader || !validModes.includes(testHeader)) return false;
  if (!testSecret || testSecret !== expectedSecret) {
    console.warn('[Security] Test mode attempted without valid secret');
    return false;
  }

  return true;
}

/**
 * Main cost protection check - run BEFORE expensive API calls
 */
export async function checkCostGuard(
  request: NextRequest,
  config: Partial<CostGuardConfig> = {}
): Promise<CostGuardResult> {
  const opts = { ...DEFAULT_CONFIG, ...config };
  const ip = getClientIP(request);

  // Bypass security for test mode
  if (isTestMode(request)) {
    return {
      allowed: true,
      threatScore: 0,
      dailyRemaining: opts.dailyBudget,
    };
  }

  // Bypass bot detection for authenticated agent portal requests
  // Agents are trusted users - skip aggressive bot checks
  const referer = request.headers.get('referer') || '';
  const hasAuthCookie = request.cookies.has('authjs.session-token') ||
                        request.cookies.has('__Secure-authjs.session-token') ||
                        request.cookies.has('next-auth.session-token') ||
                        request.cookies.has('__Secure-next-auth.session-token');
  const isAgentPortal = referer.includes('/agent/');

  if (hasAuthCookie && isAgentPortal) {
    // Authenticated agent - allow with higher rate limit
    return {
      allowed: true,
      threatScore: 0,
      dailyRemaining: opts.dailyBudget,
    };
  }

  // Layer 1: Quick bot check (fast path, no Redis)
  // DISABLED for flight search - too many false positives blocking real users
  // Only enable for sensitive endpoints (bookings, payments)
  const isSensitiveEndpoint = opts.endpoint?.includes('booking') || opts.endpoint?.includes('payment') || opts.endpoint?.includes('prebook');

  if (isSensitiveEndpoint && isLikelyBot(request)) {
    // Send alert (non-blocking)
    const userAgent = request.headers.get('user-agent') || '';
    alertBotDetected(ip, userAgent, opts.endpoint).catch(() => {});

    return {
      allowed: false,
      reason: 'bot_detected',
      response: NextResponse.json(
        { error: 'Access denied', code: 'BOT_DETECTED' },
        { status: 403 }
      ),
    };
  }

  // Layer 2: Rate limit check (Redis-backed)
  const rateConfig = opts.endpoint?.includes('flight')
    ? RATE_LIMITS.FLIGHT_SEARCH
    : opts.endpoint?.includes('hotel')
      ? RATE_LIMITS.HOTEL_SEARCH
      : RATE_LIMITS.API;

  const rateResult = await checkRateLimit(request, rateConfig);

  if (!rateResult.success) {
    // Send alert for rate limit exceeded (non-blocking)
    alertRateLimitExceeded(ip, opts.endpoint || 'unknown', rateConfig.maxRequests + 1, rateConfig.maxRequests).catch(() => {});

    return {
      allowed: false,
      reason: 'rate_limit_exceeded',
      response: createRateLimitResponse(rateResult),
    };
  }

  // Layer 3: Threat score analysis
  const threatScore = await calculateThreatScore(request, ip);

  if (shouldBlockRequest(threatScore, opts.threatThreshold)) {
    // Log suspicious request
    await logSuspiciousRequest(ip, opts.endpoint, threatScore.reasons);

    // Send alert for high threat score (non-blocking)
    const userAgent = request.headers.get('user-agent') || '';
    alertHighThreatScore(ip, threatScore.score, threatScore.reasons, opts.endpoint, userAgent).catch(() => {});

    return {
      allowed: false,
      reason: 'threat_score_exceeded',
      threatScore: threatScore.score,
      response: NextResponse.json(
        {
          error: 'Request blocked',
          code: 'SECURITY_CHECK_FAILED',
          message: 'Your request was flagged by our security system. Please try again later.',
        },
        { status: 403 }
      ),
    };
  }

  // Layer 4: Daily budget check (for expensive endpoints)
  const redis = getRedisClient();
  if (redis && isRedisEnabled()) {
    const today = new Date().toISOString().split('T')[0];
    const budgetKey = `cost_budget:${ip}:${opts.endpoint}:${today}`;

    try {
      const currentCount = await redis.incr(budgetKey);

      // Set expiry on first request of day
      if (currentCount === 1) {
        await redis.expire(budgetKey, 86400); // 24 hours
      }

      if (currentCount > opts.dailyBudget) {
        // Send alert for daily budget exceeded (non-blocking)
        alertDailyBudgetExceeded(ip, opts.endpoint || 'unknown', currentCount).catch(() => {});

        return {
          allowed: false,
          reason: 'daily_budget_exceeded',
          dailyRemaining: 0,
          response: NextResponse.json(
            {
              error: 'Daily limit exceeded',
              code: 'DAILY_LIMIT',
              message: `You've exceeded your daily limit for this service. Please try again tomorrow.`,
              resetAt: new Date(Date.now() + 86400000).toISOString(),
            },
            { status: 429 }
          ),
        };
      }

      return {
        allowed: true,
        threatScore: threatScore.score,
        dailyRemaining: opts.dailyBudget - currentCount,
      };
    } catch (error) {
      // Allow on Redis error, but log
      console.error('[CostGuard] Redis error:', error);
    }
  }

  return {
    allowed: true,
    threatScore: threatScore.score,
  };
}

/**
 * Log suspicious request for analysis
 */
async function logSuspiciousRequest(
  ip: string,
  endpoint: string,
  reasons: string[]
): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return;

  try {
    const logKey = 'suspicious_requests';
    const entry = JSON.stringify({
      ip,
      endpoint,
      reasons,
      timestamp: new Date().toISOString(),
    });

    // Keep last 1000 entries
    await redis.lpush(logKey, entry);
    await redis.ltrim(logKey, 0, 999);
  } catch (error) {
    // Ignore logging errors
  }
}

/**
 * Wrapper for API route handlers
 */
export function withCostProtection(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  config?: Partial<CostGuardConfig>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const guard = await checkCostGuard(request, config);

    if (!guard.allowed && guard.response) {
      return guard.response;
    }

    // Add security headers to response
    const response = await handler(request, context);

    if (guard.threatScore !== undefined) {
      response.headers.set('X-Threat-Score', guard.threatScore.toString());
    }
    if (guard.dailyRemaining !== undefined) {
      response.headers.set('X-Daily-Remaining', guard.dailyRemaining.toString());
    }

    return response;
  };
}

/**
 * Quick protection for read-heavy endpoints
 */
export async function quickCostCheck(request: NextRequest): Promise<boolean> {
  // Fast path: only check bot and basic rate limit
  if (isLikelyBot(request)) {
    return false;
  }

  const rateResult = await checkRateLimit(request, RATE_LIMITS.READ);
  return rateResult.success;
}

// ==========================================
// Pre-configured Guards for Common Endpoints
// ==========================================

export const COST_GUARDS = {
  FLIGHT_SEARCH: {
    dailyBudget: 500,  // Production: allow 500 searches/IP/day
    threatThreshold: 50,
    endpoint: 'flight_search',
  },
  HOTEL_SEARCH: {
    dailyBudget: 300,  // Production: allow 300 hotel searches/IP/day
    threatThreshold: 50,
    endpoint: 'hotel_search',
  },
  BOOKING: {
    dailyBudget: 50,   // Production: allow 50 bookings/IP/day
    threatThreshold: 40,
    endpoint: 'booking',
  },
  PAYMENT: {
    dailyBudget: 30,   // Production: allow 30 payments/IP/day
    threatThreshold: 30,
    endpoint: 'payment',
  },
  PREBOOK: {
    dailyBudget: 100,  // Production: allow 100 prebook/IP/day
    threatThreshold: 50,
    endpoint: 'prebook',
  },
} as const;

/**
 * Decrement daily budget counter (call on cache hit to refund the cost)
 * Since cache hits don't incur API costs, we should refund the counter
 */
export async function refundCostBudget(
  request: NextRequest,
  config: Partial<CostGuardConfig> = {}
): Promise<void> {
  const opts = { ...DEFAULT_CONFIG, ...config };
  const ip = getClientIP(request);

  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return;

  const today = new Date().toISOString().split('T')[0];
  const budgetKey = `cost_budget:${ip}:${opts.endpoint}:${today}`;

  try {
    await redis.decr(budgetKey);
    console.log(`💰 Cost budget refunded (cache hit): ${opts.endpoint}`);
  } catch (error) {
    // Ignore errors - this is just an optimization
  }
}

export default {
  checkCostGuard,
  withCostProtection,
  quickCostCheck,
  refundCostBudget,
  COST_GUARDS,
};
