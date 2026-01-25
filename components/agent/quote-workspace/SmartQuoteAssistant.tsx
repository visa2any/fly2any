"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Plus, AlertTriangle, TrendingUp, MapPin, Car, Building2, Compass, Bus, Sparkles, X, BrainCircuit } from "lucide-react";
import { useQuoteWorkspace, useQuoteItems } from "./QuoteWorkspaceProvider";
import { useDebounce } from "use-debounce";
import type { QuoteItem, ProductType } from "./types/quote-workspace.types";

// ═══════════════════════════════════════════════════════════════════════════════
// SMART QUOTE ASSISTANT - AI-POWERED (Level 7)
// Uses LLM analysis to provide context-aware suggestions and insights
import { useQuoteAnalysis } from "./hooks/useQuoteAnalysis";

// Icon mapper for AI suggestions
const getIconForType = (type: string) => {
  switch (type) {
    case "missing": return AlertTriangle;
    case "warning": return AlertTriangle;
    case "upsell": return TrendingUp;
    case "experience": return Compass;
    default: return Lightbulb;
  }
};

export default function SmartQuoteAssistant() {
  const { setActiveTab } = useQuoteWorkspace();
  const { analysis, isLoading } = useQuoteAnalysis();

  if (!analysis && !isLoading) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <BrainCircuit className={`w-3.5 h-3.5 ${isLoading ? "text-amber-500 animate-pulse" : "text-amber-500"}`} />
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            {isLoading ? "Analyzing..." : "Smart Assistant"}
          </span>
        </div>
        {analysis && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            analysis.score >= 80 ? "bg-green-100 text-green-700" :
            analysis.score >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
          }`}>
            Score: {analysis.score}
          </span>
        )}
      </div>

      {/* Summary */}
      {analysis?.summary && (
        <div className="p-3 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-xl text-xs text-violet-800">
          <div className="flex gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-violet-500" />
            <p>{analysis.summary}</p>
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {analysis?.suggestions?.map((s, i) => {
            const Icon = getIconForType(s.type);
            return (
              <motion.div
                key={s.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.05 }}
                className={`group relative p-2.5 rounded-xl border transition-all hover:shadow-md ${
                  s.priority === 1
                    ? "bg-amber-50/50 border-amber-200 hover:border-amber-300"
                    : s.type === "upsell"
                      ? "bg-emerald-50/50 border-emerald-100 hover:border-emerald-200"
                      : "bg-white border-gray-100 hover:border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                    s.priority === 1 ? "bg-amber-100 text-amber-600" : "bg-white border border-gray-100 text-blue-600"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800">{s.title}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{s.description}</p>
                    {s.action && (
                      <button
                        onClick={() => setActiveTab(s.action!.tab)}
                        className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        {s.action.label}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Compact inline version for tight spaces
export function SmartSuggestionBadge() {
  const { analysis } = useQuoteAnalysis();

  if (!analysis?.suggestions?.length) return null;

  const topSuggestion = analysis.suggestions.sort((a, b) => a.priority - b.priority)[0];
  const Icon = getIconForType(topSuggestion.type);

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border ${
      topSuggestion.priority === 1 
        ? "bg-amber-50 text-amber-700 border-amber-200" 
        : "bg-blue-50 text-blue-700 border-blue-200"
    }`}>
      <Icon className="w-3 h-3" />
      <span>{topSuggestion.title}</span>
    </div>
  );
}
