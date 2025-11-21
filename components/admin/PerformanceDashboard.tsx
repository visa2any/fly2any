'use client';

import { useState, useEffect } from 'react';
import {
  getStoredMetrics,
  getLatestMetrics,
  getMetricAverage,
  clearStoredMetrics,
  formatMetricValue,
  getMetricRating,
  VITALS_THRESHOLDS,
} from '@/lib/vitals';

interface MetricData {
  value: number;
  rating: string;
  timestamp: number;
  id: string;
}

interface MetricCardProps {
  name: string;
  description: string;
  current: MetricData | null;
  average: number | null;
  history: MetricData[];
}

/**
 * Individual Metric Card Component
 */
function MetricCard({ name, description, current, average, history }: MetricCardProps) {
  const rating = current ? getMetricRating(name, current.value) : 'good';
  const threshold = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS];

  const getRatingColor = (r: string) => {
    switch (r) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRatingBadgeColor = (r: string) => {
    switch (r) {
      case 'good':
        return 'bg-green-500';
      case 'needs-improvement':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${getRatingColor(rating)}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold mb-1">{name}</h3>
          <p className="text-sm opacity-80">{description}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${getRatingBadgeColor(rating)} mt-1`} />
      </div>

      {current ? (
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold">
              {name === 'CLS'
                ? current.value.toFixed(3)
                : current.value < 1000
                ? `${Math.round(current.value)}ms`
                : `${(current.value / 1000).toFixed(2)}s`}
            </div>
            <div className="text-xs mt-1 opacity-70">Current Value</div>
          </div>

          {average !== null && (
            <div>
              <div className="text-lg font-semibold">
                {name === 'CLS'
                  ? average.toFixed(3)
                  : average < 1000
                  ? `${Math.round(average)}ms`
                  : `${(average / 1000).toFixed(2)}s`}
              </div>
              <div className="text-xs opacity-70">Average ({history.length} samples)</div>
            </div>
          )}

          {threshold && (
            <div className="text-xs space-y-1 pt-2 border-t border-current opacity-60">
              <div>Good: {name === 'CLS' ? threshold.good.toFixed(2) : `${threshold.good}ms`}</div>
              <div>Needs Improvement: {name === 'CLS' ? threshold.needsImprovement.toFixed(2) : `${threshold.needsImprovement}ms`}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm opacity-60">No data collected yet</div>
      )}
    </div>
  );
}

/**
 * Mini Sparkline Chart Component
 */
function MiniSparkline({ data, name }: { data: MetricData[]; name: string }) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <div className="flex items-end h-12 gap-0.5">
      {data.slice(-20).map((point, i) => {
        const height = ((point.value - min) / range) * 100;
        const rating = getMetricRating(name, point.value);
        const color =
          rating === 'good'
            ? 'bg-green-500'
            : rating === 'needs-improvement'
            ? 'bg-yellow-500'
            : 'bg-red-500';

        return (
          <div
            key={i}
            className={`flex-1 ${color} rounded-t transition-all`}
            style={{ height: `${Math.max(height, 5)}%` }}
            title={`${point.value.toFixed(2)} (${rating})`}
          />
        );
      })}
    </div>
  );
}

/**
 * Main Performance Dashboard Component
 */
export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<Record<string, MetricData[]>>({});
  const [latest, setLatest] = useState<Record<string, MetricData>>({});
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const metricDescriptions = {
    LCP: 'Largest Contentful Paint - Loading performance',
    INP: 'Interaction to Next Paint - Interactivity',
    CLS: 'Cumulative Layout Shift - Visual stability',
    FCP: 'First Contentful Paint - Initial render',
    TTFB: 'Time to First Byte - Server response',
  };

  const loadMetrics = () => {
    const stored = getStoredMetrics();
    const latestVals = getLatestMetrics();
    setMetrics(stored);
    setLatest(latestVals);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    // Initial load
    loadMetrics();

    // Listen for real-time updates
    const handleWebVital = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('[Dashboard] Received web-vital event:', customEvent.detail);
      loadMetrics();
    };

    window.addEventListener('web-vital', handleWebVital);

    // Auto-refresh every 5 seconds if enabled
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(loadMetrics, 5000);
    }

    return () => {
      window.removeEventListener('web-vital', handleWebVital);
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleClearMetrics = () => {
    if (confirm('Are you sure you want to clear all stored metrics?')) {
      clearStoredMetrics();
      loadMetrics();
    }
  };

  const hasData = Object.keys(latest).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Performance Dashboard
              </h1>
              <p className="text-gray-600">
                Web Vitals monitoring for Fly2Any platform
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  autoRefresh
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
              </button>
              <button
                onClick={loadMetrics}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Refresh Now
              </button>
              <button
                onClick={handleClearMetrics}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Clear Data
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate?.toLocaleTimeString() || 'Never'}
          </div>
        </div>

        {/* Status Banner */}
        {!hasData && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-yellow-900 mb-2">
              No metrics collected yet
            </h3>
            <p className="text-yellow-800">
              Navigate through the site to start collecting Web Vitals data. Metrics will
              appear here automatically as you interact with the application.
            </p>
          </div>
        )}

        {/* Core Web Vitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(metricDescriptions).map(([name, description]) => (
            <MetricCard
              key={name}
              name={name}
              description={description}
              current={latest[name] || null}
              average={getMetricAverage(name)}
              history={metrics[name] || []}
            />
          ))}
        </div>

        {/* Historical Trends */}
        {hasData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Historical Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(metrics).map(([name, data]) => (
                <div key={name} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{name}</h3>
                  <MiniSparkline data={data} name={name} />
                  <div className="text-xs text-gray-500 mt-2">
                    Last {Math.min(data.length, 20)} measurements
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About Web Vitals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">Color Coding:</h3>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Good - Meeting performance targets</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span>Needs Improvement - Performance could be better</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span>Poor - Performance issues detected</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Data Storage:</h3>
              <p>
                Metrics are stored locally in your browser using localStorage. Up to 100
                measurements per metric are retained. Data persists across sessions but is
                device-specific.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
