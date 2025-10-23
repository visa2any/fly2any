'use client';

import { Check } from 'lucide-react';

interface BookingProgressIndicatorProps {
  currentStep: number; // 1, 2, or 3
  steps?: string[];
  className?: string;
  variant?: 'default' | 'compact';
}

export default function BookingProgressIndicator({
  currentStep,
  steps = ['Select Flight', 'Passenger Details', 'Payment'],
  className = '',
  variant = 'default'
}: BookingProgressIndicatorProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {steps.map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : stepNumber}
              </div>
              {stepNumber < steps.length && (
                <div
                  className={`w-8 h-0.5 mx-0.5 transition-colors ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-md'
                      : isCurrent
                      ? 'bg-primary-600 text-white shadow-lg ring-4 ring-primary-100'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <span
                  className={`mt-2 text-[10px] font-medium whitespace-nowrap ${
                    isCurrent
                      ? 'text-primary-700'
                      : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </div>

              {stepNumber < steps.length && (
                <div
                  className={`w-16 h-1 mx-2 rounded-full transition-all duration-200 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress percentage */}
      <div className="text-center">
        <div className="text-xs text-gray-600">
          Step {currentStep} of {steps.length}
          <span className="ml-2 text-[10px] text-gray-500">
            ({Math.round((currentStep / steps.length) * 100)}% complete)
          </span>
        </div>
      </div>
    </div>
  );
}
