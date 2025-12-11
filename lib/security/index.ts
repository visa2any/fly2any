/**
 * Security Module Index
 *
 * Unified exports for all security services.
 * Import from '@/lib/security' for clean access.
 */

// Core rate limiting (Redis-backed)
export {
  checkRateLimit,
  createRateLimitResponse,
  addRateLimitHeaders,
  getClientIP,
  RATE_LIMITS,
  type RateLimitConfig,
  type RateLimitResult,
} from './redis-rate-limiter';

// Bot detection & threat scoring
export {
  calculateThreatScore,
  isLikelyBot,
  shouldBlockRequest,
  type ThreatScore,
} from './bot-detection';

// Cost protection guard
export {
  checkCostGuard,
  withCostProtection,
  quickCostCheck,
  COST_GUARDS,
  type CostGuardConfig,
  type CostGuardResult,
} from './cost-protection';

// Security monitoring
export {
  getSecurityMetrics,
  cleanupSecurityData,
  blockIP,
  unblockIP,
  isIPBlocked,
  type SecurityMetrics,
} from './security-monitor';

// Legacy exports (backwards compatibility)
export { rateLimit, RateLimitPresets } from './rate-limiter';
export { validateCSRFToken, generateCSRFToken } from './csrf';
export { encrypt, decrypt, hashData } from './encryption';
export { sanitizeHTML, sanitizeInput, escapeHTML } from './sanitize';
export { validateEmail, validateFlightSearch } from './input-validator';
