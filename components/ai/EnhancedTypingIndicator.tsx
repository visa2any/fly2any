'use client';

import { useState, useEffect } from 'react';
import { ConsultantAvatar } from './ConsultantAvatar';
import { Loader2, Search, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export interface TypingStage {
  id: string;
  label: string;
  icon?: React.ReactNode;
  duration?: number; // ms
  completed?: boolean;
}

export interface EnhancedTypingIndicatorProps {
  consultantId: string;
  consultantName: string;
  consultantEmoji?: string;
  stages?: TypingStage[];
  currentStage?: number;
  estimatedTime?: number; // seconds
  message?: string;
  showAvatar?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'detailed' | 'progressive';
}

/**
 * Enhanced Typing Indicator
 *
 * Creates an engaging waiting experience with:
 * - Animated typing dots
 * - Progressive status updates
 * - Consultant personality
 * - Time estimates
 * - Visual feedback
 *
 * @example
 * ```tsx
 * <EnhancedTypingIndicator
 *   consultantId="sarah-flight"
 *   consultantName="Sarah Chen"
 *   consultantEmoji="✈️"
 *   stages={[
 *     { id: 'analyzing', label: 'Analyzing your request', icon: <Sparkles /> },
 *     { id: 'searching', label: 'Searching flights', icon: <Search /> },
 *     { id: 'comparing', label: 'Comparing prices', icon: <Clock /> },
 *   ]}
 *   currentStage={1}
 *   estimatedTime={5}
 *   variant="progressive"
 * />
 * ```
 */
export function EnhancedTypingIndicator({
  consultantId,
  consultantName,
  consultantEmoji = '✨',
  stages = [],
  currentStage = 0,
  estimatedTime,
  message,
  showAvatar = true,
  size = 'md',
  variant = 'detailed',
}: EnhancedTypingIndicatorProps) {
  const [dots, setDots] = useState(1);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animate typing dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Progress bar animation
  useEffect(() => {
    if (!estimatedTime) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Never reach 100% until actually done
        return prev + (100 / estimatedTime / 10); // Increment based on estimated time
      });
    }, 100);

    return () => clearInterval(interval);
  }, [estimatedTime]);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get current stage info
  const activeStage = stages[currentStage];
  const hasStages = stages.length > 0;

  // Determine size classes
  const sizeClasses = {
    sm: 'text-sm py-2 px-3',
    md: 'text-base py-3 px-4',
    lg: 'text-lg py-4 px-5',
  };

  // Minimal variant - just typing dots
  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2 animate-fade-in">
        {showAvatar && (
          <ConsultantAvatar
            consultantId={consultantId}
            name={consultantName}
            size="sm"
            showStatus={false}
          />
        )}
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <span className="font-medium">{consultantName}</span>
          <span>is typing</span>
          <span className="flex gap-0.5">
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={`w-1.5 h-1.5 bg-blue-500 rounded-full transition-opacity ${
                  dot <= dots ? 'opacity-100' : 'opacity-30'
                }`}
              />
            ))}
          </span>
        </div>
      </div>
    );
  }

  // Detailed variant - with message
  if (variant === 'detailed') {
    return (
      <div
        className={`flex items-start gap-3 ${sizeClasses[size]} bg-gray-50 dark:bg-gray-800 rounded-2xl animate-fade-in`}
      >
        {showAvatar && (
          <ConsultantAvatar
            consultantId={consultantId}
            name={consultantName}
            size={size}
            showStatus={true}
          />
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {consultantName}
            </span>
            <span className="text-gray-500 dark:text-gray-400">{consultantEmoji}</span>
          </div>

          {message ? (
            <p className="text-gray-700 dark:text-gray-300 text-sm italic">
              "{message}"
            </p>
          ) : (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Working on your request</span>
              <span className="flex gap-0.5 ml-1">
                {[1, 2, 3].map((dot) => (
                  <span
                    key={dot}
                    className={`w-1 h-1 bg-blue-500 rounded-full transition-opacity ${
                      dot <= dots ? 'opacity-100' : 'opacity-30'
                    }`}
                  />
                ))}
              </span>
            </div>
          )}

          {estimatedTime && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>
                {elapsedTime < estimatedTime
                  ? `About ${estimatedTime - elapsedTime}s remaining`
                  : 'Almost done...'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Progressive variant - with stages
  return (
    <div
      className={`flex flex-col gap-3 ${sizeClasses[size]} bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-blue-100 dark:border-gray-700 animate-fade-in`}
    >
      {/* Header with Avatar */}
      <div className="flex items-center gap-3">
        {showAvatar && (
          <ConsultantAvatar
            consultantId={consultantId}
            name={consultantName}
            size={size}
            showStatus={true}
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {consultantName}
            </span>
            <span>{consultantEmoji}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {activeStage?.label || 'Processing your request'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        </div>
      </div>

      {/* Progress Bar */}
      {estimatedTime && (
        <div className="space-y-1">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {elapsedTime < estimatedTime
                ? `${elapsedTime}s elapsed`
                : 'Finishing up...'}
            </span>
            <span>
              {estimatedTime}s estimated
            </span>
          </div>
        </div>
      )}

      {/* Stage Progress */}
      {hasStages && stages.length > 1 && (
        <div className="space-y-2 pt-2 border-t border-blue-100 dark:border-gray-700">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStage;
            const isCurrent = index === currentStage;
            const isPending = index > currentStage;

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-3 text-sm transition-all ${
                  isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : isCurrent
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <div className="relative">
                      <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-700 rounded-full" />
                  )}
                </div>
                <span className="flex-1">{stage.label}</span>
                {isCurrent && (
                  <span className="flex gap-0.5">
                    {[1, 2, 3].map((dot) => (
                      <span
                        key={dot}
                        className={`w-1 h-1 bg-blue-500 rounded-full transition-opacity ${
                          dot <= dots ? 'opacity-100' : 'opacity-30'
                        }`}
                      />
                    ))}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Encouraging Message */}
      {elapsedTime > 5 && (
        <div className="pt-2 border-t border-blue-100 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
            {elapsedTime < 10
              ? "Finding the best options for you..."
              : elapsedTime < 15
              ? "Comparing thousands of combinations..."
              : "Almost there! Finalizing your perfect options..."}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Quick Typing Indicator (Simplified)
 * For use in chat bubbles
 */
export function QuickTypingIndicator({
  consultantName,
  size = 'sm',
}: {
  consultantName: string;
  size?: 'sm' | 'md';
}) {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex items-center gap-2 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
      <span className="text-gray-600 dark:text-gray-400">{consultantName} is typing</span>
      <span className="flex gap-1">
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`w-1.5 h-1.5 bg-blue-500 rounded-full transition-opacity duration-300 ${
              dot <= dots ? 'opacity-100' : 'opacity-20'
            }`}
          />
        ))}
      </span>
    </div>
  );
}

/**
 * Pulse Animation Wrapper
 * Adds subtle pulse to any component during loading
 */
export function PulsingContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-pulse-subtle">
      {children}
    </div>
  );
}
