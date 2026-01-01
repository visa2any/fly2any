"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, Eye, CheckCircle2, XCircle,
  Clock, DollarSign, Mail, MessageCircle, Smartphone, MapPin,
  Calendar, Users, ArrowUpRight, ArrowDownRight, Loader2, RefreshCcw,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

interface Analytics {
  period: { start: string; end: string };
  summary: {
    totalQuotes: number;
    draftQuotes: number;
    sentQuotes: number;
    viewedQuotes: number;
    acceptedQuotes: number;
    declinedQuotes: number;
    expiredQuotes: number;
    convertedQuotes: number;
  };
  financial: {
    totalQuoteValue: number;
    avgQuoteValue: number;
    acceptedValue: number;
    declinedValue: number;
    potentialRevenue: number;
  };
  performance: {
    conversionRate: number;
    viewRate: number;
    avgTimeToView: number | null;
    avgTimeToAccept: number | null;
  };
  engagement: {
    totalViews: number;
    uniqueSessions: number;
    mobileViews: number;
    desktopViews: number;
    avgViewDuration: number | null;
  };
  delivery: {
    emailsSent: number;
    smsSent: number;
    whatsappSent: number;
    totalSent: number;
  };
  topDestinations: Array<{ name: string; count: number; value: number }>;
  chartData: Array<{ date: string; quotes: number; value: number; accepted: number }>;
  recentQuotes: Array<{
    id: string;
    quoteNumber: string;
    tripName: string;
    destination: string;
    client: string;
    total: number;
    status: string;
    viewCount: number;
    createdAt: string;
  }>;
}

const PERIODS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  VIEWED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  EXPIRED: "bg-orange-100 text-orange-700",
  CONVERTED: "bg-emerald-100 text-emerald-700",
};

export default function QuoteAnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/quotes/analytics?period=${period}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-fly2any-red animate-spin" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { summary, financial, performance, engagement, delivery, topDestinations, chartData, recentQuotes } = analytics;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quote Analytics</h1>
              <p className="text-sm text-gray-500 mt-1">Track performance and optimize conversions</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fly2any-red/20 focus:border-fly2any-red cursor-pointer"
                >
                  {PERIODS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={fetchAnalytics}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCcw className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<BarChart3 className="w-5 h-5" />}
            label="Total Quotes"
            value={summary.totalQuotes}
            color="bg-blue-500"
          />
          <MetricCard
            icon={<Eye className="w-5 h-5" />}
            label="View Rate"
            value={`${performance.viewRate.toFixed(1)}%`}
            color="bg-purple-500"
            trend={performance.viewRate > 70 ? "up" : "down"}
          />
          <MetricCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Conversion Rate"
            value={`${performance.conversionRate.toFixed(1)}%`}
            color="bg-green-500"
            trend={performance.conversionRate > 25 ? "up" : "down"}
          />
          <MetricCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Total Value"
            value={fmt(financial.totalQuoteValue)}
            color="bg-emerald-500"
          />
        </div>

        {/* Status Breakdown + Financial */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quote Status Funnel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quote Funnel</h3>
            <div className="space-y-3">
              <FunnelBar label="Draft" value={summary.draftQuotes} total={summary.totalQuotes} color="bg-gray-400" />
              <FunnelBar label="Sent" value={summary.sentQuotes} total={summary.totalQuotes} color="bg-blue-500" />
              <FunnelBar label="Viewed" value={summary.viewedQuotes} total={summary.totalQuotes} color="bg-purple-500" />
              <FunnelBar label="Accepted" value={summary.acceptedQuotes} total={summary.totalQuotes} color="bg-green-500" />
              <FunnelBar label="Declined" value={summary.declinedQuotes} total={summary.totalQuotes} color="bg-red-500" />
              <FunnelBar label="Expired" value={summary.expiredQuotes} total={summary.totalQuotes} color="bg-orange-500" />
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-600">Average Quote Value</span>
                <span className="text-xl font-bold text-gray-900">{fmt(financial.avgQuoteValue)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <span className="text-green-700">Accepted Value</span>
                <span className="text-xl font-bold text-green-700">{fmt(financial.acceptedValue)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <span className="text-red-700">Declined Value</span>
                <span className="text-xl font-bold text-red-700">{fmt(financial.declinedValue)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                <span className="text-yellow-700">Potential Revenue</span>
                <span className="text-xl font-bold text-yellow-700">{fmt(financial.potentialRevenue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance + Engagement */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Response Times */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Response Times</h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {performance.avgTimeToView ? `${Math.round(performance.avgTimeToView)}min` : "—"}
                </p>
                <p className="text-sm text-gray-500">Avg. Time to View</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {performance.avgTimeToAccept ? `${Math.round(performance.avgTimeToAccept)}min` : "—"}
                </p>
                <p className="text-sm text-gray-500">Avg. Time to Accept</p>
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Device Views</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Mobile</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{engagement.mobileViews}</p>
                  <p className="text-xs text-gray-500">
                    {engagement.totalViews > 0 ? Math.round((engagement.mobileViews / engagement.totalViews) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-gray-700">Desktop</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{engagement.desktopViews}</p>
                  <p className="text-xs text-gray-500">
                    {engagement.totalViews > 0 ? Math.round((engagement.desktopViews / engagement.totalViews) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Views</span>
                  <span className="font-semibold">{engagement.totalViews}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Unique Sessions</span>
                  <span className="font-semibold">{engagement.uniqueSessions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Delivery Channels</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span>Email</span>
                </div>
                <span className="font-semibold">{delivery.emailsSent}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <span>WhatsApp</span>
                </div>
                <span className="font-semibold text-green-700">{delivery.whatsappSent}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span>SMS</span>
                </div>
                <span className="font-semibold text-blue-700">{delivery.smsSent}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Destinations + Recent Quotes */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Top Destinations */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Destinations</h3>
            <div className="space-y-3">
              {topDestinations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No data yet</p>
              ) : (
                topDestinations.map((dest, i) => (
                  <div key={dest.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-fly2any-red/10 text-fly2any-red text-xs font-bold rounded-full">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{dest.name}</p>
                      <p className="text-xs text-gray-500">{dest.count} quotes • {fmt(dest.value)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Quotes */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Quotes</h3>
              <Link href="/agent/quotes" className="text-sm text-fly2any-red hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Quote</th>
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentQuotes.slice(0, 5).map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <Link href={`/agent/quotes/${quote.id}`} className="hover:text-fly2any-red">
                          <p className="font-medium text-gray-900">{quote.tripName}</p>
                          <p className="text-xs text-gray-500">{quote.quoteNumber}</p>
                        </Link>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{quote.client}</td>
                      <td className="py-3 text-sm font-medium">{fmt(quote.total)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[quote.status] || "bg-gray-100"}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {quote.viewCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  trend?: "up" | "down";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${color} text-white rounded-xl`}>{icon}</div>
        {trend && (
          <span className={`flex items-center text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </motion.div>
  );
}

// Funnel Bar Component
function FunnelBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      <span className="w-20 text-sm text-gray-600">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
      <span className="w-12 text-right text-sm font-medium">{value}</span>
    </div>
  );
}
