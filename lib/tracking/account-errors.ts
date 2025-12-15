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
}

class AccountErrorTracker {
  private errors: AccountError[] = [];
  private readonly MAX_ERRORS = 100;

  track(error: Omit<AccountError, 'timestamp'>) {
    const errorEntry: AccountError = {
      ...error,
      timestamp: new Date(),
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
