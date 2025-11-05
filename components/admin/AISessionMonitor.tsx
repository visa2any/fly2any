/**
 * AI Session Monitor Component
 *
 * Admin dashboard for monitoring AI session analytics:
 * - Total sessions
 * - Authenticated vs anonymous
 * - Conversation metrics
 * - Engagement trends
 *
 * @example
 * ```tsx
 * <AISessionMonitor />
 * ```
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Users, MessageSquare, TrendingUp, Shield } from 'lucide-react';

interface SessionStats {
  totalSessions: number;
  authenticatedSessions: number;
  anonymousSessions: number;
  anonymizedSessions: number;
  activeSessions24h: number;
  totalConversations: number;
  averageConversationsPerSession: string;
}

export function AISessionMonitor() {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/session');

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data.stats);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('[AISessionMonitor] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/session?cleanup=true');

      if (!response.ok) {
        throw new Error(`Failed to cleanup: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to cleanup');
      }

      // Refresh stats after cleanup
      await fetchStats();

      alert(`Cleanup completed! Total sessions: ${data.totalSessions}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('[AISessionMonitor] Cleanup error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Session Analytics</CardTitle>
          <CardDescription>Loading session data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Session Analytics</CardTitle>
          <CardDescription>Error loading session data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
            <Button
              onClick={fetchStats}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const authRate = stats.totalSessions > 0
    ? ((stats.authenticatedSessions / stats.totalSessions) * 100).toFixed(1)
    : '0';

  const activeRate = stats.totalSessions > 0
    ? ((stats.activeSessions24h / stats.totalSessions) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Session Analytics</h2>
          <p className="text-sm text-gray-600">
            Real-time monitoring of AI chat sessions
            {lastUpdated && (
              <span className="ml-2">
                (Updated: {lastUpdated.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCleanup}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            Clean Up Old Sessions
          </Button>
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-gray-600">
              {stats.activeSessions24h} active (24h)
            </p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${activeRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Authenticated Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authenticated</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.authenticatedSessions}</div>
            <p className="text-xs text-gray-600">
              {authRate}% auth rate
            </p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${authRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Anonymous Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anonymous</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.anonymousSessions}</div>
            <p className="text-xs text-gray-600">
              {stats.anonymizedSessions} anonymized
            </p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-orange-500"
                style={{ width: `${100 - Number(authRate)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Total Conversations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-gray-600">
              {stats.averageConversationsPerSession} avg per session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Insights</CardTitle>
          <CardDescription>
            User engagement patterns and conversion opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Conversion Rate */}
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Conversion Rate</span>
                <span className="text-gray-600">{authRate}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                  style={{ width: `${authRate}%` }}
                />
              </div>
            </div>

            {/* Average Engagement */}
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Average Engagement</span>
                <span className="text-gray-600">
                  {stats.averageConversationsPerSession} conversations
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{
                    width: `${Math.min(Number(stats.averageConversationsPerSession) * 10, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Active Users (24h) */}
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Active Users (24h)</span>
                <span className="text-gray-600">
                  {stats.activeSessions24h} / {stats.totalSessions}
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${activeRate}%` }}
                />
              </div>
            </div>

            {/* Privacy Compliance */}
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Privacy Compliant
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {stats.anonymizedSessions} sessions anonymized (GDPR/CCPA compliant)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Number(authRate) < 30 && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="text-sm font-medium text-orange-900">
                  Low Conversion Rate ({authRate}%)
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Consider improving auth prompts or offering better incentives for sign-up.
                </p>
              </div>
            )}

            {Number(stats.averageConversationsPerSession) < 3 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm font-medium text-yellow-900">
                  Low Engagement ({stats.averageConversationsPerSession} avg)
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Users aren't deeply engaged. Improve AI responses or add interactive features.
                </p>
              </div>
            )}

            {Number(activeRate) < 50 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-900">
                  Low Recent Activity ({activeRate}%)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Many inactive sessions. Consider re-engagement campaigns or cleanup.
                </p>
              </div>
            )}

            {Number(authRate) >= 30 &&
              Number(stats.averageConversationsPerSession) >= 3 &&
              Number(activeRate) >= 50 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm font-medium text-green-900">
                  Great Performance!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Your session metrics look healthy. Keep up the good work!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
