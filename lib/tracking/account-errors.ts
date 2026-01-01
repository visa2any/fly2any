/**
 * Account Journey Error Tracking System
 * Tracks and reports errors in: signup, signin, profile, bookings, etc.
 */

export type AccountErrorType =
  | 'AUTH_SIGNIN_FAILED'
  | 'AUTH_SIGNUP_FAILED'
  | 'AUTH_OAUTH_ERROR'
  | 'AUTH_OAUTH_NOT_LINKED'
  | 'AUTH_SESSION_ERROR'
  | 'PROFILE_LOAD_ERROR'
  | 'PROFILE_UPDATE_ERROR'
  | 'BOOKINGS_LOAD_ERROR'
  | 'TRAVELERS_ERROR'
  | 'PREFERENCES_ERROR'
  | 'API_ERROR'
  | 'NETWORK_ERROR';

export interface SecurityContext {
  ip?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  referrer?: string;
  language?: string;
  timezone?: string;
  screenSize?: string;
  attemptCount?: number;
  sessionId?: string;
  geo?: {
    country?: string;
    city?: string;
    region?: string;
  };
}

export interface AccountError {
  type: AccountErrorType;
  message: string;
  code?: string;
  userId?: string;
  email?: string;
  page: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  stack?: string;
  security?: SecurityContext;
}

// Collect browser/client security context
function collectSecurityContext(): SecurityContext {
  if (typeof window === 'undefined') return {};

  const ua = navigator.userAgent;
  const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[\/\s](\d+)/i);
  const osMatch = ua.match(/(Windows|Mac|Linux|Android|iOS)[^\d]*(\d+)?/i);

  return {
    userAgent: ua,
    browser: browserMatch ? `${browserMatch[1]} ${browserMatch[2]}` : 'Unknown',
    os: osMatch ? osMatch[0] : 'Unknown',
    device: /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop',
    referrer: document.referrer || undefined,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    sessionId: sessionStorage.getItem('sessionId') || crypto.randomUUID(),
  };
}

// Track failed attempts per email (for rate limiting detection)
const failedAttempts = new Map<string, number>();

class AccountErrorTracker {
  private errors: AccountError[] = [];
  private readonly MAX_ERRORS = 100;

  track(error: Omit<AccountError, 'timestamp'>) {
    // Auto-collect security context on client
    const security = collectSecurityContext();

    // Track attempt count for this email
    if (error.email) {
      const count = (failedAttempts.get(error.email) || 0) + 1;
      failedAttempts.set(error.email, count);
      security.attemptCount = count;

      // Clear after 15 mins
      setTimeout(() => failedAttempts.delete(error.email!), 15 * 60 * 1000);
    }

    const errorEntry: AccountError = {
      ...error,
      timestamp: new Date(),
      security: { ...security, ...error.security },
    };

    this.errors.push(errorEntry);

    // Keep only last N errors in memory
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(-this.MAX_ERRORS);
    }

    // Log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.error('[AccountError]', errorEntry.type, errorEntry.message, errorEntry.metadata);
    }

    // Send to backend for persistent tracking
    this.sendToBackend(errorEntry);

    return errorEntry;
  }

  private async sendToBackend(error: AccountError) {
    try {
      await fetch('/api/tracking/account-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
    } catch (e) {
      // Silent fail - don't create error loops
    }
  }

  // Helper methods for common errors
  trackAuthError(type: AccountErrorType, message: string, metadata?: Record<string, any>) {
    return this.track({
      type,
      message,
      page: typeof window !== 'undefined' ? window.location.pathname : 'server',
      metadata,
    });
  }

  trackOAuthError(provider: string, error: string, email?: string) {
    return this.track({
      type: error === 'OAuthAccountNotLinked' ? 'AUTH_OAUTH_NOT_LINKED' : 'AUTH_OAUTH_ERROR',
      message: `OAuth error with ${provider}: ${error}`,
      email,
      page: '/auth/signin',
      code: error,
      metadata: { provider, originalError: error },
    });
  }

  trackAPIError(endpoint: string, status: number, message: string) {
    return this.track({
      type: 'API_ERROR',
      message: `API error on ${endpoint}: ${message}`,
      page: typeof window !== 'undefined' ? window.location.pathname : 'server',
      code: status.toString(),
      metadata: { endpoint, status },
    });
  }

  getRecentErrors(limit = 20): AccountError[] {
    return this.errors.slice(-limit);
  }
}

// Singleton instance
export const accountErrorTracker = new AccountErrorTracker();

// React hook for easy usage
export function useAccountErrorTracking() {
  return {
    trackError: (type: AccountErrorType, message: string, metadata?: Record<string, any>) =>
      accountErrorTracker.trackAuthError(type, message, metadata),
    trackOAuth: (provider: string, error: string, email?: string) =>
      accountErrorTracker.trackOAuthError(provider, error, email),
    trackAPI: (endpoint: string, status: number, message: string) =>
      accountErrorTracker.trackAPIError(endpoint, status, message),
  };
}
