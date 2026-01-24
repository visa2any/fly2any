/**
 * Business-Critical Error Logger
 * Separate from analytics, independent of third-party scripts
 * Focuses on production safety and incident response
 */

export interface BusinessCriticalLogEntry {
  id: string;
  timestamp: number;
  severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';
  category: string;
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    page: string;
    agentId?: string;
    quoteId?: string;
    environment: 'production' | 'staging' | 'development';
    [key: string]: unknown;
  };
}

// ============================================
// LOG STORAGE (in-memory + localStorage)
// ============================================
class LogStorage {
  private maxLogs = 100; // Keep last 100 logs in memory
  private inMemoryLogs: BusinessCriticalLogEntry[] = [];
  private storageKey = 'business_critical_logs';
  private maxStorageLogs = 50; // Keep last 50 logs in localStorage

  /**
   * Add log to storage
   */
  addLog(entry: BusinessCriticalLogEntry): void {
    // Add to memory
    this.inMemoryLogs.push(entry);
    if (this.inMemoryLogs.length > this.maxLogs) {
      this.inMemoryLogs.shift();
    }

    // Add to localStorage (fire-and-forget)
    try {
      const existingLogs = this.getStorageLogs();
      existingLogs.push(entry);
      
      // Keep only maxStorageLogs
      if (existingLogs.length > this.maxStorageLogs) {
        existingLogs.splice(0, existingLogs.length - this.maxStorageLogs);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(existingLogs));
    } catch (error) {
      // Never throw - localStorage might be full or disabled
      console.warn('[BusinessCriticalLogger] Failed to store log:', error);
    }
  }

  /**
   * Get logs from localStorage
   */
  getStorageLogs(): BusinessCriticalLogEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      return JSON.parse(stored) as BusinessCriticalLogEntry[];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get all logs (memory + storage)
   */
  getAllLogs(): BusinessCriticalLogEntry[] {
    const storageLogs = this.getStorageLogs();
    return [...storageLogs, ...this.inMemoryLogs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.inMemoryLogs = [];
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('[BusinessCriticalLogger] Failed to clear logs:', error);
    }
  }

  /**
   * Get logs by severity
   */
  getLogsBySeverity(severity: BusinessCriticalLogEntry['severity']): BusinessCriticalLogEntry[] {
    return this.getAllLogs().filter(log => log.severity === severity);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: string): BusinessCriticalLogEntry[] {
    return this.getAllLogs().filter(log => log.category === category);
  }

  /**
   * Get logs within time range
   */
  getLogsInRange(startTime: number, endTime: number): BusinessCriticalLogEntry[] {
    return this.getAllLogs().filter(log => 
      log.timestamp >= startTime && log.timestamp <= endTime
    );
  }
}

// ============================================
// LOGGER IMPLEMENTATION
// ============================================
class BusinessCriticalLogger {
  private static instance: BusinessCriticalLogger;
  private storage: LogStorage;
  private isProduction: boolean;

  private constructor() {
    this.storage = new LogStorage();
    this.isProduction = typeof window !== 'undefined' && 
      (window.location.hostname === 'fly2any.com' || window.location.hostname === 'www.fly2any.com');
  }

  static getInstance(): BusinessCriticalLogger {
    if (!BusinessCriticalLogger.instance) {
      BusinessCriticalLogger.instance = new BusinessCriticalLogger();
    }
    return BusinessCriticalLogger.instance;
  }

  /**
   * Generate unique log ID
   */
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `LOG-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Get current environment
   */
  private getEnvironment(): 'production' | 'staging' | 'development' {
    if (typeof window === 'undefined') return 'development';
    const hostname = window.location.hostname;
    if (hostname === 'fly2any.com' || hostname === 'www.fly2any.com') return 'production';
    if (hostname.includes('staging') || hostname.includes('stage')) return 'staging';
    return 'development';
  }

  /**
   * Get current page
   */
  private getCurrentPage(): string {
    if (typeof window === 'undefined') return '/unknown';
    return window.location.pathname;
  }

  /**
   * Log a critical business event
   */
  log(
    severity: BusinessCriticalLogEntry['severity'],
    category: string,
    message: string,
    error?: Error,
    additionalContext?: Record<string, unknown>
  ): void {
    const entry: BusinessCriticalLogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      severity,
      category,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
      context: {
        page: this.getCurrentPage(),
        environment: this.getEnvironment(),
        ...additionalContext,
      },
    };

    // Store log
    this.storage.addLog(entry);

    // Console output (development only or for critical errors)
    if (!this.isProduction || severity === 'CRITICAL') {
      const emoji = severity === 'CRITICAL' ? '🚨' : severity === 'HIGH' ? '⚠️' : severity === 'WARN' ? '⚡' : 'ℹ️';
      console.group(`${emoji} [${severity}] ${category}`);
      console.log('Message:', message);
      if (error) {
        console.error('Error:', error);
      }
      console.log('Context:', entry.context);
      console.log('Log ID:', entry.id);
      console.log('Timestamp:', new Date(entry.timestamp).toISOString());
      console.groupEnd();
    }
  }

  /**
   * Convenience methods for different severity levels
   */
  info(category: string, message: string, additionalContext?: Record<string, unknown>): void {
    this.log('INFO', category, message, undefined, additionalContext);
  }

  warn(category: string, message: string, additionalContext?: Record<string, unknown>): void {
    this.log('WARN', category, message, undefined, additionalContext);
  }

  high(category: string, message: string, error?: Error, additionalContext?: Record<string, unknown>): void {
    this.log('HIGH', category, message, error, additionalContext);
  }

  critical(category: string, message: string, error?: Error, additionalContext?: Record<string, unknown>): void {
    this.log('CRITICAL', category, message, error, additionalContext);
  }

  /**
   * Log QuoteSaveError specifically
   */
  logQuoteSaveError(
    error: Error & { metadata?: Record<string, unknown> },
    additionalContext?: Record<string, unknown>
  ): void {
    this.critical(
      'QUOTE_PERSISTENCE',
      'Quote save operation failed',
      error,
      {
        quoteId: error.metadata?.quoteId,
        agentId: error.metadata?.agentId,
        clientId: error.metadata?.clientId,
        failureMode: error.metadata?.failureMode,
        httpStatus: error.metadata?.httpStatus,
        ...additionalContext,
      }
    );
  }

  /**
   * Get all logs
   */
  getAllLogs(): BusinessCriticalLogEntry[] {
    return this.storage.getAllLogs();
  }

  /**
   * Get critical logs
   */
  getCriticalLogs(): BusinessCriticalLogEntry[] {
    return this.storage.getLogsBySeverity('CRITICAL');
  }

  /**
   * Get high severity logs
   */
  getHighSeverityLogs(): BusinessCriticalLogEntry[] {
    return this.storage.getLogsBySeverity('HIGH');
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.storage.clearLogs();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.getAllLogs(), null, 2);
  }

  /**
   * Download logs as file (for debugging)
   */
  downloadLogs(): void {
    try {
      const logs = this.exportLogs();
      const blob = new Blob([logs], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-critical-logs-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('[BusinessCriticalLogger] Failed to download logs:', error);
    }
  }
}

// ============================================
// PUBLIC API
// ============================================
export const businessCriticalLogger = BusinessCriticalLogger.getInstance();

/**
 * Log critical business event
 */
export function logCritical(
  category: string,
  message: string,
  error?: Error,
  additionalContext?: Record<string, unknown>
): void {
  businessCriticalLogger.critical(category, message, error, additionalContext);
}

/**
 * Log high severity business event
 */
export function logHigh(
  category: string,
  message: string,
  error?: Error,
  additionalContext?: Record<string, unknown>
): void {
  businessCriticalLogger.high(category, message, error, additionalContext);
}

/**
 * Log QuoteSaveError
 */
export function logQuoteSaveError(
  error: Error & { metadata?: Record<string, unknown> },
  additionalContext?: Record<string, unknown>
): void {
  businessCriticalLogger.logQuoteSaveError(error, additionalContext);
}