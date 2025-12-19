/**
 * Bot Detection & Threat Scoring Service
 *
 * Lightweight heuristic-based bot detection without external API costs.
 * Scores requests 0-100 where higher = more suspicious.
 *
 * Uses pattern matching on:
 * - User agents (known bots, scrapers, headless browsers)
 * - Request patterns (speed, consistency, missing browser features)
 * - IP reputation (datacenter detection, known VPN ranges)
 */

import { NextRequest } from 'next/server';
import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

export interface ThreatScore {
  score: number;        // 0-100, higher = more suspicious
  isBot: boolean;       // Score > 70
  isSuspicious: boolean; // Score > 40
  reasons: string[];
  fingerprint: string;
}

// Known bot user agents (lowercase patterns)
const BOT_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java/',
  'httpunit', 'htmlunit', 'selenium', 'phantomjs', 'headless', 'puppeteer',
  'playwright', 'nightmare', 'casperjs', 'scrapy', 'mechanize', 'httpclient',
  'apache-http', 'okhttp', 'axios/', 'node-fetch', 'go-http', 'libwww',
  'feedfetcher', 'feedparser', 'facebookexternal', 'bytespider', 'semrush',
  'ahrefsbot', 'dotbot', 'baiduspider', 'yandexbot', 'slurp', 'googlebot',
  'bingbot', 'duckduckbot', 'rogerbot', 'exabot', 'archive.org', 'ia_archiver',
];

// Good bot patterns (allowed crawlers + test bots)
const GOOD_BOTS = ['googlebot', 'bingbot', 'duckduckbot', 'fly2any-farereconciliation-test', 'fly2any-faremonitor', 'headlesschrome', 'playwright'];

// Suspicious user agent patterns
const SUSPICIOUS_PATTERNS = [
  /^mozilla\/4\./i,              // Very old browser
  /^mozilla\/5\.0 \(compatible/i, // Missing OS info
  /android.*mobile.*safari.*chrome/i, // Impossible combo
  /^$/,                           // Empty UA
];

// Known datacenter ASN ranges (partial list - expand as needed)
const DATACENTER_IP_PREFIXES = [
  '13.', '18.', '34.', '35.', '52.', '54.', '99.', '100.',  // AWS
  '104.', '108.', '142.', '168.', '207.',                    // Azure
  '35.', '104.', '108.', '130.', '199.', '142.',             // GCP
  '45.', '66.', '69.', '72.', '198.', '204.',                // Various hosting
];

// Common VPN/Proxy indicators in headers
const PROXY_HEADERS = [
  'via', 'x-forwarded-host', 'forwarded', 'x-proxy-id',
  'proxy-connection', 'x-bluecoat-via',
];

/**
 * Generate simple device fingerprint from request
 */
function generateFingerprint(request: NextRequest): string {
  const ua = request.headers.get('user-agent') || '';
  const accept = request.headers.get('accept') || '';
  const acceptLang = request.headers.get('accept-language') || '';
  const acceptEnc = request.headers.get('accept-encoding') || '';

  const components = [
    ua.slice(0, 50),
    accept.slice(0, 30),
    acceptLang.slice(0, 10),
    acceptEnc.slice(0, 20),
  ].join('|');

  // Simple hash
  let hash = 0;
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}

/**
 * Check if IP looks like datacenter/hosting
 */
function isDatacenterIP(ip: string): boolean {
  return DATACENTER_IP_PREFIXES.some(prefix => ip.startsWith(prefix));
}

/**
 * Analyze user agent for bot patterns
 */
function analyzeUserAgent(ua: string): { score: number; reasons: string[] } {
  const uaLower = ua.toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  // Empty or missing UA
  if (!ua || ua.length < 10) {
    score += 50;
    reasons.push('missing_user_agent');
    return { score, reasons };
  }

  // Known bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (uaLower.includes(pattern)) {
      // Check if good bot
      if (GOOD_BOTS.some(good => uaLower.includes(good))) {
        score += 5; // Low penalty for search engines
        reasons.push('search_engine_bot');
      } else {
        score += 60;
        reasons.push(`bot_pattern:${pattern}`);
      }
      break;
    }
  }

  // Suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(ua)) {
      score += 20;
      reasons.push('suspicious_ua_format');
      break;
    }
  }

  // Very short UA (likely automated)
  if (ua.length < 50 && !uaLower.includes('mobile')) {
    score += 15;
    reasons.push('short_user_agent');
  }

  return { score, reasons };
}

/**
 * Analyze request headers for anomalies
 */
function analyzeHeaders(request: NextRequest): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Missing typical browser headers
  const accept = request.headers.get('accept');
  const acceptLang = request.headers.get('accept-language');
  const acceptEnc = request.headers.get('accept-encoding');

  if (!accept || !accept.includes('text/html')) {
    score += 10;
    reasons.push('missing_accept_header');
  }

  if (!acceptLang) {
    score += 10;
    reasons.push('missing_accept_language');
  }

  if (!acceptEnc || !acceptEnc.includes('gzip')) {
    score += 5;
    reasons.push('missing_accept_encoding');
  }

  // Proxy indicators
  for (const header of PROXY_HEADERS) {
    if (request.headers.get(header)) {
      score += 15;
      reasons.push(`proxy_header:${header}`);
      break;
    }
  }

  // Check for automation tools headers
  if (request.headers.get('x-automation') || request.headers.get('x-test')) {
    score += 30;
    reasons.push('automation_header');
  }

  return { score, reasons };
}

/**
 * Calculate threat score for a request
 */
export async function calculateThreatScore(request: NextRequest, ip: string): Promise<ThreatScore> {
  const reasons: string[] = [];
  let totalScore = 0;

  // 1. User Agent Analysis (0-60 points)
  const ua = request.headers.get('user-agent') || '';
  const uaAnalysis = analyzeUserAgent(ua);
  totalScore += uaAnalysis.score;
  reasons.push(...uaAnalysis.reasons);

  // 2. Header Analysis (0-40 points)
  const headerAnalysis = analyzeHeaders(request);
  totalScore += headerAnalysis.score;
  reasons.push(...headerAnalysis.reasons);

  // 3. IP Analysis (0-30 points)
  if (isDatacenterIP(ip)) {
    totalScore += 20;
    reasons.push('datacenter_ip');
  }

  // 4. Check Redis for repeated offender
  const redis = getRedisClient();
  if (redis && isRedisEnabled()) {
    try {
      const blockedCount = await redis.hget('blocked_ips', ip);
      if (blockedCount && Number(blockedCount) > 3) {
        totalScore += 30;
        reasons.push('repeated_offender');
      }

      // Check request velocity (too fast = bot)
      const velocityKey = `velocity:${ip}`;
      const lastRequest = await redis.get(velocityKey);
      const now = Date.now();

      if (lastRequest) {
        const timeDiff = now - Number(lastRequest);
        if (timeDiff < 100) { // Less than 100ms between requests
          totalScore += 25;
          reasons.push('high_velocity');
        } else if (timeDiff < 500) {
          totalScore += 10;
          reasons.push('fast_requests');
        }
      }

      await redis.set(velocityKey, now.toString(), { ex: 60 });
    } catch (error) {
      // Ignore Redis errors
    }
  }

  // Cap at 100
  totalScore = Math.min(100, totalScore);

  return {
    score: totalScore,
    isBot: totalScore >= 70,
    isSuspicious: totalScore >= 40,
    reasons,
    fingerprint: generateFingerprint(request),
  };
}

/**
 * Quick bot check (fast path for middleware)
 */
export function isLikelyBot(request: NextRequest): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();

  // Quick check for obvious bots
  for (const pattern of BOT_PATTERNS) {
    if (ua.includes(pattern) && !GOOD_BOTS.some(g => ua.includes(g))) {
      return true;
    }
  }

  // Empty or very short UA
  if (!ua || ua.length < 20) {
    return true;
  }

  return false;
}

/**
 * Block request if threat score too high
 */
export function shouldBlockRequest(score: ThreatScore, threshold: number = 70): boolean {
  return score.score >= threshold;
}

export default { calculateThreatScore, isLikelyBot, shouldBlockRequest };
