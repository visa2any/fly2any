"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X, ChevronRight, Plane, Building2, Car, Compass, Bus, Shield, Sparkles } from "lucide-react";
import type { BundleSuggestion, SuggestionPriority } from "./usePredictiveBundling";
import type { ProductType } from "../types/quote-workspace.types";

const PRODUCT_ICONS: Record<ProductType, typeof Plane> = {
  flight: Plane, hotel: Building2, car: Car,
  activity: Compass, tour: Compass, transfer: Bus,
  insurance: Shield, custom: Sparkles,
};

const PRIORITY_DOT: Record<SuggestionPriority, string> = {
  high: "bg-amber-400",
  medium: "bg-blue-400",
  low: "bg-gray-300",
};

interface BundleSuggestionCardProps {
  suggestion: BundleSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
  compact?: boolean; // kept for backwards compat, always compact now
}

// Single-row pill — minimal vertical footprint
export function BundleSuggestionCard({ suggestion, onAccept, onDismiss }: BundleSuggestionCardProps) {
  const Icon = PRODUCT_ICONS[suggestion.targetTab];
  const dot = PRIORITY_DOT[suggestion.priority];
  const label = suggestion.targetTab.charAt(0).toUpperCase() + suggestion.targetTab.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-lg border border-amber-100 hover:border-amber-200 transition-colors group"
    >
      {/* Priority dot + icon */}
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      <Icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />

      {/* Text */}
      <span className="flex-1 min-w-0 text-[11px] text-gray-700 font-medium truncate">
        {suggestion.headline}
      </span>

      {/* Action */}
      <button
        onClick={onAccept}
        className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
      >
        {label}s <ChevronRight className="w-3 h-3" />
      </button>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-0.5 text-gray-300 hover:text-gray-500 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

// ─── Suggestions Panel ────────────────────────────────────────────────────────

interface SuggestionsPanelProps {
  suggestions: BundleSuggestion[];
  onAccept: (suggestion: BundleSuggestion) => void;
  onDismiss: (id: string) => void;
  isEnabled: boolean;
  onToggle: () => void;
  layout?: "vertical" | "horizontal";
}

export function SuggestionsPanel({ suggestions, onAccept, onDismiss, isEnabled, onToggle, layout = "vertical" }: SuggestionsPanelProps) {
  if (!isEnabled || suggestions.length === 0) return null;

  // Horizontal: one single scrollable row of chips
  if (layout === "horizontal") {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <Lightbulb className="w-3 h-3 text-amber-500 flex-shrink-0" />
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 min-w-0">
          {suggestions.map((s) => {
            const Icon = PRODUCT_ICONS[s.targetTab];
            const label = s.targetTab.charAt(0).toUpperCase() + s.targetTab.slice(1);
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1 pl-2 pr-1 py-1 bg-white border border-amber-200 rounded-full text-[10px] font-semibold text-gray-700 whitespace-nowrap flex-shrink-0 hover:border-amber-400 transition-colors"
              >
                <Icon className="w-3 h-3 text-amber-500" />
                <button onClick={() => onAccept(s)} className="hover:text-indigo-600 transition-colors">
                  {label}s
                </button>
                <button onClick={() => onDismiss(s.id)} className="ml-0.5 text-gray-300 hover:text-gray-500">
                  <X className="w-2.5 h-2.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
        <button onClick={onToggle} className="text-[10px] text-gray-400 hover:text-gray-600 flex-shrink-0 whitespace-nowrap">
          Hide
        </button>
      </div>
    );
  }

  // Vertical: compact pill list (pricing sidebar)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suggested</span>
          <span className="text-[10px] text-gray-400 font-medium">({suggestions.length})</span>
        </div>
        <button onClick={onToggle} className="text-[10px] text-gray-400 hover:text-gray-600">Hide</button>
      </div>
      <AnimatePresence mode="popLayout">
        {suggestions.map((s) => (
          <BundleSuggestionCard key={s.id} suggestion={s} onAccept={() => onAccept(s)} onDismiss={() => onDismiss(s.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Inline compact variant (backwards compat)
export function InlineSuggestions({ suggestions, onAccept, onDismiss }: Omit<SuggestionsPanelProps, "isEnabled" | "onToggle">) {
  if (suggestions.length === 0) return null;
  return (
    <div className="space-y-1">
      <AnimatePresence mode="popLayout">
        {suggestions.slice(0, 2).map((s) => (
          <BundleSuggestionCard
            key={s.id}
            suggestion={s}
            onAccept={() => onAccept(s)}
            onDismiss={() => onDismiss(s.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
