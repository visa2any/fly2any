'use client';

import { useState, useEffect } from 'react';

interface Activity {
  id: number;
  user: string;
  location: string;
  destination: string;
  action: 'booked' | 'saved';
  time: string;
  amount?: number;
}

// Simulated live activities (in production, this would come from real API)
const activities: Activity[] = [
  { id: 1, user: 'Sarah M.', location: 'New York', destination: 'Paris', action: 'booked', time: '2 min ago', amount: 589 },
  { id: 2, user: 'John D.', location: 'Los Angeles', destination: 'Tokyo', action: 'booked', time: '5 min ago', amount: 799 },
  { id: 3, user: 'Maria S.', location: 'Miami', destination: 'Barcelona', action: 'saved', time: '8 min ago' },
  { id: 4, user: 'Alex K.', location: 'Chicago', destination: 'London', action: 'booked', time: '12 min ago', amount: 459 },
  { id: 5, user: 'Emma W.', location: 'Seattle', destination: 'Dubai', action: 'booked', time: '15 min ago', amount: 699 },
  { id: 6, user: 'Chris P.', location: 'Boston', destination: 'Rome', action: 'saved', time: '18 min ago' },
];

export function LiveActivityFeed() {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentActivity((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 300);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const activity = activities[currentActivity];

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-sm border-l-4 border-success flex items-start gap-3 hover:scale-105 transition-transform duration-300">
        {/* User Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold">
          {activity.user.charAt(0)}
        </div>

        {/* Activity Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 text-sm">
              {activity.user}
            </span>
            <span className="text-xs text-gray-500">from {activity.location}</span>
          </div>

          <div className="text-sm text-gray-700">
            {activity.action === 'booked' ? (
              <>
                <span className="text-success font-medium">✓ Booked</span> a trip to{' '}
                <span className="font-semibold">{activity.destination}</span>
                {activity.amount && (
                  <span className="text-gray-600"> for ${activity.amount}</span>
                )}
              </>
            ) : (
              <>
                <span className="text-primary-600 font-medium">💾 Saved</span> a trip to{' '}
                <span className="font-semibold">{activity.destination}</span>
              </>
            )}
          </div>

          <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
    </div>
  );
}
