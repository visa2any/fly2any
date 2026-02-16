'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, Calendar, Shield, CreditCard, ArrowRight,
  Sparkles, PartyPopper, ChevronRight, SkipForward, Loader2
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  cta: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'calendar',
    title: 'Set Up Your Calendar',
    description: 'Block unavailable dates and set custom pricing per night to maximize your revenue.',
    icon: Calendar,
    href: '/host/calendar',
    cta: 'Open Calendar',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'verification',
    title: 'Verify Your Identity',
    description: 'Build trust with guests by completing identity verification. Verified hosts get 3x more bookings.',
    icon: Shield,
    href: '/host/verification',
    cta: 'Start Verification',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'payouts',
    title: 'Set Up Payouts',
    description: 'Connect your bank account or payment method to receive earnings from bookings.',
    icon: CreditCard,
    href: '/host/payouts',
    cta: 'Add Payout Method',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
];

export default function PostPublishOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(true);

  // Hide confetti effect after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const allComplete = completedSteps.size === ONBOARDING_STEPS.length;
  const progress = (completedSteps.size / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#FDFDFD] relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-12 md:py-20">

        {/* Celebration Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              {showConfetti ? (
                <PartyPopper className="w-10 h-10 text-white animate-bounce" />
              ) : (
                <CheckCircle2 className="w-10 h-10 text-white" />
              )}
            </div>
            {showConfetti && (
              <div className="absolute inset-0 animate-ping opacity-20">
                <div className="w-20 h-20 rounded-3xl bg-emerald-400" />
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Your Listing is Live! 🎉
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            Amazing! Complete these steps to start receiving bookings and maximize your earnings.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-bold text-gray-900">Setup Progress</span>
            <span className="text-gray-500 font-medium">{completedSteps.size}/{ONBOARDING_STEPS.length} completed</span>
          </div>
          <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="space-y-4">
          {ONBOARDING_STEPS.map((step, idx) => {
            const isCompleted = completedSteps.has(step.id);
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-neutral-50 border-neutral-200 opacity-75'
                    : `bg-white ${step.borderColor} hover:shadow-lg hover:-translate-y-0.5`
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCompleted ? 'bg-emerald-100' : step.bgColor
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <StepIcon className={`w-6 h-6 ${step.color}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold text-lg ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {step.title}
                      </h3>
                      {idx === 0 && !isCompleted && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mb-3 ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
                      {step.description}
                    </p>

                    {!isCompleted && (
                      <div className="flex items-center gap-3">
                        <Link
                          href={step.href}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${step.bgColor} ${step.color} hover:opacity-80`}
                        >
                          {step.cta}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleStepComplete(step.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors"
                        >
                          Skip for now
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Step Number */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/host/dashboard"
            className={`w-full py-4 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 ${
              allComplete
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-gray-900 text-white hover:bg-black'
            }`}
          >
            {allComplete ? (
              <>
                <Sparkles className="w-5 h-5" />
                Go to Dashboard
              </>
            ) : (
              <>
                Go to Dashboard
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Link>

          {!allComplete && (
            <button
              onClick={() => router.push('/host/dashboard')}
              className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors flex items-center gap-1"
            >
              <SkipForward className="w-3.5 h-3.5" />
              I'll set these up later
            </button>
          )}
        </div>

        {/* Tip */}
        <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <p className="text-sm text-amber-800">
            <strong>💡 Pro Tip:</strong> Hosts who complete all setup steps within the first 24 hours receive <strong>40% more booking inquiries</strong> in their first week.
          </p>
        </div>
      </div>
    </div>
  );
}
