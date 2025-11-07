'use client';

/**
 * Real-Time Conversation Monitoring Dashboard
 *
 * Displays live conversation quality metrics, error rates, and ML predictions
 * For internal use by Fly2Any operations team
 */

import { useState, useEffect } from 'react';
import { getTelemetry, type ConversationMetrics, type ConversationTelemetry } from '@/lib/ml/conversation-telemetry';
import { getErrorDetectionService, type DetectedErrorWithContext, type ErrorStatistics } from '@/lib/ml/error-detection-service';
import { AlertCircle, TrendingUp, TrendingDown, Activity, Users, CheckCircle, XCircle, AlertTriangle, Clock, Bug, Zap } from 'lucide-react';

export function ConversationMonitoringDashboard() {
  const [metrics, setMetrics] = useState<ConversationMetrics | null>(null);
  const [recentConversations, setRecentConversations] = useState<ConversationTelemetry[]>([]);
  const [errorStats, setErrorStats] = useState<ErrorStatistics | null>(null);
  const [recentErrors, setRecentErrors] = useState<DetectedErrorWithContext[]>([]);
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

  // Subscribe to real-time error detection
  useEffect(() => {
    const errorService = getErrorDetectionService();
    const unsubscribe = errorService.subscribe((error) => {
      setRecentErrors(prev => [error, ...prev].slice(0, 20));
    });

    return unsubscribe;
  }, []);

  async function loadMetrics() {
    try {
      const telemetry = getTelemetry();
      const errorService = getErrorDetectionService();

      const [metricsData, errorStatsData] = await Promise.all([
        telemetry.getMetrics(period),
        errorService.getStatistics(period),
      ]);

      setMetrics(metricsData);
      setErrorStats(errorStatsData);
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

      {/* Error Detection Analytics (Layer 2) */}
      {errorStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Bug className="w-6 h-6 text-red-600" />
              Real-Time Error Detection
              <span className="text-sm font-normal text-gray-500">(Layer 2: ML Detection)</span>
            </h2>
            {errorStats.totalErrors > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {errorStats.totalErrors} errors detected
              </span>
            )}
          </div>

          {/* Error Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Errors</span>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">{errorStats.totalErrors}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Auto-Fixable</span>
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">{errorStats.autoFixableCount}</p>
              <p className="text-xs text-gray-500 mt-1">
                {errorStats.totalErrors > 0
                  ? `${((errorStats.autoFixableCount / errorStats.totalErrors) * 100).toFixed(0)}% fixable`
                  : '0% fixable'}
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Error Rate</span>
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-600">{errorStats.errorRate.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">per conversation</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Confidence</span>
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {(errorStats.averageConfidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Errors by Severity */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Errors by Severity</h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-3 bg-gray-50 rounded">
                <p className="text-2xl font-bold text-gray-600">{errorStats.errorsBySeverity.low}</p>
                <p className="text-xs text-gray-500">Low</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <p className="text-2xl font-bold text-yellow-600">{errorStats.errorsBySeverity.medium}</p>
                <p className="text-xs text-gray-500">Medium</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded">
                <p className="text-2xl font-bold text-orange-600">{errorStats.errorsBySeverity.high}</p>
                <p className="text-xs text-gray-500">High</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <p className="text-2xl font-bold text-red-600">{errorStats.errorsBySeverity.critical}</p>
                <p className="text-xs text-gray-500">Critical</p>
              </div>
            </div>
          </div>

          {/* Most Common Error */}
          {errorStats.mostCommonError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-gray-900">Most Common Error</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{formatErrorType(errorStats.mostCommonError.type)}</span>
                    {' - '}
                    {errorStats.mostCommonError.count} occurrence{errorStats.mostCommonError.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Real-Time Error Feed (Layer 2) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bug className="w-6 h-6 text-red-600" />
          Live Error Detection Feed
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        </h2>
        {recentErrors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>No errors detected recently - system running smoothly! ✨</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentErrors.map((error, idx) => (
              <div
                key={`${error.conversationId}-${error.type}-${idx}`}
                className={`p-4 rounded-lg border-l-4 ${
                  error.severity === 'critical' ? 'bg-red-50 border-red-500' :
                  error.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                  error.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-gray-50 border-gray-400'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      error.severity === 'critical' ? 'bg-red-600 text-white' :
                      error.severity === 'high' ? 'bg-orange-600 text-white' :
                      error.severity === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {error.severity.toUpperCase()}
                    </span>
                    <p className="font-semibold text-gray-900">
                      {formatErrorType(error.type)}
                    </p>
                    {error.autoFixable && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Auto-fixable
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">User Message:</p>
                    <p className="text-gray-700 bg-white p-2 rounded border border-gray-200 truncate">
                      {error.userMessage}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Agent Response:</p>
                    <p className="text-gray-700 bg-white p-2 rounded border border-gray-200 truncate">
                      {error.agentResponse}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2 rounded border border-gray-200">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 mb-1">Issue:</p>
                      <p className="text-xs text-gray-600">
                        Expected: {error.context.expectedBehavior}
                      </p>
                      <p className="text-xs text-gray-600">
                        Got: {error.context.actualBehavior}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="text-xs font-medium text-blue-900 mb-1">💡 Suggested Fix:</p>
                    <p className="text-xs text-blue-700">{error.suggestedFix}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Confidence: {(error.confidence * 100).toFixed(0)}%</span>
                    <span className="truncate ml-2">ID: {error.conversationId.slice(0, 8)}...</span>
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
