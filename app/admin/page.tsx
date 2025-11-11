'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Plane,
  Calendar,
  Settings,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Database,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Brain,
  Package,
  Hotel,
  Car,
  Shield,
  Webhook,
  Bot
} from 'lucide-react';

// ===========================
// TYPE DEFINITIONS
// ===========================

interface DashboardMetrics {
  revenue: {
    total: number;
    change: number;
    thisMonth: number;
    lastMonth: number;
  };
  bookings: {
    total: number;
    change: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  users: {
    total: number;
    change: number;
    active: number;
    new: number;
  };
  searches: {
    total: number;
    change: number;
    flights: number;
    hotels: number;
    cars: number;
  };
  ml: {
    totalSavings: number;
    savingsPercentage: number;
    cacheHitRate: number;
    apiCallsSaved: number;
    mlReadiness: string;
  };
  systemHealth: {
    redis: boolean;
    amadeus: boolean;
    duffel: boolean;
    database: boolean;
  };
}

// ===========================
// SUB-COMPONENTS
// ===========================

const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  subValue?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  href?: string;
}> = ({ icon, label, value, change, subValue, color = 'blue', href }) => {
  const colorClasses = {
    blue: { bg: 'from-blue-500 to-blue-600', border: 'border-blue-200', text: 'text-blue-700' },
    green: { bg: 'from-green-500 to-green-600', border: 'border-green-200', text: 'text-green-700' },
    purple: { bg: 'from-purple-500 to-purple-600', border: 'border-purple-200', text: 'text-purple-700' },
    orange: { bg: 'from-orange-500 to-orange-600', border: 'border-orange-200', text: 'text-orange-700' },
    red: { bg: 'from-red-500 to-red-600', border: 'border-red-200', text: 'text-red-700' },
  };

  const colors = colorClasses[color];

  const content = (
    <div className={`relative overflow-hidden bg-white rounded-xl border ${colors.border} shadow-sm hover:shadow-md transition-all p-3 ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`rounded-lg bg-gradient-to-br ${colors.bg} p-2 shadow-md text-white`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className={`text-xl font-bold ${colors.text}`}>{value}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
      </div>

      {href && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href} className="group">{content}</Link> : content;
};

const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  href: string;
  color?: string;
}> = ({ icon, label, href, color = 'blue' }) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 p-3 bg-white rounded-lg border border-gray-200 hover:border-${color}-300 hover:shadow-md transition-all group`}
    >
      <div className={`rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 p-1.5 shadow-sm text-white`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
    </Link>
  );
};

const SystemHealthIndicator: React.FC<{
  label: string;
  status: boolean;
}> = ({ label, status }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-1.5">
        {status ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700">Online</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-red-700">Offline</span>
          </>
        )}
      </div>
    </div>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Fetch ML analytics
      const mlResponse = await fetch('/api/ml/analytics?period=7d');

      if (!mlResponse.ok) {
        throw new Error(`Analytics API returned ${mlResponse.status}`);
      }

      const mlData = await mlResponse.json();

      // Mock other metrics (in production, these would come from real APIs)
      const mockMetrics: DashboardMetrics = {
        revenue: {
          total: 125000,
          change: 12.5,
          thisMonth: 45000,
          lastMonth: 40000,
        },
        bookings: {
          total: 1250,
          change: 8.3,
          pending: 45,
          confirmed: 1100,
          cancelled: 105,
        },
        users: {
          total: 5420,
          change: 15.2,
          active: 3200,
          new: 320,
        },
        searches: {
          total: mlData.overview?.totalSearches || 0,
          change: 25.3,
          flights: mlData.overview?.totalSearches || 0,
          hotels: 1200,
          cars: 450,
        },
        ml: {
          totalSavings: mlData.costSavings?.totalSavings || 0,
          savingsPercentage: mlData.costSavings?.savingsPercentage || 0,
          cacheHitRate: mlData.costSavings?.cacheHitRate || 0,
          apiCallsSaved: mlData.apiEfficiency?.callsSaved || 0,
          mlReadiness: mlData.health?.mlReadiness || 'warming_up',
        },
        systemHealth: {
          redis: mlData.health?.redisConnected || false,
          amadeus: true,
          duffel: true,
          database: true,
        },
      };

      setMetrics(mockMetrics);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2 shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              Fly2Any Admin Dashboard
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Last updated: {lastRefresh.toLocaleTimeString()} · Real-time system monitoring
            </p>
          </div>

          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Total Revenue"
            value={`$${metrics?.revenue.total.toLocaleString()}`}
            change={metrics?.revenue.change}
            subValue={`$${metrics?.revenue.thisMonth.toLocaleString()} this month`}
            color="green"
          />

          <MetricCard
            icon={<Calendar className="w-5 h-5" />}
            label="Total Bookings"
            value={metrics?.bookings.total.toLocaleString() || '0'}
            change={metrics?.bookings.change}
            subValue={`${metrics?.bookings.pending} pending`}
            color="blue"
          />

          <MetricCard
            icon={<Users className="w-5 h-5" />}
            label="Total Users"
            value={metrics?.users.total.toLocaleString() || '0'}
            change={metrics?.users.change}
            subValue={`${metrics?.users.new} new this week`}
            color="purple"
          />

          <MetricCard
            icon={<Activity className="w-5 h-5" />}
            label="Total Searches"
            value={metrics?.searches.total.toLocaleString() || '0'}
            change={metrics?.searches.change}
            subValue={`${metrics?.searches.flights.toLocaleString()} flights`}
            color="orange"
          />
        </div>

        {/* ML Cost Savings Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-purple-600 to-blue-600 rounded-xl shadow-lg p-4 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-blue-600/50 backdrop-blur-sm" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/20 backdrop-blur-md p-2.5">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-0.5">ML Cost Optimization Active</h2>
                <p className="text-purple-100 text-xs">
                  Status: {metrics?.ml.mlReadiness === 'ready' ? 'Fully Optimized' : 'Warming Up'} ·
                  Cache Hit Rate: {metrics?.ml.cacheHitRate.toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold mb-0.5">
                ${metrics?.ml.totalSavings.toLocaleString()}
              </div>
              <div className="text-purple-100 text-xs mb-1.5">
                {metrics?.ml.savingsPercentage.toFixed(1)}% cost reduction
              </div>
              <Link
                href="/ml/dashboard"
                className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
              >
                View ML Dashboard
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Quick Actions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <QuickAction
                icon={<Brain className="w-4 h-4" />}
                label="ML Cost Savings"
                href="/ml/dashboard"
                color="purple"
              />

              <QuickAction
                icon={<Bot className="w-4 h-4" />}
                label="AI Analytics"
                href="/admin/ai-analytics"
                color="pink"
              />

              <QuickAction
                icon={<Calendar className="w-4 h-4" />}
                label="Manage Bookings"
                href="/admin/bookings"
                color="blue"
              />

              <QuickAction
                icon={<Webhook className="w-4 h-4" />}
                label="Webhook Events"
                href="/admin/webhooks"
                color="purple"
              />

              <QuickAction
                icon={<Users className="w-4 h-4" />}
                label="User Management"
                href="/admin/users"
                color="green"
              />

              <QuickAction
                icon={<BarChart3 className="w-4 h-4" />}
                label="Analytics & Reports"
                href="/admin/analytics"
                color="orange"
              />

              <QuickAction
                icon={<Settings className="w-4 h-4" />}
                label="System Settings"
                href="/admin/settings"
                color="gray"
              />

              <QuickAction
                icon={<Database className="w-4 h-4" />}
                label="API Management"
                href="/admin/api"
                color="red"
              />
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              System Health
            </h3>

            <div className="space-y-0.5">
              <SystemHealthIndicator
                label="Redis Cache"
                status={metrics?.systemHealth.redis || false}
              />
              <SystemHealthIndicator
                label="Amadeus API"
                status={metrics?.systemHealth.amadeus || false}
              />
              <SystemHealthIndicator
                label="Duffel API"
                status={metrics?.systemHealth.duffel || false}
              />
              <SystemHealthIndicator
                label="Database"
                status={metrics?.systemHealth.database || false}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">ML System</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  metrics?.ml.mlReadiness === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {metrics?.ml.mlReadiness === 'ready' ? 'Ready' : 'Warming Up'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2 shadow-sm text-white">
                <Plane className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-gray-900">Flight Bookings</h4>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Confirmed:</span>
                <span className="font-semibold text-gray-900">{metrics?.bookings.confirmed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-yellow-700">{metrics?.bookings.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cancelled:</span>
                <span className="font-semibold text-red-700">{metrics?.bookings.cancelled}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-2 shadow-sm text-white">
                <Hotel className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-gray-900">Hotel Searches</h4>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This week:</span>
                <span className="font-semibold text-gray-900">{metrics?.searches.hotels}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conversion:</span>
                <span className="font-semibold text-green-700">12.5%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-2 shadow-sm text-white">
                <Car className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-gray-900">Car Rentals</h4>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This week:</span>
                <span className="font-semibold text-gray-900">{metrics?.searches.cars}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conversion:</span>
                <span className="font-semibold text-purple-700">8.3%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Recent Activity
          </h3>

          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">New booking confirmed</p>
                <p className="text-xs text-gray-600">JFK → LAX · $450 · 2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="rounded-full bg-blue-100 p-2">
                <Brain className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">ML pre-fetch completed</p>
                <p className="text-xs text-gray-600">50 routes cached · $12.50 saved · 15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="rounded-full bg-purple-100 p-2">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">15 new user registrations</p>
                <p className="text-xs text-gray-600">Last hour</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
