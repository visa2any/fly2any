'use client';

import { memo } from 'react';
import { Check } from 'lucide-react';

interface BookingStepsProps {
  currentStep: number;
  totalSteps?: number;
  accentColor?: 'orange' | 'purple';
  labels?: string[];
}

export const BookingSteps = memo(({
  currentStep,
  totalSteps = 3,
  accentColor = 'orange',
  labels = ['Details', 'Payment', 'Confirmation']
}: BookingStepsProps) => {
  const accent = accentColor === 'purple' ? 'purple' : 'orange';
  const bgActive = accent === 'purple' ? 'bg-purple-600' : 'bg-orange-600';
  const bgComplete = accent === 'purple' ? 'bg-purple-500' : 'bg-orange-500';
  const ringColor = accent === 'purple' ? 'ring-purple-200' : 'ring-orange-200';

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isComplete = currentStep > stepNum;
        const isActive = currentStep === stepNum;

        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                ${isComplete ? `${bgComplete} text-white` : ''}
                ${isActive ? `${bgActive} text-white ring-4 ${ringColor} scale-110` : ''}
                ${!isComplete && !isActive ? 'bg-gray-100 text-gray-400' : ''}
              `}>
                {isComplete ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`text-xs mt-1.5 font-medium transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {labels[i] || `Step ${stepNum}`}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div className={`w-12 h-0.5 mx-2 mt-[-16px] transition-colors ${isComplete ? bgComplete : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
});

BookingSteps.displayName = 'BookingSteps';

// Shared form field styles
export const inputStyles = {
  base: 'w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all',
  orange: 'focus:ring-orange-500',
  purple: 'focus:ring-purple-500',
};

export const labelStyles = 'block text-sm font-semibold text-gray-700 mb-1.5';

export const buttonStyles = {
  primary: {
    orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
  },
  base: 'w-full py-3.5 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2',
};
