'use client';

/**
 * AI SEO Dashboard — Level 6 Ultra-Premium
 *
 * Real-time SEO intelligence with:
 * - Score & KPIs
 * - Anomaly detection
 * - Quick wins
 * - AI suggestions
 */

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  BarChart3,
  RefreshCw,
  Lightbulb,
  Search,
  ExternalLink,
} from 'lucide-react';

interface SEOAnalysis {
  score: number;
  anomalies: Array<{
    type: string;
    severity: 'critical' | 'warning' | 'opportunity';
    metric: string;
    change: number;
    page?: string;
    suggestion: string;
  }>;
  suggestions: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    target: string;
    reason: string;
    action: string;
    estimatedImpact: string;
  }>;
  quickWins: Array<{
    query: string;
    page: string;
    position: number;
    impressions: number;
    ctr: number;
    potentialClicks: number;
    action: string;
  }>;
  metrics: {
    totalImpressions: number;
    totalClicks: number;
    avgCTR: number;
    avgPosition: number;
    top10Keywords: number;
    indexedPages: number;
  };
}

export default function AISEODashboard() {
  const [data, setData] = useState<SEOAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'quickwins' | 'suggestions'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo/ai-engine?action=analyze');
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch SEO data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) return null;

  const scoreColor = data.score >= 80 ? 'text-green-600' : data.score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = data.score >= 80 ? 'bg-green-50' : data.score >= 60 ? 'bg-yellow-50' : 'bg-red-50';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI SEO Engine</h1>
          <p className="text-gray-500">Autonomous ranking optimization</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Score & Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* SEO Score */}
        <div className={`col-span-2 p-6 rounded-xl ${scoreBg} border-2 ${data.score >= 80 ? 'border-green-200' : data.score >= 60 ? 'border-yellow-200' : 'border-red-200'}`}>
          <div className="flex items-center gap-4">
            <div className={`text-5xl font-bold ${scoreColor}`}>{data.score}</div>
            <div>
              <div className="text-sm font-medium text-gray-600">SEO Score</div>
              <div className="text-xs text-gray-500">Out of 100</div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <MetricCard
          label="Impressions"
          value={formatNumber(data.metrics.totalImpressions)}
          icon={<Search className="w-5 h-5" />}
        />
        <MetricCard
          label="Clicks"
          value={formatNumber(data.metrics.totalClicks)}
          icon={<Target className="w-5 h-5" />}
        />
        <MetricCard
          label="Avg CTR"
          value={`${data.metrics.avgCTR}%`}
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <MetricCard
          label="Top 10 Keywords"
          value={data.metrics.top10Keywords.toString()}
          icon={<Zap className="w-5 h-5" />}
        />
      </div>

      {/* Anomalies Alert */}
      {data.anomalies.filter(a => a.severity === 'critical').length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
            <AlertTriangle className="w-5 h-5" />
            {data.anomalies.filter(a => a.severity === 'critical').length} Critical Issues
          </div>
          <ul className="space-y-1">
            {data.anomalies
              .filter(a => a.severity === 'critical')
              .map((a, i) => (
                <li key={i} className="text-sm text-red-600">
                  • {a.suggestion}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['overview', 'quickwins', 'suggestions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === tab
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'quickwins' && `Quick Wins (${data.quickWins.length})`}
            {tab === 'suggestions' && `AI Suggestions (${data.suggestions.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Anomalies */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Detected Anomalies</h3>
            <div className="space-y-3">
              {data.anomalies.slice(0, 5).map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`p-1 rounded ${
                    a.severity === 'critical' ? 'bg-red-100 text-red-600' :
                    a.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {a.severity === 'opportunity' ? <TrendingUp className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{a.metric}</div>
                    <div className="text-xs text-gray-500">{a.suggestion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KPI Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <KPIRow label="Indexed Pages" value={data.metrics.indexedPages.toLocaleString()} trend={5} />
              <KPIRow label="Avg Position" value={data.metrics.avgPosition.toFixed(1)} trend={-2} />
              <KPIRow label="Click-Through Rate" value={`${data.metrics.avgCTR}%`} trend={0.4} />
              <KPIRow label="Est. Monthly Clicks" value={formatNumber(data.metrics.totalClicks)} trend={12} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quickwins' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Query</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Position</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">CTR</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Potential</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.quickWins.map((qw, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-sm">{qw.query}</div>
                    <div className="text-xs text-gray-500">{qw.page}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm font-medium">
                      #{qw.position.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{qw.ctr}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-green-600 font-medium text-sm">+{qw.potentialClicks} clicks</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{qw.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {data.suggestions.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                    s.priority === 'high' ? 'bg-red-100 text-red-700' :
                    s.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {s.priority} Priority
                  </span>
                  <span className="text-xs text-gray-500 uppercase">{s.type.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 mb-1">{s.reason}</div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Action:</strong> {s.action}
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                {s.estimatedImpact}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-gray-400 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function KPIRow({ label, value, trend }: { label: string; value: string; trend: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">{value}</span>
        <span className={`text-xs font-medium flex items-center gap-0.5 ${
          trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
        }`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
