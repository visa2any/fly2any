'use client';

/**
 * AI Admin Dashboard — Fly2Any Intelligence Hub
 *
 * Apple-Class Level 6 admin interface for full AI visibility.
 */

import { useState, useEffect } from 'react';
import {
  Brain,
  MessageSquare,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  Zap,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  Eye,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
interface DashboardStats {
  total_conversations: number;
  active_now: number;
  conversion_rate: number;
  avg_resolution_time: string;
  total_cost: string;
  by_outcome: Record<string, number>;
}

interface AgentStat {
  id: string;
  name: string;
  interactions: number;
  resolution_rate: number;
  avg_time: string;
  satisfaction: number;
}

interface ConversationPreview {
  id: string;
  user_id: string;
  agents: string[];
  intent: string;
  emotion: string;
  outcome: string;
  duration: string;
  cost: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function AIAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'agents' | 'decisions'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with real API
    setStats({
      total_conversations: 1247,
      active_now: 12,
      conversion_rate: 34.2,
      avg_resolution_time: '2m 34s',
      total_cost: '$12.47',
      by_outcome: { resolved: 892, converted: 426, escalated: 87, abandoned: 42 },
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Intelligence Hub</h1>
          <p className="text-gray-500">Real-time visibility into AI operations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {stats?.active_now} Active
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard
          label="Conversations"
          value={stats?.total_conversations.toLocaleString() || '0'}
          icon={<MessageSquare className="w-5 h-5" />}
          trend="+12%"
          color="blue"
        />
        <KPICard
          label="Conversion Rate"
          value={`${stats?.conversion_rate}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend="+2.4%"
          color="green"
        />
        <KPICard
          label="Avg Resolution"
          value={stats?.avg_resolution_time || '-'}
          icon={<Clock className="w-5 h-5" />}
          trend="-18s"
          color="purple"
        />
        <KPICard
          label="Total Cost"
          value={stats?.total_cost || '$0'}
          icon={<DollarSign className="w-5 h-5" />}
          trend="-8%"
          color="yellow"
        />
        <KPICard
          label="Resolved"
          value={stats?.by_outcome.resolved?.toLocaleString() || '0'}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <KPICard
          label="Escalated"
          value={stats?.by_outcome.escalated?.toLocaleString() || '0'}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['overview', 'conversations', 'agents', 'decisions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab stats={stats} />}
      {activeTab === 'conversations' && <ConversationsTab />}
      {activeTab === 'agents' && <AgentsTab />}
      {activeTab === 'decisions' && <DecisionsTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function KPICard({
  label,
  value,
  icon,
  trend,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'orange';
}) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">{label}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : trend.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ stats }: { stats: DashboardStats | null }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Outcome Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Outcome Distribution</h3>
        <div className="space-y-3">
          {stats && Object.entries(stats.by_outcome).map(([outcome, count]) => (
            <div key={outcome} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600 capitalize">{outcome}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    outcome === 'resolved' ? 'bg-green-500' :
                    outcome === 'converted' ? 'bg-blue-500' :
                    outcome === 'escalated' ? 'bg-orange-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${(count / stats.total_conversations) * 100}%` }}
                />
              </div>
              <div className="w-12 text-sm text-gray-600 text-right">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Live Activity</h3>
        <div className="space-y-3">
          {[
            { event: 'Flight search', agent: 'Sarah Chen', time: '2s ago', status: 'active' },
            { event: 'Payment processing', agent: 'David Park', time: '15s ago', status: 'active' },
            { event: 'Hotel booking', agent: 'Marcus Rodriguez', time: '32s ago', status: 'completed' },
            { event: 'Visa inquiry', agent: 'Sophia Nguyen', time: '1m ago', status: 'completed' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.event}</div>
                  <div className="text-xs text-gray-500">{item.agent}</div>
                </div>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Performance Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Agent Performance</h3>
          <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { name: 'Sarah Chen', role: 'Flights', score: 94, calls: 234 },
            { name: 'Marcus Rodriguez', role: 'Hotels', score: 91, calls: 189 },
            { name: 'David Park', role: 'Payments', score: 97, calls: 156 },
            { name: 'Lisa Thompson', role: 'Concierge', score: 89, calls: 312 },
          ].map((agent, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{agent.name}</span>
                <span className={`text-sm font-bold ${agent.score >= 95 ? 'text-green-600' : agent.score >= 90 ? 'text-blue-600' : 'text-yellow-600'}`}>
                  {agent.score}%
                </span>
              </div>
              <div className="text-xs text-gray-500">{agent.role} • {agent.calls} calls</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConversationsTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Search & Filter */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">ID</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Agents</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Intent</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Emotion</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Outcome</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Duration</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Cost</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {[
            { id: 'conv_8f3a...', agents: ['Sarah', 'David'], intent: 'FLIGHT_SEARCH', emotion: 'CALM', outcome: 'converted', duration: '3m 12s', cost: '$0.024' },
            { id: 'conv_2b7c...', agents: ['Lisa'], intent: 'GENERAL_INFO', emotion: 'CONFUSED', outcome: 'resolved', duration: '1m 45s', cost: '$0.008' },
            { id: 'conv_9d4e...', agents: ['Marcus', 'Nina'], intent: 'HOTEL_SEARCH', emotion: 'ANXIOUS', outcome: 'resolved', duration: '4m 22s', cost: '$0.031' },
            { id: 'conv_5c1f...', agents: ['David'], intent: 'REFUND', emotion: 'FRUSTRATED', outcome: 'escalated', duration: '6m 08s', cost: '$0.052' },
          ].map((conv, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-mono text-gray-900">{conv.id}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{conv.agents.join(' → ')}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">{conv.intent}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded ${
                  conv.emotion === 'CALM' ? 'bg-green-50 text-green-700' :
                  conv.emotion === 'FRUSTRATED' ? 'bg-red-50 text-red-700' :
                  conv.emotion === 'ANXIOUS' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-700'
                }`}>{conv.emotion}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`flex items-center gap-1 text-sm ${
                  conv.outcome === 'converted' ? 'text-green-600' :
                  conv.outcome === 'resolved' ? 'text-blue-600' :
                  conv.outcome === 'escalated' ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {conv.outcome === 'converted' && <CheckCircle className="w-3 h-3" />}
                  {conv.outcome === 'escalated' && <AlertTriangle className="w-3 h-3" />}
                  {conv.outcome}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{conv.duration}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{conv.cost}</td>
              <td className="px-4 py-3">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AgentsTab() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { name: 'Sarah Chen', title: 'Flight Operations', interactions: 234, resolution: 94, satisfaction: 4.8 },
        { name: 'Marcus Rodriguez', title: 'Hotel Accommodations', interactions: 189, resolution: 91, satisfaction: 4.7 },
        { name: 'David Park', title: 'Payment & Billing', interactions: 156, resolution: 97, satisfaction: 4.9 },
        { name: 'Lisa Thompson', title: 'Travel Concierge', interactions: 312, resolution: 89, satisfaction: 4.6 },
        { name: 'Dr. Emily Watson', title: 'Legal & Compliance', interactions: 45, resolution: 98, satisfaction: 4.8 },
        { name: 'Captain Mike Johnson', title: 'Crisis Management', interactions: 23, resolution: 100, satisfaction: 4.9 },
      ].map((agent, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">{agent.name}</h4>
              <p className="text-sm text-gray-500">{agent.title}</p>
            </div>
            <div className={`px-2 py-1 rounded text-sm font-bold ${
              agent.resolution >= 95 ? 'bg-green-50 text-green-700' :
              agent.resolution >= 90 ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              {agent.resolution}%
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">{agent.interactions}</div>
              <div className="text-xs text-gray-500">Interactions</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{agent.satisfaction}</div>
              <div className="text-xs text-gray-500">Satisfaction</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DecisionsTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Recent AI Decisions</h3>
      <div className="space-y-4">
        {[
          { decision: 'Routed to Sarah Chen (Flight Ops)', reason: 'Intent: FLIGHT_SEARCH, Confidence: 0.94', time: '2m ago', confidence: 94 },
          { decision: 'Escalated to Captain Mike', reason: 'Urgency: CRITICAL, Emotion: PANICKED', time: '5m ago', confidence: 98 },
          { decision: 'Model upgrade: mid → high', reason: 'Payment domain detected, risk mitigation', time: '8m ago', confidence: 89 },
          { decision: 'Handoff: Lisa → Marcus', reason: 'New intent: HOTEL_SEARCH detected', time: '12m ago', confidence: 91 },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-lg ${item.confidence >= 95 ? 'bg-green-100' : item.confidence >= 90 ? 'bg-blue-100' : 'bg-yellow-100'}`}>
              <Brain className={`w-5 h-5 ${item.confidence >= 95 ? 'text-green-600' : item.confidence >= 90 ? 'text-blue-600' : 'text-yellow-600'}`} />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{item.decision}</div>
              <div className="text-sm text-gray-500 mt-0.5">{item.reason}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{item.confidence}%</div>
              <div className="text-xs text-gray-400">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
