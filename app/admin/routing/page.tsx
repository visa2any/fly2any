'use client';

import { useState, useEffect, useCallback } from 'react';
import Chart from '@/components/admin/Chart';
import {
  GitBranch,
  TrendingUp,
  DollarSign,
  Plane,
  Calendar,
  Download,
  RefreshCw,
  ArrowRight,
  Building2,
  Percent,
  Filter,
} from 'lucide-react';

interface RoutingAnalytics {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalDecisions: number;
    consolidatorDecisions: number;
    duffelDecisions: number;
    consolidatorPct: number;
    totalEstimatedProfit: number;
    consolidatorProfit: number;
    duffelProfit: number;
    totalCommission: number;
    avgProfitPerDecision: number;
  };
  byReason: Record<string, number>;
  dailyTrend: Array<{
    date: string;
    profit: number;
    count: number;
  }>;
  topRoutes: Array<{
    route: string;
    profit: number;
    count: number;
  }>;
  topAirlines: Array<{
    airlineCode: string;
    count: number;
    consolidator: number;
    duffel: number;
    totalProfit: number;
    avgCommission: number;
  }>;
}

export default function AdminRoutingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RoutingAnalytics | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      const response = await fetch(`/api/admin/routing/analytics?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Failed to connect to analytics API');
      console.error('Error fetching routing analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const exportReport = () => {
    if (!data) return;

    const csvContent = [
      ['Routing Analytics Report'],
      [`Period: ${data.period.start} to ${data.period.end}`],
      [''],
      ['Summary'],
      ['Total Routing Decisions', data.summary.totalDecisions],
      ['Consolidator Decisions', data.summary.consolidatorDecisions],
      ['Duffel Decisions', data.summary.duffelDecisions],
      ['Consolidator %', `${data.summary.consolidatorPct.toFixed(1)}%`],
      ['Total Estimated Profit', `$${data.summary.totalEstimatedProfit.toFixed(2)}`],
      ['Average Profit/Decision', `$${data.summary.avgProfitPerDecision.toFixed(2)}`],
      [''],
      ['Top Airlines'],
      ['Airline', 'Total', 'Consolidator', 'Duffel', 'Profit', 'Avg Commission %'],
      ...data.topAirlines.map(a => [
        a.airlineCode,
        a.count,
        a.consolidator,
        a.duffel,
        `$${a.totalProfit.toFixed(2)}`,
        `${a.avgCommission.toFixed(1)}%`,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `routing-analytics-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart data
  const channelDistributionData = data ? [
    { name: 'Consolidator', count: data.summary.consolidatorDecisions },
    { name: 'Duffel', count: data.summary.duffelDecisions },
  ] : [];

  const reasonDistributionData = data ?
    Object.entries(data.byReason)
      .map(([reason, count]) => ({
        name: reason.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) : [];

  const dailyProfitData = data?.dailyTrend || [];

  const topAirlinesChartData = data?.topAirlines.slice(0, 10).map(a => ({
    airline: a.airlineCode,
    profit: Math.round(a.totalProfit * 100) / 100,
    consolidator: a.consolidator,
    duffel: a.duffel,
  })) || [];

  const topRoutesChartData = data?.topRoutes.slice(0, 10).map(r => ({
    route: r.route,
    profit: Math.round(r.profit * 100) / 100,
    count: r.count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <GitBranch className="w-7 h-7 text-blue-600" />
              Routing Analytics
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Hybrid routing engine performance and profit analysis
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={exportReport}
              disabled={!data}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Decisions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Decisions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? '—' : data?.summary.totalDecisions.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4 text-purple-500" />
                <span className="text-gray-600">Cons:</span>
                <span className="font-medium text-purple-600">
                  {loading ? '—' : data?.summary.consolidatorDecisions || 0}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Plane className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Duffel:</span>
                <span className="font-medium text-blue-600">
                  {loading ? '—' : data?.summary.duffelDecisions || 0}
                </span>
              </span>
            </div>
          </div>

          {/* Consolidator Rate */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consolidator Rate</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {loading ? '—' : formatPercent(data?.summary.consolidatorPct || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Percent className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Flights routed via Downtown Travel consolidator
            </p>
          </div>

          {/* Total Estimated Profit */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Est. Total Profit</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {loading ? '—' : formatCurrency(data?.summary.totalEstimatedProfit || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                Commission: <span className="font-medium text-green-600">
                  {formatCurrency(data?.summary.totalCommission || 0)}
                </span>
              </span>
            </div>
          </div>

          {/* Average Profit */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Profit/Decision</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {loading ? '—' : formatCurrency(data?.summary.avgProfitPerDecision || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Expected margin per booking routed
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Channel Distribution</h3>
            </div>
            <Chart
              type="donut"
              data={channelDistributionData}
              dataKeys={['count']}
              colors={['#8b5cf6', '#3b82f6']}
              height={280}
              loading={loading}
            />
          </div>

          {/* Decision Reasons */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Decision Reasons</h3>
            </div>
            <Chart
              type="bar"
              data={reasonDistributionData}
              dataKeys={['count']}
              xAxisKey="name"
              colors={['#8b5cf6']}
              height={280}
              loading={loading}
            />
          </div>
        </div>

        {/* Daily Profit Trend */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Daily Profit Trend</h3>
          </div>
          <Chart
            type="area"
            data={dailyProfitData}
            dataKeys={['profit', 'count']}
            xAxisKey="date"
            colors={['#10b981', '#3b82f6']}
            height={350}
            loading={loading}
          />
        </div>

        {/* Top Routes & Airlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Routes by Profit */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Top Routes by Profit</h3>
            </div>
            <Chart
              type="bar"
              data={topRoutesChartData}
              dataKeys={['profit', 'count']}
              xAxisKey="route"
              colors={['#10b981', '#3b82f6']}
              height={350}
              loading={loading}
            />
          </div>

          {/* Top Airlines by Profit */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Top Airlines by Profit</h3>
            </div>
            <Chart
              type="bar"
              data={topAirlinesChartData}
              dataKeys={['profit', 'consolidator', 'duffel']}
              xAxisKey="airline"
              colors={['#10b981', '#8b5cf6', '#3b82f6']}
              height={350}
              loading={loading}
            />
          </div>
        </div>

        {/* Detailed Airlines Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Airline Performance Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Airline
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Consolidator
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Duffel
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cons. Rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Avg Comm %
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Profit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading data...
                    </td>
                  </tr>
                ) : !data?.topAirlines.length ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No routing data available for the selected period
                    </td>
                  </tr>
                ) : (
                  data.topAirlines.map((airline, idx) => (
                    <tr key={airline.airlineCode} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center text-xs">
                            {airline.airlineCode}
                          </span>
                          <span className="font-medium text-gray-900">{airline.airlineCode}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">
                        {airline.count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-purple-600 font-medium">
                        {airline.consolidator.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-blue-600 font-medium">
                        {airline.duffel.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          airline.count > 0 && (airline.consolidator / airline.count) > 0.5
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {airline.count > 0 ? formatPercent((airline.consolidator / airline.count) * 100) : '0%'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        {formatPercent(airline.avgCommission)}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 font-bold">
                        {formatCurrency(airline.totalProfit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Footer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <GitBranch className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Hybrid Routing Engine</h4>
              <p className="text-sm text-blue-700 mt-1">
                Automatically routes flights to maximize profit:
                <span className="font-medium"> Consolidator</span> (Downtown Travel) for high-commission airlines (commission &gt; $5),
                <span className="font-medium"> Duffel</span> for LCCs and low-commission fares.
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
