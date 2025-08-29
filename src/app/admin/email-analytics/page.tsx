/**
 * 📊 COMPREHENSIVE EMAIL ANALYTICS DASHBOARD
 * Real-time monitoring and analytics for Mailgun email marketing system
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  EnvelopeIcon, 
  ChartBarIcon, 
  EyeIcon, 
  CursorArrowRippleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface EmailMetrics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  complaints: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  complaintRate: number;
}

interface CampaignPerformance {
  id: string;
  name: string;
  type: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenue: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  roi: number;
  status: string;
  createdAt: string;
  sentAt?: string;
}

interface TimeSeriesData {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

interface ProviderStats {
  provider: string;
  sent: number;
  delivered: number;
  failed: number;
  deliveryRate: number;
  avgResponseTime: number;
  status: 'healthy' | 'warning' | 'error';
}

interface RealtimeStats {
  emailsInQueue: number;
  emailsProcessingPerMinute: number;
  lastEmailSent: string;
  systemHealth: 'healthy' | 'warning' | 'error';
  apiRateLimitUsage: number;
  webhookEventsProcessed: number;
}

export default function EmailAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedCampaignType, setSelectedCampaignType] = useState('all');
  
  // Dashboard Data
  const [emailMetrics, setEmailMetrics] = useState<EmailMetrics | null>(null);
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [topPerformers, setTopPerformers] = useState<CampaignPerformance[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  // Load dashboard data
  const loadAnalytics = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const [
        metricsRes,
        campaignsRes,
        timeSeriesRes,
        providersRes,
        realtimeRes,
        alertsRes
      ] = await Promise.all([
        fetch(`/api/admin/email-analytics/metrics?timeRange=${selectedTimeRange}`),
        fetch(`/api/admin/email-analytics/campaigns?timeRange=${selectedTimeRange}&type=${selectedCampaignType}`),
        fetch(`/api/admin/email-analytics/timeseries?timeRange=${selectedTimeRange}`),
        fetch('/api/admin/email-analytics/providers'),
        fetch('/api/admin/email-analytics/realtime'),
        fetch('/api/admin/email-analytics/alerts')
      ]);

      if (metricsRes.ok) {
        const metrics = await metricsRes.json();
        setEmailMetrics(metrics);
      }

      if (campaignsRes.ok) {
        const campaigns = await campaignsRes.json();
        setCampaignPerformance(campaigns.campaigns);
        setTopPerformers(campaigns.topPerformers);
      }

      if (timeSeriesRes.ok) {
        const timeSeries = await timeSeriesRes.json();
        setTimeSeriesData(timeSeries);
      }

      if (providersRes.ok) {
        const providers = await providersRes.json();
        setProviderStats(providers);
      }

      if (realtimeRes.ok) {
        const realtime = await realtimeRes.json();
        setRealtimeStats(realtime);
      }

      if (alertsRes.ok) {
        const alerts = await alertsRes.json();
        setRecentAlerts(alerts);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh realtime data
  useEffect(() => {
    loadAnalytics();
    
    const interval = setInterval(() => {
      loadAnalytics();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedTimeRange, selectedCampaignType]);

  // Chart configurations
  const deliverabilityChartData = {
    labels: timeSeriesData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Delivered',
        data: timeSeriesData.map(d => d.delivered),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Opened',
        data: timeSeriesData.map(d => d.opened),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Clicked',
        data: timeSeriesData.map(d => d.clicked),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const performanceMetricsData = {
    labels: ['Delivery Rate', 'Open Rate', 'Click Rate', 'Conversion Rate'],
    datasets: [{
      data: [
        emailMetrics?.deliveryRate || 0,
        emailMetrics?.openRate || 0,
        emailMetrics?.clickRate || 0,
        ((emailMetrics?.clicked || 0) / (emailMetrics?.delivered || 1)) * 100
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(249, 115, 22, 0.8)'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading email analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive monitoring and analytics for your email marketing campaigns</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTimeRange(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <select
                value={selectedCampaignType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCampaignType(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Campaigns</option>
                <option value="welcome_series">Welcome Series</option>
                <option value="promotional">Promotional</option>
                <option value="newsletter">Newsletter</option>
                <option value="transactional">Transactional</option>
              </select>
              <button
                onClick={() => loadAnalytics(true)}
                disabled={refreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {refreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : null}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Status Bar */}
        {realtimeStats && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            realtimeStats.systemHealth === 'healthy' 
              ? 'bg-green-50 border-green-500' 
              : realtimeStats.systemHealth === 'warning'
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    realtimeStats.systemHealth === 'healthy' 
                      ? 'bg-green-500' 
                      : realtimeStats.systemHealth === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium">System Status: {realtimeStats.systemHealth.toUpperCase()}</span>
                </div>
                <span className="text-gray-600">|</span>
                <span>Queue: {realtimeStats.emailsInQueue} emails</span>
                <span className="text-gray-600">|</span>
                <span>Processing: {realtimeStats.emailsProcessingPerMinute}/min</span>
                <span className="text-gray-600">|</span>
                <span>API Usage: {realtimeStats.apiRateLimitUsage}%</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date(realtimeStats.lastEmailSent).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        {emailMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Sent</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(emailMetrics.totalSent)}</p>
                </div>
                <EnvelopeIcon className="h-12 w-12 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12.5%</span>
                <span className="text-gray-500 ml-2">vs last period</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Delivery Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{emailMetrics.deliveryRate.toFixed(1)}%</p>
                </div>
                <CheckCircleIcon className="h-12 w-12 text-green-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+0.8%</span>
                <span className="text-gray-500 ml-2">vs last period</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Open Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{emailMetrics.openRate.toFixed(1)}%</p>
                </div>
                <EyeIcon className="h-12 w-12 text-purple-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">-2.1%</span>
                <span className="text-gray-500 ml-2">vs last period</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Click Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{emailMetrics.clickRate.toFixed(1)}%</p>
                </div>
                <CursorArrowRippleIcon className="h-12 w-12 text-orange-500" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+3.2%</span>
                <span className="text-gray-500 ml-2">vs last period</span>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Deliverability Trends */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Performance Trends</h3>
            <div style={{ height: '300px' }}>
              <Line 
                data={deliverabilityChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }} 
              />
            </div>
          </div>

          {/* Performance Metrics Breakdown */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div style={{ height: '300px' }}>
              <Doughnut 
                data={performanceMetricsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Provider Statistics */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Provider Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providerStats.map((provider, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {provider.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        provider.status === 'healthy' 
                          ? 'bg-green-100 text-green-800'
                          : provider.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(provider.sent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(provider.delivered)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(provider.failed)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.deliveryRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.avgResponseTime}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Performance Table */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Campaign Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaignPerformance.slice(0, 10).map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">
                          {campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : 'Draft'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="capitalize">{campaign.type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        campaign.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : campaign.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : campaign.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(campaign.sent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.openRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.clickRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.conversionRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(campaign.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={campaign.roi > 0 ? 'text-green-600' : 'text-red-600'}>
                        {campaign.roi > 0 ? '+' : ''}{campaign.roi.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
            <div className="space-y-4">
              {recentAlerts.slice(0, 5).map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 border-red-500'
                    : alert.severity === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className={`h-5 w-5 mr-2 ${
                          alert.severity === 'critical' ? 'text-red-500' :
                          alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <span className="font-medium">{alert.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(alert.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}