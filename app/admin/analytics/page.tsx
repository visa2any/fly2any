'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Chart from '@/components/admin/Chart';
import {
  BarChart3,
  TrendingUp,
  Users,
  Plane,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<any>({});

  const fetchAnalytics = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/analytics?type=${type}&period=${period}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error(`Error fetching ${type} analytics:`, error);
      return [];
    }
  };

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      const [bookings, revenue, routes, devices, status, cabinClass, airlines, conversion] =
        await Promise.all([
          fetchAnalytics('bookings'),
          fetchAnalytics('revenue'),
          fetchAnalytics('routes'),
          fetchAnalytics('devices'),
          fetchAnalytics('status'),
          fetchAnalytics('cabinClass'),
          fetchAnalytics('airlines'),
          fetchAnalytics('conversion'),
        ]);

      setAnalyticsData({
        bookings,
        revenue,
        routes,
        devices,
        status,
        cabinClass,
        airlines,
        conversion,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, [period]);

  const exportReport = () => {
    console.log('Exporting analytics report...');
    // Implement PDF/CSV export
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-sm text-gray-600 mt-1">
              Deep dive into business metrics and trends
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>

            <button
              onClick={loadAllAnalytics}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={exportReport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Bookings Trend */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Bookings Trend</h3>
            </div>
          </div>
          <Chart
            type="line"
            data={analyticsData.bookings || []}
            dataKeys={['bookings', 'confirmed', 'pending', 'cancelled']}
            xAxisKey="date"
            colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
            height={350}
            loading={loading}
          />
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
            </div>
          </div>
          <Chart
            type="area"
            data={analyticsData.revenue || []}
            dataKeys={['revenue']}
            xAxisKey="date"
            colors={['#10b981']}
            height={350}
            loading={loading}
          />
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Status Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Status</h3>
            <Chart
              type="donut"
              data={analyticsData.status || []}
              dataKeys={['count']}
              colors={['#10b981', '#f59e0b', '#3b82f6', '#ef4444']}
              height={300}
              loading={loading}
            />
          </div>

          {/* Device Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Devices Used</h3>
            <Chart
              type="pie"
              data={analyticsData.devices || []}
              dataKeys={['users']}
              colors={['#3b82f6', '#10b981', '#f59e0b']}
              height={300}
              loading={loading}
            />
          </div>
        </div>

        {/* Popular Routes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Popular Routes</h3>
          </div>
          <Chart
            type="bar"
            data={analyticsData.routes || []}
            dataKeys={['bookings', 'revenue']}
            xAxisKey="route"
            colors={['#3b82f6', '#10b981']}
            height={400}
            loading={loading}
          />
        </div>

        {/* Cabin Class Performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cabin Class Performance</h3>
          <Chart
            type="bar"
            data={analyticsData.cabinClass || []}
            dataKeys={['bookings', 'revenue']}
            xAxisKey="class"
            colors={['#8b5cf6', '#10b981']}
            height={350}
            loading={loading}
          />
        </div>

        {/* Airlines Performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Airlines</h3>
          <Chart
            type="bar"
            data={analyticsData.airlines || []}
            dataKeys={['bookings', 'revenue']}
            xAxisKey="airline"
            colors={['#3b82f6', '#10b981']}
            height={350}
            loading={loading}
          />
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-900">Conversion Funnel</h3>
          </div>
          <Chart
            type="bar"
            data={analyticsData.conversion || []}
            dataKeys={['count']}
            xAxisKey="stage"
            colors={['#f59e0b']}
            height={350}
            loading={loading}
          />
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Conversion Rate:{' '}
              <span className="font-semibold text-gray-900">
                {analyticsData.conversion && analyticsData.conversion.length > 0
                  ? (
                      (analyticsData.conversion[analyticsData.conversion.length - 1]?.count /
                        analyticsData.conversion[0]?.count) *
                      100
                    ).toFixed(2)
                  : 0}
                %
              </span>
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
