'use client';

import { Check } from 'lucide-react';
import {
  BookingFlowProgress,
  BOOKING_FLOW_STAGES_CONFIG
} from '@/types/booking-flow';

interface ProgressIndicatorProps {
  progress: BookingFlowProgress;
  compact?: boolean;
  className?: string;
}

/**
 * Progress Indicator for E2E Booking Flow
 *
 * Shows current step and overall progress in booking journey
 * Designed to be compact and non-intrusive in chat interface
 */
export function ProgressIndicator({
  progress,
  compact = false,
  className = '',
}: ProgressIndicatorProps) {
  const config = BOOKING_FLOW_STAGES_CONFIG[progress.currentStage];
  const progressPercent = (progress.currentStepNumber / progress.totalStages) * 100;

  if (compact) {
    return (
      <div className={`bg-primary-50 border border-primary-200 rounded-lg p-2 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold text-primary-900">
            {config.icon} {config.label}
          </span>
          <span className="text-[10px] text-primary-700">
            Step {progress.currentStepNumber} of {progress.totalStages}
          </span>
        </div>
        <div className="mt-1.5 w-full bg-primary-100 rounded-full h-1">
          <div
            className="bg-primary-600 h-1 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-3 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <span className="text-lg">{config.icon}</span>
            {config.label}
          </h3>
          <p className="text-[10px] text-gray-600 mt-0.5">
            Step {progress.currentStepNumber} of {progress.totalStages}
          </p>
        </div>
        <div className="text-xs font-semibold text-primary-600">
          {Math.round(progressPercent)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Micro Steps (Optional - shows individual steps) */}
      <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1">
        {Object.entries(BOOKING_FLOW_STAGES_CONFIG).map(([stage, stageConfig], index) => {
          const isCompleted = progress.completedStages.includes(stage as any);
          const isCurrent = progress.currentStage === stage;
          const stepNumber = index + 1;

          return (
            <div
              key={stage}
              className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all
                ${isCompleted
                  ? 'bg-primary-600 text-white'
                  : isCurrent
                    ? 'bg-primary-500 text-white ring-2 ring-primary-200 ring-offset-1'
                    : 'bg-gray-200 text-gray-500'
                }
              `}
              title={stageConfig.label}
            >
              {isCompleted ? (
                <Check className="w-3 h-3" />
              ) : (
                <span>{stepNumber}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Mini Progress Indicator - Ultra compact for chat bubbles
 */
export function MiniProgressIndicator({
  currentStep,
  totalSteps,
  label,
}: {
  currentStep: number;
  totalSteps: number;
  label: string;
}) {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-2 py-1">
      <div className="w-12 bg-gray-200 rounded-full h-1">
        <div
          className="bg-primary-600 h-1 rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span className="text-[9px] font-semibold text-gray-700 whitespace-nowrap">
        {currentStep}/{totalSteps} {label}
      </span>
    </div>
  );
}
