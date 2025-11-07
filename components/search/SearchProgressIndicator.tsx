'use client';

import React, { useEffect, useState } from 'react';
import {
  Loader2,
  Check,
  Circle,
  Clock,
  Plane,
  Hotel,
  Car,
  Search,
  Sparkles
} from 'lucide-react';

interface SearchProgressStep {
  label: string;
  complete: boolean;
  current?: boolean;
  progress?: number;
}

interface SearchProgressProps {
  status: 'searching' | 'analyzing' | 'presenting' | 'complete';
  steps: SearchProgressStep[];
  foundCount?: number;
  estimatedTime?: number; // seconds
  searchType?: 'flights' | 'hotels' | 'cars';
}

export default function SearchProgressIndicator({
  status,
  steps,
  foundCount = 0,
  estimatedTime,
  searchType = 'flights'
}: SearchProgressProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  // Animate the found count
  useEffect(() => {
    if (foundCount > displayCount) {
      const increment = Math.ceil((foundCount - displayCount) / 10);
      const timer = setTimeout(() => {
        setDisplayCount(prev => Math.min(prev + increment, foundCount));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [foundCount, displayCount]);

  // Calculate overall progress
  useEffect(() => {
    const completedSteps = steps.filter(s => s.complete).length;
    const currentStep = steps.find(s => s.current);
    const currentStepProgress = currentStep?.progress || 0;

    const baseProgress = (completedSteps / steps.length) * 100;
    const currentStepContribution = (currentStepProgress / steps.length);

    const newProgress = Math.min(Math.round(baseProgress + currentStepContribution), 100);
    setOverallProgress(newProgress);
  }, [steps]);

  // Get icon based on search type
  const getSearchTypeIcon = () => {
    switch (searchType) {
      case 'flights':
        return <Plane className="w-5 h-5" />;
      case 'hotels':
        return <Hotel className="w-5 h-5" />;
      case 'cars':
        return <Car className="w-5 h-5" />;
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  // Get search type text
  const getSearchTypeText = () => {
    switch (searchType) {
      case 'flights':
        return 'flights';
      case 'hotels':
        return 'hotels';
      case 'cars':
        return 'rental cars';
      default:
        return 'results';
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'searching':
        return 'text-blue-600';
      case 'analyzing':
        return 'text-purple-600';
      case 'presenting':
        return 'text-indigo-600';
      case 'complete':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get progress bar color
  const getProgressBarColor = () => {
    switch (status) {
      case 'searching':
        return 'bg-blue-500';
      case 'analyzing':
        return 'bg-purple-500';
      case 'presenting':
        return 'bg-indigo-500';
      case 'complete':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format estimated time
  const formatEstimatedTime = (seconds?: number) => {
    if (!seconds) return null;
    if (seconds < 60) return `About ${seconds} seconds`;
    const minutes = Math.ceil(seconds / 60);
    return `About ${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Header with icon and status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${getStatusColor()}`}>
            {getSearchTypeIcon()}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${getStatusColor()}`}>
              {status === 'searching' && 'Searching for best deals...'}
              {status === 'analyzing' && 'Analyzing results...'}
              {status === 'presenting' && 'Preparing your options...'}
              {status === 'complete' && 'Search complete!'}
            </h3>
            <p className="text-sm text-gray-600">
              {status !== 'complete' && estimatedTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatEstimatedTime(estimatedTime)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Results counter */}
        {foundCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <Sparkles className="w-4 h-4 text-green-600" />
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">
                {displayCount}
              </div>
              <div className="text-xs text-green-600">
                {getSearchTypeText()} found
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {overallProgress}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor()} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${overallProgress}%` }}
            role="progressbar"
            aria-valuenow={overallProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Step-by-step status */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
              step.current
                ? 'bg-blue-50 border border-blue-200'
                : step.complete
                ? 'bg-green-50 border border-green-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            {/* Step icon */}
            <div className="flex-shrink-0">
              {step.complete ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : step.current ? (
                <div className="w-6 h-6 text-blue-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="w-6 h-6 text-gray-400">
                  <Circle className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Step label and progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    step.complete
                      ? 'text-green-700'
                      : step.current
                      ? 'text-blue-700'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
                {step.current && step.progress !== undefined && (
                  <span className="text-xs font-semibold text-blue-600">
                    {step.progress}%
                  </span>
                )}
              </div>

              {/* Individual step progress bar */}
              {step.current && step.progress !== undefined && (
                <div className="mt-2 w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {status === 'searching' && `Searching for ${getSearchTypeText()}`}
        {status === 'analyzing' && 'Analyzing search results'}
        {status === 'presenting' && 'Preparing your options'}
        {status === 'complete' && `Search complete. Found ${foundCount} ${getSearchTypeText()}`}
      </div>

      {/* Completion message */}
      {status === 'complete' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-5 h-5" />
            <span className="font-semibold">
              Search completed successfully! Found {foundCount} {getSearchTypeText()}.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the types for use in other files
export type { SearchProgressProps, SearchProgressStep };
