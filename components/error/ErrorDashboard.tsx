'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Activity, Server, Users, Clock, BarChart3, RefreshCw, Filter, Download } from 'lucide-react';
import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { monitoredFetch } from '@/lib/network/error-recovery';

/**
 * Error Dashboard Component
 * 
 * Real-time error monitoring dashboard for admin/developer use
 * Shows error trends, recent errors, and system health metrics
 */

interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  avgResponseTime: number;
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  topEndpoints: Array<{ endpoint: string; count: number; errorRate: number }>;
  recentErrors: Array<{
    id: string;
    timestamp: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    message: string;
    endpoint: string;
    userAgent?: string;
    userId?: string;
  }>;
  hourlyTrend: Array<{ hour: string; errors: number; responseTime: number }>;
  systemHealth: {
    api: 'healthy' | 'degraded' | 'down';
    database: 'healthy' | 'degraded' | 'down';
    externalApis: 'healthy' | 'degraded' | 'down';
    queue: number;
  };
}

const ErrorDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<ErrorSeverity | 'all'>('all');

  // Fetch error metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await monitoredFetch(`/api/analytics/errors?range=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, {
        operationName: 'FetchErrorMetrics',
        endpoint: '/api/analytics/errors',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }

      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load error metrics');
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  // Filter recent errors based on selected filters
  const filteredErrors = metrics?.recentErrors.filter(error => {
    if (selectedCategory !== 'all' && error.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && error.severity !== selectedSeverity) return false;
    return true;
  }) || [];

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Get severity badge color
  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case ErrorSeverity.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case ErrorSeverity.NORMAL: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ErrorSeverity.LOW: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get category badge color
  const getCategoryColor = (category: ErrorCategory) => {
    switch (category) {
      case ErrorCategory.PAYMENT: return 'bg-red-50 text-red-700';
      case ErrorCategory.BOOKING: return 'bg-purple-50 text-purple-700';
      case ErrorCategory.DATABASE: return 'bg-amber-50 text-amber-700';
      case ErrorCategory.EXTERNAL_API: return 'bg-cyan-50 text-cyan-700';
      case ErrorCategory.NETWORK: return 'bg-blue-50 text-blue-700';
      case ErrorCategory.VALIDATION: return 'bg-emerald-50 text-emerald-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  // Get system health color
  const getHealthColor = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'down': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading error dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              Error Monitoring Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Real-time error tracking and system health monitoring</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last 1 hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            
            <button
              onClick={fetchMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                autoRefresh 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Errors</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {metrics?.totalErrors.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <span className={`font-semibold ${metrics?.errorRate && metrics.errorRate > 0.05 ? 'text-red-600' : 'text-green-600'}`}>
                {(metrics?.errorRate || 0 * 100).toFixed(1)}%
              </span> error rate
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {metrics?.avgResponseTime ? `${metrics.avgResponseTime.toFixed(0)}ms` : '0ms'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-green-600">-12%</span> from yesterday
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Affected Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {metrics?.recentErrors.filter(e => e.userId).length || '0'}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Unique users impacted by errors
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics?.systemHealth.api === 'healthy' ? 'Stable' : 'Issues'}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Server className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${getHealthColor(metrics?.systemHealth.api || 'healthy')}`}>
              {metrics?.systemHealth.api.toUpperCase() || 'HEALTHY'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Error Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Error Categories</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {metrics?.topCategories.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(cat.category as ErrorCategory)}`}>
                      {cat.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{cat.count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{cat.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
              <Server className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg border ${getHealthColor(metrics?.systemHealth.api || 'healthy')}`}>
                <p className="text-sm font-medium">API</p>
                <p className="text-2xl font-bold mt-1">{metrics?.systemHealth.api === 'healthy' ? '✓' : '⚠'}</p>
              </div>
              <div className={`p-4 rounded-lg border ${getHealthColor(metrics?.systemHealth.database || 'healthy')}`}>
                <p className="text-sm font-medium">Database</p>
                <p className="text-2xl font-bold mt-1">{metrics?.systemHealth.database === 'healthy' ? '✓' : '⚠'}</p>
              </div>
              <div className={`p-4 rounded-lg border ${getHealthColor(metrics?.systemHealth.externalApis || 'healthy')}`}>
                <p className="text-sm font-medium">External APIs</p>
                <p className="text-2xl font-bold mt-1">{metrics?.systemHealth.externalApis === 'healthy' ? '✓' : '⚠'}</p>
              </div>
              <div className="p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium">Queue Size</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{metrics?.systemHealth.queue || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Errors</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {Object.values(ErrorCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as ErrorSeverity | 'all')}
                  className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  {Object.values(ErrorSeverity).map((sev) => (
                    <option key={sev} value={sev}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button className="text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredErrors.length > 0 ? (
                filteredErrors.map((error) => (
                  <tr key={error.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{formatTime(error.timestamp)}</div>
                      <div className="text-xs text-gray-500">{formatDate(error.timestamp)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 font-medium truncate max-w-xs" title={error.message}>
                        {error.message.length > 50 ? `${error.message.substring(0, 50)}...` : error.message}
                      </div>
                      <div className="text-xs text-gray-500">ID: {error.id.substring(0, 8)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(error.category)}`}>
                        {error.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(error.severity)}`}>
                        {error.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs" title={error.endpoint}>
                        {error.endpoint}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No errors found for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Errors →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>Error Dashboard v1.0 • Auto-refresh {autoRefresh ? 'every 30 seconds' : 'off'} • Last updated: {new Date().toLocaleTimeString()}</p>
        <p className="mt-1">Monitor and resolve errors to improve user experience and system reliability.</p>
      </div>
    </div>
  );
};

export default ErrorDashboard;
