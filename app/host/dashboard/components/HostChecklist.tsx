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

      {/* Items — horizontal single row */}
      {!isCollapsed && (
        <div className="border-t border-neutral-100 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CHECKLIST.map((item) => {
              const isComplete = completedIds.has(item.id);
              const ItemIcon = item.icon;

              return isComplete ? (
                <div
                  key={item.id}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 opacity-60"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1.5" />
                  <p className="text-xs font-semibold text-gray-400 line-through">{item.title}</p>
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:shadow-sm hover:-translate-y-0.5 transition-all group`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${item.bgColor}`}>
                    <ItemIcon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 mb-0.5 leading-tight">{item.title}</p>
                  <span className={`text-[10px] font-bold ${item.color} flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Setup <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
