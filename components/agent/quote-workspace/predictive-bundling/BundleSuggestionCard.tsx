"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X, ChevronRight, Plane, Building2, Car, Compass, Bus, Shield, Sparkles } from "lucide-react";
import type { BundleSuggestion, SuggestionPriority } from "./usePredictiveBundling";
import type { ProductType } from "../types/quote-workspace.types";

// ═══════════════════════════════════════════════════════════════════════════════
// BUNDLE SUGGESTION CARD - Helpful, non-intrusive suggestions
// "A thoughtful assistant, not a salesperson"
// ═══════════════════════════════════════════════════════════════════════════════

const PRODUCT_ICONS: Record<ProductType, typeof Plane> = {
  flight: Plane,
  hotel: Building2,
  car: Car,
  activity: Compass,
  transfer: Bus,
  insurance: Shield,
  custom: Sparkles,
};

const PRIORITY_STYLES: Record<SuggestionPriority, { border: string; bg: string; accent: string }> = {
  high: { border: "border-amber-200", bg: "bg-amber-50/50", accent: "text-amber-600" },
  medium: { border: "border-blue-200", bg: "bg-blue-50/50", accent: "text-blue-600" },
  low: { border: "border-gray-200", bg: "bg-gray-50/50", accent: "text-gray-500" },
};

interface BundleSuggestionCardProps {
  suggestion: BundleSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
  compact?: boolean;
}

export function BundleSuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
  compact = false,
}: BundleSuggestionCardProps) {
  const Icon = PRODUCT_ICONS[suggestion.targetTab];
  const styles = PRIORITY_STYLES[suggestion.priority];

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${styles.border} ${styles.bg}`}
      >
        <Icon className={`w-4 h-4 ${styles.accent}`} />
        <span className="text-xs font-medium text-gray-700 flex-1 truncate">{suggestion.headline}</span>
        <button onClick={onAccept} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700">
          Add
        </button>
        <button onClick={onDismiss} className="p-0.5 hover:bg-gray-200 rounded">
          <X className="w-3 h-3 text-gray-400" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative overflow-hidden rounded-xl border-2 ${styles.border} ${styles.bg}`}
    >
      {/* Priority indicator */}
      {suggestion.priority === "high" && (
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className="absolute top-2 -right-4 w-20 text-center text-[8px] font-bold text-white bg-amber-500 rotate-45 py-0.5">
            Suggested
          </div>
        </div>
      )}

      <div className="p-3">
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <div className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center ${styles.accent}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-900">{suggestion.headline}</h4>
            <p className="text-[11px] text-gray-500">{suggestion.reason}</p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/80 rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Benefit */}
        <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 bg-white/60 rounded-lg">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] text-gray-600">{suggestion.benefit}</span>
        </div>

        {/* Action */}
        <motion.button
          onClick={onAccept}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
        >
          <span>Search {suggestion.targetTab.charAt(0).toUpperCase() + suggestion.targetTab.slice(1)}s</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUGGESTIONS PANEL - Container for multiple suggestions
// ═══════════════════════════════════════════════════════════════════════════════

interface SuggestionsPanelProps {
  suggestions: BundleSuggestion[];
  onAccept: (suggestion: BundleSuggestion) => void;
  onDismiss: (id: string) => void;
  isEnabled: boolean;
  onToggle: () => void;
}

export function SuggestionsPanel({
  suggestions,
  onAccept,
  onDismiss,
  isEnabled,
  onToggle,
}: SuggestionsPanelProps) {
  if (!isEnabled || suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
            Suggested for this trip
          </span>
        </div>
        <button
          onClick={onToggle}
          className="text-[10px] text-gray-400 hover:text-gray-600"
        >
          Hide suggestions
        </button>
      </div>

      {/* Cards */}
      <AnimatePresence mode="popLayout">
        {suggestions.map((suggestion) => (
          <BundleSuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={() => onAccept(suggestion)}
            onDismiss={() => onDismiss(suggestion.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Compact inline version for tight spaces
export function InlineSuggestions({
  suggestions,
  onAccept,
  onDismiss,
}: Omit<SuggestionsPanelProps, "isEnabled" | "onToggle">) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <AnimatePresence mode="popLayout">
        {suggestions.slice(0, 2).map((suggestion) => (
          <BundleSuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={() => onAccept(suggestion)}
            onDismiss={() => onDismiss(suggestion.id)}
            compact
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
