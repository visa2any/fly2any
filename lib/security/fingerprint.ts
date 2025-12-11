/**
 * Request Fingerprinting
 *
 * Creates unique fingerprints for requests to detect:
 * - Session hijacking
 * - Cookie replay attacks
 * - Distributed bot attacks using same automation
 */

import { NextRequest } from 'next/server';
import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';
import { getClientIP } from './redis-rate-limiter';

export interface RequestFingerprint {
  hash: string;
  components: {
    userAgent: string;
    acceptLanguage: string;
    acceptEncoding: string;
    connection: string;
    cacheControl: string;
    screenHint: string;
  };
  confidence: number; // 0-100, how confident we are this is a real browser
}

/**
 * Generate fingerprint from request headers
 */
export function generateFingerprint(request: NextRequest): RequestFingerprint {
  const headers = request.headers;

  const components = {
    userAgent: headers.get('user-agent') || '',
    acceptLanguage: headers.get('accept-language') || '',
    acceptEncoding: headers.get('accept-encoding') || '',
    connection: headers.get('connection') || '',
    cacheControl: headers.get('cache-control') || '',
    screenHint: headers.get('sec-ch-ua-platform') || headers.get('sec-ch-ua') || '',
  };

  // Create hash from components
  const hashInput = Object.values(components).join('|');
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hashStr = Math.abs(hash).toString(36);

  // Calculate confidence score
  let confidence = 0;

  // Real browsers have specific header patterns
  if (components.userAgent.length > 50) confidence += 15;
  if (components.acceptLanguage.length > 0) confidence += 15;
  if (components.acceptEncoding.includes('gzip')) confidence += 10;
  if (components.acceptEncoding.includes('br')) confidence += 10; // Brotli = modern browser
  if (components.screenHint.length > 0) confidence += 20; // Client hints = real browser
  if (components.userAgent.includes('Mozilla/5.0')) confidence += 10;
  if (components.acceptLanguage.includes(',')) confidence += 10; // Multiple languages
  if (headers.get('sec-fetch-mode')) confidence += 10; // Fetch metadata = real browser

  return {
    hash: hashStr,
    components,
    confidence: Math.min(100, confidence),
  };
}

/**
 * Track fingerprint for anomaly detection
 */
export async function trackFingerprint(
  ip: string,
  fingerprint: RequestFingerprint
): Promise<{ isAnomaly: boolean; reason?: string }> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) {
    return { isAnomaly: false };
  }

  try {
    const key = `fp:${ip}`;
    const existing = await redis.get(key);

    if (!existing) {
      // First request, store fingerprint
      await redis.set(key, fingerprint.hash, { ex: 86400 }); // 24 hour
      return { isAnomaly: false };
    }

    // Check if fingerprint changed (suspicious)
    if (existing !== fingerprint.hash) {
      // Count fingerprint changes
      const changeKey = `fp_changes:${ip}`;
      const changes = await redis.incr(changeKey);
      await redis.expire(changeKey, 3600); // 1 hour window

      if (changes > 5) {
        // Too many fingerprint changes = likely automation
        return {
          isAnomaly: true,
          reason: 'fingerprint_instability',
        };
      }
    }

    return { isAnomaly: false };
  } catch {
    return { isAnomaly: false };
  }
}

/**
 * Detect if fingerprint matches known automation tools
 */
export function detectAutomation(fingerprint: RequestFingerprint): {
  isAutomation: boolean;
  tool?: string;
} {
  const ua = fingerprint.components.userAgent.toLowerCase();

  // Known automation patterns
  const automationPatterns: [RegExp, string][] = [
    [/headlesschrome/i, 'Headless Chrome'],
    [/phantomjs/i, 'PhantomJS'],
    [/selenium/i, 'Selenium'],
    [/webdriver/i, 'WebDriver'],
    [/puppeteer/i, 'Puppeteer'],
    [/playwright/i, 'Playwright'],
    [/cypress/i, 'Cypress'],
    [/electron/i, 'Electron (potential)'],
  ];

  for (const [pattern, tool] of automationPatterns) {
    if (pattern.test(ua)) {
      return { isAutomation: true, tool };
    }
  }

  // Check for missing typical browser headers
  if (fingerprint.confidence < 30) {
    return { isAutomation: true, tool: 'Unknown (low confidence)' };
  }

  return { isAutomation: false };
}

/**
 * Get fingerprint stats for IP
 */
export async function getFingerprintStats(ip: string): Promise<{
  totalRequests: number;
  uniqueFingerprints: number;
  lastFingerprint: string | null;
}> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) {
    return { totalRequests: 0, uniqueFingerprints: 0, lastFingerprint: null };
  }

  try {
    const [fingerprint, changes] = await Promise.all([
      redis.get(`fp:${ip}`),
      redis.get(`fp_changes:${ip}`),
    ]);

    return {
      totalRequests: 0, // Would need separate counter
      uniqueFingerprints: (Number(changes) || 0) + 1,
      lastFingerprint: fingerprint as string | null,
    };
  } catch {
    return { totalRequests: 0, uniqueFingerprints: 0, lastFingerprint: null };
  }
}

export default {
  generateFingerprint,
  trackFingerprint,
  detectAutomation,
  getFingerprintStats,
};
