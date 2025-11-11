'use client';

/**
 * Price Monitor Control Panel
 * Admin interface for managing the automated price monitoring system
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ExecutionLog {
  id: string;
  executionTime: string;
  alertsChecked: number;
  alertsTriggered: number;
  alertsFailed: number;
  duration: number;
  triggeredBy: string;
  hasErrors: boolean;
  errors?: any;
}

interface MonitorStatus {
  status: 'healthy' | 'degraded';
  statistics: {
    totalActiveAlerts: number;
    lastRun: string | null;
    nextScheduledRun: string | null;
    successRate: number;
    recentErrors: number;
  };
  lastExecution: {
    alertsChecked: number;
    alertsTriggered: number;
    alertsFailed: number;
    duration: number;
  } | null;
  health: {
    status: string;
    message: string;
  };
}

export function PriceMonitorControl() {
  const [status, setStatus] = useState<MonitorStatus | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
    fetchLogs();
  }, []);

  const fetchStatus = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/price-monitor/status');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status');
      }

      setStatus(data);
    } catch (err) {
      console.error('Error fetching status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/price-monitor/logs?limit=10');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch logs');
      }

      setLogs(data.logs);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const handleRunNow = async () => {
    setIsRunning(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/admin/price-monitor/run', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run monitoring');
      }

      setSuccessMessage(
        `Monitoring completed: ${data.summary.totalChecked} alerts checked, ${data.summary.totalTriggered} triggered, ${data.summary.totalFailed} failed`
      );

      // Refresh status and logs
      await fetchStatus();
      await fetchLogs();
    } catch (err) {
      console.error('Error running monitoring:', err);
      setError(err instanceof Error ? err.message : 'Failed to run monitoring');
    } finally {
      setIsRunning(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchStatus(), fetchLogs()]);
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Price Monitor Control</h2>
          <p className="text-sm text-gray-600">Manage automated price monitoring system</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleRunNow}
            disabled={isRunning}
            size="sm"
          >
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Now'}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Status Overview */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>System Status</span>
              <Badge
                variant={status.status === 'healthy' ? 'default' : 'destructive'}
                className={status.status === 'healthy' ? 'bg-green-100 text-green-800' : ''}
              >
                {status.status === 'healthy' ? (
                  <CheckCircle className="mr-1 h-3 w-3" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3" />
                )}
                {status.status.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>{status.health.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">
                  {status.statistics.totalActiveAlerts}
                </div>
                <div className="text-sm text-blue-600">Active Alerts</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-900">
                  {status.statistics.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-green-600">Success Rate</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-900">
                  {status.statistics.recentErrors}
                </div>
                <div className="text-sm text-yellow-600">Recent Errors</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-900">
                  {status.lastExecution?.duration ? formatDuration(status.lastExecution.duration) : 'N/A'}
                </div>
                <div className="text-sm text-purple-600">Last Duration</div>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Run:</span>
                <span className="font-medium">
                  {status.statistics.lastRun ? formatDate(status.statistics.lastRun) : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Scheduled:</span>
                <span className="font-medium">
                  {status.statistics.nextScheduledRun ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(status.statistics.nextScheduledRun)}
                    </span>
                  ) : (
                    'Not scheduled'
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Execution Details */}
      {status?.lastExecution && (
        <Card>
          <CardHeader>
            <CardTitle>Last Execution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Checked</div>
                <div className="text-2xl font-bold text-gray-900">
                  {status.lastExecution.alertsChecked}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Triggered</div>
                <div className="text-2xl font-bold text-green-600">
                  {status.lastExecution.alertsTriggered}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Failed</div>
                <div className="text-2xl font-bold text-red-600">
                  {status.lastExecution.alertsFailed}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Last 10 monitoring runs</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No execution logs yet
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatDate(log.executionTime)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.triggeredBy}
                      </Badge>
                      {log.hasErrors && (
                        <Badge variant="destructive" className="text-xs">
                          Errors
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {log.alertsChecked} checked • {log.alertsTriggered} triggered • {log.alertsFailed} failed • {formatDuration(log.duration)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.alertsFailed === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
