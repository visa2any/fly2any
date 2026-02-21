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

  if (allComplete) return null;

  return (
    <div className="mb-8 rounded-[2rem] border border-neutral-100 bg-white shadow-soft transition-all duration-300 group hover:shadow-soft-lg">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-neutral-50/50 transition-colors rounded-[2rem]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-inner">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-extrabold text-midnight-navy text-lg sm:text-xl tracking-tight">Complete Your Host Setup</h3>
            <p className="text-sm text-neutral-400 font-medium mt-0.5">{completedCount} of {totalCount} steps completed</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Mini progress */}
          <div className="hidden md:flex w-32 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(231,64,53,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="hidden md:inline font-black text-primary-500">{Math.round(progress)}%</span>
          <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100 ml-2 group-hover:border-neutral-200 transition-colors">
            {isCollapsed ? <ChevronDown className="w-4 h-4 text-neutral-500" /> : <ChevronUp className="w-4 h-4 text-neutral-500" />}
          </div>
        </div>
      </button>

      {/* Items — horizontal single row */}
      {!isCollapsed && (
        <div className="border-t border-neutral-100 p-6 sm:p-8 bg-neutral-50/30 rounded-b-[2rem]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CHECKLIST.map((item) => {
              const isComplete = completedIds.has(item.id);
              const ItemIcon = item.icon;

              return isComplete ? (
                <div
                  key={item.id}
                  className="flex flex-col items-center justify-center text-center p-4 rounded-3xl bg-success-50/50 border border-success-100 opacity-70"
                >
                  <CheckCircle2 className="w-6 h-6 text-success-500 mb-2" />
                  <p className="text-sm font-bold text-neutral-400 line-through decoration-neutral-300">{item.title}</p>
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex flex-col items-center text-center p-4 rounded-3xl border border-neutral-200 bg-white hover:border-neutral-300 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${item.bgColor} border border-transparent group-hover:scale-110 transition-transform`}>
                    <ItemIcon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <p className="text-sm font-bold text-midnight-navy mb-1 leading-tight">{item.title}</p>
                  <span className={`text-xs font-black ${item.color} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-auto`}>
                    Setup <ArrowRight className="w-3 h-3" />
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
