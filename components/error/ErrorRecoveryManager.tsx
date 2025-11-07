'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  RefreshCw,
  Calendar,
  Plane,
  MessageCircle,
  MapPin,
  Clock,
  Search,
  ArrowRight,
  Mail,
  Phone,
  HelpCircle,
} from 'lucide-react';
import {
  handleError,
  type ErrorType,
  type ErrorContext,
  type ErrorResponse,
} from '@/lib/ai/agent-error-handling';

/**
 * Props for ErrorRecoveryManager component
 */
interface ErrorRecoveryManagerProps {
  error: {
    type: 'api-failure' | 'no-results' | 'timeout' | 'invalid-input';
    message: string;
    originalRequest?: string;
  };
  onRetry?: () => void;
  alternatives?: Array<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  }>;
  canRetry?: boolean;
  consultant?: 'flight-operations' | 'hotel-accommodations' | 'customer-service';
}

/**
 * Error Recovery Manager Component
 *
 * Features:
 * - Never shows raw error messages
 * - Always provides 2-3 alternative actions
 * - Empathetic, helpful language
 * - Integrates with existing error handling
 * - Styled error alerts with proper color coding
 * - Retry button with loading state
 */
export default function ErrorRecoveryManager({
  error,
  onRetry,
  alternatives,
  canRetry = true,
  consultant = 'customer-service',
}: ErrorRecoveryManagerProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [errorResponse, setErrorResponse] = useState<ErrorResponse | null>(null);

  // Fade-in animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Generate empathetic error response using existing error handler
  useEffect(() => {
    // Map component error types to ErrorType
    const errorTypeMap: Record<string, ErrorType> = {
      'api-failure': 'api-failure',
      'no-results': 'no-results',
      'timeout': 'timeout',
      'invalid-input': 'invalid-input',
    };

    const errorContext: ErrorContext = {
      type: errorTypeMap[error.type] || 'system-error',
      originalRequest: error.originalRequest || error.message,
      consultant: consultant,
      specificError: error.message,
    };

    const response = handleError(errorContext);
    setErrorResponse(response);
  }, [error, consultant]);

  // Handle retry with loading state
  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      // Keep loading state for at least 500ms for better UX
      setTimeout(() => {
        setIsRetrying(false);
      }, 500);
    }
  };

  // Get error severity for color coding
  const getErrorSeverity = (
    type: string
  ): { bg: string; border: string; text: string; icon: string } => {
    switch (type) {
      case 'api-failure':
      case 'timeout':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-500',
        };
      case 'no-results':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-500',
        };
      case 'invalid-input':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-500',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-500',
        };
    }
  };

  const severity = getErrorSeverity(error.type);

  // Get default alternatives based on error type if none provided
  const getDefaultAlternatives = () => {
    if (alternatives && alternatives.length > 0) {
      return alternatives;
    }

    // Generate default alternatives based on error type
    switch (error.type) {
      case 'no-results':
        return [
          {
            label: 'Try nearby dates',
            action: () => console.log('Adjust dates'),
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            label: 'Include connecting flights',
            action: () => console.log('Add layovers'),
            icon: <Plane className="w-4 h-4" />,
          },
          {
            label: 'Search nearby locations',
            action: () => console.log('Nearby locations'),
            icon: <MapPin className="w-4 h-4" />,
          },
        ];
      case 'timeout':
        return [
          {
            label: 'Simplify search',
            action: () => console.log('Simplify'),
            icon: <Search className="w-4 h-4" />,
          },
          {
            label: 'Try again later',
            action: () => console.log('Later'),
            icon: <Clock className="w-4 h-4" />,
          },
          {
            label: 'Contact support',
            action: () => window.open('mailto:support@fly2any.com', '_blank'),
            icon: <MessageCircle className="w-4 h-4" />,
          },
        ];
      case 'api-failure':
        return [
          {
            label: 'Try different dates',
            action: () => console.log('Different dates'),
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            label: 'Contact support',
            action: () => window.open('mailto:support@fly2any.com', '_blank'),
            icon: <MessageCircle className="w-4 h-4" />,
          },
          {
            label: 'Get help',
            action: () => console.log('Help'),
            icon: <HelpCircle className="w-4 h-4" />,
          },
        ];
      case 'invalid-input':
        return [
          {
            label: 'See examples',
            action: () => console.log('Examples'),
            icon: <HelpCircle className="w-4 h-4" />,
          },
          {
            label: 'Start over',
            action: () => console.log('Start over'),
            icon: <RefreshCw className="w-4 h-4" />,
          },
        ];
      default:
        return [];
    }
  };

  const displayAlternatives = getDefaultAlternatives();

  // Contact support escalation
  const contactSupport = () => {
    window.open('mailto:support@fly2any.com?subject=Support Request', '_blank');
  };

  if (!errorResponse) {
    return null;
  }

  return (
    <div
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Main Error Alert */}
      <div
        className={`
          ${severity.bg} ${severity.border} ${severity.text}
          border-2 rounded-xl p-6 mb-4
          shadow-lg
        `}
        role="alert"
        aria-live="assertive"
      >
        {/* Header with Icon */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`${severity.icon} flex-shrink-0 mt-1`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              {error.type === 'api-failure' && "We're experiencing technical difficulties"}
              {error.type === 'no-results' && "No results found"}
              {error.type === 'timeout' && "Taking longer than expected"}
              {error.type === 'invalid-input' && "Let's clarify that"}
            </h3>

            {/* Empathetic Error Message */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line leading-relaxed">
                {errorResponse.message}
              </p>
            </div>

            {/* Original Request Context */}
            {error.originalRequest && (
              <div className="mt-3 p-3 bg-white/50 rounded-lg border border-current/10">
                <p className="text-sm font-medium">Your request:</p>
                <p className="text-sm italic">&quot;{error.originalRequest}&quot;</p>
              </div>
            )}
          </div>
        </div>

        {/* Retry Button */}
        {canRetry && onRetry && (
          <div className="flex justify-start mb-4">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg
                font-medium transition-all duration-200
                ${
                  isRetrying
                    ? 'bg-gray-300 cursor-not-allowed'
                    : `${severity.text} bg-white hover:shadow-md active:scale-95`
                }
                border-2 ${severity.border}
              `}
              aria-label="Retry search"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`}
              />
              <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
            </button>
          </div>
        )}

        {/* Suggested Actions from Error Handler */}
        {errorResponse.suggestedActions && errorResponse.suggestedActions.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Quick suggestions:</p>
            <ul className="space-y-1">
              {errorResponse.suggestedActions.slice(0, 3).map((action, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Alternative Actions as Clickable Cards */}
      {displayAlternatives.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 px-1">
            Here are some alternatives:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayAlternatives.map((alternative, index) => (
              <button
                key={index}
                onClick={alternative.action}
                className="
                  flex items-center gap-3 p-4
                  bg-white border-2 border-gray-200 rounded-lg
                  hover:border-sky-400 hover:bg-sky-50
                  transition-all duration-200
                  active:scale-95
                  shadow-sm hover:shadow-md
                  text-left
                  group
                "
                aria-label={alternative.label}
              >
                <div className="flex-shrink-0 text-gray-500 group-hover:text-sky-600 transition-colors">
                  {alternative.icon || <ArrowRight className="w-5 h-5" />}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-sky-900">
                  {alternative.label}
                </span>
                <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Support Escalation Section */}
      {errorResponse.escalateToHuman && (
        <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-sky-900 mb-2">
                Need personalized help?
              </p>
              <p className="text-sm text-sky-700 mb-3">
                Our 24/7 support team is standing by to assist you personally.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={contactSupport}
                  className="
                    flex items-center gap-2 px-4 py-2
                    bg-sky-600 text-white rounded-lg
                    hover:bg-sky-700 transition-colors
                    text-sm font-medium
                    active:scale-95
                  "
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Support</span>
                </button>
                <a
                  href="tel:+1-800-FLY-2ANY"
                  className="
                    flex items-center gap-2 px-4 py-2
                    bg-white text-sky-600 rounded-lg border-2 border-sky-600
                    hover:bg-sky-50 transition-colors
                    text-sm font-medium
                    active:scale-95
                  "
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Us</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Options (if provided by error handler) */}
      {errorResponse.alternativeOptions && errorResponse.alternativeOptions.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            You might also be interested in:
          </p>
          <div className="flex flex-wrap gap-2">
            {errorResponse.alternativeOptions.map((option, index) => (
              <span
                key={index}
                className="
                  px-3 py-1.5 text-sm
                  bg-white text-gray-700
                  rounded-full border border-gray-300
                  hover:border-gray-400 hover:shadow-sm
                  transition-all cursor-pointer
                "
              >
                {option}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to create error objects for the component
 */
export function createErrorRecovery(
  type: 'api-failure' | 'no-results' | 'timeout' | 'invalid-input',
  message: string,
  originalRequest?: string
) {
  return {
    error: {
      type,
      message,
      originalRequest,
    },
  };
}

/**
 * Common alternative actions that can be reused
 */
export const commonAlternatives = {
  adjustDates: (onAction: () => void) => ({
    label: 'Try nearby dates',
    action: onAction,
    icon: <Calendar className="w-4 h-4" />,
  }),
  addLayovers: (onAction: () => void) => ({
    label: 'Include connecting flights',
    action: onAction,
    icon: <Plane className="w-4 h-4" />,
  }),
  nearbyLocations: (onAction: () => void) => ({
    label: 'Search nearby locations',
    action: onAction,
    icon: <MapPin className="w-4 h-4" />,
  }),
  contactSupport: (onAction: () => void) => ({
    label: 'Contact support',
    action: onAction,
    icon: <MessageCircle className="w-4 h-4" />,
  }),
  simplifySearch: (onAction: () => void) => ({
    label: 'Simplify search',
    action: onAction,
    icon: <Search className="w-4 h-4" />,
  }),
};
