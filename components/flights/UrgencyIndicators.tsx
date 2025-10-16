'use client';

import { AlertCircle, Clock, TrendingUp, Users } from 'lucide-react';

interface UrgencyIndicatorsProps {
  seatsLeft?: number;
  viewedRecently?: number;
  priceChangeProbability?: 'high' | 'medium' | 'low';
  isPopular?: boolean;
}

export default function UrgencyIndicators({
  seatsLeft,
  viewedRecently,
  priceChangeProbability,
  isPopular,
}: UrgencyIndicatorsProps) {
  const badges = [];

  // Seat scarcity
  if (seatsLeft && seatsLeft <= 5) {
    badges.push({
      icon: AlertCircle,
      text: `Only ${seatsLeft} seats left!`,
      color: 'bg-red-100 text-red-700 border-red-300',
      priority: 1,
    });
  } else if (seatsLeft && seatsLeft <= 9) {
    badges.push({
      icon: AlertCircle,
      text: `Only ${seatsLeft} seats left`,
      color: 'bg-orange-100 text-orange-700 border-orange-300',
      priority: 2,
    });
  }

  // Price increase warning
  if (priceChangeProbability === 'high') {
    badges.push({
      icon: TrendingUp,
      text: 'Price likely to increase',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      priority: 2,
    });
  }

  // Social proof
  if (viewedRecently && viewedRecently > 20) {
    badges.push({
      icon: Users,
      text: `${viewedRecently} people viewing`,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      priority: 3,
    });
  }

  // Popular badge
  if (isPopular) {
    badges.push({
      icon: Clock,
      text: 'Popular choice',
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      priority: 3,
    });
  }

  if (badges.length === 0) return null;

  // Sort by priority and take top 2
  const displayBadges = badges.sort((a, b) => a.priority - b.priority).slice(0, 2);

  return (
    <div className="flex flex-wrap gap-2">
      {displayBadges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.color} animate-pulse-subtle`}
          >
            <Icon className="h-3.5 w-3.5" />
            {badge.text}
          </div>
        );
      })}
    </div>
  );
}
