'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Database,
  Activity,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// ===========================
// TYPE DEFINITIONS
// ===========================

interface MLAnalytics {
  period: string;
  timestamp: string;
  overview: {
    totalRoutes: number;
    totalSearches: number;
    avgVolatility: number;
    avgCacheTTL: number;
    amadeusWinRate: number;
    duffelCoverageRate: number;
  };
  costSavings: {
    baselineCost: number;
    optimizedCost: number;
    totalSavings: number;
    savingsPercentage: number;
    cacheHitRate: number;
    singleAPIRate: number;
  };
  apiEfficiency: {
    baselineAPICalls: number;
    optimizedAPICalls: number;
    callsSaved: number;
    efficiencyGain: number;
  };
  insights: {
    topRoutes: Array<{
      route: string;
      searches: number;
      volatility: number;
      cacheTTL: number;
      avgPrice: number;
    }>;
    volatileRoutes: Array<{
      route: string;
      volatility: number;
      cacheTTL: number;
      searches: number;
    }>;
    stableRoutes: Array<{
      route: string;
      volatility: number;
      cacheTTL: number;
      searches: number;
    }>;
  };
  health: {
    redisConnected: boolean;
    profilesCovered: number;
    dataQuality: string;
    mlReadiness: string;
  };
}

export interface CostSavingsDashboardProps {
  period?: '7d' | '30d' | '90d';
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

// ===========================
// SUB-COMPONENTS
// ===========================

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  size?: 'small' | 'large';
}> = ({ icon, label, value, change, changeLabel, color = 'blue', size = 'large' }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      icon: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      icon: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600',
      gradient: 'from-red-500 to-red-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`rounded-lg bg-gradient-to-br ${colors.gradient} p-2.5 shadow-md`}>
          <div className="text-white">{icon}</div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className={`font-bold ${colors.text} ${size === 'large' ? 'text-2xl' : 'text-lg'}`}>
          {value}
        </p>
        {changeLabel && (
          <p className="text-xs text-gray-500">{changeLabel}</p>
        )}
      </div>
    </div>
  );
};

const RouteTable: React.FC<{
  title: string;
  routes: Array<{ route: string; searches?: number; volatility: number; cacheTTL: number; avgPrice?: number }>;
  type: 'popular' | 'volatile' | 'stable';
}> = ({ title, routes, type }) => {
  if (routes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-sm text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Route</th>
              {type === 'popular' && <th className="text-right py-2 px-3 font-semibold text-gray-700">Searches</th>}
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Volatility</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-700">Cache TTL</th>
              {type === 'popular' && <th className="text-right py-2 px-3 font-semibold text-gray-700">Avg Price</th>}
            </tr>
          </thead>
          <tbody>
            {routes.map((route, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-3 font-medium text-gray-900">{route.route}</td>
                {type === 'popular' && (
                  <td className="text-right py-2 px-3 text-gray-700">{route.searches}</td>
                )}
                <td className="text-right py-2 px-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    route.volatility < 0.3 ? 'bg-green-100 text-green-800' :
                    route.volatility > 0.7 ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(route.volatility * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="text-right py-2 px-3 text-gray-700">{route.cacheTTL} min</td>
                {type === 'popular' && route.avgPrice && (
                  <td className="text-right py-2 px-3 text-gray-700">${route.avgPrice.toFixed(0)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HealthIndicator: React.FC<{
  health: {
    redisConnected: boolean;
    profilesCovered: number;
    dataQuality: string;
    mlReadiness: string;
  };
}> = ({ health }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        System Health
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Redis Connection</span>
          <div className="flex items-center gap-1.5">
            {health.redisConnected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-700">Disconnected</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Route Profiles</span>
          <span className="text-sm font-bold text-gray-900">{health.profilesCovered}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Data Quality</span>
          <span className={`text-sm font-semibold ${
            health.dataQuality === 'good' ? 'text-green-700' : 'text-yellow-700'
          }`}>
            {health.dataQuality === 'good' ? 'Good' : 'Building'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">ML Readiness</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
            health.mlReadiness === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {health.mlReadiness === 'ready' ? 'Ready' : 'Warming Up'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================

export const CostSavingsDashboard: React.FC<CostSavingsDashboardProps> = ({
  period = '7d',
  autoRefresh = false,
  refreshInterval = 60,
}) => {
  const [analytics, setAnalytics] = useState<MLAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>(period);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ml/analytics?period=${selectedPeriod}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const data = await response.json();
      setAnalytics(data);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching ML analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  if (loading && !analytics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading ML Analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Failed to Load Analytics</h3>
          <p className="text-red-700 mb-4">{error || 'Unknown error occurred'}</p>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-2 shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            ML Cost Savings Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {lastRefresh?.toLocaleTimeString() || 'Never'} · {analytics.overview.totalSearches.toLocaleString()} searches analyzed
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Cost Savings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Cost Savings"
          value={`$${analytics.costSavings.totalSavings.toLocaleString()}`}
          change={analytics.costSavings.savingsPercentage}
          changeLabel={`${analytics.costSavings.savingsPercentage.toFixed(1)}% reduction`}
          color="green"
        />

        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="API Calls Saved"
          value={analytics.apiEfficiency.callsSaved.toLocaleString()}
          change={analytics.apiEfficiency.efficiencyGain || 0}
          changeLabel={`${(analytics.apiEfficiency.efficiencyGain || 0).toFixed(1)}% efficiency gain`}
          color="blue"
        />

        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Avg Cache TTL"
          value={`${Math.round(analytics.overview.avgCacheTTL)} min`}
          changeLabel="Dynamic optimization"
          color="purple"
        />

        <StatCard
          icon={<Database className="w-5 h-5" />}
          label="Cache Hit Rate"
          value={`${analytics.costSavings.cacheHitRate.toFixed(0)}%`}
          changeLabel="Reduced API load"
          color="orange"
        />
      </div>

      {/* API Efficiency Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          label="Baseline API Calls"
          value={analytics.apiEfficiency.baselineAPICalls.toLocaleString()}
          color="red"
          size="small"
        />

        <StatCard
          icon={<Activity className="w-4 h-4" />}
          label="Optimized API Calls"
          value={analytics.apiEfficiency.optimizedAPICalls.toLocaleString()}
          color="green"
          size="small"
        />

        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Single API Strategy Rate"
          value={`${analytics.costSavings.singleAPIRate.toFixed(0)}%`}
          color="blue"
          size="small"
        />
      </div>

      {/* System Health */}
      <HealthIndicator health={analytics.health} />

      {/* Route Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RouteTable
          title="Top Performing Routes"
          routes={analytics.insights.topRoutes}
          type="popular"
        />

        <RouteTable
          title="Most Stable Routes (Best for Caching)"
          routes={analytics.insights.stableRoutes}
          type="stable"
        />
      </div>

      <RouteTable
        title="High Volatility Routes (Frequent Price Changes)"
        routes={analytics.insights.volatileRoutes}
        type="volatile"
      />

      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Cost Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Baseline (Without ML)</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">API Calls:</span>
                <span className="font-semibold text-gray-900">{analytics.apiEfficiency.baselineAPICalls.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-semibold text-red-700">${analytics.costSavings.baselineCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Optimized (With ML)</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">API Calls:</span>
                <span className="font-semibold text-gray-900">{analytics.apiEfficiency.optimizedAPICalls.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-semibold text-green-700">${analytics.costSavings.optimizedCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">Net Savings</span>
            <span className="text-2xl font-bold text-green-600">
              ${analytics.costSavings.totalSavings.toLocaleString()}
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({analytics.costSavings.savingsPercentage.toFixed(1)}%)
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSavingsDashboard;
