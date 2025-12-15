'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Brain,
  Users,
  TrendingUp,
  Target,
  Zap,
  RefreshCw,
  Crown,
  Medal,
  Award,
  Star,
} from 'lucide-react';

interface AIAnalytics {
  leadSegments: {
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
    nurture: number;
    total: number;
  };
  funnel: {
    totalSearches: number;
    totalBookings: number;
    overallConversion: number;
  } | null;
  metrics: {
    recentBookings: number;
    avgLeadScore: number;
  };
  generatedAt: string;
}

const tierConfig = {
  platinum: { icon: Crown, color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200' },
  gold: { icon: Medal, color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  silver: { icon: Award, color: 'gray', bg: 'bg-gray-50', border: 'border-gray-200' },
  bronze: { icon: Star, color: 'amber', bg: 'bg-amber-50', border: 'border-amber-200' },
  nurture: { icon: Zap, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200' },
};

export default function AIInsightsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<AIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai-analytics');
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch AI analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            AI Insights
          </h1>
          <p className="text-gray-500 mt-1">Lead scoring, intent analysis & conversion intelligence</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-gray-500">Total Leads</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data?.leadSegments.total.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">Avg Lead Score</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data?.metrics.avgLeadScore || 0}/100
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Conversion Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data?.funnel ? `${(data.funnel.overallConversion * 100).toFixed(1)}%` : 'N/A'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-gray-500">7-Day Bookings</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data?.metrics.recentBookings || 0}
          </p>
        </div>
      </div>

      {/* Lead Segments */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            Lead Quality Segments
          </h2>
          <p className="text-sm text-gray-500 mt-1">AI-scored lead tiers based on engagement & conversion likelihood</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {Object.entries(tierConfig).map(([tier, config]) => {
            const Icon = config.icon;
            const count = data?.leadSegments[tier as keyof typeof data.leadSegments] || 0;
            const percentage = data?.leadSegments.total
              ? Math.round((count / data.leadSegments.total) * 100)
              : 0;

            return (
              <div key={tier} className={`p-5 ${config.bg}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-5 h-5 text-${config.color}-600`} />
                  <span className="font-medium text-gray-900 capitalize">{tier}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{percentage}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel Summary */}
      {data?.funnel && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel (24h)</h2>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{data.funnel.totalSearches}</p>
              <p className="text-sm text-gray-500">Searches</p>
            </div>
            <div className="flex-1 h-2 bg-gray-100 mx-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                style={{ width: `${data.funnel.overallConversion * 100}%` }}
              />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{data.funnel.totalBookings}</p>
              <p className="text-sm text-gray-500">Bookings</p>
            </div>
          </div>
        </div>
      )}

      {/* Updated timestamp */}
      <p className="text-xs text-gray-400 text-center">
        Last updated: {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'Never'}
      </p>
    </div>
  );
}
