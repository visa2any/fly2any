/**
 * Session Revocation System
 * 
 * Allows immediate invalidation of sessions via Redis blacklist
 * Critical for security - compromised accounts must be locked out immediately
 */

import { getRedisClient } from '@/lib/cache/redis';

const SESSION_BLACKLIST_PREFIX = 'session:blacklist:';
const USER_BLOCK_PREFIX = 'user:blocked:';
const SESSION_TTL = 3600;      // 1 hour blacklist
const USER_BLOCK_TTL = 86400;  // 24 hours user block

/** Returns null if Redis is unavailable — all ops are no-ops in that case */
function r() { return getRedisClient(); }

export async function revokeSession(token: string): Promise<void> {
  const client = r();
  if (!client) return;
  await client.setex(SESSION_BLACKLIST_PREFIX + token, SESSION_TTL, '1');
}

export async function isSessionRevoked(token: string): Promise<boolean> {
  const client = r();
  if (!client) return false; // Redis down → allow session
  const result = await client.get(SESSION_BLACKLIST_PREFIX + token);
  return result !== null;
}

export async function revokeAllUserSessions(userId: string, reason?: string): Promise<void> {
  const client = r();
  if (!client) return;
  await client.setex(USER_BLOCK_PREFIX + userId, USER_BLOCK_TTL, '1');
  if (reason) console.log(`🔒 All sessions revoked for user ${userId}: ${reason}`);
}

export async function areUserSessionsRevoked(userId: string): Promise<boolean> {
  const client = r();
  if (!client) return false;
  const result = await client.get(USER_BLOCK_PREFIX + userId);
  return result !== null;
}

export async function handleLogout(
  sessionToken: string,
  userId: string,
  revokeAll = false
): Promise<void> {
  if (revokeAll) await revokeAllUserSessions(userId, 'Logout - revoke all');
  await revokeSession(sessionToken);
}

export async function clearUserBlock(userId: string): Promise<void> {
  const client = r();
  if (!client) return;
  await client.del(USER_BLOCK_PREFIX + userId);
}

export async function getBlacklistedSessionCount(): Promise<number> {
  return 0; // Monitoring only — tracked externally
}

export async function extendSessionRevocation(
  token: string,
  additionalSeconds = 3600
): Promise<void> {
  const client = r();
  if (!client) return;
  const key = SESSION_BLACKLIST_PREFIX + token;
  const ttl = await client.ttl(key);
  if (ttl > 0) await client.expire(key, ttl + additionalSeconds);
}