'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'error' | 'warning' | 'info' | 'success';

interface ErrorToastProps {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

/**
 * ErrorToast - Toast notification component
 *
 * Features:
 * - Auto-dismiss after duration
 * - Multiple toast types
 * - Configurable position
 * - Smooth animations
 * - User-friendly design
 *
 * Usage:
 * <ErrorToast
 *   type="error"
 *   title="Upload Failed"
 *   message="Unable to upload file. Please try again."
 *   duration={5000}
 *   onClose={() => setToast(null)}
 *   position="top-right"
 * />
 */
export default function ErrorToast({
  type = 'error',
  title,
  message,
  duration = 5000,
  onClose,
  position = 'top-right',
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Match animation duration
  };

  if (!isVisible) return null;

  const config = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
    },
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor, titleColor } = config[type];

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 w-full max-w-sm mx-4 transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`${bgColor} ${borderColor} border-2 rounded-xl shadow-2xl backdrop-blur-sm p-4`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`text-sm font-bold ${titleColor} mb-1`}>
                {title}
              </h3>
            )}
            <p className={`text-sm ${textColor} leading-relaxed`}>
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${textColor} hover:opacity-75 transition-opacity`}
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (if duration is set) */}
        {duration > 0 && (
          <div className={`mt-3 h-1 ${borderColor} rounded-full overflow-hidden`}>
            <div
              className={`h-full ${iconColor.replace('text-', 'bg-')} transition-all ease-linear`}
              style={{
                width: '100%',
                animation: `shrink ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook for managing toasts
 *
 * Usage:
 * const { toast, showToast } = useToast();
 *
 * showToast({
 *   type: 'error',
 *   title: 'Error',
 *   message: 'Something went wrong',
 * });
 */
export function useToast() {
  const [toast, setToast] = useState<ErrorToastProps | null>(null);

  const showToast = (props: Omit<ErrorToastProps, 'onClose'>) => {
    setToast({
      ...props,
      onClose: () => setToast(null),
    });
  };

  const ToastComponent = toast ? <ErrorToast {...toast} /> : null;

  return {
    toast: ToastComponent,
    showToast,
    hideToast: () => setToast(null),
  };
}
