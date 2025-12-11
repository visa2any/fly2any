'use client';

/**
 * Security Dashboard - Apple-Class Admin UI
 *
 * Real-time security monitoring with:
 * - Blocked IPs management
 * - Honeypot triggers
 * - Threat score distribution
 * - Suspicious activity log
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Shield, AlertTriangle, Ban, Activity, RefreshCw, Trash2, Eye, Lock } from 'lucide-react';

interface SecurityMetrics {
  overview: {
    totalBlockedIPs: number;
    honeypotTriggers24h: number;
    rateLimitBlocks24h: number;
    suspiciousRequests24h: number;
  };
  topBlockedIPs: Array<{ ip: string; count: number }>;
  recentSuspiciousActivity: Array<{
    ip: string;
    path: string;
    reason: string;
    timestamp: string;
  }>;
  honeypotLog: Array<{
    ip: string;
    path: string;
    userAgent: string;
    timestamp: string;
  }>;
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [blockIP, setBlockIP] = useState('');

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/security');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch metrics');
      }

      setMetrics(data.metrics);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const handleAction = async (action: string, ip?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ip }),
      });

      if (!res.ok) throw new Error('Action failed');

      await fetchMetrics();
      setBlockIP('');
    } catch (err) {
      alert('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">Access Error</h2>
          <p className="text-neutral-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-neutral-200/50"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #EF4136 0%, #D63930 100%)',
                  boxShadow: '0 4px 12px -2px rgba(239,65,54,0.3)',
                }}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">Security Center</h1>
                <p className="text-sm text-neutral-500">Real-time threat monitoring</p>
              </div>
            </div>

            <button
              onClick={() => fetchMetrics()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-700 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Blocked IPs',
              value: metrics?.overview.totalBlockedIPs || 0,
              icon: Ban,
              color: '#EF4136',
              bgColor: 'rgba(239,65,54,0.1)',
            },
            {
              label: 'Honeypot Triggers',
              value: metrics?.overview.honeypotTriggers24h || 0,
              icon: AlertTriangle,
              color: '#F59E0B',
              bgColor: 'rgba(245,158,11,0.1)',
            },
            {
              label: 'Rate Limit Blocks',
              value: metrics?.overview.rateLimitBlocks24h || 0,
              icon: Activity,
              color: '#8B5CF6',
              bgColor: 'rgba(139,92,246,0.1)',
            },
            {
              label: 'Suspicious Requests',
              value: metrics?.overview.suspiciousRequests24h || 0,
              icon: Eye,
              color: '#3B82F6',
              bgColor: 'rgba(59,130,246,0.1)',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 border border-neutral-100"
              style={{
                boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ background: stat.bgColor }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
              <div className="text-sm text-neutral-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Block IP Form */}
        <div
          className="bg-white rounded-2xl p-6 mb-8 border border-neutral-100"
          style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)' }}
        >
          <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary-500" />
            Manual IP Block
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={blockIP}
              onChange={(e) => setBlockIP(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            />
            <button
              onClick={() => handleAction('block', blockIP)}
              disabled={!blockIP || actionLoading}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #EF4136 0%, #D63930 100%)',
                boxShadow: '0 4px 12px -2px rgba(239,65,54,0.3)',
              }}
            >
              Block IP
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Blocked IPs */}
          <div
            className="bg-white rounded-2xl p-6 border border-neutral-100"
            style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)' }}
          >
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Top Blocked IPs
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {metrics?.topBlockedIPs?.length ? (
                metrics.topBlockedIPs.map((entry) => (
                  <div
                    key={entry.ip}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  >
                    <div>
                      <code className="text-sm font-mono text-neutral-800">{entry.ip}</code>
                      <span className="ml-2 text-xs text-neutral-500">
                        {entry.count} blocks
                      </span>
                    </div>
                    <button
                      onClick={() => handleAction('unblock', entry.ip)}
                      disabled={actionLoading}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-8">No blocked IPs</p>
              )}
            </div>
          </div>

          {/* Honeypot Log */}
          <div
            className="bg-white rounded-2xl p-6 border border-neutral-100"
            style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Honeypot Triggers
              </h3>
              <button
                onClick={() => handleAction('clear_honeypot')}
                disabled={actionLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {metrics?.honeypotLog?.length ? (
                metrics.honeypotLog.map((entry, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-amber-50 border border-amber-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono text-neutral-800">{entry.ip}</code>
                      <span className="text-xs text-neutral-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 truncate">{entry.path}</div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-8">No honeypot triggers</p>
              )}
            </div>
          </div>
        </div>

        {/* Suspicious Activity Log */}
        <div
          className="bg-white rounded-2xl p-6 mt-6 border border-neutral-100"
          style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Recent Suspicious Activity
            </h3>
            <button
              onClick={() => handleAction('clear_suspicious')}
              disabled={actionLoading}
              className="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left py-3 px-4 font-medium text-neutral-500">IP</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-500">Path</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-500">Reason</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.recentSuspiciousActivity?.length ? (
                  metrics.recentSuspiciousActivity.map((entry, i) => (
                    <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50">
                      <td className="py-3 px-4 font-mono">{entry.ip}</td>
                      <td className="py-3 px-4 text-neutral-600 truncate max-w-xs">{entry.path}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                          {entry.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-neutral-500">
                      No suspicious activity detected
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
