'use client';

import { useState, useEffect } from 'react';
import {
  Bot,
  MessageCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Plane,
  Shield,
  CheckCircle2,
  Clock,
  BarChart3,
  Activity,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Target,
  Zap,
  Crown,
  Star
} from 'lucide-react';
import type { AIAnalyticsStats } from '@/lib/types/ai-analytics';

// ===========================
// TYPE DEFINITIONS
// ===========================

interface DashboardData {
  stats: AIAnalyticsStats;
  period: '7d' | '30d' | '90d';
  demoMode: boolean;
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
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';
}> = ({ icon, label, value, change, subValue, color = 'blue' }) => {
  const colorClasses = {
    blue: { bg: 'from-blue-500 to-blue-600', border: 'border-blue-200', text: 'text-blue-700' },
    green: { bg: 'from-green-500 to-green-600', border: 'border-green-200', text: 'text-green-700' },
    purple: { bg: 'from-purple-500 to-purple-600', border: 'border-purple-200', text: 'text-purple-700' },
    orange: { bg: 'from-orange-500 to-orange-600', border: 'border-orange-200', text: 'text-orange-700' },
    red: { bg: 'from-red-500 to-red-600', border: 'border-red-200', text: 'text-red-700' },
    pink: { bg: 'from-pink-500 to-pink-600', border: 'border-pink-200', text: 'text-pink-700' },
  };

  const colors = colorClasses[color];

  return (
    <div className={`relative overflow-hidden bg-white rounded-xl border ${colors.border} shadow-sm hover:shadow-md transition-all p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`rounded-lg bg-gradient-to-br ${colors.bg} p-2.5 shadow-md text-white`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
      </div>
    </div>
  );
};

const ConsultantBar: React.FC<{
  name: string;
  team: string;
  messageCount: number;
  percentage: number;
  color: string;
}> = ({ name, team, messageCount, percentage, color }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
          <span className="font-medium text-gray-900">{name}</span>
          <span className="text-xs text-gray-500">({team})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">{messageCount.toLocaleString()}</span>
          <span className="text-xs text-gray-400">{percentage.toFixed(1)}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-gradient-to-r from-${color}-400 to-${color}-600 h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const RouteItem: React.FC<{
  route: string;
  count: number;
  rank: number;
}> = ({ route, count, rank }) => {
  const colors = ['yellow', 'gray', 'orange'];
  const icons = [Crown, Star, Star];
  const Icon = rank < 3 ? icons[rank] : ChevronRight;
  const color = rank < 3 ? colors[rank] : 'gray';

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${rank < 3 ? `text-${color}-500` : 'text-gray-400'}`} />
        <span className="font-mono font-semibold text-gray-900">{route}</span>
      </div>
      <span className="text-sm font-semibold text-gray-600">{count.toLocaleString()}</span>
    </div>
  );
};

const StageMetric: React.FC<{
  stage: string;
  shown: number;
  clicked: number;
  ctr: number;
}> = ({ stage, shown, clicked, ctr }) => {
  const stageLabels: { [key: string]: string } = {
    first_interaction: 'First Interaction',
    search_performed: 'After Search',
    results_viewed: 'Results Viewed',
    pre_booking: 'Pre-Booking',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{stageLabels[stage] || stage}</p>
        <p className="text-xs text-gray-500">{shown.toLocaleString()} shown · {clicked.toLocaleString()} clicked</p>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
        ctr >= 40 ? 'bg-green-100 text-green-700' :
        ctr >= 25 ? 'bg-yellow-100 text-yellow-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {ctr.toFixed(1)}% CTR
      </div>
    </div>
  );
};

const PeakHourBar: React.FC<{
  hour: number;
  count: number;
  maxCount: number;
}> = ({ hour, count, maxCount }) => {
  const percentage = (count / maxCount) * 100;
  const formatHour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}${period}`;
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{formatHour(hour)}</span>
        <span className="text-gray-500">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================

export default function AIAnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/ai/analytics?period=${period}`);

      if (!response.ok) {
        throw new Error(`Analytics API returned ${response.status}`);
      }

      const result = await response.json();

      setData({
        stats: result.stats,
        period: result.period,
        demoMode: result.demoMode || false,
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading AI analytics...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              AI Assistant Analytics
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()} · {data?.demoMode ? 'Demo Mode' : 'Live Data'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    period === p
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Demo Mode Banner */}
        {data?.demoMode && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Demo Mode Active</p>
                <p className="text-xs text-gray-600">
                  Showing sample data. Configure database to track real analytics.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<MessageCircle className="w-5 h-5" />}
            label="Total Conversations"
            value={stats?.totalConversations.toLocaleString() || '0'}
            subValue={`${stats?.totalMessages.toLocaleString() || '0'} total messages`}
            color="purple"
          />

          <MetricCard
            icon={<BarChart3 className="w-5 h-5" />}
            label="Avg Messages/Chat"
            value={stats?.avgMessagesPerConversation.toFixed(1) || '0'}
            subValue="Engagement metric"
            color="blue"
          />

          <MetricCard
            icon={<Plane className="w-5 h-5" />}
            label="Flight Searches"
            value={stats?.totalFlightSearches.toLocaleString() || '0'}
            subValue={`${stats?.flightSearchConversionRate.toFixed(1) || '0'}% conversion rate`}
            color="orange"
          />

          <MetricCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Total Conversions"
            value={(
              (stats?.conversions.totalSignups || 0) +
              (stats?.conversions.totalLogins || 0) +
              (stats?.conversions.totalBookings || 0)
            ).toLocaleString()}
            subValue={`${stats?.conversions.conversionRate.toFixed(1) || '0'}% rate`}
            color="green"
          />
        </div>

        {/* Consultant Performance & Popular Routes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consultant Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Consultant Performance
              </h3>
              <span className="text-xs font-semibold text-gray-500">
                {stats?.consultantBreakdown.reduce((sum, c) => sum + c.messageCount, 0).toLocaleString()} total
              </span>
            </div>

            <div className="space-y-4">
              {stats?.consultantBreakdown.slice(0, 5).map((consultant, idx) => (
                <ConsultantBar
                  key={`${consultant.team}-${consultant.name}`}
                  name={consultant.name}
                  team={consultant.team}
                  messageCount={consultant.messageCount}
                  percentage={consultant.percentage}
                  color={['purple', 'blue', 'green', 'orange', 'pink'][idx % 5]}
                />
              ))}
            </div>
          </div>

          {/* Popular Routes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plane className="w-5 h-5 text-orange-600" />
                Popular Flight Routes
              </h3>
              <span className="text-xs font-semibold text-gray-500">
                Top {stats?.popularRoutes.length || 0}
              </span>
            </div>

            <div className="space-y-2">
              {stats?.popularRoutes.slice(0, 5).map((route, idx) => (
                <RouteItem
                  key={route.route}
                  route={route.route}
                  count={route.count}
                  rank={idx}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Auth Prompt Effectiveness & Conversions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Auth Prompt Stats */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Auth Prompt Effectiveness
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                (stats?.authPromptStats.clickThroughRate || 0) >= 35
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {stats?.authPromptStats.clickThroughRate.toFixed(1)}% Overall CTR
              </span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Prompts Shown</p>
                <p className="text-xl font-bold text-blue-700">
                  {stats?.authPromptStats.totalShown.toLocaleString() || '0'}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Prompts Clicked</p>
                <p className="text-xl font-bold text-green-700">
                  {stats?.authPromptStats.totalClicked.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-600 uppercase">By Stage</p>
              {stats?.authPromptStats.byStage.map((stage) => (
                <StageMetric
                  key={stage.stage}
                  stage={stage.stage}
                  shown={stage.shown}
                  clicked={stage.clicked}
                  ctr={stage.ctr}
                />
              ))}
            </div>
          </div>

          {/* Conversions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Conversions
              </h3>
              <span className="text-xs font-semibold text-gray-500">
                {stats?.conversions.conversionRate.toFixed(1)}% conversion rate
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Signups</p>
                <p className="text-2xl font-bold text-purple-700">
                  {stats?.conversions.totalSignups.toLocaleString() || '0'}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Logins</p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats?.conversions.totalLogins.toLocaleString() || '0'}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Bookings</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats?.conversions.totalBookings.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Average Conversion Value</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${stats?.conversions.avgConversionValue.toFixed(2) || '0.00'}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Engagement & Peak Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engagement Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-pink-600" />
                Engagement Metrics
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <Clock className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Avg Session Duration</p>
                <p className="text-2xl font-bold text-pink-700">
                  {Math.floor((stats?.engagement.avgSessionDuration || 0) / 60)}m {(stats?.engagement.avgSessionDuration || 0) % 60}s
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Avg Engagement Score</p>
                <p className="text-2xl font-bold text-purple-700">
                  {stats?.engagement.avgEngagementScore.toFixed(1) || '0'}/10
                </p>
              </div>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Peak Usage Hours
              </h3>
              <span className="text-xs font-semibold text-gray-500">Top 5 hours</span>
            </div>

            <div className="space-y-3">
              {stats?.engagement.peakHours.map((peak) => (
                <PeakHourBar
                  key={peak.hour}
                  hour={peak.hour}
                  count={peak.count}
                  maxCount={Math.max(...(stats?.engagement.peakHours.map(p => p.count) || [1]))}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top User Questions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Top User Questions
            </h3>
            <span className="text-xs font-semibold text-gray-500">
              Most common queries
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats?.topQuestions.slice(0, 10).map((question, idx) => (
              <div
                key={question.question}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-gray-900 truncate">{question.question}</span>
                </div>
                <span className="ml-2 flex-shrink-0 text-xs font-semibold text-gray-600">
                  {question.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Flight Search Performance */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plane className="w-5 h-5 text-orange-600" />
                Flight Search Performance
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered flight search efficiency
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-600 mb-2">Total Searches</p>
              <p className="text-3xl font-bold text-orange-700">
                {stats?.totalFlightSearches.toLocaleString() || '0'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-600 mb-2">Avg Search Time</p>
              <p className="text-3xl font-bold text-blue-700">
                {((stats?.avgSearchDuration || 0) / 1000).toFixed(1)}s
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-600 mb-2">Conversion Rate</p>
              <p className="text-3xl font-bold text-green-700">
                {stats?.flightSearchConversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
