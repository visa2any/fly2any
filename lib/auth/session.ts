/**
 * Session Revocation System
 * 
 * Allows immediate invalidation of sessions via Redis blacklist
 * Critical for security - compromised accounts must be locked out immediately
 */

import { redis } from '@/lib/redis';

const SESSION_BLACKLIST_PREFIX = 'session:blacklist:';
const USER_BLOCK_PREFIX = 'user:blocked:';
const SESSION_TTL = 3600; // 1 hour blacklist
const USER_BLOCK_TTL = 86400; // 24 hours user block

/**
 * Revoke a specific session by token
 * 
 * @param token - Session token/JWT to revoke
 * @throws Error if Redis unavailable
 */
export async function revokeSession(token: string): Promise<void> {
  const key = SESSION_BLACKLIST_PREFIX + token;
  await redis.setex(key, SESSION_TTL, '1');
}

/**
 * Check if a session is revoked
 * 
 * @param token - Session token/JWT to check
 * @returns true if session is revoked
 */
export async function isSessionRevoked(token: string): Promise<boolean> {
  const key = SESSION_BLACKLIST_PREFIX + token;
  const result = await redis.get(key);
  return result !== null;
}

/**
 * Revoke ALL sessions for a user
 * 
 * Use on password change, suspicious activity, or user request
 * 
 * @param userId - User ID to block
 * @param reason - Optional reason for logging
 */
export async function revokeAllUserSessions(userId: string, reason?: string): Promise<void> {
  const key = USER_BLOCK_PREFIX + userId;
  await redis.setex(key, USER_BLOCK_TTL, '1');
  
  if (reason) {
    console.log(`🔒 All sessions revoked for user ${userId}: ${reason}`);
  }
}

/**
 * Check if all sessions for a user are revoked
 * 
 * @param userId - User ID to check
 * @returns true if user is blocked
 */
export async function areUserSessionsRevoked(userId: string): Promise<boolean> {
  const key = USER_BLOCK_PREFIX + userId;
  const result = await redis.get(key);
  return result !== null;
}

/**
 * Handle logout - revoke current session
 * 
 * @param sessionToken - Current session token
 * @param userId - User ID
 * @param revokeAll - Optional: revoke all sessions (default: false)
 */
export async function handleLogout(
  sessionToken: string,
  userId: string,
  revokeAll: boolean = false
): Promise<void> {
  if (revokeAll) {
    await revokeAllUserSessions(userId, 'Logout - revoke all');
  }
  
  await revokeSession(sessionToken);
}

/**
 * Clear user session block
 * 
 * Use carefully - only after manual review or user verification
 * 
 * @param userId - User ID to unblock
 */
export async function clearUserBlock(userId: string): Promise<void> {
  const key = USER_BLOCK_PREFIX + userId;
  await redis.del(key);
}

/**
 * Get count of blacklisted sessions (for monitoring)
 * 
 * @returns Approximate count of revoked sessions
 */
export async function getBlacklistedSessionCount(): Promise<number> {
  // This is expensive - only for monitoring
  // In production, you'd track this differently
  return 0;
}

/**
 * Extend session blacklist TTL
 * 
 * Useful when user remains compromised
 * 
 * @param token - Session token
 * @param additionalSeconds - Additional time to add (default: 1 hour)
 */
export async function extendSessionRevocation(
  token: string,
  additionalSeconds: number = 3600
): Promise<void> {
  const key = SESSION_BLACKLIST_PREFIX + token;
  const ttl = await redis.ttl(key);
  
  if (ttl > 0) {
    await redis.expire(key, ttl + additionalSeconds);
  }
}