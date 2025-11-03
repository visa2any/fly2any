/**
 * Toast Notification Utility
 *
 * Provides a consistent, branded toast notification system using react-hot-toast.
 * Supports success, error, warning, and info notifications with Fly2Any styling.
 */

import toast, { Toast } from 'react-hot-toast';

/**
 * Toast options interface
 */
export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  id?: string;
}

/**
 * Fly2Any brand colors
 */
const colors = {
  primary: '#0066FF',      // Bright blue
  success: '#10B981',      // Green
  error: '#EF4444',        // Red
  warning: '#F59E0B',      // Amber
  info: '#3B82F6',         // Blue
};

/**
 * Default toast configuration
 */
const defaultConfig = {
  duration: 4000,
  position: 'bottom-right' as const,
};

/**
 * Create a styled toast with custom styling
 */
function createStyledToast(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info',
  options?: ToastOptions
): string | Toast {
  const config = {
    ...defaultConfig,
    ...options,
  };

  const colorMap = {
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
  };

  const backgroundColor = colorMap[type];

  return toast.custom(
    (t) => (
      <div
        className={`
          px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm
          transition-all duration-300 ease-in-out
          ${t.visible ? 'animate-in fade-in slide-in-from-bottom-4' : 'animate-out fade-out slide-out-to-bottom-4'}
        `}
        style={{
          backgroundColor: backgroundColor,
          color: 'white',
          fontWeight: '500',
          fontSize: '0.95rem',
          lineHeight: '1.5',
        }}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {type === 'success' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === 'error' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === 'warning' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === 'info' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Message */}
        <span className="flex-1">{message}</span>

        {/* Close button */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    ),
    {
      duration: config.duration,
      position: config.position,
      id: config.id,
    }
  );
}

/**
 * Show success toast notification
 *
 * @param message - Toast message to display
 * @param options - Toast options
 *
 * @example
 * ```ts
 * showSuccess('Flight booked successfully!');
 * ```
 */
export function showSuccess(message: string, options?: ToastOptions): string | Toast {
  return createStyledToast(message, 'success', options);
}

/**
 * Show error toast notification
 *
 * @param message - Toast message to display
 * @param options - Toast options
 *
 * @example
 * ```ts
 * showError('Failed to book flight');
 * ```
 */
export function showError(message: string, options?: ToastOptions): string | Toast {
  return createStyledToast(message, 'error', options);
}

/**
 * Show warning toast notification
 *
 * @param message - Toast message to display
 * @param options - Toast options
 *
 * @example
 * ```ts
 * showWarning('Price increased since last check');
 * ```
 */
export function showWarning(message: string, options?: ToastOptions): string | Toast {
  return createStyledToast(message, 'warning', options);
}

/**
 * Show info toast notification
 *
 * @param message - Toast message to display
 * @param options - Toast options
 *
 * @example
 * ```ts
 * showInfo('New flight deals available');
 * ```
 */
export function showInfo(message: string, options?: ToastOptions): string | Toast {
  return createStyledToast(message, 'info', options);
}

/**
 * Show loading toast (persists until dismissed)
 *
 * @param message - Toast message to display
 * @returns Toast ID for later dismissal
 *
 * @example
 * ```ts
 * const id = showLoading('Searching flights...');
 * // Later...
 * toast.dismiss(id);
 * ```
 */
export function showLoading(message: string): string | Toast {
  return toast.custom(
    (t) => (
      <div
        className="px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm bg-blue-500"
        style={{
          backgroundColor: colors.primary,
          color: 'white',
          fontWeight: '500',
          fontSize: '0.95rem',
          lineHeight: '1.5',
        }}
      >
        {/* Spinner */}
        <div className="flex-shrink-0">
          <svg
            className="animate-spin w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        {/* Message */}
        <span className="flex-1">{message}</span>
      </div>
    ),
    {
      duration: Infinity,
    }
  );
}

/**
 * Dismiss a specific toast or all toasts
 *
 * @param toastId - Optional toast ID to dismiss. If not provided, dismisses all.
 *
 * @example
 * ```ts
 * dismissToast(toastId);
 * dismissToast(); // Dismiss all
 * ```
 */
export function dismissToast(toastId?: string): void {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
}

/**
 * Promise-based toast handler
 * Shows loading, success, or error based on promise resolution
 *
 * @param promise - Promise to handle
 * @param messages - Messages for loading, success, and error states
 *
 * @example
 * ```ts
 * handlePromiseToast(
 *   bookFlightAPI(),
 *   {
 *     loading: 'Booking flight...',
 *     success: 'Flight booked!',
 *     error: 'Failed to book flight',
 *   }
 * );
 * ```
 */
export function handlePromiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
): Promise<T> {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      position: defaultConfig.position,
      duration: defaultConfig.duration,
    }
  );
}

/**
 * Get default toast position
 */
export function getDefaultPosition() {
  return defaultConfig.position;
}

/**
 * Set default toast position globally
 *
 * @param position - New default position
 *
 * @example
 * ```ts
 * setDefaultPosition('top-right');
 * ```
 */
export function setDefaultPosition(
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
): void {
  defaultConfig.position = position as typeof defaultConfig.position;
}
