"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, CheckCircle2, Send } from "lucide-react";

interface QuoteStats {
  totalQuotes: number;
  sentThisMonth: number;
  conversionRate: number;
  avgResponseTime: string;
  revenue: number;
}

export default function QuoteAnalyticsMini() {
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    // Fetch agent's quote stats from existing analytics API
    fetch("/api/agents/quotes/analytics?period=30d")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.analytics) {
          const a = data.analytics;
          setStats({
            totalQuotes: a.totalQuotes || 0,
            sentThisMonth: a.sentQuotes || 0,
            conversionRate: a.conversionRate || 0,
            avgResponseTime: a.avgResponseTime || "—",
            revenue: a.totalRevenue || 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return null;

  const metrics = [
    {
      label: "Sent this month",
      value: stats.sentThisMonth,
      icon: Send,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Conversion rate",
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Avg response",
      value: stats.avgResponseTime,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Revenue (MTD)",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: CheckCircle2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex-1">
          My Performance
        </span>
        <motion.span
          animate={{ rotate: collapsed ? 0 : 180 }}
          className="text-gray-400 text-xs"
        >
          ▼
        </motion.span>
      </button>

      {!collapsed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="grid grid-cols-2 gap-2 px-3 pb-3"
        >
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className={`flex flex-col gap-1 p-2 rounded-lg ${m.bg}`}
              >
                <div className="flex items-center gap-1">
                  <Icon className={`w-3 h-3 ${m.color}`} />
                  <span className="text-[9px] font-medium text-gray-500">
                    {m.label}
                  </span>
                </div>
                <span className={`text-sm font-bold ${m.color}`}>
                  {m.value}
                </span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
