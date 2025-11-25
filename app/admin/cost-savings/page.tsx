/**
 * API Cost Savings Dashboard
 *
 * Comprehensive monitoring of cache performance and API cost savings.
 * Shows real-time metrics, historical trends, and projections.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Database,
  Zap,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Server,
} from 'lucide-react';

interface CostSavingsData {
  summary: {
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    hitRate: number;
    errors: number;
    effectivenessScore: number;
    lastReset: string;
  };
  costSavings: {
    totalRequests: number;
    cachedRequests: number;
    apiCalls: number;
    estimatedCost: number;
    estimatedSavings: number;
    savingsPercentage: number;
    costPerApiCall: number;
    amadeusRate: number;
    duffelRate: number;
  };
  projections: {
    dailyAvgRequests: number;
    dailyAvgHitRate: number;
    monthlyProjectedRequests: number;
    monthlyProjectedSavings: number;
    monthlyProjectedCost: number;
    annualProjectedSavings: number;
  };
  historical: {
    days: number;
    data: Array<{
      date: string;
      hits: number;
      misses: number;
      total: number;
      hitRate: number;
      errors: number;
    }>;
  };
  recommendations?: string[];
  timestamp: string;
}

export default function CostSavingsDashboard() {
  const [data, setData] = useState<CostSavingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysBack, setDaysBack] = useState(7);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/admin/cost-savings?days=${daysBack}&detailed=true`);

      if (!response.ok) {
        throw new Error('Failed to fetch cost savings data');
      }

      const result = await response.json();
      setData(result);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [daysBack]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatNumber = (value: number) => value.toLocaleString();
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Cost Savings</h1>
          <p className="text-gray-500 mt-1">
            Monitor cache performance and track API cost optimization
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-refresh
          </label>
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Savings */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Savings</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(data.costSavings.estimatedSavings)}
                  </p>
                  <p className="text-green-200 text-sm mt-2">
                    {formatPercent(data.costSavings.savingsPercentage)} of API costs
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <DollarSign className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Cache Hit Rate */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Cache Hit Rate</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatPercent(data.summary.hitRate)}
                  </p>
                  <p className="text-blue-200 text-sm mt-2">
                    {formatNumber(data.summary.cacheHits)} / {formatNumber(data.summary.totalRequests)} requests
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Database className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Monthly Projection */}
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Monthly Projection</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(data.projections.monthlyProjectedSavings)}
                  </p>
                  <p className="text-purple-200 text-sm mt-2">
                    Est. cost: {formatCurrency(data.projections.monthlyProjectedCost)}/mo
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Effectiveness Score */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Effectiveness Score</p>
                  <p className="text-3xl font-bold mt-1">
                    {data.summary.effectivenessScore}/100
                  </p>
                  <p className="text-orange-200 text-sm mt-2">
                    {data.summary.effectivenessScore >= 80
                      ? 'Excellent'
                      : data.summary.effectivenessScore >= 60
                      ? 'Good'
                      : data.summary.effectivenessScore >= 40
                      ? 'Needs Improvement'
                      : 'Critical'}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Zap className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* API Cost Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Server className="w-5 h-5 text-gray-600" />
                API Cost Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Requests</span>
                  <span className="font-semibold">{formatNumber(data.costSavings.totalRequests)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700">Cached (Free)</span>
                  <span className="font-semibold text-green-700">
                    {formatNumber(data.costSavings.cachedRequests)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-700">API Calls (Paid)</span>
                  <span className="font-semibold text-red-700">
                    {formatNumber(data.costSavings.apiCalls)}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Amadeus Rate</span>
                    <span>{formatCurrency(data.costSavings.amadeusRate)}/call</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Duffel Rate</span>
                    <span>{formatCurrency(data.costSavings.duffelRate)}/call</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Projections */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                Cost Projections
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600">Daily Average</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(data.projections.dailyAvgRequests)} req
                  </p>
                  <p className="text-sm text-gray-500">
                    @ {formatPercent(data.projections.dailyAvgHitRate)} hit rate
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <p className="text-sm text-gray-600">Monthly Savings</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(data.projections.monthlyProjectedSavings)}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                  <p className="text-sm text-gray-600">Annual Savings</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(data.projections.annualProjectedSavings)}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-gray-600" />
                Recommendations
              </h3>
              {data.recommendations && data.recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {data.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg text-sm"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-amber-800">{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 text-sm">
                    No recommendations. Cache is performing optimally!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Historical Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-gray-600" />
              Historical Performance ({daysBack} days)
            </h3>
            {data.historical.data.length > 0 ? (
              <div className="space-y-4">
                {/* Simple chart visualization */}
                <div className="grid grid-cols-7 gap-2">
                  {data.historical.data.slice(-7).map((day, idx) => (
                    <div key={idx} className="text-center">
                      <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                        {/* Hit rate bar */}
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-emerald-400 transition-all"
                          style={{ height: `${Math.min(day.hitRate, 100)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white bg-black/30 px-1 rounded">
                            {formatPercent(day.hitRate)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatNumber(day.total)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-gray-600">Cache Hit Rate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Numbers = Total Requests</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No historical data available yet</p>
                <p className="text-sm mt-1">Data will appear after cache activity</p>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Live data from Redis analytics</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Stats since: {new Date(data.summary.lastReset).toLocaleDateString()}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
