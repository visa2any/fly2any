'use client';

import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface BookingStatsProps {
  stats: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
}

export default function BookingStats({ stats }: BookingStatsProps) {
  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Upcoming Flights',
      value: stats.upcoming,
      icon: Clock,
      color: 'bg-orange-50 text-orange-600',
      borderColor: 'border-orange-200',
      highlight: stats.upcoming > 0,
    },
    {
      label: 'Completed Trips',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200',
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`bg-white rounded-xl shadow-md border-2 ${stat.borderColor} p-6 transition-all duration-300 hover:shadow-lg ${
            stat.highlight ? 'ring-2 ring-orange-400' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stat.value}
            </div>
          </div>
          <div className="text-sm font-semibold text-gray-700">
            {stat.label}
          </div>
          {stat.highlight && (
            <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 font-semibold">
              <TrendingUp className="w-3 h-3" />
              Action Required
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
