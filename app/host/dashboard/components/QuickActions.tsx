import Link from 'next/link';
import { Plus, Calendar, Rocket, Star, DollarSign, Shield } from 'lucide-react';

const ACTIONS = [
  {
    label: 'Add Property',
    href: '/list-your-property/create',
    icon: Plus,
    color: 'text-primary-600',
    bg: 'bg-primary-50 hover:bg-primary-100 border-primary-100',
  },
  {
    label: 'Fast Track AI',
    href: '/list-your-property/create?fast=true',
    icon: Rocket,
    color: 'text-violet-600',
    bg: 'bg-violet-50 hover:bg-violet-100 border-violet-100',
  },
  {
    label: 'Calendar',
    href: '/host/calendar',
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-50 hover:bg-blue-100 border-blue-100',
  },
  {
    label: 'Pricing',
    href: '/host/properties',
    icon: DollarSign,
    color: 'text-amber-600',
    bg: 'bg-amber-50 hover:bg-amber-100 border-amber-100',
  },
  {
    label: 'Verification',
    href: '/host/verification',
    icon: Shield,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100',
  },
];

export function QuickActions() {
  return (
    <div className="bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm ${action.bg} ${action.color}`}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
