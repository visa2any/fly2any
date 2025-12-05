'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Clock, AlertCircle, Check } from 'lucide-react';

interface AIUsageStats {
  dailyCount: number;
  dailyLimit: number;
  dailyRemaining: number;
  minuteCount: number;
  minuteLimit: number;
  percentUsed: number;
  resetTime: string;
}

interface AIUsageDashboardProps {
  compact?: boolean;
  onClose?: () => void;
}

export function AIUsageDashboard({ compact = false, onClose }: AIUsageDashboardProps) {
  const [stats, setStats] = useState<AIUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/ai/chat');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        setError('Failed to load AI usage stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`${compact ? 'p-2' : 'p-4'} bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`${compact ? 'p-2' : 'p-4'} bg-red-50 dark:bg-red-900/20 rounded-lg`}>
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error || 'Unable to load stats'}</span>
        </div>
      </div>
    );
  }

  const percentRemaining = 100 - stats.percentUsed;
  const isLow = stats.percentUsed >= 80;
  const isCritical = stats.percentUsed >= 95;

  // Format reset time
  const resetTime = new Date(stats.resetTime);
  const hoursUntilReset = Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60 * 60)));

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <Brain className="w-3 h-3" />
        <span>AI: {stats.dailyRemaining.toLocaleString()} calls left</span>
        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isCritical
                ? 'bg-red-500'
                : isLow
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${percentRemaining}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-500" />
          AI Usage (Free Tier)
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            &times;
          </button>
        )}
      </div>

      {/* Daily Usage */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Daily Requests</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {stats.dailyCount.toLocaleString()} / {stats.dailyLimit.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCritical
                ? 'bg-red-500'
                : isLow
                ? 'bg-yellow-500'
                : 'bg-gradient-to-r from-green-400 to-green-500'
            }`}
            style={{ width: `${stats.percentUsed}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${isCritical ? 'text-red-500' : isLow ? 'text-yellow-600' : 'text-green-600'}`}>
            {stats.dailyRemaining.toLocaleString()} remaining
          </span>
          <span className="text-xs text-gray-500">
            {stats.percentUsed}% used
          </span>
        </div>
      </div>

      {/* Minute Rate */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">This Minute</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {stats.minuteCount} / {stats.minuteLimit}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              stats.minuteCount >= 25 ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(stats.minuteCount / stats.minuteLimit) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            Efficiency
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            90%+ NLP
          </div>
          <div className="text-xs text-gray-500">Local processing</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
            <Clock className="w-3 h-3" />
            Reset In
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {hoursUntilReset}h
          </div>
          <div className="text-xs text-gray-500">Daily reset</div>
        </div>
      </div>

      {/* Status Message */}
      <div className={`mt-4 p-3 rounded-lg ${
        isCritical
          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          : isLow
          ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
      }`}>
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertCircle className="w-4 h-4" />
          ) : isLow ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isCritical
              ? 'Critical: AI calls nearly exhausted'
              : isLow
              ? 'Warning: Approaching daily limit'
              : 'Healthy: Plenty of AI calls available'}
          </span>
        </div>
      </div>

      {/* Groq Branding */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Powered by Groq + Llama 3.1 70B
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline usage indicator
 */
export function AIUsageIndicator() {
  return <AIUsageDashboard compact />;
}
