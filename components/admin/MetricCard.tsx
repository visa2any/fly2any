'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  subValue?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  href?: string;
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    border: 'border-blue-200',
    text: 'text-blue-700',
    hover: 'hover:border-blue-300',
  },
  green: {
    bg: 'from-green-500 to-green-600',
    border: 'border-green-200',
    text: 'text-green-700',
    hover: 'hover:border-green-300',
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    border: 'border-purple-200',
    text: 'text-purple-700',
    hover: 'hover:border-purple-300',
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    border: 'border-orange-200',
    text: 'text-orange-700',
    hover: 'hover:border-orange-300',
  },
  red: {
    bg: 'from-red-500 to-red-600',
    border: 'border-red-200',
    text: 'text-red-700',
    hover: 'hover:border-red-300',
  },
  gray: {
    bg: 'from-gray-500 to-gray-600',
    border: 'border-gray-200',
    text: 'text-gray-700',
    hover: 'hover:border-gray-300',
  },
};

export default function MetricCard({
  icon,
  label,
  value,
  change,
  subValue,
  color = 'blue',
  href,
  loading = false,
}: MetricCardProps) {
  const colors = colorClasses[color];

  const content = (
    <div
      className={`relative overflow-hidden bg-white rounded-xl border ${colors.border} ${
        href ? colors.hover : ''
      } shadow-sm hover:shadow-md transition-all p-6 ${href ? 'cursor-pointer' : ''}`}
    >
      {loading ? (
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="rounded-lg bg-gray-200 w-12 h-12" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-28" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-4">
            <div className={`rounded-lg bg-gradient-to-br ${colors.bg} p-3 shadow-md text-white`}>
              {icon}
            </div>
            {change !== undefined && (
              <div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(change).toFixed(1)}%
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
            {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
          </div>
        </>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="group block">
      {content}
    </Link>
  ) : (
    content
  );
}
