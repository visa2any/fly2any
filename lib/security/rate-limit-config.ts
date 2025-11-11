/**
 * Rate Limiting Configuration
 *
 * Endpoint-specific rate limiting configurations for different API routes.
 * Provides granular control over request limits based on endpoint sensitivity.
 *
 * @module security/rate-limit-config
 */

import { RateLimitConfig } from './rate-limiter';

// ==========================================
// ENDPOINT-SPECIFIC RATE LIMITS
// ==========================================

/**
 * Rate limit configurations for different endpoint types
 *
 * Format:
 * - maxRequests: Maximum number of requests allowed
 * - windowSeconds: Time window in seconds
 *
 * Guidelines:
 * - Strict: Sensitive operations (auth, payments, bookings)
 * - Standard: Normal API operations (search, listings)
 * - Relaxed: Read-only operations (public data, static content)
 */

// ==========================================
// AUTHENTICATION & AUTHORIZATION
// ==========================================

export const AUTH_RATE_LIMITS = {
  // Login attempts (prevent brute force)
  login: {
    maxRequests: 5,
    windowSeconds: 60 * 15, // 15 minutes
  } as RateLimitConfig,

  // Registration
  register: {
    maxRequests: 3,
    windowSeconds: 60 * 60, // 1 hour
  } as RateLimitConfig,

  // Password reset requests
  passwordReset: {
    maxRequests: 3,
    windowSeconds: 60 * 60, // 1 hour
  } as RateLimitConfig,

  // Email verification requests
  emailVerification: {
    maxRequests: 5,
    windowSeconds: 60 * 60, // 1 hour
  } as RateLimitConfig,

  // OAuth callbacks
  oauth: {
    maxRequests: 10,
    windowSeconds: 60 * 5, // 5 minutes
  } as RateLimitConfig,
};

// ==========================================
// FLIGHT OPERATIONS
// ==========================================

export const FLIGHT_RATE_LIMITS = {
  // Flight search (expensive operation)
  search: {
    maxRequests: 30,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Flight details lookup
  details: {
    maxRequests: 60,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Price calendar (cached, less expensive)
  priceCalendar: {
    maxRequests: 20,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Seat map requests
  seatMap: {
    maxRequests: 20,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,
};

// ==========================================
// BOOKING OPERATIONS
// ==========================================

export const BOOKING_RATE_LIMITS = {
  // Create booking (strict limit)
  create: {
    maxRequests: 10,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Update booking
  update: {
    maxRequests: 15,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Cancel booking
  cancel: {
    maxRequests: 10,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Get booking details
  get: {
    maxRequests: 60,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // List user bookings
  list: {
    maxRequests: 30,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,
};

// ==========================================
// PAYMENT OPERATIONS
// ==========================================

export const PAYMENT_RATE_LIMITS = {
  // Payment intent creation
  createIntent: {
    maxRequests: 5,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Payment confirmation
  confirm: {
    maxRequests: 5,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Refund request
  refund: {
    maxRequests: 5,
    windowSeconds: 60 * 5, // 5 minutes
  } as RateLimitConfig,

  // Payment status check
  status: {
    maxRequests: 30,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,
};

// ==========================================
// HOTEL OPERATIONS
// ==========================================

export const HOTEL_RATE_LIMITS = {
  // Hotel search
  search: {
    maxRequests: 30,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Hotel details
  details: {
    maxRequests: 60,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Availability check
  availability: {
    maxRequests: 40,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Hotel booking
  book: {
    maxRequests: 10,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,
};

// ==========================================
// AI ASSISTANT OPERATIONS
// ==========================================

export const AI_RATE_LIMITS = {
  // Chat message (OpenAI API is expensive)
  chat: {
    maxRequests: 20,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Voice input
  voice: {
    maxRequests: 15,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Image analysis
  imageAnalysis: {
    maxRequests: 10,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Knowledge base query
  knowledge: {
    maxRequests: 40,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,
};

// ==========================================
// USER OPERATIONS
// ==========================================

export const USER_RATE_LIMITS = {
  // Profile update
  updateProfile: {
    maxRequests: 10,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Preferences update
  updatePreferences: {
    maxRequests: 20,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Avatar upload
  uploadAvatar: {
    maxRequests: 5,
    windowSeconds: 60 * 5, // 5 minutes
  } as RateLimitConfig,

  // Password change
  changePassword: {
    maxRequests: 3,
    windowSeconds: 60 * 60, // 1 hour
  } as RateLimitConfig,

  // Email change
  changeEmail: {
    maxRequests: 3,
    windowSeconds: 60 * 60, // 1 hour
  } as RateLimitConfig,
};

// ==========================================
// NOTIFICATION OPERATIONS
// ==========================================

export const NOTIFICATION_RATE_LIMITS = {
  // Send email notification
  email: {
    maxRequests: 10,
    windowSeconds: 60 * 5, // 5 minutes
  } as RateLimitConfig,

  // Send SMS notification
  sms: {
    maxRequests: 5,
    windowSeconds: 60 * 5, // 5 minutes
  } as RateLimitConfig,

  // Push notification
  push: {
    maxRequests: 20,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,
};

// ==========================================
// ANALYTICS & TRACKING
// ==========================================

export const ANALYTICS_RATE_LIMITS = {
  // Track event
  track: {
    maxRequests: 100,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Page view
  pageview: {
    maxRequests: 200,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Error reporting
  error: {
    maxRequests: 50,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,
};

// ==========================================
// PUBLIC API (External Integrations)
// ==========================================

export const PUBLIC_API_RATE_LIMITS = {
  // Webhook endpoints
  webhook: {
    maxRequests: 100,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,

  // Public flight data
  publicFlights: {
    maxRequests: 1000,
    windowSeconds: 60, // 1 minute (for partners)
  } as RateLimitConfig,

  // Health check
  health: {
    maxRequests: 300,
    windowSeconds: 60, // 1 minute
  } as RateLimitConfig,
};

// ==========================================
// MASTER RATE LIMIT MAPPING
// ==========================================

/**
 * Map of endpoint patterns to rate limit configurations
 *
 * Usage:
 * const config = RATE_LIMIT_MAP['/api/flights/search'];
 */
export const RATE_LIMIT_MAP: Record<string, RateLimitConfig> = {
  // Authentication
  '/api/auth/login': AUTH_RATE_LIMITS.login,
  '/api/auth/register': AUTH_RATE_LIMITS.register,
  '/api/auth/password-reset': AUTH_RATE_LIMITS.passwordReset,
  '/api/auth/verify-email': AUTH_RATE_LIMITS.emailVerification,
  '/api/auth/callback': AUTH_RATE_LIMITS.oauth,

  // Flights
  '/api/flights/search': FLIGHT_RATE_LIMITS.search,
  '/api/flights/details': FLIGHT_RATE_LIMITS.details,
  '/api/flights/price-calendar': FLIGHT_RATE_LIMITS.priceCalendar,
  '/api/flights/seat-map': FLIGHT_RATE_LIMITS.seatMap,

  // Bookings
  '/api/bookings/create': BOOKING_RATE_LIMITS.create,
  '/api/bookings/update': BOOKING_RATE_LIMITS.update,
  '/api/bookings/cancel': BOOKING_RATE_LIMITS.cancel,
  '/api/bookings/get': BOOKING_RATE_LIMITS.get,
  '/api/bookings/list': BOOKING_RATE_LIMITS.list,

  // Payments
  '/api/payments/create-intent': PAYMENT_RATE_LIMITS.createIntent,
  '/api/payments/confirm': PAYMENT_RATE_LIMITS.confirm,
  '/api/payments/refund': PAYMENT_RATE_LIMITS.refund,
  '/api/payments/status': PAYMENT_RATE_LIMITS.status,

  // Hotels
  '/api/hotels/search': HOTEL_RATE_LIMITS.search,
  '/api/hotels/details': HOTEL_RATE_LIMITS.details,
  '/api/hotels/availability': HOTEL_RATE_LIMITS.availability,
  '/api/hotels/book': HOTEL_RATE_LIMITS.book,

  // AI Assistant
  '/api/ai/chat': AI_RATE_LIMITS.chat,
  '/api/ai/voice': AI_RATE_LIMITS.voice,
  '/api/ai/image': AI_RATE_LIMITS.imageAnalysis,
  '/api/ai/knowledge': AI_RATE_LIMITS.knowledge,

  // User
  '/api/user/profile': USER_RATE_LIMITS.updateProfile,
  '/api/user/preferences': USER_RATE_LIMITS.updatePreferences,
  '/api/user/avatar': USER_RATE_LIMITS.uploadAvatar,
  '/api/user/password': USER_RATE_LIMITS.changePassword,
  '/api/user/email': USER_RATE_LIMITS.changeEmail,

  // Notifications
  '/api/notifications/email': NOTIFICATION_RATE_LIMITS.email,
  '/api/notifications/sms': NOTIFICATION_RATE_LIMITS.sms,
  '/api/notifications/push': NOTIFICATION_RATE_LIMITS.push,

  // Analytics
  '/api/analytics/track': ANALYTICS_RATE_LIMITS.track,
  '/api/analytics/pageview': ANALYTICS_RATE_LIMITS.pageview,
  '/api/analytics/error': ANALYTICS_RATE_LIMITS.error,

  // Public API
  '/api/webhooks': PUBLIC_API_RATE_LIMITS.webhook,
  '/api/public/flights': PUBLIC_API_RATE_LIMITS.publicFlights,
  '/api/health': PUBLIC_API_RATE_LIMITS.health,
};

/**
 * Get rate limit configuration for a given path
 *
 * @param path - API endpoint path
 * @returns Rate limit configuration or default
 *
 * @example
 * const config = getRateLimitConfig('/api/flights/search');
 * // Returns: { maxRequests: 30, windowSeconds: 60 }
 */
export function getRateLimitConfig(path: string): RateLimitConfig {
  // Try exact match
  if (RATE_LIMIT_MAP[path]) {
    return RATE_LIMIT_MAP[path];
  }

  // Try pattern matching
  for (const [pattern, config] of Object.entries(RATE_LIMIT_MAP)) {
    if (path.startsWith(pattern)) {
      return config;
    }
  }

  // Default rate limit (standard)
  return {
    maxRequests: 100,
    windowSeconds: 60,
  };
}

// ==========================================
// RATE LIMIT TIERS (For Different User Types)
// ==========================================

/**
 * Rate limit multipliers for different user tiers
 */
export const RATE_LIMIT_TIERS = {
  anonymous: 1.0, // Base rate
  authenticated: 2.0, // 2x for logged-in users
  premium: 5.0, // 5x for premium subscribers
  partner: 10.0, // 10x for API partners
};

/**
 * Get adjusted rate limit for user tier
 *
 * @param baseConfig - Base rate limit configuration
 * @param tier - User tier
 * @returns Adjusted rate limit configuration
 */
export function getAdjustedRateLimit(
  baseConfig: RateLimitConfig,
  tier: keyof typeof RATE_LIMIT_TIERS = 'anonymous'
): RateLimitConfig {
  const multiplier = RATE_LIMIT_TIERS[tier];

  return {
    ...baseConfig,
    maxRequests: Math.floor(baseConfig.maxRequests * multiplier),
  };
}

// ==========================================
// IP ALLOWLIST/BLOCKLIST
// ==========================================

/**
 * IPs that bypass rate limiting (internal services, monitoring)
 */
export const IP_ALLOWLIST: string[] = [
  // Add your internal IPs here
  // '10.0.0.0/8',
  // '172.16.0.0/12',
  // '192.168.0.0/16',
];

/**
 * IPs that are blocked (known bad actors)
 */
export const IP_BLOCKLIST: string[] = [
  // Add blocked IPs here
];

/**
 * Check if IP is in allowlist
 */
export function isIPAllowed(ip: string): boolean {
  return IP_ALLOWLIST.includes(ip);
}

/**
 * Check if IP is in blocklist
 */
export function isIPBlocked(ip: string): boolean {
  return IP_BLOCKLIST.includes(ip);
}

// ==========================================
// EXPORTS
// ==========================================

export const rateLimitConfig = {
  AUTH_RATE_LIMITS,
  FLIGHT_RATE_LIMITS,
  BOOKING_RATE_LIMITS,
  PAYMENT_RATE_LIMITS,
  HOTEL_RATE_LIMITS,
  AI_RATE_LIMITS,
  USER_RATE_LIMITS,
  NOTIFICATION_RATE_LIMITS,
  ANALYTICS_RATE_LIMITS,
  PUBLIC_API_RATE_LIMITS,

  RATE_LIMIT_MAP,
  getRateLimitConfig,

  RATE_LIMIT_TIERS,
  getAdjustedRateLimit,

  IP_ALLOWLIST,
  IP_BLOCKLIST,
  isIPAllowed,
  isIPBlocked,
};

export default rateLimitConfig;
