'use client';

/**
 * Price Monitor Statistics Widget
 * Compact dashboard widget showing key monitoring metrics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface MonitorStats {
  status: 'healthy' | 'degraded';
  statistics: {
    totalActiveAlerts: number;
    lastRun: string | null;
    nextScheduledRun: string | null;
    successRate: number;
    recentErrors: number;
  };
  lastExecution: {
    alertsChecked: number;
    alertsTriggered: number;
    alertsFailed: number;
    duration: number;
  } | null;
}

export function PriceMonitorStats() {
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();

    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/price-monitor/status');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Monitor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error || 'Failed to load stats'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Price Monitor</CardTitle>
          <Badge
            variant={stats.status === 'healthy' ? 'default' : 'destructive'}
            className={stats.status === 'healthy' ? 'bg-green-100 text-green-800 border-green-200' : ''}
          >
            {stats.status === 'healthy' ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            {stats.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-blue-600 mb-1">Active Alerts</div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.statistics.totalActiveAlerts}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xs text-green-600 mb-1">Success Rate</div>
            <div className="text-2xl font-bold text-green-900 flex items-center gap-1">
              {stats.statistics.successRate.toFixed(0)}%
              {stats.statistics.successRate >= 90 && (
                <TrendingUp className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>
        </div>

        {/* Last Execution */}
        {stats.lastExecution && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-2">Last Execution</div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Checked:</span>
              <span className="font-medium">{stats.lastExecution.alertsChecked}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Triggered:</span>
              <span className="font-medium text-green-600">
                {stats.lastExecution.alertsTriggered}
              </span>
            </div>
            {stats.lastExecution.alertsFailed > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Failed:</span>
                <span className="font-medium text-red-600">
                  {stats.lastExecution.alertsFailed}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Timing Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last Run:
            </span>
            <span className="font-medium">
              {formatTime(stats.statistics.lastRun)}
            </span>
          </div>
        </div>

        {/* Warnings */}
        {stats.statistics.recentErrors > 5 && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 text-yellow-800 rounded text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>{stats.statistics.recentErrors} recent errors</span>
          </div>
        )}

        {/* View Details Link */}
        <Link
          href="/admin/price-monitor"
          className="block text-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          View Details
        </Link>
      </CardContent>
    </Card>
  );
}
