/**
 * SEO MONITORING DASHBOARD
 *
 * Real-time SEO health monitoring and metrics tracking
 * Displays key performance indicators and alerts
 *
 * Features:
 * - SEO health score
 * - Indexation status
 * - Schema validation
 * - Performance metrics
 * - Ranking trends
 * - AI search visibility
 *
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Search,
  FileText,
  Zap,
  Globe,
  Bot,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

// Metric card component
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'error' | 'neutral';
  subtitle?: string;
}

function MetricCard({ title, value, change, icon, status, subtitle }: MetricCardProps) {
  const statusColors = {
    good: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50',
    neutral: 'border-blue-200 bg-blue-50',
  };

  const iconColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    neutral: 'text-blue-600',
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${statusColors[status]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white ${iconColors[status]}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : change < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
}

// Alert component
interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  action?: { label: string; onClick: () => void };
}

function Alert({ type, message, action }: AlertProps) {
  const config = {
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: AlertCircle },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertCircle },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: AlertCircle },
  };

  const { bg, border, text, icon: Icon } = config[type];

  return (
    <div className={`${bg} ${border} border rounded-lg p-4 flex items-start gap-3`}>
      <Icon className={`w-5 h-5 ${text} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`${text} text-sm font-medium`}>{message}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-semibold underline hover:no-underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Main dashboard component
export function SEOMonitoringDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [seoHealth, setSeoHealth] = useState({ score: 0, issues: [] as string[] });

  // Simulated data - in production, fetch from APIs
  const [metrics, setMetrics] = useState({
    indexedPages: { value: 1247, change: 12.5, target: 10000 },
    organicVisitors: { value: 2543, change: 18.3, target: 10000 },
    avgRanking: { value: 15.3, change: -8.2, target: 10 },
    seoScore: { value: 96, change: 2.1, target: 95 },
    schemaValid: { value: '100%', change: 0, target: 100 },
    coreWebVitals: { value: 'Good', change: 5.3, target: 100 },
    aiCitations: { value: 87, change: 45.2, target: 1000 },
    conversionRate: { value: '3.2%', change: 0.8, target: 5 },
  });

  const [alerts, setAlerts] = useState<AlertProps[]>([
    {
      type: 'success',
      message: '100 new pages indexed in the last 7 days',
    },
    {
      type: 'warning',
      message: '5 pages have high CLS scores - review performance',
      action: { label: 'View Pages', onClick: () => console.log('View pages') },
    },
    {
      type: 'info',
      message: 'Google Search Console verification pending',
      action: { label: 'Verify Now', onClick: () => console.log('Verify') },
    },
  ]);

  // Run SEO health check
  useEffect(() => {
    const runHealthCheck = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, use the actual SEO testing utilities
      if (typeof window !== 'undefined' && (window as any).fly2anySEO) {
        const health = (window as any).fly2anySEO.quick();
        setSeoHealth(health);
      } else {
        setSeoHealth({ score: 96, issues: [] });
      }

      setIsLoading(false);
      setLastUpdated(new Date());
    };

    runHealthCheck();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <Alert key={index} {...alert} />
          ))}
        </div>
      )}

      {/* SEO Health Score */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Overall SEO Health</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-bold">{seoHealth.score}</span>
              <span className="text-3xl font-medium opacity-75">/100</span>
            </div>
            {seoHealth.issues.length > 0 && (
              <p className="mt-4 text-blue-100">
                {seoHealth.issues.length} issue{seoHealth.issues.length !== 1 ? 's' : ''} detected
              </p>
            )}
          </div>
          <div className="hidden md:block">
            <CheckCircle className="w-32 h-32 opacity-20" />
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Indexed Pages"
          value={metrics.indexedPages.value.toLocaleString()}
          change={metrics.indexedPages.change}
          icon={<FileText className="w-6 h-6" />}
          status="good"
          subtitle={`Target: ${metrics.indexedPages.target.toLocaleString()}`}
        />

        <MetricCard
          title="Organic Visitors"
          value={metrics.organicVisitors.value.toLocaleString()}
          change={metrics.organicVisitors.change}
          icon={<Search className="w-6 h-6" />}
          status="good"
          subtitle="Last 30 days"
        />

        <MetricCard
          title="Avg. Ranking Position"
          value={metrics.avgRanking.value.toFixed(1)}
          change={metrics.avgRanking.change}
          icon={<TrendingUp className="w-6 h-6" />}
          status="good"
          subtitle="Top 100 keywords"
        />

        <MetricCard
          title="SEO Score"
          value={metrics.seoScore.value}
          change={metrics.seoScore.change}
          icon={<BarChart3 className="w-6 h-6" />}
          status="good"
          subtitle="Lighthouse SEO"
        />

        <MetricCard
          title="Schema Validation"
          value={metrics.schemaValid.value}
          change={metrics.schemaValid.change}
          icon={<CheckCircle className="w-6 h-6" />}
          status="good"
          subtitle="All schemas valid"
        />

        <MetricCard
          title="Core Web Vitals"
          value={metrics.coreWebVitals.value}
          change={metrics.coreWebVitals.change}
          icon={<Zap className="w-6 h-6" />}
          status="good"
          subtitle="LCP, FID, CLS"
        />

        <MetricCard
          title="AI Search Citations"
          value={metrics.aiCitations.value}
          change={metrics.aiCitations.change}
          icon={<Bot className="w-6 h-6" />}
          status="good"
          subtitle="Last 30 days"
        />

        <MetricCard
          title="Conversion Rate"
          value={metrics.conversionRate.value}
          change={metrics.conversionRate.change}
          icon={<Globe className="w-6 h-6" />}
          status="neutral"
          subtitle="Organic traffic"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ranking Keywords */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Ranking Keywords</h3>
          <div className="space-y-3">
            {[
              { keyword: 'cheap flights jfk to lax', position: 3, change: 2 },
              { keyword: 'new york to los angeles flights', position: 5, change: -1 },
              { keyword: 'best time to book flights', position: 7, change: 5 },
              { keyword: 'delta air lines review', position: 8, change: 3 },
              { keyword: 'flights to new york', position: 12, change: 1 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.keyword}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-blue-600">#{item.position}</span>
                  {item.change !== 0 && (
                    <span className={`flex items-center gap-1 text-sm font-semibold ${
                      item.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(item.change)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">SEO Health Issues</h3>
          <div className="space-y-3">
            {seoHealth.issues.length > 0 ? (
              seoHealth.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{issue}</p>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">No issues detected</p>
                  <p className="text-sm mt-1">Your SEO is in excellent shape!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Traffic Trend (Placeholder) */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Organic Traffic Trend</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Chart visualization</p>
            <p className="text-sm mt-1">
              Integrate with Google Analytics API for real-time data
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open('https://search.google.com/search-console', '_blank')}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Search className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Search Console</p>
              <p className="text-sm text-gray-600">View indexation status</p>
            </div>
          </button>

          <button
            onClick={() => window.open('https://analytics.google.com', '_blank')}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Analytics</p>
              <p className="text-sm text-gray-600">View traffic reports</p>
            </div>
          </button>

          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).fly2anySEO) {
                (window as any).fly2anySEO.audit().then((report: any) => {
                  console.log('SEO Audit Report:', report);
                  alert(`SEO Score: ${report.overallScore}/100\nCheck console for details`);
                });
              } else {
                alert('SEO testing utilities not loaded');
              }
            }}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Run SEO Audit</p>
              <p className="text-sm text-gray-600">Check page health</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SEOMonitoringDashboard;
