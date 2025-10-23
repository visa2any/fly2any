'use client';

import { useState, useEffect } from 'react';

interface ActivityItem {
  id: string;
  name: string;
  location: string;
  action: string;
  timestamp: Date;
  route?: string;
}

interface LiveActivityFeedProps {
  className?: string;
  maxItems?: number;
  variant?: 'sidebar' | 'popup'; // sidebar = compact widget, popup = floating notification
}

// Simulated activity data - in production, this would come from real-time API
const generateActivity = (): ActivityItem => {
  const names = [
    'Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'James',
    'Maria', 'Robert', 'Linda', 'John', 'Patricia', 'William'
  ];

  const locations = [
    'NYC', 'LA', 'Chicago', 'Miami', 'Boston', 'Seattle',
    'Austin', 'Denver', 'Phoenix', 'Portland', 'Atlanta', 'Dallas'
  ];

  const actions = [
    'just booked this flight',
    'is viewing this deal',
    'saved this to favorites',
    'compared prices for this route'
  ];

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: names[Math.floor(Math.random() * names.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    timestamp: new Date()
  };
};

export default function LiveActivityFeed({
  className = '',
  maxItems = 5,
  variant = 'sidebar'
}: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([
    generateActivity()
  ]);

  useEffect(() => {
    // Add new activity every 8-15 seconds
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities((prev) => [newActivity, ...prev].slice(0, maxItems));
    }, Math.random() * 7000 + 8000);

    return () => clearInterval(interval);
  }, [maxItems]);

  const formatTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 120) return '1 minute ago';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  if (variant === 'popup') {
    const latestActivity = activities[0];
    return (
      <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${className}`}>
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-lg max-w-xs animate-slideIn">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 animate-pulse"></div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600">
                <span className="font-semibold text-gray-900">{latestActivity.name}</span> from {latestActivity.location} {latestActivity.action}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                {formatTimeAgo(latestActivity.timestamp)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-xs font-semibold text-gray-900">Live Activity</h3>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`px-3 py-2.5 transition-all duration-300 ${
              index === 0 ? 'bg-blue-50/50' : 'hover:bg-gray-50'
            }`}
            style={{
              animation: index === 0 ? 'slideIn 300ms ease-out' : 'none'
            }}
          >
            <div className="text-xs text-gray-700">
              <span className="font-semibold text-gray-900">{activity.name}</span>
              {' '}from{' '}
              <span className="font-medium text-blue-600">{activity.location}</span>
              {' '}{activity.action}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-gray-500">
                {formatTimeAgo(activity.timestamp)}
              </span>
              {activity.action.includes('booked') && (
                <span className="text-[10px] text-green-600 font-medium">
                  • Confirmed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
