'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Mail, 
  MailX, 
  TrendingUp, 
  Users, 
  Zap,
  RefreshCw,
  Download,
  Settings,
  Bell,
  XCircle
} from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: string;
  levelName: string;
  event: string;
  message: string;
  campaignId?: string;
  contactId?: string;
  email?: string;
  metadata?: any;
  duration?: number;
  error?: any;
}

interface AlertData {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  campaignId?: string;
  acknowledged: boolean;
  resolvedAt?: string;
  actions?: string[];
}

interface DashboardStats {
  overview: {
    totalEvents: number;
    errorRate: string;
    criticalCount: number;
    timeRange: string;
  };
  systemHealth: {
    status: string;
    uptime: number;
    memoryUsage: any;
  };
  eventsByLevel: Record<string, number>;
  eventsByType: Record<string, number>;
  recentErrors: LogEntry[];
  campaignPerformance: any[];
}

interface AlertStats {
  overview: {
    totalAlerts: number;
    activeAlerts: number;
    criticalAlerts: number;
    errorAlerts: number;
    warningAlerts: number;
    acknowledgedRate: number;
  };
  recentActivity: AlertData[];
  topAlerts: AlertData[];
  systemHealth: {
    status: string;
    score: number;
    summary: string;
  };
}

export default function EmailMarketingMonitoringPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [realtimeLogs, setRealtimeLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [selectedTimeRange, setSelectedTimeRange] = useState('24');

  useEffect(() => {
    fetchDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData();
        fetchRealtimeLogs();
      }, refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedTimeRange]);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      const [logsResponse, alertsResponse] = await Promise.all([
        fetch(`/api/email-marketing/logs?action=dashboard&hours=${selectedTimeRange}`),
        fetch('/api/email-marketing/alerts?action=dashboard')
      ]);

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        if (logsData.success) {
          setDashboardStats(logsData.data);
        }
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        if (alertsData.success) {
          setAlertStats(alertsData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeLogs = async (): Promise<void> => {
    try {
      const response = await fetch('/api/email-marketing/logs?action=realtime');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRealtimeLogs(data.data.entries);
        }
      }
    } catch (error) {
      console.error('Error fetching realtime logs:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/email-marketing/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge', alertId })
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const exportLogs = async (format: 'json' | 'csv' = 'csv') => {
    try {
      const response = await fetch(`/api/email-marketing/logs?action=export&format=${format}&hours=${selectedTimeRange}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-marketing-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading monitoring dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Marketing Monitoring</h1>
            <p className="text-gray-600 mt-1">Real-time monitoring and alerting dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Time Range:</label>
              <select
                value={selectedTimeRange}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="1">Last Hour</option>
                <option value="6">Last 6 Hours</option>
                <option value="24">Last 24 Hours</option>
                <option value="168">Last Week</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
            >
              <Activity className="w-4 h-4 mr-2" />
              Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportLogs('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        {alertStats && (
          <div className={`p-4 border-l-4 rounded-lg ${
            alertStats.systemHealth.status === 'healthy' ? 'border-l-green-500 bg-green-50' :
            alertStats.systemHealth.status === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
            'border-l-red-500 bg-red-50'
          }`}>
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <div className="flex items-center justify-between w-full">
                <h3 className="font-semibold">
                  System Health: {alertStats.systemHealth.status.toUpperCase()}
                </h3>
                <Badge className={getStatusColor(alertStats.systemHealth.status)}>
                  Score: {alertStats.systemHealth.score}/100
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              {alertStats.systemHealth.summary}
            </p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.overview.totalEvents.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{dashboardStats.overview.timeRange}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.overview.errorRate}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.overview.criticalCount} critical issues
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {alertStats && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alertStats.overview.activeAlerts}</div>
                  <p className="text-xs text-muted-foreground">
                    {alertStats.overview.criticalAlerts} critical, {alertStats.overview.errorAlerts} errors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats?.systemHealth?.uptime ? formatUptime(dashboardStats.systemHealth.uptime) : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats?.systemHealth?.memoryUsage ? formatMemory(dashboardStats.systemHealth.memoryUsage.heapUsed) : 'N/A'} memory used
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="logs">Live Logs</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Events by Level */}
              {dashboardStats?.eventsByLevel && (
                <Card>
                  <CardHeader>
                    <CardTitle>Events by Level</CardTitle>
                    <CardDescription>Distribution of log events by severity level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(dashboardStats.eventsByLevel).map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={getAlertLevelColor(level.toLowerCase())}>
                              {level}
                            </Badge>
                          </div>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Errors */}
              {dashboardStats?.recentErrors && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Errors</CardTitle>
                    <CardDescription>Latest error events requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {dashboardStats.recentErrors.slice(0, 5).map((error, index) => (
                        <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="destructive" className="text-xs">
                              {error.event}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(error.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800">{error.message}</p>
                          {error.campaignId && (
                            <p className="text-xs text-gray-600 mt-1">
                              Campaign: {error.campaignId}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            {alertStats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Priority Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Critical & Error Alerts
                      <Badge variant="destructive">
                        {alertStats.overview.criticalAlerts + alertStats.overview.errorAlerts}
                      </Badge>
                    </CardTitle>
                    <CardDescription>High priority alerts requiring immediate attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {alertStats.topAlerts.map((alert) => (
                        <div key={alert.id} className={`p-4 border rounded-lg ${getAlertLevelColor(alert.level)}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge className={getAlertLevelColor(alert.level)}>
                                {alert.level.toUpperCase()}
                              </Badge>
                              <span className="font-semibold text-sm">{alert.title}</span>
                            </div>
                            <div className="flex space-x-2">
                              {!alert.acknowledged && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => acknowledgeAlert(alert.id)}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Ack
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm mb-2">{alert.message}</p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            {alert.acknowledged && (
                              <Badge variant="secondary" className="text-xs">
                                Acknowledged
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Alert Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Alert Activity</CardTitle>
                    <CardDescription>Latest alerts from all severity levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {alertStats.recentActivity.map((alert) => (
                        <div key={alert.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <Badge className={getAlertLevelColor(alert.level)}>
                              {alert.level}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Live Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Live Log Stream
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{realtimeLogs.length} entries</Badge>
                    <Button size="sm" variant="outline" onClick={fetchRealtimeLogs}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>Real-time log entries from email marketing operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
                  {realtimeLogs.map((log, index) => (
                    <div key={index} className={`p-2 rounded border-l-4 ${
                      log.levelName === 'ERROR' || log.levelName === 'CRITICAL' ? 'border-l-red-500 bg-red-50' :
                      log.levelName === 'WARN' ? 'border-l-yellow-500 bg-yellow-50' :
                      log.levelName === 'INFO' ? 'border-l-blue-500 bg-blue-50' :
                      'border-l-gray-500 bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {log.levelName}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {log.event}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.campaignId && (
                        <p className="text-xs text-gray-600 mt-1">
                          Campaign: {log.campaignId}
                        </p>
                      )}
                      {log.email && (
                        <p className="text-xs text-gray-600">
                          Email: {log.email}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Performance metrics for recent email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardStats?.campaignPerformance && dashboardStats.campaignPerformance.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardStats.campaignPerformance.map((campaign, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{campaign.campaignId}</h4>
                          <Badge variant="outline">{campaign.events} events</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Last activity: {campaign.lastActivity}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No campaign data available for the selected time range
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Metrics</CardTitle>
                  <CardDescription>Current system performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.systemHealth && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status</span>
                        <Badge className={getStatusColor(dashboardStats.systemHealth.status)}>
                          {dashboardStats.systemHealth.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Uptime</span>
                        <span className="text-sm">{formatUptime(dashboardStats.systemHealth.uptime)}</span>
                      </div>
                      {dashboardStats.systemHealth.memoryUsage && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Memory Used</span>
                            <span className="text-sm">{formatMemory(dashboardStats.systemHealth.memoryUsage.heapUsed)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Memory Total</span>
                            <span className="text-sm">{formatMemory(dashboardStats.systemHealth.memoryUsage.heapTotal)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Statistics</CardTitle>
                  <CardDescription>Breakdown of events by type</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.eventsByType && (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Object.entries(dashboardStats.eventsByType)
                        .sort(([,a], [,b]) => b - a)
                        .map(([event, count]) => (
                          <div key={event} className="flex justify-between items-center">
                            <span className="text-sm font-medium">{event.replace(/_/g, ' ')}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}