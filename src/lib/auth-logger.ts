/**
 * Simplified NextAuth v5 Logging System for Production Build Compatibility
 * Lightweight implementation to resolve module dependency issues
 */

// Simple console-based logging for NextAuth events
export function logAuthEvent(
  level: 'error' | 'warn' | 'info' | 'debug',
  action: string,
  data?: any
): void {
  // Only log in development to prevent production noise
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    const prefix = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🔍'
    }[level];

    console[level](`${prefix} [AUTH] ${action} [${timestamp}]`, data);
  }
}

// NextAuth v5 compatible logger - simplified for production builds
export const nextAuthLogger = {
  error: (message: string, metadata?: any): void => {
    // Filter out _log related errors to prevent infinite loops
    if (message.includes('_log') || message === 'UNKNOWN_ACTION') {
      return; // Silently ignore these to prevent recursion
    }

    logAuthEvent('error', message, metadata);
  },

  warn: (message: string, metadata?: any): void => {
    // Filter out _log related warnings
    if (message.includes('_log') || message === 'UNKNOWN_ACTION') {
      return; // Silently ignore these
    }

    logAuthEvent('warn', message, metadata);
  },

  debug: (message: string, metadata?: any): void => {
    // Completely disabled to prevent _log endpoint registration
    // This is critical for preventing the UnknownAction error in NextAuth v5
  }
};

// Simple auth logger for basic functionality
export const authLogger = {
  error: (action: string, error: Error | string, metadata?: any): void => {
    logAuthEvent('error', action, { error, metadata });
  },

  warn: (action: string, message: string, metadata?: any): void => {
    logAuthEvent('warn', action, { message, metadata });
  },

  info: (action: string, message: string, metadata?: any): void => {
    logAuthEvent('info', action, { message, metadata });
  },

  debug: (action: string, message: string, metadata?: any): void => {
    logAuthEvent('debug', action, { message, metadata });
  }
};

export default authLogger;