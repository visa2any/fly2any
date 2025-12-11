/**
 * Challenge System - Multi-Provider Support
 *
 * Three challenge providers (in priority order):
 * 1. Built-in math challenge (FREE, no signup, always works)
 * 2. Cloudflare Turnstile (FREE, easy signup via Cloudflare dashboard)
 * 3. hCaptcha (FREE, alternative)
 *
 * The system automatically falls back if no external provider is configured.
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

// Provider verification URLs
const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface CaptchaResult {
  success: boolean;
  challengeRequired: boolean;
  challengeType?: 'math' | 'turnstile' | 'hcaptcha';
  challenge?: MathChallenge;
  error?: string;
}

export interface MathChallenge {
  id: string;
  question: string;
  expiresAt: number;
}

// ==========================================
// BUILT-IN MATH CHALLENGE (No signup needed!)
// ==========================================

/**
 * Generate a simple math challenge
 */
export async function generateMathChallenge(ip: string): Promise<MathChallenge> {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const operators = ['+', '-', '*'];
  const op = operators[Math.floor(Math.random() * operators.length)];

  let answer: number;
  switch (op) {
    case '+': answer = a + b; break;
    case '-': answer = a - b; break;
    case '*': answer = a * b; break;
    default: answer = a + b;
  }

  const id = `mc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const expiresAt = Date.now() + 300000; // 5 minutes

  // Store answer in Redis
  const redis = getRedisClient();
  if (redis && isRedisEnabled()) {
    await redis.set(`math_challenge:${id}`, answer.toString(), { ex: 300 });
  }

  return {
    id,
    question: `What is ${a} ${op} ${b}?`,
    expiresAt,
  };
}

/**
 * Verify math challenge answer
 */
export async function verifyMathChallenge(challengeId: string, answer: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return true; // Allow if no Redis

  try {
    const correctAnswer = await redis.get(`math_challenge:${challengeId}`);
    if (!correctAnswer) return false; // Expired or invalid

    const isCorrect = correctAnswer === answer.trim();
    if (isCorrect) {
      await redis.del(`math_challenge:${challengeId}`);
    }
    return isCorrect;
  } catch {
    return true; // Allow on error
  }
}

// ==========================================
// CLOUDFLARE TURNSTILE (Free, easy Cloudflare dashboard setup)
// ==========================================

/**
 * Verify Cloudflare Turnstile token
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Skip if not configured

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        ...(ip && { remoteip: ip }),
      }),
    });
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}

// ==========================================
// HCAPTCHA (Alternative)
// ==========================================

/**
 * Verify hCaptcha token
 */
export async function verifyCaptcha(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) return true; // Skip if not configured

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
      ...(ip && { remoteip: ip }),
    });
    const response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}

// ==========================================
// UNIFIED CHALLENGE CHECK
// ==========================================

/**
 * Check if IP needs challenge
 */
export async function needsCaptchaChallenge(ip: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return false;

  try {
    const [needsChallenge, failedAttempts, blockedCount] = await Promise.all([
      redis.get(`captcha_required:${ip}`),
      redis.get(`failed_attempts:${ip}`),
      redis.hget('blocked_ips', ip),
    ]);

    return !!(
      needsChallenge ||
      (failedAttempts && Number(failedAttempts) >= 3) ||
      (blockedCount && Number(blockedCount) >= 2)
    );
  } catch {
    return false;
  }
}

/**
 * Mark IP as requiring challenge
 */
export async function requireCaptcha(ip: string, duration: number = 3600): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return;
  await redis.set(`captcha_required:${ip}`, '1', { ex: duration }).catch(() => {});
}

/**
 * Clear challenge requirement
 */
export async function clearCaptchaRequirement(ip: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return;
  await Promise.all([
    redis.del(`captcha_required:${ip}`),
    redis.del(`failed_attempts:${ip}`),
  ]).catch(() => {});
}

/**
 * Increment failed attempts
 */
export async function incrementFailedAttempts(ip: string): Promise<number> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return 0;

  try {
    const key = `failed_attempts:${ip}`;
    const count = await redis.incr(key);
    await redis.expire(key, 3600);
    return count;
  } catch {
    return 0;
  }
}

/**
 * Main challenge verification - tries all configured providers
 */
export async function checkCaptchaInRequest(
  body: Record<string, any>,
  ip: string
): Promise<CaptchaResult> {
  const required = await needsCaptchaChallenge(ip);
  if (!required) return { success: true, challengeRequired: false };

  // Try math challenge first (always available)
  if (body.mathChallengeId && body.mathAnswer) {
    const valid = await verifyMathChallenge(body.mathChallengeId, body.mathAnswer);
    if (valid) {
      await clearCaptchaRequirement(ip);
      return { success: true, challengeRequired: false };
    }
    return { success: false, challengeRequired: true, challengeType: 'math', error: 'Incorrect answer' };
  }

  // Try Turnstile
  const turnstileToken = body.turnstileToken || body['cf-turnstile-response'];
  if (turnstileToken && process.env.TURNSTILE_SECRET_KEY) {
    const valid = await verifyTurnstile(turnstileToken, ip);
    if (valid) {
      await clearCaptchaRequirement(ip);
      return { success: true, challengeRequired: false };
    }
  }

  // Try hCaptcha
  const hcaptchaToken = body.captchaToken || body.hcaptchaToken || body['h-captcha-response'];
  if (hcaptchaToken && process.env.HCAPTCHA_SECRET) {
    const valid = await verifyCaptcha(hcaptchaToken, ip);
    if (valid) {
      await clearCaptchaRequirement(ip);
      return { success: true, challengeRequired: false };
    }
  }

  // No valid challenge provided - generate math challenge as fallback
  const challenge = await generateMathChallenge(ip);
  return {
    success: false,
    challengeRequired: true,
    challengeType: 'math',
    challenge,
    error: 'Please complete the security challenge',
  };
}

/**
 * Get challenge config for frontend
 */
export function getCaptchaConfig() {
  const hasTurnstile = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const hasHcaptcha = !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  return {
    provider: hasTurnstile ? 'turnstile' : hasHcaptcha ? 'hcaptcha' : 'math',
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    hcaptchaSiteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '',
    theme: 'light' as const,
  };
}

export default {
  // Math challenge (always works)
  generateMathChallenge,
  verifyMathChallenge,
  // Turnstile
  verifyTurnstile,
  // hCaptcha
  verifyCaptcha,
  // Unified
  needsCaptchaChallenge,
  requireCaptcha,
  clearCaptchaRequirement,
  incrementFailedAttempts,
  checkCaptchaInRequest,
  getCaptchaConfig,
};
