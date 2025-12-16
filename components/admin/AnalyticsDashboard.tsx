'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Search, CreditCard, Plane, AlertTriangle } from 'lucide-react';

interface Metric {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
}

interface FunnelStep {
  name: string;
  count: number;
  rate: number;
  isAnomalous: boolean;
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function fetchMetrics() {
    try {
      const [statsRes, funnelRes] = await Promise.all([
        fetch('/api/admin/analytics/stats').catch(() => null),
        fetch('/api/admin/analytics/funnel').catch(() => null)
      ]);

      if (statsRes?.ok) {
        const data = await statsRes.json();
        setMetrics([
          { label: 'Searches (24h)', value: data.searches || 0, change: data.searchChange, icon: Search, color: 'blue' },
          { label: 'Bookings (24h)', value: data.bookings || 0, change: data.bookingChange, icon: Plane, color: 'green' },
          { label: 'Revenue (24h)', value: `$${(data.revenue || 0).toLocaleString()}`, change: data.revenueChange, icon: CreditCard, color: 'emerald' },
          { label: 'Active Users', value: data.activeUsers || 0, icon: Users, color: 'purple' },
        ]);
      }

      if (funnelRes?.ok) {
        const data = await funnelRes.json();
        setFunnel(data.steps || []);
      }
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoading(false);
    }
  }

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className={`p-4 rounded-xl border ${colorMap[m.color]}`}>
            <div className="flex items-center justify-between mb-2">
              <m.icon className="w-5 h-5" />
              {m.change !== undefined && (
                <span className={`text-xs font-medium flex items-center gap-0.5 ${m.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {m.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(m.change)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold">{m.value}</p>
            <p className="text-xs opacity-70">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Conversion Funnel */}
      {funnel.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Conversion Funnel (24h)</h3>
          <div className="space-y-3">
            {funnel.map((step, i) => (
              <div key={i} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {step.name}
                    {step.isAnomalous && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </span>
                  <span className="text-sm text-gray-500">{step.count} ({(step.rate * 100).toFixed(1)}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${step.isAnomalous ? 'bg-amber-500' : 'bg-primary-500'}`}
                    style={{ width: `${Math.min(step.rate * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
