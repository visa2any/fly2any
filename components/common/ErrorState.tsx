'use client';

import { AlertCircle, Wifi, WifiOff, Clock, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export type ErrorType = 'network' | 'api' | 'timeout' | 'validation' | 'generic';

export interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  type?: ErrorType;
  title?: string;
  message?: string;
  className?: string;
}

const errorConfigs: Record<
  ErrorType,
  {
    icon: React.ReactNode;
    defaultTitle: string;
    defaultMessage: string;
    iconColor: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  network: {
    icon: <WifiOff className="w-16 h-16" />,
    defaultTitle: 'Connection Problem',
    defaultMessage: 'Unable to connect. Please check your internet connection and try again.',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  api: {
    icon: <AlertCircle className="w-16 h-16" />,
    defaultTitle: 'Service Unavailable',
    defaultMessage: 'Our flight search service is temporarily unavailable. Please try again in a few moments.',
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  timeout: {
    icon: <Clock className="w-16 h-16" />,
    defaultTitle: 'Request Timed Out',
    defaultMessage: 'The search took too long to complete. This might be due to high traffic or a complex search.',
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  validation: {
    icon: <XCircle className="w-16 h-16" />,
    defaultTitle: 'Invalid Input',
    defaultMessage: 'Please check your search criteria and try again.',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  generic: {
    icon: <AlertCircle className="w-16 h-16" />,
    defaultTitle: 'Something Went Wrong',
    defaultMessage: 'An unexpected error occurred. Please try again.',
    iconColor: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
};

export function ErrorState({
  error,
  onRetry,
  type = 'generic',
  title,
  message,
  className = '',
}: ErrorStateProps) {
  const config = errorConfigs[type];
  const errorMessage = typeof error === 'string' ? error : error.message;

  // Use custom title/message if provided, otherwise use defaults
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || (type === 'generic' ? errorMessage : config.defaultMessage);

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div
        className={`max-w-md mx-auto ${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-8 shadow-lg`}
      >
        {/* Icon */}
        <div className={`flex justify-center mb-6 ${config.iconColor}`}>
          {config.icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{displayTitle}</h3>

        {/* Message */}
        <p className="text-gray-700 mb-6 leading-relaxed">{displayMessage}</p>

        {/* Error details (for development/debugging) */}
        {process.env.NODE_ENV === 'development' && type === 'generic' && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 mb-2">
              Technical Details
            </summary>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto text-gray-800">
              {errorMessage}
            </pre>
          </details>
        )}

        {/* Retry Button */}
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="primary"
            size="lg"
            icon={<RefreshCw className="w-5 h-5" />}
            className="mx-auto"
          >
            Try Again
          </Button>
        )}

        {/* Helpful tips for specific error types */}
        {type === 'timeout' && (
          <div className="mt-6 text-left bg-white rounded-lg p-4 border border-yellow-300">
            <p className="text-sm font-semibold text-yellow-900 mb-2">Tips to improve results:</p>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Try searching for fewer dates at once</li>
              <li>• Search for specific airports instead of multiple origins</li>
              <li>• Try again during off-peak hours</li>
            </ul>
          </div>
        )}

        {type === 'network' && (
          <div className="mt-6 text-left bg-white rounded-lg p-4 border border-red-300">
            <p className="text-sm font-semibold text-red-900 mb-2">Connection troubleshooting:</p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Disable VPN if active</li>
              <li>• Try refreshing the page</li>
              <li>• Clear browser cache and cookies</li>
            </ul>
          </div>
        )}
      </div>

      {/* Support contact (always shown) */}
      <div className="mt-6 text-sm text-gray-600">
        Need help? Contact our support team at{' '}
        <a
          href="mailto:support@fly2any.com"
          className="text-primary-600 hover:text-primary-700 font-semibold underline"
        >
          support@fly2any.com
        </a>
      </div>
    </div>
  );
}

/**
 * Determine error type from error object
 * Useful for automatic error type detection
 */
export function getErrorType(error: Error | any): ErrorType {
  const message = error?.message?.toLowerCase() || '';

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('offline')
  ) {
    return 'network';
  }

  if (
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('aborted')
  ) {
    return 'timeout';
  }

  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    error?.status === 400
  ) {
    return 'validation';
  }

  if (
    message.includes('service') ||
    message.includes('unavailable') ||
    (error?.status >= 500 && error?.status < 600)
  ) {
    return 'api';
  }

  return 'generic';
}
