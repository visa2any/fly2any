/**
 * Network Error Recovery System
 * 
 * Provides robust error handling for network requests with:
 * - Exponential backoff retry
 * - Offline request queuing
 * - Automatic network status detection
 * - Error reporting and monitoring
 */

import { reportClientError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { logError } from '@/lib/errorLogger';

/**
 * Network status detection
 */
class NetworkStatus {
  private online = true;
  private listeners: Array<(online: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.online = navigator.onLine;
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.online = true;
    this.notifyListeners(true);
  };

  private handleOffline = () => {
    this.online = false;
    this.notifyListeners(false);
  };

  private notifyListeners(online: boolean) {
    this.listeners.forEach(listener => listener(online));
  }

  isOnline(): boolean {
    return this.online;
  }

  addListener(listener: (online: boolean) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (online: boolean) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.listeners = [];
  }
}

export const networkStatus = new NetworkStatus();

/**
 * Retry configuration
 */
interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryOnStatusCodes?: number[];
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  retryOnStatusCodes: [408, 429, 500, 502, 503, 504],
  shouldRetry: (error: Error, attempt: number) => {
    // Retry on network errors and specific HTTP errors
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.message.includes('Failed to fetch')
    );
  },
};

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Offline request queue
 */
class OfflineQueue {
  private queue: Array<{
    request: RequestInfo;
    init?: RequestInit;
    resolve: (value: Response) => void;
    reject: (reason?: any) => void;
    timestamp: number;
  }> = [];
  private maxQueueSize = 100;
  private maxQueueAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  private isProcessing = false;

  enqueue(
    request: RequestInfo,
    init?: RequestInit
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      // Clean old requests before adding new one
      this.cleanQueue();

      // Check if queue is full
      if (this.queue.length >= this.maxQueueSize) {
        reject(new Error('Offline queue is full'));
        return;
      }

      const item = {
        request,
        init,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      this.queue.push(item);

      // Log for monitoring
      logError(
        new Error('Request queued for offline processing'),
        {
          context: 'offline-queue',
          url: typeof request === 'string' ? request : request.url,
          method: init?.method || 'GET',
          queueSize: this.queue.length,
        },
        'info'
      );

      // Try to process if we're back online
      if (networkStatus.isOnline() && !this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private cleanQueue() {
    const now = Date.now();
    this.queue = this.queue.filter(item => {
      const isExpired = now - item.timestamp > this.maxQueueAge;
      if (isExpired) {
        item.reject(new Error('Request expired in offline queue'));
      }
      return !isExpired;
    });
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0 && networkStatus.isOnline()) {
        const item = this.queue[0];
        
        try {
          const response = await fetch(item.request, item.init);
          item.resolve(response);
          this.queue.shift(); // Remove successful request
        } catch (error) {
          // If still failing, stop processing and wait for next online event
          console.error('Failed to process queued request:', error);
          break;
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearQueue() {
    this.queue.forEach(item => {
      item.reject(new Error('Offline queue cleared'));
    });
    this.queue = [];
  }
}

export const offlineQueue = new OfflineQueue();

// Start processing queue when network comes back online
if (typeof window !== 'undefined') {
  networkStatus.addListener((online) => {
    if (online) {
      offlineQueue.processQueue();
    }
  });
}

/**
 * Enhanced fetch with retry and offline support
 */
export async function fetchWithRetry(
  input: RequestInfo,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  const mergedOptions = { ...defaultRetryOptions, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= mergedOptions.maxRetries; attempt++) {
    try {
      // Check network status before attempting
      if (!networkStatus.isOnline()) {
        throw new Error('Network is offline');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check for HTTP errors that should trigger retry
      if (!response.ok) {
        if (mergedOptions.retryOnStatusCodes.includes(response.status)) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        // For other HTTP errors, don't retry
        return response;
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Log the error
      reportClientError(error, {
        component: 'fetchWithRetry',
        action: `attempt_${attempt + 1}`,
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.HIGH,
        additionalData: {
          url: typeof input === 'string' ? input : input.url,
          method: init?.method || 'GET',
          attempt: attempt + 1,
          maxRetries: mergedOptions.maxRetries,
        },
      });

      // Check if we should retry
      if (attempt === mergedOptions.maxRetries) {
        break; // Max retries reached
      }

      if (!mergedOptions.shouldRetry(error as Error, attempt)) {
        break; // Error not retryable
      }

      // Calculate backoff delay
      const delay = calculateBackoffDelay(
        attempt,
        mergedOptions.baseDelay,
        mergedOptions.maxDelay
      );

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If we get here, all retries failed
  // If offline, queue the request
  if (!networkStatus.isOnline()) {
    return offlineQueue.enqueue(input, init);
  }

  // Otherwise, throw the last error
  throw lastError || new Error('Network request failed');
}

/**
 * Enhanced fetch with automatic error handling and monitoring
 */
export async function monitoredFetch(
  input: RequestInfo,
  init?: RequestInit,
  context?: {
    operationName?: string;
    endpoint?: string;
    trackMetrics?: boolean;
  }
): Promise<Response> {
  const startTime = performance.now();
  const operationName = context?.operationName || 'monitoredFetch';
  const endpoint = context?.endpoint || (typeof input === 'string' ? input : input.url);

  try {
    const response = await fetchWithRetry(input, init);

    // Track successful request metrics
    const duration = performance.now() - startTime;
    
    if (context?.trackMetrics !== false) {
      logError(
        new Error(`${operationName} completed`),
        {
          context: 'network-metrics',
          operation: operationName,
          endpoint,
          duration,
          status: response.status,
          statusText: response.statusText,
        },
        'info'
      );
    }

    return response;
  } catch (error) {
    const duration = performance.now() - startTime;

    // Report critical failure
    reportClientError(error as Error, {
      component: 'monitoredFetch',
      action: operationName,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.CRITICAL,
      additionalData: {
        endpoint,
        duration,
        method: init?.method || 'GET',
      },
    });

    throw error;
  }
}

/**
 * Hook for network status monitoring in React components
 */
export function useNetworkStatus() {
  if (typeof window === 'undefined') {
    return { isOnline: true };
  }

  const [isOnline, setIsOnline] = useState(networkStatus.isOnline());

  useEffect(() => {
    const handleStatusChange = (online: boolean) => {
      setIsOnline(online);
    };

    networkStatus.addListener(handleStatusChange);
    return () => networkStatus.removeListener(handleStatusChange);
  }, []);

  return { isOnline };
}

// Note: This would need to be in a 'use client' file for React hooks
// We'll export a separate hook file for React usage
