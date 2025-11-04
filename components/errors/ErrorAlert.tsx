'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ErrorAlertType = 'error' | 'warning' | 'info' | 'success';

interface ErrorAlertProps {
  type?: ErrorAlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  closeable?: boolean;
  className?: string;
}

/**
 * ErrorAlert - Inline error/status message component
 *
 * Features:
 * - Multiple alert types (error, warning, info, success)
 * - Optional close button
 * - Accessible ARIA labels
 * - User-friendly styling
 *
 * Usage:
 * <ErrorAlert
 *   type="error"
 *   title="Connection Failed"
 *   message="Unable to connect to server. Please try again."
 *   closeable
 *   onClose={() => setError(null)}
 * />
 */
export default function ErrorAlert({
  type = 'error',
  title,
  message,
  onClose,
  closeable = false,
  className = '',
}: ErrorAlertProps) {
  const config = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor, titleColor } = config[type];

  return (
    <div
      className={`${bgColor} ${borderColor} border rounded-lg p-4 ${className}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-semibold ${titleColor} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${textColor}`}>
            {message}
          </p>
        </div>

        {/* Close Button */}
        {closeable && onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${textColor} hover:opacity-75 transition-opacity`}
            aria-label="Close alert"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
