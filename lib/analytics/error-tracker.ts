/**
 * Error Tracking Service
 * Captures JavaScript errors and sends them to backend
 */

export interface ErrorInfo {
  message: string
  stack?: string
  errorType?: string
  url: string
  severity: 'error' | 'warning' | 'info'
  metadata?: Record<string, any>
}

class ErrorTracker {
  private sessionId: string
  private initialized: boolean = false

  constructor() {
    this.sessionId = this.getSessionId()
    this.init()
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session'
    return sessionStorage.getItem('analytics_session_id') || 'unknown'
  }

  private init() {
    if (typeof window === 'undefined' || this.initialized) return

    this.initialized = true

    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        errorType: event.error?.name,
        url: window.location.href,
        severity: 'error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        errorType: 'UnhandledPromiseRejection',
        url: window.location.href,
        severity: 'error'
      })
    })

    // Console error override
    const originalConsoleError = console.error
    console.error = (...args) => {
      this.captureError({
        message: args.map(arg => String(arg)).join(' '),
        url: window.location.href,
        severity: 'error',
        errorType: 'ConsoleError'
      })
      originalConsoleError.apply(console, args)
    }
  }

  /**
   * Capture an error
   */
  async captureError(error: ErrorInfo) {
    try {
      // Generate fingerprint for grouping similar errors
      const fingerprint = this.generateFingerprint(error)

      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          ...error,
          fingerprint
        })
      })
    } catch (err) {
      // Fail silently to avoid infinite loops
      console.warn('Failed to send error to tracking service:', err)
    }
  }

  /**
   * Generate a fingerprint for error grouping
   */
  private generateFingerprint(error: ErrorInfo): string {
    const { message, errorType, url } = error

    // Extract meaningful part of stack trace (first few lines)
    const stackLines = error.stack?.split('\n').slice(0, 3).join('\n') || ''

    // Create a simple hash
    const content = `${errorType}-${message}-${stackLines}`
    return this.simpleHash(content)
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(36)
  }

  /**
   * Capture a custom error
   */
  captureException(error: Error, severity: 'error' | 'warning' | 'info' = 'error', metadata?: Record<string, any>) {
    this.captureError({
      message: error.message,
      stack: error.stack,
      errorType: error.name,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      severity,
      metadata
    })
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, severity: 'error' | 'warning' | 'info' = 'info', metadata?: Record<string, any>) {
    this.captureError({
      message,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      severity,
      metadata
    })
  }
}

// Singleton instance
let trackerInstance: ErrorTracker | null = null

export function getErrorTracker(): ErrorTracker {
  if (!trackerInstance) {
    trackerInstance = new ErrorTracker()
  }
  return trackerInstance
}

// Convenience functions
export const captureException = (error: Error, severity?: 'error' | 'warning' | 'info', metadata?: Record<string, any>) =>
  getErrorTracker().captureException(error, severity, metadata)

export const captureMessage = (message: string, severity?: 'error' | 'warning' | 'info', metadata?: Record<string, any>) =>
  getErrorTracker().captureMessage(message, severity, metadata)

// Auto-initialize on client
if (typeof window !== 'undefined') {
  getErrorTracker()
}
