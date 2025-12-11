/**
 * CAPTCHA Integration (hCaptcha - Free)
 *
 * Challenges suspicious users before allowing expensive operations.
 * Uses hCaptcha for privacy-focused, free CAPTCHA service.
 *
 * Setup:
 * 1. Sign up at https://www.hcaptcha.com/
 * 2. Add HCAPTCHA_SECRET to .env
 * 3. Add NEXT_PUBLIC_HCAPTCHA_SITE_KEY to .env
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';

export interface CaptchaResult {
  success: boolean;
  challengeRequired: boolean;
  error?: string;
}

/**
 * Verify hCaptcha token server-side
 */
export async function verifyCaptcha(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;

  if (!secret) {
    console.warn('[Captcha] HCAPTCHA_SECRET not configured, skipping verification');
    return true; // Skip if not configured
  }

  if (!token) {
    return false;
  }

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
  } catch (error) {
    console.error('[Captcha] Verification error:', error);
    return false;
  }
}

/**
 * Check if IP needs CAPTCHA challenge
 */
export async function needsCaptchaChallenge(ip: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return false;

  try {
    // Check if marked for CAPTCHA
    const needsChallenge = await redis.get(`captcha_required:${ip}`);
    if (needsChallenge) return true;

    // Check failed attempts
    const failedAttempts = await redis.get(`failed_attempts:${ip}`);
    if (failedAttempts && Number(failedAttempts) >= 3) {
      return true;
    }

    // Check if blocked too many times
    const blockedCount = await redis.hget('blocked_ips', ip);
    if (blockedCount && Number(blockedCount) >= 2) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Mark IP as requiring CAPTCHA
 */
export async function requireCaptcha(ip: string, duration: number = 3600): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return;

  try {
    await redis.set(`captcha_required:${ip}`, '1', { ex: duration });
  } catch (error) {
    console.error('[Captcha] Error requiring captcha:', error);
  }
}

/**
 * Clear CAPTCHA requirement after successful verification
 */
export async function clearCaptchaRequirement(ip: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return;

  try {
    await redis.del(`captcha_required:${ip}`);
    await redis.del(`failed_attempts:${ip}`);
  } catch (error) {
    console.error('[Captcha] Error clearing requirement:', error);
  }
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
    await redis.expire(key, 3600); // 1 hour expiry
    return count;
  } catch {
    return 0;
  }
}

/**
 * Check CAPTCHA in request body or headers
 */
export async function checkCaptchaInRequest(
  body: Record<string, any>,
  ip: string
): Promise<CaptchaResult> {
  // Check if CAPTCHA is required
  const required = await needsCaptchaChallenge(ip);

  if (!required) {
    return { success: true, challengeRequired: false };
  }

  // Look for CAPTCHA token in body
  const token = body.captchaToken || body.hcaptchaToken || body['h-captcha-response'];

  if (!token) {
    return {
      success: false,
      challengeRequired: true,
      error: 'CAPTCHA verification required',
    };
  }

  const verified = await verifyCaptcha(token, ip);

  if (verified) {
    await clearCaptchaRequirement(ip);
    return { success: true, challengeRequired: false };
  }

  return {
    success: false,
    challengeRequired: true,
    error: 'CAPTCHA verification failed',
  };
}

/**
 * React component props for hCaptcha
 */
export function getCaptchaConfig() {
  return {
    siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '',
    theme: 'light' as const,
    size: 'normal' as const,
  };
}

export default {
  verifyCaptcha,
  needsCaptchaChallenge,
  requireCaptcha,
  clearCaptchaRequirement,
  incrementFailedAttempts,
  checkCaptchaInRequest,
  getCaptchaConfig,
};
