'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import MetricCard from '@/components/admin/MetricCard';
import Chart from '@/components/admin/Chart';
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Activity,
  RefreshCw,
  Download,
  Bot,
  Cpu,
} from 'lucide-react';

interface DashboardStats {
  period: string;
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    revenue: number;
    averageValue: number;
    change: number;
  };
  users: {
    total: number;
    active: number;
    new: number;
    change: number;
    registrationsByDay: Array<{ date: string; count: number }>;
  };
  searches: {
    total: number;
    flights: number;
    hotels: number;
    cars: number;
    conversion: number;
    change: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
    byDay: Array<{ date: string; amount: number }>;
    averageBookingValue: number;
  };
  topRoutes: Array<{
    from: string;
    to: string;
    count: number;
    revenue: number;
  }>;
}

interface AIStats {
  groq: {
    dailyCount: number;
    dailyLimit: number;
    dailyRemaining: number;
    percentUsed: number;
  };
  infrastructure: {
    redisEnabled: boolean;
    redisHealthy: boolean;
    rateLimitingMode: string;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [aiStats, setAIStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, aiRes] = await Promise.all([
        fetch(`/api/admin/stats?period=${period}`),
        fetch('/api/admin/ai/stats'),
      ]);

      const [data, aiData] = await Promise.all([
        statsRes.json(),
        aiRes.json(),
      ]);

      if (data.success) {
        setStats(data.stats);
        setLastRefresh(new Date());
      }
      if (aiData.success) {
        setAIStats(aiData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [period]);

  const exportData = () => {
    // Implement export functionality
    console.log('Exporting data...');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Period selector */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>

            <button
              onClick={fetchStats}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={exportData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Total Revenue"
            value={`$${stats?.revenue.total.toLocaleString() || '0'}`}
            change={stats?.revenue.change}
            subValue={`$${stats?.revenue.thisMonth.toLocaleString() || '0'} this month`}
            color="green"
            loading={loading}
          />

          <MetricCard
            icon={<Calendar className="w-5 h-5" />}
            label="Total Bookings"
            value={stats?.bookings.total.toLocaleString() || '0'}
            change={stats?.bookings.change}
            subValue={`${stats?.bookings.pending || 0} pending`}
            color="blue"
            loading={loading}
            href="/admin/bookings"
          />

          <MetricCard
            icon={<Users className="w-5 h-5" />}
            label="Total Users"
            value={stats?.users.total.toLocaleString() || '0'}
            change={stats?.users.change}
            subValue={`${stats?.users.new || 0} new this week`}
            color="purple"
            loading={loading}
            href="/admin/users"
          />

          <MetricCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Conversion Rate"
            value={`${stats?.searches.conversion.toFixed(1) || '0'}%`}
            change={2.3}
            subValue={`${stats?.searches.total.toLocaleString() || '0'} searches`}
            color="orange"
            loading={loading}
          />
        </div>

        {/* AI & Infrastructure Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<Bot className="w-5 h-5" />}
            label="Groq AI Usage"
            value={`${aiStats?.groq.percentUsed || 0}%`}
            subValue={`${aiStats?.groq.dailyRemaining?.toLocaleString() || '14,400'} / ${aiStats?.groq.dailyLimit?.toLocaleString() || '14,400'} remaining`}
            color={aiStats?.groq.percentUsed && aiStats.groq.percentUsed > 80 ? 'red' : 'blue'}
            loading={loading}
            href="/admin/ai-analytics"
          />

          <MetricCard
            icon={<Cpu className="w-5 h-5" />}
            label="Redis Status"
            value={aiStats?.infrastructure.redisHealthy ? 'Healthy' : 'Offline'}
            subValue={aiStats?.infrastructure.rateLimitingMode === 'distributed' ? 'Distributed mode' : 'Memory fallback'}
            color={aiStats?.infrastructure.redisHealthy ? 'green' : 'red'}
            loading={loading}
          />

          <MetricCard
            icon={<Activity className="w-5 h-5" />}
            label="Flight Searches"
            value={stats?.searches.flights.toLocaleString() || '0'}
            subValue="API calls today"
            color="purple"
            loading={loading}
          />

          <MetricCard
            icon={<Activity className="w-5 h-5" />}
            label="Hotel Searches"
            value={stats?.searches.hotels.toLocaleString() || '0'}
            subValue="API calls today"
            color="orange"
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Over Time */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Over Time</h3>
            <Chart
              type="area"
              data={stats?.revenue.byDay || []}
              dataKeys={['amount']}
              xAxisKey="date"
              colors={['#10b981']}
              height={300}
              loading={loading}
            />
          </div>

          {/* User Registrations */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">User Registrations</h3>
            <Chart
              type="line"
              data={stats?.users.registrationsByDay || []}
              dataKeys={['count']}
              xAxisKey="date"
              colors={['#8b5cf6']}
              height={300}
              loading={loading}
            />
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Routes</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <Chart
              type="bar"
              data={
                stats?.topRoutes.map((route) => ({
                  route: `${route.from} → ${route.to}`,
                  bookings: route.count,
                  revenue: route.revenue,
                })) || []
              }
              dataKeys={['bookings', 'revenue']}
              xAxisKey="route"
              colors={['#3b82f6', '#10b981']}
              height={350}
            />
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Booking Status</h4>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Confirmed:</span>
                <span className="font-semibold text-green-700">
                  {stats?.bookings.confirmed || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-yellow-700">
                  {stats?.bookings.pending || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cancelled:</span>
                <span className="font-semibold text-red-700">
                  {stats?.bookings.cancelled || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Average Values</h4>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Booking Value:</span>
                <span className="font-semibold text-gray-900">
                  ${stats?.bookings.averageValue || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Revenue:</span>
                <span className="font-semibold text-gray-900">
                  ${stats?.revenue.thisMonth.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">User Activity</h4>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Users:</span>
                <span className="font-semibold text-gray-900">
                  {stats?.users.active || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New This Week:</span>
                <span className="font-semibold text-gray-900">{stats?.users.new || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
