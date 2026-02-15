'use client';

import { Check } from 'lucide-react';

interface WizardProgressBarProps {
  currentStep: string;
  steps: { id: string; label: string }[];
}

export function WizardProgressBar({ currentStep, steps }: WizardProgressBarProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-neutral-100">
      <div 
        className="h-full bg-primary-600 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
