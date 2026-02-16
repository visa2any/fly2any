'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Shield, CreditCard, CheckCircle2,
  ArrowRight, Rocket, ChevronDown, ChevronUp
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  bgColor: string;
}

const CHECKLIST: ChecklistItem[] = [
  {
    id: 'listing',
    title: 'Create your first listing',
    description: 'Add your property details, photos, and pricing.',
    icon: Rocket,
    href: '/list-your-property/create',
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
  },
  {
    id: 'calendar',
    title: 'Set up your calendar',
    description: 'Block dates and set custom pricing.',
    icon: Calendar,
    href: '/host/calendar',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'verification',
    title: 'Verify your identity',
    description: 'Build trust — verified hosts get 3x more bookings.',
    icon: Shield,
    href: '/host/verification',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 'payouts',
    title: 'Set up payouts',
    description: 'Connect your bank to receive earnings.',
    icon: CreditCard,
    href: '/host/payouts',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
];

interface HostChecklistProps {
  hasProperties: boolean;
  isVerified: boolean;
  hasCalendarSetup: boolean;
  hasPayoutMethod: boolean;
}

export function HostChecklist({ hasProperties, isVerified, hasCalendarSetup, hasPayoutMethod }: HostChecklistProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Determine completion status
  const completedIds = new Set<string>();
  if (hasProperties) completedIds.add('listing');
  if (isVerified) completedIds.add('verification');
  if (hasCalendarSetup) completedIds.add('calendar');
  if (hasPayoutMethod) completedIds.add('payouts');

  const completedCount = completedIds.size;
  const totalCount = CHECKLIST.length;
  const progress = (completedCount / totalCount) * 100;
  const allComplete = completedCount === totalCount;

  // Don't show if all complete
  if (allComplete) return null;

  return (
    <div className="mb-8 rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-5 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">Complete Your Host Setup</h3>
            <p className="text-xs text-gray-500">{completedCount} of {totalCount} steps completed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini progress */}
          <div className="hidden md:flex w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="hidden md:inline text-xs font-bold text-primary-600">{Math.round(progress)}%</span>
          {isCollapsed ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {/* Items */}
      {!isCollapsed && (
        <div className="border-t border-neutral-100 divide-y divide-neutral-100">
          {CHECKLIST.map((item) => {
            const isComplete = completedIds.has(item.id);
            const ItemIcon = item.icon;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                  isComplete ? 'opacity-60' : 'hover:bg-neutral-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isComplete ? 'bg-emerald-100' : item.bgColor
                }`}>
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ItemIcon className={`w-4 h-4 ${item.color}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isComplete ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
                {!isComplete && (
                  <Link
                    href={item.href}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${item.bgColor} ${item.color} hover:opacity-80`}
                  >
                    Setup <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
