"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Compass, DollarSign, Clock, Shield, TrendingUp, Star, Zap } from "lucide-react";
import { useQuoteWorkspace, useQuoteItems, useQuotePricing } from "./QuoteWorkspaceProvider";
import type { QuoteItem } from "./types/quote-workspace.types";

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTE DIFFERENTIATION SCORE - Internal competitive analysis
// Exposed to agent only - helps position and optimize quotes
// ═══════════════════════════════════════════════════════════════════════════════

interface ScoreMetric {
  key: string;
  label: string;
  icon: typeof Sparkles;
  score: number; // 0-100
  weight: number;
  color: string;
  insight: string;
}

interface QuoteScore {
  overall: number;
  grade: "A+" | "A" | "B+" | "B" | "C" | "D";
  metrics: ScoreMetric[];
  summary: string;
  optimization: string;
}

function calculateScore(items: QuoteItem[], state: any, pricing: any): QuoteScore {
  const metrics: ScoreMetric[] = [];

  // 1. Experience Richness (weight: 30%)
  const activities = items.filter(i => i.type === "activity");
  const hotels = items.filter(i => i.type === "hotel");
  const totalNights = hotels.reduce((sum, h) => sum + ((h as any).nights || 0), 0);
  const activityRatio = totalNights > 0 ? (activities.length / totalNights) * 100 : 0;
  const experienceScore = Math.min(100, activityRatio * 2 + (activities.length > 0 ? 30 : 0));

  metrics.push({
    key: "experience",
    label: "Experience Richness",
    icon: Compass,
    score: Math.round(experienceScore),
    weight: 30,
    color: "text-emerald-600",
    insight: activities.length === 0
      ? "Add activities for a richer trip"
      : activityRatio >= 0.5
        ? "Great activity coverage"
        : "Consider more experiences",
  });

  // 2. Convenience Level (weight: 25%)
  const hasTransfer = items.some(i => i.type === "transfer");
  const hasCar = items.some(i => i.type === "car");
  const hasInsurance = items.some(i => i.type === "insurance");
  const convenienceScore = (hasTransfer ? 40 : 0) + (hasCar ? 30 : 0) + (hasInsurance ? 30 : 0);

  metrics.push({
    key: "convenience",
    label: "Convenience Level",
    icon: Zap,
    score: convenienceScore,
    weight: 25,
    color: "text-blue-600",
    insight: convenienceScore >= 70
      ? "Full convenience package"
      : !hasTransfer
        ? "Add airport transfer"
        : "Consider adding car rental",
  });

  // 3. Price Balance (weight: 25%)
  const avgPricePerDay = pricing.total / Math.max(totalNights, 1);
  const pricePerPerson = pricing.perPerson;
  // Sweet spot: $200-500/day for balanced trips
  const priceScore = avgPricePerDay < 100 ? 40 : avgPricePerDay <= 500 ? 100 : avgPricePerDay <= 800 ? 80 : 60;

  metrics.push({
    key: "price",
    label: "Price Balance",
    icon: DollarSign,
    score: priceScore,
    weight: 25,
    color: "text-amber-600",
    insight: priceScore >= 80
      ? "Well-balanced value"
      : avgPricePerDay > 500
        ? "Premium positioning"
        : "Budget-friendly option",
  });

  // 4. Completeness (weight: 20%)
  const hasFlight = items.some(i => i.type === "flight");
  const hasHotel = items.some(i => i.type === "hotel");
  const hasClient = !!state.client;
  const hasDates = !!state.startDate && !!state.endDate;
  const completenessItems = [hasFlight, hasHotel, hasClient, hasDates, hasTransfer || hasCar];
  const completenessScore = (completenessItems.filter(Boolean).length / completenessItems.length) * 100;

  metrics.push({
    key: "completeness",
    label: "Quote Completeness",
    icon: Shield,
    score: Math.round(completenessScore),
    weight: 20,
    color: "text-violet-600",
    insight: completenessScore >= 80
      ? "Ready to send"
      : !hasHotel
        ? "Missing accommodation"
        : !hasClient
          ? "Select a client"
          : "Add more details",
  });

  // Calculate weighted overall score
  const overall = Math.round(
    metrics.reduce((sum, m) => sum + (m.score * m.weight / 100), 0)
  );

  // Determine grade
  const grade: QuoteScore["grade"] =
    overall >= 90 ? "A+" :
    overall >= 80 ? "A" :
    overall >= 70 ? "B+" :
    overall >= 60 ? "B" :
    overall >= 50 ? "C" : "D";

  // Generate summary based on top metrics
  const topMetric = [...metrics].sort((a, b) => b.score - a.score)[0];
  const weakMetric = [...metrics].sort((a, b) => a.score - b.score)[0];

  const summaryTemplates: Record<string, string> = {
    experience: "optimized for memorable experiences",
    convenience: "designed for maximum convenience",
    price: "balanced for exceptional value",
    completeness: "comprehensive and ready",
  };

  const summary = `This quote is ${summaryTemplates[topMetric.key]}`;
  const optimization = weakMetric.score < 60 ? weakMetric.insight : "Quote is well-optimized";

  return { overall, grade, metrics, summary, optimization };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

export default function QuoteDifferentiationScore() {
  const items = useQuoteItems();
  const { state } = useQuoteWorkspace();
  const pricing = useQuotePricing();

  const score = useMemo(() => calculateScore(items, state, pricing), [items, state, pricing]);

  if (items.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-300">Quote Score</p>
            <p className="text-[10px] text-gray-500">Agent insights</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-black ${
            score.grade.startsWith("A") ? "text-emerald-400" :
            score.grade.startsWith("B") ? "text-blue-400" : "text-amber-400"
          }`}>
            {score.grade}
          </div>
          <p className="text-[10px] text-gray-500">{score.overall}/100</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2 mb-3">
        {score.metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.key} className="group">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${m.color}`} />
                  <span className="text-gray-300">{m.label}</span>
                </div>
                <span className="font-semibold">{m.score}%</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.score}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`h-full rounded-full ${
                    m.score >= 70 ? "bg-emerald-500" :
                    m.score >= 50 ? "bg-blue-500" : "bg-amber-500"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
        <p className="text-xs text-gray-300 mb-1">
          <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />
          {score.summary}
        </p>
        {score.optimization !== "Quote is well-optimized" && (
          <p className="text-[10px] text-amber-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Tip: {score.optimization}
          </p>
        )}
      </div>
    </div>
  );
}

// Compact badge version
export function QuoteScoreBadge() {
  const items = useQuoteItems();
  const { state } = useQuoteWorkspace();
  const pricing = useQuotePricing();

  const score = useMemo(() => calculateScore(items, state, pricing), [items, state, pricing]);

  if (items.length === 0) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
      score.grade.startsWith("A") ? "bg-emerald-100 text-emerald-700" :
      score.grade.startsWith("B") ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
    }`}>
      <Star className="w-3 h-3" />
      <span>Score: {score.grade}</span>
    </div>
  );
}

// Export score calculation for other components
export { calculateScore };
