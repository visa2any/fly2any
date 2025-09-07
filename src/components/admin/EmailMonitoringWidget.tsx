/**
 * 📊 EMAIL MONITORING WIDGET
 * Real-time email system monitoring widget for admin dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

interface MonitoringData {
  emailsInQueue: number;
  emailsProcessingPerMinute: number;
  lastEmailSent: string;
  systemHealth: 'healthy' | 'warning' | 'critical';
  apiRateLimitUsage: number;
  webhookEventsProcessed: number;
  providerStatus: {
    provider: string;
    status: 'healthy' | 'warning' | 'critical';
    latency: number;
  }[];
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  createdAt: string;
  timeSinceCreated: string;
  isRecent: boolean;
}

export default function EmailMonitoringWidget() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch monitoring data
  const fetchMonitoringData = async (): Promise<void> => {
    try {
      const [monitoringRes, alertsRes] = await Promise.all([
        fetch('/api/email-marketing/v2?action=realtime'),
        fetch('/api/email-marketing/v2?action=alerts&limit=3&resolved=false')
      ]);

      if (monitoringRes.ok) {
        const data = await monitoringRes.json();
        setMonitoringData(data);
      }

      if (alertsRes.ok) {
        const alertData = await alertsRes.json();
        setRecentAlerts(alertData.alerts || []);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    fetchMonitoringData();
    
    const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircleIcon className="h-5 w-5" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'critical': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return <ClockIcon className="h-5 w-5" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <EnvelopeIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Email System</h3>
              <p className="text-sm text-gray-600">Real-time monitoring</p>
            </div>
          </div>
          
          {monitoringData && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getHealthColor(monitoringData.systemHealth)}`}>
              {getHealthIcon(monitoringData.systemHealth)}
              <span className="capitalize">{monitoringData.systemHealth}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {monitoringData ? (
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Queue</span>
                </div>
                <div className="text-xl font-bold text-blue-900">
                  {monitoringData.emailsInQueue}
                </div>
                <div className="text-xs text-blue-600">emails pending</div>
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ChartBarIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Processing</span>
                </div>
                <div className="text-xl font-bold text-green-900">
                  {monitoringData.emailsProcessingPerMinute}
                </div>
                <div className="text-xs text-green-600">per minute</div>
              </div>
            </div>

            {/* Provider Status */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Email Providers</div>
              <div className="space-y-2">
                {monitoringData.providerStatus.map((provider, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        provider.status === 'healthy' ? 'bg-green-500' :
                        provider.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium">{provider.provider}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <WifiIcon className="h-3 w-3" />
                      <span>{provider.latency}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Usage */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">API Usage</span>
                <span className="text-gray-600">{monitoringData.apiRateLimitUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    monitoringData.apiRateLimitUsage < 70 ? 'bg-green-500' :
                    monitoringData.apiRateLimitUsage < 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${monitoringData.apiRateLimitUsage}%` }}
                ></div>
              </div>
            </div>

            {/* Recent Alerts */}
            {recentAlerts.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Recent Alerts</div>
                <div className="space-y-2">
                  {recentAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-2 rounded-lg border-l-4 ${
                        alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                        alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{alert.message}</div>
                        </div>
                        <div className="text-xs text-gray-500 ml-2">
                          {alert.timeSinceCreated}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Activity */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Last email sent: {formatTimestamp(monitoringData.lastEmailSent)}</span>
                <span>Updated: {formatTimestamp(lastRefresh.toISOString())}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <div className="text-sm text-gray-600 font-medium">
              Monitoring data unavailable
            </div>
            <button 
              onClick={fetchMonitoringData}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}