'use client';

/**
 * Real-Time Conversation Monitoring Dashboard
 *
 * Displays live conversation quality metrics, error rates, and ML predictions
 * For internal use by Fly2Any operations team
 */

import { useState, useEffect } from 'react';
import { getTelemetry, type ConversationMetrics, type ConversationTelemetry } from '@/lib/ml/conversation-telemetry';
import { AlertCircle, TrendingUp, TrendingDown, Activity, Users, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

export function ConversationMonitoringDashboard() {
  const [metrics, setMetrics] = useState<ConversationMetrics | null>(null);
  const [recentConversations, setRecentConversations] = useState<ConversationTelemetry[]>([]);
  const [period, setPeriod] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);

  // Load metrics on mount and periodically
  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [period]);

  // Subscribe to real-time telemetry
  useEffect(() => {
    const telemetry = getTelemetry();
    const unsubscribe = telemetry.subscribe((data) => {
      setRecentConversations(prev => [data, ...prev].slice(0, 10));
    });

    return unsubscribe;
  }, []);

  async function loadMetrics() {
    try {
      const telemetry = getTelemetry();
      const data = await telemetry.getMetrics(period);
      setMetrics(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      setLoading(false);
    }
  }

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conversation Monitoring</h1>
          <p className="text-gray-600 mt-1">Real-time ML-powered conversation quality tracking</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 bg-white rounded-lg shadow p-1">
          {(['hour', 'day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Conversations */}
        <MetricCard
          title="Total Conversations"
          value={metrics.totalConversations.toLocaleString()}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />

        {/* Completion Rate */}
        <MetricCard
          title="Completion Rate"
          value={`${(metrics.completionRate * 100).toFixed(1)}%`}
          change={metrics.completionRate > 0.6 ? 'up' : 'down'}
          icon={<CheckCircle className="w-6 h-6" />}
          color={metrics.completionRate > 0.6 ? 'green' : 'red'}
        />

        {/* Booking Rate */}
        <MetricCard
          title="Booking Rate"
          value={`${(metrics.bookingRate * 100).toFixed(1)}%`}
          change={metrics.bookingRate > 0.05 ? 'up' : 'down'}
          icon={<TrendingUp className="w-6 h-6" />}
          color={metrics.bookingRate > 0.05 ? 'green' : 'orange'}
        />

        {/* Error Rate */}
        <MetricCard
          title="Error Rate"
          value={metrics.errorRate.toFixed(2)}
          change={metrics.errorRate < 0.5 ? 'up' : 'down'}
          icon={<AlertCircle className="w-6 h-6" />}
          color={metrics.errorRate < 0.5 ? 'green' : 'red'}
        />
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Satisfaction */}
        <MetricCard
          title="Avg Satisfaction"
          value={metrics.averageSatisfaction.toFixed(2)}
          subtitle="0-1 scale"
          icon={<Activity className="w-5 h-5" />}
          color="purple"
          size="sm"
        />

        {/* Response Time */}
        <MetricCard
          title="Avg Response Time"
          value={`${(metrics.averageResponseTime / 1000).toFixed(1)}s`}
          subtitle="milliseconds"
          icon={<Clock className="w-5 h-5" />}
          color={metrics.averageResponseTime < 2000 ? 'green' : 'orange'}
          size="sm"
        />

        {/* Auto-Fix Rate */}
        <MetricCard
          title="Auto-Fix Rate"
          value={`${(metrics.autoFixRate * 100).toFixed(1)}%`}
          subtitle="errors fixed automatically"
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          size="sm"
        />
      </div>

      {/* ML Model Accuracy */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">ML Model Accuracy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AccuracyBar
            label="Intent Detection"
            accuracy={metrics.averageIntentAccuracy}
          />
          <AccuracyBar
            label="Language Detection"
            accuracy={metrics.averageLanguageAccuracy}
          />
          <AccuracyBar
            label="Data Parsing"
            accuracy={metrics.averageParsingAccuracy}
          />
        </div>
      </div>

      {/* Top Errors */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Errors (Past {period})</h2>
        {metrics.topErrors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>No errors detected! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.topErrors.map((error, idx) => (
              <div
                key={error.type}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full font-semibold text-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatErrorType(error.type)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {error.count} occurrence{error.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">{error.count}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Conversations (Live Feed) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          Recent Conversations
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </h2>
        {recentConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2" />
            <p>Waiting for conversations...</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentConversations.map((conv) => (
              <div
                key={conv.conversationId}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  {conv.userSentiment === 'frustrated' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : conv.userSentiment === 'positive' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Activity className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conv.userIntent || 'Unknown intent'}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(conv.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate mb-1">
                    {conv.userMessage}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      conv.userSentiment === 'frustrated' ? 'bg-red-100 text-red-700' :
                      conv.userSentiment === 'positive' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {conv.userSentiment}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {conv.agentConsultant}
                    </span>
                    {conv.errorCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        {conv.errorCount} error{conv.errorCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {conv.predictions && conv.predictions.willAbandon > 0.7 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        ⚠️ High abandonment risk
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon,
  color,
  size = 'md',
}: {
  title: string;
  value: string;
  subtitle?: string;
  change?: 'up' | 'down';
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'orange' | 'purple';
  size?: 'sm' | 'md';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`font-bold text-gray-900 ${size === 'sm' ? 'text-2xl' : 'text-3xl'}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {change && (
          <div className="flex items-center gap-1">
            {change === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Accuracy Bar Component
function AccuracyBar({ label, accuracy }: { label: string; accuracy: number }) {
  const percentage = accuracy * 100;
  const color = percentage >= 90 ? 'bg-green-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Helper function to format error types
function formatErrorType(type: string): string {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
