/**
 * Security Monitor & Analytics
 *
 * Tracks suspicious patterns and provides real-time security metrics.
 * Uses Redis for distributed storage, minimal performance overhead.
 */

import { getRedisClient, isRedisEnabled } from '@/lib/cache/redis';

export interface SecurityMetrics {
  totalBlocked24h: number;
  blockedByReason: Record<string, number>;
  topBlockedIPs: Array<{ ip: string; count: number }>;
  suspiciousRequests: Array<{
    ip: string;
    endpoint: string;
    reasons: string[];
    timestamp: string;
  }>;
  threatScoreDistribution: Record<string, number>;
}

/**
 * Get security metrics for dashboard
 */
export async function getSecurityMetrics(): Promise<SecurityMetrics | null> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return null;

  try {
    const [blockedIPs, suspiciousLogs] = await Promise.all([
      redis.hgetall('blocked_ips'),
      redis.lrange('suspicious_requests', 0, 99),
    ]);

    // Process blocked IPs
    const blockedEntries = Object.entries(blockedIPs || {})
      .map(([ip, count]) => ({ ip, count: Number(count) }))
      .sort((a, b) => b.count - a.count);

    // Parse suspicious logs
    const suspiciousRequests = (suspiciousLogs || [])
      .map(log => {
        try {
          return JSON.parse(log as string);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .slice(0, 50);

    // Calculate totals
    const totalBlocked24h = blockedEntries.reduce((sum, e) => sum + e.count, 0);

    // Count by reason
    const blockedByReason: Record<string, number> = {};
    for (const req of suspiciousRequests) {
      for (const reason of req.reasons || []) {
        blockedByReason[reason] = (blockedByReason[reason] || 0) + 1;
      }
    }

    return {
      totalBlocked24h,
      blockedByReason,
      topBlockedIPs: blockedEntries.slice(0, 10),
      suspiciousRequests,
      threatScoreDistribution: {
        'low_0_20': 0,
        'medium_20_40': 0,
        'high_40_60': 0,
        'critical_60_100': 0,
      },
    };
  } catch (error) {
    console.error('[SecurityMonitor] Error fetching metrics:', error);
    return null;
  }
}

/**
 * Clear old security data (run daily via cron)
 */
export async function cleanupSecurityData(): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return;

  try {
    // Keep only recent blocked IPs (decay counts)
    const blockedIPs = await redis.hgetall('blocked_ips');
    if (blockedIPs) {
      for (const [ip, count] of Object.entries(blockedIPs)) {
        const newCount = Math.floor(Number(count) * 0.5); // 50% decay
        if (newCount <= 0) {
          await redis.hdel('blocked_ips', ip);
        } else {
          await redis.hset('blocked_ips', { [ip]: newCount.toString() });
        }
      }
    }

    // Trim suspicious logs to last 500
    await redis.ltrim('suspicious_requests', 0, 499);

    console.log('[SecurityMonitor] Cleanup completed');
  } catch (error) {
    console.error('[SecurityMonitor] Cleanup error:', error);
  }
}

/**
 * Block an IP manually
 */
export async function blockIP(ip: string, reason: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return;

  try {
    await redis.hset('manual_blocked_ips', { [ip]: reason });
    console.log(`[SecurityMonitor] Manually blocked IP: ${ip}`);
  } catch (error) {
    console.error('[SecurityMonitor] Error blocking IP:', error);
  }
}

/**
 * Check if IP is manually blocked
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return false;

  try {
    const blocked = await redis.hget('manual_blocked_ips', ip);
    return !!blocked;
  } catch {
    return false;
  }
}

/**
 * Unblock an IP
 */
export async function unblockIP(ip: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis || !isRedisEnabled()) return;

  try {
    await redis.hdel('manual_blocked_ips', ip);
    await redis.hdel('blocked_ips', ip);
    console.log(`[SecurityMonitor] Unblocked IP: ${ip}`);
  } catch (error) {
    console.error('[SecurityMonitor] Error unblocking IP:', error);
  }
}

export default {
  getSecurityMetrics,
  cleanupSecurityData,
  blockIP,
  unblockIP,
  isIPBlocked,
};
