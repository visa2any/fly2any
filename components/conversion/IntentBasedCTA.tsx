'use client';

import { useEffect, useState } from 'react';
import { useIntentTracking, getIntentRecommendations } from '@/lib/hooks/useIntentTracking';
import { Bell, Zap, Users, Shield, Clock } from 'lucide-react';
import type { IntentScore } from '@/lib/ai/intent-scorer';

interface IntentBasedCTAProps {
  className?: string;
  variant?: 'inline' | 'floating' | 'banner';
}

export default function IntentBasedCTA({
  className = '',
  variant = 'inline',
}: IntentBasedCTAProps) {
  const [score, setScore] = useState<IntentScore | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const { getScore } = useIntentTracking({
    onScoreChange: setScore,
    trackingInterval: 15000,
  });

  useEffect(() => {
    setScore(getScore());
  }, [getScore]);

  if (dismissed || !score) return null;

  const recs = getIntentRecommendations(score);

  // Don't show for cold leads
  if (score.level === 'cold') return null;

  const content = getContentForIntent(score);

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-4 right-4 z-40 max-w-sm animate-slideUp ${className}`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className={`p-4 ${content.bgColor}`}>
            <div className="flex items-start gap-3">
              <content.icon className={`w-6 h-6 ${content.iconColor} flex-shrink-0`} />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">{content.title}</h4>
                <p className="text-xs text-gray-600 mt-0.5">{content.message}</p>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            {content.cta && (
              <button className={`w-full mt-3 py-2 text-sm font-medium rounded-lg ${content.ctaStyle}`}>
                {content.cta}
              </button>
            )}
          </div>
        </div>
        <style jsx>{`
          @keyframes slideUp {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideUp { animation: slideUp 0.3s ease-out; }
        `}</style>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r ${content.gradient} text-white py-2 px-4 ${className}`}>
        <div className="flex items-center justify-center gap-2 text-sm">
          <content.icon className="w-4 h-4" />
          <span className="font-medium">{content.bannerText}</span>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={`p-4 rounded-xl border ${content.borderColor} ${content.bgColor} ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${content.iconBg}`}>
          <content.icon className={`w-5 h-5 ${content.iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">{content.title}</p>
          <p className="text-xs text-gray-500">{content.message}</p>
        </div>
        {content.cta && (
          <button className={`px-4 py-2 text-sm font-medium rounded-lg ${content.ctaStyle}`}>
            {content.cta}
          </button>
        )}
      </div>
    </div>
  );
}

function getContentForIntent(score: IntentScore) {
  switch (score.level) {
    case 'ready':
      return {
        icon: Zap,
        title: 'Ready to Book?',
        message: 'Complete your booking now and lock in this price',
        bannerText: 'Complete your booking now – prices may change!',
        cta: 'Book Now',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        ctaStyle: 'bg-green-600 text-white hover:bg-green-700',
        gradient: 'from-green-500 to-emerald-600',
      };

    case 'hot':
      return {
        icon: Clock,
        title: 'Prices May Change',
        message: 'Lock in your rate with a price alert',
        bannerText: '23 people booked this route today',
        cta: 'Create Alert',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        ctaStyle: 'bg-amber-600 text-white hover:bg-amber-700',
        gradient: 'from-amber-500 to-orange-600',
      };

    case 'warm':
      return {
        icon: Bell,
        title: 'Track This Price',
        message: 'Get notified when prices drop',
        bannerText: 'Save up to 30% with price alerts',
        cta: 'Set Alert',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700',
        gradient: 'from-blue-500 to-indigo-600',
      };

    default:
      return {
        icon: Shield,
        title: 'Best Price Guarantee',
        message: 'We match any lower price you find',
        bannerText: 'Fly2Any Best Price Guarantee',
        cta: undefined,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        ctaStyle: '',
        gradient: 'from-gray-500 to-gray-600',
      };
  }
}
