/**
 * Live Activity Feed Component
 *
 * Real-time social proof showing platform activity:
 * - Recent trip creations
 * - New members joining
 * - Credits earned
 * - Reviews posted
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  DollarSign,
  MapPin,
  Star,
  TrendingUp,
  Sparkles,
  Clock,
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'trip_created' | 'member_joined' | 'credits_earned' | 'review_posted';
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  metadata?: {
    tripTitle?: string;
    destination?: string;
    credits?: number;
    rating?: number;
  };
}

interface LiveActivityFeedProps {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export default function LiveActivityFeed({
  limit = 10,
  autoRefresh = true,
  refreshInterval = 10000, // 10 seconds
}: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/tripmatch/activity?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    if (autoRefresh) {
      const interval = setInterval(fetchActivities, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [limit, autoRefresh, refreshInterval]);

  // Rotate through activities
  useEffect(() => {
    if (activities.length === 0) return;

    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % activities.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [activities.length]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'trip_created':
        return <MapPin className="w-4 h-4 text-purple-600" />;
      case 'member_joined':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'credits_earned':
        return <DollarSign className="w-4 h-4 text-yellow-600" />;
      case 'review_posted':
        return <Star className="w-4 h-4 text-orange-600 fill-orange-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  if (activities.length === 0) {
    return null;
  }

  const currentActivity = activities[currentActivityIndex];

  return (
    <div className="space-y-3">
      {/* Rotating Single Activity */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentActivity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-purple-300 transition-colors"
        >
          {/* User Avatar */}
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
            {currentActivity.userName.charAt(0)}
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getActivityIcon(currentActivity.type)}
              <p className="text-sm text-gray-900 truncate">
                <span className="font-semibold">{currentActivity.userName}</span>{' '}
                {currentActivity.content}
              </p>
            </div>
            {currentActivity.metadata && (
              <p className="text-xs text-gray-600 mt-1">
                {currentActivity.metadata.tripTitle && (
                  <span>{currentActivity.metadata.tripTitle}</span>
                )}
                {currentActivity.metadata.destination && (
                  <span> → {currentActivity.metadata.destination}</span>
                )}
                {currentActivity.metadata.credits && (
                  <span className="text-yellow-600 font-semibold">
                    {' '}
                    +{currentActivity.metadata.credits} credits
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex-shrink-0 text-xs text-gray-500">
            {formatTimestamp(currentActivity.timestamp)}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Activity Counter */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <TrendingUp className="w-3 h-3" />
        <span>{activities.length} recent activities</span>
        <div className="flex gap-1">
          {activities.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentActivityIndex % activities.length
                  ? 'bg-purple-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
